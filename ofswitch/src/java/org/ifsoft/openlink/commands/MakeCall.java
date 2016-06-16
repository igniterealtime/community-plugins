package org.ifsoft.openlink.commands;

import org.jivesoftware.openfire.user.*;
import org.jivesoftware.openfire.XMPPServer;

import java.util.Arrays;
import java.util.List;
import java.util.Iterator;

import org.dom4j.Element;
import org.jivesoftware.util.Log;
import org.w3c.dom.NodeList;
import org.xmpp.packet.JID;

import org.ifsoft.openlink.component.*;

public class MakeCall extends OpenlinkCommand {

	// private OpenlinkComponent traderLyncComponent;

	public MakeCall(OpenlinkComponent traderLyncComponent) {
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

	public int getMaxStages(SessionData data) {
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

	protected boolean addStageInformation(SessionData data, Element newCommand,
			Element oldCommand) {
		return false;
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

	public Element execute(SessionData data, Element newCommand, Element oldCommand)
	{
		try {
			Log.info("[traderLync] Make Call execution");
			Element in = oldCommand.element("iodata").element("in");
			JID userJID = null;

			try {

				userJID = new JID(in.element("jid").getText());

			} catch (Exception e) {

				Element note = newCommand.addElement("note");
				note.addAttribute("type", "error");
				note.setText("MakeCall Error - Invalid JID");

				return newCommand;
			}

			if (!validPermissions(data, userJID.getNode(), newCommand))
			{
				return newCommand;
			}

			String userInterest = null;
			String destination = null;
			String speedDial = null;
			String authToken = null;
			String handset = null;
			String featureId  = null;
			String featureValue  = null;
			String privacy = null;
			String autoHold = null;

			String errorMessage = null;
			String warnMessage = null;

			if (in.element("interest") != null)
			{
				userInterest = in.element("interest").getText();

				if (!"".equals(userInterest))
				{
					OpenlinkUserInterest traderLyncUserInterest = this.getOpenlinkComponent().getOpenlinkInterest(userInterest);

					if (traderLyncUserInterest != null)
					{
						if (!validPermissions(data, traderLyncUserInterest.getUser().getUserId(), newCommand))
						{
							return newCommand;
						}

						if (!userJID.getNode().equals(traderLyncUserInterest.getUser().getUserId()))
						{
							errorMessage = "Interest is not provisioned for this user";
						}

					} else errorMessage = "Interest not found";
				}

				if (errorMessage != null)
				{
					Element note = newCommand.addElement("note");
					note.addAttribute("type", "error");
					note.setText("MakeCall Error - " + errorMessage);
					return newCommand;
				}

			}

			if (in.element("destination") != null)
				destination = in.element("destination").getText();

			if (in.element("features") != null)
			{
				for ( Iterator i = in.element("features").elementIterator( "feature" ); i.hasNext(); )
				{
					Element feature = (Element) i.next();
					if (feature.element("id") != null)
					featureId = feature.element("id").getText();

					if (feature.element("value1") != null)
					featureValue = feature.element("value1").getText();

					int pos = featureId.indexOf("_");

					if (pos > - 1)
					{
						String featureType = featureId.substring(0, pos);

						if ("token".equals(featureType))
						{
							authToken = featureId.substring(pos + 1);

							try {
								UserManager userManager = XMPPServer.getInstance().getUserManager();
								User xmppUser = userManager.getUser(userJID.getNode());
								xmppUser.getProperties().put("ucwa.token", authToken);

							} catch (Exception e) {
								errorMessage = "Authentication token cannot be set";
							}

						} else

						if ("sd".equals(featureType))	// speed dial
						{
							speedDial = featureId.substring(pos + 1);

							//if (!this.getOpenlinkComponent().traderLyncLdapService.speedDialTable.containsKey(speedDial))
							//	errorMessage = "Speed dial not found";
						} else

						if ("hs".equals(featureType))	// handset
						{
							handset = featureId.substring(pos + 1);

							if (!"1".equals(handset) && !"2".equals(handset))
								errorMessage = "Handset must be 1 or 2";

							if (!this.getOpenlinkComponent().validateTrueFalse(featureValue))
								errorMessage = "Handset must be true or false";

							handset = ("1".equals(handset) && "true".equals(featureValue.toLowerCase())) || ("2".equals(handset) && "false".equals(featureValue.toLowerCase()))  ? "1" : "2";

						} else

						if ("priv".equals(featureType))	// privacy
						{
							privacy = featureValue;

							if (!this.getOpenlinkComponent().validateTrueFalse(privacy))
								errorMessage = "Privacy must be true or false";

						} else

						if ("hold".equals(featureType))	// auto-hold
						{
							autoHold = featureValue;

							if (!this.getOpenlinkComponent().validateTrueFalse(autoHold))
								errorMessage = "Autohold must be true or false";

						} else warnMessage = "Feature Id is unknown";

					} else warnMessage = "Feature Id is unknown";
				}
			}

			if (errorMessage == null)
			{
				String dialDigits = destination; // we assume destination is dial digits

				if (speedDial != null && !"".equals(speedDial))			// if we have speed dial, we use that instead
				{
					//OpenlinkSpeedDial traderLyncSpeedDial = this.getOpenlinkComponent().traderLyncLdapService.speedDialTable.get(speedDial);
					//dialDigits = traderLyncSpeedDial.getDialableNumber();
				}

				if (userInterest == null || "".equals(userInterest))		// no interest use defaults
				{
					errorMessage = this.getOpenlinkComponent().makeCallDefault(newCommand, userJID, handset, privacy, autoHold, dialDigits);

				} else {

					errorMessage = this.getOpenlinkComponent().makeCall(newCommand, userInterest, handset, privacy, autoHold, dialDigits);
				}
			}

			if (errorMessage != null)
			{
				Element note = newCommand.addElement("note");
				note.addAttribute("type", "error");
				note.setText("MakeCall Error - " + errorMessage);

			} else if (warnMessage != null) {

				Element note = newCommand.addElement("note");
				note.addAttribute("type", "warn");
				note.setText("MakeCall Warn - " + warnMessage);
			}

		} catch (Exception e) {
			Log.error("[Openlink] MakeCall error " + e);
			Element note = newCommand.addElement("note");
			note.addAttribute("type", "error");
			note.setText("Make Call Internal error");
		}
		Log.info("[traderLync] Make Call execution"+newCommand);
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

	protected List<Action> getActions(SessionData data) {
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
		return "http://xmpp.org/protocol/openlink:01:00:00#make-call";
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
		return "Make Call";
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
		return Action.next;
	}

}