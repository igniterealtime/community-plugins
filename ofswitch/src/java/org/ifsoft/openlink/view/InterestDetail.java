package org.ifsoft.openlink.view;

import java.io.IOException;
import java.util.Collection;
import java.util.Iterator;
import java.util.List;
import java.util.ArrayList;

import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.ServletConfig;
import javax.servlet.ServletContext;

import javax.servlet.*;
import javax.servlet.annotation.*;

import org.jivesoftware.util.Log;
import org.jivesoftware.util.cache.Cache;
import org.jivesoftware.util.cache.CacheFactory;
import org.jivesoftware.openfire.XMPPServer;
import org.jivesoftware.openfire.session.LocalClientSession;
import org.jivesoftware.openfire.user.User;
import org.jivesoftware.openfire.user.UserNotFoundException;

import org.ifsoft.openlink.*;
import org.ifsoft.openlink.component.*;

import org.xmpp.packet.JID;
import org.slf4j.*;
import org.slf4j.Logger;

@WebServlet(value="/traderlyncInterestDetail", name="traderlyncInterestDetail") public class InterestDetail extends HttpServlet {

    private static final Logger Log = LoggerFactory.getLogger(InterestDetail.class);


    public void init(ServletConfig servletConfig) throws ServletException {
        super.init(servletConfig);
    }

	public void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
	{
		response.setHeader("Expires", "Sat, 6 May 1995 12:00:00 GMT");
		response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
		response.addHeader("Cache-Control", "post-check=0, pre-check=0");
		response.setHeader("Pragma", "no-cache");
		response.setHeader("Content-Type", "text/html");
		response.setHeader("Connection", "close");

		ServletOutputStream out = response.getOutputStream();

		try {
			out.println("");
			out.println("<html>");
			out.println("    <head>");
			out.println("        <title>User Interest Calls</title>");
			out.println("        <meta name=\"pageID\" content=\"TRADERLYNC-PROFILE-SUMMARY\"/>");
			out.println("    </head>");
			out.println("    <body>");
			out.println("");
			out.println("<br>");

			String interestKey = request.getParameter("interest");
			String action = request.getParameter("action");
			String destination = request.getParameter("destination");
			String callId = request.getParameter("callId");
			String requestAction = request.getParameter("requestAction");

			if (OpenlinkComponent.self.openlinkInterests.containsKey(interestKey))
			{
				OpenlinkUserInterest traderLyncUserInterest = OpenlinkComponent.self.openlinkInterests.get(interestKey);
				OpenlinkUser traderLyncUser = traderLyncUserInterest.getUser();
				OpenlinkInterest traderLyncInterest = traderLyncUserInterest.getInterest();

				if (action != null)
				{
					if ("makeCall".equals(action))
					{
						try {
							int pos = destination.indexOf("@");

							if ( pos > -1)
							{
								OpenlinkComponent.self.intercomCall(null, traderLyncUser.getProfileName(), new JID(destination), null);

							} else {

								OpenlinkComponent.self.makeCall(null, interestKey, traderLyncUser.getHandsetNo(), null, null, destination);
							}

						} catch (Exception e) {
							Log.error("Interest Detail Make call failure " + e);
						}
					}

					if ("requestAction".equals(action) && callId != null && requestAction != null && !"".equals(requestAction))
					{
						OpenlinkComponent.self.processUserAction(null, interestKey, requestAction, callId, destination);
					}

					Thread.sleep(1000);		// wait for first Openlink event and cache update before we update UI
				}

 				String returnAnchor2 = "<a href='traderlync-profile-detail?user=" + traderLyncUser.getProfileName() + "'>" + traderLyncUser.getUserName() + "</a>";

				out.println("<form action=\"traderlync-interest-detail\" method=\"get\" name='openlink'>");
				out.println("<input type='hidden' name='action' value='makeCall'>");
				out.println("<input type='hidden' name='interest' value='" + interestKey + "'>");
				out.println("<table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"100%\"><tr>");
				out.println("<td><div id='jive-title'>" + returnAnchor2 + "&nbsp;>&nbsp;" + traderLyncInterest.getInterestValue()  + "</div></td>");
				out.println("<td><button onclick='openlink.action.value=\"\";openlink.destination.value=\"\";location.href=\"traderlync-interest-detail?interest=" + interestKey + "\"'>Refresh</button></td>");
				out.println("<td align='right'><input type='text' name='destination'><input type=\"submit\" value=\"Make Call\"></td></tr></table>");
				out.println("<div class=\"jive-table\">");
				out.println("<table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"100%\">");
				out.println("<thead>");
				out.println("<tr>");
				out.println("<th nowrap>Call Id</th>");
				out.println("<th nowrap>Caller Id</th>");
				out.println("<th nowrap>Caller Name</th>");
				out.println("<th nowrap>Called Id</th>");
				out.println("<th nowrap>Called Name</th>");
				out.println("<th nowrap>Device</th>");
				out.println("<th nowrap>HS</th>");
				out.println("<th nowrap>State</th>");
				out.println("<th nowrap>Action</th>");
				out.println("<th nowrap>Direction</th>");
				out.println("<th nowrap>Active</th>");
				out.println("<th nowrap>Privacy</th>");
				out.println("</tr>");
				out.println("</thead>");
				out.println("<tbody>");

				Iterator<OpenlinkCall> iter = traderLyncUserInterest.getCalls().values().iterator();
				int i = 1;

				while(iter.hasNext())
				{
					OpenlinkCall traderLyncCall = (OpenlinkCall)iter.next();

					try
					{
						if(i % 2 == 1)
							out.println("<tr class=\"jive-odd\">");
						else
							out.println("<tr class=\"jive-even\">");

						out.println("<td width=\"4%\">");
						out.println("<div title='" + traderLyncCall.getCallID() + "'>" + (traderLyncCall.getCallID().length() > 6 ? traderLyncCall.getCallID().substring(0, 6) + ".." : traderLyncCall.getCallID()) + "</div>");
						out.println("</td>");

						out.println("<td width=\"15%\">");
						out.println(traderLyncCall.getCallerNumber(traderLyncInterest.getInterestType()));
						out.println("</td>");
						out.println("<td width=\"15%\">");
						out.println(traderLyncCall.getCallerName(traderLyncInterest.getInterestType()));
						out.println("</td>");

						out.println("<td width=\"15%\">");
						out.println(traderLyncCall.getCalledNumber(traderLyncInterest.getInterestType()));
						out.println("</td>");
						out.println("<td width=\"15%\">");
						out.println(traderLyncCall.getCalledName(traderLyncInterest.getInterestType()));
						out.println("</td>");

						out.println("<td width=\"8%\">");
						out.println(traderLyncUser.getDeviceNo());
						out.println("</td>");
						out.println("<td width=\"4%\">");
						out.println(traderLyncCall.getHandset());
						out.println("</td>");
						out.println("<td width=\"4%\">");
						out.println(getStateIcon(traderLyncCall.getState()));
						out.println("</td>");
						out.println("<td width=\"4%\">");
						out.println("<select size='1' onchange='location.href=\"traderlync-interest-detail?action=requestAction&callId=" + traderLyncCall.getCallID() + "&interest=" + interestKey + "&destination=\" + openlink.destination.value + \"&requestAction=\" +  this.options[this.selectedIndex].value'><option value=''>Select Action</option>");

						Iterator it4 = traderLyncCall.getValidActions().iterator();

						while( it4.hasNext() )
						{
							String callAction = (String)it4.next();
							out.println("<option value='" + callAction + "'>" + callAction + "</option>");
						}
						out.println("</select>");
						out.println("</td>");
						out.println("<td width=\"4%\">");
						out.println("Incoming".equals(traderLyncCall.getDirection()) ? "<img src=\"images/incoming.jpg\" alt=\"Incoming\" border=\"0\">In" : "<img src=\"images/outgoing.jpg\" alt=\"Outgoing\" border=\"0\">Out");
						out.println("</td>");
						out.println("<td width=\"4%\">");
						out.println("Active".equals(traderLyncCall.getParticipation()) ? "<img src=\"images/success-16x16.gif\" alt=\"Yes\" border=\"0\">" : "&nbsp;");
						out.println("</td>");
						out.println("<td width=\"4%\">");
						out.println("Y".equals(traderLyncCall.getPrivacy()) ? "<img src=\"images/success-16x16.gif\" alt=\"Yes\" border=\"0\">" : "&nbsp;");
						out.println("</td>");
						out.println("</tr>");

						i++;
					}
					catch(Exception e)
					{

					}
				}

				out.println("</tbody>");
				out.println("</table>");
				out.println("</div>");

				out.println("<p>&nbsp;</p><p>&nbsp;</p>");

				out.println("<div id='jive-title'>Interest Subscribers</div>");
				out.println("<div class=\"jive-table\">");
				out.println("<table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"100%\">");
				out.println("<thead>");
				out.println("<tr>");
				out.println("<th nowrap>Subscriber</th>");
				out.println("<th nowrap>User Name</th>");
				out.println("<th nowrap>Full Name</th>");
				out.println("<th nowrap>IP Address</th>");
				out.println("<th nowrap>Online</th>");
				out.println("<th nowrap>Subscription</th>");
				out.println("</tr>");
				out.println("</thead>");
				out.println("<tbody>");

				Iterator<OpenlinkSubscriber> iter2 = traderLyncUserInterest.getSubscribers().values().iterator();
				int j = 1;

				while( iter2.hasNext() )
				{
					OpenlinkSubscriber subscriber = (OpenlinkSubscriber)iter2.next();

					if(j % 2 == 1)
						out.println("<tr valign='top' class=\"jive-odd\">");
					else
						out.println("<tr  valign='top' class=\"jive-even\">");

					out.println("<td width=\"20%\">");
					out.println(subscriber.getJID().toString());
					out.println("</td>");

					out.println("<td width=\"20%\">");
					out.println(subscriber.getJID().getNode() == null ? "" : subscriber.getJID().getNode());
					out.println("</td>");

					out.println("<td width=\"20%\">");
					out.println(subscriber.getName());
					out.println("</td>");

					LocalClientSession session = null;

					try {
            			session = (LocalClientSession) XMPPServer.getInstance().getSessionManager().getSession(subscriber.getJID());
					}
					catch (Exception e) { }

					out.println("<td width=\"10%\">");
					out.println(session == null ? "&nbsp;" : session.getHostAddress());
					out.println("</td>");

					String icon = "<img src=\"images/unavailable.png\" alt=\"Offline\" border=\"0\">";

					if (subscriber.getOnline())
					{
						icon = "<img src=\"images/available.png\" alt=\"Online\" border=\"0\">";
					}

					out.println("<td width=\"10%\">");
					out.println(icon);
					out.println("</td>");

					out.println("<td width=\"20%\">");
					out.println(subscriber.getSubscription());
					out.println("</td>");

					out.println("</tr>");

					j++;
				}

				out.println("</tbody>");
				out.println("</table>");
				out.println("</div>");
			}

			out.println("</form>");
			out.println("</body>");
			out.println("</html>");

        }
        catch (Exception e) {
        	Log.error("InterestDetail", e);
        }
	}

	private String getStateIcon(String state)
	{
		String 	icon = "<img src='images/call_cleared.png' alt='Cleared' border='0'>&nbsp;" + state;

		if ("ConnectionCleared".equals(state))
		{
			icon = "<img src='images/call_cleared.png' alt='Cleared' border='0'>&nbsp;Cleared";
		}

		if ("CallConferenced".equals(state))
		{
			icon = "<img src='images/call_conferenced.png' alt='Conferenced' border='0'>&nbsp;Conferenced";
		}

		if ("CallDelivered".equals(state))
		{
			icon = "<img src='images/call_delivered.png' alt='Delivered' border='0'>&nbsp;Delivered";
		}

		if ("CallOriginated".equals(state))
		{
			icon = "<img src='images/call_originated.png' alt='Originated' border='0'>&nbsp;Originated";
		}

		if ("CallEstablished".equals(state))
		{
			icon = "<img src='images/call_established.png' alt='Established' border='0'>&nbsp;Established";
		}

		if ("CallBusy".equals(state))
		{
			icon = "<img src='images/call_busy.png' alt='Busy' border='0'>&nbsp;Busy";
		}

		if ("CallHeld".equals(state))
		{
			icon = "<img src='images/call_held.png' alt='Held' border='0'>&nbsp;Held";
		}

		if ("CallMissed".equals(state))
		{
			icon = "<img src='images/call_missed.png' alt='Missed' border='0'>&nbsp;Missed";
		}

		if ("CallHeldElsewhere".equals(state))
		{
			icon = "<img src='images/call_held.png' alt='Held' border='0'>&nbsp;Held";
		}

		if ("CallFailed".equals(state))
		{
			icon = "<img src='images/call_cleared.png' alt='Failed' border='0'>&nbsp;Failed";
		}

		if ("CallTransferred".equals(state))
		{
			icon = "<img src='images/call_unknown.png' alt='Transferred' border='0'>&nbsp;Transferred";
		}

		if ("CallTransferring".equals(state))
		{
			icon = "<img src='images/call_unknown.png' alt='Transferring' border='0'>&nbsp;Transferring";
		}

		return icon;
	}
}

