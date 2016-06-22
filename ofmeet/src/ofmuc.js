
$(document).ready(function () 
{
	var conferenceList = '<datalist id="conference-list">'
		
	for (var i=0; i<config.conferences.length; i++)
	{	
		conferenceList = conferenceList + '<option value="' + Strophe.getNodeFromJid(config.conferences[i].jid) + '">' + config.conferences[i].name + '</option>'	
	}
	
	conferenceList = conferenceList + '</datalist>'
	
	$("body").append(conferenceList);
	$("#enter_room_field").attr("list", "conference-list");	
});


Strophe.addConnectionPlugin('ofmuc', {
    connection: null,
    roomJid: null,
    members: {},
    sharePDF: null,
    shareApp: null,
    shareLink: '', 
    linkSharer: false,
    pdfPage: "1",
    recordingToken: null,
    isRecording: false,
    urls: [],
    bookmarks: [],
    appRunning: false,
    enableCursor: true,
    video: null,
    speaking: false, 
    recordingArchived: false,     
    
    init: function (conn) {
        this.connection = conn;
        this.connection.addHandler(this.onMessage.bind(this), null, 'message'); 
        this.connection.addHandler(this.onPresence.bind(this), null, 'presence');        
        this.connection.addHandler(this.onPresenceUnavailable.bind(this), null, 'presence', 'unavailable'); 
        this.connection.addHandler(this.onRayo.bind(this), 'urn:xmpp:rayo:1');       
        
        var that = this;
        
        that.shareLink = "";
        
	$(window).resize(function () {
	   that.resize();
	}); 
	
	Toolbar.showSipCallButton(!!config.sip);		// only show if we have a SIP profile

	setTimeout(function()
	{
		if ($('#ofmeet-extension-installed').length > 0)
		{
			var msg = { type: 'ofmeetSetConfig', host: window.location.host, username: Strophe.getResourceFromJid(that.connection.jid)};
			console.log("window.post.ofmeetSetConfig", msg);
			window.postMessage(msg, '*');	
		}	
	}, 5000);	
		
	$(document).bind('dominantspeakerchanged', function (event, resourceJid) 
	{
		var sendMsg = false;

		if (resourceJid === Strophe.getResourceFromJid(that.connection.emuc.myroomjid))
		{
			//console.log("I started speaking", that.connection.jid);
			var action =  'on';
			that.speaking = true;
			sendMsg = true;

		} else if (that.speaking) {

			//console.log("I stopped speaking", that.connection.jid);
			var action =  'off';	
			that.speaking = false;
			sendMsg = true;
		}

		if (config.archiveSpeaking && config.recordingPath.indexOf("spank") > -1)
		{
			if (sendMsg && (that.audioSsrc || that.videoSsrc))
			{
				that.getConferenceId(Strophe.getBareJidFromJid(that.connection.emuc.myroomjid), function(json)
				{		
					//console.log('getConferenceId', json);	

					json.action = action;	
					json.audiossrc = that.audioSsrc;					
					json.videossrc = that.videoSsrc;				
					json.conference = json.conference;	
					json.jid = that.connection.jid;	
					json.type = "groupchat";	
					json.room = Strophe.getNodeFromJid(that.connection.emuc.myroomjid)

					that.connection.emuc.sendMessage(JSON.stringify(json));					

				}, function(err) {

					console.error('getConferenceId', err);	
				});					
			}
		}
	});
	
	$(document).bind('remotestreamadded.jingle', function (event, data, sid) 
	{
		var sess = connection.jingle.sessions[sid];
		var thessrc;

		if (data.stream.id && data.stream.id.indexOf('mixedmslabel') === -1) 
		{
			var ssrclines = SDPUtil.find_lines(sess.peerconnection.remoteDescription.sdp, 'a=ssrc:');
			var isAudio = data.stream.getAudioTracks().length > 0;
			var isVideo = data.stream.getVideoTracks().length > 0;			
			
			ssrclines = ssrclines.filter(function (line) 
			{
		    		return ((line.indexOf('msid:' + data.stream.id) !== -1));
			});
			
			if (ssrclines.length && (isAudio || isVideo)) 
			{
            			thessrc = ssrclines[0].substring(7).split(' ')[0];
            			var member = that.getMember(data.peerjid);
            			
            			if (member != null)
            			{
            				if (isAudio) member.audioSsrc = thessrc;
            				if (isVideo) member.videoSsrc = thessrc;
            				
            				console.log("SSRCs FOUND ", member); 
            				
					var msg = $msg({to: member.jid, type: 'chat'});
					msg.c('ssrc', {xmlns: 'http://igniterealtime.org/protocol/ofmeet/ssrc', audio: member.audioSsrc, video: member.videoSsrc}).up();
					that.connection.send(msg)            				
            			}
            		}
            	}
	});
    
	window.addEventListener('message', function (event) 
	{ 
		console.log("addListener message ofmuc", event);
		
		if (!event.data) return;  
		if (event.data.type == 'ofmeetLoaded')  that.appReady();
		if (event.data.type == 'ofmeetSendMessage')  that.appMessage(event.data.msg); 
		
		if (event.data.type == 'ofmeetPasted') 
		{
			var link = document.getElementById('shareLinkRef');
			if (link) link.value = event.data.value;
		}		
	});
	
	var getMouseData = function (e) 
	{
		var data = {}
		
		if (!that.video) that.video = document.querySelector('#largeVideo')

		if (that.video) 
		{
			var videoSize = that.video.getBoundingClientRect();
			
			data.x = e.clientX - videoSize.left;
			data.y = e.clientY - videoSize.top;			
			data.height = videoSize.height;
			data.width = videoSize.width;						
		}
		return data
	}
	
	window.addEventListener("contextmenu", function(e) 	// Block context menu so right-click gets sent properly
	{
		e.preventDefault();
		
	}, false);
    
	window.addEventListener('mousemove', function (e) 
	{ 		
		if (isRemoteControl)
		{
			var data = getMouseData(e)		
			var msg = $msg({to: "remotecontrol-" + selectedUser + "@" + config.hosts.domain}).c("m").t('{"move": ' + true + ', "x": ' + data.x + ', "y": ' + data.y + ', "width": ' + data.width + ', "height": ' + data.height + '}');				
			that.connection.send(msg);			
		}
	});

	window.addEventListener('mouseup', function (e) 
	{ 		
		if (isRemoteControl)
		{
			var data = getMouseData(e)		
			//console.log('send mouseup', data)

			var msg = $msg({to: "remotecontrol-" + selectedUser + "@" + config.hosts.domain}).c("m").t('{"up": ' + true + ', "button": ' + e.button + ', "x": ' + data.x + ', "y": ' + data.y + ', "width": ' + data.width + ', "height": ' + data.height + '}');				
			that.connection.send(msg);			
		}
	});
	
	window.addEventListener('mousedown', function (e) 
	{ 		
		if (isRemoteControl)
		{
			var data = getMouseData(e)		
			//console.log('send mousedown', data)

			var msg = $msg({to: "remotecontrol-" + selectedUser + "@" + config.hosts.domain}).c("m").t('{"down": ' + true + ', "button": ' + e.button + ', "x": ' + data.x + ', "y": ' + data.y + ', "width": ' + data.width + ', "height": ' + data.height + '}');				
			that.connection.send(msg);			
		}
	});	
	
	window.addEventListener('mousewheel', function (e) 
	{ 		
		if (isRemoteControl)
		{
			//console.log('send mousewheel', e.wheelDelta)

			var msg = $msg({to: "remotecontrol-" + selectedUser + "@" + config.hosts.domain}).c("m").t('{"wheel": ' + true + ', "delta": ' + e.wheelDelta + '}');				
			that.connection.send(msg);			
		}
	});	
	
	window.addEventListener('keydown', function (e) 
	{ 			
		if (isRemoteControl)
		{	
			e.preventDefault()
			console.log('send key', e)
			
			var msg = $msg({to: "remotecontrol-" + selectedUser + "@" + config.hosts.domain}).c("k").t('{"key": ' + e.keyCode + ', "shift": ' + e.shiftKey + ', "crtl": ' + e.ctrlKey + ', "alt": ' + e.altKey + ', "meta": ' + e.metaKey + '}');				
			that.connection.send(msg);			
		}
	});	
    },
        
    statusChanged: function(status, condition)
    {
        var that = this;
            
	if(status == Strophe.Status.CONNECTED)
	{
		this.connection.sendIQ($iq({type: "get"}).c("query", {xmlns: "jabber:iq:private"}).c("storage", {xmlns: "storage:bookmarks"}).tree(), function(resp)
		{
			console.log("get bookmarks", resp)
						
			$(resp).find('conference').each(function() 
			{
				that.bookmarks.push({name: $(this).attr("name"), jid: $(this).attr("jid")});	
			})
			
			$(resp).find('url').each(function() 
			{
				that.urls.push({name: $(this).attr("name"), url: $(this).attr("url")});
			});
		});
	}
    },
    
            
    rayoAccept: function (confId, roomName)
    {
	    var self = this;
	    var req = $iq(
		{
		    type: 'set',
		    to: config.hosts.call_control
		}
	    );
	    req.c('accept',
		{
		    xmlns: 'urn:xmpp:rayo:1'
		});
	    req.c('header', {name: 'JvbRoomId', value: confId}).up();
	    req.c('header', {name: 'JvbRoomName', value: roomName}).up();
	    
	    this.connection.sendIQ(req,
	    
		function (result)
		{
		    //console.info('rayoAccept result ', result);
		},
		function (error)
		{
		    console.info('rayoAccept error ', error);
		}
	    );
	},
        
    resize: function() {
	if ($('#presentation>iframe')) {
	    $('#presentation>iframe').width(this.getPresentationWidth());
	    $('#presentation>iframe').height(this.getPresentationHeight());
	}    
    },
    
    getPresentationWidth: function() {
        var availableWidth = Util.getAvailableVideoWidth();
        var availableHeight = this.getPresentationHeight();

        var aspectRatio = 16.5 / 9.0;
        if (availableHeight < availableWidth / aspectRatio) {
            availableWidth = Math.floor(availableHeight * aspectRatio);
        }
        return availableWidth;
    },
    
    getPresentationHeight: function () {
        var remoteVideos = $('#remoteVideos');
        return window.innerHeight - remoteVideos.outerHeight();
    },    
        
    onPresence: function (pres) {
    	//console.log('ofmuc onPresence', $(pres))  
    	    	
        var from = pres.getAttribute('from');
        var type = pres.getAttribute('type');
        
        if (type != null) {
           return true;
        }
        
    	if (!this.roomJid || Strophe.getBareJidFromJid(from) != this.roomJid) return true;        

        var member = {};
        member.show = $(pres).find('>show').text();
        member.status = $(pres).find('>status').text();
        var tmp = $(pres).find('>x[xmlns="http://jabber.org/protocol/muc#user"]>item');
        member.affiliation = tmp.attr('affiliation');
        member.role = tmp.attr('role');

        if (from == this.roomJid) {
        
        } else if (this.members[from] === undefined) {
            this.members[from] = member;
    
            if (config.userAvatar && config.userAvatar != "null")
            {
            	this.avatarShare(config.userAvatar);
            }

	    if (this.shareApp)	
	    {	
	    	// tell new participant my active application available to share	    	
		this.appShare("create", this.shareApp); 		
	    } 
	    
	    if (this.sharePDF)
	    {					
		this.pdfShare("create", this.sharePDF + "&control=false#" + this.pdfPage);
	    }            
            
        } else {

	    if (this.shareApp)
	    {					

	    } 
        }
        return true;
    },

    onPresenceUnavailable: function (pres) {
    	//console.log('onPresenceUnavailable', $(pres));
    	
        var from = pres.getAttribute('from');
   	if (!this.roomJid) return true;  
        
        delete this.members[from];
        return true;
    },   
    
    onMessage: function (msg) {
    	//console.log('onMessage', $(msg))
    	var that = this;
    	var from = msg.getAttribute('from');
    	var type = msg.getAttribute('type');    	
	var farparty = SettingsMenu.getDisplayName();
		
	if (type == "chat" && type != "error")
	{	
		$(msg).find('ssrc').each(function() 
		{
			that.audioSsrc = $(this).attr('audio');	
			that.videoSsrc = $(this).attr('video');	
			
			if (!that.recordingArchived && config.archiveRecording && (that.audioSsrc || that.videoSsrc) && config.recordingPath.indexOf("spank") > -1)
			{
				that.recordingArchived = true;				
				
				that.getConferenceId(Strophe.getBareJidFromJid(that.connection.emuc.myroomjid), function(json)
				{	
					if (json.conference && json.folder)
					{
						var pos = config.recordingPath.indexOf("spank");					
						var link = window.location.protocol + "//" + window.location.host + "/" + config.recordingPath.substring(pos + 6) + "/" + json.folder + "/";
						var audioLink = link + that.audioSsrc + ".mp3";
						var videoLink = link + that.videoSsrc + ".webm";

						setTimeout(function()
						{
							console.log('Writing archive files', audioLink, videoLink)
							
							that.existURL(audioLink, function()
							{
								that.connection.emuc.sendMessage("audio - " + audioLink);						
							});

							that.existURL(videoLink, function()
							{						
								that.connection.emuc.sendMessage("video - " + videoLink);	
							});
						}, 60000);
												
					} else {
						console.err('getConferenceId, no recording folder', json);	
					}
				}, function(err) {

					console.err('getConferenceId', err);	
				});				
			}			
		});
		
		$(msg).find('remotecontrol').each(function() 
		{
			var action = $(this).attr('action');
			var requestor = Strophe.getResourceFromJid(from);

			console.log("remote control message", action, requestor);

			if (action == "request")	// requested
			{
				var msg2 = $msg({to: from, type: 'chat'});			
				
				if (!isUsingScreenStream || remoteControlled)
				{
					msg2.c('remotecontrol', {xmlns: 'http://igniterealtime.org/protocol/remotecontrol', action: 'rejected'}).up();
					that.connection.send(msg2);					
					
				} else {

					$.prompt(requestor + ' would like to control your desktop?',
					{
						title: "Desktop Remote Control",
						persistent: false,
						buttons: { "Permit": true , "Deny": false},
						defaultButton: 1,     
						loaded: function(event) {
						},			
						submit: function(e,v,m,f) 
						{
							if(v)
							{
								msg2.c('remotecontrol', {xmlns: 'http://igniterealtime.org/protocol/remotecontrol', action: 'accepted'}).up();								
								
								remoteControlled = true;
								remoteController = requestor;

								window.postMessage({ type: 'ofmeetSetRequestorOn', id: requestor}, '*');
								
							} else {
								msg2.c('remotecontrol', {xmlns: 'http://igniterealtime.org/protocol/remotecontrol', action: 'rejected'}).up();							
							}
							
							that.connection.send(msg2);							
						}
					});									
				}				
			}
			else
			
			if (action == "terminate")	// requested
			{			
				remoteControlled = false;
				remoteController = null;
    				
    				window.postMessage({ type: 'ofmeetSetRequestorOff'}, '*');				
			}
			
			else

			if (action == "rejected")		// requestor
			{			
				$.prompt("Your request was rejected",
				    {
					title: "Desktop Remote Control",
					persistent: false
				    }
				); 		
			}
			else
			
			if (action == "accepted")		// requestor
			{			
				isRemoteControl = true;
				Toolbar.changeRemoteControlButtonState(true);
				
				$.prompt("You now have remote desktop control of " + requestor,
				    {
					title: "Desktop Remote Control",
					persistent: false
				    }
				); 				
			}
			else
			
			if (action == "terminated")		// requestor
			{			
				isRemoteControl = false;
				Toolbar.changeRemoteControlButtonState(false);
			}			
			
			return;
		});
	
		$(msg).find('body').each(function ()  	
		{
			var body = $('<div/>').text($(this).text()).html();
			
    			console.log('onMessage chat', body, from)			
			
			if (body.indexOf('https://') == 0 && body.indexOf('/ofmeet/?b=') > 0)
			{
				$(document).trigger("ofmuc.meeting.invite", [body, Strophe.getBareJidFromJid(from)]);
			}
					
		});		
		
		return true;
	}
	
	if (!farparty) farparty = Strophe.getResourceFromJid(from); 	
	if (!that.roomJid) that.roomJid = Strophe.getBareJidFromJid(from);  	
	
	$(msg).find('appshare').each(function() 
	{
		var action = $(this).attr('action');
		var url = $(this).attr('url');

		if (Strophe.getResourceFromJid(from) != Strophe.getResourceFromJid(that.connection.jid))
		{		
			that.handleAppShare(action, url, farparty);
		}
	});
	
	$(msg).find('pdfshare').each(function() 
	{
		var action = $(this).attr('action');
		var url = $(this).attr('url');		
		
		if (Strophe.getResourceFromJid(from) != Strophe.getResourceFromJid(that.connection.jid))
		{				
			that.handlePdfShare(action, url, farparty);	
		}
	});
	
	$(msg).find('linkshare').each(function() 
	{
		var action = $(this).attr('action');
		var url = $(this).attr('url');		
		
		if (Strophe.getResourceFromJid(from) != Strophe.getResourceFromJid(that.connection.jid))
		{				
			that.handleLinkShare(action, url, farparty);	
		}
	});	
	
	$(msg).find('avatarshare').each(function() 
	{
		that.members[from].avatar = $(this).text();	
		Avatar.setUserAvatar(from);
	});	
	
        return true;
    },
    
    onRayo: function (packet) 
    {
	//console.log("onRayo", packet);
	var from = $(packet).attr('from');
	
	var jid = null;
	var videoSpanId = null;
	var node = null;

	$(packet).find('header').each(function() 
	{		
		var name = $(this).attr('name');
		var value = $(this).attr('value');
		
		//console.log("onRayo header", name, value);
		
		if (name == "caller_id")
		{	
			if (value.indexOf("@") > -1)
			{
				var callerId = value.substring(4); // remove sip:
				
				node = Strophe.getNodeFromJid(callerId);
				jid = callerId + "/" + node;
			} else {
				node = value;
				jid = node + "@" + config.hosts.domain + "/" + node
			}
			videoSpanId = 'participant_' + node;
		}

	});	
		
	$(packet).find('answered').each(function() 
	{	
		var callId = Strophe.getNodeFromJid(from); 
		
		//console.log("onRayo callid", callId, jid);
		
		if (jid)
		{
			VideoLayout.ensurePeerContainerExists(jid);	
			var container = document.getElementById(videoSpanId);
			
			if (container) 
			{	
			    	$(container).show();			
				$(container).attr("title", Strophe.getBareJidFromJid(jid));
			}
		}
	});
	
	$(packet).find('hangup').each(function() 
	{	
		var callId = Strophe.getNodeFromJid(from); 
		
		//console.log("onRayo callid", callId, jid);	
		
		if (jid) 
		{
			var container = document.getElementById(videoSpanId);
			
			if (container) 
			{
			    VideoLayout.removeConnectionIndicator(jid);
			    // hide here, wait for video to close before removing
			    $(container).hide();
			    VideoLayout.resizeThumbnails();
			}
		}	
	});	
	
	return true;
    },
    
    appSave: function(callback) {
    	//console.log("ofmuc.appSave");
    	
    	var canSave = false;
    	
    	try {
    		canSave = this.appFrame && this.appFrame.contentWindow.OpenfireMeetings && this.appFrame.contentWindow.OpenfireMeetings.getContent;
    	} catch (e) { if (callback) callback()}
    	
	if (canSave)
	{        	
		var content = this.appFrame.contentWindow.OpenfireMeetings.getContent();
    		
    		if (content != null)
    		{
			var compressed = LZString.compressToBase64(content);   
			
			//console.log("ofmuc.appSave", this.shareApp, content, compressed);

			var ns = this.shareApp + "/" + this.roomJid;
			var iq = $iq({to: config.hosts.domain, type: 'set'});
			iq.c('query', {xmlns: "jabber:iq:private"}).c('ofmeet-application', {xmlns: ns}).t(compressed);

			this.connection.sendIQ(iq,

				function (resp) {
					if (callback) callback()
				},

				function (err) {			
					$.prompt("Application save...", {title: err, persistent: false});			
				}
			);
			
		} else if (callback) callback();
	
	} else if (callback) callback()      
    },   
    
    appPrint: function() {
    	//console.log("ofmuc.appPrint");

    	var canPrint = false;
    	
    	try {
    		canPrint = this.appFrame && this.appFrame.contentWindow.OpenfireMeetings && this.appFrame.contentWindow.OpenfireMeetings.getPrintContent;
    	} catch (e) {}
    	
	if (canPrint)
	{        	
		var content = this.appFrame.contentWindow.OpenfireMeetings.getPrintContent();   
		var printWin = window.open();
		printWin.document.write(content);
		printWin.print();
   		printWin.close();
	}
    },  
    
    appEnableCursor: function(flag) {
    	//console.log("ofmuc.appEnableCursor", flag)   
    	this.enableCursor = flag;
    },
    

    appReady: function() {
    	//console.log("ofmuc.appReady")   
    	
    	if (this.appRunning) return;
    	
        $.prompt.close();    	
        
	this.setPresentationVisible(true); 
        VideoLayout.resizeLargeVideoContainer();
        VideoLayout.positionLarge();
        VideoLayout.resizeThumbnails();  
        this.resize();
        
        // request for initial content
        
	if (this.shareApp)     // owner, get from server
	{
		var that = this;
		var ns = this.shareApp + "/" + this.roomJid;
        	var iq = $iq({to: config.hosts.domain, type: 'get'});
        	iq.c('query', {xmlns: "jabber:iq:private"}).c('ofmeet-application', {xmlns: ns});
        	
		this.connection.sendIQ(iq,

			function (resp) {			
				var response = "";

				$(resp).find('ofmeet-application').each(function() 
				{
					try {
						if (that.appFrame && that.appFrame.contentWindow.OpenfireMeetings && that.appFrame.contentWindow.OpenfireMeetings.setContent)
						{ 	
							var content = LZString.decompressFromBase64($(this).text());
							//console.log("ofmuc.appReady", that.shareApp, content);						
							that.appFrame.contentWindow.OpenfireMeetings.setContent(content);
						}
					} catch (e) {}
				});
			},

			function (err) {			
				$.prompt("Application data retrieve...", {title: err, persistent: false});			
			}
		); 
		
		this.appShare("create", this.shareApp);			
		
	} else { 		// request from peers	
		var msg = $msg({to: this.roomJid, type: 'groupchat'});
		msg.c('appshare', {xmlns: 'http://igniterealtime.org/protocol/appshare', action: 'message', url: '{"type": "joined"}'}).up();
		this.connection.send(msg);
	}
	
	this.appRunning = true;
    	if (this.appFrame) this.appFrame.contentWindow.postMessage({ type: 'ofmeetEnableCursor', flag: this.enableCursor}, '*');	
    },
    
    appShare: function(action, url) {
    	//console.log("ofmuc.appShare", url, action)
        var msg = $msg({to: this.roomJid, type: 'groupchat'});
        msg.c('appshare', {xmlns: 'http://igniterealtime.org/protocol/appshare', action: action, url: url}).up();
        this.connection.send(msg);        
    },  

    appStart: function(url, owner) {
	//console.log("ofmuc.appStart", url, owner);
	
	this.enableCursor = true;
	Toolbar.changeShareAppsButtonState(true);
		
	$('#presentation').html('<iframe id="appViewer" src="' + url + "?room=" + Strophe.getNodeFromJid(this.roomJid) + "&user=" + SettingsMenu.getDisplayName() + '"></iframe>');
	this.appFrame = document.getElementById("appViewer");
		
	$.prompt("Please wait....",
	    {
		title: "Application Loader",
		persistent: false
	    }
	);	
    },

   appStop: function(url) {    
	//console.log("ofmuc.appStop", url);	

	this.setPresentationVisible(false);
	Toolbar.changeShareAppsButtonState(false);
	
	if (this.appFrame)
	{
		this.appFrame.contentWindow.location.href = "about:blank";
		this.appFrame = null;
		this.appRunning = false;
		
		$('#presentation').html('');		
	}
    },
    
    appMessage: function(msg) {

	//console.log("ofmuc.appMessage", msg);
	
	if (this.appFrame)
	{
		this.appShare("message", JSON.stringify(msg));
	}        
    },    

    handleAppShare: function (action, url, from)
    {
	//console.log("ofmuc.handleAppShare", url, action);
	
	if (this.shareApp == null)
	{
		if (this.appFrame == null) 
		{
			if (action == "create") this.appStart(url, false);		
		
		} else {
			
			if (action == "destroy") this.appStop(url);	
		}
	}
	
	if (this.appFrame && this.appFrame.contentWindow)
	{
		if (this.enableCursor) this.appFrame.contentWindow.postMessage({ type: 'ofmeetSetMessage', json: url, from: from}, '*');
		
		try {
			if (this.appFrame.contentWindow.OpenfireMeetings && this.appFrame.contentWindow.OpenfireMeetings.handleAppMessage && action == "message")
			{
				this.appFrame.contentWindow.OpenfireMeetings.handleAppMessage(url, from);
			}
		} catch (e) { }		
	}
    },

    appGetMembers: function ()
    {
    	return this.connection.emuc.list_members;
    },
    
    getMember: function (jid)
    {
    	var members = Object.getOwnPropertyNames(this.connection.emuc.members);
    	var member = null;
    	var resource = Strophe.getResourceFromJid(jid);
    	
	for (var i = 0; i < members.length; i++) 
	{
		var temp = this.connection.emuc.members[members[i]];
		
		if (temp && temp.jid)
		{
			if (Strophe.getResourceFromJid(temp.jid) == resource)
			{
				member = this.connection.emuc.members[members[i]];
				break;
			}
		}
	}  
	return member;
    },
        

    openAppsDialog: function() {
	//console.log("ofmuc.openAppsDialog"); 
	var that = this;
	var canPrint = false;
	var canSave = false;
	
	try {
		canPrint = this.appFrame && this.appFrame.contentWindow.OpenfireMeetings && this.appFrame.contentWindow.OpenfireMeetings.getPrintContent;
		canSave = this.appFrame && this.appFrame.contentWindow.OpenfireMeetings && this.appFrame.contentWindow.OpenfireMeetings.setContent;
	} catch (e) {}
	
	var removeButtons = { "Remove": 1};
	var printButtons = { "Ok": 1};
	
	if (canPrint)
	{
		removeButtons["Print"] = 2;
		printButtons["Print"] = 2;		
	}
	
	if (canSave)
	{
		removeButtons["Save"] = 3;	
	}	
	
	
	if (this.shareApp) 
	{
	        if (this.isPresentationVisible() == false)
	        {
	        	this.setPresentationVisible(true);
	        
	        } else {
	        
			$.prompt("Are you sure you would like to remove your shared application?",
				{
				title: "Remove application sharing",
				buttons: removeButtons,
				defaultButton: 1,
				submit: function(e,v,m,f)
				{
					if(v==1)
					{
						that.appSave(function()
						{
							that.appShare("destroy", that.shareApp);
							that.appStop(that.shareApp);
							that.shareApp = null;
						});						
						
					} 
					else if(v==3)
					{
						that.appSave();
					}
					else if(v==2)
					{
						that.appPrint();
					}					
				}
			});
		}
	}
	else if (this.appFrame != null) {
	
	        if (this.isPresentationVisible() == false)
	        {
	        	this.setPresentationVisible(true);
	        
	        } else {	
			$.prompt("Another participant is already sharing an application, presentation or document. This conference allows only one application, presentation or document at a time.",
				 {
				 f: "Share an application",
				 buttons: printButtons,
				 defaultButton: 0,
				 submit: function(e,v,m,f)
				 {
					if(v==1)
					{
				    		//$.prompt.close();
					} 
					else if(v==2)
					{
						that.appPrint();
					}				    
				 }
			});
		}
	}
	else {
	    	var appsList = '<select id="appName"><option value="/ofmeet/apps/woot">Collaborative Editing</option><option value="/ofmeet/apps/drawing">Collaborative Drawing</option>'
	    	
	    	for (var i=0; i<that.urls.length; i++)
	    	{
	    		if (that.urls[i].url.indexOf(".HTML") > -1 || that.urls[i].url.indexOf(".html") > -1)
	    		{
	    			appsList = appsList + '<option value="' + that.urls[i].url + '">' + that.urls[i].name + '</option>'
	    		}
	    	}
	    	appsList = appsList + '</select>'
	    	
		$.prompt('<h2>Are you sure you would like to share an application?</h2>' + appsList,
		{
			title: "Share an application",
			persistent: false,
			buttons: { "Share": true , "Cancel": false},
			defaultButton: 1,     
			loaded: function(event) {
				//document.getElementById('appName').select();
			},			
			submit: function(e,v,m,f) 
			{
				if(v)
				{
					that.shareApp = document.getElementById('appName').value;

					if (that.shareApp)
					{											
						setTimeout(function()
						{					
							that.appStart(that.shareApp, true);						
						}, 500);													
					}
				}					 
			}
		});    
	}
	
    },	  
  

    pdfReady: function() {
	this.setPresentationVisible(true); 
        VideoLayout.resizeLargeVideoContainer();
        VideoLayout.positionLarge();
        VideoLayout.resizeThumbnails();  
        this.resize();
        $.prompt.close();
    },
    
    pdfShare: function(action, url) {
    	//console.log("ofmuc.pdfShare", url, action)
        var msg = $msg({to: this.roomJid, type: 'groupchat'});
        msg.c('pdfshare', {xmlns: 'http://igniterealtime.org/protocol/pdfshare', action: action, url: url}).up();
        this.connection.send(msg);        
    },
    
    pdfStart: function(url) {
	//console.log("ofmuc.pdfStart", url);
	
	$('#presentation').html('<iframe id="appViewer"></iframe>');
	
	this.appFrame = document.getElementById("appViewer");
	this.appFrame.contentWindow.location.href = "/ofmeet/pdf/index.html?pdf=" + url + "&room=" + Strophe.getNodeFromJid(this.roomJid);
	
        $.prompt("Please wait....",
            {
                title: "PDF Loader",
                persistent: false
            }
        );	
    },

    pdfStop: function(url) {    
	//console.log("ofmuc.pdfStop", url);	

	this.setPresentationVisible(false);
	
	if (this.appFrame)
	{
		this.appFrame.contentWindow.location.href = "about:blank";
		this.appFrame = null;
		
		$('#presentation').html('');		
	}
    },
    
    pfdGoto: function(page) {
	//console.log("ofmuc.pfdGoto", page);
	
	this.pdfPage = page;
	
	if (this.sharePDF != null)
	{
		this.pdfShare("goto", this.sharePDF + "#" + page);
	}
    },
    
    pfdMessage: function(msg) {

	//console.log("pfdMessage", msg);
	
	if (this.appFrame)
	{
		this.pdfShare("message", JSON.stringify(msg));
	}        
    },

    handlePdfShare: function (action, url, from)
    {
	//console.log("local handlePdfShare", url, action, from);
	
	if (this.sharePDF == null)
	{
		if (this.appFrame == null) 
		{
			if (action == "create") this.pdfStart(url);		
		
		} else {
			
			if (action == "destroy") this.pdfStop(url);	
			if (action == "goto") this.appFrame.contentWindow.location.href = "/ofmeet/pdf/index.html?pdf=" + url;
		}
	}
	
	if (this.appFrame && this.appFrame.contentWindow.handlePdfShare && action == "message")
	{
		this.appFrame.contentWindow.handlePdfShare(url, from);
	}
	
    },
	
    openPDFDialog: function() {
	//console.log("openPDFDialog");    	
    	    var that = this;
    	    
    	    //this.roomJid = connection.emuc.roomjid;
    	
	    if (that.sharePDF) 
	    {
	    
	        if (this.isPresentationVisible() == false)
	        {
	        	this.setPresentationVisible(true);
	        
	        } else {	
	        
			$.prompt("Are you sure you would like to remove your Presentation?",
				{
				title: "Remove PDF Presentation",
				buttons: { "Remove": true, "Cancel": false},
				defaultButton: 1,
				submit: function(e,v,m,f)
				{
					if(v)
					{
						that.pdfShare("destroy", that.sharePDF);
						that.pdfStop(that.sharePDF);
						that.sharePDF = null;	
					}
				}
			});
		}
	    }
	    else if (this.appFrame != null) {
	    
	        if (this.isPresentationVisible() == false)
	        {
	        	this.setPresentationVisible(true);
	        
	        } else {	    
			$.prompt("Another participant is already sharing an application, presentation or document. This conference allows only one presentation or document at a time.",
				 {
				 f: "Share a PDF Presentation",
				 buttons: { "Ok": true},
				 defaultButton: 0,
				 submit: function(e,v,m,f)
				 {
				    //$.prompt.close();
				 }
			});
		}
	    }
	    else {
	    
	    	var urlsList = '<datalist id="urls-list">'
	    	
	    	for (var i=0; i<that.urls.length; i++)
	    	{
	    		if (that.urls[i].url.indexOf(".pdf") > -1 && that.urls[i].url.indexOf(".PDF") > -1) urlsList = urlsList + '<option value="' + that.urls[i].url + '">' + that.urls[i].name + '</option>'
	    	}
	    	urlsList = urlsList + '</datalist>'
	    	
		$.prompt('<h2>Share a Presentation</h2> <br> Full URL to a public PDF:<input id="pdfiUrl" type="text" list="urls-list" autofocus >' + urlsList,
		{
			title: "Share a PDF Presentation",
			persistent: false,
			buttons: { "Share": true , "Cancel": false},
			defaultButton: 1,
			loaded: function(event) {
				document.getElementById('pdfiUrl').select();
			},
			submit: function(e,v,m,f) 
			{
				if(v)
				{
					that.sharePDF = document.getElementById('pdfiUrl').value;

					if (that.sharePDF)
					{
						setTimeout(function()
						{
							that.pdfStart(that.sharePDF  + "&control=true");
							that.pdfShare("create", that.sharePDF  + "&control=false");
						}, 500);
					}
				}					 
			}
		});    
	    }
    },

    setPresentationVisible: function(visible) {    
        if (visible) {
            // Trigger the video.selected event to indicate a change in the
            // large video.
            $(document).trigger("video.selected", [true]);

            $('#largeVideo').fadeOut(300, function () {
                VideoLayout.setLargeVideoVisible(false);
                $('#presentation>iframe').fadeIn(300, function() {
                    $('#presentation>iframe').css({opacity:'1'});
                    ToolbarToggler.dockToolbar(false);
                });
            });
        }
        else {
            if ($('#presentation>iframe').css('opacity') == '1') {
                $('#presentation>iframe').fadeOut(300, function () {
                    $('#presentation>iframe').css({opacity:'0'});
                    $('#reloadPresentation').css({display:'none'});
                });
            }            
	    $('#largeVideo').fadeIn(300, function() {
		VideoLayout.setLargeVideoVisible(true);
		ToolbarToggler.dockToolbar(true);
	    });            
        }
    },
    
    isPresentationVisible: function () {
        return ($('#presentation>iframe') != null && $('#presentation>iframe').css('opacity') == 1);
    },

    avatarShare: function(avatar) {
    	//console.log("ofmuc.avatarShare", avatar)
        var msg = $msg({to: this.roomJid, type: 'groupchat'});
        msg.c('avatarshare', {xmlns: 'http://igniterealtime.org/protocol/avatarshare'}).t(avatar).up();
        this.connection.send(msg);        
    },    
    
    toggleRecording: function () 
    {
    	var that = this;
    	
    	if (!that.isRecording)
    	{
		$.prompt('<h2>Enter recording token</h2><input id="recordingToken" type="text" placeholder="token" autofocus>',
		{
			title: "Meeting Recording",
			buttons: { "Record": true, "Cancel": false},
			defaultButton: 1,
			loaded: function(event) {
				document.getElementById('recordingToken').focus();
			},			
			submit: function(e,v,m,f)
			{
				if(v)
				{
				    var token = document.getElementById('recordingToken');

				    if (token.value) {
					that.recordingToken = Util.escapeHtml(token.value);
					
					if (config.recordingKey && config.recordingKey == that.recordingToken)
					{				
						that.doRecording();
					}
				    }	
				}
			}
		});
	
	} else that.doRecording();
    },
    
    doRecording: function()
    {
    	var that = this;   
    	
	that.recordConference(Strophe.getNodeFromJid(that.connection.emuc.myroomjid), !that.isRecording, function(json)
	{		
		console.log('doRecording response', json);	
		that.isRecording = !that.isRecording;
		Toolbar.setRecordingButtonState(that.isRecording);			

	}, function(err) {
		console.error('doRecording', err);	
		Toolbar.setRecordingButtonState(false);
		that.isRecording = false;			
	});
    },
    
    openLinkDialog: function()
    {
    	var that = this;
    	window.postMessage({type: 'ofmeetPaste'}, '*');

    	if (this.isPresentationVisible() == false)
    	{    
    		that.shareLink = "https://www.youtube.com/watch?v=9a__jGWTkjg";
    		
	    	var urlsList = '<datalist id="links-list">'
	    	
	    	for (var i=0; i<that.urls.length; i++)
	    	{
	    		if (that.urls[i].url.indexOf(".pdf") == -1 && that.urls[i].url.indexOf(".PDF") == -1 && that.urls[i].url.indexOf(".html") == -1 && that.urls[i].url.indexOf(".HTML") == -1)
	    		{
	    			urlsList = urlsList + '<option value="' + that.urls[i].url + '">' + that.urls[i].name + '</option>'
	    		}
	    	}
	    	urlsList = urlsList + '</datalist>'    		
    		
		messageHandler.openTwoButtonDialog
		(
		    "Share this link with everyone in conference",
		    '<input id="shareLinkRef" type="text" value="' + that.shareLink + '" onclick="this.select();" list="links-list" autofocus >' + urlsList,
		    false,
		    "Share a link",
		    function (e, v) {
			if (v) {
				var link = document.getElementById('shareLinkRef').value;
				
				if (that.validURL(link))
				{
    					if (link.substring(0, 5) == "http:") link = "https:" + link.substring(5);				
					that.shareLink = link;
					that.linkSharer = true;
					
					if (that.getYoutubeLink(link) || that.googleDocsLink(link) || that.iframeURL(link))
					{
						that.linkShare('yt-start', that.shareLink);
					}

					setTimeout(function()
					{
						that.startLinkShare();
					}, 500);
					
				} else {

					setTimeout(function()
					{				
						$.prompt("Unsupported link", {title: "Share this link with everyone in conference", persistent: false});
					}, 500);
				}
			} else {
				Toolbar.changeShareLinkButtonState(false);
			}
		    },
		    function () {
			document.getElementById('shareLinkRef').select();
		    }
		);
		
	} else {
		if (that.linkSharer)
		{
			$.prompt("Are you sure you would like to remove your link share?",
				{
				title: "Remove Link Sharing",
				buttons: { "Remove": true, "Cancel": false},
				defaultButton: 1,
				submit: function(e,v,m,f)
				{
					if(v)
					{
						that.linkShare('yt-stop', that.shareLink);
						that.stopLinkShare();
						that.linkSharer = false;
					}
				}
			});
			
		} else {

			$.prompt("Another participant is already sharing a link, presentation, document or application. This conference allows only one thing to be shared at the same time.",
				 {
				 f: "Share a link",
				 buttons: { "Ok": true},
				 defaultButton: 0,
				 submit: function(e,v,m,f)
				 {

				 }
			});		
		}
	}
    },

    getYoutubeLink: function (url) 
    {
        let p = /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
        return (url.match(p)) ? RegExp.$1 : false;
    },  
    
    googleDocsLink: function (url) 
    {
        let p = /^.*\.(pdf|pages|ai|psd|tiff|dxf|svg|eps|ps|ttf|xps|zip|rar|((doc|xls|ppt)x?))$/;
        return (url.match(p)) ? url : false;
    },  
    
    validURL: function (url) 
    {
        let p = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/;
        return url.match(p);
    }, 
    
    iframeURL: function (url) 
    {   
    	return url.indexOf("<iframe src=") > -1;
    },
    
    existURL: function (url, callback, errorback)
    {
	var xhr = new XMLHttpRequest();

	xhr.onreadystatechange = function() 
	{
		if (xhr.readyState == 4 && xhr.status == 200)
		{
			if (callback) callback();
		}

		if (xhr.status >= 400)
		{
			if (errorback) errorback();
		}
	};
	xhr.open("GET", url, true);
	xhr.send();
    },

    stopLinkShare: function()
    {
	console.log("stopLinkShare", this.shareLink, this.shareLinkViewer);
	
    	var that = this;
    	
	if (that.shareLinkViewer && that.shareLinkViewer.stopVideo)
	{
		that.shareLinkViewer.stopVideo();
	}
	
	that.shareLinkViewer = null;
	Toolbar.changeShareLinkButtonState(false);
	that.shareLink = "";
	that.setPresentationVisible(false);
	$('#presentation').html('');
    
    },
    
    startLinkShare: function()
    {
	console.log("startLinkShare", this.shareLink);
	
    	var ytLink = this.getYoutubeLink(this.shareLink)
    	
    	if (ytLink) this.doYTLinkShare(ytLink);
    	else
    	if (this.googleDocsLink(this.shareLink)) this.doGDocsShare();
    	else
    	if (this.iframeURL(this.shareLink)) this.doIFrameShare();    	
    	else
    	  this.doAppShare();
    },


    doAppShare: function ()
    {
	console.log("doAppShare", this.shareLink);
	
	this.shareApp = this.shareLink;	
	this.shareLink = "";
	this.linkSharer = false;
	this.appStart(this.shareApp, true);																			
    },

    doIFrameShare: function()
    {
	console.log("doIFrameShare");
	
    	var that = this;
    	
	$.prompt("Please wait....",
	    {
		title: "Embeded Viewer Loader",
		persistent: false
	    }
	);    	
	console.log("Found iframe", this.shareLink);   
	
	$('#presentation').html(this.shareLink);
	$('#presentation>iframe').width(this.getPresentationWidth());
	$('#presentation>iframe').height(this.getPresentationHeight());
	
	this.shareLinkViewer = {};

	setTimeout(function()
	{
		that.setPresentationVisible(true);
		Toolbar.changeShareLinkButtonState(true); 
		$.prompt.close();	
	}, 1000);
    },
    
    doGDocsShare: function ()
    {
	console.log("doGDocsShare");
	
    	var that = this;
    	
	$.prompt("Please wait....",
	    {
		title: "Google Docs Viewer Loader",
		persistent: false
	    }
	);    	
	console.log("Found google docs", this.shareLink);   
	
	$('#presentation').html('<iframe id="gdocViewer"></iframe>');
	$('#presentation>iframe').width(this.getPresentationWidth());
	$('#presentation>iframe').height(this.getPresentationHeight());
	
	
	this.shareLinkViewer = document.getElementById("gdocViewer");
	this.shareLinkViewer.contentWindow.location.href = "https://docs.google.com/viewer?url=" + this.shareLink + "&embedded=true";
	
	setTimeout(function()
	{
		that.setPresentationVisible(true);
		Toolbar.changeShareLinkButtonState(true); 
		$.prompt.close();	
	}, 1000);
    },
    
    doYTLinkShare: function (ytLink)
    {
	console.log("doYTLinkShare", ytLink);
	
    	var that = this;
    	var done = false;
    	
	$.prompt("Please wait....",
	    {
		title: "YouTube Video Loader",
		persistent: false
	    }
	);    	
	console.log("Found you tube video", this.shareLink, ytLink);

	$('#presentation').html('<div id="youtube-video"></div>');

	function onPlayerStateChange(event) 
	{
		console.log("YT onPlayerStateChange", event);

		if (event.data == YT.PlayerState.PLAYING && !done) 
		{
			Toolbar.changeShareLinkButtonState(true); 
			done = true;
		}
	}

	function onPlayerReady(event) 
	{
		console.log("YT onPlayerStateChange", event);

		$.prompt.close();
		that.setPresentationVisible(true);		
		event.target.playVideo();
	}	

	this.shareLinkViewer = new YT.Player('youtube-video', 
	{
		height: that.getPresentationHeight(),
		width: that.getPresentationWidth(),
		videoId: ytLink,
		events: {
			'onReady': onPlayerReady,
			'onStateChange': onPlayerStateChange
		}
	});    
    },
    
    handleLinkShare: function (action, url, from)
    {
	console.log("local handleLinkShare", url, action, from, this.shareLink);
	
	if (this.shareLink == null || this.shareLink == "")
	{
		this.shareLink = url;
		
		if (this.shareLinkViewer == null) 
		{
			if (action == "yt-start") this.startLinkShare();				
		}
		
	} else {
		
		if (action == "yt-stop") this.stopLinkShare();	
	}
		
    },
    
    linkShare: function(action, url) 
    {
    	//console.log("ofmuc.linkShare", url, action)
        var msg = $msg({to: this.roomJid, type: 'groupchat'});
        msg.c('linkshare', {xmlns: 'http://igniterealtime.org/protocol/linkshare', action: action, url: url}).up();
        this.connection.send(msg);        
    },
    
    setProperties: function(props, callback, errorback)
    {
	props.action = "set_user_properties";		
	this.sendJsonRequest(props, callback, errorback);				
    },

    getProperties: function(callback, errorback)
    {
	this.sendJsonRequest({action: "get_user_properties"}, callback, errorback);	
    },

    getConferenceId: function(room, callback, errorback)
    {
	this.sendJsonRequest({room: room, action: "get_conference_id"}, callback, errorback);	
    },
    
    recordConference: function(room, recordFlag, callback, errorback)
    {
	this.sendJsonRequest({room: room, record: recordFlag ? "true" : "false", action: "get_conference_id"}, callback, errorback);	
    },

    sendJsonRequest: function(request, callback, errorback)
    {		
	this.connection.sendIQ($iq({to: this.connection.domain, type: 'get'}).c("request", {xmlns: 'http://igniterealtime.org/protocol/ofmeet'}).t(JSON.stringify(request)),

		function (resp) 
		{
			var response  = resp.querySelector("response");
			var json = response.innerHTML && response.innerHTML != "" ? response.innerHTML : "{}"
			if (callback) callback(JSON.parse(json));
		},

		function (err) 
		{				
			var code = err.querySelector("error");
			var text  = err.querySelector("text");

			if (errorback) errorback({code: code.getAttribute("code"), text: text.innerHTML});
		}
	);		
    }    
});

