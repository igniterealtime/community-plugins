<%@ page import="org.jivesoftware.util.*, org.jivesoftware.openfire.*, java.util.*, java.net.URLEncoder" %>
<%
	String hostname = XMPPServer.getInstance().getServerInfo().getHostname();
	String domain = XMPPServer.getInstance().getServerInfo().getXMPPDomain();
	String connectionUrl = "window.location.protocol + '//' + window.location.host + '/http-bind/'";	
	
	if (XMPPServer.getInstance().getPluginManager().getPlugin("websocket") != null)
	{
		connectionUrl = "'wss://' + window.location.host + '/ws/'";
	}	
%>
<!DOCTYPE html>
<html>
<head>
<title>Kaiwa</title>
<link href="kaiwa.css" rel="stylesheet" >
<script src="kaiwa.js"></script>
<script>
	var SERVER_CONFIG = {
		"name":"<%= hostname %>",
		"domain":"<%= domain %>",
		"authorization": "<%= request.getHeader("authorization") %>",
		"wss":<%= connectionUrl %>,
		"muc":"conference.<%= domain %>",
		"startup":"groupchat/lobby%40conference.<%= domain %>",
		"admin":"admin"
	};
</script>
</head>
<body class="aux">
<header>
<img id="logo" src="logo-big.png" width="250" height="77" alt="Kaiwa">
</header>
<section class="box connect">
<h2>Connecting...</h2><a href="/logout" class="button secondary">Cancel</a>
</section>
</body>
</html>