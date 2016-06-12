<%--
  -	$RCSfile$
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

<%@ page import="org.jivesoftware.openfire.plugin.ofswitch.*" %>
<%@ page import="org.jivesoftware.openfire.*" %>
<%@ page import="org.jivesoftware.util.*" %>
<%@ page import="java.io.File" %>
<%@ page import="java.util.Locale" %>
<%@ page import="java.net.InetAddress" %>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/fmt" prefix="fmt" %>
<%

	boolean update = request.getParameter("update") != null;

	String errorMessage = null;
	String ourIpAddress = OfSwitchPlugin.self.getIpAddress();  
	String ourHostname = XMPPServer.getInstance().getServerInfo().getHostname();
	    	
	if (update)
	{
		String fsEnabled = request.getParameter("fsEnabled");
		JiveGlobals.setProperty("freeswitch.enabled", (fsEnabled != null && fsEnabled.equals("on")) ? "true": "false");

		String fsInstalled = request.getParameter("fsInstalled");        
		JiveGlobals.setProperty("freeswitch.installed", (fsInstalled != null && fsInstalled.equals("on")) ? "true": "false");

		JiveGlobals.setProperty("freeswitch.server.hostname", request.getParameter("fsServer"));         
		JiveGlobals.setProperty("freeswitch.server.password", request.getParameter("fsPassword"));    
		JiveGlobals.setProperty("freeswitch.sip.hostname", request.getParameter("fsSipServer"));         
		JiveGlobals.setProperty("freeswitch.sip.password", request.getParameter("fsSipPassword"));    
		
		JiveGlobals.setProperty("freeswitch.server.homepath", request.getParameter("fsHomePath"));         
		JiveGlobals.setProperty("freeswitch.server.exepath", request.getParameter("fsExePath")); 		
	}

%>
<html>
<head>
   <title><fmt:message key="config.page.settings.title" /></title>

   <meta name="pageID" content="freeswitch-settings"/>
</head>
<body>
<% if (errorMessage != null) { %>
<div class="error">
    <%= errorMessage%>
</div>
<br/>
<% } %>

<form action="freeswitch-settings.jsp" method="post">

<div class="jive-contentBoxHeader">   
	<fmt:message key="config.page.settings.title"/>
</div>
<div class="jive-contentBox">      
    <p>
        <table cellpadding="3" cellspacing="0" border="0" width="100%">
            <tbody> 
	    <tr>
		<td nowrap  colspan="2">
			<input type="checkbox" name="fsEnabled"<%= (JiveGlobals.getProperty("freeswitch.enabled", "true").equals("true")) ? " checked" : "" %>>
			<fmt:message key="settings.freeswitch.enabled" />		
		</td>
	    </tr>	    	    	    
	    <tr>
		<td nowrap  colspan="2">
			<input type="checkbox" name="fsInstalled"<%= (JiveGlobals.getProperty("freeswitch.installed", "true").equals("true")) ? " checked" : "" %>>
			<fmt:message key="settings.freeswitch.installed" />		
		</td>
	    </tr>
	    <tr>
		<td align="left" width="150">
		    <fmt:message key="settings.freeswitch.server.homepath"/>
		</td>
		<td><input type="text" size="50" maxlength="100" name="fsHomePath"
			   value="<%= JiveGlobals.getProperty("freeswitch.server.homepath", "/usr/local/freeswitch") %>">
		</td>
	    </tr>	
	    <tr>
		<td align="left" width="150">
		    <fmt:message key="settings.freeswitch.server.exepath"/>
		</td>
		<td><input type="text" size="50" maxlength="100" name="fsExePath"
			   value="<%= JiveGlobals.getProperty("freeswitch.server.exepath", "/usr/local/freeswitch/freeswitch") %>">
		</td>
	    </tr>	    
	    <tr>
		<td align="left" width="150">
		    <fmt:message key="settings.freeswitch.server.hostname"/>
		</td>
		<td><input type="text" size="50" maxlength="100" name="fsServer"
			   value="<%= JiveGlobals.getProperty("freeswitch.server.hostname", "127.0.0.1") %>">
		</td>
	    </tr>
	    <tr>
		<td align="left" width="150">
		    <fmt:message key="settings.freeswitch.server.password"/>
		</td>
		<td><input type="password" size="50" maxlength="100" name="fsPassword"
			   value="<%= JiveGlobals.getProperty("freeswitch.server.password", "Welcome123") %>">
		</td>
	    </tr> 
	    <tr>
		<td align="left" width="150">
		    <fmt:message key="settings.freeswitch.sip.hostname"/>
		</td>
		<td><input type="text" size="50" maxlength="100" name="fsSipServer"
			   value="<%= JiveGlobals.getProperty("freeswitch.sip.hostname", ourIpAddress) %>">
		</td>
	    </tr>
	    <tr>
		<td align="left" width="150">
		    <fmt:message key="settings.freeswitch.sip.password"/>
		</td>
		<td><input type="password" size="50" maxlength="100" name="fsSipPassword"
			   value="<%= JiveGlobals.getProperty("freeswitch.sip.password", "Welcome123") %>">
		</td>
	    </tr	    
  	    </tbody>
        </table>
   </p>  
</div>
<div class="jive-contentBoxHeader">   
	<fmt:message key="config.page.configuration.save.title"/>
</div>
<div class="jive-contentBox">     
   <p>
        <table cellpadding="3" cellspacing="0" border="0" width="100%">
            <tbody> 	    
            <tr>
                <th colspan="2"><input type="submit" name="update" value="<fmt:message key="config.page.configuration.submit" />">&nbsp;&nbsp;<fmt:message key="config.page.configuration.restart.warning"/></th>
            </tr>	    
            </tbody>            
        </table> 
    </p>
</div>
</form>
</body>
</html>