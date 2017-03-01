<%@ page import="org.jivesoftware.util.*, org.jivesoftware.openfire.*, java.util.*, java.net.URLEncoder" %>
<%
	String hostname = XMPPServer.getInstance().getServerInfo().getHostname();
	String domain = XMPPServer.getInstance().getServerInfo().getXMPPDomain();
	String connectionUrl = "window.location.protocol + '//' + window.location.host + '/http-bind/'";	
	
	if (XMPPServer.getInstance().getPluginManager().getPlugin("websocket") != null)
	{
		connectionUrl = "(window.location.protocol == \"https:\" ? \"wss:\" : \"ws:\") + '//' + window.location.host + '/ws/'";
	}	
%>
<!DOCTYPE html>
<html><head><title>Kaiwa</title>
<link rel="stylesheet" href="css/app.css">
<script src="js/0-babel-polyfill.js"></script>
<script src="js/1-vendor.js"></script>
<script src="js/app.js"></script>
<script>
	var SERVER_CONFIG = {
		"name":"<%= hostname %>",
		"domain":"<%= domain %>",
		"authorization": "<%= request.getHeader("authorization") %>",
		"wss":<%= connectionUrl %>,
		"muc":"conference.<%= domain %>",
		"startup":"groupchat/lobby%40conference.<%= domain %>",
		"admin":"admin",
		"sasl":"digest-md5",
		"admin":"admin",
		"keepalive":{"interval":45,"timeout":15},
		"softwareVersion":{"name":"Kaiwa","version":"aa1a9e6"},
		"baseUrl":window.location.protocol + '//' + window.location.host + "/apps"		
	};
</script>
<link rel="shortcut icon" type="image/png" href="images/kaiwa.png">
</head>
<body class="aux"><header>
<img id="logo" src="images/logo-big.png" width="250" height="77" alt="Kaiwa">
</header><section class="box connect">
<h2>Connecting...</h2>
<a href="logout.html" class="button secondary">Cancel</a>
</section>
</body>
</html>