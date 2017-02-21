/**
 * $Revision $
 * $Date $
 *
 * Copyright (C) 2005-2010 Jive Software. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.jivesoftware.openfire.plugin.ofskype;

import java.sql.*;
import java.io.File;
import java.util.*;
import java.net.*;
import java.util.concurrent.*;

import org.apache.tomcat.InstanceManager;
import org.apache.tomcat.SimpleInstanceManager;

import org.jivesoftware.util.*;
import org.jivesoftware.openfire.container.Plugin;
import org.jivesoftware.openfire.container.PluginManager;
import org.jivesoftware.openfire.http.HttpBindManager;
import org.jivesoftware.openfire.cluster.ClusterEventListener;
import org.jivesoftware.openfire.cluster.ClusterManager;
import org.jivesoftware.openfire.XMPPServer;
import org.jivesoftware.openfire.SessionManager;
import org.jivesoftware.openfire.sip.sipaccount.*;
import org.jivesoftware.openfire.handler.IQHandler;
import org.jivesoftware.openfire.IQHandlerInfo;
import org.jivesoftware.database.DbConnectionManager;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.eclipse.jetty.apache.jsp.JettyJasperInitializer;
import org.eclipse.jetty.plus.annotation.ContainerInitializer;
import org.eclipse.jetty.server.handler.ContextHandlerCollection;
import org.eclipse.jetty.webapp.WebAppContext;

import org.xmpp.packet.*;
import org.dom4j.*;

import net.sf.json.*;

import org.ifsoft.skype.SkypeClient;
import org.ifsoft.sip.*;

import javax.sip.*;
import javax.sip.message.*;
import javax.sdp.SdpFactory;
import javax.sdp.SessionDescription;
import javax.sdp.MediaDescription;
import javax.sdp.Attribute;


public class OfSkypePlugin implements Plugin, ClusterEventListener, PropertyEventListener  {

    private static final Logger Log = LoggerFactory.getLogger(OfSkypePlugin.class);
    private XMPPServer server;
    private boolean sipPluginAvailable;
    private boolean freeswitchPluginAvailable;
    public static OfSkypePlugin self;
    private ExecutorService executor;
	public ConcurrentHashMap<String, SkypeClient> clients = new ConcurrentHashMap<String, SkypeClient>();
	public ConcurrentHashMap<String, CallSession> callSessions = new ConcurrentHashMap<String, CallSession>();
	public SipService sipService = null;
    private OfSkypeIQHandler ofskypeIQHandler = null;

    public String getName() {
        return "ofskype";
    }

    public String getDescription() {
        return "OfSkype Plugin";
    }

    public void initializePlugin(final PluginManager manager, final File pluginDirectory)
    {
		ContextHandlerCollection contexts = HttpBindManager.getInstance().getContexts();

		self = this;
		server = XMPPServer.getInstance();
		sipPluginAvailable = server.getPluginManager().getPlugin("sip") != null;
		freeswitchPluginAvailable = server.getPluginManager().getPlugin("ofswitch") != null;

		try {

			ClusterManager.addListener(this);
			PropertyEventDispatcher.addListener(this);

			Log.info("OfSkype Plugin - Initialize Webservice");

			// Ensure the JSP engine is initialized correctly (in order to be able to cope with Tomcat/Jasper precompiled JSPs).
			final List<ContainerInitializer> initializers2 = new ArrayList<>();
			initializers2.add(new ContainerInitializer(new JettyJasperInitializer(), null));

			WebAppContext context2 = new WebAppContext(contexts, pluginDirectory.getPath(), "/ofskype");
			context2.setClassLoader(this.getClass().getClassLoader());
			context2.setAttribute("org.eclipse.jetty.containerInitializers", initializers2);
			context2.setAttribute(InstanceManager.class.getName(), new SimpleInstanceManager());
			context2.setWelcomeFiles(new String[]{"index.html"});

			boolean skypeEnabled = JiveGlobals.getBooleanProperty("skype.enabled", true);

			if (skypeEnabled)
			{
				Log.info("OfSkype Plugin - Scanning for skype accounts");

				executor = Executors.newCachedThreadPool();

				executor.submit(new Callable<Boolean>()
				{
					public Boolean call() throws Exception
					{
						startSipService(pluginDirectory.getAbsolutePath());

						List<String> properties = JiveGlobals.getPropertyNames();

						for (String propertyName : properties)
						{
							if (propertyName.indexOf("skype.password.") == 0)
							{
								startClient(propertyName, JiveGlobals.getProperty(propertyName), null);
							}
						}

						return true;
					}
				});

				Log.info("OfSkype Plugin - Initialize IQ handler ");

				ofskypeIQHandler = new OfSkypeIQHandler();
				server.getIQRouter().addHandler(ofskypeIQHandler);
			}

		} catch (Exception e) {
			Log.error("Could NOT start openfire skype", e);
		}
    }

    public void destroyPlugin() {

        PropertyEventDispatcher.removeListener(this);

		server.getIQRouter().removeHandler(ofskypeIQHandler);
		ofskypeIQHandler = null;

        try {

			for (SkypeClient client : clients.values())
			{
				client.close();
			}

			for (CallSession callSession : callSessions.values())
			{
				callSession.sendBye();
				callSession.sendBye();
			}

			callSessions.clear();

			if (sipService != null) sipService.stop();

			executor.shutdown();
        } catch (Exception e) {

        }
    }

	public String getDomain()
	{
		return server.getServerInfo().getXMPPDomain();
	}

	public String getHostname()
	{
		return server.getServerInfo().getHostname();
	}

	public String getIpAddress()
	{
		String ourHostname = server.getServerInfo().getHostname();
		String ourIpAddress = ourHostname;

		try {
			ourIpAddress = InetAddress.getByName(ourHostname).getHostAddress();
		} catch (Exception e) {

		}

		return ourIpAddress;
	}

	private void startSipService(String pluginDirectoryPath)
	{
		Log.info("OfSkype Plugin - Starting SIP client service");
		Properties properties = new Properties();

		String logDir = pluginDirectoryPath + File.separator + ".." + File.separator + ".." + File.separator + "logs" + File.separator;
		String port = JiveGlobals.getProperty("skype.sip.port", "5030");
		String ipAddress = JiveGlobals.getProperty("skype.sip.hostname", getIpAddress());

		properties.setProperty("com.voxbone.kelpie.hostname", ipAddress);
		properties.setProperty("com.voxbone.kelpie.ip", ipAddress);
		properties.setProperty("com.voxbone.kelpie.sip_port", port);

		properties.setProperty("javax.sip.IP_ADDRESS", ipAddress);
		properties.setProperty("javax.sip.STACK_NAME", "Openfire Skype SIP");

		properties.setProperty("gov.nist.javax.sip.TRACE_LEVEL", "99");
		properties.setProperty("gov.nist.javax.sip.SERVER_LOG", logDir + "sip_server.log");
		properties.setProperty("gov.nist.javax.sip.DEBUG_LOG", logDir + "sip_debug.log");

		sipService = new SipService(properties);

		Log.info("OfSkype Plugin - Initialized SIP stack at " + ipAddress + ":" + port);
	}

	private String startClient(String propertyName, String propertyValue, JSONObject requestJSON)
	{
		String response = null;
		String presence = "Online";
		String note = "Ready";
		boolean contacts = false;
		boolean groups = false;

		if (requestJSON != null)
		{
			if (requestJSON.has("presence")) 	presence = requestJSON.getString("presence");
			if (requestJSON.has("note")) 		note = requestJSON.getString("note");
			if (requestJSON.has("contacts")) 	contacts = "true".equals(requestJSON.getString("contacts"));
			if (requestJSON.has("groups")) 		groups = "true".equals(requestJSON.getString("groups"));
		}

		int pos = propertyName.indexOf("skype.password.");

		if (pos == 0)
		{
			try {
				String username = propertyName.substring(pos + 15);

				Log.info("OfSkype Plugin - Starting skype account " + username);

				String password = propertyValue;
				String[] user = username.split("@");
				String domain = user[1];
				String userid = user[0];
				String userName = (user[0] + "_" + user[1]).replaceAll("\\.", "_");

				if (clients.containsKey(propertyName))
				{
					SkypeClient client = clients.remove(propertyName);

					if (client.registerProcessing != null)
					{
						client.registerProcessing.unregister();
					}
					client.close();
					client = null;
				}

				SkypeClient skypeClient = new SkypeClient(username, password, domain, username);
				skypeClient.setClientId(new JID(JID.escapeNode(userName) + "@" + server.getServerInfo().getXMPPDomain()));
				skypeClient.doLogin();
				skypeClient.makeMeAvailable(presence);
				skypeClient.setNote(note);
				skypeClient.getMyLinks();


				SipAccount sipAccount = SipAccountDAO.getAccountByUser(JID.escapeNode(username));

				if (sipAccount == null) sipAccount = SipAccountDAO.getAccountByUser(userName);

				if (sipAccount != null)
				{
					Log.info("OfSkype Plugin - Starting sip account " + sipAccount.getSipUsername());

					ProxyCredentials sip = new ProxyCredentials();
					sip.setName(skypeClient.myName);
					sip.setXmppUserName(sipAccount.getUsername());
					sip.setUserName(sipAccount.getSipUsername());
					sip.setAuthUserName(sipAccount.getAuthUsername());
					sip.setUserDisplay(skypeClient.myName);
					sip.setPassword(sipAccount.getPassword().toCharArray());
					sip.setHost(sipAccount.getServer());
					sip.setProxy(sipAccount.getOutboundproxy());
					sip.setRealm(sipAccount.getServer());

					skypeClient.myConferenceNumber = sipAccount.getVoiceMailNumber();
					skypeClient.registerProcessing = new RegisterProcessing(sipAccount.getServer(), sipAccount.getServer(), sip);
				}

				clients.put(propertyName, skypeClient);
			}
			catch (Exception e) {
				Log.error("OfSkype error handling profile " + propertyName + " = " + propertyValue, e);
				response = e.toString();
			}

		} else response = "skype.password. prefix missing";

		return response;
	}

//-------------------------------------------------------
//
//
//
//-------------------------------------------------------

	@Override
	public void joinedCluster()
	{
		Log.info("OfSkype Plugin - joinedCluster");
	}

	@Override
	public void joinedCluster(byte[] arg0)
	{


	}

	@Override
	public void leftCluster()
	{
		Log.info("OfSkype Plugin - leftCluster");
	}

	@Override
	public void leftCluster(byte[] arg0)
	{


	}

	@Override
	public void markedAsSeniorClusterMember()
	{
		Log.info("OfSkype Plugin - markedAsSeniorClusterMember");
	}

//-------------------------------------------------------
//
//
//
//-------------------------------------------------------

    public void propertySet(final String property, final Map params)
    {
		executor.submit(new Callable<Boolean>()
		{
			public Boolean call() throws Exception
			{
				if (property.indexOf("skype.password.") == 0)
				{
					startClient(property, (String)params.get("value"), null);
				}
				return true;
			}
		});
    }

    public void propertyDeleted(String property, Map<String, Object> params)
    {
		if (clients.containsKey(property))
		{
			SkypeClient client = clients.remove(property);
			client.close();
			client = null;
		}
    }

    public void xmlPropertySet(String property, Map<String, Object> params)
    {

    }

    public void xmlPropertyDeleted(String property, Map<String, Object> params)
    {

    }

//-------------------------------------------------------
//
//
//
//-------------------------------------------------------

	public void makeCall(String sipUrl, String sdp, JSONObject json)
	{
		Log.info("OfSkype Plugin - makeCall " + sipUrl + "\n" + sdp + "\n" + json);

		sdp = sdp.replace("RTP/AVP","RTP/SAVP");

		try {
			SessionDescription sd =  SdpFactory.getInstance().createSessionDescription(sdp);

			MediaDescription md = ((MediaDescription) sd.getMediaDescriptions(false).get(0));
			Vector<Attribute> attributes = (Vector<Attribute>) md.getAttributes(false);
			String ssrc = null;
			Vector<Attribute> deletes = new Vector<Attribute>();
			boolean rtcpMux = false;
			String[] ssrcs = null;

			try {

				for (Attribute attrib : attributes)
				{
					if (attrib.getName().equals("rtcp-mux")) rtcpMux = true;
				}

				for (Attribute attrib : attributes)
				{
					Log.info("makeCall attribute " + attrib.getName() + "=" + attrib.getValue());

					if (attrib.getName().equals("crypto"))
					{
						String crypto = attrib.getValue();
						attrib.setValue(crypto.substring(0, crypto.indexOf("|")));
						if (crypto.indexOf("1:1") > -1) deletes.add(attrib);
					}

					if (attrib.getName().equals("x-ssrc-range"))
					{
						ssrcs = attrib.getValue().split("-");
						deletes.add(attrib);
					}

					if (attrib.getName().equals("candidate"))
					{
						attrib.setValue(attrib.getValue().replace("UDP","udp").replace("TCP-PASS","tcp").replace("TCP-ACT","tcp") + " generation 0");
						//if (attrib.getValue().indexOf("typ host") > -1) deletes.add(attrib);
					}

					if (attrib.getName().equals("cryptoscale")) deletes.add(attrib);
					if (attrib.getName().equals("x-candidate-ipv6")) deletes.add(attrib);
					if (attrib.getName().equals("rtcp-fb")) deletes.add(attrib);
				}

				for (Attribute attrib : deletes)
				{
					attributes.remove(attrib);
				}

				if (ssrcs != null)
				{
					attributes.add(SdpFactory.getInstance().createAttribute("ssrc", ssrcs[0] + " cname:CYWnkHxGZPAENJW9"));
					attributes.add(SdpFactory.getInstance().createAttribute("ssrc", ssrcs[0] + " msid:YOGW0gxEFBdOm7AsbjxMDJwlLTKNkBId a0"));
					attributes.add(SdpFactory.getInstance().createAttribute("ssrc", ssrcs[0] + " mslabel:YOGW0gxEFBdOm7AsbjxMDJwlLTKNkBId"));
					attributes.add(SdpFactory.getInstance().createAttribute("ssrc", ssrcs[0] + " label:YOGW0gxEFBdOm7AsbjxMDJwlLTKNkBIda0"));
				}

				attributes.add(SdpFactory.getInstance().createAttribute("sendrecv", null));


			} catch (Exception ec) {
				Log.error("acceptWithAnswer error", ec);
			}


			String key = "skype.password." + sipUrl;

			if (clients.containsKey(key))
			{
				SkypeClient client = clients.get(key);
				String newSDP = sd.toString();

				Log.info("OfSkype Plugin - makeCall sendInvite " + client.myName);

				String callId = json.getJSONObject("_links").getJSONObject("conversation").getString("href");
				String sip = json.getJSONObject("_embedded").getJSONObject("from").getString("uri");
				ProxyCredentials sipAccount = client.registerProcessing.proxyCredentials;
				SipService.sipAccount = sipAccount;
				String from = "sip:" + sipAccount.getUserName() + "@" + sipAccount.getRealm();
				String to = "sip:" + client.myConferenceNumber + "@" + sipAccount.getRealm();

				CallSession callSession = new CallSession(newSDP, callId, from, to, client, json);

				callSessions.put(callId, callSession);
				SipService.callSessions.put(sipAccount.getUserName() + client.myConferenceNumber, callSession);

				SipService.sendInvite(callSession);

			} else Log.warn("OfSkype Plugin - makeCall - cant find client for " + key);

		} catch (Exception e) {
			Log.error("OfSkype Plugin - makeCall", e);
		}
	}
	//-------------------------------------------------------
	//
	//		custom IQ handler for JSON request/response
	//
	//-------------------------------------------------------

    public class OfSkypeIQHandler extends IQHandler
    {
        public OfSkypeIQHandler()
        {
			super("Openfire Skype IQ Handler");
		}

        @Override public IQ handleIQ(IQ iq)
        {
			IQ reply = IQ.createResultIQ(iq);

			try {
				Log.info("Openfire Skype handleIQ \n" + iq.toString());
				final Element element = iq.getChildElement();
				JID from = iq.getFrom();

				JSONObject requestJSON = new JSONObject(element.getText());
				String action = requestJSON.getString("action");

				Log.info("Openfire Skype handleIQ action " + action);

				if ("start_skype_user".equals(action)) startSkypeUser(iq.getFrom().getNode(), reply, requestJSON);
				if ("stop_skype_user".equals(action)) stopSkypeUser(iq.getFrom().getNode(), reply, requestJSON);

				return reply;

			} catch(Exception e) {
				Log.error("Openfire Skype handleIQ", e);
				reply.setError(new PacketError(PacketError.Condition.internal_server_error, PacketError.Type.modify, e.toString()));
				return reply;
			}
		}

        @Override public IQHandlerInfo getInfo()
        {
			return new IQHandlerInfo("request", "http://igniterealtime.org/protocol/ofskype");
		}

		private void startSkypeUser(String username, IQ reply, JSONObject requestJSON)
		{
			Element childElement = reply.setChildElement("response", "http://igniterealtime.org/protocol/ofskype");

			try {
				String password = requestJSON.getString("password");
				String sipuri = requestJSON.getString("sipuri");

				Log.info("Openfire Skype startSkypeUser " + sipuri);

				String property = "skype.password." + sipuri;
				String response = startClient(property, password, requestJSON);

				if (response != null)
				{
					reply.setError(new PacketError(PacketError.Condition.not_allowed, PacketError.Type.modify, "User " + username + " " + " " + response));
				}

			} catch (Exception e) {
				reply.setError(new PacketError(PacketError.Condition.not_allowed, PacketError.Type.modify, "User " + username + " " + " " + e));
			}
		}

		private void stopSkypeUser(String username, IQ reply, JSONObject requestJSON)
		{
			Element childElement = reply.setChildElement("response", "http://igniterealtime.org/protocol/ofskype");

			try {
				String sipuri = requestJSON.getString("sipuri");
				String property = "skype.password." + sipuri;

				Log.info("Openfire Skype stopSkypeUser " + sipuri);

				if (clients.containsKey(property))
				{
					SkypeClient client = clients.remove(property);
					client.close();
					client = null;

				} else {
					reply.setError(new PacketError(PacketError.Condition.not_allowed, PacketError.Type.modify, "User " + username + " skype session not found"));
				}

			} catch (Exception e1) {
				reply.setError(new PacketError(PacketError.Condition.not_allowed, PacketError.Type.modify, requestJSON.toString() + " " + e1));
			}
		}

		private String removeNull(String s)
		{
			if (s == null)
			{
				return "";
			}

			return s.trim();
		}
	}

	//-------------------------------------------------------
	//
	//
	//
	//-------------------------------------------------------
}
