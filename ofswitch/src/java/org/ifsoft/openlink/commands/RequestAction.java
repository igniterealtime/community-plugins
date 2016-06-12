package org.ifsoft.openlink.commands;

import java.util.Arrays;
import java.util.List;
import java.util.Iterator;

import org.dom4j.Element;
import org.jivesoftware.util.Log;
import org.w3c.dom.NodeList;
import org.xmpp.packet.JID;

import org.ifsoft.openlink.component.*;


public class RequestAction extends OpenlinkCommand {

	public RequestAction(OpenlinkComponent traderLyncComponent)
	{
		super(traderLyncComponent);
	}

	@Override protected boolean addStageInformation(SessionData data, Element newCommand, Element oldCommand)
	{
		return false;
	}

	@Override public Element execute(SessionData data, Element newCommand, Element oldCommand)
	{
		try {
			Element in = oldCommand.element("iodata").element("in");
			String userInterest = in.element("interest").getText();
			String userAction = in.element("action").getText();
			String callID = in.element("call").getText();
			String value1 = null;

			if (in.element("value1") != null)
			{
				value1 = in.element("value1").getText();
			}

			OpenlinkUserInterest traderLyncUserInterest = this.getOpenlinkComponent().getOpenlinkInterest(userInterest);

			if (traderLyncUserInterest != null)
			{
				if (!validPermissions(data, traderLyncUserInterest.getUser().getUserId(), newCommand))
				{
					return newCommand;
				}

				this.getOpenlinkComponent().processUserAction(newCommand, userInterest, userAction, callID, value1);

			} else {

				Element note = newCommand.addElement("note");
				note.addAttribute("type", "error");
				note.setText("Request Action - Interest not found");
			}

		} catch (Exception e) {
			Log.error("[Openlink]Request Action error " + e);

			Element note = newCommand.addElement("note");
			note.addAttribute("type", "error");
			note.setText("Request Action - Internal Error");
		}
		return newCommand;
	}

	@Override protected List<Action> getActions(SessionData data)
	{
		return Arrays.asList(new Action[] { Action.complete });
	}

	@Override public String getCode()
	{
		return "http://xmpp.org/protocol/openlink:01:00:00#request-action";
	}

	@Override public String getDefaultLabel()
	{
		return "Request Action";
	}

	@Override protected Action getExecuteAction(SessionData data)
	{
		return Action.complete;
	}

	@Override public int getMaxStages(SessionData data)
	{
		return 0;
	}

}
