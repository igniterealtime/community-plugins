package org.ifsoft.openlink.calllog;

import org.jivesoftware.database.DbConnectionManager;
import org.jivesoftware.util.Log;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Timestamp;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.List;

import org.apache.log4j.Logger;

public class CallLogDAO {

    final static CallFilter emptyFilter = new CallFilter("", new ArrayList<String>());

    protected static Logger Log = Logger.getLogger("CallLogDAO");

    /**
     * Return every stored calls that matches to the SQLCondition in the interval between startIndex and endIndex
     *
     * @param filter     the content of a SQL "Where" clause.
     * @param startIndex start index of results
     * @param numResults number of resultes to return
     * @return Collection<CallLog>;
     */
    public static Collection<CallLog> getCalls(CallFilter filter, int startIndex, int numResults) {

        String sql = "SELECT ofcalllog.tscid, ofcalllog.callid, ofcalllog.profileid, ofcalllog.interestid, ofcalllog.state, ofcalllog.direction, ofcalllog.callernumber, ofcalllog.callername, ofcalllog.callednumber, ofcalllog.calledname, ofparticipantlog.jid, ofparticipantlog.type, ofparticipantlog.startTimestamp, ofparticipantlog.duration FROM ofcalllog JOIN ofparticipantlog ON ofcalllog.callId = ofparticipantlog.callId";

        sql = (filter != null && !filter.getSQL().equals("")) ? sql + " WHERE " + filter.getSQL() : sql;

        sql += " ORDER BY ofcalllog.startTimestamp DESC, ofparticipantlog.startTimestamp ";

		Log.info("getCalls " + sql);

        List<CallLog> calls = new ArrayList<CallLog>(numResults);
        Connection con = null;
        PreparedStatement pstmt = null;
        try {
            con = DbConnectionManager.getConnection();
            pstmt = DbConnectionManager.createScrollablePreparedStatement(con,
                    sql);

            int i = 1;
            for (String value : filter.getValues()) {
                pstmt.setString(i++, value);
            }

            ResultSet rs = pstmt.executeQuery();
            DbConnectionManager.setFetchSize(rs, startIndex + numResults);
            DbConnectionManager.scrollResultSet(rs, startIndex);
            int count = 0;

            while (rs.next() && count < numResults)
            {
                calls.add(read(rs));
                count++;
            }
            rs.close();

        } catch (SQLException e) {
            Log.error(e);

        } finally {
            try {
                if (pstmt != null) {
                    pstmt.close();
                }
            } catch (Exception e) {
                Log.error(e);
            }
            try {
                if (con != null) {
                    con.close();
                }
            } catch (Exception e) {
                Log.error(e);
            }
        }
        return calls;
    }


    /**
     * Read a callLog result set and return a CallLog instance with the information of the resultSet
     *
     * @param rs ResultSet
     * @return CallLog
     */
    private static CallLog read(ResultSet rs) {
        CallLog callLog = null;

        try {
			String tscId 		= rs.getString("tscid");
			String callId 		= rs.getString("callid");
			String profileId 	= rs.getString("profileid");
			String interestId 	= rs.getString("interestid");
			String state 		= rs.getString("state");
			String direction 	= rs.getString("direction");
			String callerNumber = rs.getString("callernumber");
			String callerName 	= rs.getString("callername");
			String calledNumber = rs.getString("callednumber");
			String calledName 	= rs.getString("calledname");

			String jid 					= rs.getString("jid");
			String type 				= rs.getString("type");
			Timestamp startTimestamp 	= rs.getTimestamp("startTimestamp");
			long duration 				= rs.getLong("duration");

			callLog = new CallLog();
			callLog.setTscId(tscId);
			callLog.setCallId(callId);
			callLog.setProfileId(profileId);
			callLog.setInterestId(interestId);
			callLog.setState(state);
			callLog.setDirection(direction);
			callLog.setCallerName(callerNumber);
			callLog.setCallerNumber(callerName);
			callLog.setCalledName(calledNumber);
			callLog.setCalledNumber(calledName);

			callLog.setParticipantLog(new ParticipantLog());
			callLog.getParticipantLog().setType(type);
			callLog.getParticipantLog().setJid(jid);
			callLog.getParticipantLog().setStartTimestamp(startTimestamp);
			callLog.getParticipantLog().setDuration(duration);


        } catch (Exception e) {
            Log.error(e.getMessage(), e);
        }
        return callLog;
    }

    /**
     * Insert a new CallLog into the database
     *
     * @param callLog call logging
     * @throws SQLException
     */
    public static void insert(CallLog callLog) throws SQLException {

        String sql = "INSERT INTO ofcalllog(tscid, callid, profileid, interestid, state, direction, starttimestamp, duration, callername, callernumber, calledname, callednumber) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)";

        Connection con = null;
        PreparedStatement psmt = null;
        ResultSet rs = null;

        try {
            con = DbConnectionManager.getConnection();
            psmt = con.prepareStatement(sql);

			psmt.setString(1, callLog.getTscId());
			psmt.setString(2, callLog.getCallId());
			psmt.setString(3, callLog.getProfileId());
			psmt.setString(4, callLog.getInterestId());
			psmt.setString(5, callLog.getState());
			psmt.setString(6, callLog.getDirection());
			psmt.setTimestamp(7, callLog.getStartTimestamp());
			psmt.setLong(8, callLog.getDuration());
			psmt.setString(9, callLog.getCallerName());
			psmt.setString(10, callLog.getCallerNumber());
			psmt.setString(11, callLog.getCalledName());
			psmt.setString(12, callLog.getCalledNumber());

            psmt.executeUpdate();

        } catch (SQLException e) {
            Log.error(e.getMessage(), e);
            throw new SQLException(e.getMessage());
        } finally {
            DbConnectionManager.closeConnection(rs, psmt, con);
        }

    }


    /**
     * Insert a new ParticipantLog into the database
     *
     * @param ParticipantLog call logging
     * @throws SQLException
     */
    public static void insertParticipant(ParticipantLog participantLog) throws SQLException {

        String sql = "INSERT INTO ofparticipantlog(tscid, callid, jid, direction, type, starttimestamp, duration) VALUES(?,?,?,?,?,?,?)";

        Connection con = null;
        PreparedStatement psmt = null;
        ResultSet rs = null;

        try {
            con = DbConnectionManager.getConnection();
            psmt = con.prepareStatement(sql);

			psmt.setString(1, participantLog.getTscId());
			psmt.setString(2, participantLog.getCallId());
			psmt.setString(3, participantLog.getJid());
			psmt.setString(4, participantLog.getDirection());
			psmt.setString(5, participantLog.getType());
			psmt.setTimestamp(6, participantLog.getStartTimestamp());
			psmt.setLong(7, participantLog.getDuration());

            psmt.executeUpdate();

        } catch (SQLException e) {
            Log.error(e.getMessage(), e);
            throw new SQLException(e.getMessage());
        } finally {
            DbConnectionManager.closeConnection(rs, psmt, con);
        }

    }

    /**
     * Gets all calls in database for the given range
     *
     * @param startIndex
     * @param numResults
     * @return Collection<CallLog>
     */
    public static Collection<CallLog> getCalls(int startIndex, int numResults) {
        return getCalls(emptyFilter, startIndex, numResults);
    }

    /**
     * Return the number of callLog stored
     *
     * @return int number
     */
    public static int getLogCount() {
        return getLogCount(emptyFilter);
    }

    /**
     * Return the number of store callLogs for the given SQLCondition
     *
     * @param filter call filter
     * @return int number
     */
    public static int getLogCount(CallFilter filter) {
        int count = 0;

        String sql = "SELECT count(*) FROM ofcalllog JOIN ofparticipantlog ON ofcalllog.callid = ofparticipantlog.callid";

        sql = filter != null && !filter.getSQL().equals("") ? sql + " WHERE " + filter.getSQL()
                : sql;

        Connection con = null;
        PreparedStatement pstmt = null;
        try {
            con = DbConnectionManager.getConnection();
            pstmt = con.prepareStatement(sql);

            int i = 1;
            for (String value : filter.getValues()) {
                pstmt.setString(i++, value);
            }

            ResultSet rs = pstmt.executeQuery();
            if (rs.next()) {
                count = rs.getInt(1);
            }
            rs.close();
        } catch (SQLException e) {
            Log.error(e);
        } finally {
            try {
                if (pstmt != null) {
                    pstmt.close();
                }
            } catch (Exception e) {
                Log.error(e);
            }
            try {
                if (con != null) {
                    con.close();
                }
            } catch (Exception e) {
                Log.error(e);
            }
        }
        return count;
    }

    /**
     * Create a SQLFilter ( SQL Condition ) for CallLog entries
     *
     * @param username
     * @param numa
     * @param numb
     * @param callType
     * @param fromDate
     * @param uptoDate
     * @return String
     */
    public static CallFilter createSQLFilter(String username, String caller, String called,
                                             String callType, Date fromDate, Date uptoDate, String tscType)
    {

        ArrayList<String> conditions = new ArrayList<String>(10);
        ArrayList<String> values = new ArrayList<String>(10);

        conditions.add(" ofcalllog.tscid LIKE '" + tscType + "%' ");

        if (username != null && !username.trim().equals("")) {
            conditions.add(" profileid LIKE '%" + username.trim() + "%' ");
        }

        if (caller != null && !caller.trim().equals("")) {
            conditions.add(" (callernumber LIKE '%" + caller.trim() + "%' OR callername LIKE '%" + caller.trim() + "%') ");
        }

        if (called != null && !called.trim().equals("")) {
            conditions.add(" (callednumber LIKE '%" + called.trim() + "%' OR calledname LIKE '%" + called.trim() + "%') ");
        }

        if (fromDate != null) {
            conditions.add(" ofparticipantlog.starttimestamp >= '" + fromDate.toString() + "' ");
        }

        if (uptoDate != null) {
            conditions.add(" starttimestamp <= '" + uptoDate.toString() + "' ");
        }

        if (callType != null && !callType.trim().equals("") && !callType.trim().equals("all"))
        {
			if ("in".equals(callType))
			{
				conditions.add(" (ofparticipantlog.direction = 'Incoming' AND state <> 'CallMissed') ");
			}

			if ("out".equals(callType))
			{
				conditions.add(" ofparticipantlog.direction = 'Outgoing' ");
			}

			if ("missed".equals(callType))
			{
				conditions.add(" (state = 'CallMissed') ");
			}

        }

        StringBuilder str = new StringBuilder();

        for (String aux : conditions)
        {
            if (str.length() > 0)
                str.append("AND");
            str.append(aux);
        }

		Log.info("createSQLFilter " + str.toString() + " " + values);

        return new CallFilter(str.toString(), values);
    }

}

