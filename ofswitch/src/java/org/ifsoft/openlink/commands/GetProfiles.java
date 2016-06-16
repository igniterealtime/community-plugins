package org.ifsoft.openlink.commands;


import java.util.Arrays;
import java.util.List;
import java.util.Iterator;

import org.dom4j.Element;
import org.jivesoftware.util.Log;
import org.w3c.dom.NodeList;
import org.xmpp.packet.JID;
import org.jivesoftware.openfire.admin.AdminManager;

import org.ifsoft.openlink.component.*;

public class GetProfiles extends OpenlinkCommand
{
	public GetProfiles(OpenlinkComponent traderLyncComponent) {
		super(traderLyncComponent);
	}

	/**
	 * Returns the max number of stages for this command. The number of stages
	 * may vary according to the collected data in previous stages. Therefore, a
	 * SessionData object is passed as a parameter. When the max number of
	 * stages has been reached then the command is ready to be executed.
	 *
	 * @param data
	 *            the gathered data through the command stages or <tt>null</tt>
	 *            if the command does not have stages or the requester is
	 *            requesting the execution for the first time.
	 * @return the max number of stages for this command.
	 */

	public int getMaxStages(SessionData data)
	{
		return 0;
	}

	/**
	 * Adds to the command element the data form or notes required by the
	 * current stage. The current stage is specified in the SessionData. This
	 * method will never be invoked for commands that have no stages.
	 *
	 * @param data
	 *            the gathered data through the command stages or <tt>null</tt>
	 *            if the command does not have stages or the requester is
	 *            requesting the execution for the first time.
	 * @param command
	 *            the command element to be sent to the command requester.
	 */

	protected boolean addStageInformation(SessionData data, Element newCommand,	Element oldCommand)
	{
		return true;
	}

	/**
	 * Executes the command with the specified session data.
	 *
	 * @param data
	 *            the gathered data through the command stages or <tt>null</tt>
	 *            if the command does not have stages.
	 * @param command
	 *            the command element to be sent to the command requester with a
	 *            reported data result or note element with the answer of the
	 *            execution.
	 */

	public Element execute(SessionData data, Element newCommand,Element oldCommand)
	{
		JID userJID = null;

		try {
			userJID = new JID(oldCommand.element("iodata").element("in").element("jid").getText());

		} catch (Exception e) {

			Element note = newCommand.addElement("note");
			note.addAttribute("type", "error");
			note.setText("Get Profiles - Invalid JID");

			return newCommand;
		}


		try {
			int profilesCount = 0;

			String userAgent = data.getOwner().getNode();

			if (!validPermissions(data, userJID.getNode(), newCommand))
			{
				return newCommand;
			}

			Element iodata = newCommand.addElement("iodata", "urn:xmpp:tmp:io-data");
			iodata.addAttribute("type","output");

			Element profiles = iodata.addElement("out").addElement("profiles", "http://xmpp.org/protocol/openlink:01:00:00/profiles");

			List<OpenlinkUser> traderLyncUsers = this.getOpenlinkComponent().getOpenlinkProfiles(userJID);
			Iterator it = traderLyncUsers.iterator();

			while( it.hasNext() )
			{
				OpenlinkUser traderLyncUser = (OpenlinkUser)it.next();

				String profileID = traderLyncUser.getUserNo();

				try {
					//this.getOpenlinkComponent().getSkype4BUser(profileID);

				} catch (Exception e)  {}

				Element genericProfile = profiles.addElement("profile");
				genericProfile.addAttribute("id", profileID);
				genericProfile.addAttribute("label", traderLyncUser.getUserName());
				genericProfile.addAttribute("default", traderLyncUser.getDefault());
				genericProfile.addAttribute("online", "0.0.0.0".equals(traderLyncUser.getDeviceNo()) ? "false" : "true");

				Element genericActions = genericProfile.addElement("actions");

				genericActions.addElement("action").addAttribute("id","AnswerCall").addAttribute("label",  			"Answer a ringing call");
				genericActions.addElement("action").addAttribute("id","ClearConnection").addAttribute("label",  	"Clear this participant connection from active call or conference");
				genericActions.addElement("action").addAttribute("id","ClearCall").addAttribute("label",   			"Clear a connected a conference call, dropping all participants");
				genericActions.addElement("action").addAttribute("id","HoldCall").addAttribute("label",    			"Place a call on hold");
				genericActions.addElement("action").addAttribute("id","RetrieveCall").addAttribute("label", 		"Re-connect a held call");
				genericActions.addElement("action").addAttribute("id","JoinCall").addAttribute("label",    			"Join a connected or conferenced call");
				genericActions.addElement("action").addAttribute("id","ConsultationCall").addAttribute("label",		"Starts a two step transfer of active call to another party");
				genericActions.addElement("action").addAttribute("id","TransferCall").addAttribute("label",			"Completes an active two step transfer");
				genericActions.addElement("action").addAttribute("id","IntercomTransfer").addAttribute("label",		"Perform a transfer internally using Openlink Intercom on active call");
				genericActions.addElement("action").addAttribute("id","SingleStepTransfer").addAttribute("label",	"Perform a transfer in a single unattended step on active call");
				genericActions.addElement("action").addAttribute("id","SendDigtraderLync").addAttribute("label",		"Send dial digits on selected line");
				genericActions.addElement("action").addAttribute("id","SendDigit").addAttribute("label",			"Send DTMF tone to active call");
				genericActions.addElement("action").addAttribute("id","ConferenceCall").addAttribute("label",		"Adds the active call to a local conference bridge");
				genericActions.addElement("action").addAttribute("id","ClearConference").addAttribute("label",		"Clears the local conference bridge");
				genericActions.addElement("action").addAttribute("id","PrivateCall").addAttribute("label",			"Makes the active call private. Other users cannot join");
				genericActions.addElement("action").addAttribute("id","PublicCall").addAttribute("label",			"Makes the active private call public for other users to join");
/*
				if (this.getOpenlinkComponent().traderLyncLinkService.isCallbackAvailable())
				{
					genericActions.addElement("action").addAttribute("id","AddThirdParty").addAttribute("label",	"Add a third party to an active call");
					genericActions.addElement("action").addAttribute("id","RemoveThirdParty").addAttribute("label",	"Remove a third party from an active call");

					if (this.getOpenlinkComponent().traderLyncVmsService.isTelephonyServerConnected())
					{
						genericActions.addElement("action").addAttribute("id","StartVoiceDrop").addAttribute("label","Starts playing a pre-recorded voice message into the active call");
						genericActions.addElement("action").addAttribute("id","StopVoiceDrop").addAttribute("label", "Stops playing a pre-recorded voice message into the active call");
					}
				}
*/
				profilesCount++;
			}

			if (profilesCount == 0)
			{
				Element note = newCommand.addElement("note");
				note.addAttribute("type", "error");
				note.setText(userJID + " has no provisioned profiles");
			}


		} catch (Exception e) {
			Log.error("[Openlink] GetProfiles execute error " + e);

			Element note = newCommand.addElement("note");
			note.addAttribute("type", "error");
			note.setText("Get Profiles Internal error");
		}
		return newCommand;
	}

	/**
	 * Returns a collection with the allowed actions based on the current stage
	 * as defined in the SessionData. Possible actions are: <tt>prev</tt>,
	 * <tt>next</tt> and <tt>complete</tt>. This method will never be
	 * invoked for commands that have no stages.
	 *
	 * @param data
	 *            the gathered data through the command stages or <tt>null</tt>
	 *            if the command does not have stages or the requester is
	 *            requesting the execution for the first time.
	 * @return a collection with the allowed actions based on the current stage
	 *         as defined in the SessionData.
	 */

	protected List getActions(SessionData data)
	{
		return Arrays.asList(new Action[] { Action.complete });
	}

	/**
	 * Returns the unique identifier for this command for the containing JID.
	 * The code will be used as the node in the disco#items or the node when
	 * executing the command.
	 *
	 * @return the unique identifier for this command for the containing JID.
	 */

	public String getCode() {
		return "http://xmpp.org/protocol/openlink:01:00:00#get-profiles";
	}

	/**
	 * Returns the default label used for describing this commmand. This
	 * information is usually used when returning commands as disco#items.
	 * Admins can later use {@link #setLabel(String)} to set a new label and
	 * reset to the default value at any time.
	 *
	 * @return the default label used for describing this commmand.
	 */

	public String getDefaultLabel() {
		return "Get Profiles";
	}

	/**
	 * Returns which of the actions available for the current stage is
	 * considered the equivalent to "execute". When the requester sends his
	 * reply, if no action was defined in the command then the action will be
	 * assumed "execute" thus assuming the action returned by this method. This
	 * method will never be invoked for commands that have no stages.
	 *
	 * @param data
	 *            the gathered data through the command stages or <tt>null</tt>
	 *            if the command does not have stages or the requester is
	 *            requesting the execution for the first time.
	 * @return which of the actions available for the current stage is
	 *         considered the equivalent to "execute".
	 */

	protected Action getExecuteAction(SessionData data) {
		return Action.complete;
	}

}
