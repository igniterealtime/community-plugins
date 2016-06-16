package org.ifsoft.openlink.calllog;


/**
 *
 */
public class ParticipantLogRecord implements LogRecord {

	private String tscId = null;
	private String callId = null;
	private String jid = null;
	private String direction = null;
	private String type = null;
	private long startTimestamp = 0;
	private long duration = 0;

	public ParticipantLogRecord() {

	}

	public ParticipantLogRecord(String tscId, String callId, String jid, String direction, String type, long startTimestamp, long duration) {
		this.tscId = tscId;
		this.callId = callId;
		this.jid = jid;
		this.direction = direction;
		this.type = type;
		this.startTimestamp = startTimestamp;
		this.duration = duration;
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

	public long getStartTimestamp() {
		return startTimestamp;
	}

	public void setStartTimestamp(long startTimestamp) {
		this.startTimestamp = startTimestamp;
	}

	public long getDuration() {
		return duration;
	}

	public void setDuration(long durationMSec) {
		this.duration = durationMSec;
	}

	public String toString() {
		return ("{"
				+ tscId + ","
				+ callId + ","
				+ jid + "}");
	}
}
