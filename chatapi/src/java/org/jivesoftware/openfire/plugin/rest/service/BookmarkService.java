package org.jivesoftware.openfire.plugin.rest.service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;

import javax.annotation.PostConstruct;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.QueryParam;
import javax.ws.rs.DefaultValue;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.xmpp.packet.JID;

import org.jivesoftware.util.NotFoundException;
import org.jivesoftware.openfire.plugin.rest.exceptions.ServiceException;

import org.jivesoftware.openfire.group.Group;
import org.jivesoftware.openfire.group.GroupManager;
import org.jivesoftware.openfire.group.GroupNotFoundException;
import org.jivesoftware.openfire.plugin.rest.exceptions.ExceptionType;

import org.jivesoftware.openfire.plugin.spark.Bookmark;
import org.jivesoftware.openfire.plugin.spark.Bookmarks;
import org.jivesoftware.openfire.plugin.spark.BookmarkManager;

@Path("restapi/v1/bookmarks")
public class BookmarkService {

	private static final Logger Log = LoggerFactory.getLogger(BookmarkService.class);

	@PostConstruct
	public void init() {

	}

	@POST
	public Bookmark createBookmark(Bookmark newBookmark) throws ServiceException {
		Log.info("createBookmark " + newBookmark);

		try {
			return new Bookmark(newBookmark.getType(), newBookmark.getName(), newBookmark.getValue(),
					newBookmark.getUsers(), newBookmark.getGroups());

		} catch (Exception e) {
			throw new ServiceException("Exception", e.getMessage(), ExceptionType.ILLEGAL_ARGUMENT_EXCEPTION,
					Response.Status.BAD_REQUEST);
		}
	}

	@GET
	@Path("/")
	@Produces({ MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON })
	public Bookmarks getBookmarks() throws ServiceException {
		Log.info("getBookmarks ");
		try {
			return new Bookmarks(BookmarkManager.getBookmarks());

		} catch (Exception e) {
			throw new ServiceException("Exception", e.getMessage(), ExceptionType.ILLEGAL_ARGUMENT_EXCEPTION,
					Response.Status.BAD_REQUEST);
		}
	}

	@GET
	@Path("/user/{userID}")
	public Bookmarks getBookmarkss(@PathParam("userID") String userid) throws ServiceException {
		Log.info("getBookmarks " + userid);
		Collection<Bookmark> bookmarks = new ArrayList<Bookmark>();

		try {
			for (Bookmark bookmark : BookmarkManager.getBookmarks()) {
				if (isBookmarkForJID(userid, bookmark)) {
					bookmarks.add(bookmark);

				}
			}
			return new Bookmarks(bookmarks);
		} catch (Exception e) {
			throw new ServiceException("Exception", e.getMessage(), ExceptionType.ILLEGAL_ARGUMENT_EXCEPTION,
					Response.Status.BAD_REQUEST);
		}
	}

	private boolean isBookmarkForJID(String username, Bookmark bookmark) {
		// String username = jid.getNode();
		Log.info("isbookmarkforJid " + username);
		Log.info(bookmark.getUsers().toString());
		if (bookmark.isGlobalBookmark()) {
			return true;
		}
		if (bookmark.getUsers().contains(username)) {
			Log.info("true");
			return true;

		}

		Collection<String> groups = bookmark.getGroups();

		if (groups != null && !groups.isEmpty()) {
			GroupManager groupManager = GroupManager.getInstance();
			for (String groupName : groups) {
				try {
					Group group = groupManager.getGroup(groupName);
					if (group.isUser(username)) {
						Log.info("true");
						return true;
					}
				} catch (GroupNotFoundException e) {
					Log.debug(e.getMessage(), e);
				}
			}
		}
		Log.info("false");
		return false;
	}

	@GET
	@Path("/{bookmarkID}")
	@Produces({ MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON })
	public Bookmark getBookmark(@PathParam("bookmarkID") String bookmarkID) throws ServiceException {
		Log.info("getBookmark " + bookmarkID);

		try {
			return new Bookmark(Long.parseLong(bookmarkID));

		} catch (Exception e) {
			throw new ServiceException("Exception", e.getMessage(), ExceptionType.ILLEGAL_ARGUMENT_EXCEPTION,
					Response.Status.BAD_REQUEST);
		}
	}

	@GET
	@Path("/{bookmarkID}/property")
	public String getBookmark(@PathParam("bookmarkID") String bookmarkID, @QueryParam("name") String name)
			throws ServiceException {
		Log.info("getBookmark property " + bookmarkID + " " + name);

		try {
			Bookmark bookmark = BookmarkManager.getBookmark(Long.parseLong(bookmarkID));
			return bookmark.getProperty(name);

		} catch (Exception e) {
			throw new ServiceException("Exception", e.getMessage(), ExceptionType.ILLEGAL_ARGUMENT_EXCEPTION,
					Response.Status.BAD_REQUEST);
		}
	}

	@DELETE
	@Path("/{bookmarkID}")
	public Response deleteBookmark(@PathParam("bookmarkID") String bookmarkID) throws ServiceException {
		Log.info("deleteBookmark " + bookmarkID);

		try {
			BookmarkManager.deleteBookmark(Long.parseLong(bookmarkID));

		} catch (Exception e) {
			throw new ServiceException("Exception", e.getMessage(), ExceptionType.ILLEGAL_ARGUMENT_EXCEPTION,
					Response.Status.BAD_REQUEST);
		}

		return Response.status(Response.Status.OK).build();
	}

	@PUT
	@Path("/{bookmarkID}")
	public Bookmark updateBookmark(@PathParam("bookmarkID") String bookmarkID, Bookmark newBookmark)
			throws ServiceException {
		Log.info("updateBookmark " + bookmarkID + " " + newBookmark.getType() + " " + newBookmark.getName() + " "
				+ newBookmark.getValue() + " " + newBookmark.getUsers() + " " + newBookmark.getGroups() + " "
				+ newBookmark.getProperties());

		try {
			Bookmark bookmark = BookmarkManager.getBookmark(Long.parseLong(bookmarkID));
			bookmark.setType(newBookmark.getType());
			bookmark.setValue(newBookmark.getValue());
			bookmark.setUsers(newBookmark.getUsers());
			bookmark.setGroups(newBookmark.getGroups());
			return bookmark;

		} catch (Exception e) {
			throw new ServiceException("Exception", e.getMessage(), ExceptionType.ILLEGAL_ARGUMENT_EXCEPTION,
					Response.Status.BAD_REQUEST);
		}
	}

	@PUT
	@Path("/{bookmarkID}/property")
	public Bookmark updateBookmarkProperty(@PathParam("bookmarkID") String bookmarkID, @QueryParam("name") String name,
			@QueryParam("value") String value) throws ServiceException {
		Log.info("updateBookmarkProperty " + bookmarkID + " " + name + " " + value);

		try {
			Bookmark bookmark = BookmarkManager.getBookmark(Long.parseLong(bookmarkID));
			bookmark.setProperty(name, value);
			return bookmark;

		} catch (Exception e) {
			throw new ServiceException("Exception", e.getMessage(), ExceptionType.ILLEGAL_ARGUMENT_EXCEPTION,
					Response.Status.BAD_REQUEST);
		}
	}

	@DELETE
	@Path("/{bookmarkID}/property")
	public Bookmark deleteBookmarkProperty(@PathParam("bookmarkID") String bookmarkID, @QueryParam("name") String name)
			throws ServiceException {
		Log.info("deleteBookmarkProperty " + bookmarkID + " " + name);

		try {
			Bookmark bookmark = BookmarkManager.getBookmark(Long.parseLong(bookmarkID));
			bookmark.deleteProperty(name);
			return bookmark;

		} catch (Exception e) {
			throw new ServiceException("Exception", e.getMessage(), ExceptionType.ILLEGAL_ARGUMENT_EXCEPTION,
					Response.Status.BAD_REQUEST);
		}
	}
}