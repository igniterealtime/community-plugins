package org.ifsoft.openlink.view;

import java.io.IOException;
import java.util.*;

import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.ServletConfig;
import javax.servlet.ServletContext;

import javax.servlet.*;
import javax.servlet.annotation.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.jivesoftware.util.Log;
import org.jivesoftware.util.cache.Cache;
import org.jivesoftware.util.cache.CacheFactory;
import org.jivesoftware.openfire.XMPPServer;
import org.jivesoftware.openfire.roster.Roster;
import org.jivesoftware.openfire.roster.RosterItem;
import org.jivesoftware.openfire.roster.RosterManager;
import org.jivesoftware.openfire.user.UserManager;
import org.jivesoftware.openfire.user.User;

import org.ifsoft.openlink.*;
import org.ifsoft.openlink.component.*;

import org.xmpp.packet.JID;


@WebServlet(value="/traderlyncProfileDetail", name="traderlyncProfileDetail") public class ProfileDetail extends HttpServlet
{
    private static final Logger Log = LoggerFactory.getLogger(ProfileDetail.class);
    private String defaultInterestKey = null;


    public void init(ServletConfig servletConfig) throws ServletException {
        super.init(servletConfig);
    }

	public void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		response.setHeader("Expires", "Sat, 6 May 1995 12:00:00 GMT");
		response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
		response.addHeader("Cache-Control", "post-check=0, pre-check=0");
		response.setHeader("Pragma", "no-cache");
		response.setHeader("Content-Type", "text/html");
		response.setHeader("Connection", "close");

		ServletOutputStream out = response.getOutputStream();

		try {
			String userKey = request.getParameter("user");
			String siteID = request.getParameter("site");
			String siteName = request.getParameter("siteName");
			String action = request.getParameter("action");
			String vMesssage = request.getParameter("vmsg");
			String vmComment = request.getParameter("vmComment");
			String vmName = request.getParameter("vmName");
			String vmLabel = request.getParameter("vmLabel");

			out.println("");
			out.println("<html>");
			out.println("<head>");
			out.println("  <title>User Interests</title>");
			out.println("  <meta name=\"pageID\" content=\"TRADERLYNC-PROFILE-SUMMARY\"/>");
			out.println("  <script>function doCollapse(id){if(document.getElementById(id).style.display == \"none\"){document.getElementById(id).style.display = \"\";}else{document.getElementById(id).style.display = \"none\";}}</script>");
			out.println("</head>");
			out.println("<body>");
			out.println("<br>");

			if (OpenlinkComponent.self.traderLyncUserTable.containsKey(userKey))
			{
				OpenlinkUser traderLyncUser = OpenlinkComponent.self.traderLyncUserTable.get(userKey);

				try {
					//OpenlinkComponent.self.getSkype4BUser(userKey);

				} catch (Exception e)  {}

				if (action != null)
				{
					if ("play".equals(action))
					{

					}

					else

					if ("edit".equals(action))
					{

					}


					else

					if ("create".equals(action))
					{

					}

					else

					if ("delete".equals(action))
					{

					}

					Thread.sleep(1000);
					response.sendRedirect("traderlync-profile-detail?user=" + userKey + "&site=" + siteID + "&siteName=" + siteName);
				}


				out.println("<table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"100%\"><tr valign='top'><td colspan='2'><div id='jive-title'>" + traderLyncUser.getProfileName() + "&nbsp;&nbsp;(" + traderLyncUser.getUserName() + ")</div></td></tr>");
				out.println("<tr valign='top'><td><div id='jive-title'></div></td></tr>");

				out.println("<tr valign='top'><td><div id='jive-title'><center>Direct Lines</center></div>");
				out.println("<div class=\"jive-table\">");
				out.println("<table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"100%\">");
				out.println("<thead>");
				out.println("<tr>");
				out.println("<th nowrap>Interest Id</th>");
				out.println("<th nowrap>Label</th>");
				out.println("<th nowrap>Line</th>");
				out.println("<th nowrap>Subs</th>");
				out.println("<th nowrap>Calls</th>");
				out.println("</tr>");
				out.println("</thead>");
				out.println("<tbody>");

				Iterator<OpenlinkInterest> iter = traderLyncUser.getInterests().values().iterator();
				int i = 1;

				while( iter.hasNext() )
				{
					OpenlinkInterest traderLyncInterest = (OpenlinkInterest)iter.next();

					try
					{
						if ("L".equals(traderLyncInterest.getInterestType()))
						{
							if(i % 2 == 1)
								out.println("<tr valign='top' class=\"jive-odd\">");
							else
								out.println("<tr  valign='top' class=\"jive-even\">");

							String traderLyncInterestKey = traderLyncInterest.getInterestId() + traderLyncUser.getUserNo();
							String interestValue = traderLyncInterest.getInterestValue();
							if (interestValue.startsWith("tel:")) interestValue = interestValue.substring(4);
							OpenlinkUserInterest traderLyncUserInterest = traderLyncInterest.getUserInterests().get(traderLyncUser.getUserNo());
							int callCount = traderLyncUserInterest.getCalls().size();
							int subscriberCount = traderLyncUserInterest.getSubscribers().size();

							out.println("<td width=\"10%\">");
							out.println("<a href='traderlync-interest-detail?interest=" + traderLyncInterestKey + (callCount == 0 ? "&action=makeCall&destination=" + java.net.URLEncoder.encode(interestValue, "UTF-8") : "") + "'>" + traderLyncInterest.getInterestId() + "</a>");
							out.println("</td>");
							out.println("<td width=\"60%\">");
							out.println(traderLyncInterest.getInterestLabel());
							out.println("</td>");
							out.println("<td width=\"10%\">");
							out.println(traderLyncInterest.getInterestValue());
							out.println("</td>");
							out.println("<td width=\"10%\">");
							out.println(subscriberCount == 0 ? "" : String.valueOf(subscriberCount));
							out.println("</td>");

							if (callCount == 0)
							{
								out.println("<td width=\"20\">&nbsp;</td>");

							} else {
								out.println("<td style='background-color:#4dc027;text-align:center' width=\"20\"><font color='#ffffff'>");
								out.println(String.valueOf(callCount));
								out.println("</font></td>");
							}

							out.println("</tr>");

							i++;
						}
					}
					catch(Exception e)
					{

					}
				}
				out.println("</tbody>");
				out.println("</table>");
				out.println("</div>");
				out.println("<p></p>");

				out.println("</td><td>");

				out.println("<div id='jive-title'><center>Directory Numbers</center></div>");
				out.println("<div class=\"jive-table\">");
				out.println("<table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"100%\">");
				out.println("<thead>");
				out.println("<tr>");
				out.println("<th nowrap>Interest Id</th>");
				out.println("<th nowrap>Label</th>");
				out.println("<th nowrap>DN</th>");
				out.println("<th nowrap>Callset</th>");
				out.println("<th nowrap>Subs</th>");
				out.println("<th nowrap>Max</th>");
				out.println("<th nowrap>Calls</th>");
				out.println("<th nowrap>Fwd</th>");
				out.println("<th nowrap>Def</th>");
				out.println("</tr>");
				out.println("</thead>");
				out.println("<tbody>");

				iter = traderLyncUser.getInterests().values().iterator();
				i = 1;

				while( iter.hasNext() ){
					OpenlinkInterest traderLyncInterest = (OpenlinkInterest)iter.next();

					try
					{
						if ("D".equals(traderLyncInterest.getInterestType()))
						{
							if(i % 2 == 1)
								out.println("<tr valign='top' class=\"jive-odd\">");
							else
								out.println("<tr valign='top' class=\"jive-even\">");

							String traderLyncInterestKey = traderLyncInterest.getInterestId()  + traderLyncUser.getUserNo();
							OpenlinkUserInterest traderLyncUserInterest = traderLyncInterest.getUserInterests().get(traderLyncUser.getUserNo());
							int callCount = traderLyncUserInterest.getCalls().size();
							int max = traderLyncUserInterest.getMaxNumCalls();
							int subscriberCount = traderLyncUserInterest.getSubscribers().size();

							out.println("<td width=\"10%\">");
							out.println("<a href='traderlync-interest-detail?interest=" + traderLyncInterestKey + "'>" + traderLyncInterest.getInterestId() + "</a>");
							out.println("</td>");
							out.println("<td width=\"30%\">");
							out.println(traderLyncInterest.getInterestLabel());
							out.println("</td>");
							out.println("<td width=\"10%\">");
							out.println(traderLyncInterest.getInterestValue());
							out.println("</td>");
							out.println("<td width=\"10%\">");
							out.println(traderLyncInterest.getCallset() == null ? "" : traderLyncInterest.getCallset());
							out.println("</td>");
							out.println("<td width=\"10%\">");
							out.println(subscriberCount == 0 ? "" : String.valueOf(subscriberCount));
							out.println("</td>");
							out.println("<td width=\"10%\">");
							out.println(max == 0 ? "" : String.valueOf(max));
							out.println("</td>");

							if (callCount == 0)
							{
								out.println("<td width=\"10%\">&nbsp;</td>");

							} else {
								out.println("<td style='background-color:#4dc027;text-align:center' width=\"10%\"><font color='#ffffff'>");
								out.println(String.valueOf(callCount));
								out.println("</font></td>");
							}

							out.println("<td width=\"5%\">");
							out.println("true".equals(traderLyncUserInterest.getCallFWD()) ? "<img src=\"images/success-16x16.gif\" alt='" + traderLyncInterest.getUserInterests().get(traderLyncUser.getUserNo()).getCallFWDDigits() + "' border=\"0\">" : "&nbsp;");
							out.println("</td>");

							out.println("<td width=\"5%\">");
							out.println("true".equals(traderLyncUserInterest.getDefault()) ? "<img src=\"images/success-16x16.gif\" alt=\"Yes\" border=\"0\">" : "&nbsp;");
							out.println("</td>");

							out.println("</tr>");

							if ("true".equals(traderLyncUserInterest.getDefault())) defaultInterestKey = traderLyncInterestKey;

							i++;
						}
					}
					catch(Exception e)
					{

					}
				}
				out.println("</tbody>");
				out.println("</table>");
				out.println("</div>");
				out.println("<p></p>");

				out.println("</td></tr><tr valign='top'><td>");

				out.println("<div id='jive-title'><center>Speed Dial Features</center></div>");
				out.println("<div class=\"jive-table\">");
				out.println("<table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"100%\">");
				out.println("<thead>");
				out.println("<tr>");
				out.println("<th nowrap>Feature Id</th>");
				out.println("<th nowrap>Label</th>");
				out.println("<th nowrap>Dialable Number</th>");
				out.println("</tr>");
				out.println("</thead>");
				out.println("<tbody>");

				RosterManager rosterManager = XMPPServer.getInstance().getRosterManager();
				Roster roster = rosterManager.getRoster(userKey);

				List<RosterItem> rosterItems = new ArrayList<RosterItem>(roster.getRosterItems());
				Collections.sort(rosterItems, new RosterItemComparator());

				i = 1;

				for (RosterItem rosterItem : rosterItems)
				{
					try {
						String itemUsername = rosterItem.getJid().getNode();
						User itemUser = XMPPServer.getInstance().getUserManager().getUser(itemUsername);
						String phone = itemUser.getProperties().get("wirelynk.phone.other");

						if (phone != null && phone.startsWith("tel:") && phone.indexOf(";wl=") == -1)
						{
							if (phone.startsWith("tel:")) phone = phone.substring(4);

							if(i % 2 == 1)
								out.println("<tr valign='top' class=\"jive-odd\">");
							else
								out.println("<tr valign='top' class=\"jive-even\">");

							out.println("<td width=\"10%\">");

							if (defaultInterestKey == null)
							{
								out.println(itemUsername);
							} else {
								out.println("<a href='traderlync-interest-detail?interest=" + defaultInterestKey + "&action=makeCall&destination=" +  java.net.URLEncoder.encode(phone, "UTF-8") + "'>" + itemUsername + "</a>");
							}

							out.println("</td>");
							out.println("<td width=\"70%\">");
							out.println(rosterItem.getNickname());
							out.println("</td>");
							out.println("<td width=\"20%\">");
							out.println(phone);
							out.println("</td>");

							out.println("</tr>");
							i++;
						}

					} catch (Exception e) {

					}
				}

				out.println("</tbody>");
				out.println("</table>");
				out.println("</div>");
				out.println("<p></p>");

				out.println("</td><td>");

				out.println("<div id='jive-title'><center>Intercom Group Features</center></div>");
				out.println("<div class=\"jive-table\">");
				out.println("<table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"100%\">");
				out.println("<thead>");
				out.println("<tr>");
				out.println("<th nowrap>Feature Id</th>");
				out.println("<th nowrap>Label</th>");
				out.println("</tr>");
				out.println("</thead>");
				out.println("<tbody>");

				Iterator<OpenlinkGroup> iter3 = traderLyncUser.getGroups().iterator();
				i = 1;

				while( iter3.hasNext() )
				{
					OpenlinkGroup traderLyncGroup = (OpenlinkGroup)iter3.next();

					try
					{
						if(i % 2 == 1)
							out.println("<tr valign='top' class=\"jive-odd\">");
						else
							out.println("<tr  valign='top' class=\"jive-even\">");

						out.println("<td width=\"20%\">");
						out.println(traderLyncGroup.getGroupID());
						out.println("</td>");
						out.println("<td width=\"80%\">");
						out.println(traderLyncGroup.getName());
						out.println("</td>");;

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
				out.println("<p></p>");

				out.println("</td></tr></table>");
			}

			out.println("</body>");
			out.println("</html>");
        }
        catch (Exception e) {
        	Log.error("profile detail", e);
        }
	}

    class RosterItemComparator implements Comparator<RosterItem>
    {
        public int compare(RosterItem itemA, RosterItem itemB)
        {
            return itemA.getJid().toBareJID().compareTo(itemB.getJid().toBareJID());
        }
    }
}

