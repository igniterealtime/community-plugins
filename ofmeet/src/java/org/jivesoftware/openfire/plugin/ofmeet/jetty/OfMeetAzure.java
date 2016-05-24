package org.jivesoftware.openfire.plugin.ofmeet.jetty;


import org.jivesoftware.openfire.XMPPServer;
import org.jivesoftware.openfire.auth.AuthFactory;
import org.jivesoftware.openfire.auth.AuthToken;
import org.jivesoftware.openfire.auth.UnauthorizedException;
import org.jivesoftware.openfire.plugin.spark.*;
import org.jivesoftware.database.DbConnectionManager;
import org.jivesoftware.openfire.user.*;
import org.jivesoftware.util.*;
import org.jivesoftware.openfire.muc.*;
import org.jivesoftware.openfire.muc.spi.*;
import org.jivesoftware.openfire.forms.spi.*;
import org.jivesoftware.openfire.forms.*;
import org.jivesoftware.openfire.group.*;
import org.jivesoftware.openfire.event.GroupEventDispatcher;

import org.dom4j.Element;
import org.xmpp.packet.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.microsoft.aad.adal4j.AuthenticationContext;
import com.microsoft.aad.adal4j.AuthenticationResult;

import javax.security.auth.Subject;
import java.io.Serializable;
import java.security.Principal;

import java.sql.*;
import java.io.*;
import java.util.*;
import java.util.concurrent.*;

/**
 * Azure login service that uses Azure AD to authenticate users.
 */
public class OfMeetAzure
{
    private static final Logger Log = LoggerFactory.getLogger(OfMeetAzure.class);
    private final static String AUTHORITY = "https://login.windows.net/common";
    private final static String CLIENT_ID = "9ba1a5c7-f17a-4de9-a1f1-6178c8d51223";

    private UserManager userManager = XMPPServer.getInstance().getUserManager();

    private String accessToken = null;
    private String refreshToken = null;
    private String idToken = null;
    private String givenName = null;
    private String familyName = null;


    public String authenticateUser(String username, String password)
    {
		String userName = username;
        final String[] parts = username.split( "@", 2 );

        if ( parts.length > 1 )
        {
			String email = parts[0] + "@" + parts[1];
			email = email.toLowerCase();

			Log.debug( "OfMeetAzure login " + email);

			if (!authenticateByAzureAD(email, password))
			{
				Log.error( "access denied, unknown (user@domain) " + email );
				return parts[0];
			}

			userName = parts[0] + "." + parts[1];
			User user = null;

			try {
				user = userManager.getUser(userName);
			}
			catch (UserNotFoundException e) {

				try {
					user = userManager.createUser(userName, password, givenName + " " + familyName, email);
					updateDomainGroup(userName, parts[1], givenName + " " + familyName);
				}
				catch (Exception e1) {
					Log.error( "access denied, cannot create username (user.domain) " + userName, e1);
					return userName;
				}
			}

			user.setPassword(accessToken);
		}

		return userName;
    }

    private boolean authenticateByAzureAD(String username, String password)
    {
        AuthenticationContext context = null;
        AuthenticationResult result = null;
        ExecutorService service = null;

        try {
			String clientId = JiveGlobals.getProperty("org.jitsi.videobridge.ofmeet.azure.clientid", CLIENT_ID);

			if (clientId != null & !"".equals(clientId))
			{
				service = Executors.newFixedThreadPool(1);
				context = new AuthenticationContext(AUTHORITY, false, service);

				Future<AuthenticationResult> future = context.acquireToken("https://graph.windows.net", clientId, username, password, null);
				result = future.get();
			}

        } catch (Exception e) {
			Log.error("of_authenticate_365", e);

        } finally {
            service.shutdown();
        }

        if (result != null)
        {
			accessToken = result.getAccessToken();
			refreshToken = result.getRefreshToken();
			idToken = result.getIdToken();
			givenName = result.getUserInfo().getGivenName();
			familyName = result.getUserInfo().getFamilyName();
        }
        return result != null;
    }

    public String getAccessToken()
    {
		return accessToken;
	}

	private void updateDomainGroup(String username, String groupName, String nickname)
	{
		try
		{
			Group group = null;

			try {
				group = GroupManager.getInstance().getGroup(groupName);

			} catch (GroupNotFoundException e) {
                ;
				group = GroupManager.getInstance().createGroup(groupName);
				group.getProperties().put("sharedRoster.showInRoster", "onlyGroup");
				group.getProperties().put("sharedRoster.displayName", groupName);
				group.getProperties().put("sharedRoster.groupList", "");
			}

			group.getMembers().add(XMPPServer.getInstance().createJID(username, null));

			Map<String, Object> params = new HashMap<String, Object>();
			params.put("member", username + "@" + XMPPServer.getInstance().getServerInfo().getXMPPDomain());
			GroupEventDispatcher.dispatchEvent(group, GroupEventDispatcher.EventType.member_added, params);

			updateDomainRoom(groupName, "private", groupName);
		}
		catch(Exception e)
		{
			Log.error("updateDomainGroup exception ", e);
		}
	}

	private void updateDomainRoom(String roomName, String roomStatus, String description)
	{
		Log.debug( "createRoom " + roomName + " " + roomStatus);

		boolean isBookmarksAvailable = XMPPServer.getInstance().getPluginManager().getPlugin("bookmarks") != null;

		try
		{
			String domainName = JiveGlobals.getProperty("xmpp.domain", XMPPServer.getInstance().getServerInfo().getHostname());

			if (XMPPServer.getInstance().getMultiUserChatManager().getMultiUserChatService("conference").hasChatRoom(roomName) == false)
			{
				MUCRoom room = XMPPServer.getInstance().getMultiUserChatManager().getMultiUserChatService("conference").getChatRoom(roomName);

				if (room == null)
				{
					room = XMPPServer.getInstance().getMultiUserChatManager().getMultiUserChatService("conference").getChatRoom(roomName, new JID("admin@"+domainName));

					if (room != null)
					{
						configureRoom(room, description);
						if (isBookmarksAvailable) createBookMark(roomName, roomStatus, description);
					}
				}
			}

		} catch (Exception e) {
			Log.error("createRoom", e);
		}
	}

	private void createBookMark(String roomName, String roomStatus, String description)
	{
		Bookmark bookmark = GetBookmarkByName(roomName);
		List<String> groupCollection = new ArrayList<String>();

		try
		{
			if (bookmark == null)
			{
				String roomJid = roomName.toLowerCase() + "@conference." + XMPPServer.getInstance().getServerInfo().getXMPPDomain();
				bookmark = new Bookmark(Bookmark.Type.group_chat, roomName, roomJid);
				String id = "" + bookmark.getBookmarkID() + System.currentTimeMillis();
				String rootUrlSecure = JiveGlobals.getProperty("ofmeet.root.url.secure", "https://" + XMPPServer.getInstance().getServerInfo().getHostname() + ":" + JiveGlobals.getProperty("httpbind.port.secure", "7443"));
				String url = rootUrlSecure + "/ofmeet/?b=" + id;

				bookmark.setProperty("url", url);
				bookmark.setProperty("description", description);
				bookmark.setProperty("autojoin", "true");

				if (roomStatus.equals("public"))
				{
					bookmark.setGlobalBookmark(true);

				} else {
					groupCollection.add(roomName);
					bookmark.setGroups(groupCollection);
				}
			}

		} catch (Exception e) {
			Log.error("createBookMark", e);
		}
	}

	private void configureRoom(MUCRoom room, String description)
	{
		Log.debug( "configureRoom " + room.getID());

		FormField field;
		XDataFormImpl dataForm = new XDataFormImpl(DataForm.TYPE_SUBMIT);

        field = new XFormFieldImpl("muc#roomconfig_roomdesc");
        field.setType(FormField.TYPE_TEXT_SINGLE);
        field.addValue(description);
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

		String domainName = JiveGlobals.getProperty("xmpp.domain", XMPPServer.getInstance().getServerInfo().getHostname());
		field = new XFormFieldImpl("muc#roomconfig_roomowners");
		field.addValue("admin@"+domainName);
		dataForm.addField(field);

		// Create an IQ packet and set the dataform as the main fragment
		IQ iq = new IQ(IQ.Type.set);
		Element element = iq.setChildElement("query", "http://jabber.org/protocol/muc#owner");
		element.add(dataForm.asXMLElement());

		try
		{
			// Send the IQ packet that will modify the room's configuration
			room.getIQOwnerHandler().handleIQ(iq, room.getRole());

		} catch (Exception e) {
			Log.error("configureRoom exception ", e);
		}
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
}

