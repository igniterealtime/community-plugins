process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

var ws = null, server = null, interval = null;

var http = require('http');
var WebSocket = require('ws');
var robot = require("./win64/robotjs.node");
var vkey = require('vkey')

console.log("ofmeet.remote.control starts");

var server = http.createServer(handleRequest);
server.listen("6060", handleConnection);

console.log("ofmeet.remote.control found robot");

//Speed up the mouse.
robot.setMouseDelay(2);

var twoPI = Math.PI * 2.0;
var screenSize = robot.getScreenSize();
var height = (screenSize.height / 2) - 10;
var width = screenSize.width;

setInterval(function()
{
	console.log("ofmeet.remote.control start sine wave");

	for (var x = 0; x < width; x++)
	{
	    y = height * Math.sin((twoPI * x) / width) + height;
	    //robot.moveMouse(x, y);
	}
	
}, 5000);

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
    		if (ws) closeWebSocket();

		var params = request.url.substring(pos + 1).split("&");
		var resource = params[0].split("=")[1];
		var url = params[1].split("=")[1];

		var host = url.indexOf("/") < 0 ? url : url.split("/")[2];   
		var protocol = url.indexOf("/") < 0 ? "wss:" : (url.split("/")[0] == "http:") ? "ws:" : "wss:";  

		server = protocol + "//" + host + "/ofmeetws/server?username=null&password=null&resource=" + "remote-" + resource + "-" + Math.round(Math.random() * 10000);	
		console.log("ofmeet.remote.control got server ", server);

		ws = new WebSocket(server, "xmpp");		
		ws.on('open', openWebSocket);
		ws.on('message', messageWebSocket);
	
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
  	// flags.binary will be set if a binary data is received.
  	// flags.masked will be set if the data was masked.
	
	console.log("ofmeet.remote.control websocket data", data);
}

function handleEvents (data) 
{
	if (data.click) 
	{
		var pos = robot.getMousePos() // hosts current x/y
		robot.moveMouse(data.x, data.y) // move to remotes pos
		robot.mouseToggle("up", "left") // set mouse position to up
		robot.mouseClick() // click on remote click spot
		robot.moveMouse(pos.x, pos.y) // go back to hosts position
	}

	if (data.keyCode) 
	{
		var k = vkey[data.keyCode].toLowerCase()
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

function scale (x, fromLow, fromHigh, toLow, toHigh) 
{
	return (x - fromLow) * (toHigh - toLow) / (fromHigh - fromLow) + toLow
}
