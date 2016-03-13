var port = null;
var server = null;
var rootWindow = null;
var videoWin = null;	
var host = window.localStorage["store.settings.host"];
var waiting = false;

window.addEventListener("beforeunload", function () 
{
	port = null;
});
			

window.addEventListener("load", function() 
{	
	port = chrome.runtime.connectNative('ofmeet.remote.control');	
	console.log("ofmeet.remote.control: loaded", port);
	
	chrome.browserAction.onClicked.addListener(function()
	{
		if (rootWindow == null)
		{
			createRootWindow();
		} else {

			destroyRootWindow();
		}		
	});
	
	chrome.windows.onRemoved.addListener(function(win) 
	{
		console.log("closing window ", win);

		if (rootWindow && win == rootWindow.id)
		{				
			windowClosed = true;
			rootWindow = null;
		}
		
		if (videoWin && win == videoWin.id)
		{				
			videoWin = null;		
			openRootWindow();			
		}		
	});	
});

chrome.runtime.onConnect.addListener(function (channel) 
{
    channel.onMessage.addListener(function (message) 
    {   
	console.log("ofmeet.chrome extension: message got", message);
			
        switch(message.type) 
        {
        case 'ofmeetOpenPopup':       
        	openVideoWindow(message.room);
		destroyRootWindow();         	
        	break;
        	
        case 'ofmeetDrawAttention':       
        	drawAttention();
        	break;        	
        	
        case 'ofmeetSetConfig':     
 		host = message.host;		
		window.localStorage["store.settings.host"] = host;					

		console.log("ofmeet.set.config:", host);  
		
		if (waiting) 
		{
			openRootWindow();		          	
			waiting = false;
		}
        	break;
        	
        case 'ofmeetSetRequestorOn': 
            	sendRemoteControl('action=' + message.type + '&requester=' + message.id)        
        	break;

        case 'ofmeetSetRequestorOff': 
            	sendRemoteControl('action=' + message.type)                
        	break;
        	
        case 'ofmeetGetScreen':
            	server = message.server;
            	sendRemoteControl('action=' + message.type + '&resource=' + message.resource + '&server=' + message.server)

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

function sendRemoteControl(message)
{
	var xhr = new XMLHttpRequest();
	
	xhr.onreadystatechange = function() 
	{
		if (xhr.readyState == 4 && xhr.status == 200)
		{
			console.log("ofmeet.chrome extension: message sent to remote control", message);
		}

		if (xhr.status >= 400)
		{
			console.error("ofmeet.chrome extension: error", xhr);	
			port = chrome.runtime.connectNative('ofmeet.remote.control');				
		}
	};
	xhr.open("GET", 'http://localhost:6060/?' + message, true);
	xhr.send();
}

function openRootWindow()
{
	var url = "https://" + host + "/ofmeet/candy.html?extension=true&host=" + host;

	console.log("createRootWindow url", url)
		
	chrome.windows.create({url: url, focused: true, type: "panel"}, function (win) 
	{
		rootWindow = win
		chrome.windows.update(win.id, {width: 480, height: 680});
	});

}

function createRootWindow()
{
	var xhr = new XMLHttpRequest();
	
	if (!host)
	{
		host = prompt("Please enter your openfire meetings server:port", "my-host-name:7443");
		
		if (host && host != "null" && host != "")
		{
			window.localStorage["store.settings.host"] = host;
		
		} else return;
	}

	if (host && host != "null" && host != "")
	{		
		var url = "https://" + host + "/ofmeet";

		xhr.onreadystatechange = function() 
		{
			if (xhr.readyState == 4 && xhr.status == 200)
			{
				console.log("checkAuthentication ok");
				openRootWindow();				
			}

			if (xhr.readyState == 4 && xhr.status == 401)
			{
				console.error("checkAuthentication error", xhr);

				chrome.tabs.create({'url': url}, function(win)
				{
					waiting = true;
				});				
			}
		};
		xhr.open("GET", url, true);
		xhr.send();	
	}
}

function destroyRootWindow()
{		
	try {
		console.log('destroyRootWindow');		

		if (rootWindow) chrome.windows.remove(rootWindow.id);	
		if (videoWin)	chrome.windows.remove(videoWin.id);		

	} catch (e) {}
}

function closeVideoWindow()
{
	if (videoWin != null)
	{
		chrome.windows.remove(videoWin.id);
		videoWin = null;
	}
}

function openVideoWindow(room, callback)
{
	var url = "https://" + host + "/ofmeet/?r=" + room;

	if (videoWin == null)
	{
		chrome.windows.create({url: url, focused: true, type: "popup", width: 1024, height: 768}, function (win) 
		{
			videoWin = win;
			if (callback) callback(videoWin);
		});

	} else {
		chrome.windows.update(videoWin.id, {focused: true, width: 1024, height: 768});		
	}
}
	
function drawAttention()
{
	if (rootWindow)
	{ 
		chrome.windows.update(rootWindow.id, {drawAttention: true});
	}
}