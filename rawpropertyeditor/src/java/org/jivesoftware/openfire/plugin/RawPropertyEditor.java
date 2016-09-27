package org.jivesoftware.openfire.plugin;

import java.io.File;
import java.util.Map;

import org.jivesoftware.openfire.XMPPServer;
import org.jivesoftware.openfire.container.Plugin;
import org.jivesoftware.openfire.container.PluginManager;
import org.jivesoftware.openfire.group.Group;
import org.jivesoftware.openfire.group.GroupManager;
import org.jivesoftware.openfire.group.GroupNotFoundException;
import org.jivesoftware.openfire.user.User;
import org.jivesoftware.openfire.user.UserManager;
import org.jivesoftware.openfire.user.UserNotFoundException;
import org.xmpp.packet.JID;

public class RawPropertyEditor implements Plugin {

	private UserManager userManager;
	private XMPPServer server;
	private GroupManager groupManager;

	@Override
	public void initializePlugin(PluginManager manager, File pluginDirectory) {

		System.out.println("Starting Raw Property Editor Plugin");
		server = XMPPServer.getInstance();
		userManager = server.getUserManager();
		groupManager = GroupManager.getInstance();

	}

	private User getAndCheckUser(String username) {
		JID targetJID = server.createJID(username, null);
		try {
			return userManager.getUser(targetJID.getNode());
		} catch (UserNotFoundException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return null;
	}

	private Group getAndCheckGroup(String groupname) {
		JID targetJID = server.createJID(groupname, null, true);

		try {
			return groupManager.getGroup(targetJID.getNode());
		} catch (GroupNotFoundException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return null;
	}

	@Override
	public void destroyPlugin() {
		System.out.println("Destroy Raw Property Editor Plugin");
	}

	/*
	 * public UserEntity getUserEntity(String username) { try { return
	 * usc.getUserEntity(username); } catch (ServiceException e) { // TODO
	 * Auto-generated catch block e.printStackTrace(); } return null; }
	 * 
	 */
	/*
	 * public void addProperties(String username, String propname, String
	 * propvalue) {
	 * 
	 * try { User user = getAndCheckUser(username); List<UserProperty>
	 * properties = new ArrayList<UserProperty>(); properties.add(new
	 * UserProperty(propname, propvalue)); // user.getProperties().clear(); for
	 * (UserProperty property : properties) {
	 * user.getProperties().put(property.getKey(), property.getValue()); }
	 * 
	 * } catch (Exception e) { e.printStackTrace(); }
	 * 
	 * }
	 */
	public void addProperties(String username, String propname, String propvalue) {

		try {
			User user = getAndCheckUser(username);
			user.getProperties().put(propname, propvalue);
		} catch (Exception e) {
			e.printStackTrace();
		}

	}

	public void addGroupProperties(String groupname, String propname, String propvalue) {

		try {
			Group group = getAndCheckGroup(groupname);
			group.getProperties().put(propname, propvalue);
		} catch (Exception e) {
			e.printStackTrace();
		}

	}

	public void deleteGroupProperties(String groupname, String propname) {
		try {
			Group group = getAndCheckGroup(groupname);
			group.getProperties().remove(propname);
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	public void deleteProperties(String username, String propname) {
		try {
			User user = getAndCheckUser(username);
			user.getProperties().remove(propname);
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	/*
	 * public List<UserProperty> getUserProperties(UserEntity user) { return
	 * user.getProperties();
	 * 
	 * }
	 */
	public Map<String, String> getUserProperties(String username) {
		User user = getAndCheckUser(username);
		return user.getProperties();
	}

	public Map<String, String> getGroupProperties(String groupname) {
		Group group = getAndCheckGroup(groupname);
		return group.getProperties();
	}



}