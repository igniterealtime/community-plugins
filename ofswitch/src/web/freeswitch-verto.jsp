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
<%@ page import="org.jivesoftware.openfire.plugin.ofswitch.OfSwitchPlugin" %>

<%@ taglib uri="http://java.sun.com/jstl/core_rt" prefix="c"%>
<%@ taglib uri="http://java.sun.com/jstl/fmt_rt" prefix="fmt" %>
<jsp:useBean id="webManager" class="org.jivesoftware.util.WebManager"  />
<% webManager.init(request, response, session, application, out ); %>

<html>
    <head>
        <title>Verto Registrations</title>
        <meta name="pageID" content="freeswitch-verto"/>
    </head>
    <body>

<pre>
<%
	if (OfSwitchPlugin.self != null)
	{	
		EslMessage resp = OfSwitchPlugin.self.sendFWCommand("verto status");
		
		if (resp != null)
		{
			List<String> vertoLines = resp.getBodyLines();

			for (String line : vertoLines) 
			{
				%><p style="font-family: Courier New,Courier,Lucida Sans Typewriter,Lucida Typewriter,monospace!important;"><%= line %></p><%
			}
		} else {
			
			if (JiveGlobals.getBooleanProperty("freeswitch.enabled", true))
			{
				%>Please wait.......<%
			} else {
				%>Disabled<%			
			}
		}
	}
%>
</pre>
</body>
</html>
