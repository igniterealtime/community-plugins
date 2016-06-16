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

public class OfSkypePlugin implements Plugin, ClusterEventListener, PropertyEventListener  {

    private static final Logger Log = LoggerFactory.getLogger(OfSkypePlugin.class);
    private XMPPServer server;
    public static OfSkypePlugin self;
    private ExecutorService executor;


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
				executor = Executors.newCachedThreadPool();

				executor.submit(new Callable<Boolean>()
				{
					public Boolean call() throws Exception
					{
						List<String> properties = JiveGlobals.getPropertyNames();

						for (String propertyName : properties)
						{
							String propertyValue = JiveGlobals.getProperty(propertyName);

							if (propertyName.indexOf("skype.profile.") == 0)
							{
								try {
									JSONObject json = new JSONObject(propertyValue);

									if (json != null)
									{
										String username = json.getString("username");
										String password = json.getString("password");
										String domain = username.split("@")[1];

										SkypeClient skypeClient = new SkypeClient(username, password, domain, username);
										skypeClient.doLogin();
										skypeClient.makeMeAvailable("Online");
										skypeClient.setNote("WireLynk Ready");
										skypeClient.getMyLinks();
									}
								}
								catch (Exception e) {
									Log.error("OfSkype error handling profile " + propertyName + " = " + propertyValue, e);
								}
							}
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
        	ClusterManager.removeListener(this);

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

    public void propertySet(String property, Map params)
    {

    }

    public void propertyDeleted(String property, Map<String, Object> params)
    {

    }

    public void xmlPropertySet(String property, Map<String, Object> params)
    {

    }

    public void xmlPropertyDeleted(String property, Map<String, Object> params)
    {

    }
}
