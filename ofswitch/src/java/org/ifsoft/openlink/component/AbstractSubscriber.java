package org.ifsoft.openlink.component;

import java.io.*;
import org.xmpp.packet.JID;
import org.apache.log4j.Logger;

public abstract class AbstractSubscriber
{
    protected Logger Log = Logger.getLogger(getClass().getName());

	private JID jid		 				= null;
	private String name		 			= "";
	private String subscription			= "";
	private String subid				= "";
	private boolean online				= false;


	public JID getJID() {
		return jid;
	}

	public void setJID(JID jid) {
		this.jid = jid;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getSubscription() {
		return subscription;
	}

	public void setSubscription(String subscription) {
		this.subscription = subscription;
	}

	public String getSubID() {
		return subid;
	}

	public void setSubID(String subid) {
		this.subid = subid;
	}

	public boolean getOnline() {
		return online;
	}

	public void setOnline(boolean online) {
		this.online = online;
	}
}