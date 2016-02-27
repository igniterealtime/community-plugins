
var ChromeUi = (function(self) { 

	var rootWindow = null;
	var optionWin = null;	
	var streamAudio = null;
	var windowClosed = true;
	var callbacks = {}	

	self.log = function(p1,p2,p3,p4,p5,p6)
	{
		console.log(p1,p2,p3,p4,p5,p6);
	}
	
	self.appReady = function()
	{
		if (streamAudio)
		{
			chrome.runtime.sendMessage(null, {id: "Intercom.App.Ready", audio: streamAudio}); 
		}
	}
	
	self.reloadApp = function()
	{
		console.log('reloadApp');
		chrome.runtime.reload();		
	}
	
	self.createRootWindow = function()
	{
		var server 	= JSON.parse(window.localStorage["store.settings.server"]) 		
		var username 	= JSON.parse(window.localStorage["store.settings.username"]);
		var password 	= JSON.parse(window.localStorage["store.settings.password"]);
		
		if (server && username && password)
		{
			chrome.windows.create({url: chrome.extension.getURL('index.html?username=' + username + '&password=' + password + '&server=' + server),
				    focused: true,
				    type: "panel"
			}, function (win) {

				rootWindow = win
				chrome.windows.update(win.id, {width: 320, height: 600});
				console.log("createRootWindow", rootWindow)
				windowClosed = false;
			});
		} else {
			self.doOptions();
		}
	}

	
	self.getRootWindow = function()
	{
		return rootWindow;
	}
	
	self.resizeRootWindow = function(width, height)
	{
		if(rootWindow!=null){
			chrome.windows.update(rootWindow.id, {width: width, height: height});
		}
	}	
	
	self.drawAttention = function()
	{
		if (rootWindow)
		{ 
			chrome.windows.update(rootWindow.id, {drawAttention: true});
		}
	}

	self.maximisePanel = function()
	{
		if (rootWindow)
		{ 
			chrome.windows.update(rootWindow.id, {state: "maximized"});
		}
	}

	self.destroyRootWindow = function()
	{		
		try {
			console.log('destroyRootWindow');		
			
			chrome.windows.remove(rootWindow.id);
			chrome.windows.remove(optionWin.id);
			
		} catch (e) {}
		
		windowClosed = true;		
	}	

	/**
	 *	buttons [{title: "accept", iconUrl: "accept.png"}]
	 * 	items [{ title: "Item1", message: "This is item 1."}]
	 *	progress 0 - 100
	 */
	 
	self.notifyText = function(message, context, iconUrl, buttons, callback)
	{			
		var opt = {
		  type: "basic",
		  title: "Openfire Meetings",		  
		  iconUrl: iconUrl ? iconUrl : "icon128.png",
		  
		  message: message,
		  buttons: buttons,		  
		  contextMessage: context		  
		}
		var id = Math.random().toString(36).substr(2,9); 
				
		chrome.notifications.create(id, opt, function(notificationId)
		{
			if (callback) callbacks[notificationId] = callback;
		});
	};
	
	self.notifyImage = function(message, context, imageUrl, buttons, callback)
	{			
		var opt = {
		  type: "image",
		  title: "Openfire Meetings",		  
		  iconUrl: "icon128.png",
		  
		  message: message,	
		  buttons: buttons,		  
		  contextMessage: context,
		  imageUrl: imageUrl
		}
		var id = Math.random().toString(36).substr(2,9); 
		
		chrome.notifications.create(id, opt, function(notificationId)
		{
			if (callback) callbacks[notificationId] = callback;
		});
	};		
	
	self.notifyProgress = function(message, context, progress, buttons, callback)
	{			
		var opt = {
		  type: "progress",
		  title: "Openfire Meetings",		  
		  iconUrl: "icon128.png",
		  
		  message: message,	
		  buttons: buttons,		  
		  contextMessage: context,
		  progress: progress
		}
		var id = Math.random().toString(36).substr(2,9); 
		
		chrome.notifications.create(id, opt, function(notificationId)
		{
			if (callback) callbacks[notificationId] = callback;
		});
	};	
	
	
	self.notifyList = function(message, context, items, buttons, callback)
	{			
		var opt = {
		  type: "list",
		  title: "Openfire Meetings",		  
		  iconUrl: "icon128.png",
		  
		  message: message,	
		  buttons: buttons,		  
		  contextMessage: context,
		  items: items
		}
		var id = Math.random().toString(36).substr(2,9); 
		
		chrome.notifications.create(id, opt, function(notificationId){
			if (callback) callbacks[notificationId] = callback;
		});
	};
	
	self.openAppWindow = function()
	{
		var xhr = new XMLHttpRequest();

		xhr.onreadystatechange = function() 
		{
			if (xhr.readyState == 4 && xhr.status == 200)
			{
				console.log("checkAuthentication ok");
				self.createRootWindow();				
			}

			if (xhr.readyState == 4 && xhr.status == 401)
			{
				console.error("checkAuthentication error", xhr);
				
				chrome.tabs.create({'url': 'https://btg199251:7443/ofmeet'}, function(win)
				{
					setTimeout(function()
					{
						self.createRootWindow();
						
					}, 10000);
				});				
			}
		};
		xhr.open("GET", 'https://btg199251:7443/ofmeet/intercom', true);
		xhr.send();	
	}
	
	self.doOptions = function()
	{
		if (optionWin == null)
		{
			chrome.windows.create({url: chrome.extension.getURL('options/index.html'), focused: true, type: "popup", width: 800, height: 480}, function (win) 
			{
				optionWin = win;
			});
			
		} else {
			chrome.windows.update(optionWin.id, {focused: true, width: 800, height: 480});		
		}	
	}	

	window.addEventListener("load", function() 
	{
		console.log('background.js load event');
				
		chrome.browserAction.onClicked.addListener(function()
		{
			if (windowClosed)
			{
				self.createRootWindow();
			} else {

				ChromeUi.destroyRootWindow();
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
		});	
		
		chrome.notifications.onButtonClicked.addListener(function(notificationId, buttonIndex)
		{
			var callback = callbacks[notificationId];	

			if (callback)
			{
				callback(notificationId, buttonIndex);

				chrome.notifications.clear(notificationId, function(wasCleared)
				{
					callbacks[notificationId] = null;
					delete callbacks[notificationId];
				});
			}
		});
		
		chrome.runtime.onConnect.addListener(function (channel) 
		{
		    channel.onMessage.addListener(function (message) {
			switch(message.type) 
			{
			case 'drawAttention':
			    ChromeUi.drawAttention();
			    message.type = 'attentionDrawn';
			    channel.postMessage(message);
			    break;
			    
			case 'maximisePanel':
				ChromeUi.maximisePanel();
				message.type = 'panelMaximised'
			    channel.postMessage(message);
				break;	
				
			case 'resizePanel':
			    ChromeUi.resizeRootWindow(message.width, message.height);
			    message.type = 'panelResized';
			    channel.postMessage(message);
			    break;
			}
		    });
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
		});

		$(document).bind('intercom.stream.added', function (event, audio)
		{
			console.log("intercom.stream.added", audio);
			streamAudio = audio;
			chrome.runtime.sendMessage(null, {id: "Intercom.App.Ready", audio: audio}); 
		});

		$(document).bind('intercom.delivered', function (event, audio)
		{
			console.log("intercom.delivered", audio);
		});	

		$(document).bind('ofmeet.ready', function ()
		{
			console.log("ofmeet.ready");
			config.bosh = ofmeet.server + "/http-bind/";		
			ofmeet.connect();
		});		
		
		var server 	= JSON.parse(window.localStorage["store.settings.server"]) 		
		var username 	= JSON.parse(window.localStorage["store.settings.username"]);
		var password 	= JSON.parse(window.localStorage["store.settings.password"]);
		var domain 	= JSON.parse(window.localStorage["store.settings.domain"]);
		
		if (server && username && password)
		{	
			ofmeet.server = server;
			ofmeet.ready(username, password, true);
		}
				
	});

	window.addEventListener("beforeunload", function () 
	{
		console.log('background.js beforeunload event');
		destroyRootWindow();
	});
			
	return self;
	
}(ChromeUi || {}));	