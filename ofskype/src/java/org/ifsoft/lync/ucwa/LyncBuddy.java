package org.ifsoft.lync.ucwa;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.jivesoftware.openfire.XMPPServer;
import org.jivesoftware.openfire.SessionManager;
import org.jivesoftware.openfire.StreamID;
import org.jivesoftware.openfire.session.*;
import org.jivesoftware.openfire.auth.AuthToken;
import org.jivesoftware.openfire.auth.AuthFactory;

import java.math.BigInteger;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import org.xmpp.packet.*;

import java.util.*;

import org.dom4j.*;

import org.ifsoft.skype.SkypeClient;


public class LyncBuddy {

    private static final Logger Log = LoggerFactory.getLogger(LyncBuddy.class);

	public String emailAddress;
	public String workPhoneNumber;
	public String displayName;
	public String photoData;
	public String sessionId;
	public String roomName;
	public SkypeClient lync;
	public JID contactJID;
	public JID userJID;
	public LyncConnection xmpp;
	public boolean online = false;
	public LocalClientSession session = null;

	private String username = null;

	public LyncBuddy( SkypeClient lync, JID userJID, JID contactJID, String emailAddress, String workPhoneNumber, String displayName, String photoData)
	{
		this.emailAddress = emailAddress;
		this.workPhoneNumber = workPhoneNumber;
		this.displayName = displayName;
		this.photoData = photoData;
		this.lync = lync;
		this.contactJID = new JID(contactJID.getNode() + "@" + getDomain());
		this.userJID = new JID(userJID.getNode() + "@" + getDomain());
		this.username = JID.unescapeNode(this.contactJID.getNode());
		this.sessionId = this.username + "-" + System.currentTimeMillis();
		this.roomName = "pw-" + LyncBuddy.getMD5(this.contactJID.getNode(), this.userJID.getNode());
	}

    public String getDomain() {
        return XMPPServer.getInstance().getServerInfo().getXMPPDomain();
    }

	public void updatePresenceItem(String show, String status)
	{
		Log.info("LyncBuddy - updatePresenceItem " + contactJID + " for " + userJID + " " + username);

		if (!online && "Offline".equals(show)) return;

		try	{

			if (!online)
			{
				if (SessionManager.getInstance().getSessions(username).isEmpty())
				{
					Log.info("LyncBuddy - updatePresenceItem creating session for " + username);

					xmpp = new LyncConnection(contactJID, username);
					session = SessionManager.getInstance().createClientSession(xmpp, new BasicStreamID(sessionId));
					//AuthToken authToken = AuthFactory.authenticate(username, sessionId);
					AuthToken authToken = new AuthToken(username, true);
					session.setAuthToken(authToken, username);
					online = true;
				}
			}

			Presence presence;

			if ("Online".equals(show) || "IdleOnline".equals(show)) {
				presence = new Presence();
			}
			else

			if ("Away".equals(show) || "Inactive".equals(show)) {
				presence = new Presence();
				presence.setShow(Presence.Show.away);
			}
			else

			if ("Off work".equals(show)) {
				presence = new Presence();
				presence.setShow(Presence.Show.xa);
			}
			else

			if ("BeRightBack".equals(show)) {
				presence = new Presence();
				presence.setShow(Presence.Show.away);
			}
			else

			if ("Busy".equals(show) || "DoNotDisturb".equals(show)) {
				presence = new Presence();
				presence.setShow(Presence.Show.dnd);
			}
			else

			if ("IdleBusy".equals(show)) {
				presence = new Presence();
				presence.setShow(Presence.Show.dnd);
			}
			else {
			    presence = new Presence(Presence.Type.unavailable);
			}

			presence.setStatus(status);
			presence.setFrom(contactJID + "/" + username);

        	//component.sendPacket(presence);

		}
		catch(Exception e)
		{
			Log.error("LyncBuddy - updatePresenceItem exception ", e);
		}
	}

	public void sendContactPhoto()
	{
		Log.info("LyncBuddy - sendContactPhoto" + contactJID + " for " + userJID);

		Presence presence = new Presence();
		presence.setTo(userJID);
		presence.setFrom(contactJID + "/" + username);
		presence.addChildElement("x", "traderlynk:x:avatar").addText(photoData);
		//component.sendPacket(presence);
	}

	public void sendMessage(String body, String operationId)
	{
		Log.info("LyncBuddy - sendMessage " + contactJID + " for " + userJID + " " + body + " " + operationId);

		try
		{
			String roomId = roomName;

			if (operationId != null && operationId.indexOf("pw-") == 0)
			{
				roomId = operationId;
			}

			String roomJid = roomId + "@conference." + getDomain();

			Message message = new Message();
			message.setTo(roomJid);
			message.setFrom(contactJID + "/" + username);
			message.setType(Message.Type.groupchat);
			message.setBody(body);
			//component.sendPacket(message);
		}
		catch(Exception e)
		{
			Log.error("LyncBuddy - sendMessage exception ", e);
		}
	}

	public void leaveChatRoom(String operationId)
	{
		Log.info("LyncBuddy - leaveChatRoom" + contactJID + " for " + userJID + " " + operationId);

		try
		{
			String roomId = roomName;

			if (operationId != null && operationId.indexOf("pw-") == 0)
			{
				roomId = operationId;
			}

			String roomJid = roomId + "@conference." + getDomain();

			Presence presence = new Presence(Presence.Type.unavailable);
			presence.setTo(roomJid + "/" + contactJID.getNode());
			presence.setFrom(contactJID + "/" + username);
			presence.addChildElement("x", "http://jabber.org/protocol/muc");
			//component.sendPacket(presence);
		}
		catch(Exception e)
		{
			Log.error("LyncBuddy - sendMessage exception ", e);
		}
	}

	public void sendMessagingInvite(String subject)
	{
		try
		{
			// first we create room and put lync contact in room

			String roomJid = roomName + "@conference." + getDomain();
			String roomDesc = contactJID.toString();

			Presence presence = new Presence();
			presence.setTo(roomJid + "/" + contactJID.getNode());
			presence.setFrom(contactJID + "/" + username);
			presence.addChildElement("x", "http://jabber.org/protocol/muc");
			//component.sendPacket(presence);

			// next, we configure room, if room is just created

        	IQ iq = new IQ(IQ.Type.set);
			iq.setFrom(contactJID + "/" + username);
			iq.setTo(roomJid);
			Element query = iq.setChildElement("query", "http://jabber.org/protocol/muc#owner");
			Element x = query.addElement("x", "jabber:x:data").addAttribute("type", "submit");
			x.addElement("field").addAttribute("var", "FORM_TYPE").addElement("value").addText("http://jabber.org/protocol/muc#roomconfig");
			x.addElement("field").addAttribute("var", "muc#roomconfig_roomname").addElement("value").addText(roomDesc);
			x.addElement("field").addAttribute("var", "muc#roomconfig_changesubject").addElement("value").addText("1");
			x.addElement("field").addAttribute("var", "muc#roomconfig_allowinvites").addElement("value").addText("1");
			x.addElement("field").addAttribute("var", "muc#roomconfig_enablelogging").addElement("value").addText("1");
			x.addElement("field").addAttribute("var", "muc#roominfo_subject").addElement("value").addText(subject);
			x.addElement("field").addAttribute("var", "muc#roomconfig_roomdesc").addElement("value").addText(roomDesc);
			x.addElement("field").addAttribute("var", "muc#roomconfig_persistentroom").addElement("value").addText("0");
			Element broadcast = x.addElement("field").addAttribute("var", "muc#roomconfig_presencebroadcast");
			broadcast.addElement("value").addText("moderator");
			broadcast.addElement("value").addText("participant");
			broadcast.addElement("value").addText("visitor");
			//component.sendPacket(iq);

			// next, we join invite xmpp user to room

			Message message = new Message();
			message.setTo(roomJid);
			message.setFrom(contactJID + "/" + username);
			Element muc = message.addChildElement("x", "http://jabber.org/protocol/muc#user");
			Element invite = muc.addElement("invite").addAttribute("to", userJID.toString());
			invite.addElement("reason").addText(subject);
			//component.sendPacket(message);
		}
		catch(Exception e)
		{
			Log.error("LyncBuddy - sendMessagingInvite exception ", e);
		}
	}

	public static String getMD5(String jid1, String jid2)
	{
		String input = jid1.compareTo(jid2) >= 0 ? jid1 + jid2 :  jid2 + jid1;

		try {
			MessageDigest md = MessageDigest.getInstance("MD5");
			byte[] messageDigest = md.digest(input.getBytes());
			BigInteger number = new BigInteger(1, messageDigest);
			String hashtext = number.toString(16);
			// Now we need to zero pad it if you actually want the full 32 chars.
			while (hashtext.length() < 32) {
				hashtext = "0" + hashtext;
			}
			return hashtext;
		}
		catch (NoSuchAlgorithmException e) {
			throw new RuntimeException(e);
		}
	}
}
