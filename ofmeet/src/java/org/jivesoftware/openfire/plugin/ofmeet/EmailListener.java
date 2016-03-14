/**
 * $RCSfile$
 * $Revision: $
 * $Date: $
 *
 * Copyright (C) 2005-2008 Jive Software. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.jivesoftware.openfire.plugin.ofmeet;

import com.sun.mail.imap.IMAPFolder;
import com.sun.mail.util.BASE64DecoderStream;

import org.jivesoftware.openfire.XMPPServer;
import org.jivesoftware.util.JiveGlobals;
import org.jivesoftware.util.Log;
import org.jivesoftware.util.StringUtils;
import org.jivesoftware.openfire.user.User;
import org.jivesoftware.openfire.user.UserManager;
import org.jivesoftware.openfire.user.UserNotFoundException;
import org.jivesoftware.openfire.SessionManager;
import org.jivesoftware.openfire.session.ClientSession;
import org.jivesoftware.openfire.muc.*;
import org.jivesoftware.openfire.muc.spi.*;
import org.jivesoftware.openfire.forms.spi.*;
import org.jivesoftware.openfire.forms.*;
import org.jivesoftware.openfire.plugin.spark.*;
import org.jivesoftware.database.DbConnectionManager;

import org.xmpp.packet.JID;
import org.xmpp.packet.IQ;

import org.dom4j.*;

import javax.mail.Message;
import javax.mail.Session;
import javax.mail.*;
import javax.mail.event.MessageCountAdapter;
import javax.mail.event.MessageCountEvent;
import java.security.Security;
import java.util.*;
import java.net.*;
import java.io.*;
import java.sql.Connection;
import java.sql.*;
import java.text.SimpleDateFormat;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import net.sf.json.*;

import org.jivesoftware.smack.*;
import org.jivesoftware.smack.filter.*;
import org.jivesoftware.smack.packet.*;
import org.jivesoftware.smackx.workgroup.*;
import org.jivesoftware.smackx.workgroup.user.Workgroup;

/**
 * The meetings email listener service connects to an email server using IMAP and listens for new emails.
 * Bookmarks are created for all copied users, PDF attachments and planned meeting dates when new email messages are found.
 *
 * @author Gaston Dombiak
 */
public class EmailListener {
    private static final EmailListener instance = new EmailListener();
    private static final Logger Log = LoggerFactory.getLogger(EmailListener.class);

    /**
     * Message listener that will process new emails found in the IMAP server.
     */
    private MessageCountAdapter messageListener;
    private Folder folder;
    private boolean started = false;
	private String downloadHome = JiveGlobals.getHomeDirectory() + File.separator + "resources" + File.separator + "spank" + File.separator + "ofmeet-cdn" + File.separator + "download";
    private UserManager userManager = XMPPServer.getInstance().getUserManager();

    private static Map<String, Presence> workgroupPresence = new HashMap<String, Presence>();
    private static Map workgroups = new HashMap();
	private static Map<String, XMPPConnection> globalConnections = new HashMap<String, XMPPConnection>();

    public static EmailListener getInstance() {
        return instance;
    }

    private EmailListener() {
    }

    /**
     * Returns true if a connection to the IMAP server was successful.
     *
     * @param host Host to connect to.
     * @param port Port to connect over.
     * @param isSSLEnabled True if an SSL connection will be attempted.
     * @param user Username to use for authentication.
     * @param password Password to use for authentication.
     * @param folderName Folder to check.
     * @return true if a connection to the IMAP server was successful.
     */
    public static boolean testConnection(String host, int port, boolean isSSLEnabled, String user, String password,
                                     String folderName) {
        Folder folder = openFolder(host, port, isSSLEnabled, user, password, folderName);
        boolean success = folder != null && folder.isOpen();
        closeFolder(folder, null);
        return success;
    }

    /**
     * Opens a connection to the IMAP server and listen for new messages.
     */
    public void start() {
        // Check that the listner service is not running
        if (started) {
            return;
        }
        Thread thread = new Thread("Email Listener Thread") {
            @Override
			public void run() {
                // Open the email folder and keep it
                folder = openFolder(getHost(), getPort(), isSSLEnabled(), getUser(), getPassword(), getFolder());
                if (folder != null) {
                    // Listen for new email messages until #stop is requested
                    listenMessages();
                }
            }
        };
        thread.setDaemon(true);
        thread.start();
        started = true;
    }

    /**
     * Closes the active connection to the IMAP server.
     */
    public void stop() {
        closeFolder(folder, messageListener);
        started = false;
        folder = null;
        messageListener = null;
    }

    private void listenMessages() {
        try {
            // Add messageCountListener to listen for new messages
            messageListener = new MessageCountAdapter() {
                @Override
				public void messagesAdded(MessageCountEvent ev) {
                    Message[] msgs = ev.getMessages();

                    // Send new messages to specified users
                    for (Message msg : msgs) {
                        try {
                            listenMessage(msg);
                        }
                        catch (Exception e) {
                            Log.error("Error while sending new email message", e);
                        }
                    }
                }


            };
            folder.addMessageCountListener(messageListener);

            // Check mail once in "freq" MILLIseconds
            int freq = getFrequency();
            boolean supportsIdle = false;
            try {
                if (folder instanceof IMAPFolder) {
                    IMAPFolder f = (IMAPFolder) folder;
                    f.idle();
                    supportsIdle = true;
                }
            }
            catch (FolderClosedException fex) {
                throw fex;
            }
            catch (MessagingException mex) {
                supportsIdle = false;
            }
            while (messageListener != null) {
                if (supportsIdle && folder instanceof IMAPFolder) {
                    IMAPFolder f = (IMAPFolder) folder;
                    try {
                    	f.idle();
					} catch (Exception e) {}
                }
                else {
                    Thread.sleep(freq); // sleep for freq milliseconds

                    // This is to force the IMAP server to send us
                    // EXISTS notifications.
                    if (folder != null && folder.isOpen()) {
                        folder.getMessageCount();
                    }
                }
            }

        }
        catch (Exception ex) {
            Log.error("Error listening new email messages", ex);
        }
    }

    private void listenMessage(Message message) throws Exception {
		String subject = message.getSubject();
		List<String> userCollection = new ArrayList<String>();

        Log.info("New email has been received " + subject);

		if (subject.startsWith("Openfire Meetings: ")) return;		// email listener is a participant, ignore email

		User fromUser = null;

  		for (Address address: message.getFrom())
  		{
			User user = getUserFromEmailAddress(address);

			if (user != null)
			{
				userCollection.add(user.getUsername());

				if (fromUser == null) fromUser = user;
			}
		}

		String fastpathPrefix = getFastpathPrefix();

		if (fastpathPrefix != null)
		{
			if (subject.startsWith(fastpathPrefix))
			{
				if ((isFastpathAuthEnabled() && fromUser != null) || isFastpathAuthEnabled() == false)
				{
					String workgroup = subject.substring(fastpathPrefix.length()).trim();
					processWorkgroupRequest(workgroup, message, fromUser);
				}

				return;
			}
		}

		Meeting meeting = new Meeting();

		if (message.isMimeType("multipart/*"))
		{
			Multipart mp = (Multipart) message.getContent();
			int count = mp.getCount();

			for (int i = 0; i < count; i++)
			{
				createBookmarksForPDFs(mp.getBodyPart(i), subject, userCollection, meeting);
			}
		}

		if (fromUser != null && (subject.startsWith("Re: Openfire Meetings: ") || subject.startsWith("RE: Openfire Meetings:")))
		{
			Bookmark bookmark = GetBookmarkByName(subject.substring(23));

			if (bookmark != null)	// user replies email listener, if user is online, send URL direct to ofmeet web client
			{
        		Log.info("Found existing bookmark for " + bookmark.getProperty("url"));

				Collection<ClientSession> sessions = SessionManager.getInstance().getSessions(fromUser.getUsername());

				for (ClientSession session : sessions)
				{
        			Log.info("Found existing session, redirecting to " + bookmark.getProperty("url"));
					sendMessage(session.getAddress(), session.getAddress(), bookmark.getProperty("url"));
				}
				return;
			}
		}


		if (fromUser != null && subject.startsWith("Canceled: "))
		{
			Bookmark bookmark = GetBookmarkByName(subject.substring(10));

			if (bookmark != null && meeting.cancel)
			{
				bookmark.setProperty("calendar", "[]");
				Log.info("Removing event for meeting planner \n" + meeting.body);
			}
			return;
		}


  		for (Address address: message.getAllRecipients())
  		{
			User user = getUserFromEmailAddress(address);

			if (user != null) userCollection.add(user.getUsername());
		}

		if (fromUser != null && userCollection.size() > 0 )
		{
			String meetingTitle = "Openfire Meetings: " + subject;
			Bookmark bookmark = GetBookmarkByName(subject);

			JID fromJid = XMPPServer.getInstance().createJID(fromUser.getUsername(), null);

			if (bookmark == null)
			{
				String roomName = "ofmeet-" + System.currentTimeMillis();
				String roomJid = roomName + "@conference." + XMPPServer.getInstance().getServerInfo().getXMPPDomain();
				bookmark = new Bookmark(Bookmark.Type.group_chat, subject, roomJid);

				String id = "" + bookmark.getBookmarkID() + System.currentTimeMillis();
				String rootUrlSecure = JiveGlobals.getProperty("ofmeet.root.url.secure", "https://" + XMPPServer.getInstance().getServerInfo().getHostname() + ":" + JiveGlobals.getProperty("httpbind.port.secure", "7443"));
				String url = rootUrlSecure + "/ofmeet/?b=" + id;

				bookmark.setProperty("url", url);
				bookmark.setProperty("autojoin", "true");
				bookmark.setGlobalBookmark(false);

				createRoom(roomName, subject, fromUser.getUsername(), userCollection);
			}


			if (meeting.startDate != null && meeting.endDate != null)
			{
				try {
					String roomId = (new JID(bookmark.getValue())).getNode();
					if (meeting.body == null) meeting.body = subject;
					SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd'T'hh:mm:ss.SSS'Z'");
					String startDate = dateFormat.format(meeting.startDate);
					String endDate = dateFormat.format(meeting.endDate);

					if (meeting.request)
					{
						String json = "[{\"processed\": false, \"id\": \"" + System.currentTimeMillis() + "\", \"start\": " + meeting.startDate.getTime() + ", \"end\": " + meeting.endDate.getTime() + ", \"startTime\": \"" + endDate + "\", \"endTime\": \"" + endDate + "\", \"title\": \"" + subject + "\", \"description\": \"" + meeting.body + "\", \"room\": \"" + roomId + "\"}]";
						bookmark.setProperty("calendar", json);
						Log.info("Adding event for meeting planner \n" + meeting.body);
					}

				} catch (Exception e) {
					Log.error("Error create/cancel meeting planner event", e);
				}

			} else {
				meeting.startDate = new java.util.Date(System.currentTimeMillis());
				meeting.endDate = new java.util.Date(System.currentTimeMillis() + 3600000);

				Log.info("Immediate meeting, no event meeting planner\n" + meeting.body);
			}

			bookmark.setUsers(userCollection);

			for (String username: userCollection)
			{
				JSONObject meetingJSON = new JSONObject();
				meetingJSON.put("startTime", meeting.startDate.getTime());
				meetingJSON.put("endTime", meeting.endDate.getTime());
				meetingJSON.put("description", meeting.body == null ? bookmark.getName() : meeting.body);
				meetingJSON.put("title", meetingTitle);
				meetingJSON.put("room", bookmark.getValue());

				OfMeetPlugin.self.processMeeting(meetingJSON, username, bookmark.getProperty("url"));

				Collection<ClientSession> sessions = SessionManager.getInstance().getSessions(username);

				for (ClientSession session : sessions)
				{
					sendMessage(fromJid, session.getAddress(), bookmark.getProperty("url"));
				}
			}
		}
    }

    private void sendMessage(JID from, JID to, String body)
    {
		Log.info("sendMessage: " + from + " " + to + " " + body);

        org.xmpp.packet.Message message = new org.xmpp.packet.Message();
        message.setTo(to);
        message.setFrom(from);
		message.setType(org.xmpp.packet.Message.Type.chat);
        message.setBody(body);

        XMPPServer.getInstance().getMessageRouter().route(message);
    }

    private User getUserFromEmailAddress(Address address)
    {
		String from = address.toString();
		User theUser = null;

		int ltIndex = from.indexOf('<');
		int atIndex = from.indexOf('@');
		int gtIndex = from.indexOf('>');

		if ((ltIndex!=-1) && (atIndex!=-1) && (gtIndex!=-1) && (ltIndex<atIndex) && (atIndex<gtIndex) )
		{
			from = from.substring(ltIndex+1, gtIndex);

			Log.info("getUserFromEmailAddress: found email address " + from);

			Collection<User> users = userManager.findUsers(new HashSet<String>(Arrays.asList("Email")), from);

			for (User user : users)
			{
				Log.info("getUserFromEmailAddress: matched email address " + from + " " + user.getUsername());

				theUser = user;
			}
		}
		return theUser;
	}

	private Bookmark GetBookmarkByName(String name)
	{
 		Bookmark bookmark = null;

        Connection con = null;
        PreparedStatement pstmt = null;
        ResultSet rs = null;

        try {
            con = DbConnectionManager.getConnection();
            pstmt = con.prepareStatement("SELECT bookmarkID from ofBookmark where bookmarkName=?");
            pstmt.setString(1, name);
            rs = pstmt.executeQuery();

            if (rs.next()) {
                long bookmarkID = rs.getLong(1);
                try {
                    bookmark = new Bookmark(bookmarkID);
                }
                catch (Exception e) {
                }
            }
        }
        catch (SQLException e) {
            Log.error(e.getMessage(), e);
        }
        finally {
            DbConnectionManager.closeConnection(rs, pstmt, con);
        }

        return bookmark;
	}

    private void createBookmarksForPDFs(Part part, String subject, List<String> userCollection, Meeting meeting) throws Exception {
        /*
         * Using isMimeType to determine the content type avoids
         * fetching the actual content data until we need it.
         */

        if (part.isMimeType("text/plain"))
        {
			meeting.body = (String) part.getContent();
			meeting.body = meeting.body.replace("\n", " ").replace("\r", "").replace("\t", "").replace("\"", "'");

			Log.info("Found body \n" + meeting.body);
        }
        else if (part.isMimeType("multipart/*")) {
			Log.info("Found embedded multipart");
        }
        else if (part.isMimeType("message/rfc822")) {
			Log.info("Found nested email");
        }
        else {

			String fileName = part.getFileName();

            Object o = part.getContent();

            if (fileName != null && fileName.endsWith(".pdf") && o instanceof InputStream)
            {
				Log.info("Found PDF " + fileName);

				OutputStream output = new FileOutputStream(downloadHome + File.separator + fileName);

				try {
					InputStream is = (InputStream) o;
					byte[] buffer = new byte[8 * 1024];
					int bytesRead;

					while ((bytesRead = is.read(buffer)) != -1)
					{
						output.write(buffer, 0, bytesRead);
					}

				} finally  {
					output.close();
				}

				String pdfTitle = subject + " - " + fileName;
				String rootUrlPlain = JiveGlobals.getProperty("ofmeet.root.url.plain", "http://" + XMPPServer.getInstance().getServerInfo().getHostname() + ":" + JiveGlobals.getProperty("httpbind.port.plain", "7070"));
				String pdfUrl =  rootUrlPlain + "/ofmeet-cdn/download/" + fileName;
				Bookmark bookmark = GetBookmarkByName(pdfTitle);

				if (bookmark == null)
				{
					String roomJid = "ofmeet-" + System.currentTimeMillis() + "@conference." + XMPPServer.getInstance().getServerInfo().getXMPPDomain();
					bookmark = new Bookmark(Bookmark.Type.url, pdfTitle, pdfUrl);
				}

				String id = "" + bookmark.getBookmarkID() + System.currentTimeMillis();
				String rootUrlSecure = JiveGlobals.getProperty("ofmeet.root.url.secure", "https://" + XMPPServer.getInstance().getServerInfo().getHostname() + ":" + JiveGlobals.getProperty("httpbind.port.secure", "7443"));
				String url = rootUrlSecure + "/ofmeet/?b=" + id;

				bookmark.setProperty("url", pdfUrl);
				bookmark.setGlobalBookmark(false);
				bookmark.setUsers(userCollection);
            }
            else {

				if (o instanceof BASE64DecoderStream)
				{
					String contentType = part.getContentType();

					if (contentType.indexOf("TEXT/CALENDAR") > -1)
					{
						meeting.request = contentType.indexOf("method=REQUEST") > -1;
						meeting.cancel = contentType.indexOf("method=CANCEL") > -1;

						Log.info("Found Calendar data request=" + meeting.request + ", cancel=" + meeting.cancel);

						try {
							BASE64DecoderStream is = (BASE64DecoderStream) o;
							byte[] buffer = new byte[8 * 1024];
							int bytesRead;
							SimpleDateFormat dateFormat = new SimpleDateFormat("yyyyMMdd'T'hhmmss");

							while ((bytesRead = is.read(buffer)) != -1)
							{
								String iCalLine = new String(buffer, 0, bytesRead);
								String lines[] = iCalLine.split("\\r?\\n");

								meeting.startDate = getDate(dateFormat, lines, "DTSTART;TZID=");
								meeting.endDate = getDate(dateFormat, lines, "DTEND;TZID=");
							}

							Log.info("Found Calendar start=" + meeting.startDate.getTime() + ", end=" + meeting.endDate.getTime());

						} catch (Exception e) {
							Log.error("Error decoding start or end date", e);
						}
					}

				} else {
					Log.info("Found PDF " + fileName);
					Log.info("Found unknown attachment " + part.getFileName() + " " + part.getContentType());
					Log.info(part.getContent().toString());
				}
            }
        }
    }

	private java.util.Date getDate(SimpleDateFormat dateFormat, String lines[], String prefix)
	{
		java.util.Date date = null;

		for (int i=0; i<lines.length; i++)
		{
			if (lines[i].indexOf(prefix) > -1)
			{
				try {
					date = dateFormat.parse(lines[i].substring(lines[i].indexOf(":") + 1));
				} catch (Exception e) {
					Log.error("Error parsing date in line " + lines[i]);
				}
			}
		}
		return date;
	}

	private void createRoom(String roomName, String title, String owner, List<String> userCollection) throws NotAllowedException
	{
		MUCRoom room = XMPPServer.getInstance().getMultiUserChatManager().getMultiUserChatService("conference").getChatRoom(roomName, XMPPServer.getInstance().createJID(owner, null));

		configureRoom(room, title, owner);

		for (String username: userCollection)
		{
			try {
				room.addAdmin(XMPPServer.getInstance().createJID(username, null), room.getRole());
			} catch (Exception e) {
				Log.error("createRoom set admin role failed for " + username);
			}
		}
	}

    private static Folder openFolder(String host, Integer port, Boolean isSSLEnabled, String user, String password,
                                     String folder) {
        if (host == null || port == null || isSSLEnabled == null || user == null || password == null || folder == null) {
            return null;
        }
        try {
            Properties props = System.getProperties();

            props.setProperty("mail.imap.host", host);
            props.setProperty("mail.imap.port", String.valueOf(port));
            props.setProperty("mail.imap.connectiontimeout", String.valueOf(10 * 1000));
            // Allow messages with a mix of valid and invalid recipients to still be sent.
            props.setProperty("mail.debug", JiveGlobals.getProperty("ofmeet.email.listener.debug", "true"));

            // Get a Session object
            Session session = Session.getInstance(props, null);

            // Get a Store object
            Store store = session.getStore(isSSLEnabled ? "imaps" : "imap");

            // Connect
            store.connect(host, user, password);

            // Open a Folder
            Folder newFolder = store.getFolder(folder);
            if (newFolder == null || !newFolder.exists()) {
                Log.error("Invalid email folder: " + folder);
                return null;
            }

            newFolder.open(Folder.READ_WRITE);
            return newFolder;
        }
        catch (Exception e) {
            Log.error("Error while initializing email listener", e);
        }
        return null;
    }

    private static void closeFolder(Folder folder, MessageCountAdapter messageListener) {
        if (folder != null) {
            if (messageListener != null) {
                folder.removeMessageCountListener(messageListener);
            }
            try {
                folder.close(false);
            }
            catch (MessagingException e) {
                Log.error("Error closing folder", e);
            }
        }
    }

    /**
     * Returns the host where the IMAP server is running or <tt>null</tt> if none was defined.
     *
     * @return the host where the IMAP server is running or null if none was defined.
     */
    public String getHost() {
        return JiveGlobals.getProperty("ofmeet.email.listener.host");
    }

    /**
     * Sets the host where the IMAP server is running or <tt>null</tt> if none was defined.
     *
     * @param host the host where the IMAP server is running or null if none was defined.
     */
    public void setHost(String host) {
        JiveGlobals.setProperty("ofmeet.email.listener.host", host);
    }

    /**
     * Returns the port where the IMAP server is listening. By default unsecured connections
     * use port 143 and secured ones use 993.
     *
     * @return port where the IMAP server is listening.
     */
    public int getPort() {
        return JiveGlobals.getIntProperty("ofmeet.email.listener.port", isSSLEnabled() ? 993 : 143);
    }

    /**
     * Sets the port where the IMAP server is listening. By default unsecured connections
     * use port 143 and secured ones use 993.
     *
     * @param port port where the IMAP server is listening.
     */
    public void setPort(int port) {
        JiveGlobals.setProperty("ofmeet.email.listener.port", Integer.toString(port));
    }

    /**
     * Returns the user to use to connect to the IMAP server. A null value means that
     * this property needs to be configured to be used.
     *
     * @return the user to use to connect to the IMAP server.
     */
    public String getUser() {
        return JiveGlobals.getProperty("ofmeet.email.listener.user");
    }

    /**
     * Sets the user to use to connect to the IMAP server. A null value means that
     * this property needs to be configured to be used.
     *
     * @param user the user to use to connect to the IMAP server.
     */
    public void setUser(String user) {
        JiveGlobals.setProperty("ofmeet.email.listener.user", user);
    }

    /**
     * Returns the password to use to connect to the IMAP server. A null value means that
     * this property needs to be configured to be used.
     *
     * @return the password to use to connect to the IMAP server.
     */
    public String getPassword() {
        return JiveGlobals.getProperty("ofmeet.email.listener.password");
    }

    /**
     * Sets the password to use to connect to the IMAP server. A null value means that
     * this property needs to be configured to be used.
     *
     * @param password the password to use to connect to the IMAP server.
     */
    public void setPassword(String password) {
        JiveGlobals.setProperty("ofmeet.email.listener.password", password);
    }

    /**
     * Returns the name of the fastpath prefix.
     *
     * @return the name of the fastpath prefix.
     */
    public String getFastpathPrefix() {
        return JiveGlobals.getProperty("ofmeet.email.listener.fastpath.prefix");
    }

    /**
     * Sets the name of the fastpath prefix.
     *
     * @param folder the name of the fastpath prefix.
     */
    public void setFastpathPrefix(String prefix) {
        JiveGlobals.setProperty("ofmeet.email.listener.fastpath.prefix", prefix);
    }

    /**
     * Returns the name of the folder. In some Stores, name can be an absolute path if
     * it starts with the hierarchy delimiter. Else it is interpreted relative to the
     * 'root' of this namespace.
     *
     * @return the name of the folder.
     */
    public String getFolder() {
        return JiveGlobals.getProperty("ofmeet.email.listener.folder");
    }

    /**
     * Sets the name of the folder. In some Stores, name can be an absolute path if
     * it starts with the hierarchy delimiter. Else it is interpreted relative to the
     * 'root' of this namespace.
     *
     * @param folder the name of the folder.
     */
    public void setFolder(String folder) {
        JiveGlobals.setProperty("ofmeet.email.listener.folder", folder);
    }

    /**
     * Returns the milliseconds to wait to check for new emails. This frequency
     * is used if the IMAP server does not support idle.
     *
     * @return the milliseconds to wait to check for new emails.
     */
    public int getFrequency() {
        return JiveGlobals.getIntProperty("ofmeet.email.listener.frequency", 5 * 60 * 1000);
    }

    /**
     * Sets the milliseconds to wait to check for new emails. This frequency
     * is used if the IMAP server does not support idle.
     *
     * @param frequency the milliseconds to wait to check for new emails.
     */
    public void setFrequency(int frequency) {
        JiveGlobals.setProperty("ofmeet.email.listener.frequency", Integer.toString(frequency));
    }
    /**
     * Returns true if fastpath authentication is required
     *
     * @return true if fastpath authentication is required
     */
    public boolean isFastpathAuthEnabled() {
        return JiveGlobals.getBooleanProperty("ofmeet.email.listener.fastpath.auth", false);
    }

    /**
     * Sets if fastpath authentication is required.
     *
     * @param enabled true if fastpath authentication is required
     */
    public void setFastpathAuthEnabled(boolean enabled) {
        JiveGlobals.setProperty("ofmeet.email.listener.fastpath.auth", Boolean.toString(enabled));
    }
    /**
     * Returns true if SSL is enabled to connect to the server.
     *
     * @return true if SSL is enabled to connect to the server.
     */
    public boolean isSSLEnabled() {
        return JiveGlobals.getBooleanProperty("ofmeet.email.listener.ssl", false);
    }

    /**
     * Sets if SSL is enabled to connect to the server.
     *
     * @param enabled true if SSL is enabled to connect to the server.
     */
    public void setSSLEnabled(boolean enabled) {
        JiveGlobals.setProperty("ofmeet.email.listener.ssl", Boolean.toString(enabled));
    }

    public Collection<String> getUsers() {
        String users = JiveGlobals.getProperty("ofmeet.email.listener.users");
        if (users == null || users.trim().length() == 0) {
            Collection<String> admins = new ArrayList<String>();
            for (JID jid : XMPPServer.getInstance().getAdmins()) {
                admins.add(jid.toString());
            }
            return admins;
        }
        return StringUtils.stringToCollection(users);
    }

    public void setUsers(Collection<String> users) {
        JiveGlobals.setProperty("ofmeet.email.listener.users", StringUtils.collectionToString(users));
    }

	private void configureRoom(MUCRoom room, String title, String owner)
	{
		Log.info( "configureRoom " + room.getID());

		FormField field;
		XDataFormImpl dataForm = new XDataFormImpl(DataForm.TYPE_SUBMIT);

        field = new XFormFieldImpl("muc#roomconfig_roomdesc");
        field.setType(FormField.TYPE_TEXT_SINGLE);
        field.addValue(title);
        dataForm.addField(field);

        field = new XFormFieldImpl("muc#roomconfig_roomname");
        field.setType(FormField.TYPE_TEXT_SINGLE);
        field.addValue(room.getName());
        dataForm.addField(field);

		field = new XFormFieldImpl("FORM_TYPE");
		field.setType(FormField.TYPE_HIDDEN);
		field.addValue("http://jabber.org/protocol/muc#roomconfig");
		dataForm.addField(field);

		field = new XFormFieldImpl("muc#roomconfig_changesubject");
		field.addValue("1");
		dataForm.addField(field);

		field = new XFormFieldImpl("muc#roomconfig_maxusers");
		field.addValue("30");
		dataForm.addField(field);

		field = new XFormFieldImpl("muc#roomconfig_presencebroadcast");
		field.addValue("moderator");
		field.addValue("participant");
		field.addValue("visitor");
		dataForm.addField(field);

		field = new XFormFieldImpl("muc#roomconfig_publicroom");
		field.addValue("1");
		dataForm.addField(field);

		field = new XFormFieldImpl("muc#roomconfig_persistentroom");
		field.addValue("1");
		dataForm.addField(field);

		field = new XFormFieldImpl("muc#roomconfig_moderatedroom");
		field.addValue("0");
		dataForm.addField(field);

		field = new XFormFieldImpl("muc#roomconfig_membersonly");
		field.addValue("0");
		dataForm.addField(field);

		field = new XFormFieldImpl("muc#roomconfig_allowinvites");
		field.addValue("1");
		dataForm.addField(field);

		field = new XFormFieldImpl("muc#roomconfig_passwordprotectedroom");
		field.addValue("0");
		dataForm.addField(field);

		field = new XFormFieldImpl("muc#roomconfig_whois");
		field.addValue("moderator");
		dataForm.addField(field);

		field = new XFormFieldImpl("muc#roomconfig_enablelogging");
		field.addValue("1");
		dataForm.addField(field);

		field = new XFormFieldImpl("x-muc#roomconfig_canchangenick");
		field.addValue("1");
		dataForm.addField(field);

		field = new XFormFieldImpl("x-muc#roomconfig_registration");
		field.addValue("1");
		dataForm.addField(field);

		// Keep the existing list of admins
		field = new XFormFieldImpl("muc#roomconfig_roomadmins");
		for (JID jid : room.getAdmins()) {
			field.addValue(jid.toString());
		}
		dataForm.addField(field);

		String domainName = XMPPServer.getInstance().getServerInfo().getXMPPDomain();
		field = new XFormFieldImpl("muc#roomconfig_roomowners");
		field.addValue(owner + "@" + domainName);
		dataForm.addField(field);

		// Create an IQ packet and set the dataform as the main fragment
		IQ iq = new IQ(IQ.Type.set);
		Element element = iq.setChildElement("query", "http://jabber.org/protocol/muc#owner");
		element.add(dataForm.asXMLElement());

		try
		{
			room.getIQOwnerHandler().handleIQ(iq, room.getRole());

		} catch (Exception e) {
			Log.error("configureRoom exception " + e);
		}
	}

	private class Meeting
	{
		public java.util.Date startDate = null;
		public java.util.Date endDate= null;
		public String body = null;
		public boolean request = false;
		public boolean cancel = false;
	}

	private void sendWorkgroupEmail(String email, String workgroupNodeName, String template, String room)
	{
		Log.info("sendWorkgroupEmail " + workgroupNodeName + " " + email + " " + room + "\n" + template);

		String videourl = "https://" + XMPPServer.getInstance().getServerInfo().getHostname() + ":" + JiveGlobals.getProperty("httpbind.port.secure", "7443") + "/ofmeet/?r=" + room;
		String audiourl = videourl + "&novideo=true";
		String title = "RE:" + getFastpathPrefix() + workgroupNodeName;

		HashMap variables = new HashMap<String, String>();
		variables.put("domain", XMPPServer.getInstance().getServerInfo().getXMPPDomain());
		variables.put("videourl", videourl);
		variables.put("audiourl", audiourl);
		variables.put("workgroup", workgroupNodeName);

		OfMeetPlugin.self.sendEmail(email, email, title, OfMeetPlugin.self.replaceTokens(template, variables), null);
	}

	private void processWorkgroupRequest(String workgroupNodeName, Message message, User fromUser)
	{
		Log.info("processWorkgroupRequest " + workgroupNodeName);

		String template = JiveGlobals.getProperty("ofmeet.email.workgroup.unavailable.template", "Hello,\n\nWorkgroup [workgroup] is not taking requests at this moment.\nPlease try later\n\nAdministrator - [domain]");

		try
		{
			String userid = null;
			String username = null;

			for (Address address: message.getFrom())
			{
				String from = address.toString();

				int ltIndex = from.indexOf('<');
				int atIndex = from.indexOf('@');
				int gtIndex = from.indexOf('>');

				if ((ltIndex!=-1) && (atIndex!=-1) && (gtIndex!=-1) && (ltIndex<atIndex) && (atIndex<gtIndex) )
				{
					username = from.substring(ltIndex+1, gtIndex);
					userid = JID.escapeNode(username);
				}
			}

			if (userid != null)
			{
				Log.info("processWorkgroupRequest userid " + userid);

				String messageBody = null;

				if (message.isMimeType("multipart/*"))
				{
					Multipart mp = (Multipart) message.getContent();
					int count = mp.getCount();

					for (int i = 0; i < count; i++)
					{
						Part part = mp.getBodyPart(i);

						if (part.isMimeType("text/plain"))
						{
							messageBody = (String) part.getContent();
						}
					}
				}
				else

				if (message.isMimeType("text/plain"))
				{
					messageBody = (String) message.getContent();
				}

				if (messageBody != null)
				{
					Log.info("processWorkgroupRequest body " + messageBody);

					messageBody = messageBody.replace("\n", " ").replace("\r", "").replace("\t", "").replace("\"", "'");

					String workgroupName = workgroupNodeName + "@workgroup." + XMPPServer.getInstance().getServerInfo().getXMPPDomain();

					if (globalConnections.containsKey(userid) == false)
					{
						Log.info("processWorkgroupRequest smack session " + workgroupName);

						ConnectionConfiguration config = new ConnectionConfiguration("localhost", 0);
						XMPPConnection connection = new XMPPConnection(config);
						connection.connect();
						connection.loginAnonymousUser(userid);
						globalConnections.put(userid, connection);
					}

					XMPPConnection globalConnection = globalConnections.get(userid);
					Workgroup workgroup = getWorkgroup(workgroupName, globalConnection);

					if (isOnline(workgroupName, globalConnection))
					{
						Map details = new HashMap();
						details.put("username", fromUser == null ? username.split("@")[0] : fromUser.getName());
						details.put("email", username);
						details.put("question", messageBody);

						if (workgroup != null) {
							try {
								workgroup.joinQueue(details, userid);
							}
							catch (XMPPException e) {
								Log.error("Unable to join chat queue." + workgroupName, e);
								sendWorkgroupEmail(JID.unescapeNode(userid), workgroupName, template, "");
							}
						}

					} else {
						Log.warn("processWorkgroupRequest workgroup is offline " + workgroupName);
						sendWorkgroupEmail(JID.unescapeNode(userid), workgroupName, template, "");
					}
				} else {
					Log.warn("processWorkgroupRequest email body is empty" + messageBody);
					sendWorkgroupEmail(JID.unescapeNode(userid), workgroupNodeName, template, "");
				}

			} else {
				Log.warn("processWorkgroupRequest bad email address " + message);
			}

		} catch (Exception e) {
			Log.error("processWorkgroupRequest " + e);
		}
	}

    private boolean isOnline(final String workgroupName, XMPPConnection globalConnection)
    {
        Presence presence = workgroupPresence.get(workgroupName);

        if (presence == null)
        {
            Workgroup workgroup  = getWorkgroup(workgroupName, globalConnection);
            boolean isAvailable = workgroup.isAvailable();
            presence = new Presence(isAvailable ? Presence.Type.available : Presence.Type.unavailable);
            workgroupPresence.put(workgroupName, presence);

            // Otherwise
            PacketFilter fromFilter = new FromContainsFilter(workgroupName);
            PacketFilter presenceFilter = new PacketTypeFilter(Presence.class);
            PacketFilter andFilter = new AndFilter(fromFilter, presenceFilter);

            globalConnection.addPacketListener(new PacketListener()
            {
                public void processPacket(Packet packet)
                {
                    Presence presence = (Presence)packet;
                    workgroupPresence.put(workgroupName, presence);
                }
            }, andFilter);

            return isAvailable;
        }

        return presence != null && presence.getType() == Presence.Type.available;
    }

    private Workgroup getWorkgroup(final String workgroupName, final XMPPConnection globalConnection)
    {
        Workgroup workgroup = (Workgroup)workgroups.get(workgroupName);

        if (workgroup == null)
        {
            workgroup = new Workgroup(workgroupName, globalConnection);

			workgroup.addInvitationListener(new WorkgroupInvitationListener()
			{
				public void invitationReceived(WorkgroupInvitation workgroupInvitation)
				{
					String room = workgroupInvitation.getGroupChatName().split("@")[0];
					String userid = globalConnection.getUser();
					String template = JiveGlobals.getProperty("ofmeet.email.workgroup.available.template", "Hello,\n\nAn Agent from [workgroup] is inviting you to a conference\n\nTo join, please click\n[videourl]\nFor audio only with no webcan, please click\n[audiourl]\n\nAdministrator - [domain]");

					sendWorkgroupEmail(JID.unescapeNode(userid), workgroupName, template, room);
				}
			});

            workgroups.put(workgroupName, workgroup);
        }

        return workgroup;
    }

/*

	BEGIN:VCALENDAR
	METHOD:REQUEST
	PRODID:Microsoft Exchange Server 2010
	VERSION:2.0
	BEGIN:VTIMEZONE
	TZID:GMT Standard Time
	BEGIN:STANDARD
	DTSTART:16010101T020000
	TZOFFSETFROM:+0100
	TZOFFSETTO:+0000
	RRULE:FREQ=YEARLY;INTERVAL=1;BYDAY=-1SU;BYMONTH=10
	END:STANDARD
	BEGIN:DAYLIGHT
	DTSTART:16010101T010000
	TZOFFSETFROM:+0000
	TZOFFSETTO:+0100
	RRULE:FREQ=YEARLY;INTERVAL=1;BYDAY=-1SU;BYMONTH=3
	END:DAYLIGHT
	END:VTIMEZONE
	BEGIN:VEVENT
	ORGANIZER;CN=Dele Olajide:MAILTO:yyyyyy@domain.com
	ATTENDEE;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE;CN=Dele:MAILT
	 O:xxxxx@domain.net
	DESCRIPTION;LANGUAGE=en-US:Are you coming?\n
	UID:2DB9FAF4-899F-440D-BC41-AFFDAAF2A3B4
	SUMMARY;LANGUAGE=en-US:Movie tonight
	DTSTART;TZID=GMT Standard Time:20151226T133000
	DTEND;TZID=GMT Standard Time:20151226T140000
	CLASS:PUBLIC
	PRIORITY:5
	DTSTAMP:20151226T131959Z
	TRANSP:OPAQUE
	STATUS:CONFIRMED
	SEQUENCE:0
	LOCATION;LANGUAGE=en-US:Hoo\, Rochester
	X-MICROSOFT-CDO-APPT-SEQUENCE:0
	X-MICROSOFT-CDO-OWNERAPPTID:2113720871
	X-MICROSOFT-CDO-BUSYSTATUS:TENTATIVE
	X-MICROSOFT-CDO-INTENDEDSTATUS:BUSY
	X-MICROSOFT-CDO-ALLDAYEVENT:FALSE
	X-MICROSOFT-CDO-IMPORTANCE:1
	X-MICROSOFT-CDO-INSTTYPE:0
	X-MICROSOFT-DISALLOW-COUNTER:FALSE
	BEGIN:VALARM
	DESCRIPTION:REMINDER
	TRIGGER;RELATED=START:-PT15M
	ACTION:DISPLAY
	END:VALARM
	END:VEVENT
	END:VCALENDAR

*/
}
