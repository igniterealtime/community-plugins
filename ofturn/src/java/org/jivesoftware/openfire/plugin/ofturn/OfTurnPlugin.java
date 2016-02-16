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

package org.jivesoftware.openfire.plugin.ofturn;

import java.io.*;
import java.net.*;

import org.jivesoftware.util.*;
import org.jivesoftware.openfire.container.Plugin;
import org.jivesoftware.openfire.container.PluginManager;
import org.jivesoftware.openfire.cluster.ClusterEventListener;
import org.jivesoftware.openfire.cluster.ClusterManager;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.jitsi.turnserver.stack.*;
import org.ice4j.*;
import org.ice4j.socket.*;


public class OfTurnPlugin implements Plugin, ClusterEventListener  {

    private static final Logger Log = LoggerFactory.getLogger(OfTurnPlugin.class);
    public static OfTurnPlugin self;
    private TurnServer server = null;

    public String getName() {
        return "ofturn";
    }

    public String getDescription() {
        return "Openfire Turn Server";
    }

    public void initializePlugin(final PluginManager manager, final File pluginDirectory)
    {
		self = this;

		try {

			ClusterManager.addListener(this);

			Log.info("OfTurn Plugin - Initialize turn server ");

			TransportAddress localAddress = new TransportAddress(JiveGlobals.getProperty("ofturn.local.address.host", InetAddress.getLocalHost().getHostAddress()), Integer.valueOf(JiveGlobals.getProperty("ofturn.local.address.port", "3478")), Transport.UDP);
			server = new TurnServer(localAddress);
			server.start();


		} catch (Exception e) {
			Log.error("Could NOT start open fire meetings", e);
		}
    }

    public void destroyPlugin() {
        try {
        	ClusterManager.removeListener(this);

			if (server != null && server.isStarted())
			{
				server.shutDown();
			}

        } catch (Exception e) {

        }
    }

	@Override
	public void joinedCluster()
	{
		Log.info("OfTurn Plugin - joinedCluster");
	}

	@Override
	public void joinedCluster(byte[] arg0)
	{


	}

	@Override
	public void leftCluster()
	{
		Log.info("OfTurn Plugin - leftCluster");
	}

	@Override
	public void leftCluster(byte[] arg0)
	{


	}

	@Override
	public void markedAsSeniorClusterMember()
	{
		Log.info("OfTurn Plugin - markedAsSeniorClusterMember");
	}
}
