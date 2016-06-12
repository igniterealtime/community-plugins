package org.ifsoft.openlink.calllog;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Queue;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import org.jivesoftware.database.DbConnectionManager;
import org.jivesoftware.util.Log;

/**
 *
 */
public class DatabaseAppender implements Appender {

	private static final String INSERT_CALL_LOG =
		"INSERT INTO ofcalllog(tscId, callId, profileId, interestId, state, direction, startTimestamp, duration, callerName, callerNumber, calledName, calledNumber) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)";
	private static final String INSERT_PARTICIPANT_LOG =
		"INSERT INTO ofparticipantlog(tscId, callId, jid, direction, type, startTimestamp, duration) VALUES(?,?,?,?,?,?,?)";

//	private List<LogRecord> buffer = null;
	private Queue<LogRecord> buffer = null;
	private int bufferSize = 1;

	private ExecutorService executor = Executors.newCachedThreadPool();

	public DatabaseAppender() {
//		buffer = Collections.synchronizedList(new ArrayList<LogRecord>());
		buffer = new ConcurrentLinkedQueue<LogRecord>();
	}

	public void finalize() {
//		Log.debug("finalize");
		flushBuffer();
	}

	public void append(LogRecord logRecord) {
		Log.debug("append " + logRecord);

		if (bufferSize <= 1) {
			executor.submit(new LogRecordWorker(logRecord));
		} else {
//			buffer.add(logRecord);
			buffer.offer(logRecord);
			if (buffer.size() >= bufferSize) {
				flushBuffer();
			}
		}
	}

	private void flushBuffer() {
		Log.debug("flushBuffer");

		// move all the records from buffers to own list to be written
		List<LogRecord> logRecordList = null;
		synchronized (buffer) {
			logRecordList = new ArrayList<LogRecord>();
			LogRecord logRecord = null;
			for (int i = 0; i < bufferSize; i++) {
				logRecord = buffer.poll();
				if (logRecord == null) {
					break;
				}
				logRecordList.add(logRecord);
			}
		}

//		new Thread(new LogRecordWorker(logRecordList)).start();
		executor.submit(new LogRecordWorker(logRecordList));
	}

	private void insertLog(Connection conn, LogRecord logRecord) throws Exception {

		if (logRecord instanceof CallLogRecord) {
			insertCallLog(conn, (CallLogRecord)logRecord);
		} else if (logRecord instanceof ParticipantLogRecord) {
			insertParticipantLog(conn, (ParticipantLogRecord)logRecord);
		} else {
			// Invalid type of logRecord object.
			Log.error("Invalid type of logRecord");
		}
	}

	private void insertCallLog(Connection conn, CallLogRecord callLogRecord) throws Exception {
		Log.debug("insertCallLog " + callLogRecord);

		PreparedStatement stmt = null;
		try {
			stmt = conn.prepareStatement(INSERT_CALL_LOG);

			stmt.setString(1, callLogRecord.getTscId());
			stmt.setString(2, callLogRecord.getCallId());
			stmt.setString(3, callLogRecord.getProfileId());
			stmt.setString(4, callLogRecord.getInterestId());
			stmt.setString(5, callLogRecord.getState());
			stmt.setString(6, callLogRecord.getDirection());
			stmt.setTimestamp(7, new Timestamp(callLogRecord.getStartTimestamp()));
			stmt.setLong(8, callLogRecord.getDuration());
			stmt.setString(9, callLogRecord.getCaller().getName());
			stmt.setString(10, callLogRecord.getCaller().getNumber());
			stmt.setString(11, callLogRecord.getCalled().getName());
			stmt.setString(12, callLogRecord.getCalled().getNumber());

			stmt.executeUpdate();
		} catch (Exception e) {
			throw e;
		} finally {
			DbConnectionManager.closeStatement(stmt);
		}
	}

	private void insertParticipantLog(Connection conn, ParticipantLogRecord participantLogRecord) throws Exception {
		Log.debug("insertParticipantLog " + participantLogRecord);

		PreparedStatement stmt = null;
		try {
			stmt = conn.prepareStatement(INSERT_PARTICIPANT_LOG);

			stmt.setString(1, participantLogRecord.getTscId());
			stmt.setString(2, participantLogRecord.getCallId());
			stmt.setString(3, participantLogRecord.getJid());
			stmt.setString(4, participantLogRecord.getDirection());
			stmt.setString(5, participantLogRecord.getType());
			stmt.setTimestamp(6, new Timestamp(participantLogRecord.getStartTimestamp()));
			stmt.setLong(7, participantLogRecord.getDuration());

			stmt.executeUpdate();
		} catch (Exception e) {
			throw e;
		} finally {
			DbConnectionManager.closeStatement(stmt);
		}
	}

	class LogRecordWorker implements Runnable {

		private List<LogRecord> logRecordList = null;
		private LogRecord logRecord = null;

		LogRecordWorker(List<LogRecord> logRecordList) {
			this.logRecordList = logRecordList;
		}

		LogRecordWorker(LogRecord logRecord) {
			this.logRecord = logRecord;
		}

		public void run() {
			Log.debug("LogRecordWorker.run " + logRecordList + ", " + logRecord);

			// write records to database
			if (logRecordList != null) {
				Connection conn = null;
				Iterator<LogRecord> iterator = logRecordList.iterator();
				LogRecord logRecord = null;
				try {
					conn = DbConnectionManager.getConnection();
					while (iterator.hasNext()) {
						logRecord = iterator.next();
						// insert log record to database
						insertLog(conn, logRecord);
					}

				} catch (Exception e) {
					Log.error("Failed to write logs", e);
				} finally {
					DbConnectionManager.closeConnection(conn);
				}
			} else if (logRecord != null) {
				Connection conn = null;
				try {
					conn = DbConnectionManager.getConnection();
					// insert log record to database
					insertLog(conn, logRecord);
				} catch (Exception e) {
					Log.error("Failed to write logs", e);
				} finally {
					DbConnectionManager.closeConnection(conn);
				}
			}
		}
	}
}
