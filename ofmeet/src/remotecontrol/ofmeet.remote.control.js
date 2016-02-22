var webserver = null, robot = null, ws = null, server = null, interval = null, screenSize, requestor = null;
var http = require('http');
var WebSocket = require('ws');
var vkey = require('vkey')


module.exports = 
{  
  start: function (os) 
  {
	console.log("ofmeet.remote.control starts");

	robot = require("./" + os + "/robotjs.node");
	webserver = http.createServer(handleRequest);
	webserver.listen("6060", handleConnection);
	screenSize = robot.getScreenSize();
	
	console.log("ofmeet.remote.control found robot", screenSize.height, screenSize.width);

	//Speed up the mouse.
	//robot.setMouseDelay(2);
  },
  
  stop: function () {

  }
};

//-------------------------------------------------------
//
//
//
//-------------------------------------------------------

function handleConnection ()
{
    console.log("ofmeet.remote.control listening on: http://localhost:%s", "6060");
}


function handleRequest(request, response)
{
    response.end('ok');
    
    console.log('ofmeet.remote.control recieved request: ' + request.url);
    
    var pos = request.url.indexOf("?");
    
    if (pos > -1)
    {
    	try {
		var params = request.url.substring(pos + 1).split("&");
		var action = params[0].split("=")[1];	
		
		if (action == "ofmeetGetScreen")
		{
    			if (ws) closeWebSocket();
		
			var resource = params[1].split("=")[1];
			var url = params[2].split("=")[1];

			var host = url.indexOf("/") < 0 ? url : url.split("/")[2];   
			var protocol = url.indexOf("/") < 0 ? "wss:" : (url.split("/")[0] == "http:") ? "ws:" : "wss:";  

			var wsUrl = protocol + "//" + host + "/ofmeetws/server?username=null&password=null&resource=" + "remotecontrol-" + resource;	
			console.log("ofmeet.remote.control got server ", wsUrl);

			ws = new WebSocket(wsUrl, "xmpp");		
			ws.on('open', openWebSocket);
			ws.on('message', messageWebSocket);
		}
		else 
		
		if (action == "ofmeetSetRequestorOn")
		{
			requestor = params[1].split("=")[1];
			console.log("ofmeet.remote.control got requestor ", requestor);			
		}		
		else 
		
		if (action == "ofmeetSetRequestorOff")
		{
			requestor = null;
		}		
	
	} catch (e) {
		console.error("ofmeet.remote.control error", e);
	}
    }
}

//-------------------------------------------------------
//
//
//
//-------------------------------------------------------

function openWebSocket() 
{
	ws.send('<presence />');
	interval = setInterval (function() {ws.send(" ")}, 10000);	
}

function closeWebSocket() 
{
	clearInterval(interval);
	ws.send('<presence type="unavailable" />')
	ws.close();	
}

function messageWebSocket(data, flags) 
{
	//console.log("ofmeet.remote.control websocket data", data, flags);
	
  	// flags.binary will be set if a binary data is received.
  	// flags.masked will be set if the data was masked.
  	// <message xmlns="jabber:client" to="remotecontrol-ofmeet3966@btg199251" from="deleolajide@btg199251/ofmeet1253"><m>{'click': 'true', 'x': '362.6666666666667', 'y': '308.3022086286504'}</m></message>
  	// <message xmlns="jabber:client" to="remotecontrol-ofmeet3966@btg199251" from="deleolajide@btg199251/ofmeet1253"><k>{'key': '71', 'shift': 'false', 'crtl': 'false', 'alt': 'false', 'meta': 'false'}</k></message>
	
	if (requestor && data.indexOf("/" + requestor) > -1)
	{
		var json = null;
		var pos1 = data.indexOf("<m>");
		var pos2 = data.indexOf("<k>");	

		if (pos1 > -1) json = data.substring(pos1 + 3, data.indexOf('</m>'));
		if (pos2 > -1) json = data.substring(pos2 + 3, data.indexOf('</k>'));

		handleEvents(JSON.parse(json));
	} else {
		console.error("unexpected web socket data", data)
	}
	
}

function handleEvents (data) 
{
	//console.log("handleEvents", data);
	
	if (data.move) 
	{
		//console.log("ofmeet.remote.control mouse move", data.x, data.y, screenSize.height, screenSize.width, pos.x, pos.y);	
		robot.moveMouse(data.x, data.y) // move to remotes pos
	}
	
	if (data.click) 
	{
		var pos = robot.getMousePos()	
		console.log("ofmeet.remote.control mouse click", data.x, data.y, screenSize.height, screenSize.width, pos.x, pos.y);
	
		robot.moveMouse(data.x, data.y) // move to remotes pos
		robot.mouseToggle("up", "left") // set mouse position to up
		robot.mouseClick() // click on remote click spot
		robot.moveMouse(pos.x, pos.y) // go back to hosts position
	}	

	if (data.key) 
	{
		var k = vkey[data.key].toLowerCase()
	
		console.log("ofmeet.remote.control key", k, data);
	
		if (k === '<space>') k = ' '
		var modifiers = []
		if (data.shift) modifiers.push('shift')
		if (data.control) modifiers.push('control')
		if (data.alt) modifiers.push('alt')
		if (data.meta) modifiers.push('command')
		
		if (k[0] !== '<') 
		{
			console.log('typed ' + k + ' ' + JSON.stringify(modifiers))
			
			if (modifiers[0])
				robot.keyTap(k, modifiers[0])
			else 
				robot.keyTap(k)
		} else {
			if (k === '<enter>') robot.keyTap('enter')
			else if (k === '<backspace>') robot.keyTap('backspace')
			else if (k === '<up>') robot.keyTap('up')
			else if (k === '<down>') robot.keyTap('down')
			else if (k === '<left>') robot.keyTap('left')
			else if (k === '<right>') robot.keyTap('right')
			else if (k === '<delete>') robot.keyTap('delete')
			else if (k === '<home>') robot.keyTap('home')
			else if (k === '<end>') robot.keyTap('end')
			else if (k === '<page-up>') robot.keyTap('pageup')
			else if (k === '<page-down>') robot.keyTap('pagedown')
			else console.log('did not type ' + k)
		}
	}
}
