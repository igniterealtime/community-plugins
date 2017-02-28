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

<%@ page import="org.jivesoftware.openfire.XMPPServer,
                 org.jivesoftware.openfire.plugin.ofmeet.OfMeetPlugin,
                 org.jivesoftware.util.StringUtils"
    errorPage="error.jsp"
%>
<%@ page import="org.jivesoftware.util.ParamUtils" %>
<%@ page import="java.net.URLEncoder" %>
<%@ page import="org.jitsi.videobridge.*" %>
<%@ page import="java.util.List" %>
<%@ page import="java.util.Arrays" %>

<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/fmt" prefix="fmt" %>
<jsp:useBean id="webManager" class="org.jivesoftware.util.WebManager"  />
<% webManager.init(request, response, session, application, out ); %>

<%
    final String confid = ParamUtils.getParameter(request,"confid", false);
    final String focus = ParamUtils.getParameter( request, "focus", false);
    final String endpointId = ParamUtils.getParameter(request,"endpointId", false);

    if (confid == null ) {
        response.sendRedirect("ofmeet-summary.jsp");
        return;
    }

    if (endpointId == null) {
        response.sendRedirect("ofmeet-conference.jsp?confid=" + URLEncoder.encode( confid, "UTF-8") + "&focus=" + URLEncoder.encode( focus != null ? focus : "", "UTF-8" ) );
        return;
    }

    final OfMeetPlugin container = (OfMeetPlugin) XMPPServer.getInstance().getPluginManager().getPlugin("ofmeet");
    final Videobridge videobridge = container.getVideobridge();
    final Conference conference = videobridge.getConference(confid, focus);

    if (conference == null) {
        response.sendRedirect("ofmeet-summary.jsp");
        return;
    }

    final Endpoint endpoint = conference.getEndpoint( endpointId );
    if (endpoint == null) {
        response.sendRedirect("ofmeet-conference.jsp?confid=" + URLEncoder.encode( confid, "UTF-8") + "&focus=" + URLEncoder.encode( focus != null ? focus : "", "UTF-8" ) );
        return;
    }

    final SctpConnection sctpConnection = endpoint.getSctpConnection();
    String lastActivity = null;
    String lastPayloadActivity = null;
    String lastTransportActivity = null;
    String creation = null;
    if ( sctpConnection != null )
    {
        lastActivity = sctpConnection.getLastActivityTime()== 0 ? "&nbsp;" : StringUtils.getElapsedTime(System.currentTimeMillis() - sctpConnection.getLastActivityTime());
        creation = sctpConnection.getCreationTimestamp()== 0 ? "&nbsp;" : StringUtils.getElapsedTime(System.currentTimeMillis() - sctpConnection.getCreationTimestamp());
        lastPayloadActivity = sctpConnection.getLastPayloadActivityTime()== 0 ? "&nbsp;" : StringUtils.getElapsedTime(System.currentTimeMillis() - sctpConnection.getLastPayloadActivityTime());
        lastTransportActivity = sctpConnection.getLastTransportActivityTime()== 0 ? "&nbsp;" : StringUtils.getElapsedTime(System.currentTimeMillis() - sctpConnection.getLastTransportActivityTime());
    }
%>
<html>
    <head>
        <title><fmt:message key="config.page.endpoint.title"/></title>
        <meta name="pageID" content="ofmeet-summary"/>
    </head>
<body>

<p><fmt:message key="ofmeet.endpoint.details" /></p>

<div class="jive-table">
<table cellpadding="0" cellspacing="0" border="0" width="100%">
    <thead>
        <tr>
            <th><fmt:message key="ofmeet.endpoint.detail.id" /></th>
            <th><fmt:message key="ofmeet.endpoint.detail.name" /></th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><%= endpoint.getID()%></td>
            <td><%= endpoint.getDisplayName() != null ? endpoint.getDisplayName() : "<i>None</i>" %></td>
        </tr>
    </tbody>
</table>
</div>

<%
if ( sctpConnection != null )
{
%>
<br/>
<p>
    <fmt:message key="ofmeet.sctpconnection.details" />
</p>

<div class="jive-table">
    <table cellpadding="0" cellspacing="0" border="0" width="100%">
        <thead>
            <tr>
                <th><fmt:message key="ofmeet.sctpconnection.detail.id" /></th>
                <th><fmt:message key="ofmeet.sctpconnection.detail.channel-bundle-id" /></th>
                <th><fmt:message key="ofmeet.sctpconnection.detail.creation-time" /></th>
                <th><fmt:message key="ofmeet.sctpconnection.detail.last-activity" /></th>
                <th><fmt:message key="ofmeet.sctpconnection.detail.last-transport-activity" /></th>
                <th><fmt:message key="ofmeet.sctpconnection.detail.last-payload-activity" /></th>
                <th style="text-align: center"><fmt:message key="ofmeet.sctpconnection.detail.is-initiator" /></th>
                <th style="text-align: center"><fmt:message key="ofmeet.sctpconnection.detail.is-ready" /></th>
                <th style="text-align: center"><fmt:message key="ofmeet.sctpconnection.detail.is-expired" /></th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><%= sctpConnection.getID()%></td>
                <td><%= sctpConnection.getChannelBundleId()%></td>
                <td><%= creation %></td>
                <td><%= lastActivity %></td>
                <td><%= lastTransportActivity %></td>
                <td><%= lastPayloadActivity %></td>
                <td align="center"><%= sctpConnection.isInitiator()%></td>
                <td align="center"><%= sctpConnection.isReady()%></td>
                <td align="center"><%= sctpConnection.isExpired()%></td>
            </tr>
        </tbody>
    </table>
</div>
<%}%>

<br/>
<p>
    <fmt:message key="ofmeet.endpoint.rtpchannels.details" />
</p>

<div class="jive-table">
    <table cellpadding="0" cellspacing="0" border="0" width="100%">
        <thead>
            <tr>
                <th><fmt:message key="ofmeet.endpoint.rtpchannels.detail.id" /></th>
                <th><fmt:message key="ofmeet.endpoint.rtpchannels.detail.media-type" /></th>
                <th style="text-align: center"><fmt:message key="ofmeet.endpoint.rtpchannels.detail.is-initiator" /></th>
                <th style="text-align: center"><fmt:message key="ofmeet.endpoint.rtpchannels.detail.is-expired" /></th>
                <th><fmt:message key="ofmeet.endpoint.rtpchannels.detail.receive-payload-types" /></th>
                <th><fmt:message key="ofmeet.endpoint.rtpchannels.detail.receive-ssrcs" /></th>
                <th style="text-align: center"><fmt:message key="ofmeet.endpoint.rtpchannels.detail.relay-type" /></>
                <th><fmt:message key="ofmeet.endpoint.rtpchannels.detail.creation-time" /></th>
                <th><fmt:message key="ofmeet.endpoint.rtpchannels.detail.last-activity" /></th>
                <th><fmt:message key="ofmeet.endpoint.rtpchannels.detail.last-transport-activity" /></th>
                <th><fmt:message key="ofmeet.endpoint.rtpchannels.detail.last-payload-activity" /></th>
                <th><fmt:message key="ofmeet.endpoint.rtpchannels.detail.stream-target.control-address" /></th>
                <th><fmt:message key="ofmeet.endpoint.rtpchannels.detail.stream-target.data-address" /></th>
            </tr>
        </thead>
        <tbody>
<%
        final List<RtpChannel> channels = endpoint.getChannels( null );
        if ( channels.isEmpty() )
        {
%>
            <tr>
                <td align="center" colspan="13">
                    <i><fmt:message key="ofmeet.endpoint.rtpchannels.none" /></i>
                </td>
            </tr>
<%
        }
        else
        {
            for ( final RtpChannel rtpChannel : channels )
            {
%>
            <tr>
                <td><%= rtpChannel.getID() %></td>
                <td><%= rtpChannel.getContent().getMediaType() %></td>
                <td align="center"><%= rtpChannel.isInitiator() %></td>
                <td align="center"><%= rtpChannel.isExpired() %></td>
                <td><%= Arrays.toString( rtpChannel.getReceivePTs() )%></td>
                <td><%= Arrays.toString( rtpChannel.getReceiveSSRCs() )%></td>
                <td align="center"><%= rtpChannel.getRTPLevelRelayType() %></td>
                <td><%= rtpChannel.getCreationTimestamp() == 0 ? "&nbsp;" : StringUtils.getElapsedTime(System.currentTimeMillis() - rtpChannel.getCreationTimestamp())  %></td>
                <td><%= rtpChannel.getLastActivityTime() == 0 ? "&nbsp;" : StringUtils.getElapsedTime(System.currentTimeMillis() - rtpChannel.getLastActivityTime())  %></td>
                <td><%= rtpChannel.getLastTransportActivityTime() == 0 ? "&nbsp;" : StringUtils.getElapsedTime(System.currentTimeMillis() - rtpChannel.getLastTransportActivityTime())  %></td>
                <td><%= rtpChannel.getLastPayloadActivityTime() == 0 ? "&nbsp;" : StringUtils.getElapsedTime(System.currentTimeMillis() - rtpChannel.getLastPayloadActivityTime())  %></td>
                <td><%= rtpChannel.getStreamTarget().getControlAddress() != null ? rtpChannel.getStreamTarget().getControlAddress() : "<i>None</i>" %></td>
                <td><%= rtpChannel.getStreamTarget().getDataAddress() != null ? rtpChannel.getStreamTarget().getDataAddress() : "<i>None</i>" %></td>
            </tr>
<%
            }
        }
%>
        </tbody>
    </table>
</div>

<br/>
<form action="ofmeet-conference.jsp">
    <input type="hidden" name="confid" value="<%=URLEncoder.encode( confid, "UTF-8")%>">
    <input type="hidden" name="focus" value="<%=URLEncoder.encode( focus != null ? focus : "", "UTF-8" )%>">
    <center>
        <input type="submit" name="back" value="<fmt:message key="ofmeet.back" />">
    </center>
</form>

</body>
</html>
