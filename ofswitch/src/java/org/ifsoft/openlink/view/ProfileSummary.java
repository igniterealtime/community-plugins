package org.ifsoft.openlink.view;

import java.io.IOException;
import java.util.Collection;
import java.util.Iterator;
import java.util.List;
import java.util.ArrayList;
import java.util.Vector;
import java.util.Collections;

import javax.servlet.*;
import javax.servlet.annotation.*;

import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.ServletConfig;
import javax.servlet.ServletContext;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.*;
import org.slf4j.Logger;

import org.jivesoftware.util.Log;
import org.jivesoftware.util.cache.Cache;
import org.jivesoftware.util.cache.CacheFactory;
import org.jivesoftware.openfire.XMPPServer;
import org.jivesoftware.openfire.user.User;
import org.jivesoftware.openfire.user.UserNotFoundException;

import org.ifsoft.openlink.*;
import org.ifsoft.openlink.component.*;

@WebServlet(value="/traderlyncProfileSummary", name="traderlyncProfileSummary") public class ProfileSummary extends HttpServlet {

    private Collection<Site> sites;
    private static final Logger Log = LoggerFactory.getLogger(ProfileSummary.class);

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

		String callback = request.getParameter("callback");
		String remove = request.getParameter("remove");
		String userNo = request.getParameter("userno");

		try {

			if (remove != null && userNo != null)
			{
				//OpenlinkComponent.self.traderLyncLinkService.freeCallback(userNo);
				response.sendRedirect("traderlync-profile-summary?");
			}

			out.println("");
			out.println("<html>");
			out.println("    <head>");
			out.println("        <title>User Profiles</title>");
			out.println("        <meta name=\"pageID\" content=\"TRADERLYNC-PROFILE-SUMMARY\"/>");
			out.println("    </head>");
			out.println("    <body>");
			out.println("");
			out.println("<br>");

			out.println("<table cellpadding=\"2\" cellspacing=\"2\" border=\"0\"><tr><td>Pages:[</td>");

			int linesCount = 100;
			int userCounter = OpenlinkComponent.self.getUserCount();
			int pageCounter = (userCounter/linesCount);

			pageCounter = userCounter > (linesCount * pageCounter) ? pageCounter + 1 : pageCounter;

			String start = request.getParameter("start");
			String count = request.getParameter("count");

			int pageStart = start == null ? 0 : Integer.parseInt(start);
			int pageCount = count == null ? linesCount : Integer.parseInt(count);


			for (int i=0; i<pageCounter; i++)
			{
				int iStart = (i * linesCount);
				int iCount = ((i * linesCount) + linesCount) > userCounter ? ((i * linesCount) + linesCount) - userCounter : linesCount;
				int page = i + 1;

				if (pageStart == iStart)
				{
					out.println("<td>" + page + "<td>");

				} else {

					out.println("<td><a href='traderlync-profile-summary?start=" + iStart + "&count=" + iCount + "'>" + page + "</a><td>");
				}
			}

			out.println("<td>]</td></tr></table>");
			out.println("<div class=\"jive-table\">");
			out.println("<table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"100%\">");
			out.println("<thead>");
			out.println("<tr>");
			out.println("<th nowrap></th>");
			out.println("<th nowrap>Id</th>");
			out.println("<th nowrap>User Id</th>");
			out.println("<th nowrap>Device</th>");
			out.println("<th nowrap>HS</th>");
			out.println("<th nowrap>Route</th>");
			out.println("<th nowrap>Name</th>");
			out.println("<th nowrap>Dir No</th>");
			out.println("<th nowrap>Auto Hold</th>");
			out.println("<th nowrap>Auto Priv</th>");
			out.println("<th nowrap>Default</th>");
			out.println("</tr>");
			out.println("</thead>");
			out.println("<tbody>");

			List<OpenlinkUser> sortedProfiles = OpenlinkComponent.self.getUsers(pageStart, pageCount);

			Iterator it = sortedProfiles.iterator();

			int i = 0;

			while( it.hasNext() )
			{
				OpenlinkUser traderLyncUser = (OpenlinkUser)it.next();

				try
				{
					if (XMPPServer.getInstance().getUserManager().isRegisteredUser(traderLyncUser.getUserId()))
					{
						User user = XMPPServer.getInstance().getUserManager().getUser(traderLyncUser.getUserId());

						if(i % 2 == 1)
							out.println("<tr valign='top' class=\"jive-odd\">");
						else
							out.println("<tr valign='top' class=\"jive-even\">");

						out.println("<td width=\"1%\">");
						out.println((pageStart + i + 1));
						out.println("</td>");
						out.println("<td width=\"11%\">");
						out.println("<a href='traderlync-profile-detail?user=" + traderLyncUser.getProfileName() + "'>" + traderLyncUser.getProfileName() + "</a>");
						out.println("</td>");
						out.println("<td width=\"6%\">");
						out.println(traderLyncUser.getUserId());
						out.println("</td>");

						if (traderLyncUser.getDeviceNo() != null && !"0.0.0.0".equals(traderLyncUser.getDeviceNo()))
						{
							out.println("<td width=\"6%\">");
							out.println(traderLyncUser.getDeviceNo());
							out.println("</td>");

						} else {
							out.println("<td style='background-color:#c04d27' width=\"6%\"><font color='#ffffff'>");
							out.println("offline");
							out.println("</font></td>");
						}

						out.println("<td width=\"4%\">");
						out.println(traderLyncUser.getHandsetNo());
						out.println("</td>");
						out.println("<td width=\"6%\">");
						out.println(traderLyncUser.getCallset() == null ? "&nbsp;" : traderLyncUser.getCallset());
						out.println("</td>");

						out.println("<td width=\"21%\">");
						out.println(traderLyncUser.getUserName());
						out.println("</td>");
						out.println("<td width=\"6%\">");
						out.println(traderLyncUser.getPersonalDDI() == null ? "&nbsp;" : traderLyncUser.getPersonalDDI());
						out.println("</td>");

						out.println("<td width=\"6%\">");
						out.println(traderLyncUser.autoHold() ? "<img src=\"images/success-16x16.gif\" alt=\"Yes\" border=\"0\">" : "&nbsp;");
						out.println("</td>");
						out.println("<td width=\"6%\">");
						out.println(traderLyncUser.autoPrivate() ? "<img src=\"images/success-16x16.gif\" alt=\"Yes\" border=\"0\">" : "&nbsp;");
						out.println("</td>");
						out.println("<td width=\"6%\">");
						out.println("true".equals(traderLyncUser.getDefault()) ? "<img src=\"images/success-16x16.gif\" alt=\"Yes\" border=\"0\">" : "&nbsp;");
						out.println("</td>");
						out.println("</tr>");

						i++;

					} else Log.warn( "ProfileSummary - ignoring Openlink User " + traderLyncUser.getUserId());
				}
				catch(Exception e)
				{
					Log.error( "ProfileSummary " + e);
					e.printStackTrace();
				}
			}
			out.println("<tr>");
			out.println("<td>&nbsp;</td>");
			out.println("</tr>");
			out.println("</tbody>");
			out.println("</table>");
			out.println("</div>");
			out.println("<p>&nbsp;</p>");

			out.println("<p></p>");
			out.println("</body>");
			out.println("</html>");

        }
        catch (Exception e) {
			Log.error( "ProfileSummary " + e);
			e.printStackTrace();

        }
	}
}

