package org.ifsoft.sip;


import java.io.IOException;
import java.util.Date;
import java.util.LinkedList;
import java.util.Vector;
import java.net.*;

import javax.sdp.Attribute;
import javax.sdp.MediaDescription;
import javax.sdp.SdpException;
import javax.sdp.SdpFactory;
import javax.sdp.SdpParseException;
import javax.sdp.SessionDescription;
import javax.sdp.Time;
import javax.sip.ClientTransaction;
import javax.sip.Dialog;
import javax.sip.ServerTransaction;
import javax.sip.message.Message;

import org.slf4j.*;
import org.slf4j.Logger;

import org.xmpp.packet.*;

import org.ifsoft.skype.SkypeClient;

import net.sf.json.*;

/**
 *
 * Represents a call, contains the information for the sip side of the call
 *
 */
public class CallSession
{
    private static final Logger Log = LoggerFactory.getLogger(CallSession.class);

	boolean callAccepted = false;

	Dialog sipDialog;
	ServerTransaction inviteTransaction;
	ClientTransaction inviteOutTransaction;

	private static int nextInternalCallId = 0;
	public String internalCallId;
	public String to;
	public String from;
	public SkypeClient skypeClient;

	private String callId;
	private String offerSDP;
	private String answerSDP;
	private JSONObject json;


	public CallSession(String offerSDP, String callId, String from, String to, SkypeClient skypeClient, JSONObject json)
	{
		Log.info("CallSession creation " + callId);

		this.offerSDP = offerSDP;
		this.callId = callId;
		this.from = from;
		this.to = to;
		this.skypeClient = skypeClient;
		this.json = json;

		internalCallId = "CS" + String.format("%08x", nextInternalCallId++);
	}


	public void sendBye()
	{
		Log.info("sendBye");
	}

	public SessionDescription buildSDP(boolean offer)
	{
		SdpFactory sdpFactory = SdpFactory.getInstance();
		try
		{
			SessionDescription sd = null;

			if (offer)
			{
				sd = sdpFactory.createSessionDescription(offerSDP);
			}
			else
			{
				sd = sdpFactory.createSessionDescription(answerSDP);
			}

			Log.info("buildSDP " + sd);
			return sd;
		}
		catch (SdpException e)
		{
			Log.error("Error building SDP", e);
		}
		return null;
	}


	public void parseSDP(Dialog d, String sdp, boolean offer)
	{
		sipDialog = d;

		Log.info("parseSDP \n" + sdp);

		try
		{
			if (offer)
			{

			} else {	// answer

				JSONObject audioVideoInvitationLinks = json.getJSONObject("_links");

				if (audioVideoInvitationLinks.has("acceptWithAnswer"))
				{
					String acceptWithAnswerHref = audioVideoInvitationLinks.getJSONObject("acceptWithAnswer").getString("href");
					skypeClient.acceptWithAnswer(acceptWithAnswerHref, sdp);
				}
			}
		}
		catch (Exception e)
		{
			Log.error("parseSDP error", e);
		}
	}

	public void performAck()
	{
		if (sipDialog != null)
		{
			try
			{
				Log.info("performAck");
				sipDialog.sendAck(sipDialog.createAck(sipDialog.getLocalSeqNumber()));
				sipDialog = null;
			}
			catch (Exception e)
			{
				Log.error("performAck error", e);
			}
		}
	}

	public void parseInvite(Message message, Dialog d, ServerTransaction trans)
	{
		sipDialog = d;
		inviteTransaction = trans;
		parseSDP(d, new String(message.getRawContent()), true);
	}

}
