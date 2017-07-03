package org.jivesoftware.openfire.plugin.rest.entity;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;

import org.jivesoftware.smackx.muc.*;

/**
 * The Class AssistEntity.
 */
@XmlRootElement(name = "assist")
public class AssistEntity {

    private String nickname;
    private String userID;
    private String emailAddress;
    private String agent;
    private String question;
    private String product;
    private String company;
    private String state;
    private String country;

    private String workgroup;
    private String url;
    private String groupchat;
    private String message;
    private String sender;
    private MultiUserChat chatRoom;

	/**
	 * Instantiates a new assist entity.
	 */
	public AssistEntity() {
	}

    public MultiUserChat getChatroom() {
        return chatRoom;
    }

    public void setChatroom(MultiUserChat chatRoom) {
        this.chatRoom = chatRoom;
    }

	@XmlElement
    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

	@XmlElement
    public String getGroupchat() {
        return groupchat;
    }

    public void setGroupchat(String groupchat) {
        this.groupchat = groupchat;
    }

	@XmlElement
    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

	@XmlElement
    public String getSender() {
        return sender;
    }

    public void setSender(String sender) {
        this.sender = sender;
    }



	@XmlElement
    public String getWorkgroup() {
        return workgroup;
    }

    public void setWorkgroup(String workgroup) {
        this.workgroup = workgroup;
    }


	@XmlElement
    public String getNickname() {
        return nickname;
    }

    public void setNickname(String nickname) {
        this.nickname = nickname;
    }

	@XmlElement
    public String getUserID() {
        return userID;
    }

    public void setUserID(String userID) {
        this.userID = userID;
    }

	@XmlElement
    public String getEmailAddress() {
        return emailAddress;
    }

    public void setEmailAddress(String emailAddress) {
        this.emailAddress = emailAddress;
    }

	@XmlElement
    public String getCompany() {
        return company;
    }

    public void setCompany(String company) {
        this.company = company;
    }

	@XmlElement
    public String getProduct() {
        return product;
    }

    public void setProduct(String product) {
        this.product = product;
    }

	@XmlElement
    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }


	@XmlElement
    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

	@XmlElement
    public String getAgent() {
        return agent;
    }

    public void setAgent(String agent) {
        this.agent = agent;
    }

	@XmlElement
    public String getQuestion() {
        return question;
    }

    public void setQuestion(String question) {
        this.question = question;
    }

}
