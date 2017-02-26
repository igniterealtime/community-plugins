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
                 java.net.URLDecoder"                       
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
	List<String> gwLines = null;
	int gateways = 0;
	String xml = "";
	Element result = null;	

	if (OfSwitchPlugin.self != null)
	{
		EslMessage resp = OfSwitchPlugin.self.sendFWCommand("sofia xmlstatus gateway");
		
		if (resp != null)
		{	
			gwLines = resp.getBodyLines();

			for (String line : gwLines) 
			{
				if (line.indexOf("<gateway>") > -1)
				{
					gateways++;		
				}
				
				xml = xml + line;				
			}
			
			Document document = DocumentHelper.parseText(xml);
			result = document.getRootElement();			
		}
	}
%>
<html>
    <head>
        <title>FreeSwitch Gateways</title>
        <meta name="pageID" content="freeswitch-gateways"/>
    </head>
    <body>
	<p>
	Active Gateways: <%= gateways %>,
	</p>
	
	<div class="jive-table">
	<table cellpadding="0" cellspacing="0" border="0" width="100%">
	<thead>
	    <tr>
		<th nowrap>Name</th>
		<th nowrap>Profile</th>           
		<th nowrap>Realm</th>
		<th nowrap>Username</th>
		<th nowrap>Password</th>		
		<th nowrap>From</th>    
		<th nowrap>To</th>    
		<th nowrap>Proxy</th>
		<th nowrap>Context</th>     
		<th nowrap>State</th>           
		<th nowrap>Status</th>
		<th nowrap>Uptime</th>
		<th nowrap>Calls In</th>		
		<th nowrap>Calls Out</th>    
		<th nowrap>Failed In</th>    
		<th nowrap>Failed Out</th>
		<th nowrap>Pings</th>  		
	    </tr>
	</thead>
	<tbody>	

<% 
    	if (gateways == 0) {
%>
    <tr>
        <td align="center" colspan="10">
            There are no active gateways
        </td>
    </tr>	
<%
	}
	
	if (result != null)
	{
		String name = "&nbsp;";	
		String profile = "&nbsp;";
		String realm = "&nbsp;";
		String username = "&nbsp;";
		String password = "&nbsp;";		
		String from = "&nbsp;";	
		String to = "&nbsp;";
		String proxy = "&nbsp;";
		String context = "&nbsp;";
		String state = "&nbsp;";
		String status = "&nbsp;";
		String uptime = "&nbsp;";
		String callsIn = "&nbsp;";
		String callsOut = "&nbsp;";		
		String failedIn = "&nbsp;";
		String failedOut = "&nbsp;";
		String pings = "&nbsp;";		
	
		
		Iterator gws = result.elementIterator("gateway");
		int count = 0;	

		while (gws.hasNext()) 
		{
			Element gateway = (Element) gws.next(); 
			
			if (gateway.element("name") != null) 
			{
				name = URLDecoder.decode(gateway.elementTextTrim("name"), "UTF-8");
			}
			
			if (gateway.element("profile") != null) 
			{
				profile = URLDecoder.decode(gateway.elementTextTrim("profile"), "UTF-8");
			}
			
			if (gateway.element("realm") != null) 
			{
				realm = URLDecoder.decode(gateway.elementTextTrim("realm"), "UTF-8");
			}
			
			if (gateway.element("username") != null) 
			{
				username = URLDecoder.decode(gateway.elementTextTrim("username"), "UTF-8");
			}	
			
			if (gateway.element("password") != null) 
			{
				password = URLDecoder.decode(gateway.elementTextTrim("password"), "UTF-8");
			}
			
			if (gateway.element("from") != null) 
			{
				from = URLDecoder.decode(gateway.elementTextTrim("from"), "UTF-8");
			}
			
			if (gateway.element("to") != null) 
			{
				to = URLDecoder.decode(gateway.elementTextTrim("to"), "UTF-8");
			}
			
			if (gateway.element("proxy") != null) 
			{
				proxy = URLDecoder.decode(gateway.elementTextTrim("proxy"), "UTF-8");
			}
			if (gateway.element("context") != null) 
			{
				context = URLDecoder.decode(gateway.elementTextTrim("context"), "UTF-8");
			}
			
			if (gateway.element("state") != null) 
			{
				state = URLDecoder.decode(gateway.elementTextTrim("state"), "UTF-8");
			}
			
			if (gateway.element("status") != null) 
			{
				status = URLDecoder.decode(gateway.elementTextTrim("status"), "UTF-8");
			}
			
			if (gateway.element("uptime-usec") != null) 
			{
				uptime = URLDecoder.decode(gateway.elementTextTrim("uptime-usec"), "UTF-8");
			}	
			
			if (gateway.element("calls-in") != null) 
			{
				callsIn = URLDecoder.decode(gateway.elementTextTrim("calls-in"), "UTF-8");
			}
			
			if (gateway.element("calls-out") != null) 
			{
				callsOut = URLDecoder.decode(gateway.elementTextTrim("calls-out"), "UTF-8");
			}
			
			if (gateway.element("failed-calls-in") != null) 
			{
				failedIn = URLDecoder.decode(gateway.elementTextTrim("failed-calls-in"), "UTF-8");
			}
			
			if (gateway.element("failed-calls-out") != null) 
			{
				failedOut = URLDecoder.decode(gateway.elementTextTrim("failed-calls-out"), "UTF-8");
			}
			
			
			if (gateway.element("pingcount") != null) 
			{
				pings = URLDecoder.decode(gateway.elementTextTrim("pingcount"), "UTF-8");
			}
			
%>
			<tr class="jive-<%= (((count%2)==0) ? "even" : "odd") %>">
			<td width="5%">
			    <%= name %>
			</td>
			<td width="5%" align="center">
				<%= profile %>
			</td>
			<td width="5%" align="center">
				<%= realm %>           
			</td>
			<td width="5%" align="center">
				<%= username %>           
			</td>	
			<td width="5%" align="center">
				<%= password %>           
			</td>
			<td width="5%" align="center">
				<%= from %>           
			</td>
			<td width="5%" align="center">
				<%= to %>           
			</td>
			<td width="5%" align="center">
				<%= proxy %>           
			</td>
			<td width="5%" align="center">
				<%= context %>           
			</td>
			<td width="5%" align="center">
				<%= state %>
			</td>
			<td width="5%" align="center">
				<%= status %>           
			</td>
			<td width="5%" align="center">
				<%= uptime %>           
			</td>	
			<td width="5%" align="center">
				<%= callsIn %>           
			</td>
			<td width="5%" align="center">
				<%= callsOut %>           
			</td>
			<td width="5%" align="center">
				<%= failedIn %>           
			</td>
			<td width="5%" align="center">
				<%= failedOut %>           
			</td>
			<td width="5%" align="center">
				<%= pings %>           
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
