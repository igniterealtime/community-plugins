package org.ifsoft.openlink.commands;

import org.slf4j.*;
import org.slf4j.Logger;

import java.util.Enumeration;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Vector;
import java.util.concurrent.ConcurrentHashMap;

import org.dom4j.Element;
import org.jivesoftware.openfire.admin.AdminManager;
import org.jivesoftware.util.Log;
import org.xmpp.packet.IQ;
import org.xmpp.packet.JID;
import org.xmpp.packet.Message;
import org.xmpp.packet.IQ.Type;

import org.ifsoft.openlink.component.*;

/**
 * An Openlink command is a stateless object responsbile for executing the
 * provided service. Each subclass will only have one instance that will be
 * shared across all users sessions. Therefore, it is important to not keep any
 * information related to executions as permanent data (i.e. as instance or
 * static variables). Each command has a <tt>code</tt> that should be unique
 * within a given JID.
 * <p>
 *
 * Commands may have zero or more stages. Each stage is usually used for
 * gathering information required for the command execution. Users are able to
 * move forward or backward across the different stages. Commands may not be
 * cancelled while they are beig executed. However, users may request the
 * "cancel" action when submiting a stage response indicating that the command
 * execution should be aborted. Thus, releasing any collected information.
 * Commands that require user interaction (i.e. have more than one stage) will
 * have to provide the data forms the user must complete in each stage and the
 * allowed actions the user might perform during each stage (e.g. go to the
 * previous stage or go to the next stage).
 *
 */
public abstract class OpenlinkCommand {

    private static final Logger Log = LoggerFactory.getLogger(OpenlinkCommand.class);

	private String label = getDefaultLabel();
	protected OpenlinkComponent traderLyncComponent;
	protected OpenlinkCommandManager manager = new OpenlinkCommandManager();
	public static Map<String, OpenlinkFeatures> featureMap = null;

	public Map<String, OpenlinkFeatures> getFeatureMap()
	{
		if (featureMap == null) {
			featureMap = new ConcurrentHashMap<String, OpenlinkFeatures>();
		}
		return featureMap;
	}

	public OpenlinkCommand(OpenlinkComponent traderLyncComponent) {
		this.traderLyncComponent = traderLyncComponent;

	}

	public OpenlinkComponent getOpenlinkComponent() {
		return traderLyncComponent;
	}

	public String getLabel() {
		return label;
	}

	public void setLabel(String label) {
		this.label = label;
	}


	public boolean validPermissions(SessionData data, String endUser, Element newCommand)
	{
		String userAgent = data.getOwner().getNode();

		if (!AdminManager.getInstance().isUserAdmin(userAgent, false) && !userAgent.equals(endUser))
		{
			Element note = newCommand.addElement("note");
			note.addAttribute("type", "error");
			note.setText("Access denied");

			return false;

		} else return true;
	}

	/**
	 * Returns true if the requester is allowed to execute this command. By
	 * default only admins are allowed to execute commands. Subclasses may
	 * redefine this method with any specific logic.
	 * <p>
	 *
	 * Note: The bare JID of the requester will be compared with the bare JID of
	 * the admins.
	 *
	 * @param requester
	 *            the JID of the user requesting to execute this command.
	 * @return true if the requester is allowed to execute this command.
	 */
	public boolean hasPermission(JID requester) {
		return true; //(AdminManager.getInstance().isUserAdmin(requester.getNode(), false) || ! getOpenlinkComponent().getOpenlinkProfiles(requester).isEmpty());
	}

	/**
	 * Returns the unique identifier for this command for the containing JID.
	 * The code will be used as the node in the disco#items or the node when
	 * executing the command.
	 *
	 * @return the unique identifier for this command for the containing JID.
	 */
	public abstract String getCode();

	/**
	 * Returns the default label used for describing this commmand. This
	 * information is usually used when returning commands as disco#items.
	 * Admins can later use {@link #setLabel(String)} to set a new label and
	 * reset to the default value at any time.
	 *
	 * @return the default label used for describing this commmand.
	 */
	public abstract String getDefaultLabel();

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
	public abstract int getMaxStages(SessionData data);

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
	public abstract Element execute(SessionData data, Element newCommand, Element oldCommand);
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
	protected abstract boolean addStageInformation(SessionData data,
			Element newCommand, Element oldCommand);

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
	protected abstract List<Action> getActions(SessionData data);

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
	protected abstract Action getExecuteAction(SessionData data);

	/**
	 * Increments the stage number by one and adds to the command element the
	 * new data form and new allowed actions that the user might perform.
	 *
	 * @param data
	 *            the gathered data through the command stages.
	 * @param command
	 *            the command element to be sent to the command requester.
	 */
	public boolean addNextStageInformation(SessionData data,
			Element newCommand, Element oldCommand) {
		// Increment the stage number to the next stage

		data.setStage(data.getStage() + 1);

		// Return the data form of the current stage to the command requester.
		// The
		// requester will need to specify the action to follow (e.g. execute,
		// prev,
		// cancel, etc.) and complete the form is going "forward"

		boolean proceed = addStageInformation(data, newCommand, oldCommand);
		if (proceed)
			addStageActions(data, newCommand, oldCommand);
		return proceed;
	}

	/**
	 * Decrements the stage number by one and adds to the command the data form
	 * and allowed actions that the user might perform of the previous stage.
	 *
	 * @param data
	 *            the gathered data through the command stages.
	 * @param command
	 *            the command element to be sent to the command requester.
	 */
	public boolean addPreviousStageInformation(SessionData data,
			Element newCommand, Element oldCommand) {
		// Decrement the stage number to the previous stage

		data.setStage(data.getStage() - 1);

		// Return the data form of the current stage to the command requester.
		// The
		// requester will need to specify the action to follow (e.g. execute,
		// prev,
		// cancel, etc.) and complete the form is going "forward"

		boolean proceed = addStageInformation(data, newCommand, oldCommand);
		if (proceed)
			addStageActions(data, newCommand, oldCommand);
		return proceed;
	}

	/**
	 * Adds the allowed actions to follow from the current stage. Possible
	 * actions are: <tt>prev</tt>, <tt>next</tt> and <tt>complete</tt>.
	 *
	 * @param data
	 *            the gathered data through the command stages or <tt>null</tt>
	 *            if the command does not have stages or the requester is
	 *            requesting the execution for the first time.
	 * @param command
	 *            the command element to be sent to the command requester.
	 */
	protected void addStageActions(SessionData data, Element newCommand,
			Element oldCommand) {
		// Add allowed actions to the response
		Element actions = newCommand.addElement("actions");
		List<Action> validActions = getActions(data);
		for (OpenlinkCommand.Action action : validActions) {
			actions.addElement(action.name());
		}
		Action executeAction = getExecuteAction(data);
		// Add default execute action to the response
		actions.addAttribute("execute", executeAction.name());

		// Store the allowed actions that the user can follow from this stage
		data.setAllowedActions(validActions);
		// Store the default execute action to follow if the user does not
		// specify an
		// action in his command
		data.setExecuteAction(executeAction);
	}

	public enum Status {

		/**
		 * The command is being executed.
		 */
		executing,

		/**
		 * The command has completed. The command session has ended.
		 */
		completed,

		/**
		 * The command has been canceled. The command session has ended.
		 */
		canceled
	}

	public enum Action {

		/**
		 * The command should be executed or continue to be executed. This is
		 * the default value.
		 */
		execute,

		/**
		 * The command should be canceled.
		 */
		cancel,

		/**
		 * The command should be digress to the previous stage of execution.
		 */
		prev,

		/**
		 * The command should progress to the next stage of execution.
		 */
		next,

		/**
		 * The command should be completed (if possible).
		 */
		complete
	}
}
