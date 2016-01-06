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
                 java.util.*,
                 org.freeswitch.esl.client.transport.message.EslMessage,                 
                 java.net.URLEncoder"                 
    errorPage="error.jsp"
%>
<%@ page import="org.xmpp.packet.JID" %>
<%@ page import="org.dom4j.*" %>
<%@ page import="org.jivesoftware.openfire.plugin.ofswitch.OfSwitchPlugin" %>

<%@ taglib uri="http://java.sun.com/jstl/core_rt" prefix="c"%>
<%@ taglib uri="http://java.sun.com/jstl/fmt_rt" prefix="fmt" %>
<jsp:useBean id="webManager" class="org.jivesoftware.util.WebManager"  />
<% webManager.init(request, response, session, application, out ); %>
<%
	String xml = "";
	Element result = null;
	int lines = 0;	
	
	if (OfSwitchPlugin.self != null)
	{				
		EslMessage resp = OfSwitchPlugin.self.sendFWCommand("show calls as xml");
		
		if (resp != null)
		{
			List<String> callsLines = resp.getBodyLines();
			
			for (String line : callsLines) 
			{
				xml = xml + line;
			}

			Document document = DocumentHelper.parseText(xml);
			result = document.getRootElement();

			try {
				lines = Integer.parseInt(result.attributeValue("row_count"));	
			} catch (Exception e) {}
		}
		
	}
%>
<html>
<head>
<title>FreeSwitch Calls</title>
<meta name="pageID" content="freeswitch-calls"/>
</head>
<body>
<%  if (request.getParameter("deletesuccess") != null) { %>

    <div class="jive-success">
    <table cellpadding="0" cellspacing="0" border="0">
    <tbody>
        <tr><td class="jive-icon"><img src="images/success-16x16.gif" width="16" height="16" border="0" alt=""></td>
        <td class="jive-icon-label">
        Call Cleared
        </td></tr>
    </tbody>
    </table>
    </div><br>

<%  } %>
<p>
Active Calls: <%= lines %>,
</p>

<div class="jive-table">
<table cellpadding="0" cellspacing="0" border="0" width="100%">
<thead>
    <tr>
        <th>Call Id</th>
        <th nowrap>Direction</th>           
        <th nowrap>Created</th>
        <th nowrap>Name</th>
        <th nowrap>State</th>    
        <th nowrap>IP Address</th>    
        <th nowrap>Destination</th>
        <th nowrap>Presence</th>    
        <th nowrap>Call State</th>      
        <th nowrap>Clear</th>          
    </tr>
</thead>
<tbody>

<% 
    	if (lines == 0) {
%>
    <tr>
        <td align="center" colspan="10">
            There are no active calls
        </td>
    </tr>

<%
    	}
	
	if (result != null)
	{
		String uuid = "&nbsp;";
		String direction = "&nbsp;";
		String created = "&nbsp;";
		String name = "&nbsp;";	
		String state = "&nbsp;";
		String ip_addr = "&nbsp;";
		String dest = "&nbsp;";
		String presence_id = "&nbsp;";	
		String callstate = "&nbsp;";

		Iterator rows = result.elementIterator("row");
		int count = 0;	

		while (rows.hasNext()) 
		{
			Element row = (Element) rows.next(); 

			if (row.element("uuid") != null) 
			{
				uuid = row.elementTextTrim("uuid");
			}

			if (row.element("direction") != null) 
			{
				direction = row.elementTextTrim("direction");
			}

			if (row.element("created") != null) 
			{
				created = row.elementTextTrim("created");
			}

			if (row.element("name") != null) 
			{
				name = row.elementTextTrim("name");
			}

			if (row.element("state") != null) 
			{
				state = row.elementTextTrim("state");
			}

			if (row.element("ip_addr") != null) 
			{
				ip_addr = row.elementTextTrim("ip_addr");
			}

			if (row.element("dest") != null) 
			{
				dest = row.elementTextTrim("dest");
			}

			if (row.element("presence_id") != null) 
			{
				presence_id = row.elementTextTrim("presence_id");
			}	

			if (row.element("callstate") != null) 
			{
				callstate = row.elementTextTrim("callstate");
			}

%>
			<tr class="jive-<%= (((count%2)==0) ? "even" : "odd") %>">
			<td width="20%">
			    <%= uuid %>
			</td>
			<td width="10%" valign="middle">
				<%= direction %>
			</td>
			<td width="10%" align="center">
				<%= created %>           
			</td>
			<td width="10%" align="center">
				<%= name %>           
			</td>	
			<td width="10%" align="center">
				<%= state %>           
			</td>
			<td width="10%" align="center">
				<%= ip_addr %>           
			</td>
			<td width="10%" align="center">
				<%= dest %>           
			</td>
			<td width="5%" align="center">
				<%= presence_id %>           
			</td>
			<td width="5%" align="center">
				<%= callstate %>           
			</td>		
			<td width="1%" align="center" style="border-right:1px #ccc solid;">
			    <a href="freeswitch-clear-call.jsp?callid=<%= URLEncoder.encode(uuid, "UTF-8") %>" title="Clear Call"><img src="images/delete-16x16.gif" width="16" height="16" border="0" alt=""></a>
			</td>		
			</tr>
<%
			count++;
		}
	}
%>
</tbody>
</table>
</div>
</body>
</html>
