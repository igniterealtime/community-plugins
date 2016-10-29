/**
 * $RCSfile: ,v $
 * $Revision: $
 * $Date: $
 *
 * Copyright (C) 2004-2010 Jive Software. All rights reserved.
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


package org.jivesoftware.spark.plugin.ofmeet;

import java.awt.*;
import java.awt.event.*;
import javax.swing.*;
import java.util.*;
import java.io.*;
import java.net.*;

import org.jivesoftware.Spark;
import org.jivesoftware.spark.*;
import org.jivesoftware.spark.component.*;
import org.jivesoftware.spark.component.browser.*;
import org.jivesoftware.spark.plugin.*;
import org.jivesoftware.spark.ui.rooms.*;
import org.jivesoftware.spark.ui.*;
import org.jivesoftware.spark.util.*;
import org.jivesoftware.smack.*;
import org.jivesoftware.spark.util.log.*;

public class SparkMeetPlugin implements Plugin, ChatRoomListener
{
	private org.jivesoftware.spark.ChatManager chatManager;
	private ImageIcon ofmeetIcon;

	private String protocol = "https";
	private String server = null;
	private String port = "7443";
	private String url = null;

	private static File pluginsettings = new File(System.getProperty("user.home") + System.getProperty("file.separator") + "Spark" + System.getProperty("file.separator") + "ofmeet.properties");
	private Map<String, ChatRoomDecorator> decorators = new HashMap<String, ChatRoomDecorator>();



    public SparkMeetPlugin()
    {
		ClassLoader cl = getClass().getClassLoader();
		ofmeetIcon = new ImageIcon(cl.getResource("images/icon16.png"));
    }

    public void initialize()
    {
		SimpleFrameExample.checkNatives();

		chatManager = SparkManager.getChatManager();
		server = SparkManager.getSessionManager().getServerAddress();
		url = protocol + "://" + server + ":" + port + "/ofmeet/?";

    	Properties props = new Properties();

		if (pluginsettings.exists())
		{
			Log.warning("ofmeet-info: Properties-file does exist= " + pluginsettings.getPath());

			try {
				props.load(new FileInputStream(pluginsettings));

				if (props.getProperty("port") != null)
				{
					port = props.getProperty("port");
					Log.warning("ofmeet-info: ofmeet-port from properties-file is= " + port);
				}

				if (props.getProperty("protocol") != null)
				{
					protocol = props.getProperty("protocol");
					Log.warning("ofmeet-info: ofmeet-protocol from properties-file is= " + protocol);
				}

				if (props.getProperty("server") != null)
				{
					server = props.getProperty("server");
					Log.warning("ofmeet-info: ofmeet-server from properties-file is= " + server);
				}

				url = protocol + "://" + server + ":" + port + "/ofmeet/?";

			} catch (IOException ioe) {

				System.err.println(ioe);
				//TODO handle error better.
			}

		} else {

		  	Log.warning("ofmeet-Error: Properties-file does not exist= " + pluginsettings.getPath() + ", using default " + url);
		}

		chatManager.addChatRoomListener(this);
    }


    public void shutdown()
    {
        try
        {
            Log.warning("shutdown");
            if (BareBonesBrowserLaunch.browser != null) BareBonesBrowserLaunch.browser.closeBrowser();
			chatManager.removeChatRoomListener(this);
        }
        catch(Exception e)
        {
            Log.warning("shutdown ", e);
        }
    }

    public boolean canShutDown()
    {
        return true;
    }

    public void uninstall()
    {

    }


    public void chatRoomLeft(ChatRoom chatroom)
    {
    }

    public void chatRoomClosed(ChatRoom chatroom)
    {
		String roomId = chatroom.getRoomname();

		Log.warning("chatRoomClosed:  " + roomId);

		if (decorators.containsKey(roomId))
		{
			ChatRoomDecorator decorator = decorators.remove(roomId);
			decorator.finished();
			decorator = null;
		}
    }

    public void chatRoomActivated(ChatRoom chatroom)
    {
		String roomId = chatroom.getRoomname();

		Log.warning("chatRoomActivated:  " + roomId);
    }

    public void userHasJoined(ChatRoom room, String s)
    {
		String roomId = room.getRoomname();

		Log.warning("userHasJoined:  " + roomId + " " + s);
    }

    public void userHasLeft(ChatRoom room, String s)
    {
		String roomId = room.getRoomname();

		Log.warning("userHasLeft:  " + roomId + " " + s);
    }

    public void chatRoomOpened(final ChatRoom room)
    {
		String roomId = room.getRoomname();

		Log.warning("chatRoomOpened:  " + roomId);

		if (roomId.indexOf('/') == -1)
		{
			decorators.put(roomId, new ChatRoomDecorator(room, url, server, port));
		}
    }

}
