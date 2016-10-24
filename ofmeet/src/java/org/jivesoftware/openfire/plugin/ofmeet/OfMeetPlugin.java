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

package org.jivesoftware.openfire.plugin.ofmeet;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import org.apache.tomcat.InstanceManager;
import org.apache.tomcat.SimpleInstanceManager;
import org.dom4j.Element;
import org.eclipse.jetty.apache.jsp.JettyJasperInitializer;
import org.eclipse.jetty.plus.annotation.ContainerInitializer;
import org.eclipse.jetty.security.ConstraintMapping;
import org.eclipse.jetty.security.ConstraintSecurityHandler;
import org.eclipse.jetty.security.SecurityHandler;
import org.eclipse.jetty.security.authentication.BasicAuthenticator;
import org.eclipse.jetty.server.handler.ContextHandlerCollection;
import org.eclipse.jetty.util.security.Constraint;
import org.eclipse.jetty.webapp.WebAppContext;
import org.jitsi.impl.neomedia.rtcp.termination.strategies.BasicRTCPTerminationStrategy;
import org.jitsi.impl.neomedia.transform.srtp.SRTPCryptoContext;
import org.jitsi.jicofo.FocusManager;
import org.jitsi.jicofo.xmpp.FocusComponent;
import org.jitsi.videobridge.Conference;
import org.jitsi.videobridge.HarvesterConfiguration;
import org.jitsi.videobridge.VideoChannel;
import org.jitsi.videobridge.Videobridge;
import org.jitsi.videobridge.openfire.PluginImpl;
import org.jivesoftware.openfire.IQHandlerInfo;
import org.jivesoftware.openfire.XMPPServer;
import org.jivesoftware.openfire.cluster.ClusterEventListener;
import org.jivesoftware.openfire.cluster.ClusterManager;
import org.jivesoftware.openfire.container.Plugin;
import org.jivesoftware.openfire.container.PluginManager;
import org.jivesoftware.openfire.event.SessionEventDispatcher;
import org.jivesoftware.openfire.event.SessionEventListener;
import org.jivesoftware.openfire.group.Group;
import org.jivesoftware.openfire.group.GroupManager;
import org.jivesoftware.openfire.group.GroupNotFoundException;
import org.jivesoftware.openfire.handler.IQHandler;
import org.jivesoftware.openfire.http.HttpBindManager;
import org.jivesoftware.openfire.net.SASLAuthentication;
import org.jivesoftware.openfire.plugin.ofmeet.jetty.OfMeetAzure;
import org.jivesoftware.openfire.plugin.ofmeet.jetty.OfMeetLoginService;
import org.jivesoftware.openfire.plugin.ofmeet.sasl.OfMeetSaslProvider;
import org.jivesoftware.openfire.plugin.ofmeet.sasl.OfMeetSaslServer;
import org.jivesoftware.openfire.plugin.spark.Bookmark;
import org.jivesoftware.openfire.plugin.spark.BookmarkManager;
import org.jivesoftware.openfire.roster.RosterManager;
import org.jivesoftware.openfire.security.SecurityAuditManager;
import org.jivesoftware.openfire.session.ClientSession;
import org.jivesoftware.openfire.session.Session;
import org.jivesoftware.openfire.user.User;
import org.jivesoftware.openfire.user.UserManager;
import org.jivesoftware.openfire.user.UserNotFoundException;
import org.jivesoftware.util.EmailService;
import org.jivesoftware.util.JiveGlobals;
import org.jivesoftware.util.TaskEngine;
import org.quartz.*;
import org.quartz.impl.StdSchedulerFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.xmpp.component.ComponentManager;
import org.xmpp.component.ComponentManagerFactory;
import org.xmpp.packet.IQ;
import org.xmpp.packet.JID;
import org.xmpp.packet.PacketError;

import java.io.File;
import java.net.InetAddress;
import java.nio.charset.Charset;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.Security;
import java.util.*;
import java.util.regex.Pattern;

import static org.quartz.CronScheduleBuilder.cronSchedule;
import static org.quartz.JobBuilder.newJob;
import static org.quartz.TriggerBuilder.newTrigger;

/**
 * Bundles various Jitsi components into one, standalone Openfire plugin.
 *
 * Changes from earlier version
 * - jitsi-plugin made standard. Extensions moved here:
 * -- Openfire properties to system settings (to configure jitsi)
 * -- autorecord should become jitsi videobridge feature: https://github.com/jitsi/jitsi-videobridge/issues/344
 * - jicofo moved from (modified) jitsiplugin and moved to this class
 *
 * Not done (yet?)
 * - MAX/MIN_PORT_DEFAULT_VALUE: older OFMeet moved the range from 5000-6000 (jitsi's default) to 50000-60000.
 * - BundleActivator jitsiActivator: removed / no longer needed?
 */
public class OfMeetPlugin implements Plugin, SessionEventListener, ClusterEventListener, Job  {

    private static final Logger Log = LoggerFactory.getLogger(OfMeetPlugin.class);
	private PluginImpl jitsiPlugin;
	private PluginManager manager;
	public File pluginDirectory;
    private TaskEngine taskEngine = TaskEngine.getInstance();
    private UserManager userManager = XMPPServer.getInstance().getUserManager();
    private ComponentManager componentManager;
    private OfMeetIQHandler ofmeetIQHandler = null;

    public Scheduler scheduler = null;

    public static OfMeetPlugin self;

	public String sipRegisterStatus = "";

    public String getName() {
        return "ofmeet";
    }

	public OfMeetPlugin()
	{

	}

    public String getDescription()
    {
        return "OfMeet Plugin";
    }

	public PluginImpl getPlugin()
	{
		return jitsiPlugin;
	}


	private String jicofoSubdomain;
	private FocusComponent jicofoComponent;

	public void initializePlugin(final PluginManager manager, final File pluginDirectory)
    {

		componentManager = ComponentManagerFactory.getComponentManager();
		ContextHandlerCollection contexts = HttpBindManager.getInstance().getContexts();

		this.manager = manager;
		this.pluginDirectory = pluginDirectory;

		populateJitsiSystemPropertiesWithJivePropertyValues();
		self = this;

		try {

			try {
				Log.info("OfMeet Plugin - Initialize jitsi videobridge ");

				jitsiPlugin = new PluginImpl();
				jitsiPlugin.initializePlugin(manager, pluginDirectory);
			}
			catch (Exception e1) {
				Log.error("Could NOT Initialize jitsi videobridge", e1);
			}

			try {
				Log.info("OfMeet Plugin - Initialize jicofo component" );

				Log.info("initializePlugin set jicofo properties...");

				final String focusUserName = JiveGlobals.getProperty("org.jitsi.videobridge.ofmeet.focus.user.jid", "focus@btg199251");
				final String focusPassword = JiveGlobals.getProperty("org.jitsi.videobridge.ofmeet.focus.user.password", "focus-password-" + System.currentTimeMillis());

				System.setProperty( FocusManager.HOSTNAME_PNAME, XMPPServer.getInstance().getServerInfo().getHostname() );
				System.setProperty( FocusManager.XMPP_DOMAIN_PNAME, XMPPServer.getInstance().getServerInfo().getXMPPDomain() );
				System.setProperty( FocusManager.FOCUS_USER_DOMAIN_PNAME, XMPPServer.getInstance().getServerInfo().getXMPPDomain() );
				System.setProperty( FocusManager.FOCUS_USER_NAME_PNAME, focusUserName.split("@")[0]);
				System.setProperty( FocusManager.FOCUS_USER_PASSWORD_PNAME, focusPassword);

				jicofoSubdomain = "focus";
				boolean focusAnonymous = "false".equals(JiveGlobals.getProperty("ofmeet.security.enabled", "true"));
				jicofoComponent = new FocusComponent( XMPPServer.getInstance().getServerInfo().getHostname(), 0, XMPPServer.getInstance().getServerInfo().getXMPPDomain(), jicofoSubdomain, null, focusAnonymous, focusUserName);
				componentManager.addComponent(jicofoSubdomain, jicofoComponent);
				jicofoComponent.init();
			}
			catch (Exception e1) {
				Log.error("Could NOT Initialize jicofo component", e1);
				jicofoComponent = null;
				jicofoSubdomain = null;
			}

			try {

				boolean bookmarks = XMPPServer.getInstance().getPluginManager().getPlugin("bookmarks") != null;

				if (bookmarks)
				{
					new Timer().scheduleAtFixedRate(new TimerTask()
					{
						@Override public void run()
						{
							processMeetingPlanner();
						}

					}, 0,  900000);
				}

			} catch (Exception e) {

				Log.error("Meeting Planner Executor error", e);
			}

			ClusterManager.addListener(this);

			// Ensure the JSP engine is initialized correctly (in order to be able to cope with Tomcat/Jasper precompiled JSPs).

			final List<ContainerInitializer> initializers = new ArrayList<>();
			initializers.add(new ContainerInitializer(new JettyJasperInitializer(), null));

			Log.info("OfMeet Plugin - Initialize webservice");

			WebAppContext context2 = new WebAppContext(contexts, pluginDirectory.getPath(), "/ofmeet");
			context2.setClassLoader(this.getClass().getClassLoader());

			// Ensure the JSP engine is initialized correctly (in order to be able to cope with Tomcat/Jasper precompiled JSPs).

			final List<ContainerInitializer> initializers2 = new ArrayList<>();
			initializers2.add(new ContainerInitializer(new JettyJasperInitializer(), null));
			context2.setAttribute("org.eclipse.jetty.containerInitializers", initializers2);
			context2.setAttribute(InstanceManager.class.getName(), new SimpleInstanceManager());

			context2.setWelcomeFiles(new String[]{"index.html"});

			String securityEnabled = JiveGlobals.getProperty("ofmeet.security.enabled", "true");

			if ("true".equals(securityEnabled))
			{
				Log.info("OfMeet Plugin - Initialize security");
				context2.setSecurityHandler(basicAuth("ofmeet"));
			}

			Log.info("OfMeet Plugin - Initialize email listener");

			checkDownloadFolder(pluginDirectory);
        	EmailListener.getInstance().start();

			Log.info("OfMeet Plugin - Initialize IQ handler ");

			ofmeetIQHandler = new OfMeetIQHandler();
			XMPPServer.getInstance().getIQRouter().addHandler(ofmeetIQHandler);

        	SessionEventDispatcher.addListener(this);

			Log.info("OfMeet Plugin - Initialize Quartz Scheduler");

			try {
				scheduler = StdSchedulerFactory.getDefaultScheduler();
				scheduler.start();

			} catch (SchedulerException se) {
				Log.error("Quartz Scheduler", se);
			}

		} catch (Exception e) {
			Log.error("Could NOT start open fire meetings", e);
		}

		Security.addProvider( new OfMeetSaslProvider() );
		SASLAuthentication.addSupportedMechanism( OfMeetSaslServer.MECHANISM_NAME );
    }

	public void destroyPlugin() {
        try {

        	SessionEventDispatcher.removeListener(this);

			XMPPServer.getInstance().getIQRouter().removeHandler(ofmeetIQHandler);
			ofmeetIQHandler = null;
			jitsiPlugin.destroyPlugin();

			ClusterManager.removeListener(this);

			EmailListener.getInstance().stop();

			SASLAuthentication.removeSupportedMechanism( OfMeetSaslServer.MECHANISM_NAME );
			Security.removeProvider( OfMeetSaslProvider.NAME );

			if (scheduler != null) scheduler.shutdown(true);

			// Unload the Jicofo component.
			componentManager.removeComponent(jicofoSubdomain);
			jicofoComponent.dispose();
			jicofoSubdomain = null;
			jicofoComponent = null;

		} catch (Exception e) {

        }
    }

	/**
	 * Jitsi takes most of its configuration through system properties. This method sets these
	 * properties, using values defined in JiveGlobals.
	 */
	public void populateJitsiSystemPropertiesWithJivePropertyValues()
	{
		String ourIpAddress;
		try
		{
			ourIpAddress = InetAddress.getByName( XMPPServer.getInstance().getServerInfo().getHostname() ).getHostAddress();
		}
		catch ( Exception e )
		{
			ourIpAddress = "127.0.0.1";
		}

		System.setProperty( "net.java.sip.communicator.SC_HOME_DIR_LOCATION",  pluginDirectory.getAbsolutePath() );
		System.setProperty( "net.java.sip.communicator.SC_HOME_DIR_NAME",      "." );
		System.setProperty( "net.java.sip.communicator.SC_CACHE_DIR_LOCATION", pluginDirectory.getAbsolutePath() );
		System.setProperty( "net.java.sip.communicator.SC_LOG_DIR_LOCATION",   pluginDirectory.getAbsolutePath() );

		System.setProperty( SRTPCryptoContext.CHECK_REPLAY_PNAME,                 JiveGlobals.getProperty( SRTPCryptoContext.CHECK_REPLAY_PNAME,                "false" ) );

		System.setProperty( Videobridge.ENABLE_MEDIA_RECORDING_PNAME,       	  JiveGlobals.getProperty( Videobridge.ENABLE_MEDIA_RECORDING_PNAME,          "false" ) );
		System.setProperty( Videobridge.MEDIA_RECORDING_PATH_PNAME,               JiveGlobals.getProperty( Videobridge.MEDIA_RECORDING_PATH_PNAME,        pluginDirectory.getAbsolutePath() + File.separator + "recordings" ) );
		System.setProperty( Videobridge.MEDIA_RECORDING_TOKEN_PNAME,              JiveGlobals.getProperty( Videobridge.MEDIA_RECORDING_TOKEN_PNAME,      "secret" ) );

		System.setProperty( HarvesterConfiguration.NAT_HARVESTER_LOCAL_ADDRESS,   JiveGlobals.getProperty( HarvesterConfiguration.NAT_HARVESTER_LOCAL_ADDRESS,  ourIpAddress ) );
		System.setProperty( HarvesterConfiguration.NAT_HARVESTER_PUBLIC_ADDRESS,  JiveGlobals.getProperty( HarvesterConfiguration.NAT_HARVESTER_PUBLIC_ADDRESS, ourIpAddress ) );

		System.setProperty( Videobridge.DEFAULT_OPTIONS_PROPERTY_NAME, "2" ); // allow videobridge access without focus
		System.setProperty( VideoChannel.RTCP_TERMINATION_STRATEGY_PNAME,  BasicRTCPTerminationStrategy.class.getCanonicalName() );
	}

	private static final SecurityHandler basicAuth(String realm) {

    	final OfMeetLoginService loginService = new OfMeetLoginService();
        loginService.setName(realm);

        final Constraint constraint = new Constraint();
        constraint.setName( Constraint.__BASIC_AUTH );
        constraint.setRoles( new String[] { "ofmeet" } );
        constraint.setAuthenticate( true );

        final ConstraintMapping constraintMapping = new ConstraintMapping();
        constraintMapping.setConstraint( constraint );
        constraintMapping.setPathSpec( "/*" );

        final ConstraintSecurityHandler securityHandler = new ConstraintSecurityHandler();
        securityHandler.setAuthenticator( new BasicAuthenticator() );
        securityHandler.setRealmName( realm );
        securityHandler.addConstraintMapping( constraintMapping );
        securityHandler.setLoginService( loginService );

        return securityHandler;
    }

    private void checkDownloadFolder(File pluginDirectory)
    {
		String ofmeetHome = JiveGlobals.getHomeDirectory() + File.separator + "resources" + File.separator + "spank" + File.separator + "ofmeet-cdn";

        try
        {
			File ofmeetFolderPath = new File(ofmeetHome);

            if(!ofmeetFolderPath.exists())
            {
                ofmeetFolderPath.mkdirs();

			}

			List<String> lines = Arrays.asList("Move on, nothing here....");
			Path file = Paths.get(ofmeetHome + File.separator + "index.html");
			Files.write(file, lines, Charset.forName("UTF-8"));

			File downloadHome = new File(ofmeetHome + File.separator + "download");

            if(!downloadHome.exists())
            {
                downloadHome.mkdirs();

			}

			lines = Arrays.asList("Move on, nothing here....");
			file = Paths.get(downloadHome + File.separator + "index.html");
			Files.write(file, lines, Charset.forName("UTF-8"));
        }
        catch (Exception e)
        {
            Log.error("checkDownloadFolder", e);
        }
	}

	//-------------------------------------------------------
	//
	//		clustering
	//
	//-------------------------------------------------------

	@Override
	public void joinedCluster()
	{
		Log.info("OfMeet Plugin - joinedCluster");
		jitsiPlugin.destroyPlugin();
	}

	@Override
	public void joinedCluster(byte[] arg0)
	{


	}

	@Override
	public void leftCluster()
	{
		Log.info("OfMeet Plugin - leftCluster");
		jitsiPlugin.initializePlugin(manager, pluginDirectory);
	}

	@Override
	public void leftCluster(byte[] arg0)
	{


	}

	@Override
	public void markedAsSeniorClusterMember()
	{
		Log.info("OfMeet Plugin - markedAsSeniorClusterMember");
		jitsiPlugin.initializePlugin(manager, pluginDirectory);
	}

	//-------------------------------------------------------
	//
	//		meeting planner
	//
	//-------------------------------------------------------

	public void processMeetingPlanner()
	{
		Log.debug("OfMeet Plugin - processMeetingPlanner");

		final Collection<Bookmark> bookmarks = BookmarkManager.getBookmarks();

		String hostname = XMPPServer.getInstance().getServerInfo().getHostname();

		for (Bookmark bookmark : bookmarks)
		{
			if (bookmark.getType() == Bookmark.Type.group_chat)
			{
				String url = bookmark.getProperty("url");

				if (url == null)
				{
					String id = bookmark.getBookmarkID() + "" + System.currentTimeMillis();
					String rootUrl = JiveGlobals.getProperty("ofmeet.root.url.secure", "https://" + hostname + ":" + JiveGlobals.getProperty("httpbind.port.secure", "7443"));
					url = rootUrl + "/ofmeet/?b=" + id;
					bookmark.setProperty("url", url);
				}
			}

			String json = bookmark.getProperty("calendar");

			if (json != null)
			{
				bookmark.setProperty("lock", "true");

				JSONArray calendar = new JSONArray(json);
				boolean done = false;

				for(int i = 0; i < calendar.length(); i++)
				{
					try {
						JSONObject meeting = calendar.getJSONObject(i);

						boolean processed = meeting.getBoolean("processed");
						long startLong = meeting.getLong("startTime");

						Date rightNow = new Date(System.currentTimeMillis());
						Date actionDate = new Date(startLong + 300000);
						Date warnDate = new Date(startLong - 960000);

						Log.debug("OfMeet Plugin - scanning meeting now " + rightNow + " action " + actionDate + " warn " + warnDate + "\n" + meeting );

						if(rightNow.after(warnDate) && rightNow.before(actionDate))
						{
							for (String user : bookmark.getUsers())
							{
								processMeeting(meeting, user, bookmark.getProperty("url"));
							}

							for (String groupName : bookmark.getGroups())
							{
								try {
									Group group = GroupManager.getInstance().getGroup(groupName);

									for (JID memberJID : group.getMembers())
									{
										processMeeting(meeting, memberJID.getNode(), bookmark.getProperty("url"));
									}

								} catch (GroupNotFoundException e) { }
							}

							meeting.put("processed", true);
							done = true;
						}
					} catch (Exception e) {
						Log.error("processMeetingPlanner", e);
					}
				}

				if (done)
				{
					json = calendar.toString();
					bookmark.setProperty("calendar", json);

					Log.debug("OfMeet Plugin - processed meeting\n" + json);
				}

				bookmark.setProperty("lock", "false");
			}
		}
	}

	public void processMeeting(JSONObject meeting, String username, String videourl)
	{
		Log.info("OfMeet Plugin - processMeeting " + username + " " + meeting);

	   	try {
			User user = userManager.getUser(username);
			Date start = new Date(meeting.getLong("startTime"));
			Date end = new Date(meeting.getLong("endTime"));
			String name = user.getName();
			String email = user.getEmail();
			String description = meeting.getString("description");
			String title = meeting.getString("title");
			String room = meeting.getString("room");
			//String videourl = "https://" + XMPPServer.getInstance().getServerInfo().getHostname() + ":" + JiveGlobals.getProperty("httpbind.port.secure", "7443") + "/ofmeet/?r=" + room;
			String audiourl = videourl + "&novideo=true";
			String template = JiveGlobals.getProperty("ofmeet.email.template", "Dear [name],\n\nYou have an online meeting from [start] to [end]\n\n[description]\n\nTo join, please click\n[videourl]\nFor audio only with no webcan, please click\n[audiourl]\n\nAdministrator - [domain]");

			HashMap variables = new HashMap<String, String>();

			if (email != null)
			{
				variables.put("name", name);
				variables.put("email", email);
				variables.put("start", start.toString());
				variables.put("end", end.toString());
				variables.put("description", description);
				variables.put("title", title);
				variables.put("room", room);
				variables.put("videourl", videourl);
				variables.put("audiourl", audiourl);
				variables.put("domain", XMPPServer.getInstance().getServerInfo().getXMPPDomain());

				sendEmail(name, email, title, replaceTokens(template, variables), null);
				SecurityAuditManager.getInstance().logEvent(user.getUsername(), "sent email - " + title, description);
			}
	   }
	   catch (Exception e) {
		   Log.error("processMeeting error", e);
	   }
	}

	public void sendEmail(String toName, String toAddress, String subject, String body, String htmlBody)
	{
	   try {
		   String fromAddress = "no_reply@" + JiveGlobals.getProperty("ofmeet.email.domain", XMPPServer.getInstance().getServerInfo().getXMPPDomain());
		   String fromName = JiveGlobals.getProperty("ofmeet.email.fromname", "Openfire Meetings");

		   Log.debug( "sendEmail " + toAddress + " " + subject + "\n " + body + "\n " + htmlBody);
		   EmailService.getInstance().sendMessage(toName, toAddress, fromName, fromAddress, subject, body, htmlBody);
	   }
	   catch (Exception e) {
		   Log.error(e.toString());
	   }

	}

	public String replaceTokens(String text, Map<String, String> replacements)
	{
		Pattern pattern = Pattern.compile("\\[(.+?)\\]");
		java.util.regex.Matcher matcher = pattern.matcher(text);
		StringBuffer buffer = new StringBuffer();

		while (matcher.find())
		{
			String replacement = replacements.get(matcher.group(1));

			if (replacement != null)
			{
				matcher.appendReplacement(buffer, "");
				buffer.append(replacement);
			}
		}
		matcher.appendTail(buffer);
		return buffer.toString();
	}

	//-------------------------------------------------------
	//
	//		session management
	//
	//-------------------------------------------------------

	public void anonymousSessionCreated(Session session)
	{
		Log.debug("OfMeet Plugin -  anonymousSessionCreated "+ session.getAddress().toString() + "\n" + ((ClientSession) session).getPresence().toXML());
	}

	public void anonymousSessionDestroyed(Session session)
	{
		Log.debug("OfMeet Plugin -  anonymousSessionDestroyed "+ session.getAddress().toString() + "\n" + ((ClientSession) session).getPresence().toXML());
	}

	public void resourceBound(Session session)
	{
		Log.debug("OfMeet Plugin -  resourceBound "+ session.getAddress().toString() + "\n" + ((ClientSession) session).getPresence().toXML());
	}

	public void sessionCreated(Session session)
	{
		Log.debug("OfMeet Plugin -  sessionCreated "+ session.getAddress().toString() + "\n" + ((ClientSession) session).getPresence().toXML());
	}

	public void sessionDestroyed(Session session)
	{
		Log.debug("OfMeet Plugin -  sessionDestroyed "+ session.getAddress().toString() + "\n" + ((ClientSession) session).getPresence().toXML());

		boolean skypeAvailable = XMPPServer.getInstance().getPluginManager().getPlugin("ofskype") != null;

		if (OfMeetAzure.skypeids.containsKey(session.getAddress().getNode()))
		{
			String sipuri = OfMeetAzure.skypeids.remove(session.getAddress().getNode());

			IQ iq = new IQ(IQ.Type.set);
			iq.setFrom(session.getAddress());
			iq.setTo(XMPPServer.getInstance().getServerInfo().getXMPPDomain());

			Element child = iq.setChildElement("request", "http://igniterealtime.org/protocol/ofskype");
			child.setText("{'action':'stop_skype_user', 'sipuri':'" + sipuri + "'}");
			XMPPServer.getInstance().getIQRouter().route(iq);

			Log.info("OfMeet Plugin - closing skype session " + sipuri);
		}
	}

	//-------------------------------------------------------
	//
	//		custom IQ handler for user and group properties JSON request/response
	//
	//-------------------------------------------------------

    public class OfMeetIQHandler extends IQHandler
    {
        public OfMeetIQHandler()
        {
			super("Openfire Meetings IQ Handler");
		}

        @Override public IQ handleIQ(IQ iq)
        {
			IQ reply = IQ.createResultIQ(iq);

			try {
				Log.info("Openfire Meetings handleIQ \n" + iq.toString());
				final Element element = iq.getChildElement();
				JID from = iq.getFrom();

				JSONObject requestJSON = new JSONObject(element.getText());
				String action = requestJSON.getString("action");

				if ("get_user_properties".equals(action)) getUserProperties(iq.getFrom().getNode(), reply, requestJSON);
				if ("set_user_properties".equals(action)) setUserProperties(iq.getFrom().getNode(), reply, requestJSON);
				if ("get_user_groups".equals(action)) getUserGroups(iq.getFrom().getNode(), reply, requestJSON);
				if ("get_group".equals(action)) getGroup(iq.getFrom().getNode(), reply, requestJSON);
				if ("get_conference_id".equals(action)) getConferenceId(iq.getFrom().getNode(), reply, requestJSON);

				return reply;

			} catch(Exception e) {
				Log.error("Openfire Meetings handleIQ", e);
				reply.setError(new PacketError(PacketError.Condition.internal_server_error, PacketError.Type.modify, e.toString()));
				return reply;
			}
		}

        @Override public IQHandlerInfo getInfo()
        {
			return new IQHandlerInfo("request", "http://igniterealtime.org/protocol/ofmeet");
		}

		private void getConferenceId(String defaultUsername, IQ reply, JSONObject requestJSON)
		{
			Element childElement = reply.setChildElement("response", "http://igniterealtime.org/protocol/ofmeet");

			try {
				String roomName = requestJSON.getString("room");

				Videobridge videobridge = jitsiPlugin.getComponent().getVideobridge();

				for (Conference conference : videobridge.getConferences())
				{
					String room = conference.getName();

					if (room != null && !"".equals(room) && roomName.equals(room))
					{
						if (JiveGlobals.getProperty("ofmeet.autorecord.enabled", "false").equals("true") && !conference.isRecording())
						{
							conference.setRecording(true);
						}

						JSONObject userJSON = new JSONObject();
						userJSON.put("room", roomName);
						userJSON.put("id", conference.getID());
						userJSON.put("lastActivityTime", String.valueOf(conference.getLastActivityTime()));
						userJSON.put("focus", conference.getFocus());
						userJSON.put("recording", conference.isRecording() ? "yes" : "no");
						userJSON.put("expired", conference.isExpired() ? "yes" : "no");

						childElement.setText(userJSON.toString());

						break;
					}
				}

			} catch (Exception e1) {
				reply.setError(new PacketError(PacketError.Condition.not_allowed, PacketError.Type.modify, requestJSON.toString() + " " + e1));
				return;
			}
		}

		private void setUserProperties(String username, IQ reply, JSONObject requestJSON)
		{
			Element childElement = reply.setChildElement("response", "http://igniterealtime.org/protocol/ofmeet");

			try {
				UserManager userManager = XMPPServer.getInstance().getUserManager();
				User user = userManager.getUser(username);

				if (requestJSON != null)
				{
					Iterator<?> keys = requestJSON.keys();

					while( keys.hasNext() )
					{
						String key = (String)keys.next();
						String value = requestJSON.getString(key);

						user.getProperties().put(key, value);
					}
				}

			} catch (Exception e) {
				reply.setError(new PacketError(PacketError.Condition.not_allowed, PacketError.Type.modify, "User " + username + " " + requestJSON.toString() + " " + e));
				return;
			}
		}

		private void getUserProperties(String defaultUsername, IQ reply, JSONObject requestJSON)
		{
			Element childElement = reply.setChildElement("response", "http://igniterealtime.org/protocol/ofmeet");

			try {
				String username = requestJSON.getString("username");

				if (username == null) username = defaultUsername;

				UserManager userManager = XMPPServer.getInstance().getUserManager();
				User user = userManager.getUser(username);

				JSONObject userJSON = new JSONObject();

				userJSON.put("username", JID.unescapeNode(user.getUsername()));
				userJSON.put("name", user.isNameVisible() ? removeNull(user.getName()) : "");
				userJSON.put("email", user.isEmailVisible() ? removeNull(user.getEmail()) : "");

				for(Map.Entry<String, String> props : user.getProperties().entrySet())
				{
					userJSON.put(props.getKey(), props.getValue());
				}

				childElement.setText(userJSON.toString());

			} catch (UserNotFoundException e) {
				reply.setError(new PacketError(PacketError.Condition.not_allowed, PacketError.Type.modify, "User not found"));
				return;

			} catch (Exception e1) {
				reply.setError(new PacketError(PacketError.Condition.not_allowed, PacketError.Type.modify, requestJSON.toString() + " " + e1));
				return;
			}
		}

		private void getUserGroups(String defaultUsername, IQ reply, JSONObject requestJSON)
		{
			Element childElement = reply.setChildElement("response", "http://igniterealtime.org/protocol/ofmeet");

			try {
				String username = requestJSON.getString("username");

				if (username == null) username = defaultUsername;

				UserManager userManager = XMPPServer.getInstance().getUserManager();
				User user = userManager.getUser(username);

				Collection<Group> groups = GroupManager.getInstance().getGroups(user);
				JSONArray groupsJSON = new JSONArray();
				int index = 0;

				for (Group group : groups)
				{
					groupsJSON.put(index++, getJsonFromGroupXml(group.getName()));
				}

				childElement.setText(groupsJSON.toString());

			} catch (UserNotFoundException e) {
				reply.setError(new PacketError(PacketError.Condition.not_allowed, PacketError.Type.modify, "User not found"));
				return;

			} catch (Exception e1) {
				reply.setError(new PacketError(PacketError.Condition.not_allowed, PacketError.Type.modify, requestJSON.toString() + " " + e1));
				return;
			}
		}

		private void getGroup(String defaultUsername, IQ reply, JSONObject requestJSON)
		{
			Element childElement = reply.setChildElement("response", "http://igniterealtime.org/protocol/ofmeet");

			try {
				JSONObject groupJSON = getJsonFromGroupXml(requestJSON.getString("groupname"));
				childElement.setText(groupJSON.toString());

			} catch (Exception e1) {
				reply.setError(new PacketError(PacketError.Condition.not_allowed, PacketError.Type.modify, requestJSON.toString() + " " + e1));
				return;
			}
		}

		private JSONObject getJsonFromGroupXml(String groupname)
		{
			JSONObject groupJSON = new JSONObject();

			try {
				Group group = GroupManager.getInstance().getGroup(groupname);

            	boolean isSharedGroup = RosterManager.isSharedGroup(group);
				Map<String, String> properties = group.getProperties();
            	String showInRoster = (isSharedGroup ? properties.get("sharedRoster.showInRoster") : "");

            	groupJSON.put("name", group.getName());
            	groupJSON.put("desc", group.getDescription());
            	groupJSON.put("count", group.getMembers().size() + group.getAdmins().size());
            	groupJSON.put("shared", String.valueOf(isSharedGroup));
            	groupJSON.put("display", (isSharedGroup ? properties.get("sharedRoster.displayName") : ""));
                groupJSON.put("specified_groups", String.valueOf("onlyGroup".equals(showInRoster) && properties.get("sharedRoster.groupList").trim().length() > 0));
				groupJSON.put("visibility", showInRoster);
				groupJSON.put("groups", (isSharedGroup ? properties.get("sharedRoster.groupList") : ""));

				for(Map.Entry<String, String> props : properties.entrySet())
				{
					groupJSON.put(props.getKey(), props.getValue());
				}

				JSONArray membersJSON = new JSONArray();
				JSONArray adminsJSON = new JSONArray();
				int i = 0;

				for (JID memberJID : group.getMembers())
				{
					JSONObject memberJSON = new JSONObject();
					memberJSON.put("jid", memberJID.toString());
					memberJSON.put("name", memberJID.getNode());
					membersJSON.put(i++, memberJSON);
				}

				groupJSON.put("members", membersJSON);
				i = 0;

				for (JID memberJID : group.getAdmins())
				{
					JSONObject adminJSON = new JSONObject();
					adminJSON.put("jid", memberJID.toString());
					adminJSON.put("name", memberJID.getNode());
					adminsJSON.put(i++, adminJSON);
				}
				groupJSON.put("admins", adminsJSON);

			} catch (Exception e) {
				Log.error("getJsonFromGroupXml", e);
			}

			return groupJSON;
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

    @Override public void execute(JobExecutionContext jobExecutionContext) throws JobExecutionException
    {
        Log.info( "Quartz Execute Job....");
        try {

        }
        catch (Throwable e) {
            Log.error("Failed to execute quartz job...", e);
        }
    }

    public void scheduleMeeting(String job, String group, String trigger, String schedule)
    {
        Log.info( "scheduleMeeting " + job + " " + group + " " + trigger + " " + schedule);
		//String schedule = JiveGlobals.getProperty("ofmeet.schedule", "0 0 0/12 * * ?");

		if (scheduler != null)
		{
			try {
				JobDetail jobDetail = newJob(OfMeetPlugin.class).withIdentity(job, group).build();
				CronTrigger conTrigger = newTrigger().withIdentity(trigger, group).withSchedule(cronSchedule(schedule)).build();
				scheduler.scheduleJob(jobDetail, conTrigger);
			}
			catch (Throwable e) {
				Log.error("Failed to execute quartz job...", e);
			}
		}
	}

    public void unScheduleMeeting(String job, String group)
    {
       	Log.info( "unScheduleMeeting " + job + " " + group);

		if (scheduler != null)
		{
			try {
				scheduler.deleteJob(JobKey.jobKey(job, group));			}
			catch (Throwable e) {
				Log.error("Failed to execute quartz job...", e);
			}
		}
	}
}
