<%--
  -	$Revision: 10204 $
  -	$Date: 2008-04-11 18:44:25 -0400 (Fri, 11 Apr 2008) $
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
                 java.net.URLEncoder"
    errorPage="error.jsp"
%>

<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/fmt" prefix="fmt" %>
<jsp:useBean id="webManager" class="org.jivesoftware.util.WebManager" />
<% webManager.init(request, response, session, application, out ); %>

<% 
    	String userid = ParamUtils.getParameter(request,"userid");
	
        if (OfSkypePlugin.self.clients.containsKey(userid)) 
        {
		SkypeClient client = OfSkypePlugin.self.clients.remove(userid);
		
		if (client.registerProcessing != null)
		{
			client.registerProcessing.unregister();
		}		
		client.close();
		client = null;		
        }
        // Done, so redirect
        response.sendRedirect("ofmeet-summary.jsp?deletesuccess=true");
        return;
%>