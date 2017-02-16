/**
 * Copyright (C) 2008 Jive Software. All rights reserved.
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

package org.jivesoftware.openfire.archive;

import java.io.Externalizable;
import java.io.IOException;
import java.io.ObjectInput;
import java.io.ObjectOutput;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.jivesoftware.database.DbConnectionManager;
import org.jivesoftware.database.JiveID;
import org.jivesoftware.database.SequenceManager;
import org.jivesoftware.openfire.XMPPServer;
import org.jivesoftware.openfire.muc.MUCRole;
import org.jivesoftware.openfire.muc.MUCRoom;
import org.jivesoftware.openfire.user.UserNameManager;
import org.jivesoftware.openfire.user.UserNotFoundException;
import org.jivesoftware.util.JiveGlobals;
import org.jivesoftware.util.LocaleUtils;
import org.jivesoftware.util.NotFoundException;
import org.jivesoftware.util.StringUtils;
import org.jivesoftware.util.cache.ExternalizableUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.xmpp.packet.JID;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlElementWrapper;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;

/**
 * Represents an IM conversation between two people. A conversation encompasses a series of messages sent back and forth. It may cover a single topic
 * or several. The start of a conversation occurs when the first message between two users is sent. It ends when either:
 * <ul>
 * <li>No messages are sent between the users for a certain period of time (default of 10 minutes). The default value can be overridden by setting the
 * Openfire property <tt>conversation.idleTime</tt>.</li>
 * <li>The total conversation time reaches a maximum value (default of 60 minutes). The default value can be overridden by setting the Openfire
 * property <tt>conversation.maxTime</tt>. When the max time has been reached and additional messages are sent between the users, a new conversation
 * will simply be started.</li>
 * </ul>
 * <p/>
 * Each conversation has a start time, date of the last message, and count of the messages in the conversation. Conversations are specially marked if
 * one of the participants is on an external server. If archiving is enabled, the actual messages in the conversation can be retrieved.
 *
 * @author Matt Tucker
 */
@XmlRootElement(name = "conversation")
@XmlType(propOrder = { "conversationID", "external", "startDate", "lastActivity", "messageCount", "chatRoom", "participantList", "messages"})
@JiveID(50)
public class Conversation implements Externalizable {

	private static final Logger Log = LoggerFactory.getLogger(Conversation.class);

	private static final String INSERT_CONVERSATION = "INSERT INTO ofConversation(conversationID, room, isExternal, startDate, "
			+ "lastActivity, messageCount) VALUES (?,?,?,?,?,0)";
	private static final String INSERT_PARTICIPANT = "INSERT INTO ofConParticipant(conversationID, joinedDate, bareJID, jidResource, nickname) "
			+ "VALUES (?,?,?,?,?)";
	private static final String LOAD_CONVERSATION = "SELECT room, isExternal, startDate, lastActivity, messageCount "
			+ "FROM ofConversation WHERE conversationID=?";
	private static final String LOAD_PARTICIPANTS = "SELECT bareJID, jidResource, nickname, joinedDate, leftDate FROM ofConParticipant "
			+ "WHERE conversationID=? ORDER BY joinedDate";
	private static final String LOAD_MESSAGES = "SELECT fromJID, fromJIDResource, toJID, toJIDResource, sentDate, body FROM ofMessageArchive WHERE conversationID=? "
			+ "ORDER BY sentDate";

	private long conversationID = -1;
	private Map<String, UserParticipations> participants;
	private boolean external;
	private Date startDate;
	private Date lastActivity;
	private int messageCount;
	private JID room;
	private List<String> participantList;
	private List<ArchivedMessage> messages;
	private String chatRoom;

	/**
	 * Do not use this constructor. It only exists for serialization purposes.
	 */
	public Conversation() {
	}

	/**
	 * Loads a conversation from the database.
	 *
	 * @param conversationID
	 *            the ID of the conversation.
	 * @throws NotFoundException
	 *             if the conversation can't be loaded.
	 */
	public Conversation(long conversationID) throws NotFoundException {
		this.conversationID = conversationID;
		loadFromDb();
	}

	/**
	 * Returns the unique ID of the conversation. A unique ID is only meaningful when conversation archiving is enabled. Therefore, this method
	 * returns <tt>-1</tt> if archiving is not turned on.
	 *
	 * @return the unique ID of the conversation, or <tt>-1</tt> if conversation archiving is not enabled.
	 */
	@XmlElement
	public long getConversationID() {
		return conversationID;
	}

	/**
	 * Returns the JID of the room where the group conversation took place. If the conversation was a one-to-one chat then a <tt>null</tt> value is
	 * returned.
	 *
	 * @return the JID of room or null if this was a one-to-one chat.
	 */
	@XmlElement
	public String getChatRoom() {
		chatRoom = (room == null) ? null : room.toString();
		return chatRoom;
	}

	public JID getRoom() {
		return room;
	}


	@XmlElement
	public List<String> getParticipantList() {

		participantList = new ArrayList<String>();

		for (String key : participants.keySet()) {
			participantList.add(key);
		}
		return participantList;
	}


	/**
	 * Returns the conversation participants.
	 *
	 * @return the two conversation participants. Returned JIDs are full JIDs.
	 */

	public Collection<JID> getParticipants()
	{
		List<JID> users = new ArrayList<JID>();
		for (String key : participants.keySet()) {
			users.add(new JID(key));
		}
		return users;
	}

	public Collection<String> getConversationParticipants() {
		return participants.keySet();
	}

	/**
	 * Returns the participations of the specified user (full JID) in this conversation. Each participation will hold the time when the user joined
	 * and left the conversation and the nickname if the room happened in a room.
	 *
	 * @param user
	 *            the full JID of the user.
	 * @return the participations of the specified user (full JID) in this conversation.
	 */

	public Collection<ConversationParticipation> getParticipations(JID user) {
		UserParticipations userParticipations = participants.get(user.toString());
		if (userParticipations == null) {
			return Collections.emptyList();
		}
		return userParticipations.getParticipations();
	}

	/**
	 * Returns true if one of the conversation participants is on an external server.
	 *
	 * @return true if one of the conversation participants is on an external server.
	 */
	@XmlElement
	public boolean isExternal() {
		return external;
	}

	/**
	 * Returns the starting timestamp of the conversation.
	 *
	 * @return the start date.
	 */
	@XmlElement
	public Date getStartDate() {
		return startDate;
	}

	/**
	 * Returns the timestamp the last message was receieved.
	 *
	 * @return the last activity.
	 */
	@XmlElement
	public Date getLastActivity() {
		return lastActivity;
	}

	/**
	 * Returns the number of messages that make up the conversation.
	 *
	 * @return the message count.
	 */
	@XmlElement
	public int getMessageCount() {
		return messageCount;
	}

	/**
	 * Returns the archived messages in the conversation. If message archiving is not enabled, this method will always return an empty collection.
	 * This method will only return messages that have already been batch-archived to the database; in other words, it does not provide a real-time
	 * view of new messages.
	 *
	 * @return the archived messages in the conversation.
	 */
	@XmlElementWrapper(name = "messages")
	@XmlElement(name = "message")
	public List<ArchivedMessage> getMessages()
	{
		boolean messageArchivingEnabled = JiveGlobals.getBooleanProperty("conversation.messageArchiving", false);
		boolean roomArchivingEnabled = JiveGlobals.getBooleanProperty("conversation.roomArchiving", false);

		if (room == null && !messageArchivingEnabled) {
			return Collections.emptyList();
		} else if (room != null && !roomArchivingEnabled) {
			return Collections.emptyList();
		}

		messages = new ArrayList<ArchivedMessage>();
		Connection con = null;
		PreparedStatement pstmt = null;
		ResultSet rs = null;
		try {
			con = DbConnectionManager.getConnection();
			pstmt = con.prepareStatement(LOAD_MESSAGES);
			pstmt.setLong(1, getConversationID());
			rs = pstmt.executeQuery();
			while (rs.next()) {
				JID fromJID = new JID(rs.getString(1));
				String fromJIDResource = rs.getString(2);
				if (fromJIDResource != null && !"".equals(fromJIDResource)) {
					fromJID = new JID(rs.getString(1) + "/" + fromJIDResource);
				}
				JID toJID = new JID(rs.getString(3));
				String toJIDResource = rs.getString(4);
				if (toJIDResource != null && !"".equals(toJIDResource)) {
					toJID = new JID(rs.getString(3) + "/" + toJIDResource);
				}
				Date date = new Date(rs.getLong(5));
				String body = DbConnectionManager.getLargeTextField(rs, 6);
				messages.add(new ArchivedMessage(conversationID, fromJID, toJID, date, body, false));
			}
		} catch (SQLException sqle) {
			Log.error(sqle.getMessage(), sqle);
		} finally {
			DbConnectionManager.closeConnection(rs, pstmt, con);
		}
		// Add messages of users joining or leaving the group chat conversation
		if (room != null) {
			for (Map.Entry<String, UserParticipations> entry : participants.entrySet()) {
				JID user = new JID(entry.getKey());
				boolean anonymous = false;
				String name;
				try {
					name = UserNameManager.getUserName(user);
				} catch (UserNotFoundException e) {
					name = user.toBareJID();
					anonymous = true;
				}
				for (ConversationParticipation participation : entry.getValue().getParticipations()) {
					if (participation.getJoined() == null) {
						Log.warn("Found muc participant with no join date in conversation: " + conversationID);
						continue;
					}
					JID jid = new JID(room + "/" + participation.getNickname());
					String joinBody;
					String leftBody;
					if (anonymous) {
						joinBody = LocaleUtils.getLocalizedString("muc.conversation.joined.anonymous", MonitoringConstants.NAME,
								Arrays.asList(participation.getNickname()));
						leftBody = LocaleUtils.getLocalizedString("muc.conversation.left.anonymous", MonitoringConstants.NAME,
								Arrays.asList(participation.getNickname()));
					} else {
						joinBody = LocaleUtils.getLocalizedString("muc.conversation.joined", MonitoringConstants.NAME,
								Arrays.asList(participation.getNickname(), name));
						leftBody = LocaleUtils.getLocalizedString("muc.conversation.left", MonitoringConstants.NAME,
								Arrays.asList(participation.getNickname(), name));
					}
					messages.add(new ArchivedMessage(conversationID, user, jid, participation.getJoined(), joinBody, true));
					if (participation.getLeft() != null) {
						messages.add(new ArchivedMessage(conversationID, user, jid, participation.getLeft(), leftBody, true));
					}
				}
			}
			// Sort messages by sent date
			Collections.sort(messages, new Comparator<ArchivedMessage>() {
				public int compare(ArchivedMessage o1, ArchivedMessage o2) {
					return o1.getSentDate().compareTo(o2.getSentDate());
				}
			});
		}
		return messages;
	}

	@Override
	public String toString() {
		StringBuilder buf = new StringBuilder();
		buf.append("Conversation [").append(conversationID).append("]");
		if (room != null) {
			buf.append(" in room").append(room);
		}
		buf.append(" between ").append(participants);
		buf.append(". started ").append(JiveGlobals.formatDateTime(startDate));
		buf.append(", last active ").append(JiveGlobals.formatDateTime(lastActivity));
		buf.append(". Total messages: ").append(messageCount);
		return buf.toString();
	}

	private void loadFromDb() throws NotFoundException {
		Log.info("loadFromDb");

		Connection con = null;
		PreparedStatement pstmt = null;
		ResultSet rs = null;
		try {
			con = DbConnectionManager.getConnection();
			pstmt = con.prepareStatement(LOAD_CONVERSATION);
			pstmt.setLong(1, conversationID);
			rs = pstmt.executeQuery();
			if (!rs.next()) {
				throw new NotFoundException("Conversation not found: " + conversationID);
			}
			this.room = rs.getString(1) == null ? null : new JID(rs.getString(1));
			this.external = rs.getInt(2) == 1;
			this.startDate = new Date(rs.getLong(3));
			this.lastActivity = new Date(rs.getLong(4));
			this.messageCount = rs.getInt(5);
			rs.close();
			pstmt.close();

			this.participants = new ConcurrentHashMap<String, UserParticipations>();
			pstmt = con.prepareStatement(LOAD_PARTICIPANTS);
			pstmt.setLong(1, conversationID);
			rs = pstmt.executeQuery();
			while (rs.next()) {
				// Rebuild full JID of participant
				String baredJID = rs.getString(1);
				String resource = rs.getString(2);
				JID fullJID = new JID("".equals(resource) ? baredJID : baredJID + "/" + resource);
				// Rebuild joined and left time
				ConversationParticipation participation = new ConversationParticipation(new Date(rs.getLong(4)), rs.getString(3));
				if (rs.getLong(5) > 0) {
					participation.participationEnded(new Date(rs.getLong(5)));
				}
				// Store participation data
				UserParticipations userParticipations = participants.get(fullJID.toString());
				if (userParticipations == null) {
					userParticipations = new UserParticipations(room != null);
					participants.put(fullJID.toString(), userParticipations);
				}
				userParticipations.addParticipation(participation);
			}
		} catch (SQLException sqle) {
			Log.error(sqle.getMessage(), sqle);
		} finally {
			DbConnectionManager.closeConnection(rs, pstmt, con);
		}
	}

	public void writeExternal(ObjectOutput out) throws IOException
	{
		ExternalizableUtil.getInstance().writeLong(out, conversationID);
		ExternalizableUtil.getInstance().writeExternalizableMap(out, participants);
		ExternalizableUtil.getInstance().writeBoolean(out, external);
		ExternalizableUtil.getInstance().writeLong(out, startDate.getTime());
		ExternalizableUtil.getInstance().writeLong(out, lastActivity.getTime());
		ExternalizableUtil.getInstance().writeInt(out, messageCount);
		ExternalizableUtil.getInstance().writeBoolean(out, room != null);

		if (room != null) {
			ExternalizableUtil.getInstance().writeSerializable(out, room);
		}
	}

	public void readExternal(ObjectInput in) throws IOException, ClassNotFoundException
	{
		this.participants = new ConcurrentHashMap<String, UserParticipations>();

		conversationID = ExternalizableUtil.getInstance().readLong(in);
		ExternalizableUtil.getInstance().readExternalizableMap(in, participants, getClass().getClassLoader());
		external = ExternalizableUtil.getInstance().readBoolean(in);
		startDate = new Date(ExternalizableUtil.getInstance().readLong(in));
		lastActivity = new Date(ExternalizableUtil.getInstance().readLong(in));
		messageCount = ExternalizableUtil.getInstance().readInt(in);

		if (ExternalizableUtil.getInstance().readBoolean(in)) {
			room = (JID) ExternalizableUtil.getInstance().readSerializable(in);
		}
	}
}