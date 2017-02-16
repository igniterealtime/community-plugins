package org.jivesoftware.openfire.plugin.rest.service;

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

import org.jivesoftware.openfire.plugin.rest.exceptions.ServiceException;
import org.jivesoftware.openfire.plugin.rest.exceptions.ExceptionType;

import org.jivesoftware.openfire.sip.sipaccount.SipAccount;
import org.jivesoftware.openfire.sip.sipaccount.SipAccounts;
import org.jivesoftware.openfire.sip.sipaccount.SipAccountDAO;

import net.sf.json.*;

@Path("restapi/v1/sipaccounts")
public class SipService {

	@PostConstruct
	public void init()
	{

	}

	@GET
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public SipAccounts getSipAccounts(@DefaultValue("0") @QueryParam("start") String start, @DefaultValue("250") @QueryParam("count") String count) throws ServiceException
	{
		try {
			return new SipAccounts(SipAccountDAO.getUsers(Integer.parseInt(start), Integer.parseInt(count)));

		} catch (Exception e) {
			throw new ServiceException("Exception", e.getMessage(), ExceptionType.ILLEGAL_ARGUMENT_EXCEPTION, Response.Status.BAD_REQUEST);
		}
	}

	@GET
	@Path("/username/{username}")
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public SipAccount getAccountByUser(@PathParam("username") String username) throws ServiceException
	{
		return SipAccountDAO.getAccountByUser(username);
	}

	@GET
	@Path("/extension/{extension}")
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public SipAccount getAccountByExtn(@PathParam("extension") String extension) throws ServiceException
	{
		return SipAccountDAO.getAccountByExtn(extension);
	}

	@POST
	public Response createSipAccount(SipAccount sipAccount) throws ServiceException
	{
		if (SipAccountDAO.getAccountByUser(sipAccount.getUsername()) != null) {
			SipAccountDAO.update(sipAccount);
			return Response.status(Response.Status.OK).build();
		} else {
			SipAccountDAO.insert(sipAccount);
			return Response.status(Response.Status.CREATED).build();
		}
	}

	@DELETE
	@Path("/{username}")
	public Response deleteUser(@PathParam("username") String propertyKey) throws ServiceException {
		SipAccount sipAccount = SipAccountDAO.getAccountByUser(propertyKey);

		if (sipAccount != null)
		{
			SipAccountDAO.remove(sipAccount);
			return Response.status(Response.Status.OK).build();

		} else {
			return Response.status(Response.Status.BAD_REQUEST).build();
		}
	}
}
