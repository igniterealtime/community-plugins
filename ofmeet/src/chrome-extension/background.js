var port = null;
var server = null;

window.addEventListener("beforeunload", function () 
{
	port = null;
});
			

window.addEventListener("load", function() 
{	
	port = chrome.runtime.connectNative('ofmeet.remote.control');	
	console.log("ofmeet.remote.control: loaded", port)
});

chrome.runtime.onConnect.addListener(function (channel) 
{
    channel.onMessage.addListener(function (message) 
    {       	
        switch(message.type) {
        case 'ofmeetGetScreen':
            	server = message.server;

		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() 
		{
			if (xhr.readyState == 4 && xhr.status == 200)
			{
				console.log("ofmeet.remote.control: connected", server);
			}
			
			if (xhr.status > 400)
			{
				console.error("ofmeet.remote.control: error", xhr);			
			}
		};
		xhr.open("GET", 'http://localhost:6060/?resource=' + message.resource + '&server=' + message.server, true);
		xhr.send()

            	var pending = chrome.desktopCapture.chooseDesktopMedia(message.options || ['screen', 'window'], channel.sender.tab, function (streamid) 
                {
			message.type = 'ofmeetGotScreen';
			message.sourceId = streamid;
			channel.postMessage(message);
            	});
            	
		// Let the app know that it can cancel the timeout
		message.type = 'ofmeetGetScreenPending';
		message.request = pending;
		channel.postMessage(message);
		break;
		
        case 'ofmeetCancelGetScreen':
		chrome.desktopCapture.cancelChooseDesktopMedia(message.request);
		message.type = 'ofmeetCanceledGetScreen';
		channel.postMessage(message);
		break;
        }
    });
});
