
var intercom = null;
var conn = null;
var domain = urlParam("domain");
var username = urlParam("username");
var password = urlParam("password");

window.addEventListener("unload", function () 
{
	if (conn) conn.intercom.expireIntercom();
	if (conn) conn.disconnect();
});
                
window.addEventListener("load", function()
{
	intercom = document.querySelector("ui-intercom");

	intercom.addEventListener('Intercom.Action', function (event)
	{
		console.log("intercom.action", event);		
	});
	
	$(document).bind('ofmeet.connected', function (event, connection)
	{
		console.log("ofmeet connected", connection);
		
		ofmeet.visible(false);		
		connection.intercom.createIntercom();
		conn = connection;
	});
	
	$(document).bind('intercom.offered', function (event, audio)
	{
		console.log("intercom.offered", audio);
		
		$("ui-intercom").css("display", "block");
		$('#pleasewait').css("display", "none");
	});

	$(document).bind('intercom.stream.added', function (event, audio)
	{
		console.log("intercom.stream.added", audio);
	});

	$(document).bind('intercom.delivered', function (event, audio)
	{
		console.log("intercom.delivered", audio);
	});	

	$(document).bind('ofmeet.ready', function ()
	{
		console.log("ofmeet.ready");
		ofmeet.connect();
	});	
		
	ofmeet.ready(username, password);	
})


function urlParam(name)
{
	var results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(window.location.href);
	if (!results) { return undefined; }
	return unescape(results[1] || undefined);
};
