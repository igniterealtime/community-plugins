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

import org.xmpp.packet.JID;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlElementWrapper;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;

import java.util.Date;

/**
 * Represents an archived message.
 *
 * @author Matt Tucker
 */

@XmlRootElement(name = "message")
@XmlType(propOrder = { "conversationID", "from", "to", "sentDate", "body", "stanza", "roomEvent"})

public class ArchivedMessage {

    private long conversationID;
    private JID fromJID;
    private JID toJID;
    private Date sentDate;
    private String body;
    private String stanza;
    private boolean roomEvent;
    private String from;
    private String to;

	public ArchivedMessage() {

	}

    /**
     * Creates a new archived message.
     *
     * @param conversationID the ID of the conversation that the message is associated with.
     * @param fromJID the JID of the user that sent the message.
     * @param toJID the JID of the user that the message was sent to.
     * @param sentDate the date the message was sent.
     * @param body the body of the message
     * @param roomEvent true if the message belongs to a room event. Eg. User joined room.
     */
    public ArchivedMessage(long conversationID, JID fromJID, JID toJID, Date sentDate, String body, boolean roomEvent) {
        this.conversationID = conversationID;
        // Convert both JID's to bare JID's so that we don't store resource information.
        this.fromJID = fromJID;
        this.toJID = toJID;
        this.sentDate = sentDate;
        this.body = body;
        this.roomEvent = roomEvent;
    }

    public ArchivedMessage(long conversationID, JID fromJID, JID toJID, Date sentDate, String body, String stanza, boolean roomEvent) {
    	this(conversationID, fromJID, toJID, sentDate, body, roomEvent);
    	this.stanza = stanza;
    }

    /**
     * The conversation ID that the message is associated with.
     *
     * @return the conversation ID.
     */
    @XmlElement
    public long getConversationID() {
        return conversationID;
    }

    /**
     * The JID of the user that sent the message.
     *
     * @return the sender JID.
     */
    @XmlElement
    public String getFrom() {
		from = (fromJID == null) ? null : fromJID.toString();
        return from;
    }

    public JID getFromJID() {
        return fromJID;
    }

    /**
     * The JID of the user that received the message.
     *
     * @return the recipient JID.
     */
    @XmlElement
    public String getTo() {
		to = (toJID == null) ? null : toJID.toString();
        return to;
    }

    public JID getToJID() {
        return toJID;
    }

    /**
     * The date the message was sent.
     *
     * @return the date the message was sent.
     */
    @XmlElement
    public Date getSentDate() {
        return sentDate;
    }

    /**
     * The body of the message.
     *
     * @return the body of the message.
     */
    @XmlElement
    public String getBody() {
        return body;
    }

    /**
     * String encoded message stanza.
     *
     * @return string encoded message stanza.
     */
    @XmlElement
    public String getStanza() {
    	return stanza;
    }

    /**
     * Returns true if the message belongs to a room event. Examples of room events are:
     * user joined the room or user left the room.
     *
     * @return true if the message belongs to a room event.
     */
    @XmlElement
    public boolean isRoomEvent() {
        return roomEvent;
    }
}