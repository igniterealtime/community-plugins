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
<%@ page import="org.jivesoftware.util.ParamUtils" %>
<%@ page import="org.jitsi.videobridge.Endpoint" %>
<%@ page import="org.jitsi.service.neomedia.MediaType" %>
<%@ page import="org.jitsi.videobridge.Content" %>
<%@ page import="java.net.URLEncoder" %>

<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/fmt" prefix="fmt" %>
<jsp:useBean id="webManager" class="org.jivesoftware.util.WebManager"  />
<% webManager.init(request, response, session, application, out ); %>

<%
    final String confid = ParamUtils.getParameter(request,"confid", false);
    final String focus = ParamUtils.getParameter( request, "focus", false);

    if (confid == null) {
        response.sendRedirect("ofmeet-summary.jsp");
        return;
    }

    final OfMeetPlugin container = (OfMeetPlugin) XMPPServer.getInstance().getPluginManager().getPlugin("ofmeet");
    final Videobridge videobridge = container.getVideobridge();
    final Conference conference = videobridge.getConference(confid, focus);

    if (conference == null) {
        response.sendRedirect("ofmeet-summary.jsp");
        return;
    }

    final long lastActivity = conference.getLastActivityTime();
    final String elapsed = lastActivity == 0 ? "&nbsp;" : StringUtils.getElapsedTime(System.currentTimeMillis() - lastActivity);
%>
<html>
    <head>
        <title><fmt:message key="config.page.conference.title"/></title>
        <meta name="pageID" content="ofmeet-summary"/>
    </head>
<body>

<p>
<fmt:message key="ofmeet.conference.details" />
</p>

<div class="jive-table">
<table cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr>
        <td><fmt:message key="ofmeet.conference.detail.id" /></td>
        <td><%= conference.getID()%></td>
    </tr>
    <tr>
        <td><fmt:message key="ofmeet.conference.detail.name" /></td>
        <td><%=conference.getName() != null ? conference.getName() : "<i>None</i>"%></td>
    </tr>
    <tr>
        <td><fmt:message key="ofmeet.conference.detail.focus" /></td>
        <td><%=conference.getFocus() != null ? conference.getFocus() : "<i>None</i>"%></td>
    </tr>
    <tr>
        <td><fmt:message key="ofmeet.conference.detail.last-known-focus" /></td>
        <td><%=conference.getLastKnowFocus() != null ? conference.getLastKnowFocus() : "<i>None</i>"%></td>
    </tr>
    <tr>
        <td><fmt:message key="ofmeet.conference.detail.last-activity-time" /></td>
        <td><%= elapsed %></td>
    </tr>
    <tr>
        <td><fmt:message key="ofmeet.conference.detail.include-in-statistics" /></td>
        <td><%=conference.includeInStatistics() %></td>
    </tr>
    <tr>
        <td><fmt:message key="ofmeet.conference.detail.is-expired" /></td>
        <td><%=conference.isExpired() %></td>
    </tr>
</table>
</div>

<p>&nbsp;</p>

<div class="jive-table">
    <table cellpadding="0" cellspacing="0" border="0" width="100%">
        <thead>
        <tr>
            <th width="1%">&nbsp;</th>
            <th nowrap><fmt:message key="ofmeet.conference.endpoints.detail.id" /></th>
            <th nowrap><fmt:message key="ofmeet.conference.endpoints.detail.name" /></th>
            <th style="text-align: center"><fmt:message key="ofmeet.conference.endpoints.detail.channelcount.audio" /></th>
            <th style="text-align: center"><fmt:message key="ofmeet.conference.endpoints.detail.channelcount.data" /></th>
            <th style="text-align: center"><fmt:message key="ofmeet.conference.endpoints.detail.channelcount.video" /></th>
        </tr>
        </thead>
        <tbody>
        <%
            if ( conference.getEndpoints().isEmpty() ) {
        %>
            <tr>
                <td align="center" colspan="5">
                    <i><fmt:message key="ofmeet.conference.endpoints.none" /></i>
                </td>
            </tr>
        <%
            } else {
                int i = 0;
                for ( final Endpoint endpoint : conference.getEndpoints() )
                {
                    i++;
        %>
            <tr class="jive-<%= (((i%2)==0) ? "even" : "odd") %>">
                <td >
                    <%= i %>
                </td>
                <td>
                    <a href="ofmeet-endpoint.jsp?confid=<%= URLEncoder.encode(conference.getID(), "UTF-8") %>&focus=<%= URLEncoder.encode( focus != null ? focus : "", "UTF-8" )%>&endpointId=<%= URLEncoder.encode(endpoint.getID(), "UTF-8") %>">
                        <%= endpoint.getID() %>
                    </a>
                </td>
                <td>
                    <%= endpoint.getDisplayName() == null ? "<i>None</i>" : endpoint.getDisplayName() %>
                </td>
                <td align="center">
                    <%= endpoint.getChannelCount( MediaType.AUDIO )%>
                </td>
                <td align="center">
                    <%= endpoint.getChannelCount( MediaType.DATA )%>
                </td>
                <td align="center">
                    <%= endpoint.getChannelCount( MediaType.VIDEO )%>
                </td>
            </tr>
        <%
                }
            }
        %>
        </tbody>
    </table>
</div>

<p>&nbsp;</p>

<div class="jive-table">
    <table cellpadding="0" cellspacing="0" border="0" width="100%">
        <thead>
        <tr>
            <th width="1%">&nbsp;</th>
            <th nowrap><fmt:message key="ofmeet.conference.contents.detail.name" /></th>
            <th nowrap><fmt:message key="ofmeet.conference.contents.detail.media-type" /></th>
            <th><fmt:message key="ofmeet.conference.contents.detail.initial-local-ssrc" /></th>
            <th style="text-align: center"><fmt:message key="ofmeet.conference.contents.detail.channel-count" /></th>
            <th style="text-align: center"><fmt:message key="ofmeet.conference.contents.detail.is-expired" /></th>
        </tr>
        </thead>
        <tbody>
        <%
            if ( conference.getContents().length == 0 ) {
        %>
        <tr>
            <td align="center" colspan="10">
                <fmt:message key="ofmeet.conference.contents.none" />
            </td>
        </tr>
        <%
        } else {
            int i = 0;
            for ( final Content content : conference.getContents() )
            {
                i++;
        %>
        <tr class="jive-<%= (((i%2)==0) ? "even" : "odd") %>">
            <td >
                <%= i %>
            </td>
            <td>
                <%= content.getName() == null ? "<i>None</i>" : content.getName() %>
            </td>
            <td>
                <%= content.getMediaType().toString() %>
            </td>
            <td>
                <%= content.getInitialLocalSSRC() %>
            </td>
            <td align="center">
                <%= content.getChannelCount() %>
            </td>
            <td align="center">
                <%= content.isExpired() %>
            </td>
        </tr>
        <%
                }
            }
        %>
        </tbody>
    </table>
</div>

<br/>
<form action="ofmeet-summary.jsp">
    <center>
        <input type="submit" name="back" value="<fmt:message key="ofmeet.back" />">
    </center>
</form>

</body>
</html>
