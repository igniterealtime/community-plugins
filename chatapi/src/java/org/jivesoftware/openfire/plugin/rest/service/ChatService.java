package org.jivesoftware.openfire.plugin.rest.service;

import java.io.*;
import java.util.*;
import java.text.*;

import javax.servlet.http.HttpServletRequest;
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
import javax.ws.rs.core.Context;

import javax.xml.bind.*;
import org.codehaus.jackson.map.*;
import org.codehaus.jackson.xc.*;

import org.jivesoftware.openfire.XMPPServer;
import org.jivesoftware.util.*;

import org.jivesoftware.openfire.plugin.rest.controller.UserServiceController;
import org.jivesoftware.openfire.plugin.rest.controller.MUCRoomController;

import org.jivesoftware.openfire.plugin.rest.exceptions.ServiceException;
import org.jivesoftware.openfire.plugin.rest.exceptions.ExceptionType;

import org.jivesoftware.openfire.plugin.rest.entity.RosterEntities;
import org.jivesoftware.openfire.plugin.rest.entity.RosterItemEntity;
import org.jivesoftware.openfire.plugin.rest.entity.UserEntities;
import org.jivesoftware.openfire.plugin.rest.entity.MUCChannelType;
import org.jivesoftware.openfire.plugin.rest.entity.MUCRoomEntities;
import org.jivesoftware.openfire.plugin.rest.entity.MUCRoomEntity;
import org.jivesoftware.openfire.plugin.rest.entity.OccupantEntities;
import org.jivesoftware.openfire.plugin.rest.entity.ParticipantEntities;
import org.jivesoftware.openfire.plugin.rest.RestEventSourceServlet;

import org.jivesoftware.openfire.user.*;
import org.jivesoftware.openfire.SharedGroupException;
import org.jivesoftware.openfire.user.UserNotFoundException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.xmpp.packet.*;
import org.jivesoftware.openfire.archive.*;


@Path("restapi/v1/chat")
public class ChatService {

	private static final Logger Log = LoggerFactory.getLogger(ChatService.class);
	private XMPPServer server;
	private UserServiceController userService;

	@Context
	private HttpServletRequest httpRequest;

	@PostConstruct
	public void init()
	{
		server = XMPPServer.getInstance();
		userService = UserServiceController.getInstance();
	}

	//-------------------------------------------------------
	//
	//	POST xmpp messags
	//
	//-------------------------------------------------------

	@POST
	@Path("/xmpp")
	public Response postXmppMessage(String xmpp) throws ServiceException
	{
		Log.info("postXmppMessage \n" + xmpp);

		try {
			String endUser = getEndUser();

			if (!RestEventSourceServlet.sendXmppMessage(endUser, xmpp))
			{
				throw new ServiceException("Exception", "send xmpp failed", ExceptionType.ILLEGAL_ARGUMENT_EXCEPTION, Response.Status.BAD_REQUEST);
			}

		} catch (Exception e) {
			throw new ServiceException("Exception", e.getMessage(), ExceptionType.ILLEGAL_ARGUMENT_EXCEPTION, Response.Status.BAD_REQUEST);
		}

		return Response.status(Response.Status.OK).build();
	}

    /**
     *		Chat Presence
     */
	//-------------------------------------------------------
	//
	//	POST self presence
	//
	//-------------------------------------------------------

	@POST
	@Path("/presence")
	public Response postPresence(@QueryParam("show") String show, @QueryParam("status") String status) throws ServiceException
	{
		Log.info("postPresence " + show + " " + status);

		try {
			String endUser = getEndUser();

			if (!RestEventSourceServlet.postPresence(endUser, show, status))
			{
				throw new ServiceException("Exception", "send chat failed", ExceptionType.ILLEGAL_ARGUMENT_EXCEPTION, Response.Status.BAD_REQUEST);
			}

		} catch (Exception e) {
			throw new ServiceException("Exception", e.getMessage(), ExceptionType.ILLEGAL_ARGUMENT_EXCEPTION, Response.Status.BAD_REQUEST);
		}

		return Response.status(Response.Status.OK).build();
	}

	//-------------------------------------------------------
	//
	//	POST chat message and GET chat history
	//
	//-------------------------------------------------------

	@POST
	@Path("/messages/{to}")
	public Response postMessage(@PathParam("to") String to, String body) throws ServiceException
	{
		Log.info("postMessage " + to + "\n" + body);

		try {
			String endUser = getEndUser();

			// sent to destination
			if (!RestEventSourceServlet.sendChatMessage(endUser, body, to))
			{
				throw new ServiceException("Exception", "send chat failed", ExceptionType.ILLEGAL_ARGUMENT_EXCEPTION, Response.Status.BAD_REQUEST);
			}

			// echo back to sender
			RestEventSourceServlet.emitData(endUser, "{\"type\": \"chat\", \"to\":\"" + to + "\", \"from\":\"" + makeJid(endUser) + "\", \"body\": \"" + body + "\"}");


		} catch (Exception e) {
			throw new ServiceException("Exception", e.getMessage(), ExceptionType.ILLEGAL_ARGUMENT_EXCEPTION, Response.Status.BAD_REQUEST);
		}

		return Response.status(Response.Status.OK).build();
	}

	@GET
	@Path("/messages")
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public Conversations getConversations(@QueryParam("keywords") String keywords, @QueryParam("to") String to, @QueryParam("start") String start, @QueryParam("end") String end, @QueryParam("room") String room, @QueryParam("service") String service) throws ServiceException
	{
		Log.info("getConversations " + keywords + " " + " " + to  + " " + start + " " + end + " " + room + " " + service);

		try {
			String endUser = getEndUser();

			ArchiveSearch search = new ArchiveSearch();
			JID participant1JID = makeJid(endUser);
			JID participant2JID = null;

			if (to != null) participant2JID = makeJid(to);

			if (participant2JID != null) {
				search.setParticipants(participant1JID, participant2JID);
			} else  {
				search.setParticipants(participant1JID);
			}

			if (start != null)
			{
				DateFormat formatter = new SimpleDateFormat("MM/dd/yy");
				try {
					Date date = formatter.parse(start);
					search.setDateRangeMin(date);
				}
				catch (Exception e) {
					Log.error("getConversations", e);
					throw new ServiceException("Exception", "Bad start date", ExceptionType.ILLEGAL_ARGUMENT_EXCEPTION, Response.Status.BAD_REQUEST);
				}
			}

			if (end != null)
			{
				DateFormat formatter = new SimpleDateFormat("MM/dd/yy");
				try {
					Date date = formatter.parse(end);
					// The user has chosen an end date and expects that any conversation
					// that falls on that day will be included in the search results. For
					// example, say the user choose 6/17/2006 as an end date. If a conversation
					// occurs at 5:33 PM that day, it should be included in the results. In
					// order to make this possible, we need to make the end date one millisecond
					// before the next day starts.
					date = new Date(date.getTime() + JiveConstants.DAY - 1);
					search.setDateRangeMax(date);
				}
				catch (Exception e) {
					Log.error("getConversations", e);
					throw new ServiceException("Exception", "Bad end date", ExceptionType.ILLEGAL_ARGUMENT_EXCEPTION, Response.Status.BAD_REQUEST);
				}
			}

			if (keywords != null) search.setQueryString(keywords);

			if (service == null) service = "conference";

			if (room != null)
			{
				search.setRoom(new JID(room + "@" + service + "." + server.getServerInfo().getXMPPDomain()));
			}

			search.setSortOrder(ArchiveSearch.SortOrder.ascending);

			Collection<Conversation> conversations = new ArchiveSearcher().search(search);
			Collection<Conversation> list = new ArrayList<Conversation>();

			for (Conversation conversation : conversations)
			{
				list.add(conversation);
			}

			return new Conversations(list);

		} catch (Exception e) {
			Log.error("getConversations", e);
			throw new ServiceException("Exception", e.getMessage(), ExceptionType.ILLEGAL_ARGUMENT_EXCEPTION, Response.Status.BAD_REQUEST);
		}
	}
	//-------------------------------------------------------
	//
	//	Search for users. CRUD user profile (properties)
	//
	//-------------------------------------------------------

	@GET
	@Path("/users")
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public UserEntities getUser(@QueryParam("search") String search) throws ServiceException
	{
		return userService.getUsersBySearch(search);
	}

	@POST
	@Path("/users/{propertyName}")
	public Response setUserProperty(@PathParam("propertyName") String propertyName, String propertyValue) throws ServiceException
	{
		try {
			String endUser = getEndUser();
			User user = server.getUserManager().getUser(getEndUser());
			user.getProperties().put(propertyName, propertyValue);

		} catch (Exception e) {
			Log.error("setUserProperty", e);
			throw new ServiceException("Exception", e.getMessage(), ExceptionType.ILLEGAL_ARGUMENT_EXCEPTION, Response.Status.BAD_REQUEST);
		}
		return Response.status(Response.Status.OK).build();
	}

	@DELETE
	@Path("/users/{propertyName}")
	public Response deleteUserProperty(@PathParam("propertyName") String propertyName) throws ServiceException
	{
		try {
			String endUser = getEndUser();
			User user = server.getUserManager().getUser(getEndUser());
			user.getProperties().remove(propertyName);

		} catch (Exception e) {
			Log.error("deleteUserProperty", e);
			throw new ServiceException("Exception", e.getMessage(), ExceptionType.ILLEGAL_ARGUMENT_EXCEPTION, Response.Status.BAD_REQUEST);
		}
		return Response.status(Response.Status.OK).build();
	}

	//-------------------------------------------------------
	//
	//	CRUD contacts
	//
	//-------------------------------------------------------

	@GET
	@Path("/contacts")
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public RosterEntities getUserRoster() throws ServiceException
	{
		RosterEntities roster = RestEventSourceServlet.getRoster(getEndUser());

		if (roster == null)
		{
			throw new ServiceException("Exception", "get roster failed", ExceptionType.ILLEGAL_ARGUMENT_EXCEPTION, Response.Status.BAD_REQUEST);
		}
		return roster;
	}

	@POST
	@Path("/contacts")
	public Response createRoster(RosterItemEntity rosterItemEntity) throws ServiceException
	{
		Log.info("createRoster");

		try {
			String endUser = getEndUser();
			userService.addRosterItem(endUser, rosterItemEntity);

		} catch (Exception e) {
			Log.error("getConversations", e);
			throw new ServiceException("Exception", e.getMessage(), ExceptionType.ILLEGAL_ARGUMENT_EXCEPTION, Response.Status.BAD_REQUEST);
		}
		return Response.status(Response.Status.CREATED).build();
	}

	@PUT
	@Path("/contacts/{rosterJid}")
	public Response updateRoster(@PathParam("rosterJid") String rosterJid, RosterItemEntity rosterItemEntity) throws ServiceException
	{
		Log.info("updateRoster " + rosterJid);

		try {
			String endUser = getEndUser();
			userService.updateRosterItem(endUser, rosterJid, rosterItemEntity);

		} catch (Exception e) {
			Log.error("getConversations", e);
			throw new ServiceException("Exception", e.getMessage(), ExceptionType.ILLEGAL_ARGUMENT_EXCEPTION, Response.Status.BAD_REQUEST);
		}
		return Response.status(Response.Status.CREATED).build();
	}

	@DELETE
	@Path("/contacts/{rosterJid}")
	public Response deleteRoster(@PathParam("rosterJid") String rosterJid) throws ServiceException
	{
		Log.info("deleteRoster " + rosterJid);

		try {
			String endUser = getEndUser();
			userService.deleteRosterItem(endUser, rosterJid);

		} catch (Exception e) {
			Log.error("getConversations", e);
			throw new ServiceException("Exception", e.getMessage(), ExceptionType.ILLEGAL_ARGUMENT_EXCEPTION, Response.Status.BAD_REQUEST);
		}
		return Response.status(Response.Status.CREATED).build();
	}


	//-------------------------------------------------------
	//
	//	get, join, leave, post message chat rooms
	//
	//-------------------------------------------------------

	@GET
	@Path("/rooms")
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public MUCRoomEntities getMUCRooms(@DefaultValue("conference") @QueryParam("servicename") String serviceName, @DefaultValue(MUCChannelType.PUBLIC) @QueryParam("type") String channelType, @QueryParam("search") String roomSearch,	@DefaultValue("false") @QueryParam("expandGroups") Boolean expand)
	{
		return MUCRoomController.getInstance().getChatRooms(serviceName, channelType, roomSearch, expand);
	}

	@GET
	@Path("/rooms/{roomName}")
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public MUCRoomEntity getMUCRoomJSON2(@PathParam("roomName") String roomName, @DefaultValue("conference") @QueryParam("servicename") String serviceName, @DefaultValue("false") @QueryParam("expandGroups") Boolean expand) throws ServiceException
	{
		return MUCRoomController.getInstance().getChatRoom(roomName, serviceName, expand);
	}

	@GET
	@Path("/rooms/{roomName}/participants")
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public ParticipantEntities getMUCRoomParticipants(@PathParam("roomName") String roomName, @DefaultValue("conference") @QueryParam("servicename") String serviceName)
	{
		return MUCRoomController.getInstance().getRoomParticipants(roomName, serviceName);
	}

	@GET
	@Path("/rooms/{roomName}/occupants")
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public OccupantEntities getMUCRoomOccupants(@PathParam("roomName") String roomName,	@DefaultValue("conference") @QueryParam("servicename") String serviceName)
	{
		return MUCRoomController.getInstance().getRoomOccupants(roomName, serviceName);
	}

	@PUT
	@Path("/rooms/{roomName}")
	public Response joinRoom(@DefaultValue("conference") @QueryParam("service") String service, @PathParam("roomName") String roomName) throws ServiceException
	{
		Log.info("joinRoom " + service + " " + roomName);

		try {
			String endUser = getEndUser();

			if (!RestEventSourceServlet.joinRoom(endUser, roomName + "@" + service + "." + server.getServerInfo().getXMPPDomain(), endUser))
			{
				throw new ServiceException("Exception", "join room failed", ExceptionType.ILLEGAL_ARGUMENT_EXCEPTION, Response.Status.BAD_REQUEST);
			}

		} catch (Exception e) {
			throw new ServiceException("Exception", e.getMessage(), ExceptionType.ILLEGAL_ARGUMENT_EXCEPTION, Response.Status.BAD_REQUEST);
		}

		return Response.status(Response.Status.OK).build();
	}

	@DELETE
	@Path("/rooms/{roomName}")
	public Response leaveRoom(@DefaultValue("conference") @QueryParam("service") String service, @PathParam("roomName") String roomName) throws ServiceException
	{
		Log.info("leaveRoom " + service + " " + roomName);

		try {
			String endUser = getEndUser();

			if (!RestEventSourceServlet.leaveRoom(endUser, roomName + "@" + service + "." + server.getServerInfo().getXMPPDomain()))
			{
				throw new ServiceException("Exception", "leave room failed", ExceptionType.ILLEGAL_ARGUMENT_EXCEPTION, Response.Status.BAD_REQUEST);
			}

		} catch (Exception e) {
			throw new ServiceException("Exception", e.getMessage(), ExceptionType.ILLEGAL_ARGUMENT_EXCEPTION, Response.Status.BAD_REQUEST);
		}

		return Response.status(Response.Status.OK).build();
	}

	@POST
	@Path("/rooms/{roomName}")
	public Response postToRoom(@DefaultValue("conference") @QueryParam("service") String service, @PathParam("roomName") String roomName, String body) throws ServiceException
	{
		try {
			String endUser = getEndUser();

			if (!RestEventSourceServlet.sendRoomMessage(endUser, roomName + "@" + service + "." + server.getServerInfo().getXMPPDomain(), body))
			{
				throw new ServiceException("Exception", "send message to room failed", ExceptionType.ILLEGAL_ARGUMENT_EXCEPTION, Response.Status.BAD_REQUEST);
			}

		} catch (Exception e) {
			throw new ServiceException("Exception", e.getMessage(), ExceptionType.ILLEGAL_ARGUMENT_EXCEPTION, Response.Status.BAD_REQUEST);
		}

		return Response.status(Response.Status.OK).build();
	}

	@POST
	@Path("/rooms/{roomName}/{invitedJid}")
	public Response inviteToRoom(@DefaultValue("conference") @QueryParam("service") String service, @PathParam("roomName") String roomName, @PathParam("invitedJid") String invitedJid, String reason) throws ServiceException
	{
		try {
			String endUser = getEndUser();

			if (!RestEventSourceServlet.inviteToRoom(endUser, roomName + "@" + service + "." + server.getServerInfo().getXMPPDomain(), invitedJid, reason))
			{
				throw new ServiceException("Exception", "invite to room failed", ExceptionType.ILLEGAL_ARGUMENT_EXCEPTION, Response.Status.BAD_REQUEST);
			}

		} catch (Exception e) {
			throw new ServiceException("Exception", e.getMessage(), ExceptionType.ILLEGAL_ARGUMENT_EXCEPTION, Response.Status.BAD_REQUEST);
		}

		return Response.status(Response.Status.OK).build();
	}

	//-------------------------------------------------------
	//
	//	Utitlities
	//
	//-------------------------------------------------------

	private String getEndUser() throws ServiceException
	{
		String endUser = httpRequest.getUserPrincipal().getName();

		Log.info("getEndUser " + endUser);

		if (endUser == null)
		{
			throw new ServiceException("Exception", "Access denied", ExceptionType.ILLEGAL_ARGUMENT_EXCEPTION, Response.Status.BAD_REQUEST);
		}

		return endUser;
	}

	private JID makeJid(String participant1)
	{
		JID participant1JID = null;

		try {
			int position = participant1.lastIndexOf("@");

			if (position > -1) {
				String node = participant1.substring(0, position);
				participant1JID = new JID(JID.escapeNode(node) + participant1.substring(position));
			} else {
				participant1JID = new JID(JID.escapeNode(participant1), server.getServerInfo().getXMPPDomain(), null);
			}
		} catch (Exception e) {
			Log.error("makeJid", e);
		}
		return participant1JID;
	}

	private Object jsonToObject(String json, Class objectClass)
	{
		Object object = null;

		try {
			ObjectMapper mapper = new ObjectMapper();
			AnnotationIntrospector introspector = new JaxbAnnotationIntrospector();
			mapper.setAnnotationIntrospector(introspector);
			object = mapper.readValue(json, objectClass);

		} catch (Exception e) {
			Log.error("jsonToObject", e);
		}

		Log.info("jsonToObject\n" + json + "\nObject= " + object);
		return object;
	}

	private String objectToJson(Object object)
	{
		String json = null;

		try {
			ObjectMapper mapper = new ObjectMapper();
			AnnotationIntrospector introspector = new JaxbAnnotationIntrospector();
			mapper.setAnnotationIntrospector(introspector);
			json = mapper.writeValueAsString(object);

		} catch (Exception e) {
			Log.error("objectToJson", e);
		}

		Log.info("objectToJson\n" + json + "\nObject= " + object);
		return json;
	}
}
