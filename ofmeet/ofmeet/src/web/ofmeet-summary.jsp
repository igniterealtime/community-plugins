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
                 org.jivesoftware.openfire.plugin.ofmeet.OfMeetPlugin"
    errorPage="error.jsp"
%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/fmt" prefix="fmt" %>
<%@ taglib uri="admin" prefix="admin" %>
<jsp:useBean id="dateValue" class="java.util.Date"/>
<jsp:useBean id="webManager" class="org.jivesoftware.util.WebManager"  />
<% webManager.init(request, response, session, application, out ); %>

<%
    final String mucDomain = XMPPServer.getInstance().getMultiUserChatManager().getMultiUserChatServices().iterator().next().getServiceDomain();

    final OfMeetPlugin container = (OfMeetPlugin) XMPPServer.getInstance().getPluginManager().getPlugin("ofmeet");

    pageContext.setAttribute( "ofmeet", container );
    pageContext.setAttribute( "mucDomain", mucDomain);

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

<c:if test="${not empty param.deletesuccess}">
    <admin:infoBox type="success"><fmt:message key="ofmeet.conference.expired" /></admin:infoBox>
</c:if>

<p><fmt:message key="ofmeet.summary.conferences" />: <c:out value="${ofmeet.videobridge.conferenceCount}"/></p>

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

<c:choose>
    <c:when test="${ofmeet.videobridge.conferenceCount eq 0}">
        <tr>
            <td align="center" colspan="10">
                <fmt:message key="ofmeet.summary.no.conferences" />
            </td>
        </tr>
    </c:when>
    <c:otherwise>
        <c:forEach items="${ofmeet.videobridge.conferences}" var="conference" varStatus="status">
            <tr class="${ ( (status.index + 1) % 2 ) eq 0 ? 'jive-even' : 'jive-odd'}">
                <td width="1%">
                    ${status.count}
                </td>
                <td width="10%">
                    <a href="ofmeet-conference.jsp?confid=${conference.ID}&focus=${conference.focus}">
                        <c:out value="${conference.ID}"/>
                    </a>
                </td>
                <td width="25%">
                    <%
                    %><a href="/muc-room-occupants.jsp?roomJID=${conference.name}%40${mucDomain}"><c:out value="${conference.name}"/></a>
                </td>
                <td width="15%">
                    <c:if test="${not empty conference.lastKnowFocus}">
                        <c:out value="${conference.lastKnowFocus}"/>
                    </c:if>
                </td>
                <td align="center">
                    <c:out value="${conference.endpointCount}"/>
                </td>
                <td width="15%">
                    <jsp:setProperty name="dateValue" property="time" value="${conference.lastActivityTime}"/>
                    <fmt:formatDate value="${dateValue}" pattern="HH:mm"/>
                    <c:out value="${dateValue}"/>
                </td>
                <td align="center">
                    <c:out value="${conference.endpointCount}"/>
                </td>
                <td width="10%">
                    <c:if test="${not empty conference.speechActivity and not empty conference.speechActivity.dominantEndpoint}">
                        <c:out value="${conference.speechActivity.dominantEndpoint.ID}"/>
                    </c:if>
                </td>
                <td align="center">
                    <c:if test="${conference.expired}">
                        <img src="images/success-16x16.gif" width="16" height="16" border="0" alt="">
                    </c:if>
                </td>
                <td align="center" style="border-right:1px #ccc solid;">
                    <a href="ofmeet-expire.jsp?confid=${conference.ID}&focus=${conference.focus}" title="<fmt:message key="ofmeet.summary.expire" />">
                        <img src="images/delete-16x16.gif" width="16" height="16" border="0" alt="">
                    </a>
                </td>
            </tr>
        </c:forEach>
    </c:otherwise>
</c:choose>
</tbody>
</table>
</div>
</body>
</html>
