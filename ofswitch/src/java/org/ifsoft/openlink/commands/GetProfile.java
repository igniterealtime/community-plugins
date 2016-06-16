package org.ifsoft.openlink.commands;


import java.util.Arrays;
import java.util.List;
import java.util.Iterator;

import org.dom4j.Element;
import org.jivesoftware.util.Log;
import org.jivesoftware.openfire.admin.AdminManager;
import org.w3c.dom.NodeList;

import org.ifsoft.openlink.component.*;


public class GetProfile extends OpenlinkCommand {

	public GetProfile(OpenlinkComponent traderLyncComponent) {
		super(traderLyncComponent);
	}

	@Override
	protected boolean addStageInformation(SessionData data, Element newCommand,	Element oldCommand)
	{
		return false;
	}

	@Override
	public Element execute(SessionData data, Element newCommand, Element oldCommand)
	{
		try {
			String profileID = oldCommand.element("iodata").element("in").element("profile").getText();

			Element iodata = newCommand.addElement("iodata", "urn:xmpp:tmp:io-data");
			iodata.addAttribute("type","output");

			Element profile = iodata.addElement("out").addElement("profile");
			Element keypages = profile.addElement("keypages");

			OpenlinkUser traderLyncUser = this.getOpenlinkComponent().getOpenlinkProfile(profileID);

			if (traderLyncUser != null)
			{
				String userAgent = data.getOwner().getNode();

				if(!AdminManager.getInstance().isUserAdmin(userAgent, false) && !userAgent.equals(traderLyncUser.getUserId()) && !userAgent.equals(traderLyncUser.getUserNo()))
				{
					// only access request from profile device user or openlink api user

					return newCommand;
				}

				profile.addAttribute("online", "0.0.0.0".equals(traderLyncUser.getDeviceNo()) ? "false" : "true");

				this.getOpenlinkComponent().loadProfile(profileID);

			} else {

				Element note = newCommand.addElement("note");
				note.addAttribute("type", "error");
				note.setText("Profile Id not found");
			}

		} catch (Exception e) {
			Log.error("[Openlink] GetProfile execute error "	+ e.getMessage());

			Element note = newCommand.addElement("note");
			note.addAttribute("type", "error");
			note.setText("Get Profile Internal error");
		}
		return newCommand;
	}

	@Override
	protected List<Action> getActions(SessionData data) {
		return Arrays.asList(new Action[] { Action.complete });
	}

	@Override
	public String getCode() {
		return "http://xmpp.org/protocol/openlink:01:00:00#get-profile";
	}

	@Override
	public String getDefaultLabel() {
		return "Get Profile";
	}

	@Override
	protected Action getExecuteAction(SessionData data) {
		return Action.complete;
	}

	@Override
	public int getMaxStages(SessionData data) {
		return 0;
	}

}
