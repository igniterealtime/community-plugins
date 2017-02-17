/**
 * $Revision: 1722 $
 * $Date: 2005-07-28 15:19:16 -0700 (Thu, 28 Jul 2005) $
 *
 * Copyright (C) 2005-2008 Jive Software. All rights reserved.
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

package org.jivesoftware.openfire.plugin.rest;

import java.io.IOException;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.security.Principal;

import javax.servlet.http.HttpServletRequest;

import org.eclipse.jetty.servlets.EventSource;
import org.eclipse.jetty.servlets.EventSourceServlet;
import org.jivesoftware.util.JiveGlobals;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.jivesoftware.openfire.plugin.ofmeet.TokenManager;

import org.jivesoftware.smack.*;
import org.jivesoftware.smackx.muc.*;
import org.jivesoftware.smackx.*;
import org.jivesoftware.smack.packet.*;
import org.jivesoftware.smack.filter.*;


public class RestEventSourceServlet extends EventSourceServlet
{
	private static final long serialVersionUID = 1L;
	private static final Logger Log = LoggerFactory.getLogger(RestEventSourceServlet.class);

	public static final ConcurrentHashMap<String, ArrayList<RestEventSource>> 	eventSources 	= new ConcurrentHashMap<String, ArrayList<RestEventSource>>();
	public static final ConcurrentHashMap<String, Map<String, MultiUserChat>> 	groupchats 		= new ConcurrentHashMap<String, Map<String, MultiUserChat>>();
	public static final ConcurrentHashMap<String, Map<String, Chat>> 			chats 			= new ConcurrentHashMap<String, Map<String, Chat>>();
	public static final ConcurrentHashMap<String, SmackConnection> 				connections 	= new ConcurrentHashMap<String, SmackConnection>();

	public static void emitDataAll(String event)
	{
		for (ArrayList<RestEventSource> arrayList : eventSources.values()) {
			for (RestEventSource res : arrayList) {
				res.emitData(event);
			}
		}
	}

	public static void emitEvent(String event, String target, String data)
	{
		try {
			for (RestEventSource res : eventSources.get(target)) {
				res.emitEvent(event, data);
			}
		} catch (Exception e) {}
	}

	public static void emitData(String target, String event)
	{
		try {
			for (RestEventSource res : eventSources.get(target)) {
				res.emitData(event);
			}
		} catch (Exception e) {}
	}

	public static boolean joinRoom(String source, String mGroupChatName, String mNickName)
	{
		Log.info("joinRoom " + source + " " + mGroupChatName + " " + mNickName);

		try {
			MultiUserChat mMultiUserChat = groupchats.get(source).get(mGroupChatName);

			if (mMultiUserChat == null)
			{
				mMultiUserChat = new MultiUserChat(connections.get(source).getConnection(), mGroupChatName);
				groupchats.get(source).put(mGroupChatName, mMultiUserChat);
			}

			mMultiUserChat.join(mNickName);
			return true;

		} catch (Exception e) {
			Log.error("joinRoom", e);
			return false;
		}
	}

	public static boolean leaveRoom(String source, String mGroupChatName)
	{
		Log.info("leaveRoom " + source + " " + mGroupChatName);

		try {
			groupchats.get(source).get(mGroupChatName).leave();
			return true;

		} catch (Exception e) {
			Log.error("joinRoom", e);
			return false;
		}
	}

	public static boolean sendRoomMessage(String source, String mGroupChatName, String text)
	{
		Log.info("sendRoomMessage " + source + " " + mGroupChatName + "\n" + text);

		try {
			groupchats.get(source).get(mGroupChatName).sendMessage(text);
			return true;

		} catch (Exception e) {
			Log.error("joinRoom", e);
			return false;
		}
	}

	public static boolean sendXmppMessage(String source, String message)
	{
		Log.info("sendXmppMessage " + source + " " + "\n" + message);

		try {
			connections.get(source).getConnection().sendPacket(message);
			return true;

		} catch (Exception e) {
			Log.error("joinRoom", e);
			return false;
		}
	}

	public static boolean sendChatMessage(String source, String message, String to)
	{
		Log.info("sendChatMessage " + source + " " + to + "\n" + message);

		try {
			if (chats.containsKey(source) == false) chats.put(source, new HashMap<String, Chat>());

			Chat chat = chats.get(source).get(to);

			if (chat == null)
			{
				chat = connections.get(source).getConnection().getChatManager().createChat(to, null);
				chats.get(source).put(to, chat);
			}

			chat.sendMessage(message);
			return true;

		} catch (Exception e) {
			Log.error("joinRoom", e);
			return false;
		}
	}

	public static synchronized void setConnection(Principal principal, SmackConnection connection)
	{
		String source = principal.toString();

		if (connections.containsKey(source) == false)
		{
			connections.put(source, connection);
			connection.init();
		}
	}

	@Override protected EventSource newEventSource(final HttpServletRequest req)
	{
		Principal principal = req.getUserPrincipal();
		String source = principal.toString();		// get authenticated user
		RestEventSource eventSource = null;

		Log.info("newEventSource " + source);

		if (source != null)
		{
			RestEventSourceServlet.setConnection(principal, new SmackConnection(principal));

			if (eventSources.containsKey(source))
			{
				if (eventSources.get(source).size() > JiveGlobals.getIntProperty("chatapi.eventsource.amount", 5)) {
					eventSources.get(source).remove(0);
				}
				eventSource = new RestEventSource(source);
				eventSources.get(source).add(eventSource);

			} else {
				ArrayList<RestEventSource> arrayList = new ArrayList<RestEventSource>();
				eventSource = new RestEventSource(source);
				arrayList.add(eventSource);
				eventSources.put(source, arrayList);

			}
		}
		return eventSource;
	}

	public class SmackConnection implements MessageListener, ChatManagerListener, PacketListener
	{
		private String source;
		private String token;
		private XMPPConnection connection;
		private ChatManager chatManager;

		public SmackConnection(Principal principal)
		{
			this.source = principal.toString();
			this.token = TokenManager.getInstance().retrieveToken(principal);
		}

		public void init()
		{
			Log.info("SmackConnection: init " + source + " " + token);

			try {
				ConnectionConfiguration config = new ConnectionConfiguration("localhost", 0);
				connection = new XMPPConnection(config);
				connection.connect();
				connection.login(source, token, source + "-" + System.currentTimeMillis());

				chatManager = connection.getChatManager();
				chatManager.addChatListener(this);

				PacketFilter filter = new MessageTypeFilter(Message.Type.groupchat);
				connection.addPacketListener(this, filter);

				groupchats.put(source, new HashMap<String, MultiUserChat>());

				Presence p = new Presence(Presence.Type.available);
				connection.sendPacket(p);

			} catch (Exception e) {
				Log.error("onOpen", e);
			}
		}

		public XMPPConnection getConnection()
		{
			return connection;
		}

		public void close() {
			Log.info("SmackConnection: close " + source + " " + token);

			if (connection != null)
			{
				chatManager.removeChatListener(this);
				connection.removePacketListener(this);
				connection.disconnect();
			}
		}

		public void processMessage(Chat chat, Message message)
		{
			Log.info("Received chat message: " + message.getBody());

			if (message.getType() == Message.Type.chat)
			{
				RestEventSourceServlet.emitData(source, "{\"type\": \"" + message.getType() + "\", \"to\":\"" + message.getTo() + "\", \"from\":\"" + message.getFrom() + "\", \"body\": \"" + message.getBody() + "\"}");
			}
		}

		public void processPacket(Packet packet)
		{
			Message message = (Message) packet;

			Log.info("Received groupchat message: " + message.getBody());

			if (message.getType() == Message.Type.groupchat)
			{
				RestEventSourceServlet.emitData(source, "{\"type\": \"" + message.getType() + "\", \"to\":\"" + message.getTo() + "\", \"from\":\"" + message.getFrom() + "\", \"body\": \"" + message.getBody() + "\"}");
			}
		}

		public void chatCreated(final Chat chat, final boolean createdLocally)
		{
			Log.info("Chat created: " + chat.getParticipant());

			if (chats.containsKey(source) == false) chats.put(source, new HashMap<String, Chat>());
			if (chats.get(source).containsKey(chat.getParticipant()) == false) chats.get(source).put(chat.getParticipant(), chat);

			chat.addMessageListener(this);
		}
	}

	public class RestEventSource implements org.eclipse.jetty.servlets.EventSource
	{
		public Emitter emitter;
		public boolean isClosed = true;
		private String source;

		public RestEventSource(String source)
		{
			this.source = source;
		}

		public void onOpen(Emitter emitter) throws IOException
		{
			Log.info("RestEventSource: onOpen " + source);

			this.emitter = emitter;
			this.isClosed = false;
		}

		public void emitData(String event)
		{
			try {
				if (!isClosed) {
					Log.info("RestEventSource: emitData \n" + event);
					emitter.data(event);
				}

			} catch (Exception e) {
				Log.error("emitData", e);
			}
		}

		public void emitEvent(String event, String data)
		{
			try {
				if (!isClosed) {
					Log.info("RestEventSource: emitEvent " + event + "\n" + data);
					emitter.event(event, data);
				}

			} catch (Exception e) {
				Log.error("emitData", e);
			}
		}

		public void onClose()
		{
			Log.info("RestEventSource: onClose ");
			isClosed = true;

			boolean allClosed = true;

			for (RestEventSource res : eventSources.get(source))
			{
				if (!res.isClosed) allClosed = false;
			}

			if (allClosed)
			{
				if (connections.containsKey(source)) connections.remove(source).close();
			}
		}
	}
}
