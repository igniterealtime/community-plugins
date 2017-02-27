/**
 * $RCSfile$
 * $Revision: $
 * $Date: $
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

package org.jivesoftware.smack;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.security.cert.Certificate;
import java.net.InetSocketAddress;
import javax.xml.XMLConstants;
import java.io.StringReader;
import java.util.Locale;

import org.jivesoftware.openfire.session.LocalClientSession;
import org.jivesoftware.openfire.net.VirtualConnection;
import org.jivesoftware.openfire.auth.UnauthorizedException;
import org.jivesoftware.openfire.auth.AuthToken;
import org.jivesoftware.openfire.auth.AuthFactory;
import org.jivesoftware.openfire.PacketDeliverer;
import org.jivesoftware.openfire.nio.OfflinePacketDeliverer;

import org.jivesoftware.openfire.*;
import org.jivesoftware.openfire.websocket.*;
import org.jivesoftware.openfire.multiplex.UnknownStanzaException;
import org.jivesoftware.openfire.net.SASLAuthentication;
import org.jivesoftware.openfire.net.SASLAuthentication.Status;
import org.jivesoftware.openfire.session.ConnectionSettings;
import org.jivesoftware.openfire.session.LocalClientSession;
import org.jivesoftware.openfire.streammanagement.StreamManager;
import org.jivesoftware.util.JiveConstants;
import org.jivesoftware.util.JiveGlobals;

import org.jivesoftware.openfire.plugin.ofmeet.jetty.OfMeetLoginService;
import org.jivesoftware.openfire.plugin.rest.RestEventSourceServlet;

import java.util.*;
import java.util.concurrent.*;

import org.jivesoftware.smack.filter.PacketFilter;
import org.jivesoftware.smack.packet.Packet;
import org.jivesoftware.smack.packet.Presence;
import org.jivesoftware.smack.util.StringUtils;
import org.jivesoftware.smack.util.PacketParserUtils;

import java.io.*;
import java.net.*;
import javax.net.ssl.*;
import javax.security.auth.callback.*;
import org.apache.commons.pool2.impl.GenericObjectPool;

import org.xmlpull.mxp1.MXParser;
import org.xmlpull.v1.XmlPullParser;

import org.xmpp.packet.*;

import org.dom4j.*;
import org.dom4j.io.XMPPPacketReader;


public class SmackConnection extends VirtualConnection
{
	private static Logger Log = LoggerFactory.getLogger( "SmackConnection" );
	private static final String STREAM_HEADER = "open";
	private static final String STREAM_FOOTER = "close";
	private static final String FRAMING_NAMESPACE = "urn:ietf:params:xml:ns:xmpp-framing";

	private SessionPacketRouter router;
	private LocalClientSession xmppSession;
	private boolean startedSASL = false;
	private Status saslStatus;

	private String remoteAddr;
	private String hostName;
	private boolean isSecure = false;
	private XMPPConnection.OpenfirePacketReader reader;
	private XMPPConnection.OpenfirePacketWriter writer;
	private String username;
	private PacketDeliverer backupDeliverer;
	private static GenericObjectPool<XMPPPacketReader> readerPool;

	public SmackConnection(String hostName, XMPPConnection.OpenfirePacketWriter writer,  XMPPConnection.OpenfirePacketReader reader)
	{
		this.remoteAddr = hostName;
		this.hostName = hostName;
		this.reader = reader;

		if (readerPool == null) {
			initializePool();
		}
	}

	public void setReader(XMPPConnection.OpenfirePacketReader reader) {
		this.reader = reader;
	}

	public void setWriter(XMPPConnection.OpenfirePacketWriter writer) {
		this.writer = writer;
	}

	public boolean isSecure() {
		return isSecure;
	}

	public void setSecure(boolean isSecure) {
		this.isSecure = isSecure;
	}

	public SessionPacketRouter getRouter()
	{
		return router;
	}

	public void setRouter(SessionPacketRouter router, String username)
	{
		this.router = router;
		this.username = username;
	}

	public void setUsername(String username)
	{
		this.username = username;
	}

	public void closeVirtualConnection()
	{
		Log.info("SmackConnection - close ");

		if (this.reader!= null) this.reader.shutdown();
		if (this.writer!= null) this.writer.shutdown();
		if (this.reader!= null) this.reader.cleanup();
		if (this.writer!= null) this.writer.cleanup();
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
		deliverRawText(new StreamError(StreamError.Condition.system_shutdown).toXML());
		close();
	}

	public void deliver(org.xmpp.packet.Packet packet) throws UnauthorizedException
	{
		final String xml;

		if (Namespace.NO_NAMESPACE.equals(packet.getElement().getNamespace()))
		{
			// use string-based operation here to avoid cascading xmlns wonkery

			StringBuilder packetXml = new StringBuilder(packet.toXML());
			packetXml.insert(packetXml.indexOf(" "), " xmlns=\"jabber:client\"");
			xml = packetXml.toString();

		} else {
			xml = packet.toXML();
		}
		if (validate()) {
			deliverRawText(xml);
		} else {
			// use fallback delivery mechanism (offline)
			getPacketDeliverer().deliver(packet);
		}
	}

	void deliverToSSE(String packet)
	{
		RestEventSourceServlet.emitEvent("chatapi.xmpp", username, packet);
	}

	public void deliverRawText(String text)
	{
		Log.info("SmackConnection - deliverRawText\n" + text);

		try {
			deliverToSSE(text);

			StringReader stringReader = new StringReader(text);

			XmlPullParser parser = new MXParser();
			parser.setFeature(XmlPullParser.FEATURE_PROCESS_NAMESPACES, true);
			parser.setInput(stringReader);

			int eventType = parser.getEventType();

			do {
				if (eventType == XmlPullParser.START_TAG)
				{
					if (parser.getName().equals("message")) {
						this.reader.processPacket(PacketParserUtils.parseMessage(parser));
					}
					else if (parser.getName().equals("iq")) {
						this.reader.processPacket(PacketParserUtils.parseIQ(parser, reader.connection));
					}
					else if (parser.getName().equals("presence")) {
						this.reader.processPacket(PacketParserUtils.parsePresence(parser));
					}
				}

				else if (eventType == XmlPullParser.END_TAG) {

				}

				eventType = parser.next();
			} while (eventType != XmlPullParser.END_DOCUMENT);


		}

		catch (Exception e) {
			Log.error("deliverRawText error", e);
		}
	}

	@Override
	public boolean validate() {
		return router != null;
	}

	@Override
	public PacketDeliverer getPacketDeliverer() {
		if (backupDeliverer == null) {
			backupDeliverer = new OfflinePacketDeliverer();
		}
		return backupDeliverer;
	}

	@Override
	public org.jivesoftware.openfire.spi.ConnectionConfiguration getConfiguration()
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

	public void sendSmackXmppMessage(String stanza)
	{
		Log.debug("sendSmackXmppMessage\n" + stanza);

		XMPPPacketReader reader = null;
		try {
			reader = readerPool.borrowObject();
			Document doc = reader.read(new StringReader(stanza));

			if (router == null) {
				if (isStreamManagementAvailable()) {
					router = new StreamManagementPacketRouter(xmppSession);
				} else {
					// fall back for older Openfire installations
					router = new SessionPacketRouter(xmppSession);
				}
			}
			router.route(doc.getRootElement());

		} catch (Exception ex) {
			Log.error("Failed to process smack XMPP stanza", ex);
		} finally {
			if (reader != null) {
				readerPool.returnObject(reader);
			}
		}
	}

	public void sendRawXmppMessage(String stanza)
	{
		Log.debug("sendRawXmppMessage\n" + stanza);

		XMPPPacketReader reader = null;
		try {
			reader = readerPool.borrowObject();
			Document doc = reader.read(new StringReader(stanza));

			if (xmppSession == null) {
				initiateSession(doc.getRootElement());
			} else {
				processStanza(doc.getRootElement());
			}
		} catch (Exception ex) {
			Log.error("Failed to process raw XMPP stanza", ex);
		} finally {
			if (reader != null) {
				readerPool.returnObject(reader);
			}
		}
	}

	/*
	 * Process stream headers/footers and authentication stanzas locally;
	 * otherwise delegate stanza handling to the session packet router.
	 */

	private void processStanza(Element stanza) {

		try {
			String tag = stanza.getName();
			if (STREAM_FOOTER.equals(tag)) {
				closeStream(null);
			} else if ("auth".equals(tag)) {
				// User is trying to authenticate using SASL
				startedSASL = true;
				// Process authentication stanza
				xmppSession.incrementClientPacketCount();
				saslStatus = SASLAuthentication.handle(xmppSession, stanza);
			} else if (startedSASL && "response".equals(tag) || "abort".equals(tag)) {
				// User is responding to SASL challenge. Process response
				xmppSession.incrementClientPacketCount();
				saslStatus = SASLAuthentication.handle(xmppSession, stanza);
			} else if (STREAM_HEADER.equals(tag)) {
				// restart the stream
				openStream(stanza.attributeValue(QName.get("lang", XMLConstants.XML_NS_URI), "en"), stanza.attributeValue("from"));
				configureStream();
			} else if (Status.authenticated.equals(saslStatus)) {
				if (router == null) {
					if (isStreamManagementAvailable()) {
						router = new StreamManagementPacketRouter(xmppSession);
					} else {
						// fall back for older Openfire installations
						router = new SessionPacketRouter(xmppSession);
					}
				}
				router.route(stanza);
			} else {
				// require authentication
				Log.warn("Not authorized: " + stanza.asXML());
				sendPacketError(stanza, PacketError.Condition.not_authorized);
			}
		} catch (UnknownStanzaException use) {
			Log.warn("Received invalid stanza: " + stanza.asXML());
			sendPacketError(stanza, PacketError.Condition.bad_request);
		} catch (Exception ex) {
			Log.error("Failed to process incoming stanza: " + stanza.asXML(), ex);
			closeStream(new StreamError(StreamError.Condition.internal_server_error));
		}
	}

	/*
	 * Initiate the stream and corresponding XMPP session.
	 */
	private void initiateSession(Element stanza) {

		String host = stanza.attributeValue("to");
		StreamError streamError = null;

		Locale language = Locale.forLanguageTag(stanza.attributeValue(QName.get("lang", XMLConstants.XML_NS_URI), "en"));
		if (STREAM_FOOTER.equals(stanza.getName())) {
			// an error occurred while setting up the session
			Log.warn("Client closed stream before session was established");
		} else if (!STREAM_HEADER.equals(stanza.getName())) {
			streamError = new StreamError(StreamError.Condition.unsupported_stanza_type);
			Log.warn("Closing session due to incorrect stream header. Tag: " + stanza.getName());
		} else if (!FRAMING_NAMESPACE.equals(stanza.getNamespace().getURI())) {
			// Validate the stream namespace (https://tools.ietf.org/html/rfc7395#section-3.3.2)
			streamError = new StreamError(StreamError.Condition.invalid_namespace);
			Log.warn("Closing session due to invalid namespace in stream header. Namespace: " + stanza.getNamespace().getURI());
		} else if (!validateHost(host)) {
			streamError = new StreamError(StreamError.Condition.host_unknown);
			Log.warn("Closing session due to incorrect hostname in stream header. Host: " + host);
		} else {
			// valid stream; initiate session

			xmppSession = SessionManager.getInstance().createClientSession(this, language);
			xmppSession.setSessionData("sse", Boolean.TRUE);

			Log.warn("initiateSession - creating new session (rest_sse) for " + username);
		}

		if (xmppSession == null) {
			closeStream(streamError);
		} else {
			openStream(language.toLanguageTag(), stanza.attributeValue("from"));
			configureStream();
		}
	}

	private boolean validateHost(String host) {
		boolean result = true;
		if (JiveGlobals.getBooleanProperty("xmpp.client.validate.host", false)) {
			result = XMPPServer.getInstance().getServerInfo().getXMPPDomain().equals(host);
		}
		return result;
	}

	/*
	 * Prepare response for stream initiation (sasl) or stream restart (features).
	 */
	private void configureStream() {

		StringBuilder sb = new StringBuilder(250);
		sb.append("<stream:features xmlns:stream='http://etherx.jabber.org/streams'>");
		if (saslStatus == null) {
			// Include available SASL Mechanisms
			sb.append(SASLAuthentication.getSASLMechanisms(xmppSession));
			if (XMPPServer.getInstance().getIQRouter().supports("jabber:iq:auth")) {
				sb.append("<auth xmlns='http://jabber.org/features/iq-auth'/>");
			}
		} else if (saslStatus.equals(Status.authenticated)) {
			// Include Stream features
			sb.append(String.format("<bind xmlns='%s'/>", "urn:ietf:params:xml:ns:xmpp-bind"));
			sb.append(String.format("<session xmlns='%s'><optional/></session>", "urn:ietf:params:xml:ns:xmpp-session"));

			if (isStreamManagementAvailable()) {
				sb.append(String.format("<sm xmlns='%s'/>", StreamManager.NAMESPACE_V3));
			}

			sendSmackXmppMessage("<presence from=\"" + username + "@" + XMPPServer.getInstance().getServerInfo().getXMPPDomain() + "\" />");
		}

		sb.append("</stream:features>");
		deliverToSSE(sb.toString());
	}

	private void openStream(String lang, String jid) {

		xmppSession.incrementClientPacketCount();
		StringBuilder sb = new StringBuilder(250);
		sb.append("<open ");
		if (jid != null) {
			sb.append("to='").append(jid).append("' ");
		}
		sb.append("from='").append(XMPPServer.getInstance().getServerInfo().getXMPPDomain()).append("' ");
		sb.append("id='").append(xmppSession.getStreamID().toString()).append("' ");
		sb.append("xmlns='").append(FRAMING_NAMESPACE).append("' ");
		sb.append("xml:lang='").append(lang).append("' ");
		sb.append("version='1.0'/>");
		deliverToSSE(sb.toString());
	}

	private void closeStream(StreamError streamError)
	{
		if (streamError != null) {
			deliverToSSE(streamError.toXML());
		}

		StringBuilder sb = new StringBuilder(250);
		sb.append("<close ");
		sb.append("xmlns='").append(FRAMING_NAMESPACE).append("'");
		sb.append("/>");
		deliverToSSE(sb.toString());
		//RestEventSourceServlet.closeXmpp(username);
	}

	private void sendPacketError(Element stanza, PacketError.Condition condition) {
		Element reply = stanza.createCopy();
		reply.addAttribute("type", "error");
		reply.addAttribute("to", stanza.attributeValue("from"));
		reply.addAttribute("from", stanza.attributeValue("to"));
		reply.add(new PacketError(condition).getElement());
		deliverToSSE(reply.asXML());
	}

	private synchronized void initializePool() {
		if (readerPool == null) {
			readerPool = new GenericObjectPool<XMPPPacketReader>(new XMPPPPacketReaderFactory());
			readerPool.setMaxTotal(-1);
			readerPool.setBlockWhenExhausted(false);
			readerPool.setTestOnReturn(true);
			readerPool.setTimeBetweenEvictionRunsMillis(JiveConstants.MINUTE);
		}
	}

	private boolean isStreamManagementAvailable() {
		return JiveGlobals.getBooleanProperty(StreamManager.SM_ACTIVE, true);
	}
}