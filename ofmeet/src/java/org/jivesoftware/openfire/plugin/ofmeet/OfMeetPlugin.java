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

import org.apache.tomcat.InstanceManager;
import org.apache.tomcat.SimpleInstanceManager;
import org.dom4j.Element;
import org.eclipse.jetty.apache.jsp.JettyJasperInitializer;
import org.eclipse.jetty.plus.annotation.ContainerInitializer;
import org.eclipse.jetty.rewrite.handler.RewriteHandler;
import org.eclipse.jetty.rewrite.handler.RewriteRegexRule;
import org.eclipse.jetty.security.ConstraintMapping;
import org.eclipse.jetty.security.ConstraintSecurityHandler;
import org.eclipse.jetty.security.SecurityHandler;
import org.eclipse.jetty.security.authentication.BasicAuthenticator;
import org.eclipse.jetty.server.handler.ContextHandlerCollection;
import org.eclipse.jetty.server.handler.HandlerList;
import org.eclipse.jetty.util.security.Constraint;
import org.eclipse.jetty.webapp.WebAppContext;
import org.jitsi.impl.neomedia.rtcp.termination.strategies.BasicRTCPTerminationStrategy;
import org.jitsi.impl.neomedia.transform.srtp.SRTPCryptoContext;
import org.jitsi.videobridge.openfire.PluginImpl;
import org.jitsi.videobridge.HarvesterConfiguration;
import org.jitsi.videobridge.VideoChannel;
import org.jitsi.videobridge.Videobridge;
import org.jivesoftware.openfire.XMPPServer;
import org.jivesoftware.openfire.cluster.ClusterEventListener;
import org.jivesoftware.openfire.cluster.ClusterManager;
import org.jivesoftware.openfire.container.Plugin;
import org.jivesoftware.openfire.container.PluginManager;
import org.jivesoftware.openfire.event.SessionEventDispatcher;
import org.jivesoftware.openfire.event.SessionEventListener;
import org.jivesoftware.openfire.http.HttpBindManager;
import org.jivesoftware.openfire.net.SASLAuthentication;
import org.jivesoftware.openfire.plugin.ofmeet.jetty.OfMeetAzure;
import org.jivesoftware.openfire.plugin.ofmeet.jetty.OfMeetLoginService;
import org.jivesoftware.openfire.plugin.ofmeet.sasl.OfMeetSaslProvider;
import org.jivesoftware.openfire.plugin.ofmeet.sasl.OfMeetSaslServer;
import org.jivesoftware.openfire.session.ClientSession;
import org.jivesoftware.openfire.session.Session;
import org.jivesoftware.util.JiveGlobals;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.xmpp.packet.IQ;

import java.io.File;
import java.net.InetAddress;
import java.nio.charset.Charset;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.Security;
import java.util.*;

/**
 * Bundles various Jitsi components into one, standalone Openfire plugin.
 *
 * Changes from earlier version
 * - jitsi-plugin made standard. Extensions moved here:
 * -- Openfire properties to system settings (to configure jitsi)
 * -- autorecord should become jitsi videobridge feature: https://github.com/jitsi/jitsi-videobridge/issues/344
 * - jicofo moved from (modified) jitsiplugin and moved to this class
 */
public class OfMeetPlugin implements Plugin, SessionEventListener, ClusterEventListener  {

    private static final Logger Log = LoggerFactory.getLogger(OfMeetPlugin.class);

	private PluginManager manager;
	public File pluginDirectory;

    private OfMeetIQHandler ofmeetIQHandler;

	private final JitsiPluginWrapper jitsiPluginWrapper;
	private final JitsiJicofoWrapper jitsiJicofoWrapper;
    private final MeetingPlanner meetingPlanner;

	public OfMeetPlugin()
	{
		jitsiPluginWrapper = new JitsiPluginWrapper();
		jitsiJicofoWrapper = new JitsiJicofoWrapper();
        meetingPlanner = new MeetingPlanner();
	}

	public String getName()
	{
        return "ofmeet";
    }

    public String getDescription()
    {
        return "OfMeet Plugin";
    }

	public void initializePlugin(final PluginManager manager, final File pluginDirectory)
    {
		this.manager = manager;
		this.pluginDirectory = pluginDirectory;

		// Initialize all Jitsi software, which provided the video-conferencing functionality.
		try
		{
			populateJitsiSystemPropertiesWithJivePropertyValues();

			// The order is of importance, as the latter needs to work with the OSGI context defined by the former!
			jitsiPluginWrapper.initialize( manager, pluginDirectory );
			jitsiJicofoWrapper.initialize();
		}
		catch ( Exception ex )
		{
			Log.error( "An exception occurred while attempting to initialize the Jitsi components.", ex );
		}

		// Initialize our own additional functinality providers.
        try
        {
            meetingPlanner.initialize();
        }
        catch ( Exception ex )
        {
            Log.error( "An exception occurred while attempting to initialize the Meeting Planner.", ex );
        }

        try {
			ClusterManager.addListener(this);

			// Ensure the JSP engine is initialized correctly (in order to be able to cope with Tomcat/Jasper precompiled JSPs).

			final List<ContainerInitializer> initializers = new ArrayList<>();
			initializers.add(new ContainerInitializer(new JettyJasperInitializer(), null));

			Log.info("OfMeet Plugin - Initialize webservice");
            ContextHandlerCollection contexts = HttpBindManager.getInstance().getContexts();

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

			ofmeetIQHandler = new OfMeetIQHandler( getVideobridge() );
			XMPPServer.getInstance().getIQRouter().addHandler(ofmeetIQHandler);

        	SessionEventDispatcher.addListener(this);

		} catch (Exception e) {
			Log.error("Could NOT start open fire meetings", e);
		}

		Security.addProvider( new OfMeetSaslProvider() );
		SASLAuthentication.addSupportedMechanism( OfMeetSaslServer.MECHANISM_NAME );
    }

	public void destroyPlugin()
    {
        try
        {
            SASLAuthentication.removeSupportedMechanism( OfMeetSaslServer.MECHANISM_NAME );
            Security.removeProvider( OfMeetSaslProvider.NAME );
        }
        catch ( Exception ex )
        {
            Log.error( "An exception occurred while trying to remove support for the OfMeet-specific SASL support." );
        }

        try
        {
            meetingPlanner.destroy();
        }
        catch ( Exception ex )
        {
            Log.error( "An exception occurred while trying to destroy the Meeting Planner" );
        }

        try
        {
            SessionEventDispatcher.removeListener(this);
            XMPPServer.getInstance().getIQRouter().removeHandler(ofmeetIQHandler);
            ofmeetIQHandler = null;
        }
        catch ( Exception ex )
        {
            Log.error( "An exception occurred while trying to destroy the OFMeet IQ Handler." );
        }

        try
        {
            jitsiJicofoWrapper.destroy();
        }
        catch ( Exception ex )
        {
            Log.error( "An exception occurred while trying to destroy the Jitsi Jicofo wrapper." );
        }

        try
        {
            jitsiPluginWrapper.destroy();
        }
        catch ( Exception ex )
        {
            Log.error( "An exception occurred while trying to destroy the Jitsi Videobridge plugin wrapper." );
        }

        ClusterManager.removeListener(this);
        EmailListener.getInstance().stop();
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

        // MAX/MIN_PORT_DEFAULT_VALUE: Instead of 5000-6000 (jitsi's default) use something that does not clash with default XMPP port numbers.
        System.setProperty( PluginImpl.MIN_PORT_NUMBER_PROPERTY_NAME, JiveGlobals.getProperty( PluginImpl.MIN_PORT_NUMBER_PROPERTY_NAME, "50000" ) );
        System.setProperty( PluginImpl.MAX_PORT_NUMBER_PROPERTY_NAME, JiveGlobals.getProperty( PluginImpl.MAX_PORT_NUMBER_PROPERTY_NAME, "60000" ) );

		System.setProperty( "net.java.sip.communicator.SC_HOME_DIR_LOCATION",  pluginDirectory.getAbsolutePath() );
		System.setProperty( "net.java.sip.communicator.SC_HOME_DIR_NAME",      "." );
		System.setProperty( "net.java.sip.communicator.SC_CACHE_DIR_LOCATION", pluginDirectory.getAbsolutePath() );
		System.setProperty( "net.java.sip.communicator.SC_LOG_DIR_LOCATION",   pluginDirectory.getAbsolutePath() );

		System.setProperty( SRTPCryptoContext.CHECK_REPLAY_PNAME,                 JiveGlobals.getProperty( SRTPCryptoContext.CHECK_REPLAY_PNAME,     "false" ) );

		System.setProperty( Videobridge.ENABLE_MEDIA_RECORDING_PNAME,       	  JiveGlobals.getProperty( Videobridge.ENABLE_MEDIA_RECORDING_PNAME, "false" ) );
		System.setProperty( Videobridge.MEDIA_RECORDING_PATH_PNAME,               JiveGlobals.getProperty( Videobridge.MEDIA_RECORDING_PATH_PNAME,   pluginDirectory.getAbsolutePath() + File.separator + "recordings" ) );
		System.setProperty( Videobridge.MEDIA_RECORDING_TOKEN_PNAME,              JiveGlobals.getProperty( Videobridge.MEDIA_RECORDING_TOKEN_PNAME,  "secret" ) );

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
        try
        {
            jitsiPluginWrapper.destroy();
        }
        catch ( Exception ex )
        {
            Log.error( "An exception occurred while trying to destroy the Jitsi Plugin.", ex );
        }
	}

	@Override
	public void joinedCluster(byte[] arg0)
	{
	}

	@Override
	public void leftCluster()
	{
		Log.info("OfMeet Plugin - leftCluster");
        try
        {
            jitsiPluginWrapper.initialize( manager, pluginDirectory );
        }
        catch ( Exception ex )
        {
            Log.error( "An exception occurred while trying to initialize the Jitsi Plugin.", ex );
        }
	}

	@Override
	public void leftCluster(byte[] arg0)
	{
	}

	@Override
	public void markedAsSeniorClusterMember()
	{
		Log.info("OfMeet Plugin - markedAsSeniorClusterMember");
        try
        {
            jitsiPluginWrapper.initialize( manager, pluginDirectory );
        }
        catch ( Exception ex )
        {
            Log.error( "An exception occurred while trying to initialize the Jitsi Plugin.", ex );
        }
    }

    public Videobridge getVideobridge()
    {
        return this.jitsiPluginWrapper.getVideobridge();
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
}
