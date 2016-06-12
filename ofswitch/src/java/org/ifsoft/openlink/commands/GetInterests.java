package org.ifsoft.openlink.commands;


import java.util.Arrays;
import java.util.List;
import java.util.Iterator;

import org.dom4j.Element;
import org.jivesoftware.util.Log;
import org.w3c.dom.NodeList;
import org.ifsoft.openlink.component.*;
import org.jivesoftware.openfire.admin.AdminManager;


public class GetInterests extends OpenlinkCommand {

	public GetInterests(OpenlinkComponent traderLyncComponent) {
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
	 * @return
	 */

	public Element execute(SessionData data, Element newCommand, Element oldCommand)
	{
		try {
			String profileID = oldCommand.element("iodata").element("in").element("profile").getText();

			Element iodata = newCommand.addElement("iodata", "urn:xmpp:tmp:io-data");
			iodata.addAttribute("type","output");

			Element interests = iodata.addElement("out").addElement("interests", "http://xmpp.org/protocol/openlink:01:00:00/interests");

			OpenlinkUser traderLyncUser = this.getOpenlinkComponent().getOpenlinkProfile(profileID);

			if (traderLyncUser != null)
			{
				if (!validPermissions(data, traderLyncUser.getUserId(), newCommand))
				{
					return newCommand;
				}

				Iterator it = traderLyncUser.getInterests().values().iterator();

				while( it.hasNext() )
				{
					OpenlinkInterest traderLyncInterest = (OpenlinkInterest)it.next();
					String interestID = traderLyncInterest.getInterestId() + traderLyncUser.getUserNo();
					String interestType = "L".equals(traderLyncInterest.getInterestType()) ?  "DirectLine"  : "DirectoryNumber";
					Element interest = interests.addElement("interest");
					interest.addAttribute("id", interestID);
					interest.addAttribute("label", traderLyncInterest.getInterestLabel());
					interest.addAttribute("type", interestType);

					if (traderLyncInterest.getUserInterests().containsKey(traderLyncUser.getUserNo()))
					{
						OpenlinkUserInterest traderLyncUserInterest = traderLyncInterest.getUserInterests().get(traderLyncUser.getUserNo());
						interest.addAttribute("default", traderLyncUserInterest.getDefault());
						Iterator it2 = traderLyncUserInterest.getCalls().values().iterator();

						if ("true".equals(traderLyncUserInterest.getCallFWD()))
						{
							interest.addAttribute("fwd", traderLyncUserInterest.getCallFWDDigits());
						}

						if (traderLyncUserInterest.getCalls().size() > 0)
						{
							Element calls = interest.addElement("callstatus", "http://xmpp.org/protocol/openlink:01:00:00#call-status");

							boolean busy = traderLyncUserInterest.getBusyStatus();
							calls.addAttribute("busy", busy ? "true" : "false");

							while( it2.hasNext() )
							{
								OpenlinkCall traderLyncCall = (OpenlinkCall)it2.next();

								Element call = calls.addElement("call");
								//this.getOpenlinkComponent().traderLyncLinkService.addOpenlinkCallEvents(traderLyncInterest, traderLyncUserInterest, call, traderLyncCall);
							}
						}
					}
				}

			} else {

				Element note = newCommand.addElement("note");
				note.addAttribute("type", "error");
				note.setText("Profile Id not found");
			}
		} catch (Exception e) {
			Log.error("[Openlink] GetInterests execute error " + e);

			Element note = newCommand.addElement("note");
			note.addAttribute("type", "error");
			note.setText("Get Interests Internal error");
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

	protected List getActions(SessionData data) {
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
		return "http://xmpp.org/protocol/openlink:01:00:00#get-interests";
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
		return "Get Interests";
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
