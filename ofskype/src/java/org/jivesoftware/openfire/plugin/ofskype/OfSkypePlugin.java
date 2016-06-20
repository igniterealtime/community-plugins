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


public class OfSkypePlugin implements Plugin, ClusterEventListener, PropertyEventListener  {

    private static final Logger Log = LoggerFactory.getLogger(OfSkypePlugin.class);
    private XMPPServer server;
    private boolean sipPluginAvailable;
    private boolean freeswitchPluginAvailable;
    public static OfSkypePlugin self;
    private ExecutorService executor;
	public HashMap<String, SkypeClient> clients = new HashMap<String, SkypeClient>();
	public ConcurrentHashMap<String, CallSession> callSessions = new ConcurrentHashMap<String, CallSession>();
	public SipService sipService = null;

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
							startClient(propertyName, JiveGlobals.getProperty(propertyName));
						}

						return true;
					}
				});
			}

		} catch (Exception e) {
			Log.error("Could NOT start openfire skype", e);
		}
    }

    public void destroyPlugin() {

        PropertyEventDispatcher.removeListener(this);

        try {

			for (SkypeClient client : clients.values())
			{
				client.close();
			}

			for (CallSession callSession : callSessions.values())
			{
				callSession.mediaStream.stop();
				callSession.mediaStream.close();
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

	private void startClient(String propertyName, String propertyValue)
	{
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
				skypeClient.doLogin();
				skypeClient.makeMeAvailable("Online");
				skypeClient.setNote("Ready");
				skypeClient.getMyLinks();

				SipAccount sipAccount = SipAccountDAO.getAccountByUser(JID.escapeNode(username));

				if (sipAccount == null) sipAccount = SipAccountDAO.getAccountByUser(userid);

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
			}
		}
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
				startClient(property, (String)params.get("value"));

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

		String key = "skype.password." + sipUrl;

		if (clients.containsKey(key))
		{
			SkypeClient client = clients.get(property);
		}
	}

}
