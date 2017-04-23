<%--
  -	$Revision$
  -	$Date$
  -
  - Copyright (C) 2004-2008 Jive Software. All rights reserved.
  -
  - Licensed under the Apache License, Version 2.0 (the "License");
  - you may not use this file except in compliance with the License.
  - You may obtain a copy of the License at
  -
  -     http://www.apache.org/licenses/LICENSE-2.0
  -
  - Unless required by applicable law or agreed to in writing, software
  - distributed under the License is distributed on an "AS IS" BASIS,
  - WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  - See the License for the specific language governing permissions and
  - limitations under the License.
--%>

<%@ page import="org.jitsi.videobridge.Conference,
                 org.jitsi.videobridge.Videobridge,
                 org.jivesoftware.openfire.XMPPServer,
                 org.jivesoftware.openfire.plugin.ofmeet.OfMeetPlugin,
                 org.jivesoftware.util.StringUtils"
    errorPage="error.jsp"
%>
<%@ page import="java.net.URLEncoder" %>
<%@ page import="org.jitsi.jicofo.FocusManager" %>
<%@ page import="org.jitsi.jicofo.JitsiMeetConference" %>

<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/fmt" prefix="fmt" %>
<jsp:useBean id="webManager" class="org.jivesoftware.util.WebManager"  />
<% webManager.init(request, response, session, application, out ); %>

<%
    final String mucDomain = XMPPServer.getInstance().getMultiUserChatManager().getMultiUserChatServices().iterator().next().getServiceDomain();

    final OfMeetPlugin container = (OfMeetPlugin) XMPPServer.getInstance().getPluginManager().getPlugin("ofmeet");
    final FocusManager focusManager = container.getFocusManager();
    final Videobridge videobridge = container.getVideobridge();
    final int confCount = videobridge.getConferenceCount();
%>
<html>
    <head>
        <title><fmt:message key="config.page.summary.title"/></title>
        <meta name="pageID" content="ofmeet-summary"/>
    </head>
    <body>

<p>
<fmt:message key="ofmeet.conference.summary" />
</p>

<%  if (request.getParameter("deletesuccess") != null) { %>

    <div class="jive-success">
    <table cellpadding="0" cellspacing="0" border="0">
    <tbody>
        <tr><td class="jive-icon"><img src="images/success-16x16.gif" width="16" height="16" border="0" alt=""></td>
        <td class="jive-icon-label">
        <fmt:message key="ofmeet.conference.expired" />
        </td></tr>
    </tbody>
    </table>
    </div><br>

<%  } %>

<p>
<fmt:message key="ofmeet.summary.conferences" />: <%= confCount %>
</p>

<div class="jive-table">
<table cellpadding="0" cellspacing="0" border="0" width="100%">
<thead>
    <tr>
        <th>&nbsp;</th>
        <th nowrap><fmt:message key="ofmeet.summary.conference" /></th>
        <th nowrap><fmt:message key="ofmeet.summary.room" /></th>
        <th nowrap><fmt:message key="ofmeet.summary.focus" /></th>
        <th style="text-align: center" nowrap><fmt:message key="ofmeet.summary.focus-participant-count"/></th>
        <th nowrap><fmt:message key="ofmeet.summary.last.activity" /></th>
        <th style="text-align: center" nowrap><fmt:message key="ofmeet.summary.endpoints" /></>
        <th nowrap><fmt:message key="ofmeet.summary.dominant.speaker" /></th>
        <th style="text-align: center" nowrap><fmt:message key="ofmeet.summary.is.expired" /></th>
        <th style="text-align: center" nowrap><fmt:message key="ofmeet.summary.expire" /></th>
    </tr>
</thead>
<tbody>

<% 
    if (confCount == 0) {
%>
    <tr>
        <td align="center" colspan="10">
            <fmt:message key="ofmeet.summary.no.conferences" />
        </td>
    </tr>

<%
    }
    int i = 0;
    for (Conference conference : videobridge.getConferences())
    {
    	i++;
        String room = conference.getName();

        JitsiMeetConference focusManagerConference = null;
        if ( room != null )
        {
            focusManagerConference = focusManager.getConference( room + "@" + mucDomain );
        }
%>
    <tr class="jive-<%= (((i%2)==0) ? "even" : "odd") %>">
        <td width="1%">
            <%= i %>
        </td>
        <td width="10%">
            <a href="ofmeet-conference.jsp?confid=<%= URLEncoder.encode(conference.getID(), "UTF-8") %>&focus=<%= conference.getFocus() != null ? URLEncoder.encode(conference.getFocus(), "UTF-8") : "" %>">
                <%= conference.getID() %>
            </a>
        </td>
        <td width="25%">
            <%
            %><a href="/muc-room-occupants.jsp?roomJID=<%= room != null ? room : "&nbsp;" %>%40<%=mucDomain%>"><%= room != null ? room : "&nbsp;" %></a>
        </td>
        <td width="15%">
            <% if (conference.getLastKnowFocus() != null && !"".equals(conference.getLastKnowFocus())) { %>
                <%= conference.getLastKnowFocus() %>
            <% }
               else { %>
                &nbsp;
            <% } %>
        </td>
        <td align="center">
            <%= focusManagerConference != null ? focusManagerConference.getParticipantCount() : "<i>None</i>" %>
        </td>
        <td width="15%">
        	<%
        		long lastActivity = conference.getLastActivityTime();
        		String elapsed = lastActivity == 0 ? "&nbsp;" : StringUtils.getElapsedTime(System.currentTimeMillis() - lastActivity);
        	%>
		<%= elapsed %>
        </td>  
        <td align="center">
		<%= conference.getEndpoints().size() %>
        </td>         
        <td width="10%">
            <% if (conference.getSpeechActivity() != null && conference.getSpeechActivity().getDominantEndpoint() != null && conference.getSpeechActivity().getDominantEndpoint().getID() != null) { %>
                <%= conference.getSpeechActivity().getDominantEndpoint().getID() %>
            <% }
               else { %>
                &nbsp;
            <% } %>
        </td>
        <td align="center">
            <% if (conference.isExpired()) { %>
                <img src="images/success-16x16.gif" width="16" height="16" border="0" alt="">
            <% }
               else { %>
                &nbsp;
            <% } %>		
        </td>
        <td align="center" style="border-right:1px #ccc solid;">
            <a href="ofmeet-expire.jsp?confid=<%= URLEncoder.encode(conference.getID(), "UTF-8") %>&focus=<%= conference.getFocus() != null ? URLEncoder.encode(conference.getFocus(), "UTF-8") : "&nbsp;" %>" title="<fmt:message key="ofmeet.summary.expire" />">
            	<img src="images/delete-16x16.gif" width="16" height="16" border="0" alt="">
            </a>
        </td>
    </tr>

<%
    }
%>
</tbody>
</table>
</div>
</body>
</html>
