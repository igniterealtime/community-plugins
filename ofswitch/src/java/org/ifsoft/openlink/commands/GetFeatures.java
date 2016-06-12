package org.ifsoft.openlink.commands;

import java.util.*;

import org.dom4j.Element;
import org.jivesoftware.util.Log;
import org.w3c.dom.NodeList;

import org.ifsoft.openlink.component.*;

import org.jivesoftware.openfire.admin.AdminManager;


public class GetFeatures extends OpenlinkCommand {

	public GetFeatures(OpenlinkComponent traderLyncComponent)
	{
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

	protected boolean addStageInformation(SessionData data, Element newCommand,	Element oldCommand) {
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
		try {
			String profileID = oldCommand.element("iodata").element("in").element("profile").getText();

			OpenlinkUser traderLyncUser = this.getOpenlinkComponent().getOpenlinkProfile(profileID);

			if (!validPermissions(data, traderLyncUser.getUserId(), newCommand))
			{
				return newCommand;
			}

			Element iodata = newCommand.addElement("iodata", "urn:xmpp:tmp:io-data");
			iodata.addAttribute("type","output");

			Element out = iodata.addElement("out");
			out.addElement("profile").addAttribute("id", profileID);

			Element features = out.addElement("features", "http://xmpp.org/protocol/openlink:01:00:00/features");

			Map<String, String> speedDialTable = new HashMap<String, String>();
/*
			Iterator it = traderLyncUser.getKeypages().iterator();

			while( it.hasNext() )
			{
				OpenlinkKeypage traderLyncKeypage = (OpenlinkKeypage)it.next();

				Iterator it2 = traderLyncKeypage.getKeys().iterator();

				while( it2.hasNext() )
				{
					OpenlinkKey traderLyncKey = (OpenlinkKey)it2.next();

					if ("3".equals(traderLyncKey.getTurretFunction()))
					{
						if (!speedDialTable.containsKey(traderLyncKey.getQualifier()))
						{
							addFeature(features, "sd_" + traderLyncKey.getQualifier(), traderLyncKey.getLongLabel(), "SpeedDial");
							speedDialTable.put(traderLyncKey.getQualifier(), traderLyncKey.getLongLabel());
						}
					}
				}
			}
*/
			Iterator it = traderLyncUser.getGroups().iterator();

			while( it.hasNext() )
			{
				OpenlinkGroup traderLyncGroup = (OpenlinkGroup)it.next();
				addFeature(features, "grp-icom_" + traderLyncGroup.getGroupID(), traderLyncGroup.getName(), "GroupIntercom");
			}

			addFeature(features, "hs_1", 	"Handset 1", 	"Handset");

			if (traderLyncUser.getHandsets() > 1)
			{
				addFeature(features, "hs_2", 	"Handset 2", 	"Handset");
			}

			addFeature(features, "fwd_1", 	"Call Forward", "CallForward");
			addFeature(features, "priv_1", 	"Auto Privacy", "Privacy");



		} catch (Exception e) {
			Log.error("[Openlink] GetFeatures error " + e);

			Element note = newCommand.addElement("note");
			note.addAttribute("type", "error");
			note.setText("Get Features Internal Error");
		}
		return newCommand;
	}


	private void addFeature(Element features, String id, String label, String type)
	{
		Element feature = features.addElement("feature");
		feature.addAttribute("id",    id);
		feature.addAttribute("label", label);
		feature.addAttribute("type", type);
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
		return "http://xmpp.org/protocol/openlink:01:00:00#get-features";
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
		return "Get Features";
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
