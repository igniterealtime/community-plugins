package org.jivesoftware.openfire.plugin.rest.entity;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;

/**
 * The Class MessageEntity.
 */
@XmlRootElement(name = "message")
public class MessageEntity {

	private String body;
	private String to;

	/**
	 * Instantiates a new message entity.
	 */
	public MessageEntity() {
	}

	/**
	 * Gets the body.
	 *
	 * @return the body
	 */
	@XmlElement
	public String getBody() {
		return body;
	}

	/**
	 * Sets the body.
	 *
	 * @param body
	 *            the new body
	 */
	public void setBody(String body) {
		this.body = body;
	}

	/**
	 * Gets the To.
	 *
	 * @return the To
	 */
	@XmlElement
	public String getTo() {
		return to;
	}

	/**
	 * Sets the To.
	 *
	 * @param To
	 *            the new To
	 */
	public void setTo(String to) {
		this.to = to;
	}
}
