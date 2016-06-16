package org.ifsoft.openlink.commands;

import java.util.Arrays;
import java.util.List;
import java.util.Iterator;

import org.dom4j.Element;
import org.jivesoftware.util.Log;
import org.w3c.dom.NodeList;
import org.xmpp.packet.JID;

import org.ifsoft.openlink.component.*;

public class IntercomCall extends OpenlinkCommand {

	// private OpenlinkComponent traderLyncComponent;

	public IntercomCall(OpenlinkComponent traderLyncComponent) {
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
			Element in = oldCommand.element("iodata").element("in");
			String profileID = oldCommand.element("iodata").element("in").element("profile").getText();

			OpenlinkUser traderLyncUser = this.getOpenlinkComponent().getOpenlinkProfile(profileID);

			if (!validPermissions(data, traderLyncUser.getUserId(), newCommand))
			{
				return newCommand;
			}

			JID toJID = new JID(in.element("destination").getText());

			String errorMessage = null;
			String groupIntercom = null;

			if (in.element("features") != null)
			{
				for ( Iterator i = in.element("features").elementIterator( "feature" ); i.hasNext(); )
				{
					Element feature = (Element) i.next();
					String featureId = feature.element("id").getText();
					String featureValue = feature.element("value1").getText();
					int pos = featureId.indexOf("_");

					if (pos > - 1)
					{
						String featureType = featureId.substring(0, pos);

						if ("grp-icom".equals(featureType))	// group intercom
						{
							groupIntercom = featureId.substring(pos + 1);
						}
					}
				}
			}

			errorMessage = this.getOpenlinkComponent().intercomCall(newCommand, profileID, toJID, groupIntercom);

			if (errorMessage != null)
			{
				Element note = newCommand.addElement("note");
				note.addAttribute("type", "error");
				note.setText("IntercomCall Error " + errorMessage);
			}

		} catch (Exception e) {
			Log.error("[Openlink] IntercomCall stage 0 error " + e);
			Element note = newCommand.addElement("note");
			note.addAttribute("type", "error");
			note.setText("IntercomCall Internal Error");
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
		return "http://xmpp.org/protocol/openlink:01:00:00#make-intercom-call";
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
