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

<%@ page import="org.jivesoftware.util.*,
                 org.jivesoftware.openfire.plugin.ofskype.OfSkypePlugin,
                 org.ifsoft.skype.SkypeClient,
                 java.util.*,
                 java.net.URLEncoder"                 
    errorPage="error.jsp"
%>
<%@ page import="org.xmpp.packet.JID" %>

<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/fmt" prefix="fmt" %>
<jsp:useBean id="webManager" class="org.jivesoftware.util.WebManager"  />
<% webManager.init(request, response, session, application, out ); %>

<% 
    	int clientCount = OfSkypePlugin.self.clients.values().size();
%>
<html>
    <head>
        <title><fmt:message key="config.page.summary.title"/></title>
        <meta name="pageID" content="skype-summary"/>
    </head>
    <body>

<p>
<fmt:message key="client.summary" />
</p>

<%  if (request.getParameter("deletesuccess") != null) { %>

    <div class="jive-success">
    <table cellpadding="0" cellspacing="0" border="0">
    <tbody>
        <tr><td class="jive-icon"><img src="images/success-16x16.gif" width="16" height="16" border="0" alt=""></td>
        <td class="jive-icon-label">
        <fmt:message key="client.expired" />
        </td></tr>
    </tbody>
    </table>
    </div><br>

<%  } %>

<p>
<fmt:message key="summary.clients" />: <%= clientCount %>,
</p>

<div class="jive-table">
<table cellpadding="0" cellspacing="0" border="0" width="100%">
<thead>
    <tr>
        <th>&nbsp;</th>
        <th nowrap><fmt:message key="summary.username" /></th>        
        <th nowrap><fmt:message key="summary.name" /></th>
        <th nowrap><fmt:message key="summary.domain" /></th>
        <th nowrap><fmt:message key="summary.availability" /></th>
        <th nowrap><fmt:message key="summary.note" /></th>        
        <th nowrap><fmt:message key="summary.is.active" /></th>
        <th nowrap><fmt:message key="summary.expire" /></th>              
    </tr>
</thead>
<tbody>

<% 
    if (clientCount == 0) {
%>
    <tr>
        <td align="center" colspan="10">
            <fmt:message key="summary.no.clients" />
        </td>
    </tr>

<%
    }
    int i = 0;
    for (SkypeClient client : OfSkypePlugin.self.clients.values())
    {
    	i++;
%>
    <tr class="jive-<%= (((i%2)==0) ? "even" : "odd") %>">
        <td width="3%">
            <%= i %>
        </td>
        <td width="5%" valign="middle">
		<%= client.sipUrl %>
        </td>
        <td width="20%" align="center">
            <%= client.myName %>
        </td>
        <td width="20%" align="center">
            <%= client.domain %>
        </td>
        <td width="20%" align="center">
            <%= client.myAvailability %>
        </td>
        <td width="30%" align="center">
            <%= client.myNote %>
        </td>        
        <td width="1%" align="center">		
            <% if (client.oAuthToken != null) { %>
                <img src="images/success-16x16.gif" width="16" height="16" border="0" alt="">
            <% }
               else { %>
                &nbsp;
            <% } %>		
        </td>       
        <td width="1%" align="center" style="border-right:1px #ccc solid;">
            <a href="skype-expire.jsp?userid=<%= URLEncoder.encode("skype.password." + client.sipUrl, "UTF-8") %>" title="<fmt:message key="summary.expire" />">
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
