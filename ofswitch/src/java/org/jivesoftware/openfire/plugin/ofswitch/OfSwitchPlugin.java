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

package org.jivesoftware.openfire.plugin.ofswitch;

import java.io.File;
import java.util.*;
import java.util.concurrent.*;
import org.apache.tomcat.InstanceManager;
import org.apache.tomcat.SimpleInstanceManager;

import org.jivesoftware.util.*;
import org.jivesoftware.openfire.container.Plugin;
import org.jivesoftware.openfire.container.PluginManager;
import org.jivesoftware.openfire.http.HttpBindManager;
import org.jivesoftware.openfire.cluster.ClusterEventListener;
import org.jivesoftware.openfire.cluster.ClusterManager;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.eclipse.jetty.apache.jsp.JettyJasperInitializer;
import org.eclipse.jetty.plus.annotation.ContainerInitializer;
import org.eclipse.jetty.server.handler.ContextHandlerCollection;
import org.eclipse.jetty.webapp.WebAppContext;

import org.jitsi.util.OSUtils;

import org.freeswitch.esl.client.inbound.Client;
import org.freeswitch.esl.client.inbound.InboundConnectionFailure;
import org.freeswitch.esl.client.manager.*;
import org.freeswitch.esl.client.transport.message.EslMessage;
import org.freeswitch.esl.client.IEslEventListener;
import org.freeswitch.esl.client.transport.event.EslEvent;

import org.jboss.netty.channel.ExceptionEvent;


public class OfSwitchPlugin implements Plugin, ClusterEventListener, IEslEventListener, PropertyEventListener  {

    private static final Logger Log = LoggerFactory.getLogger(OfSwitchPlugin.class);
	private FreeSwitchThread freeSwitchThread;
    private ExecutorService executor;
    private String freeSwitchExePath = null;
    private String freeSwitchHomePath = null;
    private final String serviceName = "freeswitch";
	private static final ScheduledExecutorService connExec = Executors.newSingleThreadScheduledExecutor();
    private ManagerConnection managerConnection;
    private Client client;
    private ScheduledFuture<ConnectThread> connectTask;
    private volatile boolean subscribed = false;

    public static OfSwitchPlugin self;


    public String getName() {
        return "ofswitch";
    }

    public String getDescription() {
        return "OfSwitch Plugin";
    }

    public void initializePlugin(final PluginManager manager, final File pluginDirectory)
    {
		ContextHandlerCollection contexts = HttpBindManager.getInstance().getContexts();

		self = this;

		try {

			ClusterManager.addListener(this);
			PropertyEventDispatcher.addListener(this);

			Log.info("OfSwitch Plugin - Initialize Webservice");

			// Ensure the JSP engine is initialized correctly (in order to be able to cope with Tomcat/Jasper precompiled JSPs).
			final List<ContainerInitializer> initializers2 = new ArrayList<>();
			initializers2.add(new ContainerInitializer(new JettyJasperInitializer(), null));

			WebAppContext context2 = new WebAppContext(contexts, pluginDirectory.getPath(), "/ofswitch");
			context2.setClassLoader(this.getClass().getClassLoader());
			context2.setAttribute("org.eclipse.jetty.containerInitializers", initializers2);
			context2.setAttribute(InstanceManager.class.getName(), new SimpleInstanceManager());
			context2.setWelcomeFiles(new String[]{"index.html"});


			Log.info("OfSwitch Plugin - Initialize FreeSwitch");

			checkNatives(pluginDirectory);

			String freeswitchServer = JiveGlobals.getProperty("freeswitch.server.hostname", "127.0.0.1");
			String freeswitchPassword = JiveGlobals.getProperty("freeswitch.server.password", "Welcome123");

			if (freeSwitchExePath != null)
			{
				executor = Executors.newCachedThreadPool();

				executor.submit(new Callable<Boolean>()
				{
					public Boolean call() throws Exception {
						try {
							Log.info("FreeSwitch executable path " + freeSwitchExePath);

							freeSwitchThread = new FreeSwitchThread();
							freeSwitchThread.start(freeSwitchExePath + " ",  new File(freeSwitchHomePath));
						}

						catch (Exception e) {
							Log.error("FreeSwitch initializePluginn", e);
						}

						return true;
					}
				});

			} else {
				Log.info("FreeSwitch external server " + freeswitchServer);
			}

			managerConnection = new DefaultManagerConnection(freeswitchServer, freeswitchPassword);
			Client client = managerConnection.getESLClient();
			ConnectThread connector = new ConnectThread();
			connectTask = (ScheduledFuture<ConnectThread>) connExec.scheduleAtFixedRate(connector, 30, 5, TimeUnit.SECONDS);


		} catch (Exception e) {
			Log.error("Could NOT start openfire switch", e);
		}
    }

    public void destroyPlugin() {

        PropertyEventDispatcher.removeListener(this);

        try {
			if (freeSwitchThread != null)
			{
				freeSwitchThread.stop();
			}

			if (executor != null)
			{
				executor.shutdown();
			}

			if (connectTask != null)
			{
				connectTask.cancel(true);
			}

        	ClusterManager.removeListener(this);

        } catch (Exception e) {

        }
    }


//-------------------------------------------------------
//
//
//
//-------------------------------------------------------

	private class ConnectThread implements Runnable
	{
		public void run()
		{
			try {
				client = managerConnection.getESLClient();
				if (! client.canSend()) {
					Log.info("Attempting to connect to FreeSWITCH ESL");
					subscribed = false;
					managerConnection.connect();
				} else {
					if (!subscribed) {
						Log.info("Subscribing for ESL events.");
						client.cancelEventSubscriptions();
						client.addEventListener(self);
						client.setEventSubscriptions( "plain", "all" );
						client.addEventFilter( "Event-Name", "heartbeat" );
						client.addEventFilter( "Event-Name", "custom" );
						client.addEventFilter( "Event-Name", "background_job" );
						subscribed = true;
					}
				}
			} catch (InboundConnectionFailure e) {
				Log.error("Failed to connect to ESL", e);
			}
		}
	}

    private void checkNatives(File pluginDirectory)
    {
        try
        {
			String suffix = null;

			if(OSUtils.IS_LINUX32)
			{
				suffix = "linux-32";
			}
			else if(OSUtils.IS_LINUX64)
			{
				suffix = "linux-64";
			}
			else if(OSUtils.IS_WINDOWS32)
			{
				suffix = "win-32";
			}
			else if(OSUtils.IS_WINDOWS64)
			{
				suffix = "win-64";
			}
			else if(OSUtils.IS_MAC)
			{
				suffix = "osx-64";
			}

			if (suffix != null)
			{
				freeSwitchHomePath = pluginDirectory.getAbsolutePath() + File.separator + "native" + File.separator + suffix;

				try {
					freeSwitchExePath = freeSwitchHomePath + File.separator + "FreeSwitchConsole";
					File file = new File(freeSwitchExePath);
					file.setReadable(true, true);
					file.setWritable(true, true);
					file.setExecutable(true, true);

					Log.info("checkNatives freeSwitch executable path " + freeSwitchExePath);

				} catch (Exception e) {
					freeSwitchExePath = null;
				}

			} else {

				Log.error("checkNatives unknown OS " + pluginDirectory.getAbsolutePath());
			}
        }
        catch (Exception e)
        {
            Log.error(e.getMessage(), e);
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
		Log.info("OfSwitch Plugin - joinedCluster");
	}

	@Override
	public void joinedCluster(byte[] arg0)
	{


	}

	@Override
	public void leftCluster()
	{
		Log.info("OfSwitch Plugin - leftCluster");
	}

	@Override
	public void leftCluster(byte[] arg0)
	{


	}

	@Override
	public void markedAsSeniorClusterMember()
	{
		Log.info("OfSwitch Plugin - markedAsSeniorClusterMember");
	}

//-------------------------------------------------------
//
//
//
//-------------------------------------------------------

    public void propertySet(String property, Map params)
    {

    }

    public void propertyDeleted(String property, Map<String, Object> params)
    {

    }

    public void xmlPropertySet(String property, Map<String, Object> params) {

    }

    public void xmlPropertyDeleted(String property, Map<String, Object> params) {

    }

//-------------------------------------------------------
//
//
//
//-------------------------------------------------------


    @Override public void eventReceived( EslEvent event )
    {
		Log.info("eventReceived " + event.getEventName());
	}

    @Override public void conferenceEventJoin(String uniqueId, String confName, int confSize, EslEvent event)
    {
        Integer memberId = getMemberIdFromEvent(event);
        String callerId = getCallerIdFromEvent(event);
        String callerIdName = getCallerIdNameFromEvent(event);
        String uuid = getChannelCallUUIDFromEvent(event);
        int members = getConferenceSizeFromEvent(event);
        Map<String, String> headers = event.getEventHeaders();
        boolean muted = headers.get("Speak").equals("true") ? false : true;
        boolean speaking = headers.get("Talking").equals("true") ? true : false;
        EslMessage response;

		for (String key : headers.keySet())
		{
			String value = headers.get(key);
			Log.info("User joined voice conference, " + key + "=[" + value + "]");
		}

	}

    @Override public void conferenceEventLeave(String uniqueId, String confName, int confSize, EslEvent event)
    {
		Integer memberId = this.getMemberIdFromEvent(event);
        String callerId = getCallerIdFromEvent(event);
        String callerIdName = getCallerIdNameFromEvent(event);
        String uuid = getChannelCallUUIDFromEvent(event);
        int members = getConferenceSizeFromEvent(event);
        EslMessage response;

        Map<String, String> headers = event.getEventHeaders();

		for (String key : headers.keySet())
		{
			String value = headers.get(key);
			Log.info("User left voice conference, " + key + "=[" + value + "]");
		}
	}

    @Override public void conferenceEventMute(String uniqueId, String confName, int confSize, EslEvent event)
    {
        Integer memberId = this.getMemberIdFromEvent(event);
        Log.info("User muted voice conference, user=[" + memberId.toString() + "], conf=[" + confName + "]");
	}

    @Override public void conferenceEventUnMute(String uniqueId, String confName, int confSize, EslEvent event)
    {
        Integer memberId = this.getMemberIdFromEvent(event);
        Log.info("User unmuted voice conference, user=[" + memberId.toString() + "], conf=[" + confName + "]");
	}

    @Override public void conferenceEventAction(String uniqueId, String confName, int confSize, String action, EslEvent event)
    {
        Integer memberId = this.getMemberIdFromEvent(event);

        if (action == null) {
            return;
        }

        if (action.equals("start-talking"))
        {
         	Log.info("User started talking voice conference, user=[" + memberId.toString() + "], conf=[" + confName + "]");

        } else if (action.equals("stop-talking")) {

         	Log.info("User stopped talking voice conference, user=[" + memberId.toString() + "], conf=[" + confName + "]");

        } else {
         	Log.info("Unknown action " + action + ", user=[" + memberId.toString() + "], conf=[" + confName + "]");
        }
	}

    @Override public void conferenceEventTransfer(String uniqueId, String confName, int confSize, EslEvent event)
    {

	}

    @Override public void conferenceEventThreadRun(String uniqueId, String confName, int confSize, EslEvent event)
    {

	}

   	@Override public void conferenceEventRecord(String uniqueId, String confName, int confSize, EslEvent event)
   	{
    	String action = event.getEventHeaders().get("Action");
        Integer memberId = this.getMemberIdFromEvent(event);

        if (action == null) {
            return;
        }

        if (action.equals("start-recording"))
        {
         	Log.info("Recording started, conference, user=[" + memberId.toString() + "], conf=[" + confName + "]");

        } else if (action.equals("stop-recording")) {

         	Log.info("Recording stopped,conference, user=[" + memberId.toString() + "], conf=[" + confName + "]");

        } else {
         	Log.info("Unknown record action " + action + ", user=[" + memberId.toString() + "], conf=[" + confName + "]");
        }
	}

    @Override public void conferenceEventPlayFile(String uniqueId, String confName, int confSize, EslEvent event)
    {

	}

    @Override public void backgroundJobResultReceived( EslEvent event )
    {

	}

    @Override public void exceptionCaught(ExceptionEvent e)
    {
		Log.error("exceptionCaught", e);
	}

    private Integer getMemberIdFromEvent(EslEvent e) {
        return new Integer(e.getEventHeaders().get("Member-ID"));
    }

    private String getCallerIdFromEvent(EslEvent e) {
        return e.getEventHeaders().get("Caller-Caller-ID-Number");
    }

    private String getCallerIdNameFromEvent(EslEvent e) {
        return e.getEventHeaders().get("Caller-Caller-ID-Name");
    }

    private String getRecordFilenameFromEvent(EslEvent e) {
    	return e.getEventHeaders().get("Path");
    }

    private String getRecordTimestampFromEvent(EslEvent e) {
    	return e.getEventHeaders().get("Event-Date-Timestamp");
    }

    private String getChannelCallUUIDFromEvent(EslEvent e) {
    	return e.getEventHeaders().get("Caller-Unique-ID");
    }

    private int getConferenceSizeFromEvent(EslEvent e) {
        int members = -1;

		try {
			members = Integer.parseInt(e.getEventHeaders().get("Conference-Size"));
		} catch(Exception error) {}

		return members;
    }

    public String getSessionVar(String uuid, String var)
    {
		String value = null;

		if (client.canSend())
		{
			EslMessage response = client.sendSyncApiCommand("uuid_getvar", uuid + " " + var);

			if (response != null)
			{
				value = response.getBodyLines().get(0);
			}
		}

		return value;
	}

	public EslMessage sendFWCommand(String command)
	{
		Log.info("sendFWCommand " + command);

		EslMessage response = null;

		if (client != null)
		{
			response = client.sendSyncApiCommand(command, "");
		}

		return response;
	}

	public String getDeviceIP(String userId)
	{
		List<String> regLines = sendFWCommand("sofia status profile internal reg").getBodyLines();
		boolean foundUser = false;
		String ip = null;

		for (String line : regLines)
		{
			if (foundUser && line.startsWith("IP:"))
			{
				ip = line.substring(4).trim();
				break;
			}

			if (line.startsWith("User:") && line.indexOf(userId + "@") > -1) foundUser = true;
		}

		return ip;
	}

}
