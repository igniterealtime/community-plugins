var bgWindow = null;
var fgWindow = null;
var intercom = null;
var conn = null;
var server = urlParam("server");
var username = urlParam("username");
var password = urlParam("password");


window.addEventListener("unload", function () 
{
	if (conn) conn.intercom.expireIntercom();
	if (conn) conn.disconnect();
});
                
window.addEventListener("load", function()
{
	chrome.windows.getCurrent(function(win)
	{
		fgWindow = win;
	});
	
	chrome.runtime.getBackgroundPage(function (win)
	{
		bgWindow = win;
		bgWindow.ChromeUi.appReady();		
	});
	
	chrome.runtime.onMessage.addListener(function(event, sender, sendResponse) 
	{
		bgWindow.ChromeUi.log("onMessage", event, sender);		

		if (event.id == "Intercom.App.Ready") appReady();
	});
	
	
	
	intercom = document.querySelector("ui-intercom");

	intercom.addEventListener('Intercom.Action', function (event)
	{
		bgWindow.ChromeUi.log("intercom.action", event);		
	});
})


function urlParam(name)
{
	var results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(window.location.href);
	if (!results) { return undefined; }
	return unescape(results[1] || undefined);
};

function appReady()
{
	$("ui-intercom").css("display", "block");
	$('#pleasewait').css("display", "none");
}
