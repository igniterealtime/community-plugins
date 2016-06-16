package org.ifsoft.openlink.calllog;


/**
 *
 */
public class CallLogger {

	private static final CallLogger callLogger = new CallLogger();

	private Appender appender = null;

	protected CallLogger() {
		this.appender = new DatabaseAppender();
	}

	/**
	 * Returns a <code>CallLogger</code> instance.
	 * @return
	 */
	public static CallLogger getLogger() {
		return callLogger;
	}

	/**
	 * Logs call details.
	 *
	 * @param tscId
	 * @param callId
	 * @param profileId
	 * @param interestId
	 * @param state
	 * @param direction
	 * @param startTimestamp
	 * @param duration
	 * @param callerName
	 * @param callerNumber
	 * @param calledName
	 * @param calledNumber
	 */
	public void logCall(String tscId, String callId, String profileId, String interestId, String state, String direction, long startTimestamp, long duration, String callerName, String callerNumber, String calledName, String calledNumber) {
		logCall(new CallLogRecord(tscId, callId, profileId, interestId, state, direction, startTimestamp, duration, new CallParty(callerName, callerNumber), new CallParty(calledName, calledNumber)));
	}

	/**
	 * Logs call details.
	 *
	 * @param callLogRecord
	 */
	public void logCall(CallLogRecord callLogRecord) {
		appender.append(callLogRecord);
	}

	/**
	 * Logs participant details.
	 *
	 * @param tscId
	 * @param callId
	 * @param jid
	 * @param direction
	 * @param type
	 * @param startTimestamp
	 * @param duration
	 */
	public void logParticipant(String tscId, String callId, String jid, String direction, String type, long startTimestamp, long duration) {
		logParticipant(new ParticipantLogRecord(tscId, callId, jid, direction, type, startTimestamp, duration));
	}

	/**
	 * Logs participant details.
	 *
	 * @param participantLogRecord
	 */
	public void logParticipant(ParticipantLogRecord participantLogRecord) {
		appender.append(participantLogRecord);
	}

}
