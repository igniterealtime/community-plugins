package org.ifsoft.openlink.calllog;


/**
 *
 */
public class CallLogRecord implements LogRecord {

	private String tscId = null;
	private String callId = null;
	private String profileId = null;
	private String interestId = null;
	private String state = null;
	private String direction = null;
	private long startTimestamp = 0;
	private long duration = 0;
	private CallParty caller = null;
	private CallParty called = null;

	public CallLogRecord() {

	}

	public CallLogRecord(String tscId, String callId, String profileId, String interestId, String state, String direction, long startTimestamp, long duration, CallParty caller, CallParty called) {
		this.tscId = tscId;
		this.callId = callId;
		this.profileId = profileId;
		this.interestId = interestId;
		this.state = state;
		this.direction = direction;
		this.startTimestamp = startTimestamp;
		this.duration = duration;
		this.caller = caller;
		this.called = called;
	}

	public String getTscId() {
		return tscId;
	}

	public void setTscId(String tscId) {
		this.tscId = tscId;
	}

	/**
	 * @return
	 */
	public String getCallId() {
		return callId;
	}

	/**
	 * @param callId
	 */
	public void setCallId(String callId) {
		this.callId = callId;
	}

	/**
	 * @return
	 */
	public String getProfileId() {
		return profileId;
	}

	/**
	 * @param profileId
	 */
	public void setProfileId(String profileId) {
		this.profileId = profileId;
	}

	/**
	 * @return
	 */
	public String getInterestId() {
		return interestId;
	}

	/**
	 * @param interestId
	 */
	public void setInterestId(String interestId) {
		this.interestId = interestId;
	}

	/**
	 * @return
	 */
	public String getState() {
		return state;
	}

	/**
	 * @param state
	 */
	public void setState(String state) {
		this.state = state;
	}

	/**
	 * @return
	 */
	public String getDirection() {
		return direction;
	}

	/**
	 * @param direction
	 */
	public void setDirection(String direction) {
		this.direction = direction;
	}

	/**
	 * @return
	 */
	public long getStartTimestamp() {
		return startTimestamp;
	}

	/**
	 * @param startTimestamp
	 */
	public void setStartTimestamp(long startTimestamp) {
		this.startTimestamp = startTimestamp;
	}

	/**
	 * @return
	 */
	public long getDuration() {
		return duration;
	}

	/**
	 * @param duration
	 */
	public void setDuration(long duration) {
		this.duration = duration;
	}

	/**
	 * @return
	 */
	public CallParty getCaller() {
		return caller;
	}

	/**
	 * @param caller
	 */
	public void setCaller(CallParty caller) {
		this.caller = caller;
	}

	/**
	 * @return
	 */
	public CallParty getCalled() {
		return called;
	}

	/**
	 * @param called
	 */
	public void setCalled(CallParty called) {
		this.called = called;
	}

	public String toString() {
		return ("{"
				+ tscId + ","
				+ callId + "}");
	}
}
