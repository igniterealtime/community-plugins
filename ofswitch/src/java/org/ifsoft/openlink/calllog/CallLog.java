package org.ifsoft.openlink.calllog;

import java.sql.Timestamp;

public class CallLog {

	private String tscId = null;
	private String callId = null;
	private String profileId = null;
	private String interestId = null;
	private String state = null;
	private String direction = null;
	private Timestamp startTimestamp = null;
	private long duration = 0;
	private String callerNumber = null;
	private String callerName = null;
	private String calledNumber = null;
	private String calledName = null;
	private ParticipantLog participantLog = null;

	public CallLog() {

	}

	public ParticipantLog getParticipantLog() {
		return participantLog;
	}

	public void setParticipantLog(ParticipantLog participantLog) {
		this.participantLog = participantLog;
	}

	public String getTscId() {
		return tscId;
	}

	public void setTscId(String tscId) {
		this.tscId = tscId;
	}

	public String getCallId() {
		return callId;
	}

	public void setCallId(String callId) {
		this.callId = callId;
	}

	public String getProfileId() {
		return profileId;
	}


	public void setProfileId(String profileId) {
		this.profileId = profileId;
	}


	public String getInterestId() {
		return interestId;
	}


	public void setInterestId(String interestId) {
		this.interestId = interestId;
	}


	public String getState() {
		return state;
	}

	public void setState(String state) {
		this.state = state;
	}


	public String getDirection() {
		return direction;
	}


	public void setDirection(String direction) {
		this.direction = direction;
	}


	public Timestamp getStartTimestamp() {
		return startTimestamp;
	}


	public void setStartTimestamp(Timestamp startTimestamp) {
		this.startTimestamp = startTimestamp;
	}


	public long getDuration() {
		return duration;
	}


	public void setDuration(long duration) {
		this.duration = duration;
	}


	public String getCallerNumber() {
		return callerNumber;
	}


	public void setCallerNumber(String callerNumber) {
		this.callerNumber = callerNumber;
	}

	public String getCallerName() {
		return callerName;
	}


	public void setCallerName(String callerName) {
		this.callerName = callerName;
	}

	public String getCalledNumber() {
		return calledNumber;
	}


	public void setCalledNumber(String calledNumber) {
		this.calledNumber = calledNumber;
	}

	public String getCalledName() {
		return calledName;
	}


	public void setCalledName(String calledName) {
		this.calledName = calledName;
	}
}
