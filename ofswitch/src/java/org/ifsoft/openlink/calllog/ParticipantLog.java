package org.ifsoft.openlink.calllog;


import java.sql.Timestamp;

public class ParticipantLog {

	private String tscId = null;
	private String callId = null;
	private String jid = null;
	private String direction = null;
	private String type = null;
	private Timestamp startTimestamp = null;
	private long duration = 0;

	public ParticipantLog() {

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

	public String getJid() {
		return jid;
	}

	public void setJid(String jid) {
		this.jid = jid;
	}

	public String getDirection() {
		return direction;
	}

	public void setDirection(String direction) {
		this.direction = direction;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
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

	public void setDuration(long durationMSec) {
		this.duration = durationMSec;
	}

}
