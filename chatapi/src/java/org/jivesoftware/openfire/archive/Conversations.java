package org.jivesoftware.openfire.archive;

import java.util.List;
import java.util.Collection;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;

/**
 * The Class Conversations.
 */
@XmlRootElement(name = "conversations")
public class Conversations {

	/** The conversations. */
	Collection<Conversation> conversations;

	/**
	 * Instantiates a new bookmark entities.
	 */
	public Conversations() {

	}

	/**
	 * Instantiates a new bookmark entities.
	 *
	 * @param conversations
	 *            the conversations
	 */
	public Conversations(Collection<Conversation> conversations) {
		this.conversations = conversations;
	}

	/**
	 * Gets the conversations.
	 *
	 * @return the conversations
	 */
	@XmlElement(name = "conversation")
	public Collection<Conversation> getConversations() {
		return conversations;
	}

	/**
	 * Sets the conversations.
	 *
	 * @param conversations
	 *            the new conversations
	 */
	public void setConversations(Collection<Conversation> conversations) {
		this.conversations = conversations;
	}

}
