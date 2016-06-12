package org.ifsoft.openlink.commands;


import java.util.Arrays;
import java.util.List;
import java.util.Iterator;

import org.dom4j.Element;
import org.jivesoftware.util.Log;
import org.w3c.dom.NodeList;

import org.ifsoft.openlink.component.*;

public class SetFeature extends OpenlinkCommand
{
	public SetFeature(OpenlinkComponent traderLyncComponent)
	{
		super(traderLyncComponent);
	}


	/**
	 * Returns the max number of stages for this command. The number of stages may vary according
	 * to the collected data in previous stages. Therefore, a SessionData object is passed as a
	 * parameter. When the max number of stages has been reached then the command is ready to
	 * be executed.
	 *
	 * @param data the gathered data through the command stages or <tt>null</tt> if the
	 *        command does not have stages or the requester is requesting the execution for the
	 *        first time.
	 * @return the max number of stages for this command.
	 */


	public int getMaxStages(SessionData data)
	{
		return 0;
	}



	/**
	 * Adds to the command element the data form or notes required by the current stage. The
	 * current stage is specified in the SessionData. This method will never be invoked for
	 * commands that have no stages.
	 *
	 * @param data the gathered data through the command stages or <tt>null</tt> if the
	 *        command does not have stages or the requester is requesting the execution for the
	 *        first time.
	 * @param command the command element to be sent to the command requester.
	 */

	protected boolean addStageInformation(SessionData data, Element newCommand, Element oldCommand)
	{
		return false;
	}


	/**
	 * Executes the command with the specified session data.
	 *
	 * @param data the gathered data through the command stages or <tt>null</tt> if the
	 *        command does not have stages.
	 * @param command the command element to be sent to the command requester with a reported
	 *        data result or note element with the answer of the execution.
	 */

	public Element execute(SessionData data, Element newCommand, Element oldCommand)
	{
		try {
			Element in = oldCommand.element("iodata").element("in");
			String profileID = in.element("profile").getText();
			String featureID = in.element("feature").getText();
			String value1 = in.element("value1").getText();
			String value2 = null;

			if (in.element("value2") != null)
				value2 = in.element("value2").getText();

			OpenlinkUser traderLyncUser = this.getOpenlinkComponent().getOpenlinkProfile(profileID);

			if (!validPermissions(data, traderLyncUser.getUserId(), newCommand))
			{
				return newCommand;
			}

			String errorMessage = this.getOpenlinkComponent().setFeature(newCommand, profileID, featureID, value1, value2);

			if (errorMessage != null)
			{
				Element note = newCommand.addElement("note");
				note.addAttribute("type", "error");
				note.setText("SetFeature Error " + errorMessage);
			}

		}catch(Exception e)
		{
			Log.error("[OpenlinkOpenlink] SetFeature execute error " + e);

			Element note = newCommand.addElement("note");
			note.addAttribute("type", "error");
			note.setText("Set Feature Internal error");
		}
		return newCommand;
	}//end execute

	/**
	 * Returns a collection with the allowed actions based on the current stage as defined
	 * in the SessionData. Possible actions are: <tt>prev</tt>, <tt>next</tt> and <tt>complete</tt>.
	 * This method will never be invoked for commands that have no stages.
	 *
	 * @param data the gathered data through the command stages or <tt>null</tt> if the
	 *        command does not have stages or the requester is requesting the execution for the
	 *        first time.
	 * @return a collection with the allowed actions based on the current stage as defined
	 *         in the SessionData.
	 */

	protected List getActions(SessionData data)
	{
		return Arrays.asList(new Action[] {Action.complete});
	}



	/**
	 * Returns the unique identifier for this command for the containing JID. The code will
	 * be used as the node in the disco#items or the node when executing the command.
	 *
	 * @return the unique identifier for this command for the containing JID.
	 */

	public String getCode()
	{
		return "http://xmpp.org/protocol/openlink:01:00:00#set-features";
	}




	/**
	 * Returns the default label used for describing this commmand. This information is usually
	 * used when returning commands as disco#items. Admins can later use {@link #setLabel(String)}
	 * to set a new label and reset to the default value at any time.
	 *
	 * @return the default label used for describing this commmand.
	 */

	public String getDefaultLabel()
	{
		return "Set Feature";
	}




	/**
	 * Returns which of the actions available for the current stage is considered the equivalent
	 * to "execute". When the requester sends his reply, if no action was defined in the command
	 * then the action will be assumed "execute" thus assuming the action returned by this
	 * method. This method will never be invoked for commands that have no stages.
	 *
	 * @param data the gathered data through the command stages or <tt>null</tt> if the
	 *        command does not have stages or the requester is requesting the execution for the
	 *        first time.
	 * @return which of the actions available for the current stage is considered the equivalent
	 *         to "execute".
	 */


	protected Action getExecuteAction(SessionData data)
	{
		return Action.complete;
	}

}
