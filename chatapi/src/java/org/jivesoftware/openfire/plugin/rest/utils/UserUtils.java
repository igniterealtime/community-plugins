package org.jivesoftware.openfire.plugin.rest.utils;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map.Entry;

import org.jivesoftware.openfire.XMPPServer;
import org.jivesoftware.openfire.plugin.rest.entity.UserEntity;
import org.jivesoftware.openfire.plugin.rest.entity.UserProperty;
import org.jivesoftware.openfire.user.User;
import org.jivesoftware.openfire.user.UserAlreadyExistsException;
import org.jivesoftware.openfire.group.Group;
import org.jivesoftware.openfire.group.GroupManager;
import org.jivesoftware.openfire.group.GroupJID;
import org.jivesoftware.openfire.group.GroupNotFoundException;
import org.xmpp.packet.JID;
import org.xmpp.packet.Presence;

/**
 * The Class UserUtils.
 */
public class UserUtils {

	/**
	 * Instantiates a new user utils.
	 */
	private UserUtils() {
		throw new AssertionError();
	}

	/**
	 * Convert users to user entities.
	 *
	 * @param users            the users
	 * @param userSearch the user search
	 * @return the list
	 */
	public static List<UserEntity> convertUsersToUserEntities(Collection<User> users, String userSearch) {
		List<UserEntity> result = new ArrayList<UserEntity>();

		for (User user : users) {
			if (userSearch != null) {
				if (!user.getUsername().contains(userSearch)) {
					continue;
				}
			}

			result.add(convertUserToUserEntity(user));
		}
		return result;
	}

	/**
	 * Convert user to user entity.
	 *
	 * @param user
	 *            the user
	 * @return the user entity
	 */
	public static UserEntity convertUserToUserEntity(User user) {
		UserEntity userEntity = new UserEntity(user.getUsername(), user.getName(), user.getEmail());

		List<UserProperty> userProperties = new ArrayList<UserProperty>();
		for (Entry<String, String> property : user.getProperties().entrySet()) {
			userProperties.add(new UserProperty(property.getKey(), property.getValue()));
		}
		userEntity.setProperties(userProperties);

		Presence presence = XMPPServer.getInstance().getPresenceManager().getPresence(user);

        if (presence == null) {
        	userEntity.setShow("offline");
        }
        else if (presence.getShow() == null) {
        	userEntity.setShow("available");
        }
        else if (presence.getShow().equals(org.xmpp.packet.Presence.Show.away)) {
        	userEntity.setShow("away");
        }
        else if (presence.getShow().equals(org.xmpp.packet.Presence.Show.chat)) {
        	userEntity.setShow("chat");
        }
        else if (presence.getShow().equals(org.xmpp.packet.Presence.Show.dnd)) {
        	userEntity.setShow("dnd");
        }
        else if (presence.getShow().equals(org.xmpp.packet.Presence.Show.xa)) {
        	userEntity.setShow("xa");
        }

        if (presence != null) userEntity.setStatus(presence.getStatus());

		return userEntity;
	}

	/**
	 * Checks if is valid sub type.
	 *
	 * @param subType            the sub type
	 * @return true, if is valid sub type
	 * @throws UserAlreadyExistsException the user already exists exception
	 */
	public static void checkSubType(int subType) throws UserAlreadyExistsException {
		if (!(subType >= -1 && subType <= 3)) {
			throw new UserAlreadyExistsException();
		}
	}


	/**
	 * Check and get jid.
	 *
	 * @param jid the jid
	 * @return the jid
	 */
	public static JID checkAndGetJID(String jid) {
		if(isValidBareJid(jid)) {
			return new JID(jid);
		} else if (isValidGroupName(jid)) {
			GroupJID gjid = new GroupJID(jid);
			return gjid.asBareJID();
		} else {
			return XMPPServer.getInstance().createJID(jid, null);
		}
	}

	/**
	 * Checks if is valid bare jid.
	 *
	 * @param jid the jid
	 * @return true, if is valid bare jid
	 */
	public static boolean isValidBareJid(String jid) {
		final int index = jid.indexOf('@');
		if (index == -1) {
			return false;
		} else if (jid.indexOf('@', index + 1) != -1) {
			return false;
		}
		return true;
	}
	/**
	 * Checks if this group exists.
	 *
	 * @param groupname The groupname as a string
	 * @return true, if the groupname exists
	 */
	public static boolean isValidGroupName(String groupname) {
		try {
			Group g = GroupManager.getInstance().getGroup(groupname);
		} catch(GroupNotFoundException e) {
			return false;
		}
		return true;
	}
}
