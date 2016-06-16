package org.ifsoft.lync.ucwa;

import java.util.*;
import java.util.concurrent.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.security.cert.Certificate;

import org.jivesoftware.openfire.XMPPServer;
import org.jivesoftware.openfire.SessionPacketRouter;
import org.jivesoftware.openfire.auth.UnauthorizedException;
import org.jivesoftware.openfire.net.VirtualConnection;
import org.jivesoftware.openfire.session.LocalClientSession;
import org.jivesoftware.openfire.spi.ConnectionConfiguration;

import org.xmpp.packet.Packet;

import org.dom4j.*;
import org.xmpp.packet.*;

import org.ifsoft.skype.SkypeClient;

/*
	Handles the virtual xmpp session for a specific lync user/contact
*/

public class LyncConnection extends VirtualConnection
{
	private static Logger Log = LoggerFactory.getLogger( "LyncConnection" );
    private String remoteAddr;
    private JID jid;
    private String hostName;
    private String username;
    private LocalClientSession session;
    private boolean isSecure = false;
    private boolean online = false;
    private ConcurrentHashMap<String, String> conferences;


    public LyncConnection(JID jid, String hostName ) {
		this.username = JID.escapeNode(jid.getNode());
    	this.remoteAddr = username + "@" + getDomain() + "/" + username;
    	this.hostName = hostName;
    	this.jid = jid;
    	this.conferences = new ConcurrentHashMap<String, String>();
    }

	public boolean isSecure() {
        return isSecure;
    }

	public void setSecure(boolean isSecure) {
        this.isSecure = isSecure;
    }

    public void closeVirtualConnection()
    {
        Log.info("LyncConnection - close ");
    }

    public byte[] getAddress() {
        return remoteAddr.getBytes();
    }

    public String getHostAddress() {
        return remoteAddr;
    }

    public String getHostName()  {
    	return ( hostName != null ) ? hostName : "0.0.0.0";
    }

    public void systemShutdown() {

    }

    public void deliver(Packet packet) 	// xmpp --> lync
    {
		try {
			Log.info( remoteAddr + " deliver : " + packet );

			if (packet instanceof Message) deliver ((Message) packet);
			if (packet instanceof Presence) deliver ((Presence) packet);

		} catch ( Exception e ) {
			Log.error( "An error occurred while attempting to route the packet : ", e );
		}
    }

    private void deliver(Presence presence)
    {
		Log.info("deliver\n" + presence.toString());

		String conference = presence.getFrom().getNode();

		Element joined = presence.getChildElement("joined", "urn:xmpp:rayo:colibri:1");
		Element unjoined = presence.getChildElement("unjoined", "urn:xmpp:rayo:colibri:1");
		Element inviteaccepted = presence.getChildElement("inviteaccepted", "urn:xmpp:rayo:colibri:1");
		Element invitecompleted = presence.getChildElement("invitecompleted", "urn:xmpp:rayo:colibri:1");

		if (inviteaccepted != null)
		{
			Log.info("deliver inviteaccepted " + conference);

			if (conferences.containsKey(conference) == false)	// lync -> xmpp audio accept followed by join
			{
				String from = inviteaccepted.attributeValue("from");

				try {
					String participant = (new JID(from)).getNode();
					conferences.put(conference, participant);

					Log.info("deliver inviteaccepted " + conference + " locked to " + participant);

				} catch (Exception e) {

				}
			}

		} else if (invitecompleted != null) {

			Log.info("deliver invitecompleted " + conference);

			if (conferences.containsKey(conference))
			{
				String from = invitecompleted.attributeValue("from");

				try {
					String participant = (new JID(from)).getNode();

					if (username.equals(participant))					// remove lync audio flag when user hangs up
					{
						conferences.remove(conference);

						Log.info("deliver invitecompleted " + conference + " unlocked " + participant);
					}

				} catch (Exception e) {

				}
			}

		} else if (joined != null) {

			Log.info("deliver joined " + conference);

			if (conferences.containsKey(conference) == false)	// add lync audio whenever any traderlynk user adds audio
			{
				String mixer = joined.attributeValue("mixer-name");
				String nickname = joined.attributeValue("nickname");
				String participant = joined.attributeValue("participant");
				boolean audio = "true".equals(joined.attributeValue("audio"));
				boolean video = "true".equals(joined.attributeValue("video"));

				Log.info("deliver joined" + mixer + " " + nickname + " " + participant + " " + audio + " " + video);

				try {
					//component.makePhoneCall(mixer, presence.getTo(), nickname);

				} catch (Exception e) {
					Log.error("LyncConnection deliver", e);
				}

				conferences.put(conference, nickname);	// set audio flag
			}

			return;

		} else if (unjoined != null) {

			Log.info("deliver unjoined " + conference);

			if (conferences.containsKey(conference))
			{
				String from = unjoined.attributeValue("nickname");

				try {
					String participant = (new JID(from)).getNode();

					if (username.equals(participant))					// remove lync audio flag when user hangs up
					{
						conferences.remove(conference);

						Log.info("deliver unjoined " + conference + " unlocked " + participant);
					}

				} catch (Exception e) {

				}
			}

		} else {

			String jidFrom = presence.getFrom().toBareJID();

			SkypeClient ucwaClient = null; //plugin.getSkypeClient(jidFrom);

			if (ucwaClient != null)
			{
				Presence.Type ptype = presence.getType();
				Presence.Show stype = presence.getShow();
				String status = presence.getStatus();
				String availability = null;

				if (stype == Presence.Show.chat) {
					availability = "Online";
				}
				else if (stype == Presence.Show.away) {
					availability = "BeRightBack";
				}
				else if (stype == Presence.Show.xa) {
					availability = "Away";
				}
				else if (stype == Presence.Show.dnd) {
					availability = "Busy";
				}
				else if (ptype == Presence.Type.unavailable) {
					availability = "Off work";

				} else
					availability = "Online";

				if (availability != null) ucwaClient.setPresence(availability);
				if (status != null) ucwaClient.setNote(status);
			}
		}
    }

    private void deliver(Message message)
    {
		Log.info("deliver\n" + message.toString());

		String username = message.getFrom().getResource();
		String roomId = message.getFrom().getNode();

		if (username == null)	// conference invite ?
		{
			Element element = message.getChildElement("x", "http://jabber.org/protocol/muc#user");

			if(element != null)
			{
				JID jidFrom = new JID(element.element("invite").attributeValue("from"));

				SkypeClient ucwaClient = null; //LyncConnection.plugin.getSkypeClient(jidFrom.toBareJID());

				if (ucwaClient != null)	// join room on xmpp side
				{
					String node =  JID.unescapeNode(message.getTo().getNode());
					String sip =  node;
					if (node.indexOf("@") == -1) sip = node + "@" + ucwaClient.getDomain();	// use SIP domain, not XMPP domain in dev. Should be the same in production

					Presence presence = new Presence();
					presence.setTo(message.getFrom() + "/" + node);
					presence.setFrom(message.getTo()  + "/" + node);
					presence.addChildElement("x", "http://jabber.org/protocol/muc");
					//component.sendPacket(presence);

					ucwaClient.sendInvite(sip, roomId, "TraderLynk");
				}
			}

		} else if (username.indexOf("@") == -1) {

			String jidFrom = username + "@" + getDomain();

			SkypeClient ucwaClient = null; //plugin.getSkypeClient(jidFrom);

			if (ucwaClient != null)
			{
				String node =  JID.unescapeNode(message.getTo().getNode());
				String sip =  node;
				if (node.indexOf("@") == -1) sip = node + "@" + ucwaClient.getDomain();	// use SIP domain, not XMPP domain in dev. Should be the same in production

				Element element = message.getChildElement("x", "jabber:x:event");

				if(element != null)
				{
					if (element.element("composing") != null)
					{

					}

					if (element.element("idle") != null)
					{

					}
				}


				String text = message.getBody();

				if (text != null && ! "".equals(text))
				{
					ucwaClient.sendMessage(sip, text);
				}
			}
		}
    }

	public void deliverRawText(String data) // xmpp --> lync raw text TODO
	{
		Log.error( "deliverRawText\n" + data);
	}

    @Override public ConnectionConfiguration getConfiguration()
    {
        // TODO Here we run into an issue with the ConnectionConfiguration introduced in Openfire 4:
        //      it is not extensible in the sense that unforeseen connection types can be added.
        //      For now, null is returned, as this object is likely to be unused (its lifecycle is
        //      not managed by a ConnectionListener instance).
        return null;
    }

    public Certificate[] getPeerCertificates() {
        return null;
    }

    private String getDomain() {
        return XMPPServer.getInstance().getServerInfo().getXMPPDomain();
    }
}
