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
		 org.jivesoftware.openfire.*,
                 java.util.*,
                 java.net.URLEncoder"                 
    errorPage="error.jsp"
%>
<%@ page import="org.xmpp.packet.JID" %>

<%@ taglib uri="http://java.sun.com/jstl/core_rt" prefix="c"%>
<%@ taglib uri="http://java.sun.com/jstl/fmt_rt" prefix="fmt" %>
<jsp:useBean id="webManager" class="org.jivesoftware.util.WebManager"  />
<% webManager.init(request, response, session, application, out ); %>

<html>
<head>
<title>Openfire Social Summary</title>
<meta name="pageID" content="ofsocial-summary"/>
</head>
<body>
<h2>How to Access</h2>
<p>
<a href='<%=  "https://" + XMPPServer.getInstance().getServerInfo().getXMPPDomain() + ":" + JiveGlobals.getProperty("httpbind.port.secure", "7443") + "/ofsocial/wp-admin" %>'>WordPress Dashboard</a>
</p>
<p>
<a href='<%=  "https://" + XMPPServer.getInstance().getServerInfo().getXMPPDomain() + ":" + JiveGlobals.getProperty("httpbind.port.secure", "7443") + "/ofsocial/wp-user" %>'>WordPress/BuddyPress Home Page</a>
</p>
<p>
</body>
</html>
