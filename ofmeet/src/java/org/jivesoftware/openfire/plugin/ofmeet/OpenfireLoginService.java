/**
 * $Revision $
 * $Date $
 *
 * Copyright (C) 2005-2010 Jive Software. All rights reserved.
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

import org.eclipse.jetty.security.DefaultIdentityService;
import org.eclipse.jetty.security.IdentityService;
import org.eclipse.jetty.security.LoginService;
import org.eclipse.jetty.server.UserIdentity;
import org.eclipse.jetty.util.component.AbstractLifeCycle;

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
 * A Jetty login service that uses Openfire to authenticate users.
 */
public class OpenfireLoginService extends AbstractLifeCycle implements LoginService
{
    private static final Logger Log = LoggerFactory.getLogger(OpenfireLoginService.class);
    private final static String AUTHORITY = "https://login.windows.net/common";
    private final static String CLIENT_ID = "9ba1a5c7-f17a-4de9-a1f1-6178c8d51223";

    public static final ConcurrentHashMap<String, AuthToken> authTokens = new ConcurrentHashMap<>();
    public static final ConcurrentHashMap<String, UserIdentity> identities = new ConcurrentHashMap<>();
    public static final ConcurrentHashMap<String, String> skypeids = new ConcurrentHashMap<>();

    private IdentityService _identityService=new DefaultIdentityService();
    private String _name;
    private UserManager userManager = XMPPServer.getInstance().getUserManager();

    private String accessToken = null;
    private String refreshToken = null;
    private String idToken = null;
    private String givenName = null;
    private String familyName = null;

    protected OpenfireLoginService()
    {

    }

    public OpenfireLoginService(String name)
    {
        setName(name);
    }

    public String getName()
    {
        return _name;
    }

    public IdentityService getIdentityService()
    {
        return _identityService;
    }

    public void setIdentityService(IdentityService identityService)
    {
        if (isRunning())
            throw new IllegalStateException("Running");
        _identityService = identityService;
    }

    public void setName(String name)
    {
        if (isRunning())
            throw new IllegalStateException("Running");
        _name = name;
    }


    @Override
    protected void doStart() throws Exception
    {
        super.doStart();
    }

    @Override
    protected void doStop() throws Exception
    {
        super.doStop();
    }

    public void logout(UserIdentity identity)
    {
        Log.debug("logout {}",identity);

        identities.remove(identity.getUserPrincipal().getName());
    }

    @Override
    public String toString()
    {
        return this.getClass().getSimpleName()+"["+_name+"]";
    }

    public UserIdentity login(String username, Object credential)
    {
		String userName = username.toLowerCase();
		String password = (String) credential;

		Log.debug( "login " + userName);

        // AuthFactory supports both a bare username, as well as user@domain. However, UserManager only accepts the bare
        // username. If the provided value includes a domain, use only the node-part (after verifying that it's actually
        // a user of our domain).

        // for other domains, authenticate by assuming it is a global identity like Azure AD

        final String[] parts = userName.split( "@", 2 );

        if ( parts.length > 1 )
        {
            if ( XMPPServer.getInstance().getServerInfo().getXMPPDomain().equals( parts[1] ) )
            {
                userName = parts[0];

				try {
					userManager.getUser(userName);

					if (!authenticateByOpenfire(userName, password))
					{
						Log.error( "access denied, unknown username " + userName );
						return null;
					}
				}
				catch (UserNotFoundException e) {
					Log.error( "user not found " + userName);
					return null;
				}
            }
            else
            {
				if (!authenticateByAzureAD(userName, password))
				{
                	Log.error( "access denied, unknown (user@domain) " + userName );
                	return null;
				}

				userName = (parts[0] + "_" + parts[1]).replaceAll("\\.", "_");

				try {
					userManager.getUser(userName);
				}
				catch (UserNotFoundException e) {

					try {
						userManager.createUser(userName, accessToken, givenName + " " + familyName, parts[0] + "@" + parts[1]);
					}
					catch (Exception e1) {
						Log.error( "access denied, cannot create username (user.domain) " + userName, e1);
						return null;
					}
				}

				if (skypeids.containsKey(userName) == false)
				{
					boolean skypeAvailable = XMPPServer.getInstance().getPluginManager().getPlugin("ofskype") != null;

					if (skypeAvailable)
					{
						skypeids.put(userName, username);

						IQ iq = new IQ(IQ.Type.set);
						iq.setFrom(userName + "@" + XMPPServer.getInstance().getServerInfo().getXMPPDomain());
						iq.setTo(XMPPServer.getInstance().getServerInfo().getXMPPDomain());

						Element child = iq.setChildElement("request", "http://igniterealtime.org/protocol/ofskype");
						child.setText("{'action':'start_skype_user', 'password':'" + password + "', 'sipuri':'" + username + "'}");
						XMPPServer.getInstance().getIQRouter().route(iq);
					}
				}

				if (authTokens.containsKey(userName) == false)
				{
					updateDomainGroup(userName, parts[1], givenName + " " + familyName);

					AuthToken authToken = new AuthToken(userName);
					authTokens.put(userName, authToken);
				}
            }

		} else {

			try {
				userManager.getUser(userName);

				if (!authenticateByOpenfire(userName, password))
				{
					Log.error( "access denied, unknown username " + userName );
					return null;
				}
			}
			catch (UserNotFoundException e) {
				Log.error( "user not found " + userName);
				return null;
			}
		}

		UserIdentity identity = null;

		if (identities.containsKey(userName))
		{
			identity = identities.get(userName);

		} else {

			Principal userPrincipal = new KnownUser(userName, credential);
			Subject subject = new Subject();
			subject.getPrincipals().add(userPrincipal);
			subject.getPrivateCredentials().add(credential);
			subject.getPrincipals().add(new RolePrincipal("ofmeet"));
			subject.setReadOnly();

			identity = _identityService.newUserIdentity(subject, userPrincipal, new String[] {"ofmeet"});
			identities.put(userName, identity);
		}

		return identity;
    }

    public boolean validate(UserIdentity user)
    {
		Log.debug( "validate " + user);
		return user != null;
    }

    public boolean authenticateByOpenfire(String userName, String password)
    {
		try {
			AuthToken authToken = AuthFactory.authenticate( userName, password);
			authTokens.put(userName, authToken);
			return true;

		} catch ( UnauthorizedException e ) {
			Log.error( "access denied, bad password " + userName );
			return false;

		} catch ( Exception e ) {
			Log.error( "access denied " + userName );
			return false;
		}
	}

	private void updateDomainGroup(String username, String groupName, String nickname)
	{
		try
		{
			Group group = null;
			JID jid = XMPPServer.getInstance().createJID(username, null);

			try {
				group = GroupManager.getInstance().getGroup(groupName);

			} catch (GroupNotFoundException e) {
                ;
				group = GroupManager.getInstance().createGroup(groupName);
				group.getProperties().put("sharedRoster.showInRoster", "onlyGroup");
				group.getProperties().put("sharedRoster.displayName", groupName);
				group.getProperties().put("sharedRoster.groupList", "");
			}

			try {
				group.getMembers().remove(jid);
			} catch (Exception e) {}

			group.getMembers().add(jid);

			Map<String, Object> params = new HashMap<String, Object>();
			params.put("member", jid.toString());
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

    public boolean authenticateByAzureAD(String username, String password)
    {
        AuthenticationContext context = null;
        AuthenticationResult result = null;
        ExecutorService service = null;

        try {
            service = Executors.newFixedThreadPool(1);
            context = new AuthenticationContext(AUTHORITY, false, service);

            Future<AuthenticationResult> future = context.acquireToken("https://graph.windows.net", CLIENT_ID, username, password, null);
            result = future.get();

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

    public static class KnownUser implements UserPrincipal, Serializable
    {
        private static final long serialVersionUID = -6226920753748399662L;
        private final String _name;
        private final Object _credential;

        public KnownUser(String name, Object credential)
        {
            _name=name;
            _credential=credential;
        }

        public boolean authenticate(Object credentials)
        {
            return true;
        }

        public String getName()
        {
            return _name;
        }

        public boolean isAuthenticated()
        {
            return true;
        }

        @Override public String toString()
        {
            return _name;
        }
    }

    public interface UserPrincipal extends Principal,Serializable
    {
        boolean authenticate(Object credentials);
        public boolean isAuthenticated();
    }

    public static class RolePrincipal implements Principal,Serializable
    {
        private static final long serialVersionUID = 2998397924051854402L;
        private final String _roleName;

        public RolePrincipal(String name)
        {
            _roleName=name;
        }
        public String getName()
        {
            return _roleName;
        }
    }
}

