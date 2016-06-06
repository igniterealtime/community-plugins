/**
 * OFMeet SASL Plugin
 *
 * Adds a SASL mechanism __that is properietary to Openfire.
 */
Strophe.addConnectionPlugin('ofmeetsasl', {

    /**
     * Initializes the plugin by registering the new SASL mechanism as part of the Strophe SASL mechanisms.
     *
     * Invoked by the Strophe.Connection constructor.
     */
    init: function (connection) {
        // Implementation of the new SASLMechanism.
        
        if (config.id && config.password)
        {
		Strophe.SASLOFMeet = function () {
		};
		Strophe.SASLOFMeet.prototype = new Strophe.SASLMechanism("OFMEET", true, 2000);
		Strophe.SASLOFMeet.test = function (connection) {
		    return config.password !== null;
		};
		Strophe.SASLOFMeet.prototype.onChallenge = function (connection) {
		    return config.password;
		};

		// Register the new SASL mechanism.
		connection.mechanisms[Strophe.SASLOFMeet.prototype.name] = Strophe.SASLOFMeet;
	}
    }
});

/**
 * OFMeet RSM Plugin
 *
 * Adds RSM required fir MAM.
 */
Strophe.addNamespace('RSM', 'http://jabber.org/protocol/rsm');

Strophe.RSM = function(options) {
  this.attribs = ['max', 'first', 'last', 'after', 'before', 'index', 'count'];

  if (typeof options.xml != 'undefined') {
    this.fromXMLElement(options.xml);
  } else {
    for (var ii = 0; ii < this.attribs.length; ii++) {
      var attrib = this.attribs[ii];
      this[attrib] = options[attrib];
    }
  }
};

Strophe.RSM.prototype = {
  toXML: function() {
    var xml = $build('set', {xmlns: Strophe.NS.RSM});
    for (var ii = 0; ii < this.attribs.length; ii++) {
      var attrib = this.attribs[ii];
      if (typeof this[attrib] != 'undefined') {
	xml = xml.c(attrib).t(this[attrib].toString()).up();
      }
    }
    return xml.tree();
  },

  next: function(max) {
    var newSet = new Strophe.RSM({max: max, after: this.last});
    return newSet;
  },

  previous: function(max) {
    var newSet = new Strophe.RSM({max: max, before: this.first});
    return newSet;
  },

  fromXMLElement: function(xmlElement) {
    for (var ii = 0; ii < this.attribs.length; ii++) {
      var attrib = this.attribs[ii];
      var elem = xmlElement.getElementsByTagName(attrib)[0];
      if (typeof elem != 'undefined' && elem !== null) {
	this[attrib] = Strophe.getText(elem);
	if (attrib == 'first') {
	  this.index = elem.getAttribute('index');
	}
      }
    }
  }
};

/**
 * OFMeet MAM Plugin
 *
 */
 
Strophe.addConnectionPlugin('mam', {
    _c: null,
    _p: [ 'with', 'start', 'end' ],
    init: function (conn) {
	this._c = conn;
	Strophe.addNamespace('MAM', 'urn:xmpp:mam:0');
	console.log("strophe plugin mam enabled");
    },
    query: function (jid, options) {
	console.log("mam query", jid, options);

	var _p = this._p;
	var attr = {
	    type:'set',
	    id:jid
	};
	var mamAttr = {xmlns: Strophe.NS.MAM};
	if (!!options['queryid']) {
	    mamAttr.queryid = options['queryid'];
	    delete options['queryid'];
	}
	var iq = $iq(attr).c('query', mamAttr).c('x',{xmlns:'jabber:x:data', type:'submit'});

	iq.c('field',{var:'FORM_TYPE', type:'hidden'}).c('value').t('urn:xmpp:mam:0').up().up();
	var i;
	for (i = 0; i < this._p.length; i++) {
	    var pn = _p[i];
	    var p = options[pn];
	    delete options[pn];
	    if (!!p) {
		iq.c('field',{var:pn}).c('value').t(p).up().up();
	    }
	}
	iq.up();

	var onMessage = options['onMessage'];
	delete options['onMessage'];

	var onComplete = options['onComplete'];		
	delete options['onComplete'];

	var onError = options['onError'];
	delete options['onError'];

	iq.cnode(new Strophe.RSM(options).toXML());

	this._c.addHandler(onMessage, Strophe.NS.MAM, 'message', null);
	return this._c.sendIQ(iq, onComplete, onError);
    }
});	

/**
 * Strophe.vCard plugin.
 */

 Strophe.addConnectionPlugin('vCard', 
 {
	_connection: null,

	init: function (conn) {
	    this._connection = conn;
	    Strophe.addNamespace('vCard', 'vcard-temp');
	    console.log("strophe plugin: vCard enabled");   	    
	},

	get: function(jid, callback, errorback) 
	{
	    var iq = $iq({type: 'get', to: Strophe.getBareJidFromJid(jid)}).c('vCard', {xmlns: 'vcard-temp'});

	    this._connection.sendIQ(iq, function(response)
	    {
		    var response = $(response);
		    var username = Strophe.getNodeFromJid(jid);
		    var name = response.find('vCard FN').text();
		    var photo = response.find('vCard PHOTO');

		    var avatar = "";

		    if (photo.find('BINVAL').text() != "" && photo.find('TYPE').text() != "")
			avatar = 'data:' + photo.find('TYPE').text() + ';base64,' + photo.find('BINVAL').text();

		    var family = response.find('vCard N FAMILY') ? response.find('vCard N FAMILY').text() : "";
				var middle = response.find('vCard N MIDDLE') ? response.find('vCard N MIDDLE').text() : "";
		    var given = response.find('vCard N GIVEN') ? response.find('vCard N GIVEN').text() : "";

		    var nickname = response.find('vCard NICKNAME') ? response.find('vCard NICKNAME').text() : "";

		    var email = response.find('vCard EMAIL USERID') ? response.find('vCard EMAIL USERID').text() : "";
		    var url = response.find('vCard URL') ? response.find('vCard URL').text() : "";

		    var workPhone = "";
		    var homePhone = "";
		    var workMobile = "";
		    var homeMobile = "";

		    response.find('vCard TEL').each(function()
		    {
			if ($(this).find('VOICE').size() > 0 && $(this).find('WORK').size() > 0)
				workPhone = $(this).find('NUMBER').text();

			if ($(this).find('VOICE').size() > 0 && $(this).find('HOME').size() > 0)
				homePhone = $(this).find('NUMBER').text();

			if ($(this).find('CELL').size() > 0 && $(this).find('WORK').size() > 0)
				workMobile = $(this).find('NUMBER').text();

			if ($(this).find('CELL').size() > 0 && $(this).find('HOME').size() > 0)
				homeMobile = $(this).find('NUMBER').text();

		    });

		    var street = "";
		    var locality = "";
		    var region = "";
		    var pcode = "";
		    var country = "";

		    response.find('vCard ADR').each(function()
		    {
			if ($(this).find('WORK').size() > 0)
			{
				street = $(this).find('STREET').text();
				locality = $(this).find('LOCALITY').text();
				region = $(this).find('REGION').text();
				pcode = $(this).find('PCODE').text();
				country = $(this).find('CTRY').text();
			}
		    });

		    var orgName = response.find('vCard ORG ORGNAME') ? response.find('vCard ORG ORGNAME').text() : "";
		    var orgUnit = response.find('vCard ORG ORGUNIT') ? response.find('vCard ORG ORGUNIT').text() : "";

		    var title = response.find('vCard TITLE') ? response.find('vCard TITLE').text() : "";

		    var callbackResponse = {jid: jid, username: username, name: name, avatar: avatar, family: family, given: given, nickname: nickname, middle: middle, email: email, url: url, homePhone: homePhone, workPhone: workPhone, homeMobile: homeMobile, workMobile: workMobile, street: street, locality: locality, region: region, pcode: pcode, country: country, orgName: orgName, orgUnit: orgUnit, title: title};

		    if (callback) callback(callbackResponse);

	    }, function(error) {

		if (errorback) errorback(error);
	    });
	},

	set: function(user, callback, errorback) 
	{
		var avatar = user.avatar.split(";base64,");

		var iq = $iq({to: this._connection.domain, type: 'set'}).c('vCard', {xmlns: 'vcard-temp'})
		.c("N").c("FAMILY").t(user.family).up().c("GIVEN").t(user.given).up().c("MIDDLE").t(user.middle).up().up()
		.c("ORG").c("ORGNAME").t(user.orgName).up().c("ORGUNIT").t(user.orgUnit).up().up()
		.c("FN").t(user.name).up()
		.c("URL").t(user.url).up()
		.c("TITLE").t(user.title).up()
		.c("NICKNAME").t(user.nickname).up()
		.c("PHOTO").c("TYPE").t(avatar[0].substring(5)).up().c("BINVAL").t(avatar[1]).up().up()
		.c("EMAIL").c("WORK").up().c("INTERNET").up().c("PREF").up().c("USERID").t(user.email).up().up()
		.c("TEL").c("PAGER").up().c("WORK").up().c("NUMBER").up().up()
		.c("TEL").c("CELL").up().c("WORK").up().c("NUMBER").t(user.workMobile).up().up()
		.c("TEL").c("VOICE").up().c("WORK").up().c("NUMBER").t(user.workPhone).up().up()
		.c("TEL").c("FAX").up().c("WORK").up().c("NUMBER").up().up()
		.c("TEL").c("PAGER").up().c("HOME").up().c("NUMBER").up().up()
		.c("TEL").c("CELL").up().c("HOME").up().c("NUMBER").t(user.homeMobile).up().up()
		.c("TEL").c("VOICE").up().c("HOME").up().c("NUMBER").t(user.homePhone).up().up()
		.c("TEL").c("FAX").up().c("HOME").up().c("NUMBER").up().up()
		.c("URL").t(user.url).up()
		.c("ADR").c("WORK").up().c("STREET").t(user.street).up().c("LOCALITY").t(user.locality).up().c("REGION").t(user.region).up().c("PCODE").t(user.pcode).up().c("CTRY").t(user.country).up().up()
		.c("ADR").c("HOME").up().c("STREET").up().c("LOCALITY").up().c("REGION").up().c("PCODE").up().c("CTRY").up().up()

		this._connection.sendIQ(iq, callback, errorback);
	},
 });

/**
 * OFMeet workgroups (fastpath) Plugin
 *
 */ 
Strophe.addConnectionPlugin('workgroup',
{
	_connection: null,
	_handler: null,

	/** Function: init
	* Plugin init
	*
	* Parameters:
	*   (Strophe.Connection) conn - Strophe connection
	*/
	init: function(conn)
	{
		this._connection = conn;

		this._connection.addHandler(this._handlePresence.bind(this), null,"presence", null, null, null);  
		this._connection.addHandler(this._handleMessage.bind(this), null,"message", null, null, null); 		
		this._connection.addHandler(this._handleWorkgroups.bind(this), "http://jabber.org/protocol/workgroup", 'iq');	

		console.log("strophe plugin: workgroup enabled");        
	},


	setHandler: function(handler) 
	{  
		this._handler = handler;
	},

	subscribe: function(workgroup) 
	{  
		this._connection.send($pres({type: 'subscribe', to: workgroup + "@workgroup." + this._connection.domain })); 
	},

	unsubscribe: function(workgroup) 
	{  
		this._connection.send($pres({type: 'unsubscribe', to: workgroup + "@workgroup." + this._connection.domain })); 
	},

	joinWorkgroup: function(workgroup, maxChats, callback, errorback) 
	{
		var jid = workgroup + "@workgroup." + this._connection.domain;	
		this._connection.send($pres({to: jid}).c('agent-status', {xmlns: 'http://jabber.org/protocol/workgroup'}));		
		this._connection.send($pres({to: jid}).c('status').t("Online"));		
		var iq = $iq({type: 'get', to: jid}).c('agent-status-request', {xmlns: 'http://jabber.org/protocol/workgroup'});
		var __that = this;

		this._connection.sendIQ(iq,
			function (res) {
				if (callback) callback(res);			
			},

			function (err) {
				if (errorback) errorback(__that.connection.ofUtil.translateError(err))			    
			}
		);		
	},

	leaveWorkgroup: function(workgroup) 
	{
		var jid = workgroup + "@workgroup." + this._connection.domain;	
		this._connection.send($pres({to: jid, type: "unavailable"}).c('agent-status', {xmlns: 'http://jabber.org/protocol/workgroup'}));		
		this._connection.send($pres({to: jid, type: "unavailable"}).c('status').t("Online"));				
	},	

	joinQueue: function(workgroup, form, callback, errorback) 
	{
		var iq = $iq({to: workgroup + "@workgroup." + this._connection.domain, type: 'set'}).c('join-queue', {xmlns: 'http://jabber.org/protocol/workgroup'});	
		iq.c('queue-notifications').up();
		iq.c('x', {xmlns: 'jabber:x:data', type: 'submit'});

		var items = Object.getOwnPropertyNames(form)

		for (var i=0; i< items.length; i++)
		{
			iq.c('field', {var: items[i]}).c('value').t(form[items[i]]).up().up();
		}

		iq.up();
		var __that = this;

		this._connection.sendIQ(iq,
			function (res) {
				if (callback) callback(res);			
			},

			function (err) {
				if (errorback) errorback(__that.connection.ofUtil.translateError(err));				    
			}
		);     	       	
	},   

	leaveQueue: function(workgroup, callback, errorback) 
	{
		var iq = $iq({to: workgroup + "@workgroup." + this._connection.domain, type: 'set'}).c('depart-queue', {xmlns: 'http://jabber.org/protocol/workgroup'});	
		var __that = this;
		
		this._connection.sendIQ(iq,
			function (res) {
				if (callback) callback(res);			
			},

			function (err) {
				if (errorback) errorback(__that.connection.ofUtil.translateError(err));				    
			}
		);     	       	
	}, 

	acceptOffer: function(workgroup, jid, id, callback, errorback) 
	{
		var iq = $iq({to: workgroup + "@workgroup." + this._connection.domain, type: 'set'}).c('offer-accept', {xmlns: 'http://jabber.org/protocol/workgroup', jid: jid, id: id});	
		var __that = this;
		
		this._connection.sendIQ(iq,
			function (res) {
				if (callback) callback(res);			
			},

			function (err) {
				if (errorback) errorback(__that.connection.ofUtil.translateError(err));			    
			}
		);      	       	
	},	

	rejectOffer: function(workgroup, jid, id, callback, errorback) 
	{
		var iq = $iq({to: workgroup + "@workgroup." + this._connection.domain, type: 'set'}).c('offer-reject', {xmlns: 'http://jabber.org/protocol/workgroup', jid: jid, id: id});	
		var __that = this;
		
		this._connection.sendIQ(iq,
			function (res) {
				if (callback) callback(res);			
			},

			function (err) {
				if (errorback) errorback(__that.connection.ofUtil.translateError(err));			    
			}
		);      	       	
	},   	

	_handleMessage: function(message) 
	{  	
		$(message).find('queue-status').each(function ()  	
		{
			var position = 0;
			var time = 0;

			$(this).find('position').each(function ()  	
			{
				position = $(this).text();
			});

			$(this).find('time').each(function ()  	
			{
				time = $(this).text();
			});

			$(document).trigger("Event.Workgroup.QueueStatus",
			{
				from: $(message).attr("from"),
				position: position,
				time: time
			});		
		});

		return true;	
	},

	_handlePresence: function(presence) 
	{  	
		var to = $(presence).attr('to');
		var from = $(presence).attr('from');	

		var xquery = presence.getElementsByTagName("x");
		var agentStatus = presence.getElementsByTagName("agent-status");	
		var notifyQueue = presence.getElementsByTagName("notify-queue");	
		var notifyQueueDetails = presence.getElementsByTagName("notify-queue-details");		
		var inviteAccepted = presence.getElementsByTagName("inviteaccepted");
		var inviteCompleted = presence.getElementsByTagName("invitecompleted");	
		var workgroupPresence = presence.getElementsByTagName("workgroup");

		if (agentStatus.length > 0 || notifyQueueDetails.length > 0 || notifyQueue.length > 0) {

			this._handleAgentPresence($(presence));	

		} else if (workgroupPresence.length > 0) {
			var type = $(presence).attr('type');  
			var open = type != "unavailable" && type != "unsubscribe" && type != "subscribe";		
			var workgroup = Strophe.getNodeFromJid(from);

			$(document).trigger("Event.Workgroup.Status", {id: workgroup, open: open, type: type});			
		}	
		return true;	
	},

	_handleWorkgroups: function(iq) {

		var _myself = this; 
		var iq = $(iq);

		var workgroupJid = iq.attr('from');
		var workgroupName = Strophe.getNodeFromJid(workgroupJid);

		if (iq.attr('type') != "result" && iq.attr('type') != "error") this._connection.send($iq({type: 'result', to: iq.attr('from'), id: iq.attr('id')}));		

		iq.find('offer').each(function() 
		{
			var id = $(this).attr('id');
			var jid = $(this).attr('jid').toLowerCase();	
			var properties = {id: id, jid: jid};

			iq.find('value').each(function() 
			{	
				var name = $(this).attr('name');		
				var value = $(this).text();
				properties[name] = value;
			});

			$(document).trigger("Event.Workgroup.Offer", {workgroup: workgroupJid, name: workgroupName, properties: properties});			
		});

		iq.find('offer-revoke').each(function() 
		{
			id = $(this).attr('id');
			jid = $(this).attr('jid').toLowerCase();
			var properties = {id: id, jid: jid};
			var reason = "offer timed out";

			$(this).find('reason').each(function() 
			{			
				reason = $(this).text();
			});

			$(document).trigger("Event.Workgroup.Revoke", {workgroup: workgroupJid, name: workgroupName, properties: properties, reason: reason});	
		});
		return true;
	},

	_handleAgentPresence:  function(presence) 
	{
		var from = presence.attr('from');
		var status = presence.attr('type') || "available";
		var maxChats = 0, currentChats = 0, workgroup;				

		presence.find('agent-status').each(function() 
		{
			workgroup = $(this).attr("jid");

			presence.find('max-chats').each(function() 
			{
				maxChats = $(this).text();	
			});	

			presence.find('current-chats').each(function() 
			{
				currentChats = $(this).text();				
			});

			$(document).trigger("Event.Workgroup.TraderStatus",
			{
				   from: from,
				   status: status,
				   workgroup: workgroup,
				   maxChats: maxChats
			});			
		});

		presence.find('notify-queue-details').each(function() 
		{
			presence.find('user').each(function() 
			{
				var jid = $(this).attr('jid');
				var position, time, joinTime

				$(this).find('position').each(function() 
				{
					position = $(this).text() == "0" ? "first": jQuery(this).text();				
				});

				$(this).find('time').each(function() 
				{
					time = $(this).text();				
				});

				$(this).find('join-time').each(function() 
				{
					joinTime = $(this).text();				
				});

				$(document).trigger("Event.Workgroup.QueueDetails",
				{
				   from: from,
				   workgroup: from,
				   position: position,
				   time: time,
				   joinTime: joinTime
				});										
			});

		});

		presence.find('notify-queue').each(function() 
		{
			var free = true;
			var count, oldest, waitTime, status

			presence.find('count').each(function() 
			{
				count = jQuery(this).text();				
			});

			presence.find('oldest').each(function() 
			{
				oldest = jQuery(this).text();				
			});

			presence.find('time').each(function() 
			{
				waitTime = jQuery(this).text();				
			});

			presence.find('status').each(function() 
			{
				status = jQuery(this).text();				
			});

			if (count && oldest && waitTime && status)
			{
				free = false;		
			}

			$(document).trigger("Event.Workgroup.QueueSummary",
			{
			   workgroup: from,
			   free: free,
			   count: count,
			   oldest: oldest,
			   waitTime: waitTime,
			   status: status
			});			
		});	

		return true;     
	}	
});
 
/**
 * OFMeet Utilities
 *
 */
Strophe.addConnectionPlugin('ofmeetutil', {


	init: function (connection) 
	{
		this.connection = connection;
		this.browserDetect.init();

		console.log("strophe plugin: ofmeetutil enabled");           
	},
    
	sendRequest: function(request, callback, errorback)
	{
		var translateError = function (err) 
		{
		    var error = {id: "Event.Error"};

		    $(err).find('error').each(function() 
		    {
			error.code = $(this).attr("code");
		    });	

		    $(err).find('text').each(function() 
		    {
			error.description = $(this).text();
		    });				    

		   return error;				    
		};

		var translateResponse = function (resp) 
		{
		    var response = {};

		    $(resp).find('response').each(function() 
		    {
			response = JSON.parse($(this).text());
		    });				    

		   return response;				    
		};
		
		this.connection.sendIQ($iq({to: this.connection.domain, type: 'get'}).c("request", request),
			function (resp) {
			    if (callback) callback(translateResponse(resp));
			},

			function (err) {
			    if (errorback) errorback(translateError(err));
			}
		);	
	},

	

	guid: function() 
	{
		return MD5.hexdigest(new String((new Date()).getTime())) 
	},

	usernamesToId: function(usernames) 
	{	
		return MD5.hexdigest(usernames.sort(function(a, b) {return a < b ? 1 : a >= b ? -1 : 0;}).join(""));
	},

	jidsToId: function(jid) 
	{	
		return MD5.hexdigest(jid.map(function(e) {return Strophe.getNodeFromJid(e)}).sort(function(a, b) {return a < b ? 1 : a >= b ? -1 : 0;}).join(""));
	},	

	makeJidFromUsername: function(username) 
	{
		var jid = username;
		if (username.indexOf("@") == -1) jid = jid + "@" + this.connection.domain;
		return jid;
	},	

	isArray: function( obj ) 
	{
	    return toString.call(obj) === "[object Array]";
	},

	getBareJid: function(jid) 
	{
		return Strophe.getBareJidFromJid(jid)
	},

	makeJidFromRoomName: function(service, name) 
	{
		return "pw-" + name + "@" + service + "." + this.connection.domain;
	},

	makeRoomJid: function(service, jids) 
	{
		return this.makeRoomName(jids) + "@" + service + "." + this.connection.domain;
	},	

	makeRoomName: function(jids) 
	{
		jids.push(this.connection.jid)
		return "pw-" + this.jidsToId(jids);
	},

	getId: function(jid) 
	{
		if (!jid) jid = this.connection.jid;
		var resource = Strophe.getResourceFromJid(jid);
		var capabilities = resource ? resource.split(":") : []

		return {

			username: Strophe.getNodeFromJid(jid),
			userid: Strophe.getNodeFromJid(jid).substring(0, 8),			
			domain: Strophe.getDomainFromJid(jid),
			address: Strophe.getBareJidFromJid(jid),                	
			resource: {
				id: resource,
				browser: capabilities[0] || "",
				version: capabilities[1] || "",    
				os: capabilities[2] || ""                  		
			}
		};
	},	

	encodeString: function(value) {
		return hashed_auth_str = Base64.encode(value);   
	},

	decodeString: function(value) 
	{
		return hashed_auth_str = Base64.decode(value);   
	},

	getGravatar: function(email, size, className) 
	{
		return "<img class='" + className + "' src='http://s.gravatar.com/avatar/" + MD5.hexdigest(email) + "?s=" + size + "'>";
	},

	escapeXmppNode: function(input) 
	{
		var node = input;
		node = node.replace(/\\/g, "\\5c");
		node = node.replace(/ /g, "\\20");
		node = node.replace(/\"/, "\\22");
		node = node.replace(/&/g, "\\26");
		node = node.replace(/\'/, "\\27");
		node = node.replace(/\//g, "\\2f");
		node = node.replace(/:/g, "\\3a");
		node = node.replace(/</g, "\\3c");
		node = node.replace(/>/g, "\\3e");
		node = node.replace(/@/g, "\\40");         
		return node;
	},

	setEmoticons: function(body) 	
	{
		if (body)
		{	
			body = body.replace(/:\)/gi, "<img src='data:image/gif;base64,R0lGODlhEAAQAOZSAPrkL1pSI/jhMFlTTPPYNPvnLZCEJnttUuvIOfniMIF7du7OOJ6RJsKgN/vmLYRtLoRsL4FoL/niL/HTNu/cKvHUNYRtL/nhMPnjL/rlLoNrL8WnNYFmMPbcMvffMdixO969OI+DJvHUNu/PN+7MOO/QN+zLOaudJ3xvUWdeI4J8dntsUoBmMIJ3JYVwLu3MOL+aOPznLPLVNYF8dvDRN926Of3oLHxwUerGOtq1OsKiN/jgMJ2QJ4+LhPTaM9TDKXRqJe/POPvlLmdeJD44IdPBK+LQKuDOK9LAK5yPKHZzdO3aLExFIoJ9dlhSTPfeMY+KhPzoLPHx8dbV1f3pK////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH+JzxDT1BZPkNvcHlyaWdodCBKaXZlIFNvZnR3YXJlIDIwMDItMjAwMwAh+QQBAABSACwAAAAAEAAQAAAH1YBSgoIKKywcBzODi1JQER84LyQIORpQjE4wJgRPAhcePiMNA4NQMEFPGQVRUTFCOyI6l1IRJk8OISlUVCkGBQI0D1IKHwQZUQEBu8lUDh01Kis4TwVUDAa7BidUUQkLKCwvAlG75eU2ABMQHCQX5ObnABUWBwgeMfDlURIlNzM5PpC0oGCOQosiT0AokaJhxI4kTBj8MHKCCA8MMlwIgtJAhIAlPIAMCXEEA4ENPQYN0EGjQwIAACQ8kbGB1CIoD2osmFChBAgXKRkJUoECgoUbTRgFAgA7' border='0'>");
			body = body.replace(/:-\)/gi, "<img src='data:image/gif;base64,R0lGODlhEAAQAOZSAPrkL1pSI/jhMFlTTPPYNPvnLZCEJnttUuvIOfniMIF7du7OOJ6RJsKgN/vmLYRtLoRsL4FoL/niL/HTNu/cKvHUNYRtL/nhMPnjL/rlLoNrL8WnNYFmMPbcMvffMdixO969OI+DJvHUNu/PN+7MOO/QN+zLOaudJ3xvUWdeI4J8dntsUoBmMIJ3JYVwLu3MOL+aOPznLPLVNYF8dvDRN926Of3oLHxwUerGOtq1OsKiN/jgMJ2QJ4+LhPTaM9TDKXRqJe/POPvlLmdeJD44IdPBK+LQKuDOK9LAK5yPKHZzdO3aLExFIoJ9dlhSTPfeMY+KhPzoLPHx8dbV1f3pK////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH+JzxDT1BZPkNvcHlyaWdodCBKaXZlIFNvZnR3YXJlIDIwMDItMjAwMwAh+QQBAABSACwAAAAAEAAQAAAH1YBSgoIKKywcBzODi1JQER84LyQIORpQjE4wJgRPAhcePiMNA4NQMEFPGQVRUTFCOyI6l1IRJk8OISlUVCkGBQI0D1IKHwQZUQEBu8lUDh01Kis4TwVUDAa7BidUUQkLKCwvAlG75eU2ABMQHCQX5ObnABUWBwgeMfDlURIlNzM5PpC0oGCOQosiT0AokaJhxI4kTBj8MHKCCA8MMlwIgtJAhIAlPIAMCXEEA4ENPQYN0EGjQwIAACQ8kbGB1CIoD2osmFChBAgXKRkJUoECgoUbTRgFAgA7' border='0'>");
			body = body.replace(/:\(/gi, "<img src='data:image/gif;base64,R0lGODlhEAAQAOZiANDn8cji74aKjsXg7qrR6kdpgLLV63p8gFBSVnqDibjY7FhdYbDU64eKjpDD5Z7L6M7m8M/m8E1QVIrB5JfH5rHV67TW65bG5rzb7cXg75jH5qvS6nh7gGaava/T6pLE5b7c7a3T6kVof26evmiq1LXX65jI5onA5Hix1szk78Pe7lqWu6fP6Xh8gIe/5KLN6FhreU1rgW+t1YiKjl1uej1lfjxlfo7D5Y3C5U9RVFlseUlpgMDd7sXa5Mbg77rZ7LfY7E5RVIK942SavH2z18He7qu+yF5uekBmf8ni70NER3+74nZzdG93e4+cosbb5J2wu6q+yMHd7p/L6FFTVsfh74/D5YSPlXqJkzk4On+84o+co6m9yL7b7Whyep6xu4WQlnmDiPHx8c3l8NbV1dHn8f///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH+JzxDT1BZPkNvcHlyaWdodCBKaXZlIFNvZnR3YXJlIDIwMDItMjAwMwAh+QQBAABiACwAAAAAEAAQAAAH6IBigoIcMDY1Oi2Di2ICSCRaJxNCMiICjAgrLg8bFQYhLzdDCIMCK1YEP0UDGSoYHhodDYJILgRdUAtjYwtfUgwfO2IcJA8/VRJBAABBEkkgLCgHMEsbRSlXCWVlCU5jAwY4NDYnFQNjANvqEAFAFwU1EwYZ6OrbEQEKFAU6QiEqKXqAyZGjSY8xPiw4ONJCxgsMXJSEeVJmSxYjPAgQYSJGxA0PWKKMgRBhjBEvJUzEECRgiAYGIAYECOCDR4kpI2YMQtDhAwsDQBRYIGBiBBVGDXagwHGBggMiMXQyEnSARoECRw4wCgQAOw==' border='0'>");
			body = body.replace(/:-\(/gi, "<img src='data:image/gif;base64,R0lGODlhEAAQAOZiANDn8cji74aKjsXg7qrR6kdpgLLV63p8gFBSVnqDibjY7FhdYbDU64eKjpDD5Z7L6M7m8M/m8E1QVIrB5JfH5rHV67TW65bG5rzb7cXg75jH5qvS6nh7gGaava/T6pLE5b7c7a3T6kVof26evmiq1LXX65jI5onA5Hix1szk78Pe7lqWu6fP6Xh8gIe/5KLN6FhreU1rgW+t1YiKjl1uej1lfjxlfo7D5Y3C5U9RVFlseUlpgMDd7sXa5Mbg77rZ7LfY7E5RVIK942SavH2z18He7qu+yF5uekBmf8ni70NER3+74nZzdG93e4+cosbb5J2wu6q+yMHd7p/L6FFTVsfh74/D5YSPlXqJkzk4On+84o+co6m9yL7b7Whyep6xu4WQlnmDiPHx8c3l8NbV1dHn8f///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH+JzxDT1BZPkNvcHlyaWdodCBKaXZlIFNvZnR3YXJlIDIwMDItMjAwMwAh+QQBAABiACwAAAAAEAAQAAAH6IBigoIcMDY1Oi2Di2ICSCRaJxNCMiICjAgrLg8bFQYhLzdDCIMCK1YEP0UDGSoYHhodDYJILgRdUAtjYwtfUgwfO2IcJA8/VRJBAABBEkkgLCgHMEsbRSlXCWVlCU5jAwY4NDYnFQNjANvqEAFAFwU1EwYZ6OrbEQEKFAU6QiEqKXqAyZGjSY8xPiw4ONJCxgsMXJSEeVJmSxYjPAgQYSJGxA0PWKKMgRBhjBEvJUzEECRgiAYGIAYECOCDR4kpI2YMQtDhAwsDQBRYIGBiBBVGDXagwHGBggMiMXQyEnSARoECRw4wCgQAOw==' border='0'>");
			body = body.replace(/:D/gi, "<img src='data:image/gif;base64,R0lGODlhEAAQAOZVAMjHx2deI/PYNPvnLVlTTPjhMIFmMI6AKIJ8doBmMIRsL4RtL+/PN4RtLu7OOIF8dsKiN7+aOPnhMCMfIIFoL/3oLPvmLXxvUfrkL8KgN/DRN/HUNe/QN+zWLp+dnd69OPLVNa2rq4VwLsWnNe7MOPHUNlpXWHRpJY+LhOvIOe3MONixO9q1Orq5ud26OXxwUfHTNuzLOfbcMurGOoNrL3ttUvrlLntsUvTaM4F7dqudJ+rUL3ZzdFlRJI+DJvznLPjgMPvlLtC8LdG9LUxEI5uLKVlQJPffMe/POFhSTEtEI+vUL5qKKvniMIJ9dp6RJvfeMfzoLI+KhFpSI5CEJvHx8dbV1f3pK////////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH+JzxDT1BZPkNvcHlyaWdodCBKaXZlIFNvZnR3YXJlIDIwMDItMjAwMwAh+QQBAABVACwAAAAAEAAQAAAH2oBVgoI5NwkGNQ+Di1VSFCszKiQpLDRSjEkRMQJQBRJHOAwZBINSEUhQNgNRUT9BQCUQl1UUMVAWPgFXVwFUAwUaDVU5KwI2UVNTu8lXFjIuCDczUANXT1S7VDpXUU0OFwkqBVG75eUVGDAKBiQS5ObnGBsLNSlME8lU+lQBUxNFHF48YIHDSAgsABICwBKiB5QPPKrQYLBDiQcsGLF4INIBhAhBUjKUWHLCRIsWJk50EDACxSACEDTIEHLgwBAoIEaQWiSlgQsHMDZw+CDCJSNBCC4oWPDCCaNAADs=' border='0'>");
			body = body.replace(/:x/gi, "<img src='data:image/gif;base64,R0lGODlhEAAQAPcAAKyrq/Hx8dbV1YNyMP3oN2ZiWunNPiMfIPXeOu7UPe/cNuzSPT44I396asjHx395anRqKXBoUHpvRvrkOGdeJ+zRPvbfOufLP4J9du7VPe3TPbq5ufPbO9PCM9m+PfLaO+iMbfPcO9TDM3hrOndpOvbeOpuHNOiNbvnjOJ+NM+DNNdzIN7SdOO7aNuiDY+DGPN/MNfDYPNyAY7GZOGNMMPXdO5CELGFVKrioMPHZPMa2McuxPHVqKWBUNtxWO/zmOPDXPGRdTuh8XO/VPC8pIjArItvAPcNrUX11XtyFaKqcL+7bNtzBPXBpUNrAPeXJP6udLvzoN/nkOOh5WJ2KM9i8PoteK/rlOOrVOFlRJoY4K+rPPvvlOPjjOXBcKvjhOe/VPfHYPIFvMeiObuiLbJ5fS8SzMnBNRcOxMod4L29mUIJ2Kox+LWZZWefROXFrXJ5eSpmKL+XIP5yJNHBlKu3YNvTdO+HPNG5MOHVrKXs8NPznN7agN+hcP/jiOcKxM892W3ZmLuiOb9zCPZ2QLZJdTGxgOOjNPm9nUPbgOnRpKXlOOrObOH9yLOLQNP3pN////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH+JzxDT1BZPkNvcHlyaWdodCBKaXZlIFNvZnR3YXJlIDIwMDItMjAwMwAh+QQBAAAAACwAAAAAEAAQAAAI7gABCBz4gIQYEg8GKhSoZoYcA1sMPDHxZiGAHlUqhAlhJ0SOBR4iDGwTZEcaL1hQTJDypUYGDwUA6Omz6MYRH2s6HOiAo4gbDSYAaBGSpBCZKVagHHik48CfDxcwnHFxQtAJQDYcUXikIEsdBBUkAIADYgwIGgoeqX1E4EeiBAMAECkjA48IEWvZtliRIW6gFGxg3Nm6NoqKRi/EIrnwwY8SCHnSEliiiA4fDAIZJSgxYQ8hBjwgMIgDZs5ARE6AlOhyhYsZNBZiMIk50JCRBBwQWEDAYcigJhYjsDi0QMMCA1RoWwTQYMSAEQ0WBgQAOw==' border='0'>");
			body = body.replace(/;\\/gi, "<img src='data:image/gif;base64,R0lGODlhEAAQAOZaAOvQPvLaO4J9dvbfOvrkOHxzUu3TPXtxUvjiOYNyMPvlOOrOPvznN/TcO1lUTPfhOZ6RLfvmOPTdO4FvMWdeJ+7UPe3SPde7PtzBPfnjOfXeO+jMP/XdO+vRPoF9dsCoOoFwMP3oN/HZPFpSJufLP/znOOzRPoR0MIJxMNi9PbmqMIBvMfnkOIJyMPrlOL6kOtrAPcCnOsKrOffgOT44I5uMLnNpKdK/NFlRJu/WPO/bNtPCM+7aNnVrKa+cNPDXPIp8Lsy4NuXOOkxFJJWEMN3KNu/cNvnjOODNNXZzdDEsIe7bNunNPlhTTPPbO8e2Me/WPSMfILehN+LQNHRqKc+8NfPcO9TDM56QLcy5NvHx8dbV1Y+LhPzoN/3pN////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH+JzxDT1BZPkNvcHlyaWdodCBKaXZlIFNvZnR3YXJlIDIwMDItMjAwMwAh+QQBAABaACwAAAAAEAAQAAAH54BagoIeBysTBwKDi1pcIBckCwsbKShcjE0vUkRCDVlAPgAxDoNcLwABVTYsNxk1QQYfl1ogTAEPLjxdXUtIRQ0mCVoeF1ADLlQUXipKXREPIjACByQBCAw4I14QUUYMBBIABSsLDSxdKhBeU8pdCgMWLRMLEgRdXvj5Ie8GCQcbTjIwwHIFH4QnXQhw6FBAQIofMyLsGDKCRg8dJRAEwJBECwoAVhBEYNAlRJcSRzRUOCGISwwDDR4QUKCAAAINOWTM0uLggwkREgYM4BCgggxSi7gkgAHAgoEOGE7sZCSgQIsEDRkFAgA7' border='0'>");
			body = body.replace(/B-\)/gi, "<img src='data:image/gif;base64,R0lGODlhEAAQAOZdAOvQPvLaO4J9dvbfOvTcO+3TPXxzUntxUoNyMFlRJurOPllUTPzoN/rkOPTdO+/cNvznN/njOYJyMOvRPujMP8KrOdrAPfXdO+7UPTEsIfPbO+3SPdzBPenNPoJxMKudLufLP8CoOvjiOYBvMYF9doFvMZuNLsCnOuzRPr6kOte7PvPcO4R0MOHPNPXeO/DXPHZzdD44I4FwMNi9Pe/bNo6BLFpRJse3MdC9NKmbL6maL/rlOFlQJu/WPXNpKYJ2KoJ3KvfhOUtEJJ6XazEtLqqjesq1N+/WPOXOOlhTTPHZPJ2QLWZcKGdfNMiyN1hPJvvmOMe2MdTCM93JNurVOM+8NfvlOPnkOOfROZqMLrmqMIN+affgOfHx8dbV1Y+LhCMfIP3pN////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH+JzxDT1BZPkNvcHlyaWdodCBKaXZlIFNvZnR3YXJlIDIwMDItMjAwMwAh+QQBAABdACwAAAAAEAAQAAAH4YBdgoIkByMlBwKDi11fMiogCgoUMx5fjEkpHT0BBA4aLwAnC4NfKQABAyJXDRFcKwUhl10yHQFBOxAMDBBQIgQoCF0kKk5FPAkJNkNNyU9GFgIHIEgwYNcxW0TXYFgABiMKBDrXGR9aGdc5AxsSJQoODTRRD2FhDzctVgMFCAcUGiJAsEcwDIMGFyYYEDDjRZUfNAo+AIIjAAcYXTwAWJFFyBIpLT7EMOECAwtBX04UIEDFhA8mNaa4OFJhVpcFIVAocTBgwIUAGCqQWvQFgQUAGwpM4MDCJiMBBiQgWMgoEAA7' border='0'>");
			body = body.replace(/8-\)/gi, "<img src='data:image/gif;base64,R0lGODlhEAAQAOZdAOvQPvLaO4J9dvbfOvTcO+3TPXxzUntxUoNyMFlRJurOPllUTPzoN/rkOPTdO+/cNvznN/njOYJyMOvRPujMP8KrOdrAPfXdO+7UPTEsIfPbO+3SPdzBPenNPoJxMKudLufLP8CoOvjiOYBvMYF9doFvMZuNLsCnOuzRPr6kOte7PvPcO4R0MOHPNPXeO/DXPHZzdD44I4FwMNi9Pe/bNo6BLFpRJse3MdC9NKmbL6maL/rlOFlQJu/WPXNpKYJ2KoJ3KvfhOUtEJJ6XazEtLqqjesq1N+/WPOXOOlhTTPHZPJ2QLWZcKGdfNMiyN1hPJvvmOMe2MdTCM93JNurVOM+8NfvlOPnkOOfROZqMLrmqMIN+affgOfHx8dbV1Y+LhCMfIP3pN////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH+JzxDT1BZPkNvcHlyaWdodCBKaXZlIFNvZnR3YXJlIDIwMDItMjAwMwAh+QQBAABdACwAAAAAEAAQAAAH4YBdgoIkByMlBwKDi11fMiogCgoUMx5fjEkpHT0BBA4aLwAnC4NfKQABAyJXDRFcKwUhl10yHQFBOxAMDBBQIgQoCF0kKk5FPAkJNkNNyU9GFgIHIEgwYNcxW0TXYFgABiMKBDrXGR9aGdc5AxsSJQoODTRRD2FhDzctVgMFCAcUGiJAsEcwDIMGFyYYEDDjRZUfNAo+AIIjAAcYXTwAWJFFyBIpLT7EMOECAwtBX04UIEDFhA8mNaa4OFJhVpcFIVAocTBgwIUAGCqQWvQFgQUAGwpM4MDCJiMBBiQgWMgoEAA7' border='0'>");
			body = body.replace(/:p/gi, "<img src='data:image/gif;base64,R0lGODlhEAAQAOZZAPzoN4J9dvLaO+vQPvTcO3xzUurOPu3TPfjiOYNyMPbfOntxUllUTPrkOPTdO/fhOZCELMKrOYJyMNi9PenNPtzBPfPbO9rAPfvlOPPcO+jMP+7UPde7PvHZPO3SPYF9dvDXPMCoOvznN+ViRsCnOvnkOOzRPr5UP4BvMfXeO2VUKYFvMb6kOmdeJ4R0MFpRJllRJuvRPu/WPVpSJpdHN+fLP4JxMIFwMFhTTD44I+/WPOvWN+vXN/XdO0s9JezYN35qLfnjOY+CLNPBM/vmOMa2Md7KNeXOOoF2K+fROf3oN2ddKHVrKYtgMXZzdMa1MX5rLaudLp6QLenUOPfgOdhdRPrlOPJmSY6CLPHx8dbV1Y+LhP3pN////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH+JzxDT1BZPkNvcHlyaWdodCBKaXZlIFNvZnR3YXJlIDIwMDItMjAwMwAh+QQBAABZACwAAAAAEAAQAAAH34BZgoIfCygrCwGDi1lbNxw1BgYaEzZbjDgsFDICBA4WIAMkDINbLAMCCgglDUFUGQchl1k3FAIPWC0AAC1CCAQmCVkfHDIKVjAvXFwvMEQPHRcBCzUCCCJSEMsQUSINDgMFKAYEJQDL6FwAGAoeEisGDg3n6VxK7AcJCxoWPE/1XIr86BGjQIAJIKYgyTGDCYQZPpbsEFDBSRYbAzIgGELjxIkqNIyk2OBC0BYSBwg8UDHiyggVKXREmJWFQQgTHZJAaQLkyIYIpBZtSXBhgIcDMSq4oMkoQAEJCQwyCgQAOw==' border='0'>");
			body = body.replace(/X-\(/gi, "<img src='data:image/gif;base64,R0lGODlhEAAQAOZdAO64qOu2pXJNOm5IM9qehI2GhOixn92iilZGQuSsmOOqley2plZPTYhrZNKSdNqehdKTdeGnkaZtUHJOO3NdVOCmj42GhdGSdOWtmY2Hhe24qLd2UsuJaNibgcyKanRQPsyLauiyoMiFYnFMON2iidGRc6JoSNufhteZfeewnc2MbL19Xc6Nbbp5VtWWenNgVuWumuq0o+q1pHNgV6lyVtyhiIlsZYlsZHJdU8+PcM+Ob96ji7+AYd6kjN+kjaVsTsmHZeKplG9KNeCmkH95dnZzdM6NbnleV8SYiXlfWIhsZKJ/dbmQhOy3p6F+de23p4drY1ZOTOixnohrY8SXiLmQg+u1pOmzouaum9WXeu65qH94duavnPHx8dbV1e65qf///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH+JzxDT1BZPkNvcHlyaWdodCBKaXZlIFNvZnR3YXJlIDIwMDItMjAwMwAh+QQBAABdACwAAAAAEAAQAAAH5oBdgoJbOAMDFFuDi10FQhsiHiBALSMFjFEmHC4PBwcnKCw/DIMFJkYEERhcXDBBNQ4SFoJCHAQKUjEBATIhCSQ5E11bGy4RR1VPAAAaTEkKHSuFIg8YMU4IX18IS1ZcOyovAx4HXAEN2ds3CwYVJQIDIOUBSjbaNusGQxcCFEAnMGRo0KYNQIAUPXTM2NICRZAQCwBo+QKgyZUEBHgU6TKCRY0EVKA0aDAFCRYfED4IKvDDAQkFXAwYSJHARxYaGQYxkJCjw44KQ3oQgECD1CILE1aoKHFBB48PORkReiFAwAwijAIBADs=' border='0'>");
			body = body.replace(/:\^O/gi, "<img src='data:image/gif;base64,R0lGODlhEAAQAOZTAMe3KPjhMFlTTPPYNPzoLIJ8doBmMOvIOe/QN3tsUvrkL+zLOY6AKPnjL3ttUu7OOOrGOoF8doRsL+HPKuDOK4FmMHxvUfLVNYRtLsWnNd69OINrL9ixO+/PN/TaM3xwUfHUNe3MOIRtLzEsIfDRN0xJSvffMdq1OnRqJe7MOIVwLr+aOMKgN/bcMt26OfjgMPnhMIFoL/HUNsKiN4F7dtTDKY+LhPHTNoJ9dj46L/niMLakK8W1KnZzdFlRJJ2QJ+/POO3YLeDMLIJ2JvvnLbWkK4F2JuDNLO3ZLVhSTPniL/rlLllQJD45L/vmLcW1KffeMVpXWI+KhPHx8cjHx9bV1ZCEJv3pKyMfIP///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH+JzxDT1BZPkNvcHlyaWdodCBKaXZlIFNvZnR3YXJlIDIwMDItMjAwMwAh+QQBAABTACwAAAAAEAAQAAAH0IBTgoI0CQYVDhGDi1NSMRwQISkHJxtSjEkrCwNQATAmHh0sAoNSK0BQQTwEBE9ILzIzl1MxC1BHI1gAAFgjFAEkGFM0HANLEzUAV1cANRNOLS4FCRBQRMvY2AQ6DxYGIQE/VuPk5Ao3EhUpME1U7u/uOQogIg4HJiglUfv8JShKCD5EOOFBCJaDCA9SgKKhx5QNHV4YSXhwSIMLKgRJYSEjAJOEPhoMyGBjkIAZJFoUYcBgB5QLGUgtkoLBxYMbIBBoUFGSkaACFiSI+ICDUSAAOw==' border='0'>");
			body = body.replace(/:\^0/gi, "<img src='data:image/gif;base64,R0lGODlhEAAQAOZTAMe3KPjhMFlTTPPYNPzoLIJ8doBmMOvIOe/QN3tsUvrkL+zLOY6AKPnjL3ttUu7OOOrGOoF8doRsL+HPKuDOK4FmMHxvUfLVNYRtLsWnNd69OINrL9ixO+/PN/TaM3xwUfHUNe3MOIRtLzEsIfDRN0xJSvffMdq1OnRqJe7MOIVwLr+aOMKgN/bcMt26OfjgMPnhMIFoL/HUNsKiN4F7dtTDKY+LhPHTNoJ9dj46L/niMLakK8W1KnZzdFlRJJ2QJ+/POO3YLeDMLIJ2JvvnLbWkK4F2JuDNLO3ZLVhSTPniL/rlLllQJD45L/vmLcW1KffeMVpXWI+KhPHx8cjHx9bV1ZCEJv3pKyMfIP///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH+JzxDT1BZPkNvcHlyaWdodCBKaXZlIFNvZnR3YXJlIDIwMDItMjAwMwAh+QQBAABTACwAAAAAEAAQAAAH0IBTgoI0CQYVDhGDi1NSMRwQISkHJxtSjEkrCwNQATAmHh0sAoNSK0BQQTwEBE9ILzIzl1MxC1BHI1gAAFgjFAEkGFM0HANLEzUAV1cANRNOLS4FCRBQRMvY2AQ6DxYGIQE/VuPk5Ao3EhUpME1U7u/uOQogIg4HJiglUfv8JShKCD5EOOFBCJaDCA9SgKKhx5QNHV4YSXhwSIMLKgRJYSEjAJOEPhoMyGBjkIAZJFoUYcBgB5QLGUgtkoLBxYMbIBBoUFGSkaACFiSI+ICDUSAAOw==' border='0'>");
			body = body.replace(/;\)/gi, "<img src='data:image/gif;base64,R0lGODlhEAAQAOZTAPvnLVpSI/rkL/jhMPPYNFlTTIJ3JZ6RJnVrJHtsUvznLPniL6udJ4RtL4F7doNrL9q1OsKiN4RtLoFoL7+aOMKgN4VwLuzLOYFmMI+LhPHUNfrlLt26Oe/QN/ffMfbcMvLVNdixO/niMO3MOIRsL+7MOMWnNYJ8dvnhMP3oLOrGOnxvUfnjL+/PN4BmMO7OOHxwUd69OOLQKkxFIpCEJvDRN4F8dvHUNvTaM3ttUvHTNuvIOYF2Ju/cKo+CJ+rUL+HPKsW1Ke/cK8a2KXZzdPvmLcW0Ku3aLFhSTCMfIPvlLmdeI+/POD44IYJ9dp2QJ/jgMPfeMY+KhPHx8fzoLNbV1f3pK////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAAFMALAAAAAAQABAAAAfXgFOCgg4JLhg5NoOLU1ITISojJTsQD1KMSBQXBFEDKB44LRUFg1IUTFEbAFRUCkpQNxGXUxMXUT5PVrq6AAM1ElMOIQQbSQFWBwxWMlZFHxwnCSpRAAFLVj0IAQEyVCIvKy4jA1S75lYpAjokGCUo5ee66RoNOTseCvEGVlQLHTA2IOAwcsAcgxkGAESJQWTKgxY/eDShQWMGAiFUWICwIEhKhRsDjgQZAoQKABYETGQYVCBCjQ8iBAhYEAWECVKLpEjg8EKHhg4xLKxkJOjEChINYDhhFAgAOw==' border='0'>");
			body = body.replace(/;-\)/gi, "<img src='data:image/gif;base64,R0lGODlhEAAQAOZTAPvnLVpSI/rkL/jhMPPYNFlTTIJ3JZ6RJnVrJHtsUvznLPniL6udJ4RtL4F7doNrL9q1OsKiN4RtLoFoL7+aOMKgN4VwLuzLOYFmMI+LhPHUNfrlLt26Oe/QN/ffMfbcMvLVNdixO/niMO3MOIRsL+7MOMWnNYJ8dvnhMP3oLOrGOnxvUfnjL+/PN4BmMO7OOHxwUd69OOLQKkxFIpCEJvDRN4F8dvHUNvTaM3ttUvHTNuvIOYF2Ju/cKo+CJ+rUL+HPKsW1Ke/cK8a2KXZzdPvmLcW0Ku3aLFhSTCMfIPvlLmdeI+/POD44IYJ9dp2QJ/jgMPfeMY+KhPHx8fzoLNbV1f3pK////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAAFMALAAAAAAQABAAAAfXgFOCgg4JLhg5NoOLU1ITISojJTsQD1KMSBQXBFEDKB44LRUFg1IUTFEbAFRUCkpQNxGXUxMXUT5PVrq6AAM1ElMOIQQbSQFWBwxWMlZFHxwnCSpRAAFLVj0IAQEyVCIvKy4jA1S75lYpAjokGCUo5ee66RoNOTseCvEGVlQLHTA2IOAwcsAcgxkGAESJQWTKgxY/eDShQWMGAiFUWICwIEhKhRsDjgQZAoQKABYETGQYVCBCjQ8iBAhYEAWECVKLpEjg8EKHhg4xLKxkJOjEChINYDhhFAgAOw==' border='0'>");
			body = body.replace(/:8\}/gi, "<img src='data:image/gif;base64,R0lGODlhEAAQAOZcAPXgOoFRK/TbO+7HO+3CO4J5dXtiUPLVO/DNO+/KO/PZO/PYO/TcO/HSO1lQTIJ6deiuOu7IO9ePN/PaO+7JO+7GO755M+myO+amOumzOvHRO+q0OvLWO+itOntlUINZLIFTLOmxOuu4O4JWLOaiOb+ANNaLN+eoOtmaOINcLMGHNI+Hg3xmUIJXLNmWN+jWOLOlMuy/O+y8O4JYLO7FO+enOu3DO+irOuiqOr+BNPLUO/DPO/XhOsGyNOWgOejUONnEOKaZMM25NsGxNLOkMnJoKqeZMWVcKPTeOzEuJHZzdOu5O+jUOZqNL+WfOfLXO4x/Lc26NuisOvTdO1hQTCUiI6aXMOjVOKaZMefTOY+IhPXfOvHx8dbV1fXiOv///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH+JzxDT1BZPkNvcHlyaWdodCBKaXZlIFNvZnR3YXJlIDIwMDItMjAwMwAh+QQBAABcACwAAAAAEAAQAAAH4oBcgoIFBgEBBgWDi1wrICY+NSckEiNajFQWGCI2AxE0MjclDoMrFlIEOwcLChwaFRk5l1wgGAQNE1FbAFlABwMQH1wFJiI7E1tVRl5NSQwNMS4PBk42B0g8WENePUFbCxQ4HgE1AwtbXunqAAIIIS0BJxEKAOrr7RczBiQ0HFtXL9S9YKIgQQcWBSTI0MDgRxEYXmAcEaKDAAolXEbcqHCAwRYiUKxMeZJgQwpBWkpkGNBggQABCnQkWKJiFhcHOSDEoIAAQQICG1SQWqTlgwscIS50QJHCJqMHHlrMYPGAUSAAOw==' border='0'>");
			body = body.replace(/:_\|/gi, "<img src='data:image/gif;base64,R0lGODlhEAAQAOZpANDn8YaKjrLV60dpgMji78Xg7np8gKrR6lBSVjg4Oszk70xJSjxlfoiKjp7L6GNpbsni71VbYEVof4rB5G6evsbg77HV67XX65fH5rfY7I3C5afP6ZLE5WaavU1rgc/m8bjY7GSavM7m8Hh7gJjI5onA5Hh8gJbG5klpgJDD5Ye/5JjH5lqWu4eKjnix1nmDiGRqbrDU61hreV1uemiq1G+t1aW1vbq5uXqDicXg71lseT1lfl5uer7c7Y7D5YK9432z10Bmf6LN6LTW65mnr5CvxJi60KjD06/T6n+84py80avS6s7l8LrZ7Mrj74/D5Tg3Opinr8Pf7n+74nyKlIqfrK3T6oierJ/L6J+xu8He7lFTVm93e8Dd7qzF1HZzdMfh75GwxHqDiM/m8MPe7sHd7n2LlKCyu83l8PHx8dbV1SMfIP///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH+JzxDT1BZPkNvcHlyaWdodCBKaXZlIFNvZnR3YXJlIDIwMDItMjAwMwAh+QQBAABpACwAAAAAEAAQAAAH54BpgoIjMgw7OiaDi2kBQTRJJRM/NRIBjAgsKg5FFgJhQj4hCIMBLE9GVxEFORFVSisdLYJBKgdUWQpoaApnZjEcKGkjNA5NYGgfAMtMED0bLgYyU0taCh82MDA2AGgFAhozDCUWBWhiCzc3C1wiBBknAzsTAjlRa/j5RAQgGAM6P6yQSZAvX4IKQ1LwMFFDyBEoD17gwPHiQQIvB4B8SSPBB5IyENCIGIPGiZQLJDwIChBiRYweBQgQqNDlAhYKDQYh6MBhg4AMIIYcIEFhC6MWKFxoOIEhBRAPORkJMjBjwAAeBhgFAgA7' border='0'>");
			body = body.replace(/\?:\|/gi, "<img src='data:image/gif;base64,R0lGODlhEAAQAOZoAIJ9dvTcO3xzUvjiOevQPu3TPYNyMPzoN/rkOHtxUurOPvLaO1lUTPbfOvfgOe/WPeLPNIF9doBvMejMP+fLPyMfIPTdO+3SPfXdO8CoOti9PevRPvXeO4FwMO3ZNmdeJ8KrOezRPoR0MPPcO9e7PoJyMNzBPdTDM4FvMYJxMPvmOPDXPPznN9rAPcCnOtnDON3aOL6kOvvlOKy7RMGvNMWuOGeDcJavSe/WPNzCPefROT44I3ZzdHaPZtnUOvHZPMvFQXCKa8u3NtTCM73KOsa1MfPbO93KNp6xTXyTYnVqKenNPv3oN1hPJ4edXJCELLamMWiEb4aiU77LOu7UPYB0K4mnR/njOVhTTJCDLNrVOniGeM/GPvfhOY+kV5aqUp2QLca2MVlRJvnkOJOlVH+XYbXCP73JOvHx8dbV1Y+LhP3pN////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH+JzxDT1BZPkNvcHlyaWdodCBKaXZlIFNvZnR3YXJlIDIwMDItMjAwMwAh+QQBAABoACwAAAAAEAAQAAAH4oBogoIRCRIoCQCDi2hqHSQUCgoTGilqjFgxOQ8LATpGKwQuDINqMTUvDQNQCFcOIwUZl2gdS0JNHixgRSwqAwEhBmgRJA80FWFMFU9rX1E9QC0ACRQLRzsQax8nU0FEUkkEAhIKAWMHa+npMAdmNhclKAoWCOjqazBIW2QFBgkTL6p8yKbOi5MZGDYIAKBhhQMPYk6oK3NmwAITPNCkIDBigIosSoYcuKGFAxURgtS4KBCgCwIZMhD44IADxCw0DDKE+GGhQQMMVriAILVIjYEWBC4U2GBCxE1GAASUMLCQUSAAOw==' border='0'>");
			body = body.replace(/:O/gi, "<img src='data:image/gif;base64,R0lGODlhEAAQAOZoAIJ9dvTcO3xzUvjiOevQPu3TPYNyMPzoN/rkOHtxUurOPvLaO1lUTPbfOvfgOe/WPeLPNIF9doBvMejMP+fLPyMfIPTdO+3SPfXdO8CoOti9PevRPvXeO4FwMO3ZNmdeJ8KrOezRPoR0MPPcO9e7PoJyMNzBPdTDM4FvMYJxMPvmOPDXPPznN9rAPcCnOtnDON3aOL6kOvvlOKy7RMGvNMWuOGeDcJavSe/WPNzCPefROT44I3ZzdHaPZtnUOvHZPMvFQXCKa8u3NtTCM73KOsa1MfPbO93KNp6xTXyTYnVqKenNPv3oN1hPJ4edXJCELLamMWiEb4aiU77LOu7UPYB0K4mnR/njOVhTTJCDLNrVOniGeM/GPvfhOY+kV5aqUp2QLca2MVlRJvnkOJOlVH+XYbXCP73JOvHx8dbV1Y+LhP3pN////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH+JzxDT1BZPkNvcHlyaWdodCBKaXZlIFNvZnR3YXJlIDIwMDItMjAwMwAh+QQBAABoACwAAAAAEAAQAAAH4oBogoIRCRIoCQCDi2hqHSQUCgoTGilqjFgxOQ8LATpGKwQuDINqMTUvDQNQCFcOIwUZl2gdS0JNHixgRSwqAwEhBmgRJA80FWFMFU9rX1E9QC0ACRQLRzsQax8nU0FEUkkEAhIKAWMHa+npMAdmNhclKAoWCOjqazBIW2QFBgkTL6p8yKbOi5MZGDYIAKBhhQMPYk6oK3NmwAITPNCkIDBigIosSoYcuKGFAxURgtS4KBCgCwIZMhD44IADxCw0DDKE+GGhQQMMVriAILVIjYEWBC4U2GBCxE1GAASUMLCQUSAAOw==' border='0'>");
			body = body.replace(/:0/gi, "<img src='data:image/gif;base64,R0lGODlhEAAQAOZaAIJ9dvznN+rOPoNyMHxzUnVrKXtxUvjiOfrkOPTcO+3TPVlUTOvQPvLaO/TdO/vmOO3SPfnkOO7UPefLP+nNPti9Pde7PllRJufROYF9drOiMujMP8KrOYBvMfrlOO/cNvnjOb6kOuvRPmdeJ9rAPZ6QLcCnOoJyMLipMNPBM4R0MNzBPf3oNzArIvXeO+zRPoFwMIJxMFpSJvbfOsCoOvHZPPvlOIFvMd7EPFhTTODHO3FlKvznOPPcO/XdO/PbO/DXPKeXMN7FPHZzdKiYMK6bNLWkMaOTMfnjOKWUMcKxM3FmKq+cNMa2Md3INr6rNLWlMffgOe/WPd3JNr6rNcOyMse2Me/WPCMfIPzoN/Hx8dbV1Y+LhP3pN////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH+JzxDT1BZPkNvcHlyaWdodCBKaXZlIFNvZnR3YXJlIDIwMDItMjAwMwAh+QQBAABaACwAAAAAEAAQAAAH4oBagoIZBh03BgCDi1pcMBYTAgIbFTFcjDkhFEVUCQ5PTDgmC4NcIUI7RgcRCCBQSzo0l1owFEdKHgFZWQEPVUkvA1oZFlJBHiglXV0lKA9ENSQABhMNBwEXMssyFwEIDgwEHQIJEVkFI8sjBVk2MxAnNwIOCFldH8v4LO4KAwYbP0AEWEawSxYEPkQQAFABSJQHWZoUKGCFBY8DDVYM0RKDQY8DKbCIxJICiQsJKgRxMaEggZMWIltMcXGFwywtC2i8qIFBgwYMDSRwILWIywASDCAoELFCxU1GAAicGLCQUSAAOw==' border='0'>");
			body = body.replace(/:\|/gi, "<img src='data:image/gif;base64,R0lGODlhEAAQAOZJAJCELPjiOevQPoJ9durOPntxUvTcO/TdO/rkOHxzUu3TPYNyMFlUTMSzMvznN/HZPO3SPe/WPdzBPevRPsKrOe7UPf3oN4JxMPXdO1lRJoFvMcCoOvPbO/vmOPXeO/nkOIR0MNe7Pr6kOuzRPufLP1pRJsCnOoBvMfDXPPPcO4JyMIF9dvvlONrAPffgOWdeJ/njOYFwMNi9PejMP+nNPvfhOcSyMs+8NVhTTJ6QLfnjOJCDLJ2PLfrlOI+CLPznOHZzdO/WPJ2QLY6CLNC9NKudLvLaO/bfOvzoN/Hx8dbV1Y+LhP3pN////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH+JzxDT1BZPkNvcHlyaWdodCBKaXZlIFNvZnR3YXJlIDIwMDItMjAwMwAh+QQBAABJACwAAAAAEAAQAAAH2IBJgoIrBScaBQODi0lLMSEkBAQzMhdLjDgiNBFGBgccKAImDINLIgJGRwEfCDAuKQobl0kxNEY1Qy9ISC8+AQYjC0krIRFHPRklTEwlGR01Dy0DBSRGAQ45AMsARQ4IBwIJJwQGH0jL6ExILEcQKhoEBwjn6UwW7AoLBTMcMA716hBgmJBggAwULjrQW2bhRwAjEoAkuSAgRQAeOwBoFKLDQwUQgpaYUGDgho0GKIl4CEJhVhIGG0Y8OHDkCAYjFSiQWrRkQQsBEBRMkADCJaMBCVQsKMgoEAA7' border='0'>");
		}

		return body
	},

	urlParam: function(name)
	{
		var results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(window.location.href);
		if (!results) { return undefined; }
		return unescape(results[1] || undefined);
	},

	startAudioAlert: function() 
	{
		if (this.audioPlayer != null) {
			$(this.audioPlayer).remove();
		}

		this.audioPlayer = $("<audio>")
		.attr("id","audioplayer-messaging-" + Math.random().toString(36).substr(2, 6))
		.attr("autoplay","autoplay")
		.attr("src", "data:audio/wav;base64,UklGRqj8AQBXQVZFZm10IBAAAAABAAIARKwAABCxAgAEABAAZmFjdAQAAAAefwAAZGF0YXj8AQAI AAgABAAIAAMACwAFAAcABAAHAAUADAD8//7/EAARAPb/9/8UAB0A4//i/zcAQACK/3v/cwX3BbcG XwdGBcsFxweQCF8KcAsZCjIL6gn6CqcL5gymC/AM5womDN0KIQz2CkUMoAnOCqYIuwn4B/8I1wbB BwUFyQXIA2MEaQLdAr8ACAHp/gD/af1U/bD7afvy+X75R/ii98r29fUt9Sr0v/OM8m3yD/E68bPv EfBf7ifvWu1k7nzsvu2/60ntNesY7fPqGO3r6kftFuu77ZHraO5F7FbvTe1x8ITu3vEP8HPzyvFD 9crzPff09W/5Xviv++L6HP6L/YQAOQALAwYDcwW3Bd8HbggaCuwKPAxODR0Oaw/JD08RJhHgEkMS IRQOExAVhhOeFbET2RWFE68VEhM3FUkSaBQ+EUoT7w/eEXwOQxC/DGEO4wpVDN0IGgrJBs4HmARm BVwC5wIdAGgA4P3r/a37d/uE+Q35b/e69m/1gPSO82Dy1/Fy8EDwpe7V7gjtl+2i65bsfurD64/p K+vd6Njqd+jI6lzo8eqB6G3r/ego7MnpK+3b6mnuO+z47+jtt/HQ77TzAvLo9W70RfgQ98z6z/lh /bT8CgCl/8ACpwJcBY8F7wduCFgKJQuZDKgNnA7lD2AQ6BHYEZITARPrFNcT3xVeFIYWkhTKFm8U sBYBFEYWRhN8FUISYxQAEQwTiQ9uEdoNmg8ADJENAwpgC/EHFwnCBbMGiAM7BEwBuAEQ/0D/1PzF /Kz6WvqL+P/3kPbJ9aX0mvPk8qTxPvHD79XvMe5+7q3siu2V637sX+qb7b3rW+136x3tIuvP7fLr be6e7L7vHu5P8LTuCvKn8KXzcvI49Sr0G/c79lr5u/g8+8b6kP1V/c7/0P9ZApwC0gRaBfEGpQcw CR4KHws9DOQMKg5wDtsPyg9OEb4QXBKJETYT4hGUEysS5BNOEg8UthFhE/oQiBLiD04Rog7nDyMN PA58C2MMqAlaCsIHQAjEBQIGugO8A44BUAF2/wD/ZP21/Hf7lPqL+Xb40PeO9if2vvS19DTzUvO1 8UjynfAQ8UXvs+/B7TTvRe3D7tfsne687JTuvOzM7grtMO+D7cnvNe6H8BrvffEy8KDyffHj8+Hy Y/WK9Bf3bvb0+Hn45fqm+vX87/wP/zX/QgGdAV4D8gOWBVQGkAd1CM8J7wokDIUNsA0vDy8PzBBW EAUSSxENE+URrRNCEg4UPhL+ExISvRN1EQgT1BBUEhgQjBGwDuwPNg1CDnwLVAyxCU4KtwcgCMIF 6wWzA6ADtAFpAaL/H//C/Qn9r/vG+oX5WPjd94j2M/a49Mv0M/N188XxX/Kg8GPxlu+z8N3uCvAx 7r3v+O05727tr+7K7APvQ+1X767t+u9u7rnwS++u8WnwzPKr8Rj0IfOS9cb0JfeI9vb4jfgJ+9L6 Ef0R/TH/aP9cAcsBkQMtBLQFjAbIB8wI0wkEC58L+AxiDd0Ovg5REEcQABK6EZ4TSxIxFLoSoBS8 EpoUlBJhFA0SwRNMEe0SShC9ERMPXRCdDbgOAgzsDJ4KcgsRCcIJ7QZdBxUFWAUWAyMDRAEpASz/ 0/52/f38l/v4+vL5LfkW+CP3MfYM9eb0pPOa80DymPIs8bjxPvAU8Z7vf/D77inwqu7z73vu7e92 7iTwuO5Y8PLuqPBN74TxQvB18k/xpvOZ8hb1KfSG9sH1KPiD9+b5YPnR+3L7tf18/fr/9/93ArcC ewTgBJ8GOQeVCFIJgApgCy4MLw2+DeMOBg9DECsQghHuEFQSsxEsE08S6BM0EsYT9BGFE14R3RJs EMMRYg+mEC0OVg/ODNMNPQsoDJwJXwrGB1oI1QUxBukDHQTxAf8BBADl/yL+1v1Q/NT7mPr6+ff4 Lvh796L2B/YM9eP01fOC81DyEvK48G7xDvDG8FfvavD87knw4O468N/uWPAB76vwW+8f8dfv0fGc 8KHygPGq86Xy8/QI9G32o/UK+Fz35/lv+bD7V/uu/X39qv+b/8gB5wHCAwUEEgaMBoQIPwlTCjEL HwwmDbAN0Q4RD1QQDhBfEfUQXBKLEf8S4BFfE/kRehPDEUATZhHeEt8QTxLUDy0RtQ71D0kNaA6e C4kM+QnECjcI3whyBu8GlQToBLwC5AKyAKwAkf5M/tL8afz8+mX6Wvmp+NH3/vZx9oP1HfUV9Az0 8/L/8tHxRvIQ8VrxC/B08AfvQvDc7h7wuO498N7uivA27y/x9+/H8aHwnvKL8ZbzlfLN9OjzGfZJ 9b33Fvem+TL5c/sb+3X9SP1t/23/pwHbAdEDNwThBW4G4wecCOEJxQqcC6YMcg2sDkwPvhBgEOoR YREGE/IRoBMwEuQTShL7Ex8SzxOsEVITChGjEhsQohEHD2wQxw0TDz4MYw2TCpILxwiYCe8Gjwfv BFcFDgNKAxsBJQFM/yf/b/0h/b37SvvR+Sr53ff/9nf2d/UK9enz7/O28v/ytPEi8s3wa/EP8PDw he+H8BTvbfAD70Hw0e4z8LnuvvBX71rxAvA88gHxYPNM8pX0nfP19R/1effF9if5k/jx+oX6DP3T /Gr/c/90AawBpgMVBLYFVQbHB5AIsQmlCo8LsAwoDWwOqQ4TEM0PTxEAEaYSDBLSE2ESLxSKEl8U aBI5FPURuxMlEc4STBDcETEPphDqDUEPgAy4DekK+gssCREKTQf8B24F7wV3A8MDkAGnAZ7/i//L /Y/9//uU+1r6wvm6+AL4Uvd69rv1ufQS9NryH/PT8SLywfB48QvwBPGh767wRO938ArvfvAV76Tw Qe8E8avvgfEy8CDy4/Ax8xPyYPRe88f17vRP95n2G/mV+OD6gfra/Kn8z/7H/ukAEAHsAkQDRgXY BbYHjwibCZoKgQuwDB4Ncg6KDvYPvg9GEccQbRJzES8T+xG5EyAS3hM3EvwTHBLnE2oRJROXED4S cQ/9EAgOZw+ZDNgNAgsZDFYJPwqQB04I0AVpBtQDNAS5AeQB2f/R//X9wP0i/Lz7avrZ+eH4Lfhf 94n2/vUD9cP0tvOx847y4fKs8dXxg/DR8GHvkvAj70Xw2e5Z8PPunvBP7wDxwe+F8VjwQvIk8SPz G/JA9FLzk/XC9Cr3g/bR+E/4rfpc+pT8b/yj/q/+rgDnAMwCNwPSBGgF7AaxB8UIrwnfCvsL9gxP DlsO0A+pDz8RrRBcEmwRIhPIEYQTARLGE+8RsROnEVwTJRHPElUQ8RFnD+sQSw61D9oMGg5MC2QM kgmDCrQHbwjsBXwGEQRrBDoCaQJjAGgAqP6L/rP8W/yi+hD6Hvlo+Ij3qvYv9jX1APX18/fz1/L9 8s7xPvIC8ZfxTvA88frvx/Bx71nw8+6T8Dvv3vCT72/xO/BB8ijxJ/Mn8j70W/OE9b/08fZJ9nL4 6/dM+vb5bfxL/GP+bf57ALgAkQL+AqkESAWsBncHnwiZCXUKmAsoDGkNrw0WD+MOaxAxENcRYREs E8oRlxMhEvYTBxLbE6cRZxMdEcoSXRD3EWUP6RBHDrAP7gwzDnYLmwzNCcYKEAjZCDoG1gZdBMYE aAKfApkApgDC/qH+Cf2//E371frW+UT5EfhP90H2UPUV9QL05fO78u/ytfEl8uHwp/Fj8DHx6e/k 8J/vw/CB79Dwi+8V8d/vcPE/8OnxyfDc8tXx6fP48jX1avS09hH2QPjF9wH6p/nE+5j7s/2s/aj/ 0P/oAUUCXAT5BEwGFQdbCFoJKApKC9ULIQ1ODbUOqw4xELcPTxGdEEkSJhHdEqERbBMAEtITrxF6 EzwR+hKBEC8Sjg8fEUAOqA8ADUoOgwuoDPoJ9wpNCCYJnQZMB7gENwW2AvkC4gD+AAT/7P5C/f/8 hvsf+/j5a/lr+Lj3DfdD9rr1zPS39LbzbfNU8iPy3PCW8UrwBfGy78HwcO++8HXvyvCM7wfxzO9x 8U3wB/Ly8MvyxfHF89Xy+PQn9GD2sfXx92b3q/lL+X/7Sft6/Xf9cP+X/4EB1AF+AwAEigU5Bm0H RgiRCZQKrAvyDB8Nfw6LDhQQlg83EWMQDhL5EK0SVxERE20RJRNNEQwT2RCRElEQ+xGcDzQReg7w DzENkQ66C+0MCwoPC2YIPAmsBlgH6ARoBRsDbgNWAYIBav9l/1v9HP2z+0z7/vlo+X74zPcZ90f2 3/X39LL0svO286Lyx/Kh8Svy+/Bl8SXwmPBD74jwOe+F8Djvw/CB7yzx9+/q8dPwpfKd8aHzuPK8 9OzzDPZP9Xj33vY9+cj4NPv0+hP9B/0c/0H/HwFrATcDrwMuBdAFLAcACPkI8Qm/CuMLNwx6DdYN Qw9iD/sQMBDZEeYQnxI+Ef8SOxH8EhoRzBK6EGQSHBC4EVIP2BBODr4PJg17Dt0LDg1IClELogiC CecGmwchBaUFOQOHA3cBowGo/6X/9v3H/T387vu4+kb69fhQ+B/3Sfbe9fH0oPSV86PziPLZ8qvx JPLy8JHxV/Aq8fLv5fCq7+Pwpe/g8Knv+vC/75zxc/BW8kbxUfNa8pD0ufPW9Rn1SPex9uH4cPif +lL6XPw1/IP+i/7PABsByAI/A94EgQXVBqwHtwi7CWkKigv4CzwNWQ29DoYOARCHDxYRKRDHEcoQ exJRERoTHxHdEt0QkBI8EN4RUg/YEFQOvQ8wDX0O2gsGDW4KdgvZCL8JMgfsB1sF4wWPA+8DvAHl Afz/+v8r/gD+iPwz/Ob6avps+dP46fcu97H25fU79UX0vPOZ8unyufEa8trwifFA8B7x0e8E8cPv 6PCo7wnx1u9R8SLwwfGa8GvyUPE48zzySfRd85L1zPQD92D2nPgg+Gv6F/oy/Aj8KP4o/hQAPAAT AmoC+QN4BC4G5gZuCGIJGgoyC8cLCg0pDYYOTg6/D0IPyBD9D5YRcBAOErkQYRKxEFESihAuEkEQ 5BFxD/sQhQ79D1oNsw7qCw8Ndgp8C+gIyAlQBwoIngUpBvUDWwQYAk4CIAAjAGn+O/6q/FX8AfuE +nf51fgT+E33vfbf9YX1j/R39G7zevNf8sXyl/Hm8anwAvGg79rwhO+u8Fbv2vCO7znx/++w8Yjw UvI58SfzJvIi9DHzTPVx9LD2+vVi+Nr3Dfql+ej7svvM/cD91v/6/8UBGgLKA0YErQVXBpoHagg/ CSwKFgs3DOMMPg4JDnwPGQ+fENQPcRFVEPQRcRAQEngQGRI4EM4RxQ9MESIPnRA+DqIPOA2GDhMM Rg2hCq4LGgn+CXoHNgi4BUMGAwRgBEACdQKZAKQA4P7B/kb9Af14+wb7lPnn+DL4avfC9t71mvWZ 9I/0gfOm84ry1PKh8TbyBPGu8XLwbvEp8BXxxe/V8H7vJvHl75HxW/A/8hjxDvME8jn0S/Nb9Yj0 vvYP9jH4nvfS+WL5gfs6+4/9df3H/+r/uAECAr4DNQSjBVIGfgdbCDoJNgrdCvsLQwx6DYgN3g59 Du0PfA8DEVYQABKFEC4SmhBGEk0Q8RG4D0URCw+DECwOig8aDVoO7AsMDZMKnAsPCfIJegcxCMcF UwYIBGMEPgJrAoMAiQDE/pb+Hv3K/Hf7Avv/+WP5gfjF90P3a/bH9cr0RPQU82XzLPJ78jTx7PGc 8InxPvA88fDvEfHG7yXx2+9N8QnwvfGC8DjyDfHr8tDx9/P38i31RPSI9sf1IPiJ98H5T/mI+z/7 Vv0z/UX/TP8oAVkBRgOtA5kFQgZkBy4IOAkwCsUK4wswDGoNYA20Dm4O1g8kD6MQwA9EEf4PjhE3 EMwRRRDfEcQPTREZD5UQNg6aDyANYw7BC9YMaApfC+EIswlbBwsIuwU9BhIEZgQ6AmcCVgBHAJ3+ af7d/Hn8QPu6+r35FPlR+IH37PYA9sH1vfSg9IHzwfOQ8q7yaPGY8THwOPHO79fwZO+/8FXv7/CP 7yfx1e+N8UjwJfL28Ofyx/HS88jy/vQT9Fr2jPXg9zv3hvkL+VH7+fov/QL9Jv8u/xgBRAEPA24D 8AR6BdkGiAeCCFYJYwpoCzgMcw1jDbMOfg7oDzQPsxCuDy4R+g98EQoQkBHTD1EReg/yENEONRAa DmwPLQ1uDuMLCA2OCo0LCQnZCVEH8we0BTMG/ANMBE8CbwKVAI8A+P7N/iL9wvw5+6H6t/kC+Tb4 VPfX9tz1m/WD9Jz0ePOn827y2/KO8Tby6PCx8VvwYfEH8P/woe+38E3vD/Gs72fxFPAX8tPw8fLS 8ejz3vIN9R/0UPZ/9br3BvdN+b/4IPu7+jH9Af0N/wb/DwE/AfcCUAPwBHEFvAZsB4EIWgkPCgcL kAutDLMM6Q3+DVEPHw+cEJ0PHBH0D3oRBRCNEdEPSxE/D6cQpA76D8gNCw/KDPANpAuyDFQKQAvj CKkJRQfjB54FFAbjAyUEJAI4AlkAPwCw/nD+/vyT/Gz74frg+TL5iPi79/P2+/VR9Sj0T/QV80Hz 8fGB8iTx8/GV8H7xGfAj8bnvAPGa7/jwk+8y8dnvdPEg8Nvxj/Cw8n3xpvOM8tf02PM29l/1pvf1 9kP5sPjt+oT6vfx8/Ij+aP6YALIA3wI0A7cENAWhBkoHWggnCfkJ8ApaC2oMnAzHDaYN5g52DscP Eg9yEGAPwxCeDxARwA86EUUPrxC0Dg4QzQ0RD6oMxg19C3cMKQoFC7cIbgk6B8wHogUOBukDLAQL AhgCWgA9AJX+Tf7w/H38Svuu+tD5E/lV+HX3E/cQ9sj1sPTR9KnzmvNR8lzy8fDO8VzwSPHN7/nw fO/a8F7vAfGZ7zLxzu+a8UPwIPLW8NfyofG8853y1/TU8xz2NPWT99T2MfmW+OL6cPq+/Hr8kf53 /n0AkABaApMCQQSkBP4FjQbwB6kI8QnjCkoLVAycDM4Nng3jDl4Oqg/tDkcQSQ+oEFsPvBBDD58Q 4A42EGkOsw/LDQUPvQzZDZcLnAxAChcLxwh8CRsHnQeOBewF2wMQBDICQAKGAGoA7/6u/hn9qfw2 +5P6vvn4+Dn4Tvf19uf1xvWg9Lb0evO983Py9vKe8UTy4vDT8XTwRPHN773wOO/g8GbvB/GW73zx G/Am8tzw4/Kn8cnzqfLe9NzzF/Yo9Wb3mPYB+V744fpq+pn8RvyA/mH+ZABvAFACiQIlBIQE/QWM BqgHVghPCR4KpwqVCyMMOA2SDdAOUw6fD/AOTBBGD6oQYQ/BEBoPaRDHDhAQLg5mD2gNkg56DI4N WwtRDBsK7Aq/CGsJKQezB4wF8AXhAxIEHAIjAnMASwDH/nX+Lv2y/JH7+/ok+mr5hvig9832s/Ww 9Xn0gPQ385zzP/Lf8n7xQ/LW8MLxTfBv8fjvOvHH70Px0e9K8dvvbvH77wzyr/DE8nzxuPOM8s30 wPMr9j31hve49hX5a/ip+iH6Yvz++yL+5/0sACIAWQKGAiQEegQNBo0GtQdcCEUJFwqyCqAL+wsG DfsMHQ7iDRkPcQ6yDwYPUxB2D9EQPQ+VEO8OQRBTDo4Paw2JDnkMeg1YCz4MEwrcCq4IVgk+B8MH pQX9BesDFgQ7AjYCgQBVAM/+ef4r/ar8kPvo+hX6S/ml+L/3W/dU9h/2/vQd9fHz5vOZ8rDyPPEj 8qfwlPEM8Ezxye8/8cTvQvHO723xAvDI8WbwRPLs8PXyrvHC85byy/S58wv2EvVt95z29/hM+KX6 J/pZ/Pr7Lf76/ff/5P/WAfABiwPMA5MFCAahB04IKAnyCaAKjwvjC/AM7gwXDrEN3g5TDowPrg7x D9oOGRDMDgsQew6yDw8OPg+CDacOfgyNDW4LXAwcCuoKngg8CSQHmweaBesFAQQwBF8CYwK+AKAA Av+4/iL9oPyb+/f6B/o2+aX4tfdW90n2KvYI9Qv10/Ml9ODyUfPy8bvyV/EC8o/wSPG+7zjxr+8r 8ajvZ/Hz7+LxfPBm8hLxE/PV8ejzxfLx9OXzCvYQ9W/3lPYH+Vf4pPoX+lj8+vso/uv99//p/9kB 8AGgA+QDbgXcBRAHoQesCGMJCgrWCoMLewzrDBAOtg3nDl4Oow+1DvwPxg4GEK4O6A9jDpIP2w0D DzENRw5IDEMNRQspDBwK6AqxCFoJOge4B6cF/QX0AxUETgJOAqoAfgAU/8D+c/32/AP8ZPtU+ov5 nPii91f3Q/YQ9uH0AfW88xX0t/Je8/3xtvJL8T/yzfDm8XDwsfE58LXxQfC18UTwy/FY8GjyB/EQ 88Tx/PPG8hf1B/RE9kr1jfe39v/4SPiA+u35HPys+/39tP0VAAYAzwHqAbAD+QNoBdUFGwewB6II UwkSCukKRQsvDGQMaA0pDT8OAg4vD7YO/Q/PDhcQxg4EEHQOtw/uDRoPEw0gDjcMLw0mC/4L+wmz Cq4ITgk+B7sHtAUHBgoENARnAmYCtgCMABz/xP55/fj89PtT+3L6r/ki+Tv4w/fI9rH2lvVl9S70 CPSo8ljz7vGd8izxNvK78Pfxf/DM8VfwxvFX8PTxivA78t7wtfJj8UzzDvIH9NvyFfUD9ED2R/WT 97z2A/lQ+KX6G/o7/NT7/P26/a//l/92AYYBLANcAx8FgwUfB7cHlghWCRMK7wpCCz4MRQxUDR8N PQ7EDfAOJw5ZD2YOnA9SDogPNA5hD+0NHg8uDUkOUwxXDTkLIgzrCaoKnAg1CS0Hpge0BQYGLgRb BJwCoQLqAMcAGv/H/o79F/3x+0v7ffqz+R35OPjW99n2n/aH9Zz1bvSf9Fvz7/Oh8hLzqPEs8rHw 7fFw8LnxOvC+8UHw5vF38GPyC/HW8orxe/NG8k30JvM+9Sv0UPZZ9Zn3xfYh+XD4rfog+k/87PsB /sP90v/B/5EBpwFZA5UDAAViBawGMQciCMgIwgmOClsLXwxZDGkNRg1sDt4NEg8zDmcPXA6QD1QO kA8RDj4Ppw3IDvoMEw40DDwNUgs+DBsK6ArMCHQJXgfeB9sFOAY2BF8EpwKsAgYB5AB+/zj/7v2C /Xb87PvT+hr6J/k9+Or35/al9ov1ovVx9Mn0hvME9LLyXPP88eXyhvGB8hvxWvL08Cfyv/AD8ovw Z/IF8d/yi/GN803yc/RU82P1XPSF9pf1u/fr9hr5avh8+uv5M/zI+xL+3P3D/7X/jQGmAUoDjQP/ BGgFmwYmByAIyQiECVQKvgqhC9QLzQynDLYNeg2hDkEOfw9cDpoPZA6kDxsOTA+LDaUO5AzuDQ0M CA0TC+4LAQrFCrsIXglbB9wH2gU0Bk4EgAS2Ar0CFwH9AHj/Lf/1/Yr9bPza+wP7Vfqk+dL4ePiO 9xH3Bfaq9XH00/SJ8/nzovJZ8/vx3fJ38a7yTPFz8hXxc/IX8YnyOvHO8n/xQvMH8sbzmPJz9Fbz dPVx9I32pPXJ9//2PfmZ+K76LPpB/OH71P2U/YP/a/8pATQBCwNBAw4FewWVBiYHKQjfCH4JVQq1 CqILuQu9DJ0Msw01DVUOtA3oDuINFA8NDkYPDw5OD5ENwA70DBIOIgwnDQEL5QvjCasKowhNCUoH zwfaBT4GcgS5BNMC7AIhAQoBj/9N/wP+nP16/Ov7CftZ+rj57fh5+JP3TPdM9k32PPVZ9TT0pvR2 88nzgfLo8obxr/JR8XHyEPF68h/xvfJx8RPz0/F/803yF/Tw8sb0tfOp9bH0uPba9fT3M/dM+ar4 yvpN+lL8+vv7/cz9n/+U/08BagH4AjYDoAQEBSEGowbQB4EIiwlrCrAKqQvKC9wMoAzCDUoNdA6c DcoO2w0SD9cNDw+oDdcORw1sDq0MxA3+C/0MJAsYDP4J0wrHCHgJXwfyB9sFQQZmBKYE2wL2AlgB SgHU/6f/Xf4M/sH8R/wI+1z6wvn++G/4hvdT91D2SvY/9XH1VPSo9HPzC/TO8oPzP/JB8/3x1vKJ 8YTyKPG78mrxAPO38XfzRvIW9PLy+PTt89L14PTj9g32+/c890T5pPie+hr6N/zf+wP+1v2e/5r/ VAF3AfYCPAOaBA0FJAaxBqgHWAj4CMEJNgofCzMLNwxDDF0NQA17DqEN2w7rDTAP3w0oD5QNxQ4z DVsOmwy0DdYL2wzwCtwL7QnBCrQIcAluBwUI+QVsBoIEzwT3Ah8DcAFqAd3/sP9n/hr+6vx+/JT7 BPtC+pD5GvlQ+MD30vZg9k31kPVt9Lv0ifMo9O3yw/OJ8nLzOfI78//xNPMB8kzzF/KX82vy4/PE 8lH0PPMl9Sb0B/Yi9RX3SPZM+KX3j/kB+fX6hfph/BL83/23/W3/aP8wAVQBHgN8A6QEHAVHBuUG rwdvCAMJ2QkuCiALQgtIDA8MIg3CDO0NLg1XDpcN0A7gDScPpQ3kDkkNfg6zDNoN6gv+DOMKzQvZ CbEKpQhdCWgH/gcLBooGqwQJBSUDVQN+AYMB/P/X/3X+L/4E/Z78mvsS+1n6sPkc+Vb4A/gt9/f2 BPYt9ij1LvUZ9DH09fLK85byZfMr8kLzB/JV8yrycvNL8rXzmvIf9A/zqPSm81H1ZPQo9k31Ivdb 9kv4oveP+Qj58fqK+mH8Gfz1/dT9ff+C/xkBQgGpAvMCPgSmBLMFOQZXBwwIAQnkCSIKFAs5C1EM CgwnDaAMyA0SDUQOVQ2NDl4NlQ5CDXoO4AwRDnQMlA3dC+8M7groC+YJyQq1CHkJVAfuB/oFdgaV BOsEIQNaA6YBsQFIADcAs/51/gr9n/yq+yX7VPqr+SD5Vfj/9yD3Dfcd9i32MPVx9WH01vS880/0 NfMM9Onyo/N+8lHzGPKF81XywPOa8jX0JfPe9OjzjvWp9GT2lfVZ95/2Yvi+9435Dfnx+o36hfxO /Pj92/2X/6H/IQFTAbsCEANABLIExAVZBh8H0wd9CFEJlAl6Cs8K1Qv4CyANjgzFDRANTg5QDZQO WA2bDhINRQ7FDO4NNwxYDYwLmQy4CrMLugmdCpwIZQlmBxIIBwaPBqUEBgUzA2oDpgG5ATgAKwDH /pr+af0g/Qz8m/vc+lH6evnO+A34Mvcc9zT2LvYs9Xv1bvTu9N/zffRk8yP0C/P38+Dy2vPC8vvz 7/Ic9A7zUfRB8+z08vOc9bP0ePap9Yb31/aV+P/3xflN+Qj7sPpt/DT8xf2k/Wj/c/87AW8BugIS A0cExwTCBWQGKwfrB2oIRAmUCYYKlgqdC20LgwwcDEgNjwzDDf4MPA5UDZ8OGQ1bDtMMDA5BDG8N eAuKDJ8KngukCYsKkAhZCWUHGAgZBq0GugQqBTQDdwPKAeoBSQBIAN/+vP50/Sv9Jfy7+9r6Vvq9 +Rv5mvjZ97b36vak9sL1j/WG9An1+vOA9GvzNvQY8wf07fIc9A/zMfQo83b0e/PO9NnzS/Vm9Oz1 F/Wx9vL1lvfs9rD4Hvjd+Wz5KPvQ+ov8Wfz1/eT9b/98/+oAGQFoAr0C1ANABHYFDAYqB/MHVwg5 CY4JkgqECpoLUAtyDPULIA1vDKkNrwzsDdAMCw6sDOgNfQy2DSYMXQ12C5IMpgqsC6sJmwqRCGcJ SAfxBwUGkAauBBgFWAOkA/cBIwKXAKkAGf/8/ov9Qv1G/N377/pm+sv5L/m/+A74z/cM9+72FvZC 9mD1pPWy9EH1RvSy9K/zM/Qh8zf0LvNL9ELzlPSX8xD1JvSY9bz0NvZ09f32Tfbf90H30vhI+P35 j/lR+wz7pfx6/A3+B/6C/6D/+AA3AXsC3ALqA2gEVgX0BagGXwfrB8AI/gjsCS8KOwtSC4AM5Asb DWsMqQ2gDOkNowzcDYMMvQ08DG4NxAvvDCkLRAxiCmgLewlvCn4IVQlFBwEIAgadBq8EJQU+A4sD 4QEMAnkAhQAj/xD/0f2c/ZH8Qvw1+8H6xPkq+cL4FPi99+/28/YZ9kf2ZPW49cn0PfVL9PX0/vO5 9MPzufTD86P0r/Om9LDzGfUu9Jv1wPRB9n71CvdX9gf4c/cB+Yn4HfrA+Uf7A/uG/GD81/3J/Vj/ df8IAVEBcwLUAuoDdgRIBfEFnQZeB88HqgjxCOQJ4wnsCrwK1wtXC3sM9gs0DYYM0Q2JDNUNegy/ DSsMbg2aC8IM+QoSDDUKNQtNCTgKRwghCTsH9Qf6BZQGpgQeBVADpwPnARwChACWACj/GP/P/Zn9 jvxB/FT75/pB+rn5K/mP+E34ofdG93z2QvZa9b311PQ39T/09vT+89n05/PP9OTz5fT98xj1OvRs 9ZP06PUf9Xf2vPUc93b2CPh29wX5jvge+sH5Xvsh+5z8gvzy/ff9Sv9o/7cA8wAIAmECmwMZBEUF 7wWGBkwHyQesCN8I3AnbCe0KlwqyC0ILagy1C+kMAQw+DScMZA0TDE0N7AshDaUL4Az+CiEMSApW C1QJTgo8CBYJHAfdB/AFigaxBC4FbgPMAyICXgK1ANAAM/8l/+39w/2Z/E/8cPv/+lb60/lW+bf4 Xfit95D32vbX9gz2WPaE9a/1yvQT9Rz0+vQB9OD06vP79BH0PPVU9LH15vQn9mb1x/YZ9nL31fZF +Lb3MPm1+ED65PmA+0r7ufyg/A3+DP5g/4L/zQARASYChQKHAwUE1ARwBR8G1gZBBwcIhQhsCcIJ 1gp6CqMLLwthDJ8L1gzVCw4N7AskDdoLEA2bC8sMOwtkDKYKwQsCCggLNwkoCjUIEAkYB9gH6wWK BpUEDwVSA6wDBAI/ArIA0wBm/1z/N/4a/tv8m/xq+wf7XPre+VH5uPhi+LP3lPfa9vr2MvZu9pn1 +PUg9bD10/R49Zv0b/Wb9GH1hvRe9YH0xvX69Dj2d/Xb9jD2pfcT93X4+/dl+fz4Z/oS+nv7Pvui /ID8+f32/Xj/of/HAAcBNAKVAoID/QPRBG8FCgbBBjQHBwg3CCEJNAkvCu4J+wq7Ct8LfAuyDLcL 8AzYCxQNxwsADYwLvAwFCyMMewqMC8EJwQr/COYJDQjgCP4GvAfgBXwGnQQdBVkDsgMGAkECvQDV AGP/X/8p/gr+5/ym/MD7aPun+jb6tPku+Zv4+Pd897j24PYQ9jr2WfXU9ez0j/Wp9GD1gfRJ9Wr0 Y/WG9In1tvTc9RP1P/Z+9bX2/PVx98/2R/i+9z75y/hH+ur5ePtB+6j8h/zu/e/9Lv9M/4kAywDZ ATICZQPcA/gEnwUxBvQGcQdPCH0IcAlsCXMKPApMC+UKCgxbC4gMvAv2DNMLCg3oCyQN3wshDW0L oQzhCggMJgo4CzAJKApGCCQJLwfxBxAGtQbcBGMFqQMZBEYClALbAAABjv+Q/z7+IP79/L38y/tz +7L6Qfqx+Sb5vvgd+O73P/cv9272n/ba9ff1HPVT9WH0LvVG9A71IPQo9T/0bfWW9L718fQp9m31 vvYL9mD3vvYs+Jr3Ffmd+Cb6zflP+w77jvxq/Nb90v00/1P/lADLAPUBUQJLA8IDpQQ4BeMFkwZE BxUIrQioCZEJoQp7CpwLHgtNDJILyAzjCxwNDwxSDQAMPg3VCxANeAunDP8KJgxpCn8LiwmQCpcI fgmDB1AIWQYIBwUFlgXFAzkEeQLGAjMBYwHh//b/pv6d/kf9Gv3Y+4L7x/pS+qr5Gvm8+Bz45vc6 9zP3cPaK9rv1EvY89af1yvR29Zf0L/VO9Pr0EPQw9U30e/Wi9PL1I/Wa9uP1Rveh9hX4gff9+ID4 //mg+RD7wPpa/C38w/2+/R7/Nf+JAMQA8QFNAl0D1wO4BFAFAwa2BkEHFQhcCEUJZQllCjIKSwsQ CzoM2wsgDSQMag1YDKUNRwyNDfwLOQ2dC9AMFws7DGgKegucCZkKqwiVCZwHbAhyBiUHMgXIBeoD XQSWAuICNQFgAeT/8v+Y/on+Xv0v/Sb81vsY+7T64vlf+ab4/PfQ9xr3B/c59mb2jPXp9QD1nPW7 9Ff1c/Q89Vf0OfVd9Fv1ffSm9c309PUq9WT2pvUj93b27fdT9+P4ZPj2+Zn5GfvR+k/8J/yR/YD9 5f72/kMAbQDHARoCdgP0A8IEWQUnBucGWwc5CIAIdAl/CYYKZQqCCw4LNQymC98M+As2DUwMlA19 DNANOwyHDd8LHQ1WC4YMmwq4C60JqQq9CKcJpwd2CIgGOAdRBeYFFASMBLQCBwNBAW4B8v/7/5n+ f/5W/R/9F/zF+wH7lPrp+Wn5+/hk+BT4Z/dk96n2jva+9b/10/Rp9YD0GvUy9Ar1HfQh9T/0RfVt 9I31tfTz9Sv1dva69Rz3b/bf90v3zvhL+Nv5cPkD+7T6P/wV/Jr9h/3r/gP/WwCLAL0BDQIuA6AD fgQNBQEGuAaPB3EIqgijCbgJzAqgCsgLXguWDNILDw04DHkNZwyrDWsMtA07DIMN4QseDXMLoAzf CgIM/QkGCwgJ+wnrB70IrAZdB3AFAgYqBJ0E2QIpA40BwwFFAF0A5P7N/mH9JP0y/Nr7/fqD+vD5 Y/n5+FX4HPhn91L3jPa09uX1IfZJ9cr17fRV9Wv06vT28/r0EfQd9S/0YvWD9M71/PRz9rj1EPdh 9uD3SPe7+DT4uvlK+cj6dvoU/N/7h/16/d/+7f5MAHwAvAENAikDoAOOBCIF7QWfBisH9wdkCEgJ WwlVCnAKiAt0C64M8wszDWIMsA2ODNcNdwy9DUMMgg3pCx0NXAuDDLUK0QvnCeoK+wjmCfcHxwjB BnYHgQUUBjUEqATaAiwDcQGhASMAMADR/rj+kv1f/Vn8B/xC+9r6Avp4+bz4Dvjm9yf3E/c89nv2 nvX99R31lvWs9Ez1YfQq9UD0F/Uu9D/1X/Rd9YP0mfW69DD2ZfXU9hz2pff+9qH4Gfij+S/5vPpo +vL7t/s3/R39f/57/gEAKQCvAQICEQOBA4IEFAXcBY4GKwf7B0kIMglgCVwKPwpSCwoLMwyVC8AM JAxeDZYM5w2LDNUNZwyuDQUMQQ1+C6oMrwrBC+AJ3wrlCNAJ4QewCLoGbgeJBRYGNgSmBMgCFgN3 AZ8BFgAXAMT+pv54/Tz9RPzo+xX7n/oQ+n75Dflp+Dv4hvdG93r2RvZe9dL14vRY9WD0HPUj9Ab1 FPQJ9Rn0HPU29GL1h/S29ef0OfZx9cv2FfaL9972ePjn93v5CPmc+kf62/ue+y39Gf2H/oz+8v8V AFcBmQHKAiYDHgSdBKwFUQZFBw4IXghKCYMJjApnCn0LIQtEDLQL3wweDFgNUgyLDWsMpA01DG0N 9wstDZgLxwziCvsLCwoYCxIJ/gnpB64IwAZtB4EFDwY8BKkE6gI3A6UB0wE2ADoAvP6b/nf9OP0x /NL7//qE+vD5W/n9+E74Gfhd90z3fvar9s/1DfYs9bP1yvQ29T/0wvTC89L00vPl9OjzMfU/9KH1 xfQh9lT1xPYF9n33z/ZX+L73UvnN+HT6DfrE+3/7CP3l/HP+cf7W//L/UQGNAboCGwMoBKQEgQUb BtUGkgf3B8cIOAkrCnQKjAssC0kMzQv/DDgMcw1xDLENXwyWDUEMcQ3pCw4NcQuHDMcK1wv6CfIK EAnxCQsI1QjXBoEHmgUoBksEtATpAiYDjgGuATsANwDx/s3+qP1p/Xz8Ivws+7T60vks+d74LPjk 9xn3JvdK9oL2n/X99Q31hvWN9D71QvQC9Qz0//QG9PD08/P39PnzX/Vy9N71//SK9rf1Zfeu9kT4 qfdJ+cj4Vvru+Y37P/vB/I38O/4n/tX/7/8+AX0BvAIdAycEowSFBSEG1AaNBxAI4wgpCRMKFwoX C+8KBQyLC6cMGwxKDZ0M3g2fDNwNigzEDSgMWQ2LC6MM4ArnCxMKAwskCf0JGgjhCPYGnQe3BUMG XgTEBAsDVAOnAckBTABJAPT+yP6u/Wf9avwK/Eb7zfos+pX5PvmX+Cf4XfcJ9yH2a/Z49cv1yvRa 9Vn0CvUD9Pf09PPi9ODz9/T+8yT1MvR29Yj07fUM9Xn2q/Ul92f2Efhm9wz5fPgx+rX5bPsZ+7H8 evwN/vL9ZP9r/9YA+AA8AngCzgM1BHYFEwa4BmUHAwjTCA8J9wkICv0KywrVC3MLjgzbCwANLwxY DTgMYA06DGQNEww7DYwLpAzgCu0LDAoHCxsJ9wn0B6sIzQZtB5UFEwZYBLQEBQNJA7gB2wFNAEwA 0f6m/pL9Qv1I/Nj7I/uX+g36afkR+Vj4JPhV91/3gPao9rv1HvYq9XX1ePTc9MPzuvSn8570jPO9 9LDzBvUI9Fv1afTU9e30afaV9R73Wvbs9zb37fhS+BD6k/lE++L6j/xN/Ov9yv1U/1P/zgDtADcC dwKpAwsEBgV8BVwG8waFBzwI1giwCRkKFAvYCuMLiwuoDPILFw0wDE8NOAxdDSAMPQ3UC+gMZAtu DLwKuAsBCuoKIgn2CQ8IzAjlBoQHpQUgBksEmwT4AjEDnwG0AVUAQwAH/9n+yP2B/W/8CfwE+3L6 +flT+ev4I/gJ+Cz3QPdY9pX2ovX59QH1j/WJ9Cz1H/QC9fjzxvS685j0fPPY9M3zI/Up9KP1tfQ9 9lv1EPdK9uX3Lvfh+Ef46vlo+Qz7ovpJ/Pn7vf2P/VH/Tv+3ANYAOAJ8Ap8DBAQLBYsFVwb1BpgH UQi2CIUJuQmfCoMKdwtTC2IMEwwyDUsMbA1nDJUNRAxlDeIL9wxhC20Mwgq4C/QJ2woQCd8JDAjE COYGfQerBSQGXASxBAcDQAOoAb0BUgA/APX+wf60/WL9dfwH/FX7xvo3+pb5SvmP+Db4WvcO9xn2 c/Zu9cf1uPRd9Ur0FPUF9Of01fPF9LTz1fTK8/P07PNM9Un0pvWz9Bv2M/Xd9gv2t/f39rT4C/jZ +VL5//qU+kT89fuS/V79/f7k/lEAVQDpARkCngP5A/cEcwVZBvgGmwdQCMAIjgmwCZEKgwp7CzIL NQyxC7sMAgwXDRYMKg0eDDgNBwwlDYYLkAzoCuULEQr8ChIJ3QkSCLwI7gZ9B8IFNAaFBNcEPANy A94B7gFjAEwAFf/e/sD9ZP2G/A78WvvC+kf6nPlD+YD4XPiK94T3mPbk9vH1HfYU9VT1NfQP9e7z yfSm86/0j/O09J7zAvXz80f1P/Sy9cH0N/ZM9d/2//Wg99b2mvjp97r5Jfnl+mz6JfzL+339PP3r /s/+TwBYAMEB7QEqA3MDjwT3BN4FYgZRB/cHwwiNCawJhAqZCpALOAs8DK4LtAzxCwMNHgwvDf8L EA3LC9UMVAtRDM8KwgskCgYLNwkBCikI3ggKB5oHuAUlBnUEwgQpA1cD4AHqAYYAbgBH/xf/5P2O /Xn8+ftP+7X6Lvp2+Sf5W/g9+Fr3efeL9sb2x/Uo9h/1tPWh9Eb1MPQV9f3zy/Sq84r0Y/PG9Kzz CvX283v1efQd9jD1x/bt9ZH3yvZ1+ML3evng+JH6Cvri+377YP0f/bf+mf4wADgAmQG9AQ4DVANs BNEEygVSBgkHoQc5COwILgn2CTcKHgszCzkMpwuxDAMMEQ0jDDYNDgweDa4LswxNC0QMrgqUC/IJ ygoYCdwJGQjFCPkGiAfMBT0GgATQBDYDYAPZAeYBfQBiADL/+f7t/Zb9vPxF/Jb7APuF+tr5Y/mW +CH4Ovdj92j2nfaQ9Qv29fSd9Yj0Q/Uo9Pz03/Pp9Mnz3PS/8/306vMk9RH0X/VU9Pf1/fSl9rr1 dPef9l34o/d++eL4mfoU+tT7cfsX/cv8df5F/s7/vf9mAXoBGgNdA3AEzgTZBVwGEwewBzwI9AhA CQwKIQoCC9EKvwtkC14MrwuyDPkLBw0iDDQN1AvkDG0LcQzTCsIL9QnNChoJ2QkaCL4I+AaFB8sF NwabBOwERwNxA+QB6AGLAHMAOv/8/vD9kf24/DX8j/vu+nv6xvlx+az4k/i297n3y/YZ9xv2R/Y3 9Xj1T/Qr9QT04PSz89D0pvPi9MPzAvXo80H1N/Sf9Zf0GvYl9bD2z/Vw95L2UfiR90n5o/hd+s75 f/sG+7/8aPzt/bH9N/8Y/2gAXACrAcEBxwLsAhkEYQRsBdsFUwbPBi0HvQfVB3gIUQj4CKgIVgnn CJQJ9AiiCeQIjwmkCEoJZQgACQAIlghdB+EHpAYTB98FPwb9BEAFBgQuBCIDMQM+AjYCWgE/AYIA VACs/2r/yv52/tH9X/0x/bP8e/zx+wT8cPuQ+/H6N/uY+uP6Q/q1+hn6gPro+YD67flR+sH5HPqH +VT6yfmF+gD60fpb+jn72fqZ+0H7+Puz+2z8Mvza/Kz8UP0t/eD9xf2N/of+Ef8T/6n/vf8uAEYA vADYADsBYAGwAd4BIwJQAoECsgLbAgcDFAM/A28DowPbAxwE1wMLBNgDDQS4A9sDewONAzgDQQPv Au0CkwKDAjsCIALNAaIBYAEsAe0AqwBrABwA5/+S/2//A//n/nP+gf4A/iP+l/3L/Un9h/37/Fv9 z/wG/Xf8oPwM/JP8A/x+/PP7hPz++5X8HvzR/Gf86/yU/B/91PxT/Rb9h/1b/c39qv3v/dn9E/79 /Wr+Zf62/rv+A/8T/1f/cv+V/7z/2v8GAAgANwBGAG8AZwCUALsA6gAfAVUBNgFkAWEBjQFxAZYB ewGXAXkBkAFyAX0BYwFeAVMBRwElAQoBIAH/ACkBCQHhALQApQBwAGEAJQAaAMX/sv9N/23/+/4l /6f+5f5j/qf+H/5x/uX9Lv6h/eH9Tf2+/SD9kP31/Hv92vxr/cn8Z/3R/Gf90/yA/f78k/0W/b39 T/2//VH9n/0v/eP9gv0J/rb9TP4G/pf+a/7T/rP+Bf/x/jj/Mf9b/1n/h/+L/6n/tf/M/93/8/8F ABgAKwA1AEoAXAB1AGcAgAB5AJAAewCTAIwAlgB7AIEAogCmANAA2QDFAMcAxwC9ALwArwCqAJgA iwBuAHsAUgBkADYATwAbADwACAAkAOf/FQDX/wgAzP/k/6X/yv+I/6f/ZP93/yv/Zv8W/0z///5B //f+OP/x/i3/7f4V/9D++f6w/vf+sf7u/q7+8f6y/v/+w/4G/9H+EP/h/h3/8P4n//3+Ov8W/zf/ G/8m/w3/Rv8p/1b/Of9m/03/eP9f/6D/j/+l/5X/sP+l/7H/n/+1/6T/tP+d/8X/rP/X/8H/3P+9 /+L/wf/n/7//6P++/+j/uv/l/7X/5/+q/+D/pv/h/5//9/+1/xEA0f8EAMf/FQDP/wsAyP/3/7P/ 7v+q/+7/rv/q/6f/8/+6//z/wv/5/8L/6P+x/+r/vf/n/7//8v/I/+X/wP/d/7z/3//C/+H/wf/t /9f/4v/S//z/8v/U/8n/BQABAIL/cP95BfkFCAalBs4GeQcgCiILtgm6CoEKmgvMCvIL9gkLC1kJ ZApaCE8JqgZ0B2QFDQZ/A/ADxAENAuL/8/8Q/uj9K/zG+4H66/m1+Ob3QPdC9tX1qPSI9CvzWvPX 8VfyqfBl8Z3vu/DW7k/wUO4m8BruTPA97sTwu+6o8bPv4/IF8Y/02/KT9g71//i695z7qvp4/sz9 fgEjAZgEnQSLB+cHTAoFC7AMsg2fDuMPARB8EeMQghIyEd8S7hCrEigQ4RHYDnwQOw26DjkLjQwI CSoKkAZuBxYEtgSOAekBKP89/7D8fPxq+vf5TPiZ90f2U/Vf9DPzp/JE8RDxcu+27+bth+6P7K7t lusf7erq6eyg6iDt1urI7X3r5e637H3wbe6O8qzwCfVl8+z3jfYo+x36pf71/T0C9gHRBe8FPAm/ CVAMKA3qDhgQARF3EoESLRRVEyQVjBNvFSMTDRUtEgsUuRB6EtcOdhCmDBIOPgpvC6YHnQgABbMF YgLPAtT/+/9Y/Tj9Afuf+sP4Hfiq9sf1wvSh8wTzqPFx8eDvH/Be7grvHu047i7suO2S65XtY+vX 7afrkO5o7MPvsO1r8XrvjfPR8Sz2rfQw+fb3iPyy+wQAg/+cA34DHQdoB3QKHQt2DXUO8w9LEfQR ihNUEyIVGBQFFjAUNhaoE6gVmRKRFA4R7hIcD84Q5AxoDmsKsQvhB+MINQX0BaMCHAMLAD4An/2S /T776/oZ+Yn46PYL9qr28fUW9S30/fP58nTzdfIf8urwiPFG8D3x7+8U8bvvJvG978LxYfB+8hrx 7fOg8pL1WvTO97/2MPpL+UL9qvyhAE8AlgOIA5kG0gZdCc8J5AuZDOoNyA5sD3gQUxB0EbAQ2RFt EJYRsg/REH8OgA/RDKkN6AqaC9UIWAm4BgcHjwSvBI8ChwKYAGwA3v6b/iL9xvzZ+3f7GfqR+Vb4 mvd398X2afau9Zr10/Sy9N7z8/MS80bzWPLB8sLxfPJt8W7yUPEP8/LxSvRA82z1afQc9y/2D/k9 +Hj72PoT/pv99gC5ANMDzQO8BvYGOQmqCbwLbAzsDd4OHQ8cEMwP3xDrD/oQeA9+EJQOgQ8/DQsO pQtODMkJQwrrBzwItwXXBUoDLwNrATMBmf87/wX+kP2X/Bj8X/vb+kX6vflD+bb4TPjD91b3xfZ4 9uL1afW+9ID0tPMD9DPzm/O58nHzivKJ85jy8/P38sb00fP69Qj1qvfN9pH5z/hM/Mb7iP9Q/zUC JwIeBU8FzAcrCFEK8QpnDDENHQ4JDz4PRRDSD+MQ2Q/pEHAPfxCaDpUPGg3rDWILCQxmCeQJbwe+ B1oFegVnA2gDhQFfAfH/vf9T/gv+Lf3e/HT7B/uj+Qn52fhN+Nr3SPcN93/2Nvad9XH11fS79BL0 H/Ri87/z7fJ7853y1PP38sb0+POd9dT0BvdJ9r34Efji+l36Vf3z/BMA4f/jAu4CygUSBnYI+AgM C8MLwg3WDo8P3hCZEP4RTBHWEjYRuRKUEAcSmg/5EBYOUw9eDG4NVQo8C0kI/AgCBnoGgwO4A5AB nAGg/4X//v3I/Zb8T/w6+9768vmB+cz4TPio9xT3n/b/9W/1rvRR9GvzpPOz8gjz+vGo8obxi/Jc 8b7yevFc8xnyXfQe8+r1wvTK97/2cvqg+Zj9Ff18ADgAmwOpA6oGDgeSCT8KBQznDEwOeQ8AEGAR KRGwErcRTxOhET8TCxGqEv0PihFdDsIPdwypDWoKaQtjCDMJPAbYBhMEeAQgAmECPABQAKj+nf7E /JH8uPpN+qH5JvlW+Mf3Tfet9lf2rvVV9ZL0WPR3837zgfLG8q3xP/IF8Uby//Dp8qzxgvM58rj0 gPNB9hn1Nfgo95f6u/lq/cv8ZQASAJgDmQOwBgAHwQlrCpMMkg2wDu4PTRDEEU4R6xKsEVsTXxEH E7UQUxKKDw8R/g1eDyIMVw0rCiwL+AfHCJUFIAaNA+oDfgGqAcb/y/9P/kT+4fy5/Hr7PftG+u/5 APmX+Of3bPeb9gD2VPWS9In0q/O888ryK/Mh8t/ywPG/8o/xE/PU8cPzfPIJ9dPzlPZw9fT4CPjX +zT7kf4l/qABhgG8BO4EvAc+CE8KDQvUDN8N0Q4cEE4Q0BEyEdYSbxEoEzwR9hKAEC4SKw+0EHsN 2w6YC80MnQmjCoMHVQhhBfsFagPfA3cBuwHa/wMA5v3e/dj7mvut+mD6Yvn9+EL4zfdR99f2Y/bi 9WH1xPSH9NfzvvPx8hfzMPLv8vvxQ/NI8qrzpfKT9JPz2vXq9Jr3wPar+fD4OPyx+xP/xf4fAh8C SQWXBTsI1AgoCxEMwA32DooP8xDhEHkShhE3E5YRSRMlEdcSPhDSEd4OVRAuDXsOSwtjDCcJDgrQ BnkHsgQpBZ8C4wLVAPUAOv9F/7j9qP1L/C38Cvvf+sL5hPmo+FX4TPfm9t/1UfUZ9YT0NPSH85Pz 0vII8y/y2/L28dzy4/FW81HyL/Qo85/1qfRQ93j24vk4+er8j/yv/4j/0gL0AsIFMgaNCDkJOwsv DIYNuA5QD7oQnRA0EjIR2RJoER0TEBHGEgMQmhGRDv8P2gwbDgELHgz7COEJ5QaUB/IEcAX2AkID VQGPAVX/Y/8z/Qn9AvzO+7L6bfqe+VP5jfg/+Hr3H/dn9vr1ZfXf9HP01/OY89ryJfNR8i3zVPJN 82Hy0vPp8sT02fMy9lT19vcz9zz6o/nV/HH8wf+c/90CCAPdBU0G4QihCb8L1AzSDR4Pgw8AEYMQ IRLtEJgS5BCLEk0Q6xE9D8IQ1g04Dx8MWg0zCjQLAQjJCPoFkgbsA1MEEwJaAnsAogDu/vr+eP1v /TX8I/zr+sX6xvmY+WT4F/jX9mH2BfaM9Q71fvRJ9LDzmvPn8jXzdfL88iDyOPNJ8r3zyvLl9P7z SPZp9X/4yvdK+9362P2X/c8A1gC8AwUEiQYQB1EJHwrTC+UM1Q0hD3QP/BBfEAMS4xCZEuEQoxIh ENAR7w58EGQN0g6vC/AMxAnRCrsHmAjFBXAGwwNBBBICbgIVAEYA4f3Z/Zv8gfxD+xn7IPro+fb4 tfgA+Lf32vaE9tz1bfXS9EX09PNT8y3za/Ls8hjyFvM18lrzb/Ie9DLzQvVa9NP2APbV+Cb4SPvK +g3+w/0WARoBFgRmBD0H4wdNCkULnAzXDZYODRD3D5kRsBBkEv8QuxK6EH4S+g+qEc0OXRBHDbQO bwuvDGUJbwpJBxsIPAXYBTwDpwN3AcAB5P8aAFT+cf7o/O38n/uU+0j6Kvop+QP5sPdl9zr2xfVb 9eL0YvTQ86Pz9fIN80ryt/Lc8aPysfH08vbxyfPM8uz0+PPj9hH2gfnw+OP7dfvG/p3+qwHIAZME 7QR+BycIRAo2C5sM0w2TDgkQ3A90Eb8QeRIdEfEStRB8EssPhhGMDh0QAw11DjwLfgw8CU8KWAcz CFEF/wWKAxgEiQHjAUf/av/f/eb9bPxg/Cz7Ffvy+c/55fi3+LH3cfeW9j/2bfX79GX01/N588by 7PIk8sjy9vHF8uLxQPNQ8hH0I/NV9XP0EPdE9kP5mfjE+1b7s/6J/poBtAHMBDUF/Ae/CIMKjwvE DAsOeA7zD4UPGxExEOERTxAAEuIPlRH2DpUQsw0zDxsMcg1KCngLRwg9CU8GEQdVBOQEjQL3AvYA SAFn/5b/9P0O/qH8qfxA+zL7J/oV+qD4b/gV97H2K/bG9ST1p/RQ9Lzzl/Pz8gnzRPLD8unxzPLh 8VPzYfIs9DjzzPX39B34cfc3+rP53vyV/KX/mv9wApwCWwXQBTYI+Qi3CrsL2wwkDoAO8Q+mD0UR ZBAmEkIQABKzD2QRmw4wEEANsQ6lC+0M2An0CtwHxwgCBrgGBASVBGkC2QJjAJ8AQ/5H/vn88/yQ +3b7ZvpE+kr5Hfkh+Ob3+vav9t71evXF9D/0zfMy8xLzXfLD8vfxmvK88dfy8/Ft84TygPSX8+v1 GPXo9zH3NPqm+fP8ofzV/8P/BgNIA0kG5Qb8CN4JdguZDHgN2Q76DocQzA9tEUoQ/RElENQRjQ8y EYYOExAnDY4OfgvDDJUJogqjB34InwVLBsgDSAQkAokCeAC6AOb+DP+A/ZX9DfwF/N761PpE+Rn5 iPcz95T2OPZy9fv0evTx857zBfPj8inyZPKS8TbyRfFy8nnxBvMB8lL0ZfNZ9pj1P/iT97n6QvpY /Rz9HgAVAAsDSwMCBosGtgiNCSULPAwRDWUOpg4tEMwPeRETEMYR4Q+UER8PwRASDpQPrAwQDgsL Rgw9CUQKcgdNCIcFNgbeA2gE4wE5ArX/2/9X/mr+4vzd/KL7kvt2+lv6RPkb+Qn4zPfb9on2oPUu 9Yf0+fOZ8+Xy+vI08pHyu/GF8prxyPLR8Yfzi/Kj9K3zRvZp9UP4hPe++jr6cf0k/YUAiADHAxsE iwYpByoJDgppC4kMMA2KDlMOww8iD7UQZQ8CESQPthBrDvMPSw20DugLMA03ClALYghMCX8GNgey BD8FDgN/A2oBuAHU/wUAd/6W/vv8/vzX+9D7QPog+or4M/iK9zL3Zfb59Wf17PR+9PDzpvP78v3y NPKX8rTxlPKb8dvy1vHp8+7ynfXC9Dj3bfZk+cH43Ptw+5r+Z/5DAUYBOASGBAIHlQeQCXAKxQvl DGMNtQ6zDi8QjA8nEZAPLREmD7oQPg7DDxQNbQ6TC8wM3gnqChYI+gg8Bu0GiQQVBY8C7wJkAIYA 8P78/nD9Yv0r/A/89frN+sL5kvmH+D34XvcH9x32svX79G309fNF8ybzX/Kk8sjxafJ58YLygPEF 8wPy5PPi8kn1VPQN9zD2W/mr+Nr7Yfva/qf+HQJBAu4EVgWpB2AIHwoUCysMUw2UDeUOsQ4nEEAP xhBID9gQ2Q5jEPENXQ/EDBIOSAtxDIIJfgqqB3MI1AVyBiYEogR2AssC0AACAVb/dP/M/cz9lvyN /Or6v/oR+bj4Cfiv99H2Xfa+9Tr1u/Qk9MXzDfPy8iPyWfJq8RzyG/Ej8hHx3/LO8UH0TfOl9br0 jPfF9tn5Nvlo/Pz7CP/R/vMBBgLUBCsFiAcqCPYJ3ArnCwUNnA3qDtEOUhAyD7kQIQ+pEI4OBBCd Df4OYgyiDdkK9As5CSkKeAc8CMwFZQbmA1AEzAH9AUYAXAC4/rf+Zv1Q/Sv8Dfzt+rv6pvlj+XD4 Gvgp97z27PVl9cD0HPS38+3yDvMx8pbypPFz8mvxpPKR8UnzM/JO9Dnz1fXU9MH34PYk+nr5tvxA /LL/if/pAhQDmAUDBjsI7whoCloLHww1DX4Nvw5eDrgPtg4gEJEOBhDmDUIP/AxIDroL6QwbChsL WggmCZ8GPAf4BHYFSwOfA6YB2QEtAEcAsf61/m39Xv3P+6b7+PmX+ff4kvi/90f3sPYt9o/18fSw 9AD0tfPr8g/zLfKQ8o7xjvJ48bPykvGv85byO/U/9MT22PXc+Bv4LPub+rT9U/1+AFsAWwOAAxUG gAalCFkJvwqrC6QMyQ0aDmwPtA4iEOMOUhCBDucPug0ND58M0Q02C0gMngl/CuEHnAguBr0GQQSg BCMCTAKRAJgA8v7Z/pj9cf1T/Bz8Gvva+tP5hvmr+Ev4aPfw9j72rvUF9Vf07PMd8zzzW/Ks8rXx cfJj8XnyY/H38tXxzvOv8hf1BvTS9tT1Cvk5+HT71fpf/gT+kgGNAUMEhAQJB5UHYQkqCkkLOwzo DAoODA5QD5sO+A+6Dh8QRA6aD40N0g5sDJcN5ArjCycJ+QlgBwYIqgUoBuoDPwQsAlwCpwC4AAv/ //6+/aP9FPzb+yf6ufkg+af45PdU99P2Ova29Qr1xfQO9Mrz9PIM8xfybvJb8T7yE/E+8gPx9fLC 8Un0LvOZ9Yr0ffeR9qf54PgR/Hj7wf5n/p8BkAFtBKAEKAepB28JMAqTC5EMWg2KDkoOmQ+2DhIQ nA71Dw0OXA8rDWgO7QsBDXMKXgvACIQJHQe3BzwFoAUlA1UDfAGHAeL/zf9q/jv+Ef3U/OD7l/uc +kP6a/kB+TT4tPf99mP24PUy9bf07fO+89HyJPMq8rPyofGU8nPx0vKq8WjzOvJx9Ejz4vXL9N33 7PYM+kD5y/xE/OT/qP+TApgCXAWoBdkHZwjiCZ8KtgunDB4NOQ7tDSgPSQ6RDxwOZQ+ODccOvgzm DUYLSQy3CYsK5weKCDQGqgZ9BNYEzwL7Ai4BNQGy/6H/KP4A/gL9yfxY+/76lfkO+Z74E/hx99H2 cvbI9Xv1w/SL9LjzsvPD8gbz+/Gl8oTxhPJJ8fzyx/EY9PPyKfUL9Nf2z/W/+Nf3+Po++or9Af1R AAgAEAMSA9cFJAZFCNAIigpYC4MMkA2sDd4OXA6fD4QOxw8lDmUPbA2cDlIMZg34CuULVgkYCrMH SwjMBTsGugPvAwUCDAJVADsAzv6V/mb9Gf00/N377fqL+sL5SvmN+A34Ufe39kL2jPUQ9T30/fMM 81nzVPLM8rLxkfJj8afycfEE88bx2POZ8g/13vPR9rj1zfjb92H7q/pp/vv9DQHfAOID+QN6BtQG rQg7CbcKfAtcDFQNeQ2PDhoOTA83DmYP5Q0YD0kNbA7+CwENlwpzC9sIhgknB6QHeAXJBbwD7gMJ AhcChQB4AO/+wf65/YL9Cfys+zr6qvk/+a74Dvhp9wv3YPYN9lT1FfVF9Cb0PPNj813y2/K+8Yvy U/HM8obxn/No8nb0P/PT9bb0iPd/9o/5rfjs+zb7l/4i/kwBEgEWBCcEnQb2BhEJrAlICyIMsAyx DbMN0A4bDk4PEQ5HD4cNog6xDL0NcwtdDAkK0gpfCAEJwgY3B90EJAXYAugCPgExAaP/b/87/vL9 //yr/ML7WPuN+hn6bfno+DL4l/cl93v28PUm9cv04fMQ9BXzdPNf8hPz7PH68sjxIvPm8bzzd/Kv 9GnzJPb29Ob31PZJ+mr5Gf2D/Kz/TP9jAkcCCQU1BYEH6wd4CQsKUwseDKgMmQ2BDZMO4Q0ID7MN 0Q4wDUgOUwxVDfQK0gtjCRIKrgc0CAsGcgZKBIEEmQKmAgkB+QBx/z7/N/7v/Yr8Jvy2+iT6vvkq +Zr48feg9/L2ovbt9bT17PTF9OHz+vP78ljzQvLy8sTxAfPF8aHzcvJH9BHzdPVM9PD22fXO+M/3 +/on+on96vwnAMT/7wLWAo0FvAUiCJgIfgo3CyAMDA1VDWcOCA4nDzYOWw/YDfYOKw08DhMMCw29 CpILKQnNCX4H/QelBfYFlwOwA+kB2QE1AAYAu/5t/m39E/0m/Lr75/pq+sr5QPmP+PD3hvfb9kX2 ffUb9S30YvRo87TznvI38xHyDPPZ8RDzzPF38yryNfTq8nb1OPQI99z1N/lC+N/7LPtg/t/9FgHZ AM0D0QNgBqIGfwjzCIwKOwsqDAcNRQ1JDvUNDA8KDigPyg3oDiQNOA7yC+YMgApOC94Ifwk9B7YH ggXNBbcD2AMcAhwCcABLABz/5v5u/RH9j/sB+4T67PlR+a34TPif91L3lvZY9or1W/V89Hr0gvPF 86/yLfP78RHz0PFr8yzy3POU8sT0h/MH9tn0rveY9pv5pvjs+y37ff7u/SQB1ADaA9QDTwaRBsMI SAnsCq0LTww7DVENWQ7EDdwOtA3GDkINUg5xDGcNSQsfDOEJmApRCOIIkAbzBqMEygTsAu4CPwEb AcH/gf9r/h3+JP3D/OT7cfvM+k/6ovkQ+ZD47/dY9572EPYv9Vr1bvSW9JXzCPT48p7zdvKP82Dy r/Nv8j/09vIn9d/zi/Zj9S34Gvd++pf5L/2P/Jz/Mv9LAiMCywTfBAwHVAcrCbQJ/Qq1C1EMMA00 DTcOgw2JDoANkQ4TDSEODgz+DLsKjgs9CeIJqQcpCPgFSwY4BGMEmQKgAvMA0QCY/2D/6v2O/Qr8 fvsF+3D62Pk8+eP4Pfj590b3C/dJ9hb2S/U/9Vj0gPSA893zxvKh83XyzvOi8hX04/LM9Jfz2vWr 9Ef3NvYC+QX4H/tK+oT95PwYAK7/xAKgAkEFYQXIBygIFQq8CqkLgAziDN4Nhw2VDq0NvQ52DYUO zgzODc4Lrgx/CkML9giXCUUHvgdfBaAFnAOvA9wBxgFNABkA4/6e/pj9PP1L/N37M/u4+gD6c/n5 +F/4vvcN92z2kvW49dT06vT581T0UPPY88Dys/OO8rDzefIX9NfywfSD8/b1x/Rp90n2hfmR+BX8 YPto/uX9BgHJAIkDiAPiBQ0GKgiWCCgKygq2C4YM4AzYDW8Neg6wDccOhw2cDrEMtQ2PC3MMKQrp CqIIPwn+BmwHPAWEBZUDswPiAd4BcgBKALf+bv7Z/Fv8uvsx+4b67/mG+eT4ffjP96j37/ap9uD1 zPXz9PP0/vNJ9EXzv/Oe8q7zgvIE9NnycfQ881L1I/R+9l31CPj+9u75APko/Gz7m/4V/jcB9wC8 A7YDVgaVBs8IVgmZClQLDwz4DAENBA5oDXEOcQ2BDgoNFQ4/DDYNHQv8C8YJfgomCLgIWwbCBp0E zwTsAvMCSAEpAcb/iP98/jH+Nf3X/Ab8l/vt+nP6zflB+c/4Ovid9+v2bPaZ9b314/QE9Q/0gfR+ 8y70HPMO9OnyOPQG87L0gPOk9Xj02fa59bv4u/cV+1L6Ov2e/Lz/Xf8xAgcCjwSZBOQGLQcHCYsJ ugp2CysMDQ3yDPQNdg2FDn8Nmw7tDPYN/AvsDLwKiwtPCQAKwQdECAwGZQZuBJ4EtALAAj0BLgGE /0r/mv0v/Xn8A/xG+7z6R/qw+UT5pPh0+Mf3dvfF9pz23fW99eb0C/Ua9HH0avM09CDzYvRH86D0 ffNM9Sj0Q/Yq9Zr3jvZJ+VP4U/uH+pn9Af0fAMT/lgJ6AjcFXgXJBzYIuQlgClwLLwyCDHoNIg0j DmsNfA43DUoOnwyfDaMLkQxnCjoL4QiHCTQHrgduBb0FsQPYAwEC+gF8AFMAIf/j/s79fP2Q/DD8 b/sI+0v6zflm+dj4JPiB9/H2KPZG9n31hPWm9Pb0BPSZ9JTzVvRG8130O/Ol9H7zZPVB9GL2PvUF +AX3L/pi+Sf8ffuH/hH+6gCpADkDKgOgBdAF2gdMCMAJaApYCykMcAxiDR8NNQ5/DaQOHA00DmoM cg1ICzEM/QnGCoIIIgnlBl8HNQWEBZwDwwPuAfEBkwB7ANX+mv4U/an8AfyR+9/6W/rv+WD5C/l5 +Cb4gvdE95f2bPav9ab10PQE9Rr0qPSo86v0pPPD9LXzPvUs9AD27fQc9xX2i/iX92T6kfly/Mf7 0P5d/j4BBAHUA+QDbwbGBnoIBwlLCgkLsguZDJsMnQ38DAgOFQ0sDqcMtA3lC+AM0gqvC4MJPwrw B4gIMQaaBoIEvgTMAuECRQE6Aej/w/+I/kz+Tv3+/Cz8zvsK+5X6JPqs+e74YPit9/n2CfdW9kz2 hPW09eT0QfVg9Oz0+PPO9NDz+fTr8331avRE9jH1pPen9pz50fhd+6r6if0K/cn/fP8UAu8BbwSJ BLcGEQe9CEoJdwo8C8ILqgyvDLoNRw1pDh8NQQ6YDLMNrAumDIEKYAsbCd4JkgcpCOcFVgZIBJAE ngK8AjoBQAGB/1f/sf1c/Zz8N/x1+//6g/oE+qH5H/nE+DX45fdJ9xL3bfZL9or1pfXY9Cz1T/QQ 9SP0DfUV9F71ZPTu9fb04Pbn9R34NPe9+e34m/vu+tX9XP0iANn/tgKsAlIFkgVzB/AHYwkTCu8K zAsXDBUNrwy7Df0MHQ7PDOwNQwxQDV4LVAwpCgQLughzCRQHnQdmBcgFrwPlAxoCKwKxAKkASP8n //b9wf3W/I38pftD+7/6XPqH+Qj5Pfic95T38PbS9iH2OPZ49bH17/RK9XD0EfUr9Az1FPRl9Wf0 +PXz9Cf3M/ba+BH4dfq7+W784fuW/jn+4gC7ABUDFwNnBagFhAcCCGQJFAroCsoL7wvwDK8Mxg0C DSgOpQzHDfgLCw3yCusLuAmQCkQI+givBjsHIQWDBXkDtAMGAiECWABKAIf+S/5l/Rn9OvzV+z77 1vpn+vj5ifkL+an4Jvjn91z3I/d+9mv2tfXo9SL1oPXR9Iz1rPSw9cj0HPYw9db27fXW9/X2Ovlr +Ov6OPrp/F38KP/T/mYBRwHnAwQEWgbGBkcI4AgOCtsKUQtHDCEMKQ2gDLwNtQzXDVMMbQ2aC6UM hgp2C0AJEwqzB14IFwaSBmMEuATFAvQCXQFqAer/3v+N/mn+av0z/TH85ftP+/v6Hvqz+dH4Qvgp +J33bffR9tL2LPZP9pv13PUZ9ZD1vvRu9Y/0pfW39Ar2G/UM9yb2hvjD9+z5Pfm4+yr7vP1Z/ez/ tv8LAvoBWgSHBIAG7QZ7CBkJKAr7CmMLVgxODGAN2AwADrQM3Q05DFMNVgtpDDcKKgvkCLEJWQcE CMgFSwYjBHYEpwLaAvYAAAEZ//L+3f2m/aj8Wfyp+0j7w/pc+uP5fPkH+Zf4QfjD93738vbG9iX2 NPaK9df1FfWr9d30s/Xe9P71I/WR9rP1bveZ9pr4z/cj+nP57Pti+xH+tv03AA0ArgK/AjQFjAU2 B8EHGQnaCZYKfAuZC50MVgxzDaYMyw2BDKwN+gsiDRYLIAzyCeUKjAhdCfMGlQdOBcEFsQP/AzMC YwK/AM8AUf9I/xv+/v3j/LP86Puq+7f6Y/pb+dz4tfg2+PD3aPdX98f2svYR9k72q/Xe9SP1sPXs 9K/11vQI9iv1hvak9bD34PZG+Zv4vvon+qT8MPyh/lr+swCXAPMCAwMpBXUFKwe1BwUJwglnCk4L kAubDFoMfw16DKcNOQxfDZULsQyoCqkLdQlfChQI1wiVBjQHAwV4BYUD1gPVAQACCQADAMr+pv6E /U/9efw4/H37L/u4+mj61vl++Rb5t/hQ+N/3n/cd9/f2YPZ+9tj1O/aJ9SH2aPVE9n31pvbf9VH3 jfZI+Ib3jvnf+B77i/oI/aD8CP/L/lsBXAHWAxQE2wVKBtAHeQhqCTwKmAqGC4ALjAwHDCcNGQw/ Dc8L7QwQCx8MHwoVC9QIsQlcBxgIxAVMBjgEmAS+Av0CQQFpAdn/4/+e/pX+bP1H/XL8QvxB+/v6 8PmA+VP54viW+B74BPiJ92z34vYB93L2jfbv9Uz2pvU49n71cPat9cz2AfbA9wD3JvmI+Gv63Pkg /LH78f2h/eb/u/8JAgoCMQRxBDcGsAYhCNAIpgmACv4K/gvtCw4NQQxyDTAMYQ21C+IM6gr7C90J 1QqNCGgJIQfWB4wFIAYUBHsEXgKdApYAowA5/y3/7v3M/dL8nvzL+4T7//q7+iL60flf+QH5nvg4 +Or3c/dJ98P2v/Yn9mj2wPU/9pX1UPaX9Y722PUd92P24vco9wL5Uvhr+tT5Lfy4+wX+t/1HAC8A xQLoAsUEIQXIBlsHhQhCCeAJvgr6Cv4LuQvWDA8MOA34Cx8NgwumDK0KugufCZ4KPQgSCcwGfQcw BbQFsgMQBEICiwLfAAYBhv+M/1z+UP4w/Q/9VPwt/Cr76Prt+ZL5Wfn8+KX4P/gb+Kr3nvcl9yn3 o/bM9jb2l/bz9aT29vXV9iD2kffe9r74JvjO+T75R/vR+ub8jPyx/nz+rQCjAMwC8ALNBCgFvwZS B2gIKgnXCcIKAQsUDIsLsgy5C+QMdguaDOEK+gv3Cf4K1wjHCYEHSAgbBrsGkQQPBSoDhgOGAbwB 3P/h/6f+m/55/VX9gvxS/Kr7dvvg+p36IPrV+W35G/m6+Ff4K/i895L3GPcq96H29/Zs9uv2U/YQ 93L2dPfR9g74bPf6+Fv4Kfqa+bf7Qvta/Qv9cP9S/8MB3wG1A/8DswU1BncHJgjeCKoJGwoRC/4K DAx1C5gMiwu2DDkLXwyUCqsLqAmuCmIIRAn8BrkHbwUCBvEDXgSCAtECEQFDAbb/zf+D/n3+WP07 /Xf8UfxM+wz7D/qx+YH5IvnW+HL4W/jx99/3cfdz9/j2GPeV9uD2TfbV9jf2/PZR9pT36vag+BH4 i/kC+eT6cfpg/AX8Df7L/fL/3f/8ARgC/gNMBPcFega4B20ITgkuCqUKrAtZC3sMugvrDKYL1wxC C2oMgQqZC4sJiApECCcJ7wasB24FCAYBBHIEVgKfAqEAvABb/1v/F/4A/g395/wm/Pv7TPsW+4P6 QPrM+Xv5E/m5+Hv4G/jZ92v3ZPfn9in3ovYF93L2D/dy9lT3uPbJ9yr3kPj194z59/jr+m36cPwP /GP+Mf6fAKkAkwLFApUE+ARxBgQHGAjaCFcJNgp3Cn0LJgtBDIILpwxwC50M/QoiDD8KUQs7CTkK /AfTCIoGOgcYBaUFsgMnBDsCjALeABIBnf+2/2f+ZP58/XD9S/wh/Aj7vPpt+iL6u/lq+TH52fiu +FL4NvjQ98z3V/d79/f2VvfD9lL3s/a09xr3gfj29z/5sfhU+tj5oPs8+y795PzO/p3+tACwAKEC ywKPBO0EXgbvBu4HqQhOCTMKYgpvC+EK+gsVCzYM1Ar0C0gKXAtyCXYKYghHCSQH7QfDBWUGYATk BNQCMAMoAVcB6v/+/6T+mP6a/YX9ufyV/OP7uPsZ++X6b/ov+rf5b/k2+en4k/g3+BT4pvfY92X3 r/cy96b3I/fU90z3Jfic98H4NPiU+Qn5vPpD+gr8qvvL/ZT91//U/6cBxgGSA9sDaQXgBREHugdk CCUJjwl6CmQKbgvfCvcL8QoTDKQKwAsRCiALLgknCgAI3AikBloHPwXKBdoDTARnAroC/QAsAbr/ z/92/m3+e/1q/Uj8GPz++q36XPoK+rP5V/kk+cb4qfhG+Df4y/fL91n3eff29lP3xPZC96n2k/f8 9kj4vff0+Gn48/l3+TD7xvqg/E38NP76/Q0A9v/1AQ8C6gM5BNUFUQaDBy0IEAnpCVYKXQsOCykM cAudDG4LnAwBCycMVAptC1sJWwoxCBIJ1AaZB3UFEgblA1kEMAJ7As4A8wB0/3j/Qv4w/kb9MP1R /Cn8cPs9+6/6bvru+aD5R/nv+Jb4N/js93L3ovck91n31PY+97L2Pves9of37vb992D3t/gd+Kz5 IfkJ+5P6ePwc/GL+Mv6JAI8AYgKOAl4EvAQjBrMGrwdbCBMJ8AkrCisL2gr1CzgLYwwhC0sMyQrp CxcKKwsICQUKxwefCGgGIQcJBaUFmAMKBB8CcgLSAAQBev+U/2v+cP4t/Q790PuO+xv70vpV+gb6 t/lg+Rz5vfii+EX4Ifi097z3RPdy9+72Rfex9mv30vbz92T3dfjl90z5w/ha+t75rvtJ+yD91Pzj /rb+vwC/ALgC5wKqBAoFbAYBBx0I3AiOCXgKbQp4CwcLKgwxC2AM+QofDHwKkguqCbAKlAiICVoH JgjyBaMGcAT5BMYCHwNaAZEB8/8JALT+sv6j/Y/9pfyC/Ln7hPvw+rj6Kfrl+X75K/nI+Gf4E/iV 98L3Rfd19+v2Tfe59kP3p/Zy99b2zfcp92/4zfdL+bP4hPoG+ur7evu9/XL90//K/7EBwQGwA/sD jAUEBi8HzAe0CH0J9QnmCtAK4QteC34McAuYDDILWgycCr0LpgmvCnMIWwkaB98HtAVXBjgEtwSw Ag0DRgGBAeT//v+1/rb+Wv0//eb7ovsb+8v6Qvrr+Zf5PPnz+If4ePgO+Oj3c/eD9wT3IfeW9vT2 W/bd9jf2LveI9uL3R/eN+Pb3l/kR+c36UvpB/OP77/2t/dv/wP/VAegB4gMsBMMFPAahB1AISwkw CmcKaQs2C1AMnAvBDJILvAw/C2cMjwqoC5YJmgphCEcJDgfWB4IFIwbeA1MEVwKhAucADgGE/5L/ Tf45/kb9Kv1B/BP8XPsf+4v6SPq++Wf5F/m7+Fn45/ep9yb3VffS9gX3dfbr9kr2+vZT9jP3iPaq 9//2Yvi893T52/i3+iz6b/wL/Hv+U/5LAEYAXQKJAkMEmAQKBocGuAdjCDQJCgpFCj0LCgseDFsL fgxmC4gMBgstDEIKVQs0CSkK+QfPCKQGVwcxBcUFsgMkBEcCmALcAAgBov+3/0L+NP7D/I785/um +wb7uPpL+vT5mfk2+Qn5o/ht+Pv36vd093z39fYu95z2+fZQ9iL3e/ao9wv3IviI9wP5bPgT+oj5 a/v4+vr8mvzC/or+rACfALkC4wKnBPkEmQYjB2UIKwmzCZwKrQqzCzgLUAxaC3kMNgtTDLEKxAvf Cd4KxAiqCYUHTQgLBrAGcwTqBOoCOwN1AaIBFAAdANH+xP7D/af9u/yO/M37k/v9+rf6LfrW+Yn5 LvnF+Fb4CfiN96/3LPde9832JveU9h/3hfY/95/2off19jb4jfcs+Y/4Qvqw+eX7dfvg/aD9n/99 /50BqwGKA8sDWwXBBSUHtQe0CHYJ9AnbCt4K4QtfC3kMhgukDFoLfQyaCrQLrQmnCmsIQwkLB8YH mwUzBhkEjgSOAt8CIwFPAbX/vP+O/oP+KP3+/Lv7Z/vw+pr6Gvqy+W75AfnW+Gj4QfjK97j3NPdA 96326fZI9qr2APa99gv2Lvd79pb35vZY+LD3Ufm2+I36CPoO/Jn71f2D/bX/jv/KAdABzwMNBN0F UgbgB4kIUQktCoEKfQtPC2UMvAveDKgLywxaC34Mpgq3C68Jpwp0CE8JGAfWB4wFHQbZA0EEVQKW AtIA7gB//3n/VP48/i/9CP0s/Pn7R/sC+2D6Cfqt+Uv5z/hh+PP3a/eK9/32FveB9s/2L/as9vz1 rfb19eD2I/ZY95L2Gvhf9xX5Y/iQ+vj5d/wP/CP+3f0fAAgAGAIoAv8DNQThBUwGqAdACBkJ3Qk/ CigL+QoEDGYLeAx2C5MM+woSDDcKOwshCQgK5gesCJAGOwcWBZ4FkwPwAyUCYgK2ANIAh/+L/xz+ +/2k/Fz8zPuA++j6j/o3+s/5j/ku+fP4hvha+OH30/dO9133yfYG92X28vZA9jD3gPZu9772B/hZ 98z4I/jj+UT5NPup+tH8avyT/k7+lQB3AI4CowKqBPcEtQY/B0YI/QijCXgKmAqPCzILOgxRC2AM Kws9DJ8KpgvDCbgKpQiFCVwHGAjhBW8GPQSiBLMC9gIrAUoB1v/P/5z+h/58/U79dPwy/Iv7Qvuo +kr6+/mX+Rv5qPhA+K/30/dF92H3xvYV92326fY89tP2Hvb19j32R/eE9vD3L/fL+BD4JfqK+fH7 gPuR/Tb9dP9B/2sBagFyA54DRAWXBR4Howe0CGkJBArdCvcK8wt4C4AMpQu4DHELhQy+CskLwgm2 CokIXgkzB+UHtgVABiQEiASlAucCHgE5Adb/1f9T/jX+wPx2/M37dvva+m/6FPqj+WP56vi7+D/4 FfiU94P39vYK92P2nPbr9W/2tPWM9sv1v/b69TT3cvbm9yb34/gu+Bj6dfmg+xT7Y/35/FX/FP9v AV4BdAOaA5wF+wWhBzsIHAnaCVwKPwsuCyoMlQucDKQLuQxSC2UMpwqqC7AJmQqCCEkJFge7B3cF +AXzA0sEYAKQAu0A+wCt/6P/d/5U/lH9HP1U/BP8U/v8+pr6N/qd+Sv5o/gR+CP4kPeW9/b2J/eG 9tv2L/aj9uj1nfbY9cD27fU592r24PcS9xD5Ufiv+hn6Kfyr+/X9nP3h/7D/4QHkAcUD5QO6BREG eAf/B/UIpgkgCgEL3QrVC00LUAxWC2cM2wrjCxgKBQsJCdoJzQeFCGEG/wbdBFAFagOzA+IBCAKT AJ4AGf8B/4P9P/2J/DX8kfsu+8b6XPoW+qf5bfn1+Mb4R/g1+K73rfcV9zL3ivbw9jj25fYp9vv2 OPZG94L2y/cP96H45Peu+fv4BPti+qP8I/xu/hL+cwBIAHICdgKTBM0EpwYaBzsI2AifCWkKlgqA Cx0LEgxaC1sMMQs1DKcKngvLCbEKqAhuCUsH9ge1BTcGKQR8BI4CuQITASABwf+0/3T+Uv5H/Qb9 Sfz9+1L77/qJ+h/6nPki+ZD4+fci+Ij3mff19jj3jPbU9h72r/by9Yz2wPWz9uL1Avco9qv32faB +LD35/k1+bX7KvtT/eL8Rv8A/z0BJAErAzsDKQVsBRAHgwesCE0JBwrWCvQK4AuUC5cM1QvjDIIL jAzTCtAL3Am+CqwIbglGB+sHvwVBBjoEkQSfAtECLwFDAZ7/h//v/av92PyB/ML7Vfve+mn6B/qH +WH53/ij+BT4C/h092v3xPbq9jL2cvav9UD2d/VP9oH1gPao9fD2FPac98P2kPjB9835EvlW+7H6 Gf2W/Bn/xv4fAfwAWQNwA5sF8AVVB90H/wisCSwKAAv6CuMLfAtzDJMLlQw6CzsMlwqNC5wJdgpv CCkJ9gaNB3EF3gXdAyIEWAJ8AvUAAgGm/4//Xv4w/k79DP1A/Or7ZfsC+2H67fk6+af4tPge+BT4 dveb9/T2Hvdq9tX2FvaI9sP1g/au9aD2wfUX9zX2sffR9uD4E/h++tH58/tY+7z9Vf2c/1r/igFt AYoDoAODBckFQQe6B84IdwnoCbQKyQqtC0ULOgwxCywMuwqvC/IJ1grtCLUJtQdaCEAGxAbJBC4F QwN8A+UB+AFNAEIArv50/pL9Qf19/BX8l/so+8P6S/oh+qb5bfnp+M/4Rfgx+J33qfcD9y/3fPbj 9iL22vYR9u32F/Y692P2uffk9n34r/eK+cz46vo7+oX88vtn/gD+TQATAHoCdAK4BO0EiwbuBjgI zgiRCU4KeQpLCx0LCwxcC08MLwsoDKoKlAvOCacKpghhCUYH4we5BSsGJgRuBIsCrAIUAQ4BwP+k /3D+Ov4+/fL8Qvzl+z/7y/p++gv6f/n2+Hz41fcJ+F73fvfO9hH3WPa69vn1dfap9V/2ifVv9ov1 0fbq9Vn3dPZw+Jz3/flE+WD7vfom/av8BP+p/vYAxgABAwIDDwVGBfMGXQenCEEJBArDChUL/QvU C9MM8Av4DLULuAwKC/oLFgr3CugIqAmKBysI/wV1BnsEzATfAg8DegGHAdz/wP8z/uz9GP29/AH8 k/sZ+6D6UfrS+Yz5BPnX+EX4K/iR94T31fbw9jb2gPay9Uf2cPUx9lH1WvZz9bj2zPVY93D2RPhf 94T5rfj++kP6zPw7/LH+Sf7mALIAPgNJAzEFawURB4MHpAg9CdIJjQq/CpILSgsyDGwLWgwjCxQM gApnC44JWwphCBIJ8wZ/B3MF2AXeAxwEZwJ+AgsBBgG6/5f/df5A/mv9Hv1e/AD8lPsv+4X6Cfpn +c344/hN+EP4ovfC9xL3SPeV9ur2Jvah9tX1g/as9bX2zvUG9xX21vf29iz5YvhO+pb56/tM+5X9 GP1n/w7/ZwE5AXMDeANbBZUFJweVB6sIQQnlCaQK0wquCyMLEAwcCw4MpQqNC+IJtwrSCJIJmQc3 CC0GqAazBAMFJQNTA8YB0gEyABQAkv5K/nv9H/1l/Pb7ivsQ+8f6TPoU+pD5Z/nV+Mb4MPgk+IL3 o/fz9iv3b/bo9iL2zfb/9eb2DPYo90n2svfR9nH4l/eJ+b342/of+on88PtU/uL9dAA3AMgCwAK1 BOUEnwb/BkoI2QipCWgKkQphC0cLMgyFC3cMZQtRDNQKvQv0CccK0giOCWQHAQjfBUkGQQSCBKwC zwJBAUIB0v+3/3/+RP5a/Qz9OvzY+2v7+/pO+sv5K/mE+Kb4APgB+FP3gffX9hH3WPav9uX1YfaL 9TX2VfVP9mT1jfab9VH3aPaC+LX3nvnY+B77d/rL/Ef8tv5P/pwAWQC3Aq0CxQTrBLQGFAduCAIJ 0gmHCu8KyguvC6gMzAvMDJkLmAz6CuoLEArpCuIIqAl+ByMIDQaFBn8EzAQIAzEDZgFpAar/gP93 /jL+QP3i/ET83vtn+/f6m/od+sz5RvkY+Yz4WPjB97/3FPcd92P2sPbi9XD2mvVZ9nr1bPaH9cr2 3fVa93H2Qvhc92T5jvjt+jL6m/z/+7D+RP74AMsA9QL7AvYELQXNBjcHZQj8CJEJQQqEClMLCwv2 Cy0LGQzuCtsLRQokC2QJMAozCOAI0wZaB1cFtAXUAxAEbwKPAg0BCwHD/57/m/5j/nX9K/2f/Ef8 ivsb+1n6zfnD+TT5G/mB+I/49PcO+GX3jffZ9iX3a/bS9g32vvbj9cL23vVM92b2Ofht9x75UPhZ +qX5zvsy+4r9DP1L//D+TgEgAVADVwNEBX4FDQd5B4gIIAnTCYkKuAqSCwsL8wsFC/ILnAqBC9oJ qgrTCIwJlwczCDUGsAa0BAUFTQOAA7oBxwEQAOv/1f6Y/qT9UP2s/Ev84vtz+xr7pPpe+uX5t/k1 +RD5ivh7+OT35fdD92X3s/Yq9272/fY39gz3PfZG9272vPfq9nX4nveB+br4yPoY+nP83fsw/r/9 TwAMAJUCkQJ8BKUEZwbGBgoIkQhUCfwJYgouCxQL9QtaC0gMOwsnDK4KjgveCbEKuwh0CVYH7QfP BTwGQgSIBNIC9wJSAVYB6v/N/63+ev5//TD9jPwu/GT78/ok+o75kPn5+N74Q/hZ+Lj3yfcb92H3 tPbp9iv2ovbb9Wn2kfWG9qD1sPbG9Wr3jvaT+Mz3pvnn+CL7fPrB/Dn8jf4e/ocATACdApMCqATP BJoG+AY/CM0IvAl3CuUKxwtyC2wMpwurDG0LZQzTCr4L7wnICsYIgglvBwoI8AVjBngEwwTeAgID GwETAcH/mv9z/jP+X/0F/W78DfyQ+yT7ufpC+gX6hPk8+bX4l/gC+OL3P/c594D25fYi9pf2x/V9 9qj1mPa09eT2A/Z094r2Ufh293P5p/j5+kT6ofwK/LH+Sf7yAMwA5wLqAuwEJgW7BicHNQjECIUJ Nwp6Ck4LAAvsCy0LIAzfCs4LUwo2C2cJOwo0COUIzAZVB1gFvQXvAzcEegKgAg8BFgHU/73/mP5o /p/9Yf2A/CT8Nvu1+pn6Gfrj+V35UfnD+Lf4I/g/+KT3sfcL91H3mvb99jT24/YU9uT2BfZs94n2 V/iL9y35avhx+sH53/tL+4r9EP1l/xD/ZQFAAWMDcANfBaAFGgeJB7YIUgkGCssKxwqqCyILHAwZ Cw8MpQqRC+sJxwrlCKkJqgdPCD8GwQbUBDUFPwNzA44BnAExABgA5P64/sn9fv3M/HD8A/yi+zT7 xfqE+g/61flb+SX5oPiU+AP49PdT9233t/Yo92/2+fYv9vr2KPYr91j2lPfA9kr4dfdM+YP4pPry +Sb8jvsb/q/9UwAlAD0CNgJIBHQEGgZ0Bq0HLggcCcYJOAoGC+gKzAtBCzIMJQseDKsKmQvwCdAK wgiHCXIHDwjzBWkGeATKBAwDQQOeAbEBPAAwAAv/5P7e/Zz9/Py1/NH7cfuk+h36EvqN+Vz51fjT +Er4Tvi898n3LfdT96n28vY19rv28vWq9tH1Cfcv9tL3CveE+Lf3pfns+PT6TfqC/PL7Rf7Z/T8A AwBCAjcCSgR3BCIGfgbtB3kIcAksCmkKPwsCC/QLOws1DP4K8Qt3CmILmglzCokIRAk3B9MH3AVT BkwEmASnAs0CQAFCAez/0f/D/o3+uv1x/ef8lPwK/K77SPvh+pL6MvrZ+Wn5PvnI+I34Afjh90T3 ivfj9jv3hvYX91z2KPdf9mL3kPbn9xP3sPjj99n5Ivkm+4D68/x2/BH/y/7uAM8A9AIDA88EDwVz BtoGBgiYCE4JCQo1CgsLvAqqC9wK0AufCpMLFgoCCxUJ6AnuB6QIhgYWByMFjAW/AwUEVAJ9AvcA /QDJ/7P/mf5q/rr9g/2X/EP8afv3+tb6Zvos+rH5oPkl+R35mviW+A74FPiD96f3BPdb96/2LPds 9mL3m/b/90P3jfjO93v5zfig+vn5Afxy+6T9N/2C/zj/bgFVAW4DiQNPBaAFIwegB8YIeAnhCbQK qAqWCwIL/Qv+CvwLiwp7C9oJtgrLCJMJmQdECC8GuQbMBDQFNwN4A5ABoQE+AC0A9/7K/uL9o/3/ /Lz8JPzT+2D7APus+kf68vmG+WL56vit+CX4/fdl96P3BfdS96j2Ifdu9h33YvZF94D2rPfh9lP4 g/dW+Zv4j/rp+Uj8xPtZ/v/9KQD5/yYCKAIgBFYE/QVbBocHCwgDCbUJFgrwCtUKygs1CzUMFQsY DLEKqQv2CeQK1gimCYgHNAgdBqcGvQQmBUEDggPTAfQBiwCKAEn/LP9N/iT+Gv3X/Mv7b/si+8L6 b/r9+dr5Yfk++cX4q/gz+Bv4lPel9w73QPeU9vn2PPYB90H2e/e99t/3IPes+PL3q/n5+O76Vvpx /PD7Q/7k/SQA7/8wAiwCIgRQBBMGewbgB3sIMgn5CTgKHQvUCs4LDAsQDNIK0QtXCksLgQlmCm0I PgksB9UH1wVcBlgEtgTAAvICagF6ARQABwD5/tn+BP7X/R796fxK/AX8kftB+8f6cfor+s35X/n0 +Jv4Gfgo+KD3u/cj92f3xfZA95T2Nvd/9nP3svbl9yD3tfj39735CvlB+7H6IP2+/Nn+mP7JALAA uwLQAp8E5QRFBqsG2gdyCCIJ4gkOCu0KoAqWC74KvQuRCpILCwoACx0J+wn3B7gIpgZBB1AFzwXo A0IEfAK3AjUBSgHw/+f/8f7d/rb9hf1u/Bj8wftm+//6ofpj+gT60fls+Tv50vit+DX4H/ie97H3 G/dQ96L2PveI9oX30PbN9xb3aPi290L5lPhn+sn5u/su+1798vws/+v+IQELASIDPwP+BE8F2AZa B3YILAmSCWoKbQpfC8oKywvFCsULdQpzC8sJtgrVCLAJrQdmCFwG7gboBFgFTQOVA+YBCQKGAIgA Uf9C/1D+KP5Y/Sb9c/ww/LT7avvw+pv6SPrt+Xn5D/me+B34Nfi098D3MPdr9872JPd/9iL3c/Y6 93/2nvfg9j74gPdD+Zj4cfrP+Sr8qPss/uH99v/L//8BBwLlAyEEqAUOBlsH7wfYCJEJ/QnYCsAK vgsOCxoMHQsuDM0K2wsCCvoK+QjVCcAHeQhrBg8HBAV5BYAD1AMhAlQCugDQAJ7/n/9O/in+5fyf /Bb8yPs8++T6lfox+ur5hflI+eD4rPgy+BP4k/eO9/32Gvd19u72PfYM91z2PveF9r33Bfd5+ML3 gfnZ+MT6K/pR/NX7Gf7G/QwA3f8YAiICCgRKBAQGeAbgB4gINgkLCkYKNgvrCvQLKAs3DA4LHQyV CpwLzAm+CsAImwmDBz0IHga2BpIE/gQdA2UDqQHKAWEAagA8/zL/Jf4M/in9AP1L/BP8cPsq+7P6 Z/rR+XL54Phd+F/43/fP90D3aPfO9gf3Yvbk9jP22PYb9hn3VfaK98L2Yvih92r5s/j3+mX64fx6 /Jj+Uv6ZAIAAigKeAmIEoAQ2BqgG1Qd6CCoJ+gk1CiILxgrKCxMLIgz9Cg8MZQpxC4cJegpyCEIJ NgfpB9kFbAZrBNoEBQNVA6MB0wF0AIgAFv8J/6L9cv3K/Iz84PuS+yX71/pv+hH60vl1+Rz5tviK +Bj47Pdn93b33PYI92H2+vZH9jP3fvZ798H2Efhc9+b4O/gE+mT5Y/vW+gz9nvzb/pj+2ADGAMwC 5wLUBCQFxAZPBz8I8gh7CVUKUgpFC74KuwvXCuALmQqgC/wJ8woXCfoJ+wfGCK0GVwcyBbQFxAMc BE0CiQL5ABEBvP+2/7f+r/6m/Yb90Pyi/Ov7rPsu++76R/r1+Uj52fjO+Fz4PvjD98z3Rvdj9872 M/eV9hL3YvYw93z2hvfL9jz4gvcb+W/4gfrx+VD85vvh/ZL9yf+s/6oBtQGMA7cDYwW8BSQHuQeC CDoJuwmcCmAKWAvZCuAL7QoDDIQKiwvNCcQK1Qi4CcQHjwiGBjMHRAXMBQEEZQTAAggDrgHgAYEA kwAo/x3/d/5h/rb9lf0k/Qj9l/x5/DT8G/yx+5H7RPsc+8z6nfpq+jT6DvrE+eX5mPn6+af5Dfq1 +V/6APrH+mT6cPsW+zn83/tL/f/8Zf4w/r3/of/0APYAYQKLAsADCgTBBC0FmQUYBjcGywZ7Bg4H qAZAB4gGHgc6BsEGsgUyBhAFfwVPBKgEdQPAA6MCzwLZAe8BJwEsAY4AkAAwADMAy//J/4D/hf9A /1P/BP8U/+z+Cv+N/qr+GP4u/hT+Mv7e/QH+tf3U/Y79p/1U/Wr9MP04/Rr9DP0m/Rf9Nv0g/af9 kP1W/kz+xP63/l//W/////7/jQCTADgBUAHgAQACcQKgAu4CKwM+A38DbgO5A5cD5wNoA6wDIgNb A7kC5wJNAm4C3AH1AW4BcwH8APkArAChAFkARAA6ACwA5v/R/3b/Xf+X/5P/nP+k/7z/2v/d/w0A 8f8yAOv/NgDa/y0Atv8KAIn/2f9i/7D/Uf+X/x7/YP8A/zT/4P4F/9H+5v7S/tr+6f7s/hX/Cv9V /0n/ov+Z/wgABACPAKAAxgDXAAIBFwEZAS8BFgEgARQBGQH/AAcB0wDPAJcAiQBbAEIAEADp/8n/ mP98/z//Tf8L/yr/5/4l/+7+T/8h/3f/U/+o/5z/9P///yoAQwCFALcAjgDTAG0AsQC3ABEByQAw AdMARQHOAEIBqwAaAX0A4ABBAJoAGQBmAN7/IADm/yQAIwBbAAoAMAAlAEYALgBJADMASQBbAGoA hwCcAKgAwADJAOsA3QD7AOwACwH3ABkBzQDoAKYAuABkAHAAKQArAPf/8P/F/7f/mP+D/3f/Yf9b /z//Zv9R/1T/OP8o/wn/X/9M/4H/f/+4/8X/9/8WAB4ASQA6AHMATACKAEwAiwA/AIIAMABwAC8A agAUAEgA+v8uAOP/DwDN/+7/uv/M/7z/xP+7/8X/2f/h//3/CgAxAEAAbQCCAJUAtgC6AN0A2wAD AewAHAHeAAcB6AASAdYACQHAAPIApADMAHkAmwBQAG0AIwA6AP7/CQDS/9z/vf+//8b/zP/A/8X/ xP/J/8j/z//K/9T/4P/x/9f/6//F/9X/3f/1/93/+//d//v/1v/4/8D/5P+r/8H/jf+a/3P/fP9d /2X/YP9f/3T/dv9u/2r/fv96/5b/lP+w/67/uP+y/+n/8f8SACEAQQBdAGcAjQCDALEAkwDCAJ0A 0ACUAMgAhgC5AHEAowBgAJAAPwBmACYASQAJACgA8v8GAOH/7P/Q/9j/wf/H/8L/yv/G/8//1f/b /+z////x/wUA8v8JAPP/CADi//T/1//i/9D/1P/M/9H/tf+0/6v/ov+U/4n/hv95/3//aP97/2b/ gv9o/5T/gv+3/6r/1f/I/+b/5P8QABwALABCAFUAcQBrAJAAYwCHAHQAowB+ALQAcACtAGoApABL AHwANwBmAB8ASQD9/yUA4f///8j/4v/L/+X/vP/N/7P/xf+u/7//pf+z/7H/uv+u/7v/r/+4/7X/ wv+8/8b/vP/M/8f/1f+9/8r/tf/C/6z/tP+m/63/nv+c/6n/pv+y/7T/tf+2/8P/wP/T/9T/5//q /+7/7v8LABAAJAA5AEQAXQBgAH4AcgCbAHwAqAB+AKQAgQCuAHEAmQBkAIoATwB4AD8AZAAhAD8A CQAmAPP/CQDd/+n/x//M/7H/uv+g/6L/mv+d/5n/n/+h/6X/n/+n/6D/q/+d/6v/mv+k/5D/mP+M /5v/jP+V/4n/lf+F/5H/gf+I/37/f/9//4H/gv+D/4b/hP+S/47/rv+t/7//wf/Y/97/8P/1/wcA FQAaACsAMABFADwATgBSAGUAXQB2AGMAewBiAH8AWAB3AFUAcABRAGMAQABTADQATAAqADsAJwA4 ABoAJQAXACEAEwAeAAoAFgACAAwAAwAPAPb/AQD8/w0A9/8IAPj/DwDu/wcA5v/9/9n/7P/P/+P/ vv/M/7D/w/+f/6v/n/+j/5b/nv+N/5X/i/+O/4f/h/+I/4D/jf+I/5j/lP+i/6P/rf+z/7H/t/+1 /7r/u//H/77/xf/A/8D/vf++/7//u/+4/7n/tv+x/7P/rv+3/6r/sv+m/7f/sv+7/6//wf+8/83/ yv/g/9z/5v/p//j//v8DAA0AFgAnAB4AMAAmADYAKAA8AC0ARAAxAEkALgBHACoAQQAmAD0AHQA0 ABMAKQAOACAAAAAQAAIADAD7/wQA9//8//b/+//q//P/5//s/97/4v/V/9n/yv/R/8j/yP+7/7v/ sf+1/6P/pP+Y/5n/jf+M/4H/ff96/3H/cP9k/2z/Yf9s/1z/bP9b/3D/Yv9z/2L/fP9t/4L/ev+I /4H/mv+V/6r/qP+4/7r/yP/O/9L/1//e/+r/6P/z/+//+//5/wIAAgALAAcAEAAUACAAGQAnACEA KwAnADAALAA3ACwANwA1AD8AOQBCADwASwA9AEcAOgBLADkARwAzAD4AJgAvAB0AKQASABoABQAR APr/AQDn//H/2f/d/8//0f/B/8P/uf+z/6f/pP+g/53/nP+X/5f/kv+X/47/lf+N/4//i/+O/4n/ jP+E/47/iv+O/4j/jv+K/47/j/+R/5H/kv+U/5j/mv+d/5n/of+b/6T/of+x/6z/uf+1/8D/u//O /8r/1P/Z/93/3v/u/+3/7//w////BAAGABAADgAbABcAJAAfACsAIQAsACgANgAtADgAKwA3ACUA NQAnAC8AKgAzACYALQAhACoAHAAjABsAHAAVABgAFAAVAAkACwAJAAkA/v8DAPz/+f/t//D/5f/h /9r/1P/P/87/yP+//7b/sv+t/6X/pP+Y/53/jP+T/4L/i/95/4n/eP+E/3L/hP90/4X/cv+I/3b/ iv96/43/fv+M/4j/k/+P/5v/lP+k/5v/rP+n/7L/sf+//7n/yf/D/9D/y//Z/93/4f/e/+v/7//s //P/+//4/wQABgALAAsAEwASAB4AHgAhACUAIQApACoALAAtADAALwAxADIAOAAyADYAMAAyACkA LAAnACoAJQAmAB4AGQARAAwADAAKAAQA+//6//P/8f/o/+P/2v/b/87/1f/M/8X/uf++/7f/t/+s /7P/pv+q/5v/o/+b/5n/lv+X/4n/kv+I/4j/e/+I/3z/jP97/4j/ef+H/3b/h/95/5b/iP+R/4P/ m/+O/6f/m/+1/6r/vP+5/8j/wf/U/9D/3//a/+//7P/4//f/BAAGABAAEQAZAB0AKgAsADAANQA8 AEEAQABDAEcATgBQAFMAUABYAFMAWwBYAFkAWABbAFEAWgBRAFcATgBWAEYARwA/AEAALwA2ACoA LQAeABsAEAAUAP/////y/+//5P/d/9b/zf/I/73/tv+p/6f/m/+b/4//kP94/4T/cf96/2n/ev9n /3L/Yf9x/1//cf9h/3X/Y/90/2b/gP9u/4r/eP+P/4L/lf+K/6X/l/+w/6P/tP+v/8L/uv/Z/83/ 2//T/+j/4v/y/+v/BAD9/wsABgAZABAAHAAaACYAIwAsACgAMwAyADYANAA3ADcAPAA7ADwAQAA6 AD0APAA4ADgANAAyAC8ALgApACIAHwAfABsAGwAWABIADQAQAAYACwD//wkA+//+//n//P/y//f/ 7f/y/+r/6f/g/+j/3v/j/9n/4//b/+D/1P/d/9P/1f/L/9T/y//N/8X/zv/E/8r/v//G/7v/xv+2 /8D/sv++/6v/v/+s/7n/rf+5/6j/t/+q/7f/qv+5/6j/tv+s/7f/pP+5/6n/tv+q/7r/q/++/63/ xf+y/8L/tv/L/7z/0v/C/9j/x//k/9L/6//f//L/6//+//v/CgABABMAEQAiABkAMwApADYAMQA+ AD4AQgBIAEYARgBNAE0AUABMAFIATgBSAFUAUABMAEsATABGAD8AQgA/ADcAMgAqACUAIwAiABsA FgAQAAsABQD9//b/8f/q/97/4f/X/9T/w//E/7T/vP+x/7D/of+s/53/nv+S/53/jv+X/4n/lv+E /5T/gP+W/4D/lv+F/53/i/+m/5L/rv+c/7X/qv/B/7j/yv++/9n/0f/j/9v/8v/w//7/+f8RAA0A GwAaACQAIgAyACwAOAA5AD0AQgBHAEEASwBNAFAATwBTAFEAUABUAFMAUQBXAFcATgBNAEkASABE AEQAPwA9ADYAMwAsACkAJgAhABsAFwASAAUACQAFAP3/9v/w/+f/5P/f/+D/1//W/83/0//K/87/ v//J/7r/xP+2/8X/tf/D/7b/wf+2/7//tv/E/7f/yP/B/8j/v//L/8H/z//C/9D/y//c/9D/3v/X /+T/1//k/9f/5v/b//D/4v/1/+n/+f/v/wIA9f8GAP7/DwAEABMADAAeABsAIgAjACcAJQAvACoA MwAvADoAMQA7ADwAPQA8ADgAOwA9ADwANgA7ADoAMwA4ADQAOAA1AD0ANwA3ADAAMgAvADAALgAx ACsALgAqAC0AJQApACIAJQAdACAAHwAdABMAGAAKABIACQANAP3/AwD7//7/9f/2/+v/7v/n/+v/ 3f/n/9X/3f/N/9P/xP/O/8L/yv+8/8j/u//P/7z/zv/F/83/wf/O/8L/1P/E/9P/xf/R/8b/1//M /+H/0//m/9b/7v/h//X/7v////f/BgD//xAACAAbABQAJAAbADUALQBGAEMATABIAFUAVQBpAGcA dgB3AIAAgACIAIkAkACVAJIAlACXAJcAlgCgAJoAogCgAKYAngClAKMAqACZAJsAjwCTAIsAhwB7 AHsAdQB0AGcAZgBdAFsAUABQADoAPAAuACgAHQAWAAgAAAD4//L/8P/o/+T/2//Z/8v/yv+9/8T/ tP+2/6v/tv+p/7P/pP+x/6T/rf+h/7X/qf+7/63/wf+1/8z/wP/R/8T/2//Q/+z/4v/6//D/AwD8 /xcAEgAuACgAPgA/AE8AUABjAGIAbgBuAIAAfQCKAJIAkwCfAKAAqACpALAArwC1ALIAuwCzALwA tAC8ALgAwQCxALwArwC5AKkAsQChAK8AlACbAIEAhQB5AIAAaQB1AFwAZABNAFIAOwBCADEALgAd ABkACwAJAP//+//8//L/9v/p//b/6v/q/97/2//V/97/1//f/9f/3P/S/+D/1v/d/9P/2//R/+X/ 3P/o/+T/8P/o//b/8//6//j/BAD+/wcA+/8WAA4AHgAYAC0AKQAxADUAPgA8AEQARQBHAEkAUQBV AGEAZABpAHIAdQB9AHoAgACBAIIAeQCDAIgAjwCLAJUAkgCaAJMAnQCWAKAAmgCfAJ0ApgCdAKIA mACfAJIAmACXAKQAlACcAJcAmwCNAJsAjwCTAIIAiQB8AH4AcQBxAGcAbABZAFkAVgBTAEgASQA6 ADsAMAAuACgAJQAaABUADwAKAAYA/P/5//L/5//j/+X/3f/f/9f/4f/W/9//zv/h/9b/3//Y/+T/ 2f/i/9v/5f/a/+f/3P/x/+b/9v/s/wIA/P8PAAkAHgAaACYAJQA/AEEAUwBSAGIAYgB1AHwAgwCL AJUApgCqALcAtQDHAMUA0QDPANkA2ADkANsA7ADiAPgA4wD6AOkA+wDlAPQA4gDyANoA5wDLAN0A vwDNALYAwQCiAKwAlwCiAI4AlwB/AIcAawBuAFwAYQA/AEMALgAuAB0AHAAIAA0A/P/6//L/7P/g /93/2v/Q/9L/xv/H/73/xv/D/8X/wP/E/7//0P/K/8//zP/W/83/3//X/+j/4v/z//D/BgALABkA HwAlACwAMAA3AEIATwBRAF8AZgBwAHQAfgCEAJUAjwChAJ0AsACsAMAAugDNAMAA1ADOAOIA0wDn AN8A9wDkAPgA6QD6AOgA/wDgAPgA3gDzANgA7wDMAOMAxgDbAL0AzQCtAL0AnQCqAJAAnwB8AIkA cwB8AGEAYgBSAFYARQBHAEAAQAAxADYAJwAoABwAHwASAA4ABgAIAAYABgD+//z//P/5//n//f/3 //f/7//t//P/7f/t/+//8v/0//L/8f/1//P//f/6/wgACQAOAA4AGwAgAC4AMgA1ADsAPwBEAE4A WQBUAFsAZQBtAHYAgAB7AIgAhgCWAJAAngCaAKYAowC1AKgAwQC8AM8AxQDaAMUA3ADOAOMAzADd AM0A5QDNAN4AzQDiAM4A4wDGAN0AwQDbAL4A0wCyAMMAqgC4AKMArQCMAJwAhgCTAHgAgwBnAG8A XABfAFMAVABFAEcAOQA9ACoAMwAeACEAFQATAAwACwD4//n/8v/u/+z/5v/n/+n/5v/p/+r/6//q /+z/6//q/+r/7P/s//D/9f/z//n//P8BAAkAFQAbABgAGQAiACUALwAzADwAQwBJAFEAVwBkAG0A eQB/AI8AjgCjAKMAugCxAMQAuADPAMAA1wDCAN0A0QDqANEA7ADQAOsA1ADtANQA7wDSAOoA2QDx ANAA5gDJAOAAwgDaALwA0ACmAMEAngCxAIoAnACBAJAAawB7AF8AcQBTAGIAPABHAC8ANQAYACIA CwASAP3/BQDx//T/4f/m/9j/3//N/9H/w//K/8D/xv+7/77/v//A/8T/xf/L/8r/1P/Y/+T/5v/x //L/+f8BAAMADwAXACYAKwAxADoASwBSAGQAYgByAHAAgQCCAJUAjgCjAKIAuwC0AM0AvADUAMYA 3wDNAOoA2QDzAOYAAAHoAAYB7gAJAfAACgHpAAUB5AACAeUAAAHZAPQA0ADtAMQA3AC2AM8AqQC/ AJYAqwCCAJcAbgCFAF4AawBPAF0APgBJACgALQAXAB4ACwASAPv/AQDx//T/5v/u/93/4f/H/8f/ xP/D/7f/uP+5/7f/tf+0/7f/tf+4/7j/uf+6/7v/vv/L/87/0v/W/9//4v/p/+//+v8DAAcADQAb ACQAJgA0ADkASgBJAFkAXwBuAHIAhQCAAJUAlgCpAJkAsQCgALsArQDIAKwAxgC2AM8AvgDYAMQA 3QDEANwAxQDjAMAA3wC9AN0AugDWALEAyQCmAMEAmgC0AIwApQCDAJkAdACIAGcAeABSAGEAPwBM AC0ANQAYACYAAwALAPT//f/m/+z/1v/V/8f/wv+6/7f/rv+r/6X/pf+Z/5r/nf+U/5r/mf+Z/5r/ n/+e/6P/o/+r/6b/sv+y/7X/u//G/8n/zv/O/93/4//k//D/9f///wEABwAUABwAGgApADIAQABA AE4AUgBpAGIAegB5AI0AggCWAJYAqgCZALMAowC6AKwAxACpAMcArwDKALAAygCuAMkArwDKAKEA uwCdALgAmgCzAI8AqgCDAJoAegCPAGYAeABhAHIAVABjAEwAWgA6AEcAKgA5ABwAKgAMABMA/v8I APT//P/p/+3/4P/o/9j/4f/O/9P/w//M/77/yf+6/77/vP++/7f/uP+9/8L/uv+8/73/xP/D/8f/ zv/P/9P/1//a/+L/4f/p/+r/9P/x//7//P8IAAgAEwATAB4AGAAnACcANgAvADoAOABFADwAUgBD AFoATwBfAFcAagBkAHMAawB+AGwAfwB0AIUAcwCIAHsAjAB8AJAAegCOAHYAiQB5AIwAbgCCAGkA ewBfAG8AVABiAEkAWQA7AEkAKwA2ACQALwAVAB0ACQASAPz/BgD1/wAA5v/q/9j/3v/S/9P/x//K /77/v/++/73/s/+6/63/sv+r/7H/q/+p/6P/pf+k/6T/of+j/6L/nv+k/6T/r/+s/7T/sf+8/73/ wv/G/8z/0P/Y/+D/5P/l/+z/8//5/wgACAATABcAIAAlAC0AMAA8ADoASgBGAFMAUgBcAFYAZwBa AGwAYgByAGQAeABtAH4AbgB3AGkAegBrAHgAZwB5AGUAdwBgAGsAVQBjAE8AXABDAFEAPABGAC0A NgAZACYADQAZAAEACAD3//j/5f/r/9X/2//I/8r/t/+4/6v/qP+f/57/lv+T/4T/hP+C/4D/fP91 /33/cv95/3H/dP9w/3T/cP95/3H/c/93/3z/d/+B/3//iv+H/5L/jv+a/5v/p/+n/7P/sf/A/8b/ 0f/S/93/4//w//T///8CAA0AHAAjADEAOgBDAEkAVgBXAGcAZwB5AG4AgQB2AIsAfwCWAIgAmQCM AKAAjQCgAI8AoACKAJ4AhwCdAIAAlwB1AIsAbgB9AF0AbQBQAGEAQgBNADEAPAAeACgACQARAPX/ /P/m/+v/zv/T/7r/vP+n/6X/kf+P/33/ev9q/2L/Xf9S/07/Qv89/zD/Mv8i/yn/Hv8h/xX/I/8R /yv/GP8w/yD/Of8l/z3/Lv9I/0D/X/9T/2//Zv+E/3T/lP+F/6X/n/+8/7v/0f/T/+f/7P/9/wQA GAAaACkAMABAAEcAUABbAGUAdgB7AJMAiQCgAJgArQCjALQApgDBAK0AxgCtAMkArQC/AKMAuwCc ALYAkwCjAIUAlQByAIEAWgBsAEMATwAwAD4AGAAcAPz/AQDp/+v/1P/P/7r/tP+n/6T/kf+H/3j/ c/9r/2D/WP9N/0v/Qf89/yv/N/8j/y//HP8q/xb/KP8V/yb/EP8o/xX/J/8a/y//Hf87/yT/S/86 /1b/S/9s/2D/fP91/5b/jP+n/5//vv+2/9P/zv/u/+v/+//6/wsADQAhACMAKgAuADUAQABGAE8A UABcAFYAYwBaAGoAYwBxAGUAcgBtAHwAcAB6AGsAfwBsAH0AawB3AGYAbwBgAGgAVwBhAE4AWgA+ AE0ANgA/ACAAJwARABcAAwAGAPT/9v/f/97/zv/L/7r/t/+q/6f/mf+S/4z/h/98/3L/a/9e/2L/ U/9a/0z/Tv9C/0v/P/9E/zb/R/85/0L/M/9J/zr/Rf83/0z/PP9K/z7/VP9D/1r/S/9i/1j/a/9g /3r/cv+F/4D/mf+Q/6j/nv+8/7X/yv/F/+T/4//3//b/CQAHABYAHgAlAC4AMgA8AEEASgBPAFcA UwBYAFkAXwBcAGIAXgBlAF8AZgBdAGEAVgBbAEwAUQBHAEYAOQBAAC4AMAAgAB4AEwARAAgAAgD6 /+7/3//W/8//x/+6/7D/qP+Y/5D/hP96/2v/Zf9S/1X/Qf9E/y3/Mv8g/yn/Ef8f/wf/E//4/hP/ +/4U//r+GP8B/xz/B/8r/xT/Mv8g/0H/LP9M/0D/YP9O/2X/Wf9//2//i/9//5r/lf+w/6L/wP+2 /8f/w//b/9j/6f/n//f/+/8HAAYAFwAcACgAKQAzADgAPgA/AEMASABKAFEATwBUAFEAUgBQAFUA SwBSAEgASQBBAEUAPgA/AC4ALgAiAB8AEQAQAAUAAADw/+z/4v/a/9b/x//L/7z/vv+u/7L/pf+f /47/j/+C/4T/df97/2f/cv9c/2b/Vf9d/0v/VP9G/0r/Pf9D/zH/Qf8v/z3/I/82/yH/Of8l/zb/ Jf89/yf/Q/8t/0v/NP9R/0P/XP9S/2v/XP96/2j/hv95/5b/if+j/5j/sf+o/77/t//L/8X/2//U /+f/3//u/+n/+//2/wYA/v8NAAgAFgAQACMAHgAqACQAMgAwAC8ALgA2ADUAOQA2AD0APwA8ADoA PQA8ADAANAAvAC4AKQAiAB4AFwASAAsABgD+//P/6v/l/9r/0f/I/8H/tP+y/6D/oP+Q/47/gP98 /2j/bf9X/2b/Tv9a/z3/Uf87/0j/Mf9B/yb/PP8f/zr/H/8z/xj/Lf8a/zD/Fv8t/xH/Mv8V/zj/ Hv89/yf/R/8r/1T/PP9d/0j/a/9V/3n/Z/+N/3j/of+P/7L/o//D/7P/2P/J/+v/3P/8/+3/CgAD ABUAEAAhABgAKwAfADMAKAA8ADEAQwA6AEAAPgBDAEEAQwBCAEEAPgA7ADYANwA0ADYAMQAuACUA IQAbABkADgAFAAAA9v/q/+P/2P/T/8X/vv+v/6r/mv+W/4L/f/9r/2//Vf9Y/z//Rv8u/zj/GP8p /wf/Hv8B/x7//v4a//j+Gv/6/iL/Bf8i/wb/M/8V/zv/Hv9F/yn/W/87/2P/Sv92/2D/gf9o/43/ ff+d/4z/rf+c/77/q//M/73/2v/Q/+3/3v////H/FQAHACQAFwAxACkAQwA/AEwATwBZAFcAZABi AGUAaQBpAHEAaQBuAGUAZwBfAGIAXABfAE8ATAA6ADsAKQApABkADwAEAPz/8f/l/9//0P/Q/7X/ vP+o/6L/k/+R/3//gv9s/3X/W/9k/0r/Wf89/0n/Lv8+/yX/Nf8V/yr/Ef8n/wj/If8B/yX/Bv8o /wX/KP8I/yf/BP8v/wv/Qf8f/1L/Lv9d/0D/cP9Q/4L/ZP+V/3j/pP+S/7f/p//M/7r/3f/J/+b/ 1f/y/+L//f/y/wkA/f8MAAMAGAALABwAFgAgABcAJQAhACsAJAArACIALwAoADAAJQAsACYAMQAp ACwAJgAnACIALAAgACYAFwAdAA4AFgAGAAkA+f/0/+T/5v/U/9f/vv/G/7H/uP+f/6X/j/+X/4D/ j/9y/3z/Xv9z/1P/a/9K/2T/Rv9b/zz/Wf86/1H/L/9P/y//Tf8t/0//L/9J/yz/Tf8v/07/Lf9R /y7/U/82/1r/P/9j/0j/b/9R/3v/Xv+G/27/mP+A/6L/k/+1/6T/yv+7/9//z//w/9//+v/s/woA /P8WAAwAIAAZACkAJwAwACgANQAwADgANQA7ADEAQAA/AEAAOQBDADkAOgA1AD4AMAA4AC4ANAAl AC0AGwAnABUAFQAKABAAAwD+/+//9f/l/97/zf/U/8X/uv+o/6j/k/+S/3n/gv9l/2//T/9b/z3/ Sv8o/zn/Ff8r/wr/J/8C/yL/+f4j//r+Jf8A/yj/A/8x/w7/PP8d/0P/Jf9R/zP/Wf89/2n/UP9z /13/g/9p/5P/ev+k/43/r/+Y/7n/qf/K/7r/2f/L/+v/3f/9/+//DwALACcAGwA0AC8ARQA/AFEA SwBZAFcAaABgAG0AbABuAG4AbQBvAHIAbgBwAGgAYgBaAFsAVgBLAEUAQgA7ADIAJwAdABYADAD5 //z/6f/p/9H/3f/F/8b/sP+y/57/pf+M/5X/ev+A/2X/cP9T/2P/Sv9T/zv/Sv8n/zr/Gf8v/w7/ Lv8F/yD//v4h/wL/IP/8/ij/Bv8x/w7/Pf8c/0z/K/9Z/z3/bP9P/4D/ZP+T/3//q/+U/7v/qf/Q /8H/4f/S//L/4v8AAPP/EQABABsADwAiABkAMgAiADUAMwA7ADcASABGAEgAQQBSAEkAVABKAFYA SgBRAEgATwBHAEsAQgBLAEEAPgAyADUALgAlAB0AGwAPAA0AAwAAAPD/7//f/+L/0v/O/73/wf+y /7b/of+s/5r/n/+I/5b/e/+Q/3n/iv9u/3//bf+I/3H/hP9o/4r/b/+O/3T/kP91/4z/eP+I/3P/ if91/4//fP+Q/3b/k/9//5j/fP+a/4b/pf+T/7X/ov+v/57/vP+j/8T/sv/R/8D/3//L/+j/1f/x /+X////z/wgA+/8VAAwAGQARACIAGQApAB8AMgAnADgALAA/ADYAQQA1AEUAOgBHADsARgBCAE0A QQBLAEQATABAAE4AQwBIAEEARwA6AD8AMgA5ADEAKgAfACAAFQAMAAIA/f/t/+T/1//T/8H/wP+s /6f/lv+T/3//ff9n/2r/Sv9W/zv/RP8s/0L/If85/xr/Mv8S/zj/E/85/xb/OP8e/0X/Jf9K/yv/ Uv81/2H/Rv9q/1f/ef9k/47/dv+c/4j/rv+f/7z/qf/S/8X/3//V//X/7P8SAAUAJAAeADoANABT AEwAYwBgAHIAcQB/AIIAiACMAJMAkwCSAJMAlACZAJQAmQCUAJUAhwCFAHcAdgBnAGEAUgBQAD4A OQArACUAFwAPAAIA+P/z/+L/3P/N/8n/tv+2/6L/pf+R/5n/gP+K/2//ev9h/2v/Wf9f/0b/V/81 /07/MP9D/yf/QP8i/z3/JP9C/yX/Rf8q/1P/N/9e/0T/af9R/3n/Yf+M/3T/nf+O/7P/of/E/7T/ 2v/K//D/4/8AAPT/DgAEABsAFAAhAB8AMAAnADcAMAA8ADwAQwA9AEoASQBPAFQAWQBTAF0AWQBk AGAAYABgAGQAZgBlAGwAagBuAHAAcgBqAGwAYQBmAFwAXQBTAFEASQBHADMAMwAjACAAFAARAAQA +//0/+v/4v/V/9P/xP/H/7b/tf+m/6z/nP+b/4r/mP+F/5T/gP+Q/3b/h/9z/4b/dv+D/3H/g/9r /4L/af99/27/e/9t/37/cP+A/3D/hf9y/47/eP+Y/4L/n/+I/6r/lv+3/6j/w/+5/87/xv/h/9n/ 8//m/wcAAwAYABcAKAAiADQAOABGAEgAUABRAFsAYgBjAGkAbgByAHQAegB5AIEAeQB+AHcAgAB2 AH4AcwB4AHAAdABpAG4AZgBoAGIAZABWAFsAUgBPAEAAQwA1ADUAIgAlABEACgD6//j/6v/m/9X/ 0f/H/7z/s/+l/6L/lv+P/4P/g/9z/3P/Xv9r/1j/Yv9R/2P/TP9e/0r/ZP9R/2T/U/9t/13/fP9n /37/c/+E/3f/k/+D/5r/if+i/5f/rP+j/77/sf/C/7f/zf/I/9b/z//j/9//7P/p/wEA+v8RAAoA IAAcADEAKgA/AD8ATABOAF4AYABoAG4AcwB7AHoAfQCDAIQAhwCKAIgAjgCEAIYAgQCIAHgAggB1 AHoAagBxAGkAbwBaAFsAUABZAEQARQA5ADYAKAAkABwAGQATABEACAAAAPX/7//m/+D/2v/R/8r/ w/+6/63/q/+i/5r/iv+M/3z/fv9s/3j/Yf9u/1v/bP9V/2P/Vf9p/1b/a/9W/3b/Yv96/2f/hP91 /5L/gP+g/5b/sP+j/8L/vP/O/8r/4f/f//P/8/8EAAAADwAPACMAJAAuAC0APABBAEwAVgBcAGAA ZwBpAG8AewB9AIcAjACSAI8AkwCYAKEAnwCoAJ4AqwCkALIAnwCrAJgApgCQAJkAgQCFAHEAegBb AGQARgBNACwALwAUABUA+v/3/+j/4f/N/8r/uv+u/6f/mf+Z/5D/i/9+/33/c/96/2n/df9o/3P/ XP9w/1//bf9f/3H/Y/9x/2X/eP9s/4P/eP+N/4H/k/+K/6L/m/+u/6X/uv+5/8v/yv/g/9v/8P/r /wUABQAYABoALAAuAEAARABOAFUAXABmAGwAewB0AIgAgACOAIEAlQCIAJkAiwCaAI8AoACLAJkA hACaAIEAkAB9AIsAcgB4AGoAcQBhAGwAXABeAEwAVQBFAEoAOAA8ACwAMwAlACYAGQAXAAcABQD3 //n/5v/j/9f/z//J/8L/vv+5/6r/qP+g/5v/l/+Q/5X/hf+O/4X/jP+B/5P/hv+V/4v/m/+Q/6D/ nP+p/6L/s/+x/73/uv/C/8X/zv/H/9X/1v/i/9//5v/l/+3/7P/v//H/9P/5/wAAAQAAAAUADgAX ABUAGwAeACYAJgAsADIAOQA4AEMAPABFAEoATwBTAFoAWQBfAGEAagBnAHcAbgB8AG0AegByAIEA awB5AGcAcwBfAG0AXQBkAFMAXQBNAFcARwBRAEAASQA7AEAANwA3ADAAMgAlACkAHgAgABEAFgAK AAwA/f8CAPD/8f/n/+v/2v/a/8j/yf+3/7X/qf+q/57/mv+X/5D/j/+L/4z/hf+G/4D/f/99/4H/ gf+I/4H/jP+E/5L/jP+e/5v/p/+o/7b/uP/H/8f/0f/W/+D/5P/y//T/AgAHABEAGAAgAC4AOgBD AEYAUgBYAGEAZQBxAHQAiACDAJMAjwChAJ8AtACuAMMAtADKAMAA2QDEAN8AxwDeAMQA3AC/ANoA tgDNAKQAuwCRAKwAfQCUAGgAdABJAFYALwA8ABEAFwD2//n/3P/j/8L/xv+x/7H/nP+Z/4r/gv98 /3T/c/9q/2X/WP9i/1j/W/9T/1r/Tv9c/1T/Wv9W/2D/Wf9t/2f/ev9w/4j/gP+T/5H/pv+n/7f/ uf/P/9D/5P/l//7/AwAUAB0AKgA2AEAATwBfAGwAbQCAAIUAlQCUAKoAoAC6AK0AxAC3ANAAvQDc AMQA3ADBANoAvADYALgA1QCxAMYAqgC+AJ8AtgCMAKIAjQCdAHgAjABrAH0AUABkAEUAVgA2AEEA JgAxAA8AGAD9/woA7P/x/97/4v/L/87/wP+//7T/tv+m/6n/oP+h/6D/mf+e/5r/nf+c/5z/n/+j /6b/rP+l/7b/tv/A/73/y//J/8//0v/d/93/6f/s/+//+P/7/wUAAAANAAgAEQAMABgADgAZAA8A HQATAB4AGgApABcAJAAhAC4AIQAxACkAMwArADwANABGADUASABFAFQARgBbAEwAYABUAGQAXQBx AGAAcQBmAHwAaAB6AGcAegBnAHwAZgB6AGcAewBjAHYAXgBvAFsAaQBVAGQASwBdAEUAVgA/AEsA MgA+ACkANQAdAC0AFwAfAAMAEgD4/wMA6v/x/9n/4P/I/8//vP/B/6v/rv+m/6T/lv+Y/4z/kP+F /4b/gP9+/3v/ef95/3j/dv92/3v/fv+A/4T/i/+K/5P/mf+j/6r/sf+0/8P/yf/P/9n/4v/u//b/ BQAOAB8AIgA4ADcAQwBMAF4AYgByAHQAiACFAJ0AlwCwAKgAyAC2ANcAyADmANMA7QDiAAEB3gAD AeAAAAHcAPoA0gDwAMUA4ACxANAAnAC5AIYAnwBuAIEATQBkACoAOQAOAB4A8v/9/9P/3/+2/8D/ pf+l/4j/if9z/3T/Y/9m/1f/VP9L/0X/Rv8+/zj/MP9A/zb/Qf88/0b/QP9T/1T/Yv9c/2n/aP9+ /4L/kf+U/6T/q//B/8n/3f/k//D//P8RABwAJgA1AEQAVABbAG0AcwCPAIgAogCXALkAqADIALkA 2wDIAOgA0gDyANEA8ADPAPYAzwDzAMsA6QC/AN8AuQDXAKkAxQCbALcAhQCkAHUAkwBgAHYATABg ADcARwAhADMADgAaAPv/BADi/+j/0v/Z/7z/xP+r/7T/nP+g/5H/kP+H/4T/f/9+/3j/eP93/3P/ ev92/3n/ef+A/4H/jP+M/5L/lf+o/6P/s/+0/8X/x//V/9//5P/x//X/AgAIABIAEwAiACIAMwAo ADoAMABDADUASAA9AFAAQgBYAEYAWwBHAF4ATABfAE0AYwBOAGIAUABnAFMAZQBPAGMAUABnAE8A ZwBUAG4AVgBsAFMAagBUAGoAUgBlAE0AZQBLAF8ARwBYAEQAWgA5AE4AOgBIADIARAAsADsAKQA9 ACQALAAYACMAEgAlAAkAHgAEABEAAAAPAPn/AwDw//X/5//r/9n/3f/U/9r/yv/Q/8D/xv+2/8b/ r/+1/6z/sP+k/6j/nv+k/53/of+W/5r/kv+W/5L/lv+R/5n/m/+i/6T/rP+s/7n/uf/E/8b/0P/Y /+T/5v/t//X/AwATACcAIwA4ADkASQBQAGYAXQB2AHMAjACJAKIAlQCyAKQAwACzAMwAvwDhANEA 9ADbAPsA2wD9ANwA+gDXAPsA0QDuAMYA4AC6ANUApwC/AJIAqwB4AJAAWwBvADcASAAdACsA/v8I AOD/5//E/8b/pv+n/43/iP91/2//Yf9a/07/SP9B/zz/OP8s/zD/Jf8v/yf/M/8r/zb/Nf9C/z// Uv9P/2H/W/9v/2z/iP+I/53/nP+5/7r/2P/Z/+//9f8KABMAJgA4AEEAVQBdAHIAewCSAI8ApwCo AL0AugDVAMsA6wDaAPkA5QD/AOYACgHkAAoB4QAEAd0A+wDNAO4AwwDlAK4AzQCaALMAgwCUAGwA fABPAGYAMwBGABUAIwD+/wQA4v/s/8z/1P+1/7v/p/+l/5L/j/+D/4L/cv9s/2v/Y/9g/1v/X/9a /1z/Wv9i/13/Zf9i/27/aP93/3H/hv+B/5j/l/+s/6z/uv/E/9b/2//o//D//v8LABUAHwApADcA NgBIAEcAWgBTAGMAWQByAGEAdwBlAH0AZgB/AGkAgQBlAHwAYgB5AF8AcwBbAG0ATwBdAEMAWAA+ AE4AMQBIADEAPwAoADUAIQAvAB0AJgAWAB8AFQAZABEAGgAQABcACQAQAAkAFAAHABAADAAUAAcA EAAGAA8ABwAQAAoAEwAGAAsACQASAAsAFAAQABgAEgAbABYAHgAQABQACQAUAAIADQAAAAgA+v/9 //X/AwD1//v/6//z/+L/6f/b/9v/1v/W/8z/z/+7/77/s/+0/6r/qv+t/6v/pf+p/6j/pf+o/6f/ rP+u/6//tv+6/7z/wv/E/9D/1v/a/97/7v/x//r/AwAJABIAGQAgACgANwA2AEYARgBYAFgAaQBr AHgAfQCOAI4ApQCXAKoApAC4AKsAvQCrAL4ArQC7AKMAvQChALcAmQCrAIcAnAB0AIYAWABpAD8A SwAkACwACQAUAOz/8f/V/9j/uP+5/6f/n/+L/4X/f/93/2v/Zv9Z/1P/Uf9M/1H/RP9Q/0X/Vv9P /1j/Uf9g/1v/bv9t/3v/e/+L/4v/nf+d/6v/s//J/9D/3P/l//b/BAAPABgALQA5AEQAVQBcAHMA cACFAIkAngCVALEAsADJALwA2ADEAOAAxgDgAMAA3AC5ANQAtgDLAKYAvQCZALEAiACWAHUAhgBb AG0AQgBOACsAMgATABYA9f/7/+b/6P/K/87/uP+4/6L/n/+T/47/hv99/37/d/9y/2f/af9f/2T/ Xf9k/13/aP9l/3T/a/98/3T/if+E/5f/lf+r/6f/vf+//9P/2f/x/+//AwAJABwAJQAzAD4ASABT AFkAYgBiAHEAcwCCAHYAhQB6AIgAfQCRAIIAkgB+AIsAcwCGAG8AfQBeAHAAUgBdAEgAUQA5AEcA LQA6AB0AKgAUAB0ABgASAPn/AADy//f/7v/0/+j/5v/h/97/1v/Y/9f/2P/X/9b/1//a/93/3P/f /+D/5//n//H/8f/0//T/AwABAAkACwAUABMAGwAeAC4ALwAwADIAOQA8AD8ASQBAAEwARgBPAEMA SgA/AEkAOwBFADIAOQAsADEAGgAiAAwADwD6/wMA7v/u/9z/3f/J/8r/vv+6/7X/tf+l/6X/ov+d /5j/jv+S/4r/jf+J/4//h/+P/4z/k/+Q/5j/lv+l/6L/s/+v/8P/wv/U/9X/4v/i//X/9v8PABMA JQAsADwARgBaAGQAdwCDAIsAmAChALIAswDFALwA0gDFAN8AzwDlANMA5wDJAOMAwwDdALMAzQCj ALMAjwCfAHIAhQBZAGwAOgBLAB0AJgD//wIA3v/m/8H/xP+p/6P/jP+J/2//a/9X/03/SP88/zf/ Jv8q/xj/If8S/xz/DP8Y/wX/F/8J/yL/Ef8s/xX/P/8u/1P/RP9o/13/if9+/6P/nv/C/7j/5P/i /wsABgAmACkASwBUAGgAcgCKAJkAqQCzALsAzQDPAOUA3ADyAO0AAAHuAAQB7AAIAewACQHlAP4A 2wDyAMsA4AC4AMYAngC0AIUAlgBoAHsATwBbADYAPQAWABwA+v/6/9r/4v/D/8H/pP+g/4X/gv9y /2v/Yf9Y/1L/Rf9F/zv/Pv8y/0H/Lf8//zL/R/8z/1D/P/9c/0r/bP9b/4T/ev+V/4n/rP+k/8T/ vf/e/9X/7//r/wcAAwAWABYAJAArADIAOwA8AEMARQBJAE8AUgBTAFkAUgBZAFIAWABYAFwAUABW AEsAVABJAFIARwBOAEAASQA7AEQAMgA1ADEAMwAqAC0AJwAsAB4AIwAbAB4AFgAWAA4AEwAOAAwA BQAJAAUACAAHAAcAAgAGAAEABgAEAAQABgAFAAQAAgAJAAwACAAOAA8ADQATABEAEgARABYAFQAQ ABAACgALAAwABAD+//n/9//x/+3/5//j/97/1v/T/8r/w/+9/7P/sf+o/6D/l/+d/4//jP+D/43/ hP+I/3v/iP99/4b/e/+J/37/hv95/5D/g/+S/4j/mP+S/6P/nf+u/6n/u/+1/8r/yP/b/97/8f/x /wUAAwAcAB0ALwA4AEwAVQBoAG8AeQCJAJAAmwCfALEArAC6ALgAxgC+AMwAwgDTAL4AwwC4AMIA pwCwAJwAoACDAIwAbgB0AFAAVAA4ADkAHQAcAAcA/f/s/97/zf/G/7f/pf+h/5D/if96/3D/YP9d /0r/Uf82/0T/M/88/yj/OP8l/zb/JP84/yT/Qv8s/0T/MP9U/0X/Xf9N/3b/Zv+I/4D/oP+e/8D/ s//Z/9f/9f/x/xIAEgAzADMATQBSAGgAcgCLAJMAnAClALIAvgC/AMgAwgDTAMoA2QDMANsAygDc AMUA1wDAAM4AtwDBAKMAtACVAKYAgwCNAG4AegBbAF0ARABJAC4ALAAUABQA+P/3/+P/2f/G/7// rf+g/47/g/98/3L/bf9a/2H/Tf9Q/0L/Tf84/0T/Nf9G/zL/Sv80/1X/P/9j/0r/cP9c/33/b/+Z /4r/qv+e/77/tf/Z/87/6//p/wAA/P8WABEAHwAeAC8ALwA8ADoAQQBIAEgATwBMAFEATABQAFIA WgBRAFgAUQBYAE4AUgBNAFEARQBHAD4ARgA6ADwAMwA1ACkAKgAlACEAFwAXABEADAAGAAIA+//2 //D/7v/x/+X/5P/X/+X/1P/g/9f/3f/Q/93/zv/f/9X/3//U/+P/2f/p/97/8f/q//j/7f/9//f/ AgD1/wQA/f8GAP7/CgACAAgA/v8EAAEA/f/+//z/9P/3/+7/7v/r/+n/4//j/9v/1P/M/8z/xP/I /77/wf+3/7r/sP+0/6r/rf+j/6b/m/+d/5b/mv+R/5j/iP+S/4T/k/+F/5n/iv+f/4//pv+W/7H/ pP/B/7T/z//C/+P/1P/0/+r/CgACACEAGgA9AD4AUABVAGkAaAB3AH8AiQCTAJUAnQChAKgAqACy AK0AugCwALcArgC0AKMArgCZAKIAigCKAHcAdgBgAGgATgBRADgAOwAdACIACQAEAO//7f/U/87/ s/+r/5f/kf+J/3n/cP9l/2L/Uv9P/z7/Q/8u/zX/Iv8s/xn/KP8U/yr/FP8v/xj/M/8c/z//LP9O /z7/Y/9R/3n/af+R/4L/rf+f/8v/uf/p/93/AQD+/yMAJgBJAEkAWgBiAHkAfQCJAJEAlQChAJ8A rwCuALYAtwDAALoAxAC1AMIAsQC/AKwAtwClAK8AlwCcAIsAjAB3AHsAYQBoAE0ATwAzADkAGwAa AAIABgDo/+v/y//H/7D/p/+a/4//hf92/3L/ZP9l/1T/WP9H/1D/OP9L/zT/Sv80/0n/Nf9T/z7/ XP9I/2z/Wv9//2n/jP97/6P/kv+z/6f/xP+8/9j/zP/r/+X/+f/1/woABAAUABMAIAAfACUAIwAw ACwAMwA1AD0APABCAEAARgBGAEcASQBOAFEASQBMAEQASABCAEIAQABAADoAQAA1ADYAKgAqACUA IwAcABsAEwAQAAkABAABAPz/+f/z//f/8v/x/+r/7v/l/+z/3f/q/+b/6f/i/+z/4f/x/+j/8f/q //H/6f8AAPb/9//w//3/9P/9//r//P/y//z/9//9//b//f/x//f/6f/x/+b/7f/k/+f/3v/i/9f/ 3P/T/9T/yv/V/8T/1f/I/8r/w//D/7//w/+2/8D/tP+5/7P/t/+v/7P/pv+s/6f/tf+q/7j/rv+9 /7T/w/+3/8n/v//S/8v/4P/Q/+b/3v/t/+r/AgAFABgAGQAiAB8ANQAwAEMAQABMAE0AVQBYAGEA YQBqAGgAbgBtAG8AcABtAGwAcABuAGIAYgBbAFwAUABNAEkAQgA5AC4AKgAjABcAEAAJAAIA8//r /+H/2P/H/77/u/+t/6v/mf+b/47/jf9//4f/dv96/2r/cP9h/2z/W/9q/1L/Yv9T/2X/UP9m/07/ a/9a/3H/ZP+E/3T/k/+A/6D/kP+v/57/y/+7/9j/0v/x/+3/BQD//yQAHgA1ADEARgBLAFoAXwBp AGsAcQB2AIEAhgCFAIkAigCUAI0AkwCOAJcAkACVAIcAkACCAIYAdQB4AGYAZwBVAFYAPQA7AC8A JAAXAA8A///1/+j/2P/Q/8j/s/+o/6X/lf+Q/37/fv9w/27/V/9h/03/Uf9C/03/NP9G/y//Tf8x /07/Nv9T/z//Yf9H/2v/Wf9+/2n/lP+A/6f/mP+8/7D/1f/J/+3/5P/9//v/EQAMACQAIgA4ADkA RABFAFAAUwBZAFsAXwBlAGEAZQBkAGwAZQBpAGQAZQBeAGEAUwBbAEcATQBBAEMALwAzACoALQAd ABoAEQARAP/////2/+7/5v/g/97/1v/X/8f/yP+8/7n/rv+6/63/q/+e/6r/mf+m/5f/o/+W/6T/ jv+o/5b/sv+h/7n/qf/A/6r/yf+3/9P/wf/a/8z/4f/Y/+n/3v/4/+T/+v/u/wEA9P8FAPr/DAAA AAoAAQAIAP3/CwD+/wMA9/8FAPz/AQD5//n/8f/2//D/8v/r/+r/3v/k/9r/2v/T/9b/yf/P/8b/ z//D/8j/vv/I/7v/xP+2/8X/tf/F/7n/z/+//8v/v//Z/8v/4//a/+//5//1/+3/BgAAAA8ADAAc ABkAJAAoADQAMgA+ADwASgBFAEwATABUAFIAVgBUAFAAUgBHAEMAQAA6ADUAMQArACcAGgAaABUA DwACAPv/9v/u/+L/2P/O/8P/xP+2/7D/pv+n/5j/m/+I/47/fP9+/3L/eP9k/2//XP9q/1T/ZP9P /2D/TP9e/0X/YP9M/2X/T/9s/1j/dv9m/4f/c/+T/4T/p/+Y/77/rf/Q/8L/7//e/wYA+f8aABMA MwAoAEMARQBUAFEAaABoAHYAeACHAIwAkQCVAJkAnQCcAKcAnwCmAJ0ApgCeAKEAmgCeAJEAkwB+ AH8AbQBzAFoAXQBIAEQANgAyABcAEwAEAPv/6f/h/9j/zv/C/7j/rv+j/5r/jf+M/3n/e/9l/2j/ Vv9l/0//Xv9F/1z/Qv9g/0j/Zf9M/2r/T/92/17/iv92/5f/hv+u/57/wf+1/9n/zP/x/+P/BQD8 /yIAFgAyACsAQwA6AFIAUgBjAGQAbQBwAH0AgQCCAIgAjQCTAIsAjwCJAJYAiwCPAIAAhAB8AIQA eAB7AG4AcQBsAG8AYwBjAFMAVABBAEYAOQA2AC0AJwAXABIAEQAGAP3/9v/x/+r/5P/Z/9n/z//P /8L/xf+4/8P/vP/C/7j/x/+4/8r/vf/N/8L/1f/I/9f/zv/m/9v/7//e//r/6v////L/AQD9/wsA AQATAAYAFgALABwAEwAaABYAHwAcACUAIQApACYAKgApACYAIgAdABoAIQAfAB0AGAAXABUAFAAR ABIADAANAAUACAD///3/9f/5//L/8P/s//H/6//z/+b/8P/p//X/7f/5//T/AAD5/wkAAQAQAAgA GwAXACQAHgAzACkARAA/AE0ASwBSAFIAXABcAGAAYgBqAGoAawBsAG4AbgBvAG0AcQByAGUAZQBj AGAAUQBNAEcAQwA5ADUAJQAeAA4AAgD+//T/7P/i/+D/1f/W/8f/x/+4/7n/rv+w/5v/ov+V/5v/ if+W/4P/kv9//5P/gf+P/4L/j/9//5f/if+j/5L/rf+g/8P/tf/T/8j/4//Z//b/6/8MAAMAKwAm AEEAOgBaAFoAbABvAIgAjACVAJkAmwCmAKoAsgC3AL8AtwC/ALwAywDDAMoAvwDLALoAxQCvALcA nwCoAJcAmQCFAIUAcQByAFgAWgBGAEcAKQAmAA8ACQD2//H/4v/b/8v/vv+0/6b/n/+P/47/fv98 /2v/cv9h/2b/Uf9f/0n/Vf9A/1j/Pv9Y/0f/Yv9Q/2v/Xf99/2z/j/97/6D/kf+1/6b/0f/E/+n/ 3v8EAAAAGAAUACgALABAAEEAVgBXAGMAaABxAHYAeAB+AIQAiwCHAI0AigCTAIoAkQCJAJIAgACM AH0AhABzAH0AcQB0AGkAZgBbAFwASABQAEEARQAxAC0AJQAnABUADgADAAEA8//y/+f/5f/Y/9H/ zv/H/8X/vP/C/7P/u/+t/7r/rv+1/6z/uP+o/7n/rv++/7L/wv+3/8n/vf/N/8X/2P/O/93/0v/m /97/6//k/+//5f/x/+n/9f/y//3/8/8AAPr/AgD8/wgABgAGAAYACwAHAAgABQAHAAsABwAJAA0A BwABAAMABgADAAEAAQD8/////f/5//n/+f/2//T/+//3//3/+//9//z/BAADAAsACQANAAoAFQAT ABkAGAAgABwAIwAkACwAKgA7ADcAPwBFAEwATABTAF0AVgBiAGUAbABlAG8AawB0AGoAcABlAG4A YQBoAFkAYgBUAFwATQBQAEgASQAzADkAIgAoABYAEwAEAP//+f/0/+f/4P/f/9b/0f/I/8z/xP/A /7z/vP+1/7r/sP+t/6n/mv+T/53/lf+b/5H/nP+V/6P/mv+k/53/rv+p/7j/sP/B/7n/0f/N/+X/ 4v/9//j/EAAMACYAKwA3ADsAUQBSAGIAZAByAHgAfwCFAIwAkgCXAJ4AoQCkAKUAsQCkALAAnACq AJcAoACLAJUAggCJAHUAfgBiAGwAUABcAEEARgAsAC4AGQATAPr//f/m/+n/1P/N/8P/u/+v/6L/ l/+Q/4T/d/92/2b/aP9Y/2H/Tv9U/0P/U/8//1P/Qf9V/0H/Xv9H/2v/Vv94/2b/hv95/5r/kf+u /6j/y/+//+X/2v/5//f/DQALACMAIwA3ADkASABFAFQAWABgAGgAaABvAG0AcgBzAHcAcwCAAHcA fgBzAH4AcQB9AHAAeABpAHEAXgBnAFMAWABGAEwANwA8ACcALQAZABsACgAJAPn/+v/j/+b/2v/T /8f/wf+4/7L/sf+q/6j/nP+f/5T/m/+V/5v/jf+c/4//nf+R/6T/nP+m/57/tv+n/77/t//K/73/ 0v/N/9j/2f/o/+b/6v/r//T/8//7//r////9/wMABQAIAAQACQAJAAwACQAFAAkABQAGAAIACAAA AP7//v/9/////v/8//v/9f/2//H/+P/z//T/8P/y/+z/8f/l/+z/5P/p/+H/4//h/+P/3f/c/+L/ 5v/l/+H/7f/s//D/9f/8/wIABQAFAA8AEQAaAB0AJQAlADAAMwA1ADsAPwBGAEkAUgBLAFEAUQBZ AEsAVgBEAEcAPQBHADoAPgAsADAAIwApABYAHwAJABQA+//+/+7/8v/c/93/0//P/8j/xf/A/7j/ r/+r/6X/of+f/5n/l/+O/4z/hv+F/3j/gf95/4X/fP+F/3j/iP9+/4z/hv+S/4z/nf+Y/6b/pv+1 /7L/yf/F/9v/3v/u//j/AAAJABcAGQArADEAOABDAEkAWgBdAGgAZQBvAG8AegByAIAAeACEAH0A jAB8AIkAcwB+AGwAeQBgAGwAWABkAEkAUAA9AEMALAAvABwAJAAMAA0A9//0/9//4f/Q/8//wv+6 /6z/qf+a/5b/iv+E/37/dP9w/2X/Yv9X/1j/Uf9S/0b/T/9D/0//Q/9b/07/Yv9V/3L/Yf96/3P/ kf+I/6L/nv+1/7D/y//I/+X/4//4//j/DQARABsAIQAtADMAOQA/AEUAUQBOAFsAUwBfAFgAZQBb AGcAXQBrAFoAYQBVAF8ATgBaAEUAUQBBAEcANwBBACwAOQAcACIAFAAZAAMABAD2//n/5P/g/9f/ 2//J/8f/vf+8/67/rv+m/6L/mP+S/5X/j/+P/4r/j/+H/5P/iv+X/5L/nf+X/6b/n/+x/6r/vP+4 /87/xf/T/9X/3f/e/+n/7P/y//b//f///wIACAAIAA4AEQAWABUAFgAVABsAGwAgABwAIgAcAB8A FQAhABoAIQAXAB8ADgAXAAgAEgAFAAgA+v/8//P/+f/r/+z/4f/j/9n/2f/O/9D/vv++/7f/tP+u /6z/q/+n/6f/n/+m/6H/p/+h/6n/pv+u/6r/t/+v/7z/tf/G/8T/0//R/9//3v/s/+3/+v///wcA BwAUABQAFAAWABcAGgAdAB8AIQAkACQAJgAhACYAHAAfABwAIgAWABkAEgAXAAoAEQAKAAwAAAAH AP7/AwD2//v/7f/z/+b/6f/a/+H/0//Y/8n/xv+//7//s/+y/6r/qv+n/6L/oP+e/5n/lv+Y/5P/ lv+R/5f/kP+c/5f/of+c/7H/rf++/7n/yf/G/9T/1v/m/97/7//r//v//v8KAAsAEAATABkAGAAi ACUAKQAsACwAMQAsADIAKAAuACEAKAAkACoAGQAeABkAGgATABUADwAQAAIABQD7//v/8f/z/+b/ 6v/e/9z/1P/Q/87/y//A/7z/sP+v/6X/oP+b/5T/lP+I/4P/fP98/3T/e/9y/3r/c/9+/3T/gP97 /4z/g/+V/5f/pP+b/7T/rv/F/8L/1v/X/+b/5//z//X/AAACAAwAEAAWABwAGwAiAB4AJwAjACYA JgArACEAJQAgACUAIgAmAB4AJAAbAB8AGAAXABIAEwAPABEABwAGAAIAAgAAAPr/8P/w/+H/4P/R /9H/x//F/8D/u/+v/67/ov+i/57/mf+Z/5P/lP+L/4//iP+L/4P/jv+F/5T/if+Y/4//of+e/6v/ p/+5/7b/wv/E/9X/z//g/97/5//t//f/+P8AAAIABAALAA4AFgAWABYAEQAWABUAFwAZAB4AGAAc ABkAHgAcAB0AFAAaABAAGAAOABMABgAIAPr/BAD5//v/7v/x/+X/5f/V/9n/zf/K/8X/wf+y/6// pf+g/5r/k/+O/4f/iP98/4D/ef9//3X/e/9x/33/fP+G/4L/kf+I/5z/kf+n/6T/tv+2/8r/yf/c /9n/5//m//D/8//9/wMABgAJAA4AEQAUABkAGwAdABcAHAAfACEAHgAhAB4AHgAaAB0AGQAZABEA EwALABAABgAIAAcABgD7//7/7v/z/+v/7P/j/+X/1v/W/8f/yP/D/8H/tv+2/6n/ov+h/5//nv+Z /5P/if+M/4j/lP+G/5D/g/+Y/5L/pv+X/6r/p/+5/7P/yv/E/9j/0f/l/+X/9//0/wEAAQAOAA8A GgAYABwAIQAsADAAJwApAC0AMgAwADEALQAyACYALAAqACwAJAAoACIAJQAbAB8AGwAhAA8AGgAL AA8ABQADAPv/+//z//L/5//q/9j/2f/O/87/vv+9/7P/sv+g/6P/mf+S/4r/g/+G/37/f/91/3// df98/3b/gv94/4f/f/+U/43/o/+Y/67/rP+4/7X/zP/J/9j/0v/o/+T/7f/r/+3/8//2//j/AAAC AP//AwADAAoACAAGAAkAEQALABEADwASAAoADwALABEABwARAAoADgAFAAsA/v8HAPn//v/2//j/ 8v/w/+P/5P/Z/9f/1v/P/8v/xP/B/8D/uP+3/7z/tv+y/6v/r/+q/67/qv+w/6z/sP+w/7f/tv/A /7r/wf/C/8v/yv/Y/9f/3P/c/+T/5f/s/+3/8f/0//H/8//3//j//v/9//v/AAD4//b/9f/x/+3/ 6P/o/+T/5P/h/93/2//W/9X/1v/U/9D/yP/P/83/yf/F/8X/w//B/8D/wP+9/7v/u/+9/7n/s/+x /7H/rP+t/6f/rf+j/6X/oP+i/5v/oP+b/6f/pf+p/6T/tf+v/77/tP/J/8j/2f/U/+H/4v/y/+// AwAEAA4ACwAYAB0AIAAlACoAMAAuADgAMgA3ADMAOQAzADsAMQA2ACoANQAqADAAJAAqABcAHQAV ABYADgAQAAcACgAAAP7/9//3/+v/6//n/+L/2f/Y/9L/0f/J/8n/uf+4/6//qP+j/5//l/+S/4// i/+I/33/hf96/4D/df9+/3H/ff9x/4T/ef+I/4D/k/+P/6D/mv+0/6j/w/+7/9D/zf/f/9n/7f/s //j///8AAAMAEAAQABgAHQAbAB4AJAAmACUAJwAmACsAJwApACYAJgAnACoAKgAwACQAKgAqACsA JQAoACEAKQAhACgAGgAjABIAGwASABUACQAKAAEABAD0//X/5P/p/9j/2//O/83/vv+8/7L/sv+l /6X/of+b/5v/lv+b/5L/l/+O/5b/jP+Y/5T/nf+Z/6P/nv+p/6X/rf+o/7r/tf/A/7r/xP/B/8b/ xv/L/8L/0f/N/9j/1//c/9v/4P/i/+f/4P/r/+b/7P/u//D/8//z//L/+v/6//v//f/8/wUAAAAG AAEABAAAAAUAAAAGAPz/AQD6//v/9f/z/+r/7f/s/+n/4//p/9//2f/V/87/0f/R/83/yv/G/8b/ zv/M/9b/0v/Y/9b/3f/Z/+L/1//q/+b/7//v//f/+f/7//v/BwAGAAsACgARABIAEAAQAA0ADgAQ AA4ABwAGAAgACwACAAEAAAD+///////8//3/+P/4//H/8v/0//P/7v/w/+7/6v/r/+n/5v/m/+P/ 4v/a/9v/1v/Y/8//0v/H/8T/yP/A/7v/uf+1/7D/s/+w/7L/r/+0/6r/t/+y/73/tf/E/8P/0//N /93/1f/q/+b/9//1/wcACAAUABEAGwAgACgAKwAsADAALgAzADEANQAxADYAMgA0AC4AMQAqAC4A KQAvACMAKAAdACAAHAAhABQAFQAUABYADgATAAgADQALAAsA//8AAPn/+//r/+n/4//j/9b/1f/T /8v/yP+8/7r/s/+v/6P/pP+X/5r/j/+R/4j/iv+C/4z/f/+M/4P/kf+M/5r/jf+j/5j/rP+l/7r/ t//G/8L/0//T/97/2P/p/+r/8//z/wAA/f8CAAMABQAKAAgAEAAKAA8ADQASABQAFAAXABcAHQAf ACAAIAAoACkAKQAqACoALAAqAC8ALwAzAC0AMgAlAC4AKgAvACUAKQAWABsAEgAWAAQABQD7//f/ 7f/t/+H/4f/S/9X/yf/I/8L/uP+//7r/t/+1/7z/tP+2/67/uv+0/7v/t/++/7b/xP+6/8L/wf/G /77/xv/D/8f/xf/F/8T/yf/D/8j/yP/C/8T/yf/C/8b/wP/M/8b/y//I/8//zv/S/9T/4f/b/+n/ 4v/u/+n/8f/u//n//f/0/wEA/v8DAAMAAwAEAAUAAwADAAQABQD+/wEA+v/4//f/+P/z//X/8v/z //L/9P/4//H/+//8//3/+/8EAAUADgAMABQAFwAYABkAIQAkACgAKAAnAC0AKQAvADAAMgAsACsA IgApAB8AHwAXABkADwAQAAQABAD2//r/8v/x/+b/5//j/+T/4P/W/9v/1P/W/9L/0//O/8z/x//N /8b/xP++/8T/w/+9/7v/tf+z/7D/p/+x/6X/pP+a/6L/lv+f/5b/n/+W/6D/lf+o/5j/qv+h/7b/ rf+9/7n/zP/F/9r/0//r/+b//f///w8AEQAbACAAKQAwADcAPABCAEcARwBTAFIAWgBVAFoAWwBk AFoAYwBeAGYAVwBhAFkAYABSAFwATQBTAEwATQBDAEgAPQBBADgAOwAqADUAIAAnAA4AFAACAAUA 8v/v/97/2v/J/8X/uf+w/6L/mf+R/4b/gv92/3P/ZP9m/1j/YP9O/1z/R/9c/07/Yf9O/23/Wf9w /2X/gf94/5D/h/+j/5n/tf+r/8f/w//c/9v/7//w/wEAAQAKAA8AHQAlACoALQAyADwAQwBLAEoA UwBVAFwAXwBoAGcAcgBqAHQAcAB/AHAAgwB2AIQAdQCDAHEAfABzAHoAYQBxAFYAWgBEAFEAMwA8 AB0AJwAMABMA9v/2/9//5//U/9D/v/+4/7T/qv+h/5b/nf+R/5f/jv+X/4z/mP+P/5//lP+c/5H/ qv+g/6z/rP+2/7D/vf+5/8b/wv/N/8j/1P/S/93/3f/l/9//6f/r//f/9f///wEABwAOABcAFQAd ACQAJgAuADQAOQA6AEQAQABLAEQASwBIAEkARABOAEIASwA9AEEAMAA8ACgALQAaACEADwASAAMA BAD0//T/6f/i/9//3//Y/9n/1P/P/8//zP/S/8r/1//T/9z/1f/e/9n/5v/i//D/7P/8//j/AQAH AAUACAALAA8ADQANABAADwARAA8ADAANAA0AEAANAA0ADQAKAAcACwAJAAsACgAKAAQABgAGAAUA AwACAAEAAwD+/wIA/v////X/9P/u/+v/4//j/9f/1v/N/87/wf/B/7r/tf+y/6b/rP+l/6j/nf+m /5b/pP+c/6b/of+r/6j/tv+z/8D/wf/T/9H/4f/i//b/+P8IAAUAFQAWACQAKAAsADIAMwA6AEAA SABCAE0ATwBYAFEAWQBTAGAAUwBjAFQAXQBQAFoATwBYAFAAWABLAFMARwBLAD0AQgA0AEAAJwAu ABcAGAADAAoA9f/1/+f/6P/R/8//wv+8/67/ov+d/5X/iP9+/4L/d/9w/2b/af9d/2n/W/9u/2L/ c/9m/3//c/+L/37/oP+a/7X/rv/I/8b/2//c//j/9f8KAA8AGgAkACoAMQA4AEAAPgBHAEsAXABT AGIAWwBpAGAAaQBkAG4AZQBsAGUAbgBnAHMAZwBxAGMAbwBfAGcAVwBfAEsAVgA/AEoANAA9ACYA KwAVABwA/v8EAO3/7v/Y/9n/xP/M/7v/tP+v/6n/pP+c/5z/mP+X/5P/l/+P/5z/l/+i/5z/qf+j /7f/s/++/7//zP/M/9z/2//t/+r/9v/3/wAABQAFABAADgAYABUAHwAhACYAIQAqACkAMwAtADIA LgAyADAAPAA1ADoAMgA3ADMAOgAvAD0AMAAzACUALwAeACUAFwAaAA4ADwAGAAcA9P/4/+f/6f/X /9X/xf/C/7z/t/+s/6P/pv+i/6H/mP+g/5b/oP+a/6r/pv+z/7H/xP+9/9L/yv/k/9z/8v/y/wIA CQAXABwAJgArADYAOwBCAEgARgBOAFQAWABVAF8AVABfAFcAYwBdAGcAWQBfAFcAWgBRAFgARwBQ AD8ASAA3AEQAKQAzACQAKAARABgABgAOAPX/9P/j/+b/0P/S/77/vP+l/53/lP+N/4L/e/95/2v/ bP9j/2n/Xv9j/1v/Y/9d/27/YP9//3P/i/+F/6L/nf+8/7X/2f/U/+z/6/8EAA0AIQAjADEAPABO AFYAYgBqAHIAgQCIAJUAlQChAJ8ArACiAK4AqgC9AKoAuwClALkAoQC0AKAAtACbAK0AkgCiAIgA mQB3AIgAXgBtAEkAWAAwAD0AHwAmAAIABADm/+n/x//M/6z/r/+P/4n/fP92/2n/YP9Y/07/S/9B /0n/Of9H/zf/TP89/1f/Tf9m/1X/eP9q/47/hf+g/5r/uv+z/9T/0f/z//L/CAAGACIAJQA0ADgA SABPAFkAYABqAHEAeQCDAIcAkwCQAKAAmgCrAKAAtQClALwApgC2AKgAuACiALQAngCsAI4AnACB AJMAbQB7AFsAbwBEAE4AKQAxAA4AGQD4//z/3f/g/8j/yf+w/7P/o/+h/5X/j/+N/4X/gf97/3// d/99/3T/gv96/4f/hP+R/4z/l/+R/6T/nv+y/67/v/+9/8v/yP/b/9j/5P/o//f/+f8GAAIADgAP ABwAHQAqACwANQA3AEIASgBJAFAAVQBbAFwAaABpAHEAZwBxAGYAbwBlAG4AXQBtAFEAZABMAFoA PABLAC4AOQAbACYACQATAPf//f/t/+3/1//Y/87/0//K/8r/wf+//8P/vf/L/8X/yf/H/83/0P/Y /97/5f/n/+//8f/6/wQADAASABEAGwAbACgAJgArACsALQAuADMAMgA2ADIAOwA5ADwAOwBAADkA QAA5AEMANQBCADoAQAA2AD4AMQA2AC0AMwAqAC4AHwAjABIAFQAHAAYA7v/1/9z/3//R/8z/vv+6 /7X/rP+k/6L/l/+T/43/hf+H/4P/h/+A/4P/ff+K/4T/kP+N/57/m/+w/6v/wf+7/9D/0v/j/+b/ +v/8/wsACwAiACQALQA1AD4ARwBMAFcAYQBuAG8AegB4AIQAhwCSAIoAmgCUAKEAlwChAJ0AqgCb AKsAmwCnAJcAogCLAJcAfgCQAHEAdwBdAGgARwBWACsANgASABkA+f8BAN//4v/E/8X/qv+q/4// jf95/3f/bf9j/1//Vf9Y/03/Vf9O/1f/T/9k/1j/a/9g/3f/b/+K/3z/lf+P/6r/p//A/73/1f/Y /+n/5f/5//r/DQAVAB4AHwA0ADQAQwBJAFYAWgBoAHIAdACBAIMAjwCMAJgAjwCbAJIAoACTAJ4A kACkAIoAngCJAJYAegCMAHEAgQBgAG4ATABWADwAPgAlAC4ADQAWAPr/AgDs/+z/1//X/8v/yv+/ /8P/uf+1/7D/rP+u/6v/rf+s/7T/tP+7/7f/uv+2/8L/wv/I/8r/z//U/9b/2f/d/+L/6f/m//b/ 9P/6/wAABwAHAAkADwAWAB0AHwAkACkALQAwADYAQQBCAEEASABGAEwASQBRAEQATgBBAEoAPwBH ADMAPAAyADoAJQAvABgAJgAIAA4A+v8BAOv/7f/n/+b/2//Z/9T/0//V/9L/1//T/9j/1//g/97/ 6P/n//X/9f8AAP//DwAQABkAHQApADMANwBBAEIASgBIAFUAUABeAFYAXwBcAGcAWgBoAF4AbABh AGcAYABpAF0AaABYAGYAVQBeAEkAUwA9AEkAOQA+ADIANAAkACgAEQAUAAQABgDx//T/4//j/83/ yf+8/7f/rf+k/5r/lv+W/4v/j/+I/4L/eP+I/3v/hf95/4z/gP+P/4f/oP+X/6v/qP+//7z/z//R /+j/6P/3//3/EAAOAB4AJQAzADwARABIAFQAXwBnAHkAdQCJAHwAjwCFAJgAiACeAIwAngCTAKIA kwCiAJAAoQCRAKAAiACTAIAAjABoAHgAWgBmAEkAUAAyADQAGgAeAAgABwDs/+z/1f/S/7b/uP+g /5//iP+B/3X/aP9l/1r/Yf9R/1X/Q/9X/0b/XP9L/2H/V/9m/17/ev9t/4b/fv+d/5n/rv+o/8T/ wv/Z/93/+v/9/xAAEwAeACQAMAA3AEEASgBKAFoAXwBwAG8AegB8AIoAiACVAJEAoQCTAKUAnQCp AJkAqwCWAKkAkACoAIwAoAB/AI8AdQCEAGIAawBOAFsAOQBBACEAKQAMABMA/f/7/+f/5//T/9T/ wf+9/7b/sv+n/6P/ov+d/5j/k/+c/5f/nf+W/6P/nP+q/6X/r/+z/7v/tv/J/8r/zv/P/9//3f/q /+v/9//9/wIABAAOABIAGQAeACEAJwArADQAOgA9AD0ASQBJAFUATQBZAFUAXwBRAF4AUgBaAE4A WABKAFIAQQBHADYAQwApADcAIQAsABIAFAADAAoA8v/5/+P/5//V/9f/zf/P/8b/wP/D/73/wf+9 /73/v//E/8D/yv/M/9L/1v/f/+T/8f/u/wAA//8FAA0AHAAjACgALQA1ADwAQgBHAEkAUABOAFkA WQBgAFsAZwBgAGoAYgBqAGEAbABjAGkAWwBjAFUAXwBQAFgAQgBNADsAQAAuADQAHAAiAAkAEAD4 //z/4P/d/83/y/+2/67/pP+b/5D/i/+B/37/df9q/2v/Yv9k/1j/Zv9a/2T/Wv9t/1//e/9s/4b/ gP+Z/5D/r/+o/8H/vf/X/9T/7v/s/wUAAwAcABsAMAA0AEcATwBjAGgAcACAAIMAjQCLAJoAlwCr AKIAswCtALsAsAC9ALMAxgCzAMMArgDBAKEAsgCVAKEAiACTAHAAggBeAGsAQABIACYALQAQABcA 7f/0/9D/1f+w/6r/jv+G/3r/cv9f/1r/WP9N/0v/Pf9H/zn/SP84/0j/N/9Q/z//Wf9O/2r/Xf+B /3f/lf+M/7H/rf/J/8L/4v/d//f/8/8PAA4AJAAqADkAQQBQAFgAZABuAHwAiwCSAJ8AnQCpAKgA ugCzAMMAuADJALgA0AC4AMwAtgDJAK8AwwClALgAmACoAIIAlABsAHkAUwBkADgASAAiACoACwAQ AOz/8P/Z/9j/wf/C/6//q/+e/5n/k/+N/4j/fP+B/3z/gP92/4X/df+H/37/k/+H/57/lP+k/57/ tP+t/8D/vP/O/83/4P/f/+//7v/6//7/CQAOABcAHAAeACMALwAwADEAOwA/AEUARgBUAEsAVQBM AFcAVABfAE8AWABQAFUATQBOAD0ARwAzAD4AKAAqABcAIQAKAAoA+f/1/+j/6f/Y/9f/zf/M/7// wP+9/7X/uv+0/7X/sv+3/7P/w/+//8n/x//S/9L/4v/g/+//9P8BAAQAFAAVACAAKAAuADEANAA9 AEEASABNAFEAVwBdAFUAXgBhAGsAZABuAGcAcQBjAGwAYwBtAGEAZABdAF8AUABdAEoAUgBAAEUA MwA3ACAAJgAJAAwA+//6/+j/5P/T/87/wf++/7D/r/+g/5r/jf+E/4T/d/94/2//dv9p/3j/a/92 /2z/fP9y/4r/e/+X/4r/o/+a/7X/rv/I/8L/2P/X/+//6f/5//b/FAAWAC0ALgA5AD8ASQBSAFsA YQBfAGgAcAB7AHYAggCEAI8AiQCWAJQAnwCQAKEAkQCgAIsAmACGAJQAeQCEAHEAfABeAGcATQBV ADcAOwAjACYACgAJAPT/8v/U/87/t/+y/6b/n/+Q/4z/fv95/3n/bf9p/1z/aP9e/2X/Wv9o/2D/ bf9j/3r/b/+E/33/mP+S/6j/ov+6/7X/yP/I/+D/2//t/+3//f/9/wwADgAZAB0AKwAvAEAAQABG AE8AUABcAFoAYABoAG0AaABuAGoAeABuAHYAcAB5AGcAcwBjAHAAXABkAFMAXQBFAE4AOgA9ACgA KwAYAB4ACAAIAPr/+f/m/+j/3f/a/9H/zf/E/73/vP+1/7b/sv+u/6r/sf+p/63/p/+0/7P/vP+1 /8T/vP/K/8L/0f/P/9n/3P/m/+r/8P/0//j/+/8DAPn/CQALAA8AEgAYABoAGAAdAB8AJQAjACQA JwAsACMAJAAqACkAKAAoACQAJgAbACIAGQAcABEAFAAGAAoA+f8BAPD/8f/e/+T/0//V/8P/vf+7 /7v/sf+p/6j/ov+m/53/o/+f/6f/o/+u/6r/vP+1/8f/wf/S/9H/5f/l//X/+P8HAAsAEwAbACMA KgAyADcARQBIAE0AVgBXAGQAYgBuAG0AeQB1AHsAfgCGAHcAggB4AIAAeACCAHEAeQBmAGsAXwBq AFIAVgBIAEsAOQA7ACoAKgAKAA0A9//8/+T/3f/O/8v/v/+4/6v/of+U/4v/hP99/3b/aP9y/2P/ Y/9Z/2T/Vf9m/1n/b/9e/37/bP+E/3j/lf+L/6j/of+//7T/0v/P/+j/4P/+////FgAaACoALQA9 AEAASgBTAF4AZABoAHQAcgB6AHoAjACAAI8AiQCSAIgAkgCJAJoAhQCRAIAAjQB3AIEAbAB2AFsA ZQBFAFIAOgA9ACgALQAPAA8A+P/6/93/2v/G/77/rv+q/5z/kv+L/3v/fP9v/3D/Zf9r/2D/aP9d /27/Xv9x/2P/ev9s/4j/ef+S/4f/of+X/7f/rP/I/8D/1v/X/+j/5/8AAPn/DAAIABkAGgAmACkA LgA1ADsAQgBFAEsASABSAE0AUwBOAFgATwBSAEoAVQBLAFIARABKAEAARwA2ADkAKQAuACAAIAAN ABEABAAHAPX/+f/l/+f/2P/Y/9D/y//F/8L/uf+3/7j/sf+s/6f/rP+m/7D/pf+y/63/uf+u/8H/ tP/J/8T/0f/K/93/3P/k/+j/9P/z//7//f8HAAwAEgASABoAHgAgACUAJQAnACgALAAvADIALwAw ACsALgAoACwAKQArACIAJAAhAB0AIAAeABgAGAAKAAoAAQD+//P/8P/n/+T/2f/V/8z/x/+8/7b/ rP+n/6X/n/+g/5T/mP+O/5n/jf+Z/4z/mP+O/6H/mP+p/6H/uP+y/8j/vf/Z/9L/7v/s/wEAAAAU ABYAJQAoADMANwA/AEMAUQBXAFkAZABkAG0AZQBqAG0AdwByAHwAcAB1AGoAdABjAGsAWgBgAE0A WABFAEcAOgA7ACYAKwAbABkABQAEAPL/7v/d/9//0P/I/7z/tf+t/6X/nP+U/4v/gv9+/3T/d/9o /3L/Zf9s/1z/af9d/23/ZP91/2n/gv92/4v/hf+f/5f/rf+l/8T/vf/U/9P/6f/o//n/+/8UABAA JwAnADYAOgBAAEYATABYAFYAXgBdAGoAYgBqAGoAcgBoAHQAbQB3AGkAcABmAHUAYABpAFsAYwBP AFQAPwBFAC8ANgAeACUADAANAP7//f/q/+f/0v/Q/8H/uP+w/6T/mf+W/4//hv+B/3r/ev9u/3H/ Zv9z/2X/cv9h/3b/Zf98/27/h/91/5b/hf+h/5j/sf+q/8X/vP/V/9H/5v/k//r/9/8JAA8AGAAb AC0ALAA2ADkARABMAE8AVgBSAFcAVQBeAFkAYwBbAGEAVwBeAFAAWABKAFAAQgBIADgAPgAnAC0A GwAiAAkADQAAAAQA8v/v/+L/4v/V/9P/yv/K/8D/vf+3/7L/qv+h/6n/nf+p/53/pf+Z/6v/ov+v /6T/sf+n/8b/u//M/8T/2f/P/+D/3v/x/+z/AwADABEADQAcABoAKwAvADAANABAAD8ARgBHAE8A UABVAFIAVgBZAFYAWQBXAFoATABQAEwAUQBCAEYAOgA/ADEAMQAjACgAEwAVAAkACQD1/+//5P/j /87/zv+8/7j/rf+n/6L/mf+S/4j/iv9//4L/dv99/3D/gP9u/3z/bv+A/3X/i/+B/5v/k/+w/6j/ wP+3/9f/z//o/+b////4/xMAFgAwAC4AQABBAFIAWABdAGcAbgB3AHsAggB/AIkAggCHAIEAiwB9 AIYAdgCDAGsAdgBkAG0ATwBWAEMARwAtADEAFgAYAAAAAwDu/+3/0v/N/7//uf+q/6X/kv+L/4D/ dP9w/2P/Yf9P/1f/SP9P/zn/TP83/0j/N/9P/0H/W/9E/2n/Vv93/2n/jv+F/6L/lv+8/7T/0v/L //L/7P8QAA8AJwAlAEQAQwBYAGQAagBxAH8AigCLAJYAmgCjAJ8ArwCoALYAqwC4AKgAuACkAK8A mwCnAJEAnAB+AIoAagBwAE8AWgA3ADwAGwAfAP///f/h/+D/vv+4/6X/m/+K/3//c/9h/1v/S/9J /zr/Pv8r/zP/Gv8w/x7/Mf8b/zT/Hf9D/yz/VP87/2X/VP9//2j/lf+I/67/n//L/7//5v/d/wUA /P8fABoANAA3AEwAUQBfAG0AcAB7AHwAiQCJAJIAkwCXAJMAngCSAJkAjQCaAIAAjwB7AIgAbQB3 AFkAXwBHAEkAMQA0ABsAIAAFAAgA8v/z/9v/1//J/8P/tv+t/6T/nP+R/4r/iv98/3z/cv93/2v/ dP9n/3f/bv96/2//hf96/5L/g/+d/4//rf+i/73/tv/Q/8v/5//k//3/+v8PABAAHwAjADIANgA+ AEQATABVAF0AXABeAGcAZgBwAGUAcQBtAHUAZQBzAGAAagBWAGMATwBXAEEASwAyADoAJAAqABUA FwAAAP7/7v/v/93/1f/E/8D/sP+p/53/lv+M/4X/g/91/3f/a/9v/2b/af9f/2b/WP9p/1r/cv9j /4D/cv+J/37/nP+S/7P/pv/G/7//3v/b//n/9f8SAA8AKAAqAEEAQQBWAFkAcAB4AHwAhACHAJEA iwCWAJMAmwCTAJsAlwChAJkAnQCTAJkAhgCPAHkAggBlAHIAUABVAEIARAAlAC0AGQAXAAcAAwDo /+T/1f/J/8T/uf+u/6P/n/+Q/4r/gf96/2r/cv9g/23/Xv9x/2H/a/9e/3D/Xv9+/3L/if97/5r/ jP+u/6H/vP+1/9b/0v/y/+3/CgALACIAIQA6ADkASwBLAF0AXwBsAG0AfgCBAIoAkgCXAJoAngCn AKkAsACpALcApgCyAKQAsACkAK4AmwCfAJAAmwCCAIsAcQBzAF0AYgBFAEgAIQAdABAABgD2//D/ 2v/V/73/uf+o/6P/mf+P/43/gf+E/3L/hf9z/3r/bP+B/3P/hf91/43/fv+U/4z/qf+f/73/sv/Z /9D/8f/q/wMAAAAWABUAMgAvAEsATgBgAGgAcQB1AIQAiwCQAJoAnQClAJoApQCjAKkAowCsAKIA sgCdAKkAlwCgAIoAjQB9AIYAbQB2AGAAZQBNAE8APgBBACcALgAYABQABAAEAPL/7f/Y/9L/xP++ /7L/qP+q/6b/of+W/53/j/+f/5P/o/+a/6X/n/+z/6v/vf+4/8j/xP/i/+L/+P/x/wgAAAAYABkA KAAoADQAOgBDAEUATgBRAFUAWwBtAG4AdQB3AHgAgAB/AIMAfACEAHgAewBuAHUAbQB1AGoAbQBg AGQAWQBbAEgASgAzADcAGAAeAAsAAwD4//b/6v/p/93/2P/S/8z/yf+9/7j/sv+s/6X/sf+r/63/ p/+6/7T/wv+5/9L/zP/f/9r/9//x/xEADwAnACYAPwA9AFQAXABrAHEAeQCBAIwAlgCkAKwAtgC/ AL8AyQDBAMsAugDFALEAuwCwALUAqAC4AKEAqwCPAJkAgACKAGoAcABTAFAAPAA8ACoAJgAXAA8A +v/3/+T/2v/O/8r/t/+r/6b/lv+S/4P/hP9w/3T/YP9w/1j/av9Y/3b/Y/92/2D/hf9w/47/gP+j /5b/uf+u/9b/zv/w/+P/DwANAC0ALgBLAEoAaQBsAIAAiQCWAKEAqwC5AL4AyQDNANwA0wDeANsA 7QDoAPUA7QD4AOkA+QDrAPcA2wDsAM4A4QC/AMwArwC9AJUAogB/AIUAZQBtAEYATgAsACgAEQAO AO//6//X/8//xf/A/7D/p/+a/43/i/97/3z/bf9y/2b/bf9e/2//Xf9w/2L/f/9w/5T/g/+k/5v/ uP+w/9L/y//s/+L/BgD//x8AGwA1ADUATABVAGkAbgB5AIMAlwCfAKQAqwCuALUAtgDBALEAyAC1 AMQAtQDAALEAuwCxAL8ApgCwAJgApACKAJgAggCLAG4AegBlAGwAVQBZAEIASgAsADMAHgAkAAIA BADn/+X/1f/R/8r/v//A/7T/tP+v/7X/qP+z/6f/tf+o/7X/rP/B/7j/z//G/+D/2f/x/+n//f/3 /w4ACQAWABoAJwAnADgAOABJAEkAVgBUAGQAZABpAHEAdgB7AHkAhQCDAIkAigCRAIcAkwCGAI8A hQCSAH4AiQB9AIkAeACGAGwAfQBiAGoATQBWAD0ASAAsADMAGgAgAAcACQD7//f/5//q/9r/2P/O /8j/wv+8/77/uP/A/7n/xv+6/8n/wP/W/8z/5//h//L/6v8GAAUAGwAXADIALwBDAEkAWABZAHAA dQCBAIkAigCUAJoAnwCcAKYAogCsAKIArwClALIApgCxAJ8AqQCjAK4AlACdAIQAkQB/AIcAcgB8 AGAAZwBOAFYAQQBFACwAMAAeAB0ABAAIAO7/8f/U/9j/wf/E/7X/rv+l/5r/lP+O/4//iP+P/4b/ m/+T/6b/nv+x/67/u/+3/8r/wf/f/9f/+P/0/wsACgAmAC0APwBBAEoAUgBgAGUAeAB/AIgAkgCb AKQArwC8ALQAwgC/AMwAzwDbANAA4QDPAN4A0ADgAM8A3ADAAM4AuwDIAKUAswCbAKYAgQCLAFwA ZQBBAEYAJQApAAkACwDw//H/1f/R/8D/t/+m/5//lv+L/4b/c/91/2n/bf9m/27/Xf9u/17/eP9o /4X/d/+Z/4//rf+m/8L/vP/f/9b/9v/x/xAADQAtACwASABSAGAAaQB2AIIAiwCVAJMAogCoALIA rwC+AL0AzwDDANEAzQDfAMcA1gDBANIAuADKAK4AvwCjAK0AmgCsAIkAmABzAIAAWQBnAEoAVQAt ADAAGQAgAP3//P/o/+T/2f/T/8X/wf+0/6//r/+n/6//pf+y/63/sP+q/7f/s/++/7j/yv/F/9n/ 1v/j/+X/+f/7/wwADwAWABcAIQAnADUAOQBFAEQATgBWAF8AZABkAG8AcAB2AHAAegB3AH0AfACD AH8AhgB7AIcAcgB8AG4AdABuAHMAYgBmAFEAWgA5AEAAIgAnABQAGAD//wMA7v/x/+D/4//M/8v/ w/+8/7X/r/+r/6j/ov+e/6P/nf+o/6D/sf+l/7v/tf/J/8f/1v/U//D/6/8DAAYAGgAcAC4AMQBC AEcAVQBdAGsAdQB0AH4AgQCPAIYAkgCKAJwAhwCYAIkAlwCBAJAAfACIAHQAgQBuAHYAYgBpAFMA XQA8AEUALQAuABoAGwAIAAwA8//1/+H/4v/M/8X/t/+y/6X/of+T/4n/eP9v/3D/Zf9l/13/W/9S /1P/Sf9a/0v/XP9T/2n/Xf92/2j/hv98/5b/j/+x/6r/xf/A/97/3v/y//P/CQAOACIAJAA1AEAA SQBVAF0AbQBsAHsAfgCOAI8AnACVAKcAmgCpAJ0ArQCYAKoAlACpAI8AnwCGAJUAegCJAG0AfwBf AG0ASABTAC0AMQAaABgA/P/9/+L/3//E/8P/q/+v/5T/lP99/3X/Zv9b/1j/Tv9F/zj/Qv8s/z// Mv9G/zX/Tf88/1n/Uf9p/1//hP96/5f/jP+0/63/x//L/+r/5//8//7/FgAZAC0ALwA8AEYATQBZ AGAAZgBmAGoAcQB3AHcAhQB+AIwAhACLAIMAkwCDAJQAegCHAHoAiABsAH0AaQB4AFoAagBGAE4A MQBCAB8AJgALABEA8v/2/9//4P/K/8j/uP+z/6n/q/+g/5j/kP+G/4j/f/+E/3b/g/94/4X/ev+G /4P/lP+P/6P/nf+t/6v/vv+7/83/yP/Y/9X/6f/n//T/+f8DAAQADgAUABsAHAAiACkALgAxADYA PgA4AEMAPABEAD4ARQA8AEQAOQBEADkAQAAuADIAKAAvABkAHQAGAAwA+f/9/+z/7P/Z/9r/w//J /7T/tP+g/57/k/+L/4T/eP92/3H/bf9h/2f/Xv9n/1n/af9i/3b/bP+D/3j/k/+F/6X/nf+7/7P/ zv/L/+T/6f/+//7/GgAeADAANQA/AEUAUABVAFcAYQBbAGIAYQBoAGUAagBfAGoAWABgAFQAXQBM AFMAPwBEADEANAAhACYAEgAVAP//+//r/+b/z//Q/73/uv+j/6D/j/+I/3X/bv9c/1H/Sv9B/zv/ Lf8y/x//LP8Y/yj/Ev8k/w7/Iv8S/yf/G/84/yj/Q/81/1r/S/9x/2T/gv99/6L/mf+4/7X/0f/K /+r/5/8EAAIAFwAYACoAMwA9AEYASwBYAF4AZwBiAGsAZQBwAGwAdABqAG8AawBzAGMAbQBeAGYA TwBZAEMASwA7AD4AHQAiAAoADgDx//b/3//e/8X/xP+r/6f/kf+J/3j/b/9f/1v/S/89/0D/Lf8t /xr/JP8O/xv/Df8h/w3/J/8T/y3/If88/y3/T/9D/2H/Uf94/3H/jf+I/6b/oP++/7//2v/X/+v/ 7P/9/wAACgANABwAGwAkACMALQAvADUAMwAxADUALwAzADAANwAsAC8AJgAoABsAIAASABgACwAN AAAAAwDw//b/5//o/9b/1f/E/77/rv+q/6H/m/+Q/4z/hv97/3X/av9t/17/Z/9Y/2L/UP9f/1H/ YP9V/2b/Wf9w/2X/e/9x/43/f/+Y/4//rP+h/7n/rv/J/8P/1//P/+X/5f/v/+///f/6/wQAAgAP ABAACgAOAA8ADQAIAA0ABwALAAEAAgD///7/+f/4//T/8f/r/+v/4v/e/9T/z//P/8X/tv+1/6z/ qP+d/5b/kv+J/4H/dv9z/2f/YP9U/1L/Qv9D/zX/Pf8r/zj/Jf83/yX/Nv8q/0H/Mv9T/0L/Zf9T /3X/af+R/4L/p/+Z/8T/t//c/9P/+f/1/wsACgAgACAAKgAsADgANgA9AEAAPABBAEQAQABDAEQA QAA+AD0APQAwADAAJgAnABkAGgAQAA8ABAD9//X/6//e/9j/0//L/7n/sP+q/53/kv+F/3L/Yv9l /1L/Tf87/zz/Jv8u/xP/GP8G/xH/+/4M//H+C//r/gr/7P4R//f+H/8D/zP/F/9B/y3/V/9F/3P/ XP+O/3//p/+b/8j/vP/i/9j/+f/5/xAADgAtACkAQgBFAFIAUwBbAFwAZgBmAGgAbABtAG8AbQBw AHEAcQBoAG8AXQBnAFUAVQBFAEkANQA0AB8AIAAHAAcA8v/p/9T/1P+9/7X/m/+R/3z/b/9c/07/ Rf8v/yv/E/8Q//f+AP/l/vb+2P7r/s/+6P7O/uz+zf73/tj+Av/l/hT/+P4k/wn/Pv8m/1f/Qf9t /13/h/9z/6L/kf+1/6b/xf+4/9T/zP/l/97/7//o/wEA9v8FAAAADQAGAA8ACgATAA4AFQAOABUA EwAUABAADgANAAYACgAGAAMA/P/5//D/7v/e/9//0v/L/7//vf+3/63/pf+W/5b/h/+I/3j/ff9s /2//Wv9q/1j/Yv9V/2j/Uf9n/1f/dv9h/33/bP+E/3r/kv+C/6D/j/+r/5//tf+r/8D/s//L/8D/ 0f/B/9j/y//Y/83/1//K/9L/xv/S/8b/0P/A/8r/vv/B/7f/vP+t/7r/rP+x/5//pf+S/5z/iv+R /37/i/90/3z/aP9z/17/Zv9Q/1r/R/9S/zj/TP81/0T/K/86/yP/Mv8Z/zf/HP87/yT/Qf8t/1D/ N/9f/1D/dv9k/4//fv+p/5//xv+x/+L/1P8EAPj/FwATAC8ALAA9AEIAUABPAFIAVwBdAFwAYABf AFgAVwBRAFMASQBJAD8APAAvACsAHAAXAAwAAQD5/+v/5//X/9L/xP++/63/pv+T/5L/f/97/2v/ Zv9P/0v/Lf81/xv/Iv8H/xH/9v4G/+b+/f7b/u/+0f7x/sz+6/7M/vH+0/79/t/+DP/u/iH/BP87 /yT/Wf87/3H/Wf+R/3r/r/+f/8z/vf/r/9//BQD9/yAAFgA7ADUARwBBAFgATwBeAFsAYwBhAGMA YABhAGYAYwBiAFoAWQBSAFMASABAADsAOAAqACUAFwARAAEA+v/y/+T/2//N/7z/sP+p/5j/jf94 /3H/Wv9T/z3/Of8d/yH/Af8L/+/++/7d/vX+1P7s/s7+9v7R/vb+0/4F/+X+FP/z/iT/B/8//yL/ WP8//2//YP+R/3z/qv+V/8H/s//a/8f/6f/e//n/7P8KAP7/DwAFABgAEAAgABYAKQAbACcAHwAj ACEAIwAcAB8AHQAaABYAFgARAAwACAADAPz//f/0//D/6f/d/9D/0P+//7v/sv+p/5r/mv+I/4// e/96/2f/bf9Y/2L/Sv9j/0j/X/9G/1z/P/9k/0v/cP9Z/3b/XP+G/3D/lP9//6P/iP+2/5z/yf+2 /9b/wv/e/8//6P/e//T/4v/+//H////x//7/8//9/+7//f/v//7/8//5//D/+//u//H/4v/r/9// 3f/Q/9j/zv/O/8L/zP+1/77/sv+2/6X/o/+X/5n/j/+N/4L/gP9t/3D/Xf9n/1f/Xf9L/13/R/9a /0T/Xf9H/13/S/9r/1n/fv9n/4//ff+k/5H/vP+v/9f/zf/y/+n/BQD8/xwAEgAoACMANwAxAD0A PQBHAEMASABAAEgAQgBEADoAOAAzADAAJwAhABkAEwAIAAQA+//w/+b/5P/X/87/xv+//6z/rP+Z /53/i/+G/3L/b/9V/17/Qv9J/zP/PP8j/y7/FP8k/wr/Gv/9/hH/7/4T//b+EP/t/hr//f4l/wX/ N/8a/0b/L/9g/0X/ev9k/5n/gv+z/53/0P/C/+j/2/8GAPz/GwAUADoANQBRAEwAXwBfAGUAZgBv AGsAcwBzAHQAdQBwAG8AbwBrAGMAZABfAF0ATQBOAEQAQAAyAC4AJgAgABEACgD///f/6f/d/9X/ w/+3/6j/ov+O/4T/cv9n/0//Sf8z/zb/GP8h/wT/Ef/2/gj/5v4H/+T+A//k/gn/6f4V//b+Kf8I /z3/IP9Y/0D/bP9U/4v/dv+o/5D/wf+1/9T/y//w/+T/CQD+/xkAEgAmACUANQA1AEAAPABOAEgA TgBJAFIATQBTAFMAVgBQAFAAUQBPAFAASgBHAEQARAA8ADcALAAqACAAGwAVABEAAQD8//L/5//c /9D/zP+//7T/oP+g/5L/j/9+/4D/Z/9v/1r/Zv9O/17/S/9e/0r/Yf9G/2j/Tf9w/1f/f/9k/4n/ dv+Z/4T/qv+Z/7X/p//B/7T/z//E/9f/0P/k/9r/7P/g//b/7v/8/+z//v/y/wkA/P8QAAYAFQAQ ABkAEwAeABYAIQAXAB4AGQAeABoAHQAcAB0AFQAPAAwACAABAPf/8v/s/9//1f/S/8T/vP+4/6v/ qv+g/5//jv+U/4f/jP99/5D/ev+S/3r/lP+C/5n/iv+k/5X/tv+n/8n/vv/c/8//6f/j//j/8v8G APz/EwAPABwAGQAiAB8AJwAlACgAJAArACYALAAiACMAHQAcABUAFgALAA4AAQAKAPv////0//T/ 6P/p/+H/5//V/9j/x//M/8H/wv+1/6//pf+d/5D/lP+F/4b/d/98/2P/av9c/2b/Uv9e/0z/Yv9M /2L/Tf9q/1X/cP9k/4H/c/+W/4r/p/+e/8P/s//a/87/8P/l/wMA/v8dABMANAApAEMAQwBLAE4A XABdAGMAZgBmAGoAbwBtAHQAcgBzAHMAbwBwAHMAbwBmAGYAYwBhAFkAVgBNAEUASQBBADsANwAp ACUAEgAOAAAA+f/p/+H/1P/L/7z/sP+d/4//hP90/3X/Yv9l/1D/Wf9D/1D/Nv9G/zH/Sv80/1D/ O/9X/0T/bP9Z/3r/bP+R/4H/p/+f/8H/tv/U/83/8v/o/wcAAgAZABoALAApADwAOgBFAEUAVABW AF8AYwBiAGcAYwBoAGYAbABkAGkAZgBoAGMAZwBgAF8AWQBVAFIAVABHAEcAOwA4ACwAKgAaABsA BwAFAPP/9P/f/9j/zP/H/7f/sf+p/5z/nP+K/43/fv+C/3P/gP9u/4L/b/+A/3X/i/98/5T/hP+h /5H/q/+j/77/s//P/8b/2P/U/+j/4//6//T/BwADAA4ADQAWABgAHQAeACcAIAAjACIALAAoADEA KwAvACoAMgAwADUALQAzAC8AMwA0ACoALgAtACwAJgAqACEAIgAXABUAEAAPAAIAAwD1//b/5P/l /9r/1P/K/8P/wP+5/7r/sf+y/63/r/+l/7L/pP+2/6z/wP+y/8z/wv/Z/9H/7P/l/wAA/f8PABAA IwAiADEAMQA8AEIARABKAEsAVABRAFUAVQBZAFQAUwBOAFQARQBKAEIAQwAyADIALgAsACEAHgAW ABUACQAIAAIA///y/+7/7P/o/9v/0v/H/8P/vP+z/6z/qf+h/5j/l/+T/4b/hP9//3b/dP9s/3P/ aP9y/2P/df9k/3r/cP+F/3j/lP+M/6X/oP+2/7L/0v/M/+n/6/8HAAgAGgAjADgAPgBMAFAAZgB1 AHYAhgCHAJoAlQCkAJ0ArwCdAK4AnwC0AKAAswCiAKwAmQCmAJMAoACHAJQAewCKAGsAeQBeAGYA SwBXADwARQAkACoAEAAUAPj//v/f/+b/xP/D/6v/ov+L/4T/eP9v/2L/WP9W/0v/Sf87/0L/Nf88 /y//QP8w/0z/O/9Z/0j/av9e/4H/fP+Y/4//t/+z/8r/0P/u//D/CQANACQAKwA4AEAATgBcAFsA ZwBuAHsAfwCPAIcAlQCQAJgAjgCgAI4AoACKAJ8AjACbAIMAlwCCAJEAegCGAG4AewBfAG0ATgBZ AEAASwArADoAHQAkAAkAEgD1/wAA3v/j/9H/0f+6/7z/q/+s/5//nP+W/5P/lP+O/5b/jf+U/43/ nv+T/6T/n/+0/7D/vv/A/87/z//e/+X/8v/2/wMACQASABkAHQApACsAMQAxAD4ANQBFADsARwBA AEoAQABMAEUAUQBBAFUAPwBRAD0ASAA7AE4AOgBGADcAQwAtADcALwA0ACQAMAAcACcAEQAYAAkA EQD5/wMA8P/4/+b/6P/g/+f/0f/W/87/zf/K/83/yv/K/8f/zf/U/9b/3P/Z//T/9/8DAA0AGwAj ACwANABCAFEAUABjAGQAdABvAIAAfgCWAIUAnQCMAJ8AiwCfAIoAnACBAJYAeQCRAGwAgABkAHAA VABhAEcAVAA8AEIALgAyAB4AJgASABoA/P8FAO//9f/f/+D/z//V/8X/x/+6/77/rf+x/6P/of+U /5r/j/+T/4j/i/+I/4L/hv+G/5D/jv+a/5j/qf+v/7j/vP/I/83/4f/u//n/AAAVAB4AKgA2AEcA VwBfAHEAdACOAIYAoQCVAKgAoACyAKEAuwCmAL4ApQC9AKIAvACeALIAlwCqAI8ApgCBAJcAdgCN AGoAfABZAGsASgBaADcAQQAnAC8AEwAbAP3/CADq//H/0P/V/7b/uP+h/6P/jf+Q/3//ff9w/3P/ av9h/2X/X/9f/17/Yv9c/23/aP95/3X/jv+M/6L/oP+5/7j/0f/U/+r/8P8FAAsAIQArADcASQBS AF4AYAB5AG8AgwCAAJUAkACoAJcArgCcALQAnwCyAJ4AswCcALEAlwCrAJQAqgCJAKMAhQCZAHsA lQBrAIEAYABxAFIAawBAAFQAMwBBACMAMQAQAB4A+v8GAOf/9//S/9z/w//J/7b/uv+r/6//o/+m /6D/o/+g/6P/o/+j/6r/rv+2/7z/wP/D/9H/1//f/+j/7v/7//z/CgANABgAGAAjACQAMQAtAD8A NQBHADoATgBAAE4ASQBaAEwAXgBPAF4ATABnAFIAYQBRAGYAVgBsAFQAaQBSAGkAUgBmAE4AXgBC AFwAPABRADAAQgAfADEAFgAnAA4AGgAAABAA8v/+/+r/+f/c/+z/2P/m/9j/4f/W/+L/3f/l/+3/ 8P/3/wIABgARABIAIQAkADEANgBBAEIAVQBQAGEAWwBvAGcAfQBvAIUAcwCFAHQAjQBzAIoAcQCI AG8AgABoAHUAXABuAFcAbABMAF8AQgBXAD0AUAAyAEcAHAAsABkAKAAHABkA/v8MAPX////m//P/ 1v/l/8b/z/+4/8P/q/+2/5//o/+X/5v/k/+X/5T/lP+T/5X/n/+c/6r/qf+0/77/xv/M/9//4v/v //X/CAANAB4AKgA1AEkASABcAGAAdwBsAIEAewCSAIcAoACQAKcAkACwAJoAuQCeALYAngC/AJYA tQCUAK8AkQCoAI0AogCAAJgAdQCLAGgAgQBbAHYARgBeADcAUAAeADYABwAaAPD/BQDf//H/wP/U /7j/w/+q/6z/mP+d/4n/iv+B/4T/fP+B/4D/gP+E/4X/jv+T/5T/nP+q/7T/vv/H/9P/4P/r//X/ AgAQABkAKAA5AEUASABcAGIAdwBwAIgAggCbAIsApgCVAK0AngC3AJsAvQCjAL0ApADAAJ4AvgCe ALwAnAC3AJAArQCOAKwAgwCbAHEAjwBlAIMAUwBrAEUAXQAyAEoAHgAyAAsAGwD9/wsA5v/y/9X/ 3//N/9T/xf/L/7z/wv+5/8P/uf/D/8T/z//O/9X/1//g/+H/7v/1/wEAAQAPABMAHwAeACoAKQA9 AC8AQQA9AEwARABVAEQAWwBKAGAAUABjAE8AYgBYAG0AVABqAFwAbQBXAHAAWABtAFkAbgBSAGoA TABnAFIAZQBEAFsAPQBUADMASQAmADwAIAAvABIAJQALABgAAAAOAPP/BgDp//z/5P/x/+L/7f/c /+v/5P/0/+v/+v/5/wMA/v8NAA8AIAAXACcAJwA5ADcASgBFAFYAUABeAFgAawBeAHUAZgB8AGkA fwBlAH0AZAB8AGAAeABeAG4AUgBqAEkAXABFAFEAPABKADEARQAiADIAFgAmAAsAGAADABIA9/8E APD////j//P/1P/j/8r/2/++/9D/tv/E/7b/w/+t/7L/p/+1/6j/tf+x/7//t//I/8H/zP/R/+D/ 5v/y//b/BwANAB8AIQA2ADsATwBLAGYAYQB6AG0AhwB8AJkAgwChAI0ApwCSALIAmQC2AJUAqwCV AK8AkQCqAIIAogCCAJ4AeACPAGsAgABiAHQAUwBlAEUAWQA2AEsAKQA9ABYAKgAGABMA7f/8/+D/ 7v/V/9v/xP/K/7X/vP+p/6//nP+g/5D/mv+P/5T/iv+R/47/lf+a/57/n/+r/7H/u//J/9T/1//e /+///P8FABUAFwArADAAQQBAAFQAUQBtAGQAgwBzAJEAgwCeAIYAoACJAKQAhwCkAI8ApgCLAKcA hQChAIMAmgB8AJUAdACMAG0AgwBoAHsAWABtAE0AYABEAFcANwBKACoAPgAeAC8ADAAbAP//CgDw //v/5P/r/9X/3P/P/9T/x//S/8P/y//E/8v/xv/M/8r/1f/W/+D/3P/s/+r/9f/1////AwASABEA IQAaACYAHwAwACsAOwAwAEIANgBGADgASgA5AE8AOQBFADcASAA4AEkANQBEADAAQQAvAEAAMQBB AC0ANQAnADsAKAA2ACIALgAiADEAGgApAA8AJAAUAB0ACQAVAAMAEQD5/wcA+P8EAPP//f/v//j/ 6//3/+3/+P/x//r/+/8GAAAACwANABcAFwAlACAAMgAvAD4AQABQAE0AXgBbAG0AYwB2AGgAfQBv AIgAcACCAGoAgABnAIAAXgB0AFkAZABJAFoAPABMADAAPwAlADMAFgAiAAgAFQD7/wkA8v/7/+b/ 8f/f/+X/1//i/9b/3P/K/9L/xP/O/8L/zf+7/73/tP+7/7n/vv+0/7f/vv+8/8D/xf/S/9f/1P/a /+T/7f/4//7/DgAWAB8AKQA2AEYAUQBeAGwAfgCBAJMAkwCqAJ4AtgCuAMUAtwDPAL4A0gC+ANIA wADZALkA0wCzAMsAqQDAAJ8AtwCSAKcAhACXAHIAhQBdAHMATABbAD0ATQArADYAFQAjAP3/CQDt //L/2f/c/8T/yv+u/7j/of+k/4//j/+F/4X/fP99/23/b/9w/2n/c/9s/3T/cf96/3n/if+H/5f/ mP+x/7P/wf/F/93/4f/v//b/GAAdAAQBJAEDAScBxADgAPAAEAFbAYwBdQGlAWIBjQFSAYIBXQGL AXEBoAFqAZ4BQAFxARwBRwESATwBBAEuAcwA+QCZALsAewCgAGIAewAvAEMA9/8FAMb/y/+f/6X/ dP90/0D/N/8N///+5P7S/sT+sP6t/pD+h/5q/mr+Sf5e/jf+Vv4v/lL+Kv5U/i/+Yf45/nT+UP6O /mj+rf6I/sv+rf7y/tn+F/8D/0n/N/93/2X/o/+e/9H/yf8GAAIANAA0AGEAbQCLAJoAvADPAOgA /AAOASoBKwFOAUwBdQFjAZEBeQGoAYQBvAGQAcMBjwHDAYwBvgF8Aa4BawGfAVIBgwE3AWIBEAFB AewAGAHEAOgAoQDCAHQAlABUAG8ALgA/AAsAHgDp//H/zf/P/6z/rv+Y/5D/e/9z/2L/WP9K/z// N/8n/yT/DP8M//r++P7l/ur+0v7a/r3+zP6r/rr+n/64/pf+t/6T/rn+mP66/pn+x/6n/s3+r/7p /sz+Bv/o/iT/CP9E/yn/af9X/5D/hv+5/7f/4v/e/w0ADwA2ADsAXgBnAIkAlgCsAL8AzgDqAO0A CwEMAS8BLwFVAUYBbgFcAYcBcgGaAXoBqAGGAbsBkgHGAZEBwwGMAb0BfwGtAXIBnwFYAX8BPAFl ARMBPAHyABYByADkAJ0AswBxAIMAPABIAAcADgDV/9b/of+g/3H/af87/zD/FP8E/+r+0f7G/qv+ n/55/n3+Wf5c/jP+dP5R/oH+Y/5X/i7+VP4u/nL+UP6A/mL+iP5o/pv+gP7D/qr+7/7a/h3/Ef9X /03/if98/8D/wP8KAAwARQBOAH4AkADAANMA+wAUASYBRQFcAXoBjAGwAaMBzQG5AekBywHzAcQB 9QG/AfEBtwHgAaIBywGIAaoBZQGHAUEBWwEYATMB7AAEAb0AygCJAJIAWwBeACsAIwD7//H/xv+6 /5j/hf9k/07/PP8i/wz/7P7Y/rj+tv6V/p3+c/6J/lz+dv5N/mv+R/5t/jv+df5J/oD+Xf6O/m3+ qP6I/r3+pP7r/tD+EP/9/jb/Jv9p/1z/i/+I/77/uf/q//D/EwAbAD0AUABoAH0AmgCwALwA0ADW APAA9wAXAQ4BLQElAUYBOgFdAUoBbQFUAXIBVgF9AV4BewFaAX8BTAFtAT0BWAElAUkBDAEkAe8A AQHLAOEAqQC0AIYAjgBiAGUAPQA8ACAAHQACAPf/6P/a/8r/vv+5/6b/pf+S/5r/iP+R/3j/hv9w /33/Zv96/2X/cv9b/17/Sf9b/0P/U/88/07/OP9H/zD/P/8p/zf/H/8v/yD/Lf8e/zT/JP8u/yH/ Mf8e/zf/KP9H/zT/Vf9I/2j/X/99/3j/l/+R/7H/qf/K/8j/6f/o/wAAAwAgACcAQgBQAF0AcACA AJAAlAClALUAxADKANoA5gD4APoADwERASsBHgE2ATMBTQFKAWQBTwFmAVQBawFQAWUBRAFaATkB TgEyAUYBIgE7Af0ABwHlAPEAxADMAJkAoQBsAHEAQAA6AA4AAwDl/9n/t/+r/4z/fP9f/0n/PP8o /xf//f71/tX+yf6q/qL+f/6P/mn+eP5N/mj+Qv5j/jr+Xf41/l3+Nf5m/kD+dP5O/ob+Z/6q/ob+ 1P60/gD/5f4z/x3/bf9a/6f/nv/p/+L/KQArAG4AcgCxALsA8QD+AC0BQAFsAYoBkwGzAbcB1QHM AfEB3gEDAtsBBQLcAQEC0AHyAcEB5AGlAcUBiAGmAWcBfgE8AVIBEAEhAeAA7wCqALcAeAB+AEcA SQAUABIA4//Y/7H/p/+A/3D/Uv85/x3/+/73/tT+0v6z/rr+mf6i/nz+kv5o/ob+Yf6G/mH+iv5e /pr+c/6o/oD+vP6Z/tz+v/75/t/+Hv8H/0//Of9t/13/lv+K/7v/tP/l/9z/BQD+/ywAMgBSAFgA dQB+AJIAmwCpALcAxgDTAN0A6QDxAAAB/wAPAQ0BHgEYASkBFwEsAR0BMQEWAS0BDwEjAQABFAHz AAQB1QDhAL0AxgCaAKQAhACLAGYAaQBLAEwAMgAtABoAEwAAAPv/9P/p/+P/1v/X/8f/zv+7/8v/ tP/G/7H/wf+0/77/sv+7/6z/sf+h/7D/mv+j/5P/of+O/5b/gf+N/3v/f/9t/3b/Yv9r/1T/YP9I /1f/P/9M/zX/QP8l/0P/Lf9B/y3/Sv81/1H/Pv9g/0X/b/9Y/3z/bP+N/4D/pv+a/8H/tP/l/9// /v/1/x8AFgA7ADkAVwBdAHkAfACZAKEAuQC/ANsA4gDvAPsAEAEhAS4BQwFEAVYBVQFtAWEBeAFm AXsBZAF4AV0BdQFQAWYBQQFUASoBOQEJARQB6gDyALkAwACSAJYAXgBbAC8AKwACAPf/1P/G/6X/ kv98/2f/UP83/yb/CP/6/tj+y/6m/q3+hf6U/mf+gf5P/nH+QP5j/jb+YP4v/mL+Lv5h/i7+bf49 /oT+V/6i/nT+y/6l/vb+2P4x/xj/av9P/63/lf/u/9//MwApAHUAcwC4AL4A9gD/ADcBSQFwAYkB ngG5AcMB4AHaAfgB5AEKAvABDwLrARAC4gEAAtEB7wGzAdIBkgGxAW8BjQFBAVgBFQEqAekA9QCy AL0AhQCLAE4ATQAeABYA7P/i/7f/rf+H/3L/TP8y/yj/Cv/5/tf+2/66/r/+nP6u/oT+nP5w/pX+ af6Q/mf+nP5s/qT+dv6t/oP+yf6g/ub+vf4D/+H+Jv8G/1D/Mv9z/1X/lv+C/7j/pP/b/8j/+v/r /xkAEwBAADsAXQBcAHwAegCNAJEAowCkALsAwwDPANgA4gDpAOsA+QD3AAQB/QAKAQUBDAECAREB AQEMAfUABgHqAPQA3ADkAMYAzwCzALkAmACdAIYAiABsAG0AWgBXAEUAPQAyACkAJAAZABYADAAK APv/+//s//b/5f/t/9z/5P/W/+D/yP/U/7z/xf+v/7v/pv+o/5T/mf+D/47/df96/1//ZP9K/1H/ Ov8+/yT/Mf8S/yP/A/8R//H+Cv/n/gj/4v4M/+v+Ev/1/iH/Av8u/xX/P/8q/1n/Pv9w/1n/hf93 /6v/of/L/73/8P/k/xIACQA0AC8AVgBXAH8AewCfAKUAwADJAOEA7AAFAQ0BJwEzAUsBXgFhAXgB cQGGAXsBkQF8AZMBfgGRAXQBiwFqAX0BUAFiATcBRwEYASUB9AD2AMcAzACXAJcAaABjADcALQAE APb/1v/E/6L/kP90/1z/Tf8w/x3/+v7m/sH+yf6e/qT+eP6P/mL+ef5H/mX+O/5c/jD+Vf4p/lT+ Jf5Y/ij+Y/41/nr+T/6Y/mv+vP6T/uX+w/4U//b+S/80/4v/dP/K/7r/DQADAE0ASgCTAI8A0ADX ABgBJwFJAV4BeAGPAZsBtAGyAdEBxQHjAdAB8QHOAfEBygHuAb8B3gGwAcsBlAGyAXMBkQFOAWMB LQE5AfwADAHSANwAowClAHQAdABAADsAEAAJAN3/0v+i/5b/cv9g/0v/MP8g/wD/+/7Y/t3+tP7D /pr+qv5//p3+b/6V/mL+l/5m/pb+Zf6e/m3+rf6A/sD+kv7Y/rD+9/7O/hH/7v4y/xP/Tv83/3j/ Xf+X/4D/u/+m/+H/y/////f/IgAWAEIAOgBdAF8AfQCEAJkAoAC4AL8A0QDYAOkA9QD4AAYBCgEh ARMBKgEdATEBHQEyAR0BLAEMAR8B/QAUAegA/ADcAOkAxgDLAKgArACSAJIAfgCBAGUAYQBUAEsA PAAxAC0AIAAXAAkACwD8//n/7f/w/9//6P/X/9f/xf/F/7b/vf+p/67/lv+c/4L/if9x/33/Yf9n /03/W/87/0j/LP85/yH/K/8J/xX/9f4S/+z+Df/t/gv/7f4R//H+Hf/7/iT/B/8x/x3/SP8v/1j/ Qf9v/17/iv93/6n/nv/K/7z/6//d/woAAwAvACoATQBOAHIAdgCRAJgAtAC9ANMA4AD+AAwBJAEz AToBUAFSAWQBZAF7AWQBfQFqAYEBawF/AWsBfQFcAXEBSwFdAS4BQgEWASMB7gD4AMkAzwCaAJkA bgBuAD0ANwAPAAAA2P/J/6//of99/2f/Wf88/yj/Av/x/sv+zP6k/rH+hv6T/mj+gv5R/mv+Pv5b /jD+T/4n/lD+IP5U/iP+Wv4y/m3+Pv6H/mb+sP6K/tv+t/4L/+3+Pf8m/3r/Zv+4/6n/+v/v/zkA NAB+AHsAwgDHAPYABQErATwBVQFsAXoBlAGSAa8BrQHIAbEB0wG7AdcBsgHSAa8ByQGeAbkBhAGh AWcBfQFFAVIBHAEqAfIA+QDIAMoAmQCaAGkAaAA8ADUACAAAANf/yf+l/4//e/9n/1P/Of8t/xL/ D//n/vL+z/7c/rT+zf6o/sH+l/67/pD+uP6O/rn+kf7B/pr+0f6l/uH+uP73/tX+EP/t/if/CP9A /yf/X/9F/3D/XP+Q/3//rP+Z/8P/t//h/9P/9f/r/xEABwAtACUARgA+AGMAXgB1AHgAjACOAKQA pAC3ALoAwwDPAM0A2wDiAOYA4ADqAN8A7ADdAOsA2gDnAM8A1wDDAMkAtQC6AJ8AqQCYAJwAhwCF AHUAeABpAGgAVgBSAEwARwBAADkAMQAoACYAHwAfABQADwAHAAAA9P/y/+P/3f/P/87/vP+5/6f/ pv+V/4//ef9+/2L/Yv9I/0v/NP82/xz/Hv8A/wX/4/75/tn+6v7J/uj+xf7s/sr+7v7K/vX+0v7+ /uH+Df/v/iP//v45/x7/V/8+/3H/Yf+Z/4X/uv+q/+H/0v8CAAAAKwAlAFMATwB5AIIAnwCmAMoA 0gD3AAgBFAElASwBQQFKAWABXgFyAWYBfAF2AYwBdgGOAXUBiwFqAX8BWQFrAUIBTwEfASwB/AAL AdQA2wCsAK0AfQB3AEYAQgAdABUA8//n/8L/tf+Z/4b/Z/9P/zD/Dv8T/+v+8P7N/tH+pv63/pD+ qP5//pH+ZP6I/l3+f/5T/oD+VP58/lP+gv5Z/pb+a/6x/o3+1/6z/gT/5/4z/xn/Y/9N/5z/hv/X /8z/EwALAFQAUACbAKEA0wDdAAkBGgE3AUwBWgFzAYIBkwGUAbMBpgHGAa0BzQG0AdMBrAHKAa0B xgGeAbgBhgGjAWkBgQFIAVsBIAE1AfkABwHRANoApQCpAHcAewBKAEMAGAASAOj/3//G/7H/lP98 /3X/XP9R/zP/LP8S/xv/+v4J/9r++f7P/ur+w/7l/r7+2P6z/ur+w/7z/s7+Af/e/hb/8v4r/w// Q/8r/2L/R/9+/2r/mf+E/7D/nP/T/8j/6//d//7/9f8XABIANgAvAEwATgBtAGkAfACDAJIAnQCq ALEAuwDDAMQA1gDfAO4A6QD2APUABAH2AAkB9QAIAfAA/QDvAPsA5wD5AOIA7wDUAOEAzQDWAMIA yQCzALwAnACgAIkAkwB4AHsAbgBqAGcAWwBYAFUATwBKAEcAPwA8ADUALAAmABkADgAKAP//+//o //D/4f/h/83/zP/B/7r/o/+p/5X/j/94/3j/Xv9a/z//Q/8k/zn/Hf8v/w7/Jv8G/yP/Cv8e/wX/ I/8L/yb/EP8x/xv/QP8r/1P/O/9m/1n/h/97/6P/lv/G/73/7P/f/w0ABQA4ADUAXQBbAIUAigCs ALMA0gDfAAQBFQEmATsBSAFhAV8BdwF7AZABhwGgAZUBrwGaAbIBngG3AZABrgGMAaABegGOAWcB ewFDAVMBIwE1AfoABQHIANEAnQCdAGgAaAA9ADcADQAAAN//z/+s/5j/bv9Z/0z/Mv8m/wj/A//h /t/+v/7J/qX+rv6G/p7+dP6I/mD+hP5c/oH+Wf6G/lv+l/5v/q/+iP7H/qL+7v7N/hr//f5I/y// ef9p/67/ov/v/+r/LQAnAG4AbwC0ALkA8wABASoBRAFWAW4BgQGbAaMBvwG8AdwBzQHvAdoBBALZ AQIC2wH9Ac4B7wG5AdcBnAG4AX8BlwFcAXIBPgFQAQwBIQHgAO8AsgC3AIYAjABTAFcAJwAnAAAA 9v/Z/83/rf+Z/4n/eP9r/1H/Q/8m/yj/Bv8M/+7+9/7b/vT+z/7m/sP+5f6+/un+yP70/tH+/P7e /hH/8/4l/wr/OP8f/0v/N/9m/1P/fP9p/5z/iP+3/6b/1v/M//H/5v8OAAcAKAAgAEEAQQBaAF4A dQCAAIoAlQCiALEAugDGANYA5gDjAPkA/QATAQoBHgEVAS8BGwEzARsBMAESASgBEgEqAQsBIQH7 ABAB8wAGAeoA+wDcAOoAywDZALkAwwCnALAAmAChAIwAkQB+AIIAbQBuAFsAXwBGAEoANQAyACIA GwAIAAYA+P/z/+z/4//W/83/w/+x/6f/lP+P/3r/ev9m/17/SP9E/yr/OP8d/x//Bf8S//v+Df/3 /gv/7/4N//P+E//5/h3/Av8w/xf/R/8s/1v/Sf93/2r/k/+J/7P/q//c/9j/AQD+/y0AKQBUAFwA fwCHAKEArwDHANIA+gANASUBQAFCAWMBZQGCAXcBmwGGAaoBmAG9AaEBwwGnAcwBpAHIAZYBuQGK AaoBeQGYAVwBeAE7AVIBEgEoAfIA/gDFANAAmwClAG8AcgBBAD8AGAARANv/zf+o/5f/fv9j/0r/ Nf8m/w3/A//q/uf+y/7V/rf+vf6k/q7+jf6h/oD+nf5+/pT+ev6W/nv+rP6L/sH+pP7b/sL+/P7i /iT/DP9M/zn/ev9t/7X/sP/q/+b/HQAfAGAAZQCPAJwAyQDWAPMACgEiATkBSAFlAWoBjAGEAacB mQG9AaMBxQGqAc8BrwHUAZ8BwQGNAbUBdwGbAWIBfAFEAVwBJAE/Af4AFgHbAPMAswDDAI4AmwBm AHUAPQA7ABIAEwDp/+X/vf+3/5v/jv95/23/X/9L/0X/Lv8w/xn/I/8L/wr/9f4D/+7+A//p/gL/ 5/4T//L+HP8C/yT/Dv83/yX/R/84/1j/Sv9t/1v/gf94/5n/kP+x/6v/zf/Q/+f/5P/9////GwAb ADQAOQBNAE0AXQBjAHMAewCKAJQAoQCxALYAyQC/ANIA1ADpAN8A9wDpAP8A6QAIAewABgHrAAMB 6AACAeUA/ADnAP0A4QD2ANoA7gDJANsAtwDJAKsAtwCgAKsAlgCbAIMAkAB7AIQAcgB3AGAAaABW AFUAPwBBADIALgAgABwACQAFAPT/7v/d/9r/x/+7/6z/pP+T/4v/dv9n/1H/Qf8+/y//Iv8Q/xH/ +/4A/+j+9/7j/ur+1v7j/tH+3v7M/uT+y/7p/tf++/7m/gn/9/4h/w//P/8u/2H/VP+C/3v/qv+n /9D/0f/8////JgApAFMAWgCFAJMAvADRAN0A9QAFASYBJAFCAUkBZwFcAXsBbwGSAXkBnQF8AaQB fQGkAYMBpwF2AZgBXwGBAUIBZQEqAUYBAQEgAdUA8QCvAL8AfwCQAFAAXAAcACIA7P/u/7P/s/98 /23/T/8+/yP/EP/1/uL+0P63/rP+l/6T/nD+eP5V/mP+QP5b/jX+TP4p/kz+J/5P/i7+Y/5B/nX+ Vv6V/nv+tv6c/t3+y/4G//P+Ov8s/2f/Xv+k/6H/4v/l/xoAIQBQAF8AiACSALsA0gDlAAMBEAEt ATUBVgFQAXUBaAGNAXYBmgGDAaoBhwGyAYEBrAFyAZgBWQGAAUgBcQEvAVQBDAEpAecA/AC7ANEA lQCrAGYAdAA4AEEACgAOAOX/5v+8/7n/lP+R/3H/bP9W/0n/Nv8p/xj/C/8F//P+8P7b/t7+xP7S /rn+zP6x/sn+tP7L/rf+1/7B/t3+yf7u/tf+/P7r/gv//v4g/xT/PP8y/1H/Sv9y/2b/jf+I/6n/ pP/B/8b/4f/i//r/+/8PABQAIgArAD0ASQBZAGEAbQCBAIEAlgCRAKEAoQC4ALUAyAC+ANMAxQDe AMgA4ADLAOgAxQDfAMoA5wDIAOIAwgDbAL8A1ACvAL8AmACpAIkAmwB5AIYAbAB3AFoAaABRAFwA QQBHADQANgAfACQADgATAPr//f/r/+v/1//R/8L/uf+r/6L/lf+P/4H/eP9q/1//TP8+/yz/HP8Z /wH/Bv/s/vT+4f7i/s7+0/69/s3+tv7F/q3+xf6t/sj+s/7S/rj+1/69/ur+1/7//u/+H/8P/z3/ Nv9e/1b/hP9+/6z/q//Q/9T/9//5/ysAMABeAGkAhACWAKwAvwDMAN8A6gABAQMBHwEaATUBMAFO ATwBVgFDAWQBQwFhAUcBZQE9AV4BKQFFARQBLgH2AAoB1ADpAK4AwACHAJIAWwBgADEANgD+/wMA y//J/5H/if9l/1f/Nf8j/wr/8/7d/sj+uv6c/pf+ev51/lf+WP47/kr+Jv40/g/+Jv4A/if+Af4x /gX+Ov4T/kz+Kf5m/kf+if5q/q3+kP7U/rn+Bf/z/jr/J/9u/2f/qf+r/+X/5P8dACUAUABaAIQA lACwAMkA2QDyAP4AGgEaAToBNQFSAUwBbQFVAXoBUwF0AUwBcQE9AVwBLgFGAQ4BKQHwAA0B0ADn AKsAwwCEAJUAWQBoAC4ANgAIAAkA2f/b/7j/tP+O/4f/aP9g/0z/PP8s/x3/FP8B///+6P7u/s/+ 1/64/sf+qv6//qT+uv6h/sL+of7K/qz+zf61/tb+uv7j/sz+8/7a/gT/6/4Q/wD/IP8N/zL/J/9C /zr/Xf9R/3L/Zv+A/3n/l/+T/6n/o/+7/7j/zP/K/+L/3v/0//f/CAANABcAHgAsAC0ANQA/AEUA UQBOAFwAXgBoAGcAcwBrAHUAcAB6AHYAhQB4AIcAeACIAHwAhABxAIIAZwByAGQAbwBcAGQAWABj AFEAUwBGAEwAPABAADQANQAcAB0AEQAUAAQA/P/p/+f/0f/O/7r/sf+g/57/if9+/2r/ZP9T/z3/ Kf8S/w//9/7s/tf+2v6+/sH+ov6t/o/+m/56/o/+cP5//mL+gP5d/n3+XP58/ln+if5q/p7+f/6t /pH+yf62/ur+2P4J//j+Mv8h/13/Tf+H/37/tP+r/+T/4v8bABsARQBQAHgAfwCdAKwAwgDTAOAA +QADAR4BFgEvASoBRQE2AVEBRAFgAUsBZAE9AV4BLwFJARsBMwH5AA8B2gDtALUAwgCMAJkAXgBi ADMAMwD3//n/xv+6/43/gv9a/03/Kf8X//z+4/7R/rj+rf6L/or+Zf5t/kj+T/4m/jr+E/4i/vz9 Ef7k/RH+5P0Y/ur9H/7y/S/+B/5K/iT+Z/5B/oz+a/69/pz+6P7M/hj/BP9R/0H/i/+C/73/uP/6 //n/KwA0AGgAbACVAJ4AwQDNAOMA+AABARoBHgE2ATgBWAE+AV0BQQFiAUABXAE5AVEBIgFBARQB LQH5ABQB4QD1AMAA0ACeAKoAcgB6AEsAUQAfACMA9v/2/8v/yf+m/5n/ef9t/1T/RP8z/xz/Ff/5 /vP+3v7d/sT+xP6g/rr+kf6r/on+pv6B/qT+f/6l/oH+rf6H/rX+kv69/p7+y/6s/tT+uv7p/sj+ +f7d/g3/9v4f/wb/N/8h/0n/Mv9g/0//dP9n/4r/gP+e/5f/tf+v/9L/yf/q/+j/AQACABIAFQAs ADEAQwBIAFEAVwBdAGgAbABzAHQAgAB1AIUAfQCIAIUAjwCBAIwAfQCLAHsAhgBwAHkAagBwAGAA ZQBaAFwATABNAEAAQAA0ADYAKgAoABYAFAAIAAEA9//t/+b/1//Q/8D/t/+k/5z/i/+D/3b/av9X /0n/Mv8l/wz/D//z/vb+2P7g/r/+xv6n/rv+nP6q/ob+pf6B/qL+fv6b/nj+kf5w/pX+c/6W/nP+ pf6H/rX+m/7N/rT+7P7O/gP/7/4o/xP/Sf83/2v/Yv+T/4X/u/+0//r/8v8cAB0ASgBPAHQAegCY AKMAugDHANcA5ADuAAIBBQEcARIBJgEiATUBLQE/ASYBOgEfATABCQEcAfQABAHZAOIAuADCAJYA mAByAHEARgBGACEAHQDv/+r/vf+y/5X/g/9q/1H/Qv8n/xr/+/7x/tX+y/6t/q/+jf6R/m3+ff5V /mD+Mv5I/hj+Pf4L/jb+Cv47/g3+Qf4V/lL+JP5l/j7+ff5X/p7+dv69/pv+6f7L/hr//v5O/zb/ fP9o/6//of/g/9f/CwAEADsANgBpAGsAigCTAK4AuADNANsA6QD2AP8AFAENAR8BFgEkARYBJgEP ASIBCgEbAf0ADgHrAPsA1gDnAL8AywCjAK8AhgCMAF8AYwA7AD8AGAAUAPD/7P/R/8T/p/+U/4b/ dP9n/0//SP8v/yb/C/8H/+z++f7Y/uX+xf7W/rH+z/6p/sP+of7E/qP+wv6d/sz+pf7M/qz+0v6v /tn+s/7f/sH+7f7O/v/+4f4L/+z+Hv8B/yr/E/8+/yv/VP9B/2f/XP+E/3T/nv+N/7n/sf/W/8z/ 8//p/wkABwAlACMAOwA+AE4AVABjAGgAdgB6AHsAgwCBAJAAkgCfAJMAoQCaAKQAlACfAJIAmgCL AJUAhwCRAIAAhQB2AH8AbgByAGcAaQBfAFsAVwBTAEQAPQAtACgAHAAVAAoA/f/x/+j/3f/S/8P/ sv+q/5n/lv+H/3f/Xv9U/zf/P/8q/yL/BP8S//H+/f7e/u7+zf7d/r7+z/6r/sj+n/6//qD+tf6Q /rX+iv65/pj+xf6f/s/+rf7m/sT+8/7Z/gz/8v4m/w3/Rf8x/2T/Uf+Q/37/u/+w/+j/4P8WAAwA QAA7AGYAZwCNAJEArQC1ANAA2wDsAPgAAwESARMBJgEiATcBLgFDAS0BPwEmATwBGwEoAQIBFAHu APoA0gDaALUAwACYAJoAdwB0AEoASgAgABwA+f/u/87/wP+g/5P/e/9l/1H/O/8r/xD/Av/l/t7+ vf7E/p3+of50/nz+T/5t/kX+Wf4s/lj+Lf5U/iX+W/4w/mD+N/53/kv+i/5f/qj+gv7H/qP+8v7R /hz/Af9K/zL/eP9o/6H/lv/Z/8z/CQD6/zEALgBeAF0AhACKAKkAqgDNANQA8gAAAQQBFgEaASsB IAE2ASQBOwEmATwBJgE6ARgBMgENASIB9wALAeEA9QDGANIApQCzAIAAhwBeAGQANgA3AA4ACQDo /+D/wv+3/5r/jP9+/2n/WP9D/zn/HP8i/wH/DP/r/vv+2P7s/sv+4v6//uD+u/7a/rj+3P64/tr+ tv7i/r7+4v7D/un+x/7x/s/+AP/e/gf/6/4Z//v+K/8S/0H/Kf9Q/zr/a/9d/4b/c/+j/5n/wf+2 /97/1v////X/GgAZADUAMgBOAFQAZgBoAHoAfwCJAJEAmgCfAKQAsQCwAL8AswDFALcAxgC3AMYA twDDAK8AuACuALkApwCxAKEApwCTAJUAjQCVAH8AggBzAHMAYQBgAE0ATAA0ADQAIwAZAAgA/P/x /+n/1f/K/7r/rP+e/5T/gf9z/2b/Tf9Q/zb/N/8f/yv/Bf8U//j+Cf/t/vj+2f7u/s3+4v7F/tz+ xP7Y/rT+0P6u/tb+tf7d/rz+4/7F/vH+1f4H/+r+G/8D/zP/Hv9O/zr/bP9c/4//fv+3/6j/6f/e /w0ADQA8ADgAXwBhAIQAjACpALMAyADbAN8A8wD6AAwBCQEdASABMgEoAUQBLAFDASYBQAEhATYB EQEgAf4AEAHqAPsA2QDmAL4AyACfAKsAhQCLAGoAZgBBADgAFwANAO7/4f/H/7j/o/+K/4H/Z/9V /0D/Mv8W/w//8P7z/tH+zv6q/rH+iP6h/nr+kv5p/ob+Zf6J/mT+j/5q/pr+cv6o/oH+uv6b/tX+ s/7y/tb+Gf8B/0D/KP9q/1f/k/+I/8H/tf/o/+X/FAAUAD0AQQBmAG0AjQCUALQAugDbAOcA8AAC AQQBFwEWAScBHwEzASIBNgEmATsBIAE0ARYBKwEKARsB+AAGAeEA8ADKANcAqwC0AIgAkQBoAGkA PgA/AB4AHAD6//L/1f/M/7z/rf+b/4v/gv9v/2L/Uf9N/zr/Qv8u/zD/FP8l/wr/I/8I/xr/Av8d /wD/Hf8G/yP/C/8m/w3/Kf8S/zP/Hv88/yX/Tv84/1f/RP9q/1f/ff9u/4//hP+i/5n/tv+w/9b/ z//x/+//BwAIACAAHwA3ADgATgBVAGMAaQB3AIAAggCOAIoAmQCRAJ8AnACoAKEAsgCkALcAoQCy AKAAsACXAKoAlACfAJAAmQCJAJMAggCJAHwAhAB1AH0AcAByAGgAaQBdAF4ATQBRAEQAQwAvAC8A IwAdAA4ADAD7//n/7//n/93/1P/F/77/sv+k/5v/i/+J/3n/df9k/2r/VP9f/0r/Uf9A/0b/L/89 /yn/M/8d/y3/G/8k/xP/Gf8F/xn/Bf8Z/wv/IP8M/yn/Gv80/yH/QP8x/1D/Rf9n/1n/f/90/6D/ mP/B/8D/6f/s/w0AEgA5AEEAYABtAIUAkACnALkAyQDZAOIA+wD+ABEBGQEuAS4BSwE0AVQBQAFb AT0BVwE1AVABJgE8ARgBMAEEARoB8QADAdUA6gC3AMsAlQCjAHMAeQBOAFMAKwArAAQAAQDe/9z/ u/+y/47/hP9r/1z/SP8z/yH/Df/9/ur+1f68/sD+qv6s/o3+pP58/p3+ev6g/n7+oP57/q3+jP69 /pr+0P6z/uv+0v4R//j+Nf8f/1z/Tv+B/3P/sf+r/9v/0/8LAAsAMQA0AFoAYAB/AIwArwC7ANUA 6gDyAAsBDQErAScBRgE8AVwBSgFpAVQBcgFYAXoBTgFuAUsBawE8AV0BKgFJARIBLQH3ABEB2ADq ALgAxgCIAJYAZABxAD0AQQAUABYA6//r/8r/w/+i/5j/gP90/1//Vf9I/zn/N/8m/yz/Gf8d/w7/ F/8A/xX/+/4S//n+E//9/hT///4R//z+Gf8E/yL/D/8t/xn/P/8u/1D/QP9f/03/cv9o/4f/gP+k /5n/vP+y/9r/1//2//b/FAAWADAANgBKAFoAZABxAHkAigCPAKEAowC0ALAAwQC8AM8AxADWAMwA 4gDOAOYA0gDmAMwA6ADLAOAAwADTALwA0QCuAMgArwC/AKUAtQCdALAAlQClAIsAmgB3AIUAaAB5 AFUAYgBAAEsALAAxABgAGwACAAIA7v/q/9X/1v/D/77/pP+f/5b/h/+D/3b/dv9q/2j/WP9a/07/ Tv9A/0z/Qv9C/zb/QP8x/zz/Lf80/yD/Mv8m/zT/Kf9A/y//TP8+/1P/S/9g/1f/b/9t/4b/hP+c /5n/tv+8/93/2f///wIAIAArAEYAUQBqAHsAkACiALMAxQDUAOwA9QANAQwBKwEjAUUBNQFaAUcB bwFVAXYBUgFyAUgBZwFCAV0BNQFUASEBPwETATAB/wAYAeoA/gDNAOAArQC+AI0AmwB0AH8ATABV ADEANwAKAA4A6v/p/8r/wP+l/5z/g/90/13/U/8w/yH/GP8H//j+5/7r/tT+3P7D/s/+u/7M/rT+ zv61/tP+vf7i/sv+9P7g/gn/+v4k/xP/Rf84/2f/Yf+L/4r/sv+x/93/5P8JAA0ALgA1AFoAZQCC AJIArQC8ANsA7gD2ABQBGQE2AS4BUQE/AWMBVAF3AV4BhgFkAYkBaQGRAWIBiwFWAXwBSAFuATUB WAEbAToB/AAbAdgA8ACzAMsAjACiAGUAdQA7AEcAFgAeAPD/8//K/8P/o/+h/4n/g/9s/17/W/9K /0b/PP83/yr/Lv8e/yj/Gv8b/xD/H/8Q/yL/Dv8d/xD/JP8V/y//Hv83/yj/Rf84/1f/Sv9o/2H/ ev90/5H/jP+o/6j/w//I/+H/6f8AAAcAIQAtAD8ATwBeAHEAegCSAJUArwCqAMYAvQDYAM8A7gDd APoA6AALAfMAFgH1ABYB8QASAe8AEQHrAAoB5gD9AOAA/QDRAOwAxwDjAL0A2QCyAMwApwC6AJgA rwCIAJkAcwCKAGIAdwBNAF4AOwBMACkANQAVAB0AAQAIAOn/8f/T/9b/wv/C/7P/rf+d/5n/j/+L /4L/ff96/3X/bv9o/2b/YP9g/17/WP9P/07/Qv9N/0n/T/9I/1P/U/9Z/1f/YP9i/2//bv93/3f/ gf+A/5j/mv+t/7P/y//O/+P/8P8IABMAKwA5AE4AXgBwAIYAlQCrALYA0wDRAO8A8AASAQoBLwEo AUgBPQFnAUkBbAFOAXcBTwF7AVABdwFEAWoBOgFeASoBUQEdAUEBBQEmAfIACwHUAO8AugDUAJgA rwB7AI4AWABmADkARwAVAB0A9v/+/9H/1/+1/7j/jv+K/2T/X/9G/z7/K/8d/xT/AP///un+6/7X /t3+zP7c/sT+1f6//tX+xf7c/sv+6P7V/vr+8P4U/wr/NP8t/1X/Uf9+/3z/of+k/87/1f/3/wQA JQAuAEwAWQB8AJIAqQDDAM4A6ADtABEBEQE5AS4BUQFIAXUBXwGJAXYBmwF8AawBhAG0AYgBtgGC AbIBcQGgAWEBjgFFAWwBKwFPAQcBKAHdAP4AuADUAJEApQBjAHYAPABJAA8AGQDg/+b/uv+//5b/ nP93/3j/Yf9c/0z/Qv86/zP/KP8e/x//FP8Y/wv/DP8B/wX/9f4I//v+Bv/8/hH/Bf8c/w7/K/8i /zz/M/9O/0j/Xf9X/3f/c/+X/5P/tv+5/8//2P/6//z/FAAjADUASgBdAHIAggCfAJ0AuwC5ANwA 1wD1AOYACQH+ACQBCgEzAREBOwEaAUMBFwFCARgBPwEPATMBBwEsAf8AIwH6AB0B6gAMAeMAAwHQ APUAxwDfALIAzgCkAMAAkQCiAH0AlwBmAHgAUQBkADkASAAjADUADQAVAPT////e/+P/yf/I/7P/ tv+l/6f/l/+Y/47/jP9//4X/dP91/2//bP9l/2H/Vf9T/1P/VP9S/0j/T/9L/1D/SP9Q/1L/VP9T /13/Wv9j/2T/cP9z/3v/gf+W/5v/sP+0/8z/1v/q//j/CgAZADAAQABUAGMAdQCOAJgAuQC+ANsA 2gD7APoAHQEdAUYBLwFbAUUBcgFNAXUBUQF/AU4BfwFSAXsBSgFzAT0BaQEuAVMBHwFHAQ0BMQH2 ABcB2QD1AL8A2QCbALMAegCKAFgAZwA5AEQAEAAbAOv/9f/H/87/n/+g/23/aP9S/0b/LP8e/xH/ Bf/z/uT+3v7O/sj+vf7A/rj+uv6t/rv+r/7B/rD+zP6+/t3+zv74/ur+GP8P/zf/Mv9b/1z/hv+D /6v/rf/X/97//v8LAC4APgBkAHgAjACnALgA1ADgAAEBAgEqASUBTAFCAWwBWwGFAW4BnwF+AasB iQG1AZIBwgGKAb8BggGwAW8BmwFWAYIBOgFgARkBPAHyABEBzQDpAKEAtwB3AI8ASgBWABkAJQDt //b/yP/F/6f/pP+G/4D/Yv9j/1D/R/81/yz/JP8b/xj/C/8H//3+/f7r/vT+6P7z/uL+8/7i/vT+ 5v77/vH+B//8/hj/Df8p/yb/QP82/1T/Uv92/3b/lf+Y/7v/uv/h/+n/AwARACkAOwBPAGMAcQCN AJUAswC3ANEAxwDtAOEABAH7AB8BAwEwAQ0BNgEWAToBFQE+ARUBPgEOATgBBwEsAf8AIgH1ABcB 6AAIAdoAAAHNAO8AuwDdAKIAxACOAKoAdgCWAF4AdQBOAF4ANQBBABsAJgAFAA4A8f/2/9j/2//B /8T/rf+s/5v/of+P/4r/gv+A/3r/dP9x/2r/a/9h/2L/XP9X/1n/Tv9J/03/R/9N/0b/Sv9F/0// TP9R/1D/Vv9X/13/Wf9h/2P/Z/9t/3r/ev+P/5T/o/+q/77/xf/e/+f/AAANAB0ALQBDAFUAZgB7 AIYAoACmAMAAyQDqAO0ADAEEASsBHQE+AS0BUwE0AV4BPAFjAT0BZQE+AWUBOAFeATIBUwEkAUgB FgE5AQIBJgHtAA4B1QDvALwA1gCdAK8AfgCQAFkAawA8AE4AFQAjAO//9//F/8f/lv+T/2//af9N /z//I/8X/wr/9v7t/tv+0f6+/rv+qf6x/p/+rf6a/q3+lf6v/pb+wP6u/tf+w/7w/tv+D/8I/zb/ Lf9Y/1L/hv+G/6z/qf/c/+L/EAAaAEAATQB4AIwApQDAANMA8wD7ABwBIQFGAUUBbgFlAY0BgwGu AZEBwgGoAdYBrwHbAa0B4AGlAdYBlgHHAYABqQFhAYcBPwFhARYBOAHwAAkBvgDaAI8AqgBfAHMA LwA3AAIACADU/9b/q/+m/4f/gf9q/2D/Sv88/zH/JP8e/wz/C////vv+7v70/uL+6v7V/u3+3P7t /tz+8v7h/v3+6v4L//r+Ff8F/yz/Hv88/zT/Wf9U/27/bf+W/5T/r/+w/9X/0v/z//r/GQAlADoA RgBdAG4AcwCKAI8AqQCkAMIAvgDXANMA8wDjAAEB7wAPAfYAFwH0ABoB8AASAegACgHnAAYB3gD9 ANcA8wDQAOkAwQDdALQA0QCoAL8AmgCwAI0AnwB7AIsAawB+AFwAawBNAFcAOwBHACoANAAaAB4A BQAMAOz/8v/e/+H/yP/I/7n/sv+q/6H/l/+P/4z/g/99/3P/cf9i/2H/Vv9L/z3/Q/84/zb/KP8u /yT/Kf8e/yP/Gf8h/xX/If8W/yP/Ff8s/yH/M/8r/0b/Ov9U/0//c/9p/43/h/+t/6j/0f/U//b/ /f8gACUATABXAHEAhQCdALUAxQDbAPEADQELAS4BLgFTAT4BYgFPAXQBXAF8AWcBigFjAYcBYQGF AVQBeQFNAW0BPgFfASUBRgEIASYB7AAGAccA3AClALgAgACNAFkAXwAuADYABAAJANH/0P+h/5z/ c/9r/0j/Of8k/wv/+v7m/tr+xP7A/qT+ov6I/pT+df6F/mL+fv5g/nj+WP58/mD+jP5x/qb+h/7D /qr+6P7W/gz//P47/yz/Zv9b/53/j//H/8X/9/8DADMAPwBqAHsAmwCvAMgA4gD0AA4BGwE4AT4B YAFcAX0BcwGaAYgBrgGQAbgBnwHEAZoBvQGPAboBewGkAWgBjQFKAWUBKAFGAQABIAHYAPIAqwDD AIIAkgBRAFgAIwAmAPP/9P/K/8v/n/+d/3//c/9d/1P/Qf8z/yn/GP8X/wL/Bf/z/vn+5/7r/tL+ 6P7P/ub+0f7r/tT+7v7a/vr+4/4D/+7+Dv/9/h//EP8w/yH/RP84/1r/W/98/3X/mf+T/7j/tP/Z /9z/+P/8/xUAHQA4AEEAVwBhAHIAfwCRAKEApwC7AL0A0wDQAOQA3QDxAOIA+QDjAP8A5gD+AOYA /wDfAPgA2AD1ANMA6gDMAOEAxQDcALkA0ACvAMIAogCwAI0AnAB/AIwAbwB6AF8AaABPAFgAOgBE ACUAKgAUABEABAD+/+3/6P/T/9H/xf++/7D/o/+a/43/j/9+/33/bv90/2P/Zv9V/0v/Nv8//y// N/8n/y//Fv8t/xr/Jv8U/yH/Ev8o/xf/Kv8Z/yn/Fv8y/yP/Pv8w/0r/Pv9g/1P/df9y/5T/kf+2 /7f/2v/Z//7/AgAiACwATQBWAHMAfwCdAK4AzgDhAO4ABAELASkBKAFEATwBWQFIAWUBUwFzAVgB dwFXAXgBVQF3AVEBcAFGAWEBNAFOARkBNAECARQB5ADyAMUAzwCfAKgAeQCDAFUAWgArAC8ACAAJ ANz/0/+h/5j/ev9s/1D/Q/8n/xX/Cf/x/ub+yf7I/qj+r/6S/pv+e/6M/m3+f/5e/nf+WP6B/mH+ iv5w/qH+gf68/qL+2v68/v3+5f4h/w3/S/83/3H/Zf+h/5b/2f/W/wgABgA4ADoAZQBtAJIAmgC7 AMQA3QDtAPwAEgEXAS4BMQFNAUEBXwFTAWoBXAF8AVoBfwFUAXYBRgFkATUBUQEbATIB/QATAd0A 8QC3AMgAkACgAGsAdAA7AEIAFwAWAPD/6v/L/8X/q/+j/5H/hf90/2b/Y/9Q/0//N/9G/zH/Nv8i /y3/Ev8n/xX/LP8U/zD/HP85/yP/Qf8l/0j/Nf9T/z3/Xf9N/2n/W/9+/27/if9//6D/lP+w/6j/ xv+9/9j/1f/p/+z/AQD+/xQAGAAkACcAMQA2AD4ARgBOAFUAXgBpAGYAbQBmAHYAagB2AGsAcgBm AHAAXwBqAF4AZgBaAF8AUwBQAEoAUABJAE0AQgBCADwAQAAzADkALwAwACsAIwAlACIAHgAaABwA FwAVABMADwALAA0ACAAIAAEAAQD6//v/9v/2/+v/8//m/+z/3v/n/+D/4//a/+H/2v/e/9X/2P/Q /8r/vv/B/7//vP+0/7r/sf+x/6n/rf+o/6L/oP+e/5f/mv+R/5P/iv+H/4D/h/9+/4X/fv+L/4D/ j/+H/5j/kP+k/5z/tv+r/77/t//V/8z/5P/b//v/9P8UAA0AJgArADgAPABLAFEAWgBbAGEAYQBo AG0AcgB3AHcAfwB8AH8AeQB6AH4AfAB7AH0AdAB6AHMAcABnAGQAVwBYAE4ASABAAD8AOAAxACYA IAAdABQABQD7/+v/4P/V/87/xf+3/7f/qv+m/5T/lP+D/4T/dv9x/2L/Zf9V/2D/Sv9Q/z3/Rf81 /03/Of9K/zf/Uv9A/1r/Rv9r/1v/c/9m/4b/ev+W/4j/q/+h/7b/r//L/8b/4//h//n/9v8IAAcA HwAbACsAKQA8AEAATgBQAF8AYQBpAGwAcwB5AIIAhwCQAJcAjwCSAJIAlwCMAJMAhQCFAHYAfwBs AHAAYABkAFQAUQA/AD0AJgAnABUADQADAPv/7//p/+T/3v/Z/8v/0P/L/8H/uP/A/7D/vP+z/7f/ rv+z/6f/tP+o/6//qP+5/6z/uf+q/8D/rf+6/7T/v/+z/8D/tv/B/7b/wP+3/8T/vP/H/8D/zP/K /83/yv/X/8z/3P/S/9//2//p/+D/7P/o/+//7//1//T/+f/z/wMA/P8FAP7/BwAEAAsABAALAAUA DQAIABEACQAOAAsAEAALABIACgASABIAGgAPAB4AFgAkAB0AKgApADIALwAzADAAOQA3ADsAPAA+ AEQAOwBCAEUARQBCAEUAQgBFAD8APAA/ADkALQAwACwAKgAbABsAHAAaAAsABQAaABkA2wDvAJYA nwB2AHoAtQDAALIAwQCKAJQAcwB8AGwAcgBJAE0ADgAPAOX/5f/G/8D/i/9+/2D/Uf83/yX/EP/7 /u7+0P7R/rL+vf6U/q3+g/6e/nD+mf5r/pH+Zv6V/mz+ov54/rT+i/7J/qD+5f7B/gv/4/4v/w// W/9A/4v/cv/B/7P/AQDx/z8ANwB+AH0AvQDDAAIBDAE2AU4BaAGBAZIBrAGmAcsBvQHhAbsB5QGy AdwBoQHBAYABpwFOAW4BFQEsAdoA7wCaAKMAVwBaAAoACgDH/7//fv9x/zz/JP8A/9/+w/6k/pP+ bP5n/jj+Pf4I/h/+7v0K/tP9+/2+/fL9uP36/bj9//3C/RD+0/0t/u/9Uf4c/oT+U/7F/pT+Af/a /lD/MP+d/4f/8v/h/0YAPACXAJoA6gD0ADIBRgFxAYgBogG/AccB7QHYAQkC4QEKAtoBBQLIAe8B pgHLAXsBoQFKAWgBEAEoAdQA4wCPAJoATgBWAA0AEADR/8//l/+J/2H/Uf8w/xn/Bf/r/t7+vP69 /pf+of51/pP+YP57/kr+dv5C/nD+Pv52/kb+hP5V/pz+cP6+/pH+5f69/hH/6/5J/yr/h/9p/8f/ tf8FAP//SQA+AIgAiQDCAMkA8QD+ABMBJgEvAUcBQQFUAT4BVwE0AVUBIgE+AQMBIgHkAPoAvwDQ AJYApABjAHAANQA+AAsACADe/9r/uf+s/4//hf9r/1//Uv86/zX/Gv9O/zv/U/9B/y3/EP8//yb/ Of8k/z7/IP84/yP/Sv80/0z/Nf9m/0r/iv9x/6f/lv/J/7f/8P/i/x0AEwBLAEIAeABxAKIAogDJ AMsA6QDvAPwABAENARUBBgEPAfwAAwHhAOYAwQDFAJkAlwBkAGcAMQAqAP7/7//D/7P/lf+B/1// Rf8q/wr/Cf/q/vD+y/7Y/rX+0P6r/sf+qP7J/qT+yf6p/s7+sf7Y/rj+4v7O/vb+3/4Q//f+K/8X /0X/Nf9k/1b/jP9+/7n/q//s/93/GAAWAFQAUgCSAJcA2wDmABQBJQFEAVUBbQGCAZMBqQGcAbEB rQHPAagBvAGZAbABeQGRAVoBaQElAS8B5ADsAKMAoABiAFgAHgAUAOH/z/+n/4v/cf9W/0D/H/8W //T+9v7X/s/+rf6o/oP+m/58/o3+bv6N/mX+hf5g/of+a/6L/mr+lP5y/qj+hv65/pr+2v6+/gj/ 8P4x/x3/af9W/57/iP/i/9f/IAAaAGsAbgCrAK0A8QD6ACgBNgFkAXcBiwGnAaIBvQGsAccBpwHE AZUBsQF8AZABVAFlASEBMQHxAP0AuQC/AIIAhABEAEIAAAD4/9L/w/+m/43/gf9p/1j/O/8+/yD/ Iv8C/wz/8v75/t/+7/7T/t7+wv7a/rj+0f6y/sz+s/7W/r3+4f7D/vP+1v4M//H+Kv8P/1L/PP98 /2T/t/+k//n/6P8xACgAaABmAJ0AoQDPANMA8wD9ABwBMQE2AUsBNgFHATwBVAEmAT8BFAEoAeoA /QDIANYAmACjAGYAbQA9AD4AEQANAOX/3v/B/7f/oP+S/4b/e/9q/1z/TP87/0L/K/84/yD/Lf8W /yj/DP8g/wj/If8J/x//Av8j/wT/Kf8Q/zj/J/9e/0T/dv9c/5f/gv++/67/7f/c/xkADwBRAE0A iQCIAMAAwwDzAPkAHAEqAT8BUAFLAWABTgFrAUcBXgEzAU4BEwEqAesA/AC0AMUAggCPAEEATAAN AAkA0P/E/5L/g/9f/03/M/8b/xj//v77/uX+7P7Q/tz+w/7W/rj+1P6z/tD+sv7W/sD+3f7C/u7+ 0f78/uP+FP/1/i7/D/9J/y//a/9S/5f/ff/F/7X/+//v/zUALQCFAHoAyADMAAIBDwFCAVMBbgGG AZMBrQG4AdgBxAHoAccB6wG8Ad0BngHFAXkBmgFDAV4BCgEhAckA2ACJAJIAQwBFAAcAAgDE/77/ iv96/1P/QP8m/w//+f7j/sn+p/6v/o/+nf55/o/+bP6H/mX+gf5f/oP+W/6J/mH+kv5o/pb+cP6z /ov+1/6x/vv+2f4r/xD/Yv9L/6L/jf/f/9H/KAAeAHcAdQDFAMwAEAEbAVUBZwGOAakBvgHkAdwB BQL1ARsC8AEbAuMBBwLHAfQBpwHMAXoBmgFDAWEBCwEjAccA2ACEAIwASwBPAA8ADwDi/9z/tP+s /57/jv96/23/X/9M/0H/K/8s/xf/F/8E//v+3v7x/tf+5f7P/uf+0P7p/sz+9v7a/gX/6v4c//z+ Mv8a/1//R/+L/3f/zP+6/wgAAABCADoAfwB9ALQAvwDlAPcAFAEiATYBSwFKAWcBVQFvAVABbgFF AV0BLAFGAQkBHwHlAPYAuQDEAJIAnABhAGkAOwBCABgAGgD1//D/1v/U/7j/sP+Z/4r/if97/3j/ a/91/2P/av9a/2P/Vf9V/0P/Vv9H/1P/Rv9U/0T/VP9F/2v/Wv+F/3r/nP+Q/7n/s//h/9j/EAAK AEIAPABvAHAApACrANsA5wALAR8BMQFKAVEBagFmAXwBbQGHAWUBggFYAXQBOAFOAQoBIgHbAPAA qQCzAHIAcwAyADYA8//p/7v/sP+N/3v/Zv9W/0X/Lv8x/xr/Fv8E/wz/9/7+/uj++v7q/vj+6f73 /uf+/f7r/g3/9/4W/wP/J/8W/zz/KP9X/0j/df9p/5z/kv/M/8f/AAD6/0IAPwCLAJAAwQDMAAMB FAEyAU4BZQF9AYoBrQGqAdQBvgHlAcgB7gG4Ad0BowHLAYABowFTAXIBFwEwAd4A8gChALAAZgBq ACEAIwDn/+f/rv+l/3z/c/9K/zn/E//5/vX+3f7d/sH+zf6r/rn+of6s/pj+pv6N/p/+h/6h/oj+ p/6H/q/+k/7D/qn+6v7Q/gH/7/4v/yD/YP9R/5D/iP/P/8n/GAAYAFoAYACnALUA8QABAS8BSAFt AZEBogHGAbQB3QHLAfkBxQHvAbwB6QGmAc0BhQGtAVkBfQEsAUwB9QATAboA0QCAAI4ASwBXABYA HwDv/+3/x//E/6H/mv+A/3j/Zv9b/0j/Pf8w/yn/Fv8L/wT/9/7y/ub+6f7b/uH+z/7i/sz+6f7Q /vP+2P4H/+v+J/8M/0H/L/91/2b/rv+j/+X/4f8ZAB0AWQBgAI8AmADEANUA8QAIARUBLwEuAUsB PQFhATsBXQE3AVYBIQFDAQQBJgHjAPoAuADUAJUApgBrAHsARABMAB4AIQD8/wEA4//m/8D/w/+g /53/kP+O/4j/g/96/3j/dP9r/2r/YP9g/1z/V/9V/1j/Uf9Q/0X/Wf9Q/2f/Yf91/2n/jf9+/6P/ mP/D/7j/5//e/xgAEQBKAE0AegCBAK4AugDbAPIACgEfASUBQAE6AVgBQQFfAT4BXwEoAUoBEQEu AewABwHDANYAkQCiAFwAcAAdACMA6P/y/7b/uP+N/4f/af9c/03/Q/8x/yH/H/8S/w7///4F//b+ A//y/vj+7P71/uj+/v7s/gr/9/4T/wX/If8X/zX/Kv9L/0X/a/9i/5P/kf++/77/+P/6/zsARQBz AIEAtQDIAOwACAEjAUEBVgF0AYMBpwGkAc4BuQHmAb0B6gG7AeUBpwHSAX8BrQFWAX4BIAE/AeUA AQGsAMEAaAB7ACoANwDy//n/tf+1/4b/hf9Q/0f/Gf8M//r+6v7b/sf+xv6y/rT+nf6i/ov+lv57 /or+cf6C/mn+gv5t/ov+cf6j/o3+vv6l/ub+zv4N//v+P/8x/37/bf+6/7T//v8EAFQAWgCaAKkA 7QAFATkBVAFwAZQBqAHSAc4BAALkARsC6QEgAucBHwLUAQYCuQHrAY8BvQFhAY4BLAFOAfEADgG4 ANAAfgCSAEkAWAAXACEA5f/r/7r/v/+T/5T/bP9r/03/R/8m/yD/Af/9/u7+4/7b/s/+zf69/r/+ rv66/qT+vv6n/sP+rv7V/rv+8P7U/hT//v5I/zz/d/9r/7D/qP/t/+z/LAAvAGEAbwCaAKwAyQDh APYADwERAS8BJQFFASsBTQElAUoBFwE7Af4AHgHiAAABvwDcAJgArgB3AIUATgBdACgALwAIAAoA 5//o/8D/wv+s/6z/mv+b/4z/kP9+/33/cP92/2f/av9h/13/Wf9S/0//S/9Q/0v/W/9V/1z/XP9s /2X/e/97/5L/j/+y/7T/3v/e/wsACwA7AEEAcAB9AKUAtgDXAOsAAQEWARoBOAExAUsBOgFbATQB VgElAUYBDQEtAeoABQG+ANcAiAClAFMAZAATAB0A3P/q/6v/sf9+/37/Vv9O/zP/LP8T/w3//f7z /u3+2f7h/s/+0f7D/sv+u/7R/sL+1P7A/tr+y/7p/t7+8/7q/hH/CP8q/x3/Tf9C/27/ZP+k/6T/ 5//u/x4AJQBbAGcAmwCqAN4A8QAVAS8BSgFrAXwBpgGeAckBuwHlAcQB9QHGAfQBtQHgAZUBwQFq AZMBOAFfAQMBIAHIAN4AjACiAE4AXwAPABgA3f/k/5r/mP9g/1X/OP8s/xL/Av/t/uD+1f7E/sD+ q/6t/pz+mf6G/oz+ev5+/mn+fP5n/oP+av6K/nT+of6H/r3+qP7f/sf+DP/4/j3/Lv98/3T/vv+6 /wcACABPAFUAngCxAOQAAAEhAUABUgF3AXcBpAGNAb4BngHIAaIBzAGVAcEBgAGoAWIBhQE4AV0B CwEuAdwA8wCqALkAeACGAEsAWAAaACcA9P/4/87/zP+p/6z/iP+K/2b/Yf88/zH/Kv8h/xT/B/// /u3+6v7Y/tz+zf7Q/r7+zv69/tL+vf7d/sn+7P7Z/hX///47/yr/Zf9Y/5f/jP/N/8n/BQAEAD0A PgBtAHoAoQC0AMgA3QDmAAIB/AAVAQMBJQEEASUB9wAYAeAABAHOAOcArQDFAI8ApgBtAIEASQBZ ACwANgAOABcA5v/r/9D/1f+5/7v/qf+t/5v/oP+Q/4//ev99/3D/bf9f/17/T/9S/07/Rf9E/zz/ RP87/0b/O/9J/0D/WP9P/2j/Xf9//3r/pf+b/8z/yP/8//b/KQAuAF4AZgCVAKEAtgDJANoA9QD3 AAoB/gAeAQcBJgEDARwB7AALAdkA8wC1AM8AlwCoAGIAcwAyAD8ABgAMAN//4f+0/7r/kv+O/3X/ bv9Z/1D/Rv8+/zj/Lf8g/xX/C//+/gn///4D//z+BP/8/gn/Af8O/wX/Fv8K/yL/E/8w/yb/TP9C /2j/YP+W/43/zv/O//z/+/81ADsAbwB3AKoAtADhAPEAFgErAUIBXwFsAYwBgwGoAZMBvwGVAcAB iQGwAW4BlgFOAW8BJAE9AfEADAG+ANUAgwCVAEkAUgASABQA2P/X/5n/lf9s/2b/Rf80/yL/Ef8D /+/+5/7W/sz+uf62/qX+o/6M/pD+e/6J/nH+g/5k/oT+aP6J/m/+mP6B/rP+l/7Q/rT++v7i/if/ E/9f/1L/of+b/+b/4/81ADIAgwCJAMYA1QAAARoBNQFSAVwBegF7AZoBigGvAY4BtQGBAawBbgGd AVgBegE3AVYBCgEjAdkA9QCnAL0AeQCJAFAAXwAjACYA+//6/9b/1f+u/6b/jP+H/2P/W/87/y7/ J/8X/w3/AP/4/uf+4v7S/tn+xv7F/rP+xP6u/sb+rf7M/rT+5/7J/gj/8f4l/w7/UP88/4D/cP+x /6X/6f/g/x8AGgBWAF0AhQCUAK0AvgDOAOAA5AD4AO4ABAHwAAcB5AD/ANYA7AC9ANEAoQC0AIQA kABkAHAAQQBNACAAKQD7//z/3//g/8v/wv+1/67/o/+d/5X/k/+B/3//df9u/2n/YP9c/1b/Uf9G /0v/N/9I/zX/O/8x/0T/Nv9L/zz/WP9I/2r/Wv+A/3P/oP+U/8b/xf/z/+3/JgApAFsAYQCKAJQA tQDBANYA6ADmAP8A/wAWAf0AGQH6ABMB6wAFAdMA6QCuAMEAgACTAFAAYwAnACsA9//3/8n/x/+f /5j/fP9v/1b/Sf9A/zL/Iv8S/xT/A/8A/+v+6v7T/ur+0v7p/tD+6f7V/u3+3P7y/tr+/f7r/gz/ 8/4l/wv/N/8l/2L/UP+R/4f/uv+0/+z/6v8gACQAWABfAJQAnwDOAN4ABAEYATEBSgFTAXMBbwGT AYUBqgGFAasBeQGeAV8BgAFCAWABFgEzAekA/wCsAL8AegCGADsARQAIAA8Ayv/G/43/hP9j/1P/ Nv8p/xL//v75/uD+2/6+/sT+q/6y/pT+n/5//pP+cf6E/mj+e/5b/n7+X/6H/mX+mP53/q3+j/7N /q3+9f7U/iP/Av9Y/0b/mP+M/9z/2P8wAC4AdQB1ALQAwQDzAAQBKgE+AU0BagFyAZABgwGmAYoB sAGCAaoBdgGYAVwBfQE9AVgBEAEpAeEA+QCvAMAAggCQAFMAVwAjACYA9//3/87/yf+n/57/gv91 /1v/Rv9B/yz/If8Q/w7/+f7+/ub+6f7T/tz+w/7Y/r3+zv6x/s3+rP7Z/rz+8P7P/gn/6f4o/w7/ S/8x/33/av+u/5r/4//X/xYADgBMAEsAdwB/AKQAsQDFANQA3gDpAOcA9wDqAPgA3gDuANMA4AC8 AMoAnwCvAIMAjQBmAGoARABKACQAJAABAAAA7P/o/9b/z//C/7//sf+t/6z/pf+f/5n/lf+S/4r/ hf+D/33/dv9z/2//bP9q/2H/af9h/2z/YP9w/2f/eP9t/4j/ff+g/5P/vP+y/9r/0v8HAP7/NQA0 AF4AXQCEAIoAqwCuAMUA0QDYAOgA4gD2AOUA+QDeAO8AzADdALIAvgCPAJkAXgBkADQANQABAP// 1//N/6z/nv+C/3f/Xf9M/z7/Lv8k/xD/Ff/8/v3+5v7o/tH+5f7O/uD+yf7n/tD+7/7X/vP+3P77 /uf+Cf/1/hv/BP8r/xj/T/89/3r/bP+g/5r/zf/F//7/+v8yADEAZgBsAJ0AqQDZAPAAEQEjAT8B VQFaAXUBcwGWAYQBpgGHAacBegGaAWQBfwE/AVkBGQEwAeQA+wC2AMQAdQCCAEYASQAPAAMAy//A /5r/i/9r/1z/Qf8w/yP/CP8F/+v+7P7R/tf+u/7E/qX+sv6S/qH+gv6V/nH+lP50/pb+b/6f/nn+ p/6H/r/+ov7b/rr+/f7h/i7/Ff9h/07/mP+F/+P/0P8rACQAbABoAKoAtADkAPUAFQEkAUEBVgFg AXcBcwGMAXwBmgF0AY4BYQF/AUwBawEvAUcBBgEWAdgA5ACtALcAfACGAFEAVgAmACQA+v/5/9b/ 0P+s/6D/hP9w/2f/U/9L/zf/NP8f/x3/B/8I//D+9v7d/un+zv7f/sL+1v62/tv+vv7q/sv+9v7V /gz/9f4x/xL/WP85/3z/Zv+t/5n/4P/R/xYADQBFAEQAdAB5AJwAowC8AMsAzADiANwA7gDeAPMA 2ADmAM4A2QC2AMQAnQCrAIAAjgBhAGwAOgBDAB8AHAAAAP7/7P/f/9H/x/+//7j/rv+m/6L/lv+V /47/jP9+/37/c/92/2z/bP9g/2r/XP9l/1n/Zv9X/2b/Vf9s/1z/ef9j/4f/c/+d/4z/uf+r/9T/ yv8BAPr/LQAqAFYAVgB8AIEAoAClALoAwQDRANsA2gDsAOQA9ADeAO4AzADaALIAvgCRAKAAaQBx AD0AQAAXAA8A6P/j/7n/s/+a/4f/cf9c/0r/Of8x/x3/Fv/+/vf+3v72/tj+7f7P/uv+0f7v/tL+ 8f7c/vT+4P4C/+z+D//6/iX/C/81/x7/Wf9H/4T/dP+r/53/1//O/wgA/f85ADAAbgBvAJ8AqgDa AOUADAEdATwBTwFoAX0BhgGlAZIBtAGYAbYBkAGsAXUBlQFSAXABMwFKAQABDgHJANgAlQCfAFIA VAATABUA3f/b/6r/nf90/2X/Tf82/yr/Df8K/+3+6v7O/s7+tP69/p/+rv6O/p/+ef6S/mv+kv5t /pX+cP6d/nn+rf6J/sH+of7e/r7+A//o/jL/GP9h/1P/pP+W//L/6P8tACsAdwB9ALIAvQDwAP8A IwE3AVMBZwFzAY4BiwGsAZEBtwGUAbUBhgGoAXIBkwFQAWoBKAFAAf4AEgHSAOAAmwCmAG0AdwBC AD8AEwAVAOP/2/+s/5//jf99/2v/Wf9N/zj/Mv8f/xf/Af8D/+r+7/7Z/tz+x/7W/rf+0f6v/s/+ sf7j/sD+6v7N/gf/6P4g/wL/R/8o/27/V/+e/4v/0f+//wcAAgA2ADMAaABrAJIAmgCxAL4AyQDW ANoA6ADcAOcA2gDmAMkA2wC9AMwAogCwAIkAmQBrAHAASgBJACgAKAAQAAwA8//v/93/1f/L/8T/ vP+1/6n/pv+j/57/mf+O/5D/h/+E/3z/gv93/37/cv96/2z/c/9l/3b/a/98/2z/gf90/5L/gP+n /5v/vv+w/+f/2v8NAAcAMQAsAFMAVwB9AH0AmACdALcAuwDPAN8A3QDvAOQA7wDiAPEAzgDiALUA wwCWAKMAcwB6AEcARQAjABoA8v/v/8r/vP+e/47/ff9i/1b/O/8//yn/Gf8H/wT/6v76/tv+9v7e /vP+1/71/t3+9/7l/gH/7P4Q//b+F/8C/yf/EP9F/zP/bP9W/4X/c/+t/6P/0v/H//7//P80ADAA agBuAJ8ApgDXAN0ABAERATMBRwFfAXkBdgGWAYQBowGFAacBggGgAWYBhQFKAWYBJgE6AfgACQG+ ANIAjwCYAE8AUAAQAAwA2f/P/6b/lv98/2T/Uf8//yn/Fv8M//X+8f7V/tv+vP7E/qb+t/6U/qH+ fP6f/oH+oP6E/qb+iv6x/ov+wP6k/tP+tv7w/tL+FP/4/jn/Jv9y/2D/t/+p//D/6v8yADIAZwBx AKUArADeAO0AEQEmATgBUAFWAXgBaAGKAXcBlwF1AZgBaAGOAVEBbgEwAUsBBwEfAeAA9QCyAMUA iACUAFcAXAAtAC0ABgACANn/1P+t/6H/kf+E/2//Zf9d/0v/Rv81/zT/H/8g/wz/Ff/8/gb/8f79 /uT+//7h/gb/6/4L//P+Hv8G/y//G/9M/zn/bf9V/5P/g/+7/7X/8v/l/x4AGABMAEoAegCAAJkA qgC3AMYAyQDbAM4A5QDTAOUAygDZALkAxQCiAK8AgwCVAGYAcQBCAEkAGgAeAPz//v/j/+H/zP/F /7n/s/+p/57/oP+V/5T/iP+O/4L/kf+E/4v/hf+F/33/hv9//4//hf+O/4f/lP+U/5f/lv+o/6P/ u/+u/8z/wv/f/9z/AQD9/zAALQBOAFAAcgB0AJkAngC4AMkA1gDlAPMA/gD+ABcBDAEjAQcBHwH8 ABkB6wADAcsA3ACkALEAeQCBAEwAUQAdAB4A7f/k/7f/sf+M/4D/Yf9V/0L/Lv8e/wn/+v7j/uv+ 0/7c/sP+3f7C/uD+yv7j/sj+7v7U/vL+3v4E//D+FP///iz/G/9N/0L/bP9h/43/hv+6/67/5f/c /w8ADgBGAEsAfQCAALEAuQDoAPUAEwEpAUQBYQFtAYsBgQGjAZABsgGNAbIBgQGmAW0BjwFQAWoB JwFDAfwADgHHANgAjACYAEsAUQAWABgA3P/a/6r/oP9//3L/Wf9N/zP/Hv8T//7++P7h/ub+0P7Q /rT+vP6g/rT+mP6y/pn+sv6b/r3+ov7B/qz+z/62/uj+y/4D/+v+G/8J/0v/Pv+D/3z/vP+v//L/ 6v8sACkAZQBrAJwAqQDPAN8AAgEXASgBPQFEAV4BVAFxAV4BfwFdAX0BUgFvATYBVQEYATIB8wAM AcwA5AChALUAeQCHAE0AWAAoACwAAQD9/9P/0f+3/6//m/+V/4L/dv9q/2X/WP9R/0X/Pf8z/yr/ If8c/xr/B/8R//z+EP/9/hP//P4Z/wL/Kf8S/zj/I/9P/z3/bf9d/5P/if+8/63/6v/i/xUAEQBH AEkAcQB1AJEAnwCqALoAvgDQAMUA3wDMAOAAxgDdALsA0AClALgAjwClAHUAgwBYAFsANwBDABsA IQAFAAgA8v/y/9//3//U/9H/w//A/7f/uP+x/67/rf+r/6L/nf+i/6D/nf+a/5j/mP+X/5T/mP+X /5X/k/+d/5n/of+b/7T/q//A/7P/4f/Y/wQA//8gACEAPABCAGEAZgB/AIYAmwCpALgAxADMAOAA 1ADtAN0A7wDbAO0AxwDZALQAxQCVAKEAbwB/AEoAVQAiACkA+P/9/9P/0/+u/6n/h/+F/2j/ZP9C /zT/Nv8l/yb/Ev8X/w7/Gf8I/xj/DP8W/wv/If8U/yH/F/8s/yL/Nf8n/0r/Qf9i/13/fv96/5v/ l/+4/7X/3v/d/wkACwA2ADkAYgBtAJgApgDEANsA+wASAS4BSAFHAV8BXgGDAWkBjQFoAYcBXgF/ AUoBawEuAU0BCgEnAd0A9gCrAMIAcgB/AEMASQAEAAwA2f/Y/67/rP+G/4H/W/9Q/z//Mv8h/w// D//5/vP+3f7d/sb+1f68/s/+uf7I/rf+yf6x/tH+tv7b/sL+6P7N/vv+5P4X/wL/M/8h/2D/Uf+Z /47/x//H/wMABAA9AEEAdQCEALEAwQDqAP8AEwErAT8BYgFZAYMBbAGSAXUBoQFwAZoBYwGIAVEB dAEtAVEBDgEmAeMA+AC1AMsAhQCXAFoAawAwADUA/f8EANv/3P+3/7H/lv+V/33/eP9m/1n/Sv9F /zf/MP8o/x3/Gv8M/wn//v4D//f+Cv/5/g7//P4b/wz/Kf8a/0L/Lv9Y/03/gf9y/6X/ov/X/9L/ CAAEAD0APgBoAHAAjQChAK8AxwDPAOQA3AD1AOsABgHrAAkB4wABAc8A7AC4ANoAmwCyAH8AkwBa AGwAOwBEAB8AHQD9/wIA5//q/8r/0f+2/7b/q/+i/5j/kv+K/4b/g/97/3b/cf9x/3T/b/9r/3H/ af9t/2v/cP9n/3T/av95/3f/i/+I/5r/lf+6/7X/3v/c//7//f8hACcARwBPAGsAeACQAJ8AuADH ANYA7ADrAAUB+gAVAfwAFwH7ABMB6QAEAdMA7ACyAMsAjwCjAGUAeAA9AEkADgAWAOP/5/+4/7f/ k/+V/23/Y/9F/zj/Mf8k/xr/D/8O/wT/Cv/8/gX/9v4G//r+Bf/5/g3/Af8Y/wT/IP8U/zv/MP9Q /0f/bv9h/47/hv+s/6//2//Z/wUACAA2ADkAaQB2AJ4AqwDVAOQACAEkAS8BTAFQAWwBZgGDAW0B jwFwAZABZAGLAVABdgEyAVUBDwEvAeUA/gC2AMQAfgCLAEgAUgATABkA5P/h/7r/tP+P/4b/Zf9g /0f/O/8r/x3/FP8F//r+7P7i/tD+3f7M/tT+w/7U/sD+1f7E/tj+xv7n/tD+8P7c/gv/+P4i/w7/ TP85/3z/cv+i/57/1P/R/wwACgA+AEIAeACEAK4AugDZAPIABwEfASYBQwE9AV8BVwF2AVUBfAFR AXIBPwFgASoBSgEQASsB6gAFAcQA2QCeALIAbwB+AEoAVAAbAB8A7P/w/87/z/+u/6j/k/+O/3v/ dv9p/2P/Vf9N/0X/O/85/y7/L/8m/yf/Iv8p/xn/K/8g/zD/I/88/zD/Tf9C/2X/W/+A/3X/pv+a /8n/wP/y/+//GQAfAEgAVABxAH8AlwCkAK8AwwDIAOAA2ADuAOAA+wDdAPcA2ADtAMMA2wC2AMkA mQCoAHIAfgBNAF4ALQA6AA8AFgD3//n/2v/c/8X/xf+u/63/oP+d/5H/kf+E/3//dP9w/3P/b/9u /2j/bP9q/2//a/9z/23/cv9q/3j/c/9+/3v/j/+L/6T/pP/H/8j/4P/h/wYAAQAfACIARgBMAGcA awCMAJkArQC+AM4A4gDhAPgA8wAKAfQAEgH1AA4B5wABAdUA6AC1AMUAkwCmAG4AgABPAFYAHgAm APr////R/9T/qf+q/4P/ev9s/2D/Vv9R/0z/RP85/zD/Ov8t/y//If82/yr/L/8j/zj/KP8//zX/ UP9L/1v/V/9r/2H/fv96/5r/lv+0/7X/2//Z/wEAAQAqADIAVgBcAIsAmQDCANEA5AD8AAwBJAEs AUYBQAFiAU8BbwFOAXMBTAFyAT0BWwEkAUUB/gAdAdsA+QCtAMQAfwCTAEwAWQAdACwA8v/4/8z/ zv+h/5n/gP94/2D/U/9G/z3/J/8b/w////7//vH++v7m/vP+4f73/uH+9P7j/vr+5f7+/u7+D/// /iP/Ef8+/y3/Zv9W/4n/gv+z/6v/4//c/w8AEwBBAEUAdgB9AKkAtwDUAO0A/QAXAR0BOQE5AVsB RwFqAUoBcAFIAWwBOAFaAR8BPwEIASMB3QD6AL4A1QCPAKEAbAB6AD8ARwARABYA7f/y/8v/yv+v /6z/lv+U/3z/d/9q/2L/Vf9L/0H/PP84/yz/L/8k/yH/FP8j/xf/If8S/y7/Hf83/yb/Qv8x/1f/ S/94/2n/lf+M/7z/tP/j/93/EAARADoAQQBjAGkAigCWAKYAswC6AM8AzwDiANIA7gDWAOgA0ADl AL0A0wClALcAiQCaAGkAegBOAFUALwAyABAAGAD4//z/3v/e/8z/x/+1/7f/qf+f/53/lP+J/4D/ i/+H/4L/gP+F/4H/hf+C/4v/hv+N/4T/j/+K/5j/k/+m/6D/tv+w/9P/0f/o/+j/AwADAB0AIgBA AEUAXwBpAIAAjgChALUAwgDUANsA8QDqAAQB9AAIAfcAEQHtAAQB1wDvAMQA2QCfALQAfQCNAFIA XQAoADEA+P///8//0f+l/6L/df9p/1n/Tf87/zP/KP8X/xn/Cv8P//3+Cf/2/gP/9P4E//j+Df/9 /g7/B/8g/xL/NP8k/0b/Ov9c/1b/dv9y/5v/lP+9/7v/4v/k/w0AFQBDAEoAdACAAKYAtQDhAPQA DgEhATEBTAFMAWwBYgGHAXABkwFwAZUBZwGQAVkBewE9AWEBFwEzAe4AAQG8ANIAiQCbAFMAXwAh ACgA8P/z/7//vf+V/5L/a/9h/0n/Q/8k/xr/BP/u/vT+5P7l/tL+3P7J/tb+vv7V/sD+z/6//tr+ yP7n/tD++/7k/gn/+f4q/x//V/9K/37/dP+r/6P/3v/Z/xAADABDAEgAfACDALAAvgDhAPEABgEe ASYBRgFEAWUBTAF1AU8BdAFKAW4BNwFaAR4BOgH+ABkB2QDxALEAxwCGAJsAXABpACsAMAAGAAsA 4v/e/8D/vv+j/6D/jv+G/3T/af9i/1T/T/8//0H/NP81/yf/LP8a/yX/Ff8n/xb/Jv8a/y7/IP85 /yv/T/9B/2X/Vv+H/3X/q/+m/9T/z//9/wAAMwA2AFsAYgCCAI0AogCvAMYA1QDYAOwA5wADAfoA DwH5ABEB5gACAdQA6gC2ANEAnQCzAHwAjABeAGkAPQBFABgAIwD9/wcA6f/o/9D/y/+7/7z/pP+h /4//i/+K/4X/gv+A/3//eP95/3f/ev90/3v/cf94/2//fP92/4X/fv+O/4T/nv+c/77/u//S/9L/ 8v/y/w8AFAAvADUAUgBfAH4AhgCdAKcAwADNANgA5wDoAAQB9AAJAfcADAHtAAQB4wD4AMQA1wCo ALcAgACTAFwAZwAvADgACAANANj/2/+u/6b/h/+C/2v/Yv9S/0T/P/8v/zD/I/8n/xj/Hf8S/xX/ C/8V//7+GP8F/xr/Cv8k/xf/Lf8k/z7/Mv9R/0n/av9l/4X/fP+s/6T/y//J//j/+/8iACUAWABh AJUApADBANMA7AABARMBLQEuAUcBRQFkAVQBcgFWAXgBTQFyAUABYwEkAUEB/wAgAdYA7gCxAL4A fACJAEoAVwAdACIA8P/2/8D/wf+h/5n/eP9s/1z/UP83/yn/Ff8I/wX/8v75/uH+5f7V/uP+zf7e /sv+3P7L/uH+yv7s/tX++P7c/hL/9f4u/xv/Uv9B/3T/bP+e/5b/0v/L/wUABwA9AEMAdAB5AKUA twDTAOgA/AAXASIBQgE7AVkBRgFuAUgBZgFEAWYBNQFSARUBOAH7ABUB2wDvALAAxACNAJ0AagBy AD4ARAAQABEA8f/x/8z/x/+z/6z/l/+P/33/df9j/1r/U/9I/0D/NP8y/yj/KP8Z/yT/Ff8c/xD/ JP8Q/yb/Ev81/yT/Rf84/2H/T/98/3H/of+U/83/x//9//3/JgAqAFUAXwB9AI8AoQC0AMIA1ADZ APMA6gADAfMACwHuAAcB5wABAdUA7AC5ANAAngCyAH4AjABbAGcAPQBIAB8AIgD+/wMA5//p/8v/ yf+0/7D/nP+c/4n/f/+A/3b/df9s/2v/ZP9l/1j/X/9Y/1z/VP9c/0//W/9N/13/T/9n/2H/g/9/ /5X/kv+0/7L/0v/S//j/9/8dAB4ARQBOAHEAewCgAKkAwgDPAOIA+AD7ABIBBAElAQcBIwEGAR4B 9gASAd8A+ADBANcAogCwAHUAhwBIAFQAIgAoAPH/9f+9/7r/nv+Y/3f/cf9Z/1T/R/86/zH/Iv8h /xH/Ev8A/wX/9P77/uv+9P7k/vv+5f7//u3+Cv/8/hT/BP8q/xv/Qv80/2T/Vf+D/3n/sv+n/97/ 2f8XABkAVABdAIwAjwDDAM0A7gAAARgBLgE3AVYBVAF0AWIBhQFoAY8BYwGHAVkBegE7AWIBHAE1 AfUACwHIAN0AlgClAGkAdAA+AEYACwAPAOL/3v+4/7L/jP+H/2f/Yf9C/zP/KP8U/xX/Av8B/+3+ 8/7g/uX+zP7b/sX+1v67/tX+u/7W/sP+7P7V/gD/7/4e/wv/Qf8y/23/XP+a/5H/z//L/wUAAwA+ AEEAdAB9AK4AuwDfAPQACQEkATEBTgFEAWUBUQF0AVEBcwFQAW4BOwFeASEBQAEEARsB4gD3AL0A zwCRAKQAYABvADoAQgATABYA8f/y/8//zP+w/7L/mP+R/3//fP9o/2T/VP9P/0H/O/8t/yL/J/8Y /x//Ef8b/wz/Hv8M/yX/EP8y/x//QP8x/17/Uf96/3H/q/+g/9X/0f8AAAIALQA1AFcAXwCDAI0A pgCwAMIA0wDZAO4A5QD7AOkAAAHjAPYA2QDsAMIA2ACmALUAhQCQAGAAbQBBAE0AHwAnAP3/BQDj /+L/xf/C/7P/sv+S/5D/gf94/3f/bv9q/2j/Zv9h/2T/XP9c/1X/Xf9W/1v/Vf9g/1z/Y/9Y/2z/ a/+H/4H/mv+S/6//rf/P/8j/7//q/w4AEgAyADUAXgBlAIUAkgCmALwAygDlAO0ABgEBARkBDQEp AQ0BJQEAARcB8gAGAdUA6ACsAL8AhgCXAF4AaQAzADMAAgD//8n/xP+h/5n/ff90/1r/T/9E/zb/ Lf8c/x//DP8M//P+Af/w/vn+6P70/uL+8f7b/vj+6P75/uv+Dv/6/h//DP8x/yL/Sf86/27/Yf+P /3//vP+y/+b/4v8eACEAWgBjAJIAmgDCANMA7wAFARoBLwE7AVQBXAFzAWMBggFtAYkBYgGAAU4B cgE3AU8BEAEmAeMA/QC4AMkAiQCYAFYAYAAqAC0A+v/6/8//y/+s/6L/if93/1f/RP89/y7/Iv8U /xH/BP/+/vD++/7l/ur+0v7j/s7+2v7D/tz+w/7X/sL+7P7V/gD/6f4Z/wH/PP8o/1//Uf+H/3j/ u/+w/+3/6/8pACYAYgBkAJMAnQDEANUA9gAOAREBLwEtAUkBNwFXATgBVAEsAU4BIAE9AQcBJQHt AAYBygDhAKwAugB/AIgAWABiADIANgASABgA9P/z/97/3P+9/7n/pv+n/5L/jv+A/3b/bP9k/1X/ Tv9I/zj/Pv80/zL/I/8x/yH/Lv8d/zH/Hf87/yP/RP8z/1v/R/93/2T/mv+P/8b/wP/r/+T/HgAY AEAAQQBnAGsAiwCWAKYAtwC8AMwAzQDcAM8A3gDIANwAvADLAKYAtwCMAJkAbQB5AE4AXQAuADQA EQARAPf/8v/Z/9X/wP+8/6n/n/+R/4f/hP99/3r/dv9v/23/cf9o/23/Zf9o/2L/YP9Y/2P/Vv9g /1j/Zf9a/2//Zv+I/33/nf+T/7b/qP/R/8X/8v/q/wwACgA9ADwAaABrAJcAnADAAM8A6wD6AAkB GgEeATIBKAE/ASsBQQEbATMBDgEiAfMABAHPAOEApwCzAHoAiQBJAE4AEQAWAOf/4/+5/7L/jv+D /2//X/9R/0D/Of8m/yL/Ev8X/wL/B//y/v/+8f76/uf+9v7f/vv+5v4A/+j+Bv/z/hX///4n/xL/ PP8q/17/Sv+A/3D/p/+Y/9//1v8ZABcASwBNAIgAjwC8AMQA6wD4ABcBKgE8AVUBXAF2AWsBiQF0 AZMBawGMAVwBgQFCAV4BHgE4AfAABwG/ANQAjgCXAFwAZQApACwA+f/4/8j/w/+i/5z/dv9r/1L/ Pf89/yj/I/8P/xH//f77/ur+7P7Z/t7+y/7Y/sH+0P60/tH+tP7Z/rz+5P7H/vX+3v4P//r+Mv8b /17/SP+L/33/w/+0//j/9v81ADYAbwB0AKsAtwDnAPcAEwErATYBTgFOAW0BXAF9AVsBeQFUAXMB RAFgASwBSwEMAR8B6gD9AMUA1gCeAK4AegCFAFUAWQAwADcAEQAVAPD/6v/X/9P/wP+0/6z/ov+b /5T/h/+A/3X/a/9l/1f/WP9K/0//QP9L/zr/Sf84/0z/O/9N/z3/W/9N/2//X/+P/4P/t/+q/9v/ 0f8FAPz/KwAnAFUAUgB5AH4AnQCqAL0AxgDRAOIA4gDuAN4A8QDWAOkAxwDUALQAuwCOAJ0AagB5 AE0AUwAtAC8ABQAEAOr/4//J/8P/sv+q/57/kf+D/3j/e/9v/3X/av9x/2j/bv9k/2z/ZP9r/2H/ bf9f/27/Yf9x/2b/ff9v/4r/e/+Z/43/pv+f/8L/t//a/9L/+P/x/yIAGgBJAEYAcQByAJsApQDJ ANAA7AD8AAYBFwEbATQBJQE9ASUBQwEXATABBQEZAecA+gDFANEAlQCiAGcAbAA0ADUA/P/7/8// x/+l/5b/ev9p/1v/Sv87/y7/Kv8S/xP/+/4G/+3++f7m/vD+2/7l/sr+5/7P/u3+2P72/t7++v7o /gr/9f4a/wf/Lv8e/0v/Of90/2P/oP+S/9v/0f8HAAQAQgBDAHkAggCwAL8A4gDuABEBKAE7AVcB WwF8AXABkAF6AZwBcQGUAWwBjQFOAWoBJwFAAf0ADgHNANwAmQCnAGkAcQA1ADoACQAHAN7/1/+v /6f/e/9s/2L/Uv9D/zH/Lv8c/xn/A/8G//D+8f7d/ub+0f7c/sX+1v69/tL+uv7b/sT+4P7I/vf+ 3f4M/+/+Jv8T/0n/Nv91/2X/pP+X/93/1P8QAA8ATABPAIoAkwC5AMgA6AD1AAsBJAEhAT0BMwFS ATgBUwE1AU8BKAFCARQBMQH3ABQB2ADyALIAwgCKAJkAYABtAEYATQApACsAEAANAPH/7f/c/9n/ x//C/7z/tP+m/6T/lf+M/4v/gP+B/3T/df9r/2j/X/9j/1X/X/9R/1v/Tv9h/1b/Z/9Z/4X/df+j /5b/wf+4/+T/3v8QAAoAOQA1AFsAXQB9AIMApQCwAMEA1ADUAOkA4ADyAOIA9ADYAOgAyQDYALEA wQCeAKcAdwB+AFQAWwAuADEAEQAOAO7/6f/V/8v/uf+t/5r/j/+N/4T/gP92/37/dP96/3L/dP9n /3T/bf9x/2v/c/9t/3L/Z/93/23/hf97/43/g/+Y/47/qv+f/73/sf/a/9L/9v/q/xYADABAADoA agBrAJAAlAC/AMYA5gD1AAABDQESAScBHQExARgBKwESASgBAAEPAeMA9AC9AMsAkQCdAF8AZwAq AC4A+P/3/8j/w/+c/5H/e/9q/1X/RP89/yv/Jv8T/xL//v4I//b+//7n/u7+2P7w/tz+8f7b/vr+ 3f75/uX+CP/3/hL/+/4o/xD/Nv8j/1f/RP94/2b/qP+c/+D/2/8UAA8ARwBKAH8AhQCzALwA6QDz ABQBJQE6AU4BWQFyAWcBhgFqAZMBbgGRAVkBegE/AV8BGAEwAewAAgHAANEAigCZAFkAYQAoACsA +v/8/8v/x/+X/4v/d/9s/1X/TP87/y3/J/8a/xf/Bv8G/+7++f7k/u/+1f7k/s/+2v7K/t/+xf7l /sv+6/7T/vv+4v4Q///+MP8a/1b/Pv9+/2z/r/+e/+X/3P8bABoAUgBUAI0AkgC5AMsA5QD6AAgB HgEcATEBKQFEAS8BSQEiAUEBEQErAfkAEwHdAPAAuADHAJAAnQBoAHMARwBMACoALAAPAAsA7v/u /9v/1v/G/73/tP+r/53/lv+I/4T/g/95/3j/Z/9s/2H/Yf9W/1r/T/9R/0P/UP8//1X/Q/9b/0j/ Yv9Q/3f/bP+Y/4v/r/+m/9f/yv/5/+z/FwAUADsAQABlAGgAgwCLAJ4ApgCvALsAuQDKALcAxgCs AL0AmQCpAH8AkQBoAG4AQwBOACIAJgADAP//4P/c/8b/v/+s/5//i/9//37/cf92/2j/cf9p/3T/ ZP9z/2v/d/9r/3n/cv93/27/ff92/33/dv+J/4D/lv+Q/6D/mv+y/6z/vv+8/9L/0P/u/+z/EQAJ AC8AMQBXAFsAewB+AKMArQDOANgA4wD3APsADAEJAR8BCwEcAQMBGgH1AA8B3gDtALkAygCTAKAA YQBsACkALwD9//n/y//C/5n/kf9z/2L/Uv8+/zb/Hv8h/wj/DP/0/gL/5/79/ub+8v7c/u3+0v70 /uD++v7o/gX/8/4X/wT/IP8R/zH/IP9I/zf/Y/9S/3v/aP+n/5f/2//N/wAA+/87ADgAbAByAJwA pQDIANgA/gAQASABNwFLAWcBXAF+AW4BjQFxAZYBZgGLAVUBdQE4AVcBDgErAecA/AC1AMYAhgCO AE4AVwAeACYA8P/u/8H/uf+W/4r/ef9p/1n/S/9F/y7/Lv8b/x7/CP8P//r+BP/w/vz+4/7v/tz+ 7P7X/ur+2f7t/tv++f7h/gP/6/4c/wT/Mv8a/1f/QP9+/2r/q/+Y/9j/z/8OAAcASQBKAHkAewCl AKwAygDVAOMA9gD8ABEBAwEXAQsBHwH9ABUB7wAEAdcA6gC+AM4AnACnAH0AhQBTAFgAMQA6ABcA GwD8//z/4//j/9L/yv+8/7f/sP+u/5//lf+M/4H/hv96/3v/cf9w/2j/aP9d/1z/Uf9V/0b/UP8/ /1P/O/9T/0L/Xv9P/3X/YP+J/3r/pP+U/8H/r//f/9H/AgD6/yUAIABKAEwAZQBpAIIAiACQAJsA nACrAJoArQCRAKEAgACLAGoAdgBSAFoAMwA4AA4AFQDy//P/2P/N/7//t/+j/5r/iv9//33/cf97 /2b/d/9n/3T/bP91/2r/e/9x/3z/dv99/3v/gP94/4n/gP+R/4f/m/+N/6L/mP+s/6b/vP+1/83/ xv/e/9v////1/xoAFwBCAD4AZQBnAIwAlACrALMAyADZANwA7QDvAPoA9AABAfAABAHkAPoA0gDn ALQAwwCPAJsAYQBsADIAMwAEAAAA1P/M/6X/nP+C/3j/Yf9S/0f/Mf8s/xr/H/8M/xL/AP8H//L+ +f7e/v3+5P7+/uv+B//x/g7/+P4X/wL/I/8P/y7/G/9A/yz/Uv8+/2//Yv+e/5D/v/+1/+b/3/8R ABAAQABHAHEAdgCiAKgAywDZAPwADAEZAS0BNwFSAUsBYQFQAW4BTgFuATkBVwEjATsBBAEjAdcA 7wCuAMAAfwCLAFIAWgAjACEA9f/s/8L/uv+m/5X/gf90/2j/Wv9V/0H/Rf8w/y//Hf8h/xL/Ef8B /wz/9P76/ub++v7k/vP+3P71/tz++P7l/gP/7v4S//v+Kf8Q/zz/LP9h/1H/kP96/7z/sP/z/+r/ IgAeAE4AVQB7AIcAowCyAMEAzgDVAOYA5wD2AOwAAAHlAPcA2ADvAMQA1wCpALkAiwCYAGwAeQBK AFQAMgAvABAAFgD4//r/6//n/9P/zP/I/8H/uf+u/6b/n/+g/5n/mv+R/5P/jP+K/4b/hf94/3j/ b/90/2b/av9d/2L/Vf9r/17/ef9p/3//dP+S/3//qP+a/7//uP/a/9P/+P/2/xwAGgA8AD4AWQBh AG8AfACBAIwAjwChAIoAmQCAAJUAdwCFAFsAagBJAFQAKgAvAAYADgDt//D/2P/N/7T/rP+d/47/ i/9+/4H/dv9+/3D/fP9v/3v/bv9+/3f/h/9//43/gv+U/4z/nv+W/6b/n/+t/6n/uf+1/8D/vP/L /83/2//S/+r/5//8//z/FAAWADEAMgBQAFQAdwB6AJsApACzALwAzwDeAN0A8QDmAPgA7AAFAekA /QDbAO0AxwDZAKgAtQCBAI0AVABYACEAJADx//D/vf+8/5b/iP90/2T/Uf8//zT/If8c/wn/E/// /gH/7f7y/tr+9/7f/vz+5P4C//D+D//6/hX/Bf8m/xX/Lv8e/0T/M/9S/0X/a/9g/47/iv+t/6P/ 1f/N//z/9/8iAB8ATgBQAH0AggCqALUA2QDnAP4ADwEbATMBNAFOAUIBXQFEAWQBOQFYAScBPwEJ ASAB5gD6ALUAxwCKAJgAWQBhACUAJgD0/+//wv+6/5z/jP90/2L/Vv9F/z3/K/8s/xT/Gv8J/xP/ +/4J//P+Af/u/vn+3v7v/tr+9v7f/vv+4v4B/+v+C//1/h7/BP8r/xb/SP83/2b/U/+L/37/sf+q /+b/4f8YABkATQBNAHsAhQCkALEAywDaAOgA/gD5AAwBBwEiAQcBJQEAARsB6AADAdgA6QC1AMcA jQCdAGkAdwBJAFMAIgAoAAQACQDf/+P/yf/K/7X/s/+f/6D/i/+C/4T/fv99/3L/ef9x/3D/Zf9u /2P/aP9a/2L/Wf9b/1L/XP9V/13/T/9o/1r/dv9t/4L/d/+d/43/tf+q/8//w//u/+f/DwAPADIA NQBVAFgAcAB5AIUAkwCTAKQAngCpAJsAqgCQAKYAhgCSAGoAfABQAFsAMQA1AA4AEgDo/+n/xf/E /6X/mf+P/4f/e/9v/2z/Yv9l/1v/aP9d/2L/WP9q/2D/cf9n/3r/cf9+/3//jf+H/5f/kf+l/6H/ rv+o/7n/t//E/8L/0f/N/+T/3//8//r/FQASADIANABTAFYAfwCIAJYAoQC0AMEAyQDcANsA7wDm AP8A7QAGAekAAQHZAPIAvgDXAKIAswBzAIAARwBNABIAGQDj/+L/s/+z/4f/e/9Z/07/Ov8q/xX/ A/8I//D+9f7Y/t3+wv7c/sL+4P7G/uL+y/7v/tr++/7q/gr/+P4X/wb/J/8U/zv/Kf9L/zz/af9Z /5b/iP+w/6f/3f/b/wsABgA3ADQAXABeAIoAlAC5AMMA5wD6AA8BIgEtAUoBTAFpAVoBdwFUAXwB UQFzATgBWAEgATsB/QAQAdIA5wCcAKkAcAB2ADYAOgD+////0//Q/6X/nP+A/3T/ZP9V/0r/O/84 /yf/Jv8U/yP/Dv8Q//r+B//4/gP/7/7+/un+/f7s/gj/9P4F//P+Fv/9/ij/D/85/yb/U/87/3L/ W/+Q/4P/w/+7//f/8/8oACMAVQBaAIMAkACvALsA0wDmAPAADAEHASEBEgEuARgBMAEPASoB/AAW AeMA+wDEANUAnwCuAH0AjABYAGIANAA5ABEAEQD2//T/2v/V/8n/w/+t/6j/nf+V/4//iv+I/3v/ fv90/3X/cP9t/2T/af9d/2D/Vv9g/1L/Wf9J/2L/Uf9q/1r/ev9m/4L/d/+a/4z/sP+f/9D/w//x /+j/EAAMADkANABZAF4AeACAAJAAmwCjAK8ArQC9ALAAvACnALUAmACnAIEAjABpAHAASgBTACcA LQAKAA0A5//g/8z/yf+2/6//pf+g/5j/kf+T/4v/kv+K/5X/jf+V/4z/mv+Y/5//n/+m/6X/sf+w /7//wf/H/8b/0P/P/9j/2P/l/+T/8//x/wEA/v8OABMAIgAfADgAPgBXAF4AawBxAIAAiACVAJwA nwCqAKgAswCtALsAqwC5AKMAswCXAKIAfACJAFoAZQA4AD8AFQAZAO7/7v/J/8X/rf+k/4v/gv9w /2P/Xf9N/0b/Ov9A/zH/Nv8p/zL/If88/y7/Rf85/1D/RP9i/1n/d/9t/4X/hf+Y/5X/p/+j/73/ vP/M/8z/7v/u////AgAPABIAJQAsADYAQABOAFoAZgByAH8AigCWAKQArAC3AL4AzgDOANsA0gDh ANUA6gDNAOEAxwDUALIAvgCbAKgAfgCKAGUAbQBCAEQAIwAlAP//AQDi/9z/xP+8/7D/o/+g/5T/ lf+K/43/g/+G/3r/gf97/4X/f/+E/4H/g/9+/4T/gv+I/4j/kP+R/5b/lf+W/5n/mf+g/57/nP+n /6P/tP+t/73/vP/L/8z/5P/n//b/9v8JAAsAFAAbACgALAA2ADcARABOAFMAWABQAF4AVgBgAFYA XgBPAFQASABMADsAPwAvADIAHQAfABQAEAAGAAAA///4//f/9f/w/+b/6//q//H/7P/t/+T/8//t //f/9/8CAAYAAwAJABEAFQARABoAFgAbABcAHQAQABcADgAWABQAGwAPABYAEAASAAsADgAJAAcA //8EAAMABgAEAAYACQADAAUABQALAA4AAwAKAAcACQAEAAMA/f8BAPb/+f/t/+7/4P/g/9L/0//H /7v/tf+v/6f/oP+d/5X/j/+B/4r/g/+G/4D/jP+E/5P/jP+i/5r/r/+p/7//uf/R/8v/5P/i/+// +P8GAA4AFwAhACoANAA3AEQARABQAE4AWQBYAGMAYgBoAGcAdABrAHQAdgCAAH8AjQCFAI4AiQCV AI8AnQCTAKEAiACbAIwAngCLAJUAfQCHAHQAgwBiAGwATQBbAC8AOgAaACAA/v///97/4P/H/8P/ sP+t/5r/j/+C/3n/af9i/2P/Wv9X/03/VP9C/1T/RP9U/0P/XP9S/2f/Xv91/2j/iP98/5X/iP+j /53/sv+n/8f/v//a/9f/6f/v//z//v8RABMAIQAlADUAOgBLAE8AYABiAHMAeQCFAJIAkgCdAKQA swCvAMEAsgDDALMAyACwAMMApAC1AJ0ArwCLAJkAfQCHAGAAcABIAFgALgA4ABMAIAD+////7f/q /9b/2P/G/8b/uf+2/6z/qv+h/5v/nv+U/5f/jv+U/47/jv+D/47/h/+M/4b/kv+K/5T/jP+Y/47/ mv+P/6r/pf+x/6b/tv+n/7j/sP/H/77/0//Q/+f/3P/0//L/CAABABEAEQAgACAALwAvADcAQABD AEwASABRAEcAVQBIAFYAQwBGAD4ARgA2AEMAMgA8ACcAMQAiACsAGQAfABQAGAAOAA4ACgASAAYA CQAJAAwACAAJAAwAEQAPABQAEQAWABcAGwAWABwAFwAbABcAHQAcACAAGAAiABMAGgAXABgAEAAV AA4AFgAOAA8ADAALAAYACAAGAAYAAwAEAAcABgAAAAMA/v/7//f/+P/w//P/6P/q/+T/4//d/9r/ 1f/V/8f/xf+5/7f/sf+s/6L/oP+e/5j/k/+M/47/if+T/43/lP+M/5r/mP+m/5z/sP+u/8H/wP/K /83/4P/k//P/+v8KAA0AGwAkACwANQA+AEkASQBUAFUAYQBfAG4AagB6AHEAgQB4AIoAgQCNAI0A lwCPAJgAigCbAIkAmgCHAJoAgwCSAH0AigBzAIUAZwB1AFkAZABKAFMAMQA2ABsAIQABAAYA6P/r /9H/0f+3/7f/mv+c/43/f/96/2j/av9c/17/Sf9R/z7/TP89/0//P/9W/0j/W/9V/2z/Yf93/27/ hv98/5L/j/+m/5//tv+y/8z/xv/l/+T/9f/0/wYADQAaAB8AKwAsADwAQwBTAFcAXgBoAHEAegB+ AI0AjgCcAJoApwCfAK8ApQCzAKEAswChALEAmwCpAI0AmgCFAI4AbAB3AFsAYwBHAE4AMgA4AB8A IQALAAgA8f/w/+D/3f/S/8z/w/++/7z/u/+w/6z/q/+m/6f/n/+o/53/nv+Z/6T/nP+l/5v/p/+h /6r/o/+u/6T/sP+p/7b/qf++/7f/wf++/8r/xv/W/9L/3//Z/+v/5v/2//v//////wsACwAVABoA GQAhACUAJQArADAAMAA2ADUANwAyADcALQA0ACoANwAiAC0AHgAsABwAHQAYAB4AFQAaABEAEwAQ ABUAEgAWAA8AFAATABUAHAAgAB8AJQAiACIALgAvAC4AMQAxADoANwA/AEEARwBEAEUAQwBIADgA QQA5AEEANwA7ADQAOAApADAAKwAtACIAJQAiACMAGwAgABQAGQAHABEABgAOAPv/AAD6//j/8P/x /+f/6P/f/+H/0v/S/8r/yP+9/7z/sv+x/6X/p/+k/5v/nv+Y/5n/lP+Y/5L/nf+c/6j/o/+q/6P/ uv+v/8H/vf/V/9D/4//l//n//P8KABAAHwAkAC8ANABCAEMATABWAFoAZQBmAHEAcgCBAHQAfwB7 AIgAhACRAI0AkwCJAJEAhwCTAIYAjgCCAIwAegCHAHQAgwBpAHQAXgBnAEkAWAA6AEIAIwAsABAA EgD3//b/4//g/8j/xP+y/6//nP+Y/4z/gP95/2z/a/9i/2L/V/9b/07/Vv9J/1n/Tv9h/1b/b/9g /3T/bP+F/3z/kf+P/6f/pP+2/7b/y//K/+X/3//0//X/AgALABgAHgAuAC4APwBGAE0AUgBdAGYA aABxAHYAggCBAI8AkgCfAJYAqACfAK0AmwCoAJoAqACRAKAAjACYAIAAiABxAH0AXQBjAEgAUwAw ADsAHwAgAAcAAgDv//P/2f/a/8r/yv+6/7j/tv+r/6X/n/+d/5T/mv+O/5f/j/+T/4z/lv+O/5j/ j/+g/5b/qf+e/6n/pP+u/67/uv+3/7r/u//J/8T/1f/M/93/3f/n/+j/+v/+/wIACgAYABMAIQAh ACsAMAA4ADoAQABHAEYARwBNAFIATABYAE4AWQBIAFQASABTAEEARgA7AEMALwA2ACMALAAYACAA EgAWAAcACwAAAAQA//8AAPf//v/1//z/9//6//L/9f/1//3/+////wQABQAEAAYADAAOAAwADgAP ABYAEAAYABQAFAAUABQAFgARAAwAEAASABQADgAQAA8AEwAQABEAEQASAAYACwAIAAQABAACAAQA AwD9//r/+P/5//P/8v/q/+b/3//i/9f/2P/Q/8//yP/C/7r/t/+1/63/sv+r/6n/ov+p/6b/rv+q /7H/rP+4/7f/xP+//9D/1f/a/9//7//2/wEABAAUABYAHgAnADEAPQA7AEYASABSAE4AWABfAGoA aABvAG4AeQB0AIEAewCIAHoAiAB4AIYAdgCGAHUAgAB3AHwAbwB3AGgAcABhAG0AVgBfAEYATAAy ADkAIgArAAsAEwD3//v/5f/i/8v/zf+0/7H/oP+g/5P/iv99/3v/cf9n/2j/Xf9f/1X/Yv9P/2H/ U/9q/1v/dP9r/4D/df+N/4n/nP+W/6v/p//C/8D/1f/Q/+f/5f/7//v/CAAQAB0AIQAuADQAQQBH AFMAWwBiAGwAbAB6AH4AhwCHAJMAlgCjAJgAqACZAKwAowCxAKMArgCYAKgAjQCeAH8AlAB0AIIA YgBsAEwAWwA6AEUAJQAuAAwAFgD9/wQA7v/x/9z/3v/R/9T/yP/F/77/vP+8/7X/t/+x/7X/sf+z /63/t/+w/7T/tP+8/7f/v/++/8L/wf/H/8b/yv/K/8//0P/X/9P/3f/e/+L/4v/t/+n/9v/0//z/ /P8HAAgADwAPABcAFwAhACgAIAArACoAMQAuADYAMAAxAC4ANAAoACsAKQAvACIAKQAZACYAFAAb AA8AEQAFAAQAAAABAPz//f/8//7/AAD///z//v8HAAYACAAMAAsAEQATABsAHAAlACgAKQAtADMA NQA5ADoAPgA9AEEAOQBAADkAPwA3AD4AOQA8AC8AMwAuACwAJQAnAB0AIwAYABwAEwAWAAoADQD/ ////+f/6/+7/7f/k/+X/4v/e/9r/2P/N/8j/v/++/7b/r/+q/6P/nv+V/5z/k/+Y/47/lP+M/5b/ kP+X/5L/ov+f/6r/pf+3/7T/x//E/9z/2P/s/+f/AAAAABIAGwAmAC8AMwBBAEQASwBRAGAAYQBt AGgAbwBxAH8AcgCEAHoAiQB9AI0AggCMAH8AjAB4AIUAdAB+AHAAeABsAGsAYgBqAFcAXABMAFQA PQBJADAANgAfACAAEAAPAPn/+v/q/+X/0//P/8H/u/+s/6j/l/+U/5H/hf+J/3r/eP9n/3T/av9z /2n/ef9q/37/c/+K/4H/j/+G/5//mv+v/6r/wf+4/87/zv/d/9r/7P/u//z///8FAAgAFAAZAB8A JgAvADAANwA4ADsASQBKAFMAUgBeAFoAZQBqAHEAaQByAG4AeABxAHgAbwB9AG8AeQBrAHsAYABr AFgAZgBSAFsARQBOADIAQAApAC0AFQAfAAcAFQD7/wIA8P/1/+v/4f/g/9v/2f/R/9H/0P/M/8b/ zv/D/8n/yf/M/8j/yv/I/8//x//K/8r/0//J/83/xv/L/8n/y//J/8z/zP/P/8v/2P/O/9j/0P/d /9f/3v/c/+n/4//t/+f/9f/u//7//P8EAAEADAAOABMAFwATABkAHwAfAB4AHwAcACQAGwAiAB0A IQAVABsAEgAZABAADwANABIABwAEAAkABwADAAoACgAKAAgADwANAA8AEQAZABQAHQAcACEAIQAk ACUAJQArACsALgA3ADUAPAAvADcAMgA3AC4ALwApAC4AKQAkACUAIgAhAB4AGgAZABcAEwAUABQA DQALAAsACgAGAAMAAAADAP3/+//5//P/7f/w/+3/7P/e/9v/2v/b/83/zf/E/8L/v/+7/7n/s/+z /6//s/+t/63/qf+0/63/tP+q/7j/sv+//7r/x/+//9f/1f/o/+P/+P/2/wgACAAPABQAIwAmACwA MwA6AD0ARwBHAFAAVQBUAFgAXwBgAGUAcQBjAG8AaQBwAG0AcQBlAG4AbABzAG4AcwBqAHIAaAB1 AGYAcgBaAGYAVABeAEwAUwBDAEcANgA7ACQAJwAUABgABAAGAO//7f/a/97/yv/G/73/tP+t/6H/ nv+Y/5b/lP+T/4n/jv+F/5L/if+Y/47/m/+V/6L/nv+v/6v/uP+1/8b/xf/Q/9H/3P/d/+n/7P/1 //X/+//7/wUACAALABMAFQAdACIAIwAtAC0ANwA1AD4AQwBEAEkAUABPAFIAWQBVAF8AWgBhAFgA ZgBYAF8AUwBaAEwAUwBGAEUAOAA5ACgALgAZABwADQATAP3////3//L/6P/k/+H/3f/f/9v/1v/W /9b/0v/W/87/1P/N/9f/1f/a/9L/3v/Z/93/3v/m/+H/6P/l/+f/6v/q/+j/6v/v//D/8f/v/+// 9v/x//T/9f/3//j//P/3//z/AQAHAAQADQAKABQAEgAVABsAGgAfAB0AIAAgACMAHgAlACAAIgAb ACQAFgAeABAAFwAPAA8ABAAEAP7////2//f/7v/w/+7/6v/q/+f/6P/r/+n/6P/r/+z/8v/u//r/ +f8BAAQACgAFAA4AEwAVABcAHQAdACEAJAAfACcAIQArACUAKQAmAC8AIwAnACgAJwAkAB0AJgAi ACYAIgAcABoAHQAaABsAHAATABUAFgAWABMAFAAKAAwABwAEAPz//v/3//r/8P/q/+D/4f/T/9D/ zP/G/8P/wf+9/7X/t/+5/7T/rP+z/6z/s/+q/7v/sf+//7b/xv++/9L/zf/f/9//6//q//n/+P8E AAoAFQAZACIAJgArAC8AMwA8ADwAOwBCAEkASABSAEoAUQBRAFYAUgBaAFEAVwBWAFsAUQBcAFMA WgBSAFoATABUAE8AVQBGAEwAPQBFADcAPQAvADMAJAAqABwAGgAJAAsA/v/8/+j/6P/X/9T/x//F /77/uP+u/6X/qP+f/6H/lf+d/5L/mv+Q/57/lv+j/5T/pv+d/7H/qf+9/7T/wv+//9H/y//W/9P/ 5v/g/+v/7P/4//b//P/+/wYABAANAA8AFQAWABsAGwAhACQAKQAsADQAOAA4AD8AQgBMAEMATQBF AE0ASQBTAE4AUgBIAE8ARwBPAEAAQwA7AD8AKwAzACIAKQAYABsADQAOAAAAAQD0//r/7P/u/+j/ 6P/h/93/3v/f/9//3P/f/93/4P/d/+P/4//o/+X/7P/s/+7/7v/4//n/+P/6//7/AwD9/wAABgAI AAMABgAIAAUABQADAAUAAwAHAAkABAAEAAkADAAMAA8ADQAOABEAEgAPABIADwAVABMAEwAWABYA DwAQAA0ADgAHAAcABgAGAPn/+v/6//n/7f/z/+f/5//h/+H/3//f/+H/2P/f/93/5f/h/+r/5//z /+z//v/7/wUABQAUABQAIAAhAC0AMgAyADsAQABIAEoAUgBPAFcAVgBcAFcAXgBWAFwAWwBfAFQA XwBWAGQAVgBZAFIAVwBMAFAARwBJAD4AQQA2ADsAKAAsACIAJwASABQACAAGAPz/9//q/+X/1v/S /8f/wv+2/7D/qf+f/53/j/+S/4n/iv95/4L/dv9//3L/ff9w/4L/d/+I/3//lv+E/5//l/+s/6f/ wP+8/9X/zv/p/+X/+P/5/wwAEAAeACMAMwAyAD0AQwBRAFQAXwBiAGgAbgBuAHcAcwCAAHcAgwB+ AIsAfwCLAIAAiwCCAI0AgACKAHcAhgBzAHwAZwBxAGAAaABRAFcAQgBLAC4ANQAfACMAAgAJAPX/ 8P/e/9j/yf/D/7L/pf+i/5n/lP+A/4b/ef99/23/ev9p/3b/Zv94/2r/fP9t/4P/cf+L/37/kv+I /6D/kf+u/6v/t/+y/8j/u//S/8z/3P/X/+j/4//4//L//v/5/wkACAAXABkAIgAoAC8AMwA7ADsA RABFAE0AVABSAFgAVQBdAFoAYgBaAGMAWQBeAFIAXwBNAFMASgBOAD4ARQAyADgAJwAsABoAHwAP ABUAAwAEAPn/+v/z//T/7f/s/+r/6//p/+H/5//d/+X/4f/m/+D/4//g/+f/5P/l/+H/5//n/+n/ 5f/m/+X/4//i/+f/4f/l/+D/5//f/+H/2v/j/+D/5f/c/+f/4v/v/+n/8P/r//P/7//4//X/9//2 //z/9v8BAPv/BAADAAAA//8AAAIA/f////7////7//b/9P/0//D/8v/1/+3/8//x/+//8f/2//T/ +f/1//3///8IAAMADgALABQAFwAcAB8AJQApAC8ALQA7AD0AQAA9AEMAPwBCAEMAQgBCAD4ARQBA AEEANgA2ADMAMAAvACsAJQAhACIAGwAVABMADQAJAAcA//8EAPn/9//z//P/7//v/+b/5P/d/9v/ 0v/W/83/x/+7/8H/t/+7/63/sf+i/6b/mv+n/53/nv+W/6D/lv+d/5f/oP+V/6j/ov+0/63/vf+z /8n/w//Y/9L/5v/k//b/8/8GAAcAFAAYACQAIwAwADAAOgA9AEkATABRAFsAVgBdAFsAYQBeAGcA XQBiAFoAZQBfAGQAWwBaAFgAWABXAFcATgBTAEkATABEAEcAOQA3ADIAMQAkACMAHQAZAA4ACgD9 //b/9P/q/+H/2f/S/8H/xv+0/7T/p/+u/57/rP+U/6T/lf+g/5L/n/+T/5//jf+p/5f/r/+h/7b/ qv/A/7j/z//C/9f/zf/j/9z/7P/l//f/9P8AAPz/EQAHABQADwAeABsAJgAlAC4AMAAwADQAPAA8 AD4AQQBFAEkARwBNAEkAUQBNAFAATwBUAE4ATwBLAE0ARQBNAD4ARAA5ADwAMAAwACQAIQAXABcA CgAKAAIA/f/x/+7/7f/m/+H/1v/Z/9H/1//P/9X/yf/S/8n/1//K/9b/y//b/9X/3v/P/+X/2f/q /97/6P/h/+j/4f/u/+j/8//s//L/7P/v/+n/8v/u//f/6//7/+7/+//r//7/9f/8//f/AwD9/wMA 9/8EAAEACQACAAYAAwAGAAYABgAEAAYABAAFAAEAAwD///n/+v/1/+//8f/v/+v/6//n/+P/5P/c /+j/3f/i/9z/6f/f/+f/4//u/+v/+P/p/wEA9f8DAAEAEQALABwAFAAnACAALQAoADUANAA9ADYA PgA/AD4AQABEAEEAPgA+AEMAQAA/AEAAQAA8ADMAMQAzADIAKQAoACUAIgAeABsAFQAUAAsACQAH AP3//v/0//H/7P/h/9v/1//P/8j/v//A/7f/tf+r/6z/of+h/5T/m/+N/5P/hv+U/4P/lf+C/5T/ iP+b/4v/pv+S/6v/n/+7/6//y/+9/9r/1f/s/+j/AQD6/w8ABgAdABcALgApADsAOwBHAEYATwBS AFQAVgBgAF8AYQBkAGgAaABsAGoAbgBwAGoAbgBpAG4AZABlAGEAYgBaAF4AVABWAEcASAA+AD8A MwA2ACIAIwAOABAAAgABAPD/6f/h/9v/yv/C/77/tv+w/6f/rv+g/6L/lf+f/5P/n/+O/5//kP+e /5b/qP+d/63/n/+z/63/v/+3/8n/xP/W/8z/4f/d/+3/6f/5//P////7/wMABwAOAAkAGQAaAB4A HQAoACgAKwAsADEALAA1ADEAOwA1AD0APQA+ADwAPwA8ADwAOwA5ADkANAA1ACsALAAiACIAGAAZ AA4AEAAJAAUA/v/7//T/7v/u/+T/7f/h/+//3//r/9v/6P/e/+P/3f/q/+L/6//j/+//6f/4//H/ /f/3//////8GAP3/BwAEABEAEAATABQAGwAaABsAIAAhAB8AJwAgACMAHwAgAB4AJgAjACMAHgAm ACMAIwAkACIAHwAeABgAHgAVABEADQAWABAAFwALAA0ACwALAAUADQAHAAsACgAEAP//AwAAAAAA ///6//X/8f/q//L/7f/z/+r/9v/w//3/+f8EAPz/DwAMABMADgAfAB4ALQAsADYANwA/AEAATABN AFEATwBVAFcAWwBbAF4AXwBdAF4AXgBkAFoAWgBXAFkAUgBVAEsARwBHAEcAPgA+ADkANgA3AC0A LQAqACkAKQAhABoAGQATAAoABgD8//j//P/z/+n/5P/n/97/4P/W/9n/zv/V/8r/z//L/9f/zP/S /8n/1v/J/9X/zv/c/87/4//X/+f/5P/6//P/CAACABMADgAkACAAMQAwADQANQBCAEAAUABUAF0A WwBgAF0AZwBrAGgAawBvAHIAcABzAHEAcABtAHEAbgBrAGYAZwBjAGUAYABiAFcAWQBNAFYASgBG AEAAPQA1ADAAKAArABsAGQANAA8AAwD9//b/7v/n/93/2v/O/8b/wv+//7L/vP+r/7P/pP+p/6D/ pv+b/6j/nv+r/6D/s/+l/7f/p/+8/7D/xf+6/87/yf/V/9L/3//Z/+7/4//2//D/+//0/wIA+/8G AAIAEwAPABcAFAAfABkAJwAgACsAKQArACwANAA1ADkAOgBBAD4APQBDAEAARwBBAEUAQQBCADsA QQA2ADgANQA3ADAALwAoACgAIgAlABoAGgAUABcACAANAAoABQADAPv//f/7//r/9v/9//b//P/z //n/8//3//D//P/3////+P/8//b/AAD5/wAA+//+//v/AgD+//z/+/8AAPn//v/3//7/9f/5/+3/ 9f/s//L/6P/1/+7/8f/s//H/7f/0/+z/8v/q//P/8f/5//b/+P/y//3/+//7//n//v/8////+P/8 //f/9f/4//X/8//0//P/9v/0//P/7v/2//b/9v/w//r/+v/9//v/AQD//wwACgATABUAGwAdACQA JQAtADAANQA3ADIAOwA+ADwAPQA9AEEARABBAEMAQgBFAD4APwA+AD4AOgA5ADYANgAxADAAKQAr ACEAIAAcABsAFgAXABYAEgAOAAwABAABAPb/+f/1//f/6//l/+T/3v/X/9b/z//O/8j/xf+9/7r/ t/+0/7b/r/+z/6b/r/+l/63/p/+0/6f/uf+u/8D/uP/I/8D/1v/R/9//2f/x/+f//P/1/wYABgAS ABIAIQAoACsAMAA4ADcAPQBBAEcASQBMAE4ATwBYAFUAWgBYAFsAWwBfAF4AaABgAGEAXgBgAFgA WQBTAFkAVABSAEoASgA/AD4ANQA5ACUAMAAeACAACQAJAAEA+//v/+r/2v/X/8v/x//B/73/uP+v /7D/qv+l/5n/pf+a/57/k/+h/5j/pP+a/6r/of+u/6f/uv+y/7//uf/N/8f/0//Q/9z/2//l/+H/ 9f/w//r/+P8DAAIADgAMABEAFQAWABsAIgAhACkALAAvADgAOQA8AEIAQgBKAEoASwBRAEsATQBM AE4ARwBRAEoAUABCAEEAOgBDADkAPAAxADYAIQAnACAAIgAWABcADwAOAAcABAAAAAEA///6//j/ 8f/z/+7/8//t//D/8P/z/+v/8P/s//b/9f/6//j//v/8//7/AQADAAEAAgAFAAsADQAGAAYABwAL AAoACQALAA0ADQALAAsADAAHAAQAAwAIAAIABwABAAYABAAEAAYABgAAAAUAAgADAP7/AgD6/wAA 8v/3//P/9f/u/+7/5//n/+L/4//d/9//2v/Z/9v/2v/b/9f/1//Z/9r/2v/h/97/4f/g/+3/6f/2 /+///P8BAAsACgARABQAGQAZAB8AIgAiACcALAAsACkALwAvADEAMAAzAC0AOQAtAC8AKAAuACgA KAAeACQAEwAXABUAFgALAAwABgAIAP7/AQD5//3/6//s/+n/5//h/9//2f/V/8z/yP/F/8n/wP+7 /7v/tP+3/6//rv+o/6j/pf+s/6f/p/+h/6j/pf+y/6r/tP+z/7//uv/H/8X/z//S/+D/4v/y/+// ///8/w0ACwAdABwAIwArADIANwA1AD4AQABIAEIASgBDAE0ASABOAEcATABGAE8ARwBPAEYASQBC AEcAPQBCADEAOwAsADQAJAApAB4AIAASABIACgAKAP3/AQDt//P/5f/i/9X/0//F/8T/vf+0/7D/ rP+m/57/ov+Y/5r/kP+a/4n/l/+L/5f/kP+Z/5P/oP+Z/6n/pf+z/7D/vP+6/8j/w//V/9T/3//g /+n/6//0//n//v8EAA4AEgAVAB0AHQAgACYAKgAmACsALQAwAC8ANgAwADgAMwA4ADQAPgAzADwA NQA/ADIAPgAzADgALQA3ACoANAAmACwAHgAlABcAHAAOABgABQALAPv/AADw//b/6//t/+D/5//a /9v/0f/X/9D/zv/O/8v/y//L/83/zf/Q/9D/0v/S/9z/1v/X/9r/4//g/+P/4v/m/+T/6P/o/+3/ 6//x/+r/7v/v/+7/6//r/+//7P/s//H/6v/t/+3/7//u//P/8f/1//L/8v/0//j/+f/3//n//P/8 //7/AAD+////+v/5//j//f/0//f/8v/x/+r/7//t/+r/6P/o/+L/4v/i/9z/3v/Z/9f/1v/c/9r/ 3v/i/+b/5//r/+n/7f/w//X/+P/7//v//v/9/wUACQAIAA0ADAASABMAFwAXABgAGAAWABgAGQAa ABgAEgAXABQAEgARABQACwAPAAwADQAIAAoACAAFAAIABQD//wQA+f/5//v/9v/x//H/7P/s/+j/ 5v/h/+H/2f/a/9T/z//K/8r/xf/C/7j/tv+5/7L/sv+v/6//sf+x/63/sv+w/7v/uP/A/7v/xf/E /8//1f/V/9v/7f/t//X/8/8CAAAADAAQABYAIAAiACQAIgAsACoALgAvADEALQA1ADUAOAA3ADoA PQA9ADwAQQA5AD8AOQA/ADYAQAA1ADgANAA8ADIAOAAtADEAJgAkACIAIwATABkABAAIAPf//P/u /+7/4f/f/9X/2P/J/8f/vf+8/7T/sP+t/6f/qP+f/6T/n/+k/5z/p/+d/6r/of+v/6v/uP+z/73/ uf/E/8H/zv/O/9X/1v/d/9//5P/f/+z/7//x//X/+v/7//3///8DAAcABgAIAA4ADQAOABIAFAAa ABcAHQAcACMAHgAmACQALQAlACkAJwAsACUAJgAjACUAGwAiABYAGwANABIABQAHAAEA/v/6//n/ 7P/u/+X/4//g/97/3//W/9b/0f/V/9L/0f/L/9H/0f/S/9H/3P/Y/93/3P/j/+D/4//d/+f/7P/t /+z/6v/w/+3/8v/v/+//7v/u//P/7f/q/+7/6v/s/+z/6v/s/+X/6f/p/+r/5//r/+n/5//r/+j/ 5//s/+//6P/q/+j/6v/p/+j/5f/k/9//4v/g/+D/2P/U/9r/1//V/8//0//M/9D/yf/L/8r/yv/G /8j/xf/M/8X/1//L/9j/0f/f/93/5v/h//H/6v/4//b/AQABAAUACQAPABAAFgAWABkAHgAfACYA IwApACMAKAAkACsAHQAlACMAJQAfAB4AFwAfABUAGwAUABcAFAAWAAsAEQAFAAgABAAHAPr//v/3 //r/8f/x/+j/5//k/+L/2P/d/87/zP/J/8P/wP+8/7T/sP+x/6T/q/+k/6j/of+r/57/qv+i/63/ ov+z/6//u/+2/8T/vv/Q/8//2f/S/+j/5P/w/+z/+//2/wEABQAFAA4ADQAQABEAFQAYABwAGwAg ABgAHgAbACIAHgAjACAAIAAhACIAHwAnACIAKAAkACYAIgAnACAAJgAfAB4AGgAeABgAGQASABQA CQAOAAYABgD7//r/7f/u/+j/6f/e/9z/1f/U/8r/zP/H/8L/x/++/7//uf+8/7j/u/+3/77/uP/B /7z/x//D/8v/x//Q/8v/1f/P/9n/1v/f/9//5v/k/+v/6f/q/+n/8f/q/+7/7P/y//H/7v/y//H/ 8P/v//D/9//x//b/9P/6//v//P/6//7///8CAAAA//8DAAIABAAEAAMABAAFAAEABAD+//7//P// //j/9f/y//b/7//q/+3/5v/q/+r/4//j/+X/3//p/+T/6P/o/+z/7P/v/+7/9v/2//b//v8EAPz/ BAABAAYABwAKAAkACAALAAYABQAEAAcAAgABAPv/+P/4//D/9P/u/+//8f/r/+r/5v/h/+P/3//f /93/4P/a/+L/4f/f/93/3v/Z/+H/3//k/+D/4v/a/9n/1v/f/9f/3P/X/9v/2//a/9n/1//W/9b/ 1P/V/9L/1//Y/9//2f/d/+D/6P/o//L/7P/+//v///8DAAkADgAWABQAHQAiACUAKwArADIALwA1 ADgAPAA5AEAAOABAADcAPQA4AD4AMQAyACkALgAjACsAIAAhABYAFgAQAA8ABwAHAP7//v/6//r/ 9P/y/+v/6P/n/+P/3//d/9v/1f/Q/8X/yf/F/77/uv+1/67/qv+g/6L/nv+c/5X/mv+R/5f/jf+c /5L/nf+S/6X/k/+o/53/tv+m/7n/t//I/8X/2P/U/+T/4f/v/+7//P8CAAoACQAXABcAHAAgACcA KQAoAC0AMQAxADEAMgA0ADgAMAA4ADMAOgA0ADYANgA1ACsAMAAtADAAKAAsACcAKgAgACcAHwAm ABYAFwAMABEABQAHAP3////z/+//6v/p/9z/2f/W/9L/yv/C/8L/uv+2/7H/s/+t/7D/pf+v/6r/ sv+r/7r/rf+//7H/wf+5/8n/v//T/9H/3P/Z/+P/4P/p/+r/9f/z//T/8v/8//n/AgD7/wQAAAAD AP7/BgABAAMABAD+/wIAAQAAAAIABgACAAMABgAGAAIABAAJAAsAAgAJAAYACwAGAAUAAwD///3/ AwD7//j/9v/0/+//8P/l/+b/4//k/97/2v/e/9j/3f/Z/9z/1v/e/97/5v/h/+v/5//5//H/+f/6 /wkABgAQAA4AGAAcACAAIgAmACgAKAAsAC0ALgAsADAAKgAsACcALAAsADEAJgAlABkAGAAOAA0A CQALAPv/+//4//v/9P/w//D/6//j/+T/4v/j/+H/2//Y/9j/0//O/8//yP/H/8T/xP/A/7r/t/+1 /7D/tP+v/7H/rf+t/6j/r/+p/7T/rP+8/7T/wv+7/87/xP/X/9H/5v/i//X/8v8HAAkAFQAXACgA JQA1ADUARgBMAE0AUgBUAFsAXwBnAF0AZABdAGMAWABkAFMAXgBTAFYATABPAEEARwA4ADoANQAy ACIAIgAdAB4AEgAUAAkABQD///7/8v/x/+L/3//X/9b/y//D/77/t/+s/6T/pf+Y/5b/jP+S/4P/ hv96/4L/dP98/3H/hP91/4r/ef+R/4P/m/+O/63/n/+9/7D/zf/J/+L/3v/0//T/AwAFABQAFQAj ACkALgAzADgAQABBAEcASABOAE0AVQBNAFQAUwBZAE0AUABIAE0ASgBOAEYATABCAEIARABEAD0A QQA7ADcALwAwACQAKgAgACAAFwAXAAgACAAAAP//8//x/+v/6f/e/9n/1v/S/9L/xv/C/7b/wv+3 /7n/r/+7/7L/wf+4/8X/vv/P/8b/2v/R/+X/4P/x/+n/+//0/wQAAgANAAsAEgASABQAHQAZABgA GwAdABkAGQAYAB4AFwAaABcAFgATAA8ADgAPAAwAEgAPAA0AEAALAA8ACwAIAAsACQANAAoABgAF AAoAAwAGAAMA/P////f/9P/z/+3/7v/o/+b/5P/m/+L/5//m/+D/3v/e/+H/3//l/+f/7v/x//j/ /P/+/wEACAAMABgAHAAdACIAMgAtADkANwA9AEEAQQBHAEAARgBBAEYAPwBGADcAOgAuADgAKAAt ABsAIgATABIADAALAP7/+//1//P/7P/r/+f/4//h/9j/3//X/9n/0f/R/8n/yv/A/8X/wf/B/7z/ wP+9/7f/tf+2/7P/tv+v/7T/q/+w/6z/tf+r/7f/sf+//7v/yv/F/9L/y//h/9z/8f/w//z//P8Q AA8AIwAoADMANwBAAEUATQBTAFUAYQBgAGwAYwBtAGQAdQBjAG0AYwBtAF4AZABXAGEATQBVAEYA TgBAAEEAPAA6ACoAKwAiACIAGwAbABMADwAHAAMAAAD6//L/8f/g/+X/2f/U/8f/yf+4/7P/sP+p /6n/n/+e/5j/mP+R/5T/jv+T/4j/l/+P/5f/jf+i/5j/rf+i/73/tP/N/8b/4f/a/+3/6/8BAPv/ CwAPAB8AIAAqADAANQA7AD4AQwBCAEsASgBRAFAAUwBPAFMATQBTAEsATwBIAFEAQQBHAEQASABD AEEAPgBFAEAAPwA0ADkAMAAwAC8ANAAiACYAIQAkABUAGAAMAAsABAAEAPr/+f/t/+v/5v/i/9z/ 2//V/9X/0v/M/87/zP/L/8X/1f/R/9f/0P/a/9D/2v/Y/+L/4//t/+r/8f/1//7//v8CAAIACgAI ABAAEAAMABAADwARAA8AEgANABAACgANAAwADgABAAgABwAHAAEA//8DAAMAAAAAAAMAAgACAAUA BAAJAAQABAAIAAkABQAHAAQACgADAAMAAAD8//z//f/7//3/+v/5//v//f/z//T/9v/6//b/+f/4 //r//v///wQABAAKAA4AGAAbAB4AIgApACsALQA2ADUAPQA5AD8APQBFADsAQgA9AEYAOAA7ADMA OQAqADIAIgAjABUAEgAJAA0AAgD///b/+f/r/+v/5//h/9z/2P/V/9X/z//L/8r/xv/I/8T/yP/D /8n/vv/G/77/wv+//8X/vv/D/7v/w/+//8X/vf/H/8f/yv/G/9f/0v/b/9j/6f/j//L/8P////3/ CwAMABwAIAArAC4APQA9AEUASwBXAFwAYQBvAG0AdwByAIAAegCEAHcAhgB5AIEAbgB5AG0AdgBj AG4AVQBZAE0ATgBDAEUANgA6AC0AMgAhACEAGAAYAAkADAAHAAQA+P/2//L/7//d/+T/2//V/9b/ zv/C/8D/vf+2/7H/sP+v/6X/rv+m/6z/ov+q/6P/rf+k/7X/rf+7/7X/yf/H/9n/0f/l/+b/9//0 /wcACQAWABYAJgAqADIAOgBBAEUASABRAE8AXQBaAF0AXQBlAFkAYwBWAFkAUgBbAFAAWQBJAEwA QQBLADcAQgA2ADkAMAA2ACcAMAAkACgAHAAgABYAGwAUABcACgAPAAQACgD+////9f/3/+3/8v/o /+X/4f/g/9n/2f/X/9X/0//Q/9D/yf/Q/8r/1f/K/9n/0f/a/9b/5f/h/+r/6v/x//X/AAD6/wcA BAAOAA8AEgASABYAGAAXABgAGAAYABYAGAAWABgAEQAVAA0AEgALABIABwAMAAMABAD//wEA/f8C APz//v/+//3//P//////AQD7//3//f8AAP7////5/wEA+P/+//j////9/wMA9//8//z//f/+//v/ ///7/wEABQAFAAgACAAKABAAFgAdACMAIQAkACsAMgAvAEAAOAA+AEEARQBHAEoATABQAEwAVQBN AFMASwBOAEIAQgA2ADkALQAqAB4AIwARABIABwAHAP//9//z/+3/6f/k/93/1//W/87/z//H/8n/ wv/I/7z/w/+4/8H/uv+//7z/wv+5/77/v//B/7//wv/C/8b/xv/P/8f/0v/Q/9//2v/j/97/5//q //f/9f8HAAMAEQASACMAJQA1ADUAPwBFAFAAVQBdAGMAZABxAGwAewBxAHwAeACCAHIAfgBwAHgA ZwB1AGUAbABZAGEASwBUAEEARwA0ADoAKAAwAB4AJgASABcACAALAP7/AAD1//X/6f/s/+X/4//b /9z/0f/W/8v/xv/F/8L/vv+7/73/tv+4/7P/uP+y/7T/rv+5/7X/uf+y/8H/uv/I/8T/0v/O/9z/ 2P/m/+H/8f/0/wMABAAJAA8AGAAdACcAJwArADAAMgA0ADsAQwBAAEgAPwBIAD4ARABAAEEAOAA/ ADcAPgAxADQALAAsACcALQAnACsAIgAlAB4AJAAcAB4AGAAWABUAGAASABoAEgAQAA4ADwAFAAYA BQAEAP3/AAD5//3/9v/2//D/8//v//L/7f/p/+r/5v/q/+f/5//k/+j/6//s/+3/8P/z//b/9//8 //z///8CAAcADAANAA0ACwAPAAoAFAANABgADAAUAA0ADgAIAAUAAQADAP3/+v/8//z/8//1//D/ 8v/q/+z/7v/u/+j/7v/w//L/7P/w//b/8v/1//P//f8AAP7/AgAGAAwAAQAIAA4AEAASABYAEAAT ABIAFwAXABkAFgAXACAAIgAiACcAKQAuAC4ANQA0ADoAOwA/AD0ARABHAFAASwBUAE4AWABWAFgA VABgAFcAYQBTAF0AUABaAEkAUAA+AEUANAA5ACgAKgAUABwACgAPAAAA///z//T/5P/i/+L/3P/T /87/zv/J/8X/wf/E/77/wf+7/8D/u/+9/7v/w/+8/8H/u//F/8H/xP++/8r/xf/K/8r/1f/P/9n/ 2v/l/+L/7P/q//f/+P8FAAMAEAAXACMAIwAtADYAPABDAEsAWABVAGMAZABwAGkAdwBuAHwAcQB+ AHQAggByAH4AcgB8AGYAcABhAGcATwBbAEcAUAA8AEQALwA0ACEAKAAXABwADAAJAAAAAQDy//b/ 5f/u/97/3f/X/9H/xP/G/8D/uv+2/7H/rv+q/6v/pf+m/6L/oP+Z/6P/l/+d/5f/pP+c/6v/of+x /6r/uP+0/8n/xv/Y/9T/5P/m//j/9v8MAAoAFQAZACwAMAA5AD0AQQBMAEsAVgBXAGAAWQBmAF4A agBdAGgAWgBpAFcAYgBUAF4ATABYAEYAUgA9AEkAOABBADAAOwAuADMAKAAqAB4AJAAXABoAEAAb AAgAEQAAAAUA9f/9//H/9f/n//D/4f/n/9r/1//Y/9j/1P/S/9H/z//T/87/zf/R/9T/0P/a/9b/ 4P/e/+b/4//q/+n/9v/z//7/9f8GAAQACgAGAA0AEgASABcAFQAWABIAFAAVABgAEgAVABIAEwAO AA8AEAARAAcADAAHAA0ABgAJAAUACwAFAAkABgAIAAoACgAGAAkABwAMAAcABwAJAAcADgAPAA0A EwAKABEADQAMAAgADAAJAAwACgAJAAkADwAMABIAEwASABwAHgAgACAAJQAiACgAKgAuADAANQA2 ADgAPQA8AEAAPwBGAEIASABFAEgAPwBHADwAQQA0ADcALQAwACMAKAAWABoACAANAAAA///2//L/ 6f/w/+L/3v/b/9f/2f/Y/9D/yf/M/8f/zf/L/8r/yf/L/8n/xP/H/8v/yP/M/8f/yv/N/8z/zP/P /8z/1v/P/9n/1//i/9z/5v/n//P/8P/2//j/BAAJABYAFgAiAB0ALQAyADsAQQBJAE8AUQBaAFsA XwBfAGoAYgBtAGYAbgBlAGwAYgBrAFwAaQBSAGIAUABUAEMASgA6AD8AMQAyACQAJwAdABsAEgAT AAoADAAAAAUA+//8//L/7//n/+T/3//d/9b/1f/N/8z/x//F/7v/wP+7/7n/tf+z/7X/sv+y/6z/ r/+s/7f/tP+6/7j/v//A/8j/y//V/9j/5f/l//T/8v8FAAcADwATABwAHwAuADUANAA9ADwARQBG AFQASABNAEwAXABQAF8AUgBbAFAAVQBMAFgASwBSAEIAUQBCAE8APABHADsARABDAEsAOABCADEA OwAuADkAJgAsACEAKQAfACQAFAAdABQAGQAJAA4ABQAKAPz////6//z/7//0//D/8v/w/+//7v/t /+r/7//u//L/6f/t//D/8v/y//X/+v/4//r///8BAAcAAAABAAUAAQABAAMAAwAIAP7/AwABAAUA +/8DAPv////6//f/9P/2/+//8//0//X/9v/0//j/9v/7//b////8////+/8DAAUABAAFAAkACgAK AA4ADwATAA8AEgAWABcAEQAWABYAFAAVABUAGAAeABsAHQAbAB8AHgAqACIAKQAlAC4AKQAyACwA MgA0ADgAOQA5ADoAPQA4ADwAPABCADgAPAA2ADwALQA4ACgAKwAbACEAGAAbAAkACwADAAQA+//4 //T/9f/o/+T/4P/e/9j/1v/R/9T/0P/L/9L/yf/M/8b/zv/J/8z/yf/P/8z/z//K/9D/0P/Q/9X/ 2f/U/9j/1f/f/9r/4v/i/+T/5v/v/+7/9//1//r//P8EAAkACgAMABQAGAAgACMAKAAwADIAOAA5 AEEAPwBFAEcATwBIAFAASgBSAEkATgBFAFAAQgBNAEQATgA3AEIAOQBAAC8ANQAjAC4AHQAgABUA HQALABQACQAMAAAABQD//wYA+//9//j/9//v//H/6v/r/+r/7P/j/+b/3P/f/97/3v/Z/9X/1P/W /9P/1//U/9H/0v/S/9f/1//U/9n/3v/d/+D/3P/p/+v/6v/w//r/AQD+/wQABgALAAwAEgASABoA GAAeABwAJQAiACgAJQAsACUAKwAkACoAJwAtACMAKgAdACYAJQAoAB0AJQAjACUAGgAiAB0AIQAa ACAAHAAiABwAHAAbACMAHgAjABgAJQAZABsAFwAgABgAGQAVABsAFQAYAA8AFwAMABcACQASAAYA BwAHAAgABgAGAAUABgAGAAgACQAMAAUABgAIAAkACAAFAAkACAAGAAgABAAJAAMABAAAAAMA+//+ //X/9P/u/+7/6v/t/+T/3f/i/9v/3//d/9n/1v/a/9j/2P/W/9X/1v/c/9z/2f/X/97/3//j/+T/ 6P/m/+r/6f/z//H/+v/4//z//P8CAAMAAgAMAAEACgAKAAoADgAQABYAGAAdAB4AJAArACcAKQAt AC4AMwA5ADUAPgA/AEcASgBLAEsATQBMAFIASQBUAEkAVABJAFAAQgBKADgAQwAzADsALAA0ACAA JgAXABkACQANAP//AgD6//v/7P/s/+D/4f/f/9//2P/Z/9f/0f/W/9X/0v/U/8//0P/Q/8r/z//I /8//0P/P/83/2P/Q/9X/1//W/9z/3//e/+H/3v/n/+n/8P/x//r/8v/8/wEABwAMAA4AGAAaACQA KgArADMAOAA6AEYARABJAEcATgBOAFkAUABfAFUAXwBWAGMAVABgAFUAXgBOAF8ATQBXAEYATgBC AEkAOgBDADcAPAAwADYAJwAuACAAJgAVAB4AEwAZAAkADwD+/wYA9//9/+//9//q/+//4//o/9n/ 3f/Y/9T/z//N/8j/yP/K/8f/xf+9/77/wv/E/8H/w//F/8f/yP/N/8f/0f/K/9n/1P/g/97/6P/k //D/7v/5//j/AAAEAAgABAANAA4AEwAWABgAHAAbACQAIQAkACYALQAkAC0AKwAvACsALgAtADUA KwA0AC4ANwA1ADcANAA+ADQAPAA1AD4ANgBAADYAQwAwADkANQA8ADAANgAqADIAKAAsACQAKQAb ACEAGQAYAA8AFQAOABIADAALAAMABQD+/wAA+f/+//f/9f/y//P/8//y//H/7f/r/+v/6v/k/+X/ 5v/j/+P/4f/Z/+H/3f/Y/9f/1P/Y/9P/z//O/8z/zv/M/9L/zf/S/83/2P/V/9n/1//e/93/4v/i /+v/6f/u//L/+P/5//7/AQAHAAgADAANABYAFQAXAB0AGwAkACAAJQAmAC0AKAAvADEANQAxADUA MwA7ADcAPQA2AEAANgBCADsAQwA7AEIAQQBGAD0AQgA+AEcAOwBCADgAQgAyADcALgA2ACUAKwAf ACUAGQAZAAwAEAACAAUA+v/4//X/7f/q/+f/3v/a/9n/1//T/83/z//P/8n/yv/L/8b/yP/I/83/ zf/G/8X/y//L/8z/zP/T/9H/1f/Y/9v/3P/f/+T/5P/k/+j/5//y//H/9//4//z/+v8EAAYACwAQ ABUAGgAcACUAHwAlACwALgAvADUANwA/ADoAQwA+AEYAPQBHAEIATABFAE4AQQBOAEEASwA8AEkA NgBDADgAPwAxADYAKAAyACQAKQAkACkAHgAgABkAGgARABAACAAJAAQAAgADAAMA9//1//H/8v/q /+r/5f/i/9//2//a/9r/1P/R/8//zf/I/8P/y//D/8P/w//E/73/yP+7/8b/wv/F/8j/zv/P/9D/ 0f/X/9b/3//h/+T/6P/t//H/+f/8//r/AAAKAA8AEAATABQAHAAZAB8AIQAoACcAKwArAC4ALAA5 ADUAPwA1ADsAOwA9ADgAQgA8AEQAPwBDADwARgA8AEgAOABEADkAPwA4AEAANgA4ADYAOgArADQA JQAqABoAHQAVAB0ADAAQAAYABQABAAUAAQD8//r/+f/z//b/6//x/+//7//q/+n/6v/k/+r/5//m /+T/5f/j/+f/5//m/+H/5f/i/9z/3P/d/93/2f/Y/+D/2f/f/9v/5P/e/+H/3P/i/+L/5//i/+z/ 6//v/+7/9f/0//j//P8BAAEAAwAIAAsAEwAOABkAGQAfAB8AJAAkACoAJwAuAC4AMwAyADQANAA7 ADwAQQA8AEIAOgA+AEAARwBBAEYAQABIAEIASgBBAE4AQQBOAEQASABCAEcAPQBHADkARQA0AD4A LwA1ACoAMgAjACYAGgAfABIAFgAGAAgA+v/4//L/8f/o/+f/3v/Z/9P/0f/J/8b/wP/A/77/vP+2 /7j/tv+1/7P/sv+y/7b/uP+w/7n/s/+1/7X/vf+6/8P/vv/F/8T/z//I/9P/0f/Z/93/5f/h/+7/ 7f/2//b/AgABAA8AEAAYABoAJQAkACoAMQA2ADsAPQBDAEYATABMAFEATwBVAE8AWwBSAFsAUQBZ AFIAXABMAFYASwBSAEYAUABBAEUAOAA+ADMAOgAuADIAJAArAB8AJgATABsADgARAAYACAD+/wAA 9f/0//H/8//s/+f/4//h/+D/2//T/9P/0P/O/8n/w//A/8D/wP+3/7n/tP+3/7T/sf+2/7j/s/+4 /7f/uP+z/8H/vP/G/8P/yv/J/87/zv/U/9P/3v/d/+b/6P/t/+z/+f/1//r///8AAAUADAANABEA FQATABUAHAAdACIAJQAqADAALwA4ADMAOwA1AEEAPQBIAEIARgBFAEsARgBMAEYATQBFAFEAQgBO AEMATQBAAEYAOgBDADYAPAAxADQAKwAuACQAJwAbACAAFAAbAAsAEAAGAAYAAAD+//f/9f/v//H/ 5v/s/+D/4P/e/9X/1f/T/9H/0P/M/8r/yv/F/8n/wf/C/7//v/+7/8P/uv++/7r/w/+//8H/vv/B /77/xP/C/87/yv/T/83/1v/X/9//3v/o/+n/7//x//j/+v/+/wQABwAQABMAFQAcABwAJAAoAC0A MQAzADYAOAA+ADgARABAAEcAQABEAEYATgBDAEsAQgBOAEUASgBDAEsAPwBGAD4ARwA4AEUANwBA ADQAOwAxADgAKAAuACEAKAAaACEAFAAWAAsADgACAAQA+f/6//L/6//i/+H/3P/V/9H/0P/N/8P/ xf+//8P/vv+//7j/vP+0/7n/sP+6/7X/uv+2/7//u/++/7f/w//D/8T/xf/J/8j/z//L/9j/1P/f /9j/4//h/+n/5P/t/+r/9f/y//z//v8EAAAADAAMABIAFQAaABsAHAAcACcAJAAsAC0ALgAzADQA NgA3ADsAOQA7AD8AQAA9AD8APABAADsAQQA9AEAAOAA8ADkAOwAxADMANQA4AC4AMwAuADEAKwAs ACAAJgAhACIAIAAeABYAFwATABIACgAKAAYAAwD+//z/9P/x/+v/6f/n/+L/3//W/9n/2P/W/8r/ zf/F/8f/v//E/7//wf+9/8H/uf/D/7n/xv/C/8n/wv/Q/8f/0P/M/9z/1P/g/93/6f/m/+//8f/5 //f//f/+/wkACQAOAAsAFgAXAB8AHAAmACkAKgAvADAANAA1ADoAOwBBAEIARABDAEgARgBKAE0A TQBKAFAASwBQAEgATgBIAE0AQgBFAD8AQAA4ADkAMgAwACYAJwAdACIAEgATAAkACAD+//3/+f/4 /+3/7P/p/+H/2f/U/9r/0//Q/8j/yf/E/8P/wP/B/7z/u/+1/73/sP+7/7T/uf+y/7f/rf+5/7D/ t/+z/7z/tv++/7j/yP/A/87/xv/W/9T/3v/X/+b/4f/x/+r/+//1/wMABQALABIAGQAaACYAKQAr AC4ANAA3ADsAQwBAAEoARQBJAEkAUQBMAFQASwBRAEUASwBGAEQAPABEADsAPgA6ADYAMwA3ACsA LQAqAC8AHgAdABsAGwASABMADgANAAQAAwD7//3/8v/s/+v/6P/k/9z/1//Q/9D/xP/J/8H/wv+3 /77/sP+2/67/tP+s/7H/qv+x/6L/tf+n/7j/rP+9/7D/w/+4/8T/vf/N/8T/0f/M/+P/2P/s/+T/ +P/z//3//f8IAAkADQAQABoAGQAgAB0AKAAoADAAMgBAAEEAQQBFAEAASgBRAFMAVABaAFsAYgBi AG0AZQBqAGoAbwBoAHIAZABrAF4AZQBfAGMAUwBYAE8AVQBPAE0AQwBDADkANAAxAC4AJAAlACMA IQAeABsAFgASABQACgAWAA8AFgAPABIAEAASAAsADAAEAAYA/v////f/+v/x//H/7v/u/+v/7//o /+v/5f/v/+j/6f/e/+X/3f/o/+P/6P/l/+7/6f/t/+f/6//m//P/7P/5//P//P/2/wIA//8IAAgA EwAMABkAFAAaACEAIgAiACYAKgAvACwAMQAzADcAPAA4AEAAPQBCAD0APwBDAEIAQwBHAEgASQBI AEgATQBOAE4AUABOAE8ASwBOAEwATgBKAE8AQgBCAD8AQAA2ADoAMwAyACYAKwAjACUAGgAaAA8A EgAIAAQAAgD3//b/8f/y/+r/6f/g/+P/2f/c/9X/0v/M/87/xf/K/73/xP+6/8H/uf/A/7H/vf+0 /73/sf++/7P/wP+4/8T/vv/K/7//0P/F/9f/x//b/9X/5v/f//P/5//9//D/BQD8/w8ADAAeABgA JAAgADEAMgA6AD0APgBBAEwATgBWAFoAVQBYAF4AYwBhAGQAWwBdAFgAWwBTAFUAUABPAEcASQBD AEkAPAA5ADIAMwAzAC4ALQAvACYAIgAfABkAIQAbABQAEAAVABUAFQAQABIADAAOAAoABQAEAAAA +//7//n//P/1//b/7//x/+z/8v/p//b/8f/5//L/+//0/wEA+P/5//X//v/4//7/AAAIAAcADQAP AA8ADgAUABMAFAAWABUAEQAXABcAGwAXABoAGAAYABkAHAAaABYAFwAZAB4AGAAZACIAGwAiAB8A JQAiACsAJAAvAC4AMQAxADcAOAA4ADgAOAA0ADQANQA3ADwANQA0ADcAPQA3ADQAOQA5ADQANQAz ADIAMAAzAC0AMAAsADAALgAtACkAKQAoACYAKAAiACQAIQAgACIAHQAaAB0AGgAbABgADwANAA0A CQABAAEA/f/2//X/8f/s/+n/5P/g/97/3v/X/9D/0//K/8//yP/Q/8T/yv/C/8z/wf/L/8n/1f/L /9j/zf/g/9P/5f/g/+v/6//x/+//BQD9/wUAAgAPAAoAFQAPABwAIAAjACEAKAAvADIANgA9ADcA PQBCAEgATABLAE8AUwBYAFYAXQBZAGAAWgBeAFwAYQBXAFwAVwBbAFEATQBIAE0AQwA/ADoAPwAu AC4AIgAkABoAEwARAAgAAwD8//f/8f/p/+P/5f/c/9r/0P/R/8L/zP/A/8j/vP+9/7L/v/+0/73/ s/+9/7T/vv+0/8H/uv/B/7v/yP/C/8b/xf/N/8f/0v/M/9v/0//i/93/6v/n//f/7v8EAP3/DAAH ABMAFQAiACYALgAvADkANgBAAEEAQwBFAE8AVQBSAFoAVABbAFUAVwBUAFcASgBQAEoATAA/AEQA OQA8AC8AMQAsAC0AJQAkAB4AHQAYABUAFQAWAAoADwAKAAoACQAIAAUABQAAAAAA/f/2//n/+f/3 //f/8f/r//H/7f/o/+r/6//l/+b/4f/k/9z/4f/e/9//3v/h/93/7f/h/+n/3v/w/+n/9P/r//r/ 8/////v/BAABAAcABgALAAUABwADAAsADAAOAAcADQAMAAsACQALAAgACgAJAAsABQAHAAcACwAI AAUACAAMAAoABwAJAAkACQAOAAgAEQASABMAFAAWABcAGQAaABkAHAAdABoAIQAbABkAGgAaABkA HAAaABcAEgAWABUAGQAXABMAFAASABIAEwAXABkAFQAUABAAEgASABIAFgAVABEAEQASABEADwAM AAsACgALAAIAAAADAPn/+P/3/+//6//l/+H/3f/b/9j/zP/T/9L/yP/G/8P/vf/A/7f/v/+4/77/ tv/B/7r/w//E/9D/yP/T/8r/3v/c/+T/3v/s/+j/9//y/////P8EAAQAEwASABQAEgAfABoAJAAi ACsALAA8ADcAQgBBAEkARwBMAE0AWABaAFgAWwBeAGEAYABkAGIAZQBfAGUAXQBgAFwAXwBRAFQA SQBQAEEARwA1ADcAKQAqAB4AGQAPAA8ABwAAAPn/9P/s/+f/6P/i/9//1f/X/9H/0f/P/9D/w//H /8P/x/+8/8H/uP++/7n/v/+6/8P/uP/A/7f/vP+2/8D/uP/F/77/yv/C/87/yf/S/87/2//T/+D/ 3//p/+T/9P/s////+P8GAAUAEgAUABYAHwAjACQAKgAvADUANwA4ADsAOwBDAD4ARQA/AEUAPgBE AD8APgA8AD0ANgA5ADMANgAtADQAKAAtACMAKQAjACMAIQAiAB0AHAAaAB0AGQAWABUAEwANABEA EAAOAAUAAgABAAEA9//z//H/6P/o/+X/5P/f/9j/1P/Y/9H/0f/F/8z/wf/I/73/wv++/8T/uv/D /77/wP+4/8j/u//G/8H/zv/E/8//yP/W/8f/2f/S/9f/0P/Y/9T/4P/Y/9v/1v/k/93/5f/g/+r/ 4P/s/+T/8v/v//f/9/8AAP//CAAGAA4ACwAUAA8AHwAbACoAKQAvAC4ANgA6ADUAPAA6AD8APgBB AD0AQAA8AD4AOQA5ADUANAAyADEALwAvACoAKAAdACgAGwAeABIAFgATAA8ADgAMAAcAAwADAP// +//2//b/6f/o/+H/5P/c/9n/0P/T/8b/x/+//8D/tf+2/6v/rf+m/6n/m/+k/5b/n/+W/6L/lf+h /5T/qv+b/6n/nv+0/6j/vP+3/8b/vv/Q/8j/3//R/+z/3P/0/+n/AgD8/w4ABgASABMAHgAcACMA JgAtADAANAAyADwAPgBDADsARwBJAE8AUABPAFQAVQBXAFYAWgBUAFoAUwBWAE4AVQBNAFAARABI AEAARAA1ADYALQAoAB4AHgAMAAsA///6//X/8//j/9//2//U/8z/xv/C/7f/uP+t/7b/rP+u/5// sP+c/6X/lP+m/5j/pP+d/6n/n/+o/6D/rv+i/63/o/+0/6z/uP+x/7//tP/C/7r/yf/A/9D/w//Z /8//3//a/+n/5P/v/+z/+v/3/wUAAwAQAA4AFwAXAB8AIAAoACkANAAwADIANQA4ADYANgAyADcA NQAxADIANQAzACwAMwApACoAIgAlACcAJQAcAB0AGgAYABMAFQAPABAACgAHAAYABwAEAP7//v/7 //3/+P/8//j/9f/y//D/6v/q/+L/6P/g/+D/1//c/9b/1f/N/9T/zf/L/8T/xv/A/8T/uf/E/7// wf+3/8H/vf/G/7v/y/+//83/wv/U/8v/3P/T/97/1//k/93/7f/n/+r/5//x/+v/9P/v/+//7f/5 //f////8/wUA/P8BAP3/BQABAA4ACQAMAAgAFAARAB0AFwAlAB8AJwAkACwALQAsAC8ANgA5ADYA OgA4AD8AOAA6ADcAOQA4ADMANgA0ADEAMQAwACsAJwAoACEAIAAdABwAGgAUABEAEQAQAAoABwAC AP///v/5//f/9f/t/+r/6//k/9//4v/V/9b/0P/P/8b/yf/A/7//u/+2/7H/s/+p/67/ov+p/5v/ pv+W/6j/m/+s/5n/q/+a/7L/p/+1/6r/v/+x/8f/v//Q/8n/1f/V/+z/4v/y/+z//v/3/wkABgAM AAoAFwAUAB4AHAAiACMAKgAuACwALwA2ADgANAA7ADwAPQA+AD0AQgBGAEMARQBHAEgARwBHAEIA SQBDAEIAPgBBADkAOAAuADAAHgAkABwAGQANAAkAAAACAPb/8P/q/+D/3v/R/8//zP/D/7z/vP+y /7f/q/+t/6P/q/+f/6z/ov+o/6D/qv+Z/6z/mf+v/6L/sv+o/7T/q/+0/6r/vv+t/77/tP/H/7v/ yP/C/9H/xv/V/8//3P/a/+T/4v/q/+j/8v/y//z/9/8DAAUAEAAOABcAGAAgABwAIwAjACoAKwAu AC4ALwAuADIALQAxADEALAAuACgALAAlACYAHwAhAB8AIAAYABQAFAAQABEAEgAOAAwACAAHAAcA BwAIAPz/CAAAAAMA/v/+//z//v/6//j/+P/1//T/8v/t/+n/6v/r/+P/3v/b/+H/1v/Z/9H/1//Q /9H/yP/O/8T/zf/F/8z/xv/L/7//zf/D/9D/xP/R/8n/0v/I/9X/z//W/9P/2P/O/93/1f/e/9f/ 3v/U/+L/2f/g/9n/4v/b/+j/3v/k/+H/6P/i/+//4f/3/+z/+f/z//3/+/8HAAYADQAKABQAFAAZ ABkAHgAiACMAJgApACoAKQApAC8AMwAtADMAMgA2ADIAMQAwADAAKQAsACgALAAkACEAHwAdAB8A FwAXABgADwARAA8ADgAIAAMA///6//f/9f/y/+7/7f/r/+n/4P/f/9n/1//R/9D/xf/I/7//vP+2 /7f/sv+u/6T/q/+j/6r/nv+m/6D/pP+d/6//nv+t/6H/sv+q/7r/sf/F/7v/y//F/9j/zf/h/9v/ 8P/o//X/8P/9//z/BwAEABAADwAWABMAGgAYACIAIwAmACQAJwArADEAMgAxADIANQA3ADkAOAAz ADgAOAA5ADsAPAA0ADIAMgAvADAALQApACgAHAAdAB4AGAARAA4ABgADAAAA9//z/+//4//i/93/ 2P/Z/8z/zf/C/8f/vf/K/7z/wf+x/8P/vv+7/7T/xv+9/8n/uv/I/73/zP/H/8//zf/V/8//2P/W /97/2v/h/9z/4v/g/+r/5v/p/+b/8v/0//X/9v/+//f/AgACAAsACQALAA8AFwAbABwAHgAiACMA IgAlACoALQAwADIAMQA4AC4AMgAxADgALgAxAC4AMAAlACsAJAApACEAJAAgAB8AGgAZABMAEgAO ABEAFwAXABoAGAAXABUADAALAAoACgALAAUACgAHAAYABQAIAAEA/v/8//z/+P/3//D/9P/x/+z/ 5P/m/+T/4f/e/+L/1//V/87/0v/O/9D/yP/N/8j/yv/I/8r/xP/K/8L/0//O/9L/xf/W/83/0v/O /9j/0P/X/8//2f/a/93/2v/i/9z/5P/d/+r/4//p/+b/8P/s//T/7f/+//T/AwD5/w0ACQAQAA4A GQAVACAAHgAsACoALAAuADAANAA5ADwAPQBBADsAPgBBAEQAPgBCAEAAQQA9AD4ANAA5ADAANAAt AC8AHwAgAB4AHgAYABMAFAAIAAMAAQD///z/9//z//b/7v/o/+P/2//c/9r/1f/V/8z/0v/K/8n/ wf/D/7f/u/+z/7j/q/+w/6L/qf+j/6r/o/+q/53/q/+k/7H/oP+y/6n/uP+s/8H/t//J/8H/0v/N /93/2P/n/+L/8//v/wEA/v8JAAoAEwAVABsAHwAmACQALAAoACwALgAxADYANgA9ADwAPgA+AEQA PgBEAD0ARAA+AD4ARABJAEIASABBAEcAPgA/ADwAPAA3ADoAMwA0ACoALgAlACcAFgAfABMAFAAD AAgA+f/6/+7/7v/l/+T/3v/b/9T/z//L/8z/x//E/8P/vv/B/8H/vv+7/73/vP/B/7f/vP+9/8P/ u//K/7z/xP+9/8f/wf/L/8j/yf/E/9D/y//U/9D/2f/U/+H/3f/l/+P/7f/m//H/9P/8//7/BAAH AA8ADAAWABwAHwAjACUAKAAuAC8ANQA6ADcAPQA3AEIAOgA/ADoAQAA8AEYAOgBBADUAOgA0ADkA LgA2ACgAKgAmACoAHgAfABwAHgAXABoAEgASABEADQAQAAwACgAMAAUACwACAAIA/v////n/9v/z //T/7//r/+b/4//j/+P/3//X/9v/0v/P/8//z//I/8n/xf/N/8X/yv/E/8n/xP/O/8H/1P/J/9f/ y//U/9X/2f/X/93/2//h/+D/6f/j/+v/7P/u/+3/9f/0//v/+P/7//v///8DAP//AgAGAAoADwAN ABEAFQAXABkAGgAdACIAJgArAC8AMQAyADUAOAA4AD0APABEAEAARgBFAEYAQQBJAD8ARAA8AEQA PwBDADkAPAAyADcAMgA0AC4AKgAlACkAIAAbABIAFQARABAADAAOAAUABAD+//3/+//4//P/7//x //D/6//r/+n/6//d/9r/1v/T/9P/yv/N/8X/xP+7/8H/wP+7/7f/wf++/7//uv/F/7v/xP/C/9D/ yv/W/9j/5v/e/+v/8v/7//j/BQAFAAoADwAaABsAHgAhACkALQAxADgAPAA6ADkAQABAAEUASABK AEcASwBJAFIASgBPAEkATwBHAFIARwBSAEYATQBDAEoAQQBLAEMAQwA4ADsANgA7AC4ALgAnACgA GgAbAAsAEQAEAAQA+v/3/+v/6f/k/+H/2//U/9H/y//H/8T/xf+//77/tv++/7T/vv+1/73/uf+8 /7j/vv+7/8L/uf/J/8P/yv/K/9H/zf/U/8//3P/Z/97/3//p/+X/6//n//P/7v/4//j/AQAAAAIA BAAPABMAHAAdACYAIwAoAC0AMAAyADUAOQA7AEEAOwBIAEEASwBDAEsAQgBRAEIASABDAEoAQABA ADgAQQAwADwALwA2ACMAKgAdACIAGAAaABcAFQAPABAACgAOAAMABAABAAMA/f/7//3/+P/1//f/ 8v/v/+v/6//p/+j/4v/j/+L/4v/e/9v/3v/X/9r/1P/W/9T/1v/T/9T/0//T/9X/2f/X/9n/2P/i /9r/5P/i/+v/6v/x/+3/9//w//f/9v/+/wAAAgAGAAoABgAFAAkABwAOAA0ADQAOABMADQAUABEA EAAPABMAFAAaABcAFgAaABsAFgAcABoAIgAcACEAIAAmACIAJwAjACwAJAAtACkAMgAuADMAMAA2 ACkAMgArACkAJwApACUAJwAbACAAGwAgABMAFAAVABQACwAPAAoADgAIAAoAAQAHAAAA//8BAAEA +v////z//v/3//r/9//4/+//8P/m/+j/5P/g/9z/3P/b/9b/1f/Q/8v/yf/N/8X/xP/B/8X/v//K /8H/x//D/8j/wv/R/87/0f/T/93/3v/k/+L/8v/t//f/+P8DAAYACQALAA8AGwAaAB4AIwAmACgA KwAuADgAMQA9ADcAQQA9AEYAQQBFAEEARwBBAEwAQwBOAEkAUgBIAE8ASABVAEUATABCAEwAPABF ADIAPQArADIAJwAoABoAHQALABEA/v8KAPv/+v/o/+n/4P/c/9n/0//P/8n/x//H/8f/w//G/7// xv++/8L/u//D/8H/xf/A/8v/yP/M/8z/0//S/9n/1P/g/9z/4//l/+f/4//t/+7/8v/0//f/+v/9 //7/AQAGAAoADwASABUAGgAhACIAIwAnACwALAAxAC0ANQAwAD4AOABAADkAQwA2AD4ANwBAADQA PAAxADcALAA0ACcAKwAlACUAHgAkABYAGQAWABgAEQAQAAgADAANAA8ADAAIAA0ABwAOAAoACwAN AAkADQAKAAwACAAKAAcACwAHAAoACgAQAAYADAAEAAoABgAIAAIABQABAAgAAQADAP3/AAD//wIA //8CAAMAAgAFAAQAAQAJAAQABQAGAAoABgAKAAcADwAHAAoABwAKAAYABwAIAAgAAgAEAP//AwD+ /wAAAQD9//n//v/5/wIAAQABAAAAAAAEAAcAAwAIAAoACgASABIAEQAVABQAGwAdACMAIAAoACgA LQAlADAAKgAzACsAMQAsADEALgAyADAAMQAsAC0AKwAtACcAJwAgACoAJQAqACEAIwAeAB8AGQAf ABYAGQAPABYADwAOAAkADQAEAAcAAAABAPr//P/y//X/6v/s/+L/5f/a/9f/2f/V/9T/1P/P/8// y//K/8j/xv/H/8L/yv/H/8b/x//N/8z/1v/T/9v/3f/f/+T/6//s/+//9//8//7/AAAFAAkADQAT ABQAGAAfACMAJgAlADEALgAzADQANgAxADcAOQA+ADsAPwA/AEgAQwBHAEYASwBDAE0ASQBMAEEA TgA/AEwAPwBIADYARAAwADsAMQA3ACUAMAAcACYAEQAXAAQADQD6//7/8v/2/+b/5//h/+L/3P/X /9X/1v/O/9L/0P/O/9H/0v/O/8//z//R/9T/1f/R/9j/2P/c/9X/2f/a/93/4P/g/+L/4f/f/+P/ 6f/o/+r/7P/x//P/9P/2//3/AAADAAYADgATABQAFgAbACEAKAAqAC8AMgAwADoANgBBADgARQA6 AEUAPQBNAD8ATAA7AEYAOQBGAC4APgAwADkAKwAxACcAMQAdACQAGgAoABcAIQAQAB8ADwAVAA4A HAAOABkADwAYABEAEwAQABMADgAVAAsAFQAIAA0ACgAJAAcACwADAAUA+v8BAPr/AQD1//n/9P/1 /+7/9v/v//P/7v/z//D/9f/r/+z/9P/x//L/8v/x//D/7f/w//P/9//0//T/8//5//T/+P/2//f/ 7v/0//X/9f/w//H/8v/z//X/9//4//z/+P/7//3//f8CAAkACQAPAA8AEwAVAB4AFgAeACMAJwAm ACoALgA3ADQAPQA3AEEAOQBDAD0ARAA7AEIAOgBEADgAPgA3ADsAMQA8ADAANQArADIAKAAxACUA KQAiACkAHQAjABsAIwAaABwAGQAeABEAFgANABMABgAPAAUACQD6//v/9f/8/+3/7P/h/+b/1//a /9H/0v/M/8j/yv/C/8L/vv/E/73/wP+8/7//vf/D/8H/zv/E/9D/0P/b/9f/4//h/+v/7v/1//T/ /f8AAAUACQAOAA8AGwAhACIAKwAkACsALQA0ADEAOgA1ADwAQABHAEcASwBHAEwATQBZAFUAXgBX AF8AVQBqAFoAaQBXAGgAWQBqAFAAYgBTAGEASgBWAEMAUQA6AEkAMgBCACMAMQAdACMADwAbAAkA DgD//wQA/v8AAPH/+P/u//T/7f/y/+3/8P/s/+7/6v/s/+f/6//m/+r/5P/p/+T/6v/j/+b/3v/p /+P/6P/i/+j/3P/h/+H/4//g/+T/5P/o/+n/7f/s//D/6//1//f/+v/7////BQAMAA0AFwAUABsA HwAiACYALAAmADQAMAAyAC4AOQAvADUAKgA0ACwANgArADEAJgAyACMALQAgACsAJQApACEAKAAe ACkAHwArACMAKQAmAC0AJgAxACYAMgApACwAKQAyACMALwAkACsAHgApABwAIwAUAB0AEAAVAAUA CgAAAAIA/f////f/+v/w/+//7f/t//H/7//v/+z/6P/r/+7/6f/p/+z/6//o/+j/6P/n/+j/6P/s /+v/6f/l/+n/5f/m/+j/5f/h/+P/3//l/+D/4P/g/+X/4v/o/+j/6f/u//P/+P/1/wAAAgAJAA0A EAAXAB4AHgAnACwAKAAyADIAPAA8AEMAQABHAEEASgBDAEgAPgBKAD8ASAA8AEYAPAA8ADkAPwAz ADoAMAA1AC8ANAAqADAAJAArACEAJwAcACUAHgAnABwAJAAYAB0ADQAWAAUADAAFAAcA+/8DAPP/ 8v/t/+7/5P/j/97/3//Z/9b/1v/T/8//zP/O/8v/xf/E/8n/xP/P/8z/2P/U/9z/1f/i/+H/7P/s //P/9f/1//v/AgAJAA8AFgAWABcAGAAhAB0AJAAhACkAIwAwACkALwAvADMALwA2ADEAPAA1AEQA PgBHAEYATABCAFIASgBUAFIAXQBPAFwAUQBbAEsAVgBLAFgASABUAEAATQA8AEMAMwA8ACsANwAl AC4AIQAlABgAHQATABoADgARAAoADAAFAAoAAAAEAAAAAwDx//f/9P/6//T/+f/w//b/8//1//L/ 9//s//D/7f/r/+j/6P/k/+j/3v/h/97/4P/Z/97/3f/g/9n/3f/i/+T/5f/k/+n/7v/z//b//P// /wMABgALABEAFAAaAB8AIQAiAC0AKAAtACkANAAuADcAKgA2ADMAPAAvADwALQA5ACwANwArADgA LgA0ADEAOQAwADcAMQA7ADoAOAA4AEAAOABCADgAPwA4ADsANwBAADUAOwAzAD8AKwAzACgAKgAY ACMAFAAYAAYACgD7/wAA9P/x/+v/6v/l/+P/2f/a/9f/1f/U/83/zf/J/9H/zf/L/8n/y//I/87/ zf/Q/9H/1P/W/97/3v/c/97/3P/f/+H/4f/k/+L/4P/n/+r/7v/y/+r/9P/4/wEABgAMAAwAFgAV ACIAJwA1ADgAOQBBAEEASQBTAF0AWABkAGMAbABnAHIAaQB5AG0AeQBtAHsAZwB1AGQAcABfAGgA WQBmAFEAVwBNAFYAQQBIADwAQAAwAD8ALgAwACUAKQAkACsAHwAcABkAGwASABcACgAKAAQAAgD5 //n/8P/x/+r/6v/b/93/2v/W/8r/z//I/8j/wf+9/73/vf+8/7b/vf+5/73/v//F/8T/z//J/9f/ 1P/f/+H/7v/s//H/8//8//7/AwAFAA4AFAAVAB8AGQAgABwAJQAbACsAIQAsACYAMQAlADQAKgA2 ADEAOAAxADwAMwBAAD0ARgBBAEcAQQBKAD4ASwBHAFUASQBSAEUAUQBHAE4AQQBQADwARgAyADwA LgAyACkAMQAeACkAFwAcAA8AGAAJABIA/v8EAAMAAwD8//3/9/////X/+P/4//n/9P/3//f/9f/z //T/9v/3//P/8//y//D/6P/s/+b/5v/e/+H/4P/b/9n/2f/W/9j/0//R/9P/1f/W/9H/2v/V/+H/ 2//m/+L/7P/m//T/8P/3//v/AgAEAA8ADAAVABMAGgAcACQAJQAlACwAKQAtACMALwAqADAAJgAu ACYALAArADIAKQAyAC4AMQAvADUAKgA4ADIAOAA2ADkAPQA8ADsAQAA8AEYAOgBAADgAQwA1AD4A MgA6ACkAMwAlACcAHAAfAA0AEgABAAkA/f/+//H/8v/p/+b/4v/l/9r/2//U/9X/0P/S/9b/0P/V /9P/zf/K/9P/0//W/9j/1f/T/9f/0//V/9n/1v/Y/9b/2//Y/9n/2f/b/97/4f/h/+b/5v/m/+3/ 8f/z//b/+/8BAAUACAATABQAGgAiACcALgAyADwAPABBAEYATwBLAFYAUQBaAFEAWABRAFgATwBW AEYAUQBKAFAAPgBJADcAQQA2ADgAKQAyACQAJgAfACEAGQAdABUAFAAUABQAEwAQAAkADAAEAAkA /f8BAPb/+f/y//j/7//t/+X/6P/i/+H/2f/a/8//0P/L/8v/wv/B/73/vP+9/7z/wP+8/8P/uf/D /8H/zP/L/9j/1f/a/9n/5v/j/+7/7f/4//r/AQADAAsACQANABQAFQAZABUAHgAcAB8AHgAkABwA JgAfACIAHwAoACIAKQAqACoALQArADEANAAyADwAMgA8ADwAPgA8AEEAPQBDAEAAQwA/AEAAOQBA ADUAPQAvADYALgAyACQAKgAaAB0AFQAXAAsADgABAAQA/P/9//X/8//1//H/8f/v//P/7f/w/+v/ 7//o//L/8f/x//T/+v/2//P/9P/2//b/8v/x//P/8f/q/+r/5//p/+T/4P/m/+T/4v/i/+H/4P/d /9r/4P/g/+P/4//p/+r/7v/s//f//f8CAAEABwANABEAGQAeACIAJAAoACYAMgAuADgAMAA5ADAA NAAzAD0AMQA6ADIAOQA1ADcANwA8ADIANwA2ADsAMwA9ADUAPgA1AEAANwBAADcAPgA4AEYAPABG ADoAQwA7AEIANQA7ACYAMgAkACoAFQAcAAoAEQD+/wQA9f/5/+n/6f/k/9z/1P/W/9P/zv/J/8j/ xv/G/8P/vv/E/8P/xP/A/8b/wv/D/8X/yv/N/83/zf/T/9L/1v/Q/9T/0f/V/9H/0//W/9P/1P/Z /9n/3v/d/+P/4v/o/+T/8v/u//f/+f8GAAwADgATAB4AHwArADMANgBCAD4ASwBFAE8ASQBWAFEA YABOAF0ATgBiAEoAVABHAFMARwBMADkARQAvAEEALwA3AB0AKQAaACMAFgAZABAAFgAPABQAEAAR AAUACgAGAAkAAwAHAP3//v/2//r/9f/z/+j/5v/l/+T/1f/Z/9P/0v/H/8b/vv/A/7f/tv+z/7P/ r/+w/7H/q/+0/7L/vf+5/7v/wP/J/8X/0f/J/93/2v/n/+X/9v/u//z/+P8BAAQABgAMAAwAEQAR ABQAGAAdABoAHAAXACQAGwAfACIAJgAiACcAKAArACoALwAyADgANwA8AD0APwBAAEQARABNAEEA TQBHAE0AQwBLAD4ASwA2AEEAMQA5ACMAKgAaACIACgAVAAMADgD4/wIA8P/y/+r/6f/j/+L/3v/d /93/2v/X/9L/3P/f/93/2//Z/9b/3P/a/+D/3//e/97/3f/h/9j/3//d/9r/2f/W/9f/1//T/9D/ 0f/T/9H/zf/W/9f/2v/Z/+D/3v/h/+H/6f/s//L/9v/4/wMABwAPABAAGQAXABwAHwAtACQALQAq AC4AJwAzACYALwAjACsAJAArACAAIwAbACEAGAAZABcAHAAOABYADAAWABAAEgARABwAFAAXABcA GgAWABkAHAAhABoAIQAfACAAGAAdABgAHwATABsAEQATAAkACQACAAIA+P/1/+//7//s/+f/6P/g /9v/2P/h/9v/2//W/9r/0//X/9f/2P/a/9j/3P/b/9//3P/f/9v/2v/Z/9f/1//Y/9b/0v/O/9L/ y//M/8n/xP/K/8n/x//G/8X/x//K/8f/0P/O/9T/1v/f/9//7v/z//T/+P8FAAYAEgAVACIAJwAu ADcANwBAAD0ASgBHAE4ASgBXAE4AWgBUAGEAUQBcAEwAWABIAFcARQBSAEEATwA/AEUAOgBBADgA PgA5AD8ALAA8ADMANwApACoAIgApAB4AIQASAA8ACgAKAP//BADv/+//4//j/9X/0v/I/8j/vv+2 /6v/n/+i/5n/mv+O/5T/i/+S/4b/k/+K/5z/lf+i/5j/r/+l/7r/sv/D/8P/0//U/+L/4P/x/+// AgACAAkADgATABMAHwAjACgALAAtADQAMwA+AD4ARwBHAFMAUQBXAFYAYABYAGcAYgBsAGgAcwBq AHkAbgB7AGsAeQBuAHoAZgBxAFsAYwBRAFkAQABQADQAPgAiACkAEgAUAAAAAwDu//D/3//e/9P/ 0f/O/8T/wP+7/7n/s/+u/6z/sv+t/6z/qv+x/67/tP+u/7b/sv+6/7j/uf+1/73/uP+8/7n/uv+2 /77/uP++/7r/xP+5/8X/vv/K/8f/1f/O/9b/1v/f/93/7f/s//b/+/8HAA0AEwASABoAHAAkACoA MgA0ADYAPgA7AEEAOgBCADoAQAA/AEEANQA7ADQANwAuADQAKQAsACIAKAAhACEAGwAjABsAIAAc ACAAHQAhABsAIwAcACQAIAAoAB0AIwAdACUAGgAeABYAGAAOABAADAAKAP7/AgD3//f/8P/v/+X/ 5//a/9r/1P/Q/9D/x//K/8b/yP/C/8T/vv/D/8H/w//A/8L/wP/D/8P/xP/E/8n/yf/E/8L/yv/F /8X/wv/D/8X/yf/H/8n/xP/G/8D/xv/I/83/x//O/9H/1//a/+L/5//s/+v//P/4/wUACwAVABwA IgAqADUAOQA9AEUASABSAE8AVwBYAF4AWwBiAF0AZgBWAGYAWQBoAFUAXgBOAFkARgBPAEIAQwAy ADQAMAAyACcAKwAjACYAGgAgABoAGAALAA8ABgAHAP3/+f/y//X/6P/m/+L/3//W/9H/yv/G/7n/ tP+u/6b/o/+f/57/l/+P/4b/kf+D/43/gv+T/4X/lf+H/5n/lf+k/5v/sf+t/7z/u//O/83/3f/W /+//6v/6//3/BQAFABAAEQAYABsAHwAiACYALwArAC4ALgA0ADgAPQA+AEIAQwBIAEwATgBPAFEA UwBaAFMAWQBWAGEAVwBiAFsAZABUAF4AUABZAEcATgBCAEYALwA0ACcAKwAVABgABQAJAPv/+v/t /+3/4P/b/9b/0f/P/8T/x/+8/8D/uf+9/7X/u/+0/8L/uv++/7f/wf/A/8D/wP/E/7//yf/E/87/ xP/K/8H/zf/F/8f/w//L/8H/yf/D/87/yf/M/8H/0f/K/9P/zf/f/9v/4f/g//D/6//5//P/AwD/ /wgADgAVABcAHAAhAB4AJQAlACYAJwAuACgALAAlAC4AIQAqACQAJwAkACUAIwAlABwAHgAgACIA HgAeACkALQAqACoAKwAqADIANQA1ADUALwAvADoAPwA3ADUAOwA+ADYAOwAzADsAKwAsACEAJwAZ AB4AEQAUAAYACAD7//3/+v/8//L/8f/r/+r/6//o/+P/3v/i/9X/3v/W/93/2v/d/9j/4P/b/9z/ 2v/Z/9X/z//J/9j/0P/V/9P/2P/R/93/3f/g/9v/4//Z/+X/4P/r/+D/9v/t/wEA9/8HAAUAFwAX ACYAKQA0ADUAQwBEAEwAUABWAFoAYgBkAGsAcQBuAHYAewCBAH4AiwCCAIoAewCGAH0AfgB2AHUA ZwBuAFYAXABSAFUASQBLAEUASgA6ADgAOAA6ADMAMAAkACMAGwAdABUAFgAQABAADQAGAP7/+//q /+n/3P/c/9T/zf/H/8H/u/+2/7T/rP+n/6H/pP+b/6n/mv+t/53/r/+g/7b/qv+//7H/w/+//9P/ 0P/j/9z/8//r//7/+f8IAAUAEwASACMAHAAgACQALQArADYANwA0ADoAPwBAAEQASgBHAEUARABK AE4AUQBQAE4ATgBTAFEAUQBYAFgAUwBYAE8AWgBLAFQAQwBJADwAQwAzADgAKgApAB8AGwANAAoA /f/6//D/7P/l/9v/2P/Q/8//wP/F/7//vv+z/7r/sP+5/7H/uf+t/73/sv/E/7b/xf+//8v/wv/L /8X/zP/K/9H/yv/X/87/1//Q/9v/0//a/9T/2v/W/97/2v/g/9f/5f/d/+r/4f/x/+r/+v/5/wAA /f8LAAUAFAAOABgAGgAeAB4AKQAoACkAKgAtADIAMAAvACsALQAoACwAJAAmACIAJAAcABwAFgAV ABQAEAAQABEADwALABAADAAQAAwAEwAPABUAEQAWABQAFgAYABwAHAAfABoAIgAcABwAHgAaABcA GwAWABIAEwARAA0ADAAJAAcAAQABAPv/+f/v//L/6v/q/+T/5v/h/+T/3//j/+H/4f/a/+H/3f/h /9v/4P/Z/97/0f/f/9b/2P/T/9z/0v/U/9X/2f/X/9f/0v/Z/9T/3v/Z/9r/2f/a/9n/3v/c/+j/ 5f/x/+7//f/+/wwADAAZABgAKgAqADMAOQA+AEkASwBTAFoAYABgAGIAZgBwAGUAbgBjAGsAXwBn AFkAZgBQAFoATwBVAEQASAA4AEEANwAyACwAKwAkACUAGAAYABQAEAAKAAoA//////n/9f/w/+n/ 6P/g/+D/1P/U/8j/xv+8/7r/sP+p/57/o/+Z/5z/lv+b/47/mP+M/5n/jP+d/5L/o/+c/6X/nf+z /6j/vP+w/8//zf/Z/9n/8P/r/////f8MAAsAFAAUACIAIwAuADEAMQA0ADgAPwBCAEkASABPAFAA UwBVAFcAXQBbAF8AYwBeAGQAWgBdAGEAZwBgAGIAXgBjAF4AYgBVAFkASwBUAEkATQA+AD4AOAA7 ACoAKgAdAB8AEAASAAYABgD9//n/8P/r/+n/4f/i/9v/2v/V/9r/0v/Y/9L/3f/T/+P/2v/q/+P/ 6P/o//X/8//7//L/8v/z//L/8//5//b/+P/3//f/9//3//P/9//3//b/8f/2//L/8//w//b/8//6 //r////4/wUAAAAJAAkADwAQABgAFwAbABsAIgAkACYAIQAlACcAIwApACMAJAAlACYAIwAmABsA IgAdACMAGQAcABoAHAAUABYAGgAZABYAFQAXABwAHQAVACAAIAAiACQAKQAlACoAKQAtACwAKgAm ACcAKQAhACcAIQAeABsAHAARAA4ABQAJAAIAAgD6//H/8f/s/+f/3//h/9b/2f/O/9b/0v/P/8r/ 1f/O/9D/xv/W/87/y//E/8n/xf/M/8f/y//G/8j/wv/J/8f/yf/E/8r/xv/M/8b/zv/L/8v/z//V /9b/3f/X/+r/5//y/+3//v/5/w0ADAAWAB0AJAAmADMAOABEAEQATABOAFEAWQBcAGMAXwBjAGEA ZgBhAGkAXwBlAFQAVwBQAFQAQwBIAD4AQgAzADcAKgAtACMAJQAXABoADgAMAAUAAQD8//r/8f/0 /+f/5//d/9v/1v/U/9D/yP/C/73/uf+0/6j/pf+g/5//nf+S/5n/kP+U/4n/kP+K/5H/i/+a/4// nf+Z/6v/ov+0/6T/v/+4/9X/yP/h/97/7//v/wEAAwAMAA8AHwAiACkAKQAwADQAOAA8AEEARgBI AE4ASQBVAFAAVQBSAFcAVABZAFYAVwBQAFoAUQBVAFIAUwBSAFYATABSAEcATAA+AEgAOQBBADEA OAAjACoAFwAaAAgADwD7////7//u/+L/4//W/9b/zf/D/8X/u/+//7b/uv+x/7f/rf+5/7L/vf+1 /7//uv/K/8P/0P/I/9f/z//e/9j/4P/d/+X/4P/r/+n/7v/r//L/7v/4/+//8//z//b/8v/7//j/ /P/+//7/+P8DAAEABAAEAAUABAALAA0ADAAOABQAFQAYABYAHQAdABkAIgAaACEAFwAdABkAHgAc ABsAEQAWABEAEQAQAA0ADgALAAMABgAEAAMAAQD//wEAAQACAAUABwAIAAkADAAPAA8AFAASABcA GAAaABoAHQAbAB0AHQAXABwAGgAZABMAEgAPABIABwAHAPv//v/6//b/7P/t/+b/6P/l/9z/2//U /9b/0P/P/8v/zP/J/8X/xv/E/8P/wf+7/8P/u//C/7j/w/+2/8H/u//C/7j/wf+3/8L/u//F/77/ w/+7/8z/yP/R/8v/1f/Q/+b/4//x/+///f/8/wcADAAdAB0AJgAkADsARABHAFEAVQBdAFwAYQBq AHEAcAB4AHQAfQBuAHsAbAB2AGcAcgBiAGsAWQBhAFQAWwBCAEoAOQA/AC4ANQAlACcAGwAbAA8A CgAAAAQA+f/7/+z/7f/k/+T/2f/V/83/zv/E/8D/tf+w/6v/qv+k/5//nf+R/5T/jv+O/4f/kP+G /4r/hf+T/43/mf+N/57/mP+o/5//tf+v/8H/wf/V/9P/4P/e/+7/8v/+/wQADQARABQAHAAmACgA KQAuADEANwA6AEEAOwBGADsASgA/AEoAQQBGAEMARABCAEsAQQBKAD4ASAA/AEQAPQBBADoAPQAu ADgALgAyACQAKgAdACEAFAAVAAgACgD5/wAA9P/2/+X/5f/f/93/0//P/8v/x//I/8T/w/+//8T/ vP/E/77/w/+9/8z/wf/M/8X/y//K/9T/z//Z/9L/2//Y/+H/2//e/+H/5v/l/+b/4f/h/+T/5//h /+n/4f/r/+L/6P/n/+T/4P/l/+L/5//i/+v/5v/r/+7/9P/0//D/8f/3//j//P/9/wIA/////wAA BAAHAAIAAQACAAQABQABAAMABAD7/wEAAAABAP///f8AAAIABAADAAgAAgAJAAEADAAJAA8ADAAU ABYAGQAdABsAHwAhACEAHwAlAB4AJQAlACcAIAAdABsAHAAVABcACwAIAAEAAgD+//r/8//x/+3/ 5//h/9r/1//a/9H/zv/M/8j/xv/A/8H/v/+8/6//uv+w/7H/rv+w/6v/q/+m/63/qv+s/6b/qv+n /6b/oP+q/6T/qv+m/7T/rf+7/7T/wv+9/8r/xf/U/9b/4//j//H/8/8CAAAAEgARAB4AIgAyADUA PQBFAFEAWQBYAF4AYABwAGMAcABoAG4AZABuAGMAcABeAGoAVABeAEsAUwBCAEwAOAA9AC8ANQAh ACEAFgAXAAcACQD+//z/7//x/+f/5f/Y/9P/zv/L/7//vP+u/67/qP+l/5//nf+X/47/jf+H/4X/ g/+D/37/gv9+/4T/ef+H/3f/jv+D/4//iv+b/5r/pv+e/7j/sf/G/8D/2f/S/+P/4P/y//D/AAD/ /xEADwAYABoAIgAoACoAMwAwADkANwA8ADsARQA9AEUAOwBEADwASAA/AEYAPABCADsAPwA5AD0A NgA8ACsAMgAqAC4AIgAnABoAHAAQABIACAALAP3//v/y//D/5v/n/93/3P/V/87/yv/F/8b/vv/C /7b/u/+1/73/sv++/7T/wf+0/8P/vf/N/8P/1P/L/9X/0f/d/9f/6P/i/+z/5P/0/+//8//2//f/ +P/9//r//v/+//r/+f/+/wIA+//4//7/AAD6//v/AAD5/wEA/f8BAPj/AAABAP3//f/6/wAAAQAC APz/AAD+//7//v8AAP3////6//7/+P/9//v//P/2//z//P/2//z/+v/4//v/+v/5//7//v8AAAQA DAANABEAEgAXABgAGwAfACIAJAAqACgAKQAyACoAMQAuADgAMAA4ACsANAAnADEAJAAlABkAHAAT ABYADQARAAcABQD9//3/8P/x/+f/6v/h/9z/1f/T/9H/yv/G/77/vv+8/7v/tf+0/6r/sv+v/63/ qf+l/6L/pv+l/6P/nv+k/5//p/+j/63/pP+s/6T/tf+v/8D/u//K/8P/1v/X/+T/4//1//X/CAAH ABMAFwAiACkANQA9AEUATABRAFcAWgBiAGEAaABhAG4AZABuAGMAagBbAGQAWQBgAEwAVQBHAE4A OgBCACkALgAcACQAEAAUAAIABgD1//H/5P/o/9r/2f/L/8b/v/+9/7P/qv+j/5r/mf+R/5H/hf+G /33/gf92/3j/cP91/2z/d/9u/3v/cP99/3T/h/9//5L/h/+g/5b/p/+i/77/tf/H/8j/3f/a/+// 7P8EAAIADQATABsAIwAmACsAOQBBAEEASABJAFEATABVAFAAVABOAFcATQBYAEkAVABJAFAARABL AEEASQA4ADoANAA3ACkAMAAlACMAGwAcAA0AEQACAAQA9v/3/+v/5//c/9r/0P/S/8j/w/+9/7r/ uP+t/7D/q/+n/6L/qP+j/6n/o/+t/6T/sv+n/7z/rP/C/7j/yf/B/83/yv/X/9P/4//e/+r/6P/v /+//8//z//r/+v/4//j/AgD//wAA//8CAAIAAQADAAAABQD+/wEAAQD//wMAAQAGAAQABAADAAUA /////wQABQAEAP3/AAD+/wQA+v///wAABAADAAYABQAHAP7////9//z/+P/4//7//P/+//z//v8A AAMA//8KAAkABgAMABEADQASABAAGAAXABoAGAAdACEAHgAeACQAJAAhACEAHwAnAB8AIQAaAB4A EgAWAAsADwAEAAMA/f/5//P/7P/r/+j/4//g/93/1v/Q/8r/yf/J/7//vP+9/7T/t/+x/7j/r/+x /6z/sv+r/6v/qP+q/6j/p/+m/7D/q/+0/6f/uv+y/73/tP/A/8H/yv/G/9b/0//g/9v/6//o//f/ 9v8DAAcAEgAUACQAIwAxAC8APQBCAEQATABKAFgAVQBbAFsAZQBaAGcAXwBkAFoAYgBXAF0AUgBZ AEgATgA/AEUANAA6ACkAKQAeACQADAAMAAUABQDz//L/6P/o/9z/2//Y/9H/yv/C/7//vf+6/7T/ tf+w/6j/of+o/57/pv+Z/53/mf+d/5L/ov+X/6H/lv+r/5//r/+r/7z/tP/I/8D/0P/M/9v/2f/q /+j/+P/1/wwABwAXABUAIgAkAC8ALgA6AD0AQABHAEsATgBLAFEAUABWAE0AWgBMAFUASgBQAEkA TwBDAEYAQQBJAEAAQAA0ADYAMQAxACgALAAeAB4AFQAVAA0ACgABAAQA+P/6/+//6//m/+H/3//b /9P/z//L/8b/x//A/7//vP+4/7H/uf+z/7b/uf+8/7T/wf+6/8j/wP/L/8n/2//U/93/2//n/+H/ 7v/t//b/9v/6//r/AgAEAAwACgAIAAoACQAMAA8ADQANAAkACQAOAAsADwAKAAgABgAJAAgACgAD AAgAAwACAAMABAD//wMA//8AAPv/+//8//7//v8AAPn/+//2//z/9//3//b/9//x//f/9f/4//f/ 8//5//X/+f/4/wAAAQAGAAIADAAJABAAEgAPABcAGAAbACIAJAAfACMAJAAnACgALAArAC8AJwAv ACoALgAjACkAJAAjABsAHAAUABYAEQAMAAUABQD7//n/7//u/+j/6f/b/9r/0f/P/8//yv/G/8H/ v/+5/77/sf++/7L/t/+t/7H/rP+0/6v/s/+p/7f/rv+z/67/uv+1/7z/u//G/8P/zP/I/9n/2P/h /+D/7//x//7/AAAKAA4AGwAaACgALAA3AEIARwBNAFMAWQBaAGMAYQBsAGkAcgBwAHYAbQBzAG0A cwBkAG4AYQBlAFIAXQBHAFAAPgBDADEAMwAlACQAGgAZAAgACQD5//b/6//k/9v/0v/M/8v/wf+5 /7z/r/+s/6L/ov+Y/5v/k/+a/47/j/+K/5H/hf+T/4P/lf+H/5j/h/+b/5L/pv+c/7L/qP+7/7H/ zP/G/93/1P/x/+r////8/wsADQAYABsAKQAqADYAPABFAEgA")
		.appendTo("body");
	},

	queryStringToJSON: function() {            
	    var pairs = location.search.slice(1).split('&');

	    var result = {};
	    pairs.forEach(function(pair) {
		pair = pair.split('=');
		result[pair[0]] = decodeURIComponent(pair[1] || '');
	    });

	    return JSON.parse(JSON.stringify(result));
	},

	jsonToQueryString: function(json) {            

		var items = Object.getOwnPropertyNames(json);
		var string = null

		for (var i=0; i< items.length; i++)
		{
			if (string) 
			{
				string = string + "&" + items[i] + "=" + json[items[i]]
			} else {
				string = "?" + items[i] + "=" + json[items[i]];
			}
		}

		return string;
	},	

	stopAudioAlert: function() 
	{
		$(this.audioPlayer).remove();
		this.audioPlayer = null;
	},	

	getName: function(obj)
	{
		var str = obj.name;
		if (!str) str = obj.jid ? obj.jid.split("@")[0] : "";
		return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
	},		

	browserDetect:  
	{		 
		init: function () {		
			this.browser = this.searchString(this.dataBrowser) || "An unknown browser";			
			this.version = this.searchVersion(navigator.userAgent)
				|| this.searchVersion(navigator.appVersion)
				|| "an unknown version";
			this.OS = this.searchString(this.dataOS) || "an unknown OS";

			this.width = 0;
			this.height = 0;


			if ( typeof( window.innerWidth ) == 'number' )
			{
				this.width = window.innerWidth;
				this.height = window.innerHeight;

			} else if ( document.documentElement && ( document.documentElement.clientWidth || document.documentElement.clientHeight ) ) {

				this.width = document.documentElement.clientWidth;
				this.height = document.documentElement.clientHeight;

			} else if( document.body && ( document.body.clientWidth || document.body.clientHeight ) ) {

				this.width = document.body.clientWidth;
				this.height = document.body.clientHeight;
			}		
		},

		searchString: function (data) 
		{
			for (var i=0;i<data.length;i++)	{
				var dataString = data[i].string;
				var dataProp = data[i].prop;
				this.versionSearchString = data[i].versionSearch || data[i].identity;
				if (dataString) {
					if (dataString.indexOf(data[i].subString) != -1)
						return data[i].identity;
				}
				else if (dataProp)
					return data[i].identity;
			}
		},

		searchVersion: function (dataString) {
			var index = dataString.indexOf(this.versionSearchString);
			if (index == -1) return;
			return parseFloat(dataString.substring(index+this.versionSearchString.length+1));
		},

		dataBrowser: [
			{
				string: navigator.userAgent,
				subString: "Chrome",
				identity: "Chrome"
			},
			{ 	string: navigator.userAgent,
				subString: "OmniWeb",
				versionSearch: "OmniWeb/",
				identity: "OmniWeb"
			},
			{
				string: navigator.vendor,
				subString: "Apple",
				identity: "Safari",
				versionSearch: "Version"
			},
			{
				prop: window.opera,
				identity: "Opera"
			},
			{
				string: navigator.vendor,
				subString: "iCab",
				identity: "iCab"
			},
			{
				string: navigator.vendor,
				subString: "KDE",
				identity: "Konqueror"
			},
			{
				string: navigator.userAgent,
				subString: "Firefox",
				identity: "Firefox"
			},
			{
				string: navigator.vendor,
				subString: "Camino",
				identity: "Camino"
			},
			{		// for newer Netscapes (6+)
				string: navigator.userAgent,
				subString: "Netscape",
				identity: "Netscape"
			},
			{
				string: navigator.userAgent,
				subString: "MSIE",
				identity: "Explorer",
				versionSearch: "MSIE"
			},
			{
				string: navigator.userAgent,
				subString: "Gecko",
				identity: "Mozilla",
				versionSearch: "rv"
			},
			{ 		// for older Netscapes (4-)
				string: navigator.userAgent,
				subString: "Mozilla",
				identity: "Netscape",
				versionSearch: "Mozilla"
			}
		],

		dataOS : [
			{
				string: navigator.platform,
				subString: "Win",
				identity: "Windows"
			},
			{
				string: navigator.platform,
				subString: "Mac",
				identity: "Mac"
			},
			{
				   string: navigator.userAgent,
				   subString: "iPhone",
				   identity: "iPhone/iPod"
		    },
			{
				string: navigator.platform,
				subString: "Linux",
				identity: "Linux"
			}
		]
	}       
});

/**
 * Strophe.connectionmanager plugin
 */

/*
Strophe.addConnectionPlugin('connectionmanager', {

    conn: null,
    firstTime: true,
    conn_state: null,
    element_queue: [],
    enabled: true,  // enabled by default

    _status_lookup: {},

    _receiveTimer: null,
    _reconnectInterval: null,

    // default config
    config: {
	// try to reconnet continously, even after a graceful disconnect
	// unless the disconnect reason is "logout"
	autoReconnect: true,

	// if true (default), will automatically empty queue on successfull reconnect
	// (+/- 20 stanzas per packet, 2 seconds apart)
	autoResend: true,

	receiveTimeout: 20, // in seconds
	pingTimeout: 10, // in seconds
	reconnectInterval: 10, // in seconds - interval at which to attempt reconnection
	onEnqueueElement: null,
	onDequeueElement: null,
	onReceiveTimeout: null,
	onPingTimeout: null,
	onPingOK: null
    },

    // API

    configure: function(config){
	config = config || {};

	for(var c in config){
	    if(config.hasOwnProperty(c)){
		this.config[c] = config[c];
	    }
	}
    },

    sendQueuedElements: function(max){
	max = max || this.element_queue.length;

	this.conn.pause(); // facilitate bulk sending
	for(var i = 0; i < this.element_queue.length && i < max; i++){
	    this.conn.send(this.element_queue[i]);
	}
	this.conn.resume();
    },

    resendAll: function(sent_callback){
	var sendInt = setInterval(function(){
	    if(this.element_queue.length === 0){
		clearInterval(sendInt);

		if(sent_callback){ sent_callback(); }
		return;
	    }

	    this.sendQueuedElements(20);
	}.bind(this), 2000);
    },

    enable: function(){
	this.disable(); // prevent double-enabling

	var __that = this;
	var conn = this.conn;

	// insert a tap into the builtin _queueData function
	var _queueData = conn._queueData;

	if (_queueData)
	{
		conn._queueData = function (element) {
		    if(__that._enqueueElement(element)){
			_queueData.call(this, element);
		    } else {
			//console.log("NOT passing through queue call to Strophe Connection!");
		    }
		};
	}

	var _onRequestStateChange = conn._onRequestStateChange;

	if (_onRequestStateChange)
	{        
		conn._onRequestStateChange = function(func, req){
		    _onRequestStateChange.call(this, function(){
			__that._requestReceived(req);
			func(req);
		    }, req);
		};
	}

	// build a reverse lookup of Strophe.Status states
	for(var s in Strophe.Status){
	    if(Strophe.Status.hasOwnProperty(s)){
		this._status_lookup[Strophe.Status[s]] = s;
	    }
	}

	this.enabled = true;
    },

    disable: function(){
	this.conn._queueData = Strophe.Connection.prototype._queueData;
	this.conn._onRequestStateChange = Strophe.Connection.prototype._onRequestStateChange;

	clearTimeout(this._receiveTimer);
	clearInterval(this._reconnectInterval);

	this.enabled = false;
    },

    reconnect: function(){
	//console.log("reconnect start");

	var xhr = new XMLHttpRequest();
	xhr.open("GET", location.protocol + "//" + location.host + "/ofmeet/config", true);

	xhr.onload = (function() {
		//console.log("reconnect onload");
	}).bind(this);

	xhr.send(null);      	

	this.conn.disconnect();
	this.conn._onDisconnectTimeout(); // clears requests
	this.conn.connect(this.conn.jid, this.conn.pass,
			  this.conn.connect_callback,
			  this.conn.wait, this.conn.hold);
    },

    //--------------------------

    init: function(conn) {
	this.conn = conn;

	this.enable();
	console.log("strophe plugin: connectionmanager enabled");         
    },


    statusChanged: function(status, condition){
	if(!this.enabled){
	    return;
	}

	this.conn_state = status;
	//console.log("Strophe connection status: " + this._status_lookup[status] || status, condition);

	// start timer when connected and reset it when not connected
	clearTimeout(this._receiveTimer);

	if(status == Strophe.Status.CONNECTED){
	    this.conn.send($pres()); 

	    if (!this.firstTime) setTimeout(function() { window.location.reload(true);}, 5000);

	    this.firstTime = false; 

	    this._restartReceiveTimer();
	    clearInterval(this._reconnectInterval);
//             clearInterval(this.__countInterval);
//             this.__countInterval = null;

	    if(this.config.autoResend){
		this.resendAll();
	    }
		    }
	else if(status == Strophe.Status.DISCONNECTING){

	}
	else if(status == Strophe.Status.DISCONNECTED){
	    this.conn.reconnecting = true;

	    if(condition == "logout"){
		// disable auto reconnect
		this.config.autoReconnect = false;
	    }

	    clearInterval(this._reconnectInterval);

	    if(this.config.autoReconnect){           
		this._reconnectInterval = setInterval(
		    function(){
			if(!this.conn.connected){
			    this.reconnect();
			}
		    }.bind(this),
		    this.config.reconnectInterval * 1000);

//                 // start the counting interval (for testing purposes)
//                 if(this.__countInterval == null){
//                     var i = 0;
//                     this.__countInterval = setInterval(function(){
//                         this.conn.send($msg({to: "all@conference." + this.conn.domain,
//                                              type: "groupchat"}).c("body").t(i++));
//                     }.bind(this), 1000);
//                 }
	    }
	}
    },

    _enqueueElement: function(el){
	 //console.log("req sent: " + el);

	if(!el){
	    return;
	}


	// only enqueue elements __that are not used for authentication
	// or session establishment.
	// also don't buffer presence stanzas
	if( (!el.getAttribute("id") 
	    || (Strophe.isTagEqual(el, "iq") && el.getAttribute("id").indexOf("_auth_") != -1))
	    || el.getAttribute("xmlns") == "urn:ietf:params:xml:ns:xmpp-sasl"
	    || Strophe.isTagEqual(el, "presence")
	  ){
	    // this is an auth/session stanza
	    return true;
	}

	// only push non-empty requests
	if(this.element_queue.indexOf(el) == -1){
	    this.element_queue.push(el);

	    if(this.config.onEnqueueElement){
		this.config.onEnqueueElement(el);
	    }
	}

	 //console.log("sentQueue: " + this.element_queue.length + " " + this.element_queue);
	 //console.log("_requests: " + this.conn._requests.length + " " + this.conn._requests);

	// if strophe is in the AUTHENTICATING (auth/session establishment) stage,
	// don't allow "regular requests" to be pushed through
//         if(this.conn_state == Strophe.Status.AUTHENTICATING ||
//            this.conn_state == Strophe.Status.DISCONNECTED){
	if(this.conn_state != Strophe.Status.CONNECTED){
	    return false;
	}

	return true;
    },

    _requestReceived: function(req){
	 //console.log("req received: " + req);

	// only dequeue in connected state
	if(this.conn_state == Strophe.Status.CONNECTED){
	    // clear the queue
	    var els = req.xmlData.childNodes;
	    if(els && els.length > 0){
		for(var i = 0; i < this.element_queue.length; i++){
		    for(var j = 0; j < els.length; j++){
			//if(this.element_queue[i] == els[j]){
			if(this.element_queue[i] && els[j] && (
			    this.element_queue[i].getAttribute("id") 
				== els[j].getAttribute("id"))){  // use request id comparisons instead
			    //console.log("removing from sent queue:" + this.element_queue[i]);
			    this.element_queue.splice(i--, 1);

			    if(this.config.onDequeueElement){
				this.config.onDequeueElement(els[j]);
			    }
			}
		    }
		}
	    }

	     //console.log("sentQueue:" + this.element_queue.length + " " + this.element_queue);
	     //console.log("_requests:" + this.conn._requests.length + " " + this.conn._requests);
	}

	this._restartReceiveTimer();
    },

    _restartReceiveTimer: function(){
	clearTimeout(this._receiveTimer);
	this._receiveTimer = setTimeout(this._onReceiveTimeout.bind(this),
					this.config.receiveTimeout * 1000);
    },

    _onReceiveTimeout: function(){
	// receive timeout reached, do a ping
	Strophe.info("CM: receive timeout");

	if(this.config.onReceiveTimeout){
	    this.config.onReceiveTimeout();
	}

	this.conn.send($iq(
	    {
		id: "ping",
		type: "get",
		to: this.conn.domain
	    }).c("ping", {xmlns: 'urn:xmpp:ping'}));

	var pingTimeout = setTimeout(this._onPingTimeout.bind(this),
				     this.config.pingTimeout * 1000);

	this.conn.addHandler(function(resp){
	    clearTimeout(pingTimeout);

	    if(this.config.onPingOK){
		this.config.onPingOK();
	    }
	}.bind(this), null, null, null, "ping");
    },

    _onPingTimeout: function(){
	Strophe.warn("CM: ping timed out, disconnecting!");

	if(this.config.onPingTimeout){
	    this.config.onPingTimeout();
	}

	// disconnect connection
	this.conn.disconnect();
    }

}); 
*/
 /**
  * Roster Plugin
  * Allow easily roster management
  *
  *  Features
  *  * Get roster from server
  *  * handle presence
  *  * handle roster iq
  *  * subscribe/unsubscribe
  *  * authorize/unauthorize
  *  * roster versioning (xep 237)
  */

 Strophe.addConnectionPlugin('roster',
 {
     /** Function: init
      * Plugin init
      *
      * Parameters:
      *   (Strophe.Connection) conn - Strophe connection
      */
     init: function(conn)
     {
	 this._connection = conn;
	 this._callbacks = [];
	 /** Property: items
	  * Roster items
	  * [
	  *    {
	  *        name         : "",
	  *        jid          : "",
	  *        subscription : "",
	  *        ask          : "",
	  *        groups       : ["", ""],
	  *        resources    : {
	  *            myresource : {
	  *                show   : "",
	  *                status : "",
	  *                priority : ""
	  *            }
	  *        }
	  *    }
	  * ]
	  */
	 this.items = [];
	       /** Property: ver
		* current roster revision
		* always null if server doesn't support xep 237
		*/
	 ver = null;
	 // Override the connect and attach methods to always add presence and roster handlers.
	 // They are removed when the connection disconnects, so must be added on connection.
	 var oldCallback, roster = this, _connect = conn.connect, _attach = conn.attach;
	 var newCallback = function(status)
	 {
	     if (status == Strophe.Status.ATTACHED || status == Strophe.Status.CONNECTED)
	     {
		 try
		 {
		     // Presence subscription
		     conn.addHandler(roster._onReceivePresence.bind(roster), null, 'presence', null, null, null);
		     conn.addHandler(roster._onReceiveIQ.bind(roster), Strophe.NS.ROSTER, 'iq', "set", null, null);
		 }
		 catch (e)
		 {
		     Strophe.error(e);
		 }
	     }

	     if (oldCallback && status == Strophe.Status.CONNECTED)  oldCallback.apply(this, arguments);
	 };
	 conn.connect = function(jid, pass, callback, wait, hold)
	 {
	     if (!oldCallback) oldCallback = callback;

	     if (typeof jid  == "undefined")
		 jid  = null;
	     if (typeof pass == "undefined")
		 pass = null;
	     callback = newCallback;
	     _connect.apply(conn, [jid, pass, callback, wait, hold]);
	 };
	 conn.attach = function(jid, sid, rid, callback, wait, hold, wind)
	 {
	     if (!oldCallback) oldCallback = callback;

	     if (typeof jid == "undefined")
		 jid = null;
	     if (typeof sid == "undefined")
		 sid = null;
	     if (typeof rid == "undefined")
		 rid = null;
	     callback = newCallback;
	     _attach.apply(conn, [jid, sid, rid, callback, wait, hold, wind]);
	 };

	 Strophe.addNamespace('ROSTER_VER', 'urn:xmpp:features:rosterver');
	 Strophe.addNamespace('NICK', 'http://jabber.org/protocol/nick');

	 console.log("strophe plugin: roster enabled");        
     },
     /** Function: supportVersioning
      * return true if roster versioning is enabled on server
      */
     supportVersioning: function()
     {
	 return (this._connection.features && this._connection.features.getElementsByTagName('ver').length > 0);
     },
     /** Function: get
      * Get Roster on server
      *
      * Parameters:
      *   (Function) userCallback - callback on roster result
      *   (String) ver - current rev of roster
      *      (only used if roster versioning is enabled)
      *   (Array) items - initial items of ver
      *      (only used if roster versioning is enabled)
      *     In browser context you can use sessionStorage
      *     to store your roster in json (JSON.stringify())
      */
     get: function(userCallback, ver, items)
     {
	 var attrs = {xmlns: Strophe.NS.ROSTER};
	 //this.items = [];
	 if (this.supportVersioning())
	 {
	     // empty rev because i want an rev attribute in the result
	     attrs.ver = ver || '';
	     this.items = items || [];
	 }
	 var iq = $iq({type: 'get',  'id' : this._connection.getUniqueId('roster')}).c('query', attrs);
	 return this._connection.sendIQ(iq,
				 this._onReceiveRosterSuccess.bind(this, userCallback),
				 this._onReceiveRosterError.bind(this, userCallback));
     },
     /** Function: registerCallback
      * register callback on roster (presence and iq)
      *
      * Parameters:
      *   (Function) call_back
      */
     registerCallback: function(call_back)
     {
	 this._callbacks.push(call_back);
     },
     /** Function: findItem
      * Find item by JID
      *
      * Parameters:
      *     (String) jid
      */
     findItem : function(jid)
     {
	if (this.items)
	{
		for (var i = 0; i < this.items.length; i++)
		{
		    if (this.items[i] && this.items[i].jid == jid)
		    {
			return this.items[i];
		    }
		}
	}
	 return false;
     },
     /** Function: removeItem
      * Remove item by JID
      *
      * Parameters:
      *     (String) jid
      */
     removeItem : function(jid)
     {
	 for (var i = 0; i < this.items.length; i++)
	 {
	     if (this.items[i] && this.items[i].jid == jid)
	     {
		 this.items.splice(i, 1);
		 return true;
	     }
	 }
	 return false;
     },
     /** Function: subscribe
      * Subscribe presence
      *
      * Parameters:
      *     (String) jid
      *     (String) message (optional)
      *     (String) nick  (optional)
      */
     subscribe: function(jid, message, nick) {
	 var pres = $pres({to: jid, type: "subscribe"});
	 if (message && message !== "") {
	     pres.c("status").t(message).up();
	 }
	 if (nick && nick !== "") {
	     pres.c('nick', {'xmlns': Strophe.NS.NICK}).t(nick).up();
	 }
	 this._connection.send(pres);
     },
     /** Function: unsubscribe
      * Unsubscribe presence
      *
      * Parameters:
      *     (String) jid
      *     (String) message
      */
     unsubscribe: function(jid, message)
     {
	 var pres = $pres({to: jid, type: "unsubscribe"});
	 if (message && message !== "")
	     pres.c("status").t(message);
	 this._connection.send(pres);
     },
     /** Function: authorize
      * Authorize presence subscription
      *
      * Parameters:
      *     (String) jid
      *     (String) message
      */
     authorize: function(jid, message)
     {
	 var pres = $pres({to: jid, type: "subscribed"});
	 if (message && message !== "")
	     pres.c("status").t(message);
	 this._connection.send(pres);
     },
     /** Function: unauthorize
      * Unauthorize presence subscription
      *
      * Parameters:
      *     (String) jid
      *     (String) message
      */
     unauthorize: function(jid, message)
     {
	 var pres = $pres({to: jid, type: "unsubscribed"});
	 if (message && message !== "")
	     pres.c("status").t(message);
	 this._connection.send(pres);
     },
     /** Function: add
      * Add roster item
      *
      * Parameters:
      *   (String) jid - item jid
      *   (String) name - name
      *   (Array) groups
      *   (Function) call_back
      */
     add: function(jid, name, groups, call_back)
     {
	 var iq = $iq({type: 'set'}).c('query', {xmlns: Strophe.NS.ROSTER}).c('item', {jid: jid,
										       name: name});
	 for (var i = 0; i < groups.length; i++)
	 {
	     iq.c('group').t(groups[i]).up();
	 }
	 this._connection.sendIQ(iq, call_back, call_back);
     },
     /** Function: update
      * Update roster item
      *
      * Parameters:
      *   (String) jid - item jid
      *   (String) name - name
      *   (Array) groups
      *   (Function) call_back
      */
     update: function(jid, name, groups, call_back)
     {
	 var item = this.findItem(jid);
	 if (!item)
	 {
	     throw "item not found";
	 }
	 var newName = name || item.name;
	 var newGroups = groups || item.groups;
	 var iq = $iq({type: 'set'}).c('query', {xmlns: Strophe.NS.ROSTER}).c('item', {jid: item.jid,
										       name: newName});
	 for (var i = 0; i < newGroups.length; i++)
	 {
	     iq.c('group').t(newGroups[i]).up();
	 }
	 return this._connection.sendIQ(iq, call_back, call_back);
     },
     /** Function: remove
      * Remove roster item
      *
      * Parameters:
      *   (String) jid - item jid
      *   (Function) call_back
      */
     remove: function(jid, call_back)
     {
	 var item = this.findItem(jid);
	 if (!item)
	 {
	     throw "item not found";
	 }
	 var iq = $iq({type: 'set'}).c('query', {xmlns: Strophe.NS.ROSTER}).c('item', {jid: item.jid,
										       subscription: "remove"});
	 this._connection.sendIQ(iq, call_back, call_back);
     },
     /** PrivateFunction: _onReceiveRosterSuccess
      *
      */
     _onReceiveRosterSuccess: function(userCallback, stanza)
     {
	 this._updateItems(stanza);
	 if (userCallback) userCallback(this.items);
     },
     /** PrivateFunction: _onReceiveRosterError
      *
      */
     _onReceiveRosterError: function(userCallback, stanza)
     {
	 userCallback(this.items);
     },
     isSelf: function (jid) {
	return (Strophe.getBareJidFromJid(jid) === Strophe.getBareJidFromJid(this._connection.jid));
     },    
     /** PrivateFunction: _onReceivePresence
      * Handle presence
      */
     _onReceivePresence : function(presence)
     {
	 var jid = presence.getAttribute('from');
	 var from = Strophe.getBareJidFromJid(jid);
	 var xquery = presence.getElementsByTagName("x");

	if (this.isSelf(from)) 
	{
	    return true;

	};

	var ignore = false;

	 for (i = 0; i < presence.childNodes.length; i++) 
	 {
		var xmlns = presence.childNodes[i].getAttribute("xmlns");  

		if (xmlns && (xmlns.match(Strophe.NS.MUC) || xmlns.match("urn:xmpp:rayo")))
		{
			ignore = true;
		}		
	 }

	if (jid.substring(0, 5) == "rayo-") return true;			
	if (jid.substring(0, 5) == "Jitsi") return true;        

	if (ignore) return true;

	 var item = this.findItem(from);

	 if (!item)
	 {
	     item = {
		 name         : Strophe.getNodeFromJid(jid),
		 jid          : from,
		 subscription : "both",
		 ask          : null,
		 groups       : [],
		 resources    : {}
	     };
	     this.items.push(item);
	 }

	 var type = presence.getAttribute('type');

	 if (type == 'unavailable')
	 {
	     delete item.resources[Strophe.getResourceFromJid(jid)];
	 }
	 else if (!type)
	 {
	     // TODO: add timestamp
	     item.resources[Strophe.getResourceFromJid(jid)] = {
		 show     : (presence.getElementsByTagName('show').length !== 0) ? Strophe.getText(presence.getElementsByTagName('show')[0]) : "",
		 status   : (presence.getElementsByTagName('status').length !== 0) ? Strophe.getText(presence.getElementsByTagName('status')[0]) : "",
		 priority : (presence.getElementsByTagName('priority').length !== 0) ? Strophe.getText(presence.getElementsByTagName('priority')[0]) : ""
	     };
	 }
	 else
	 {
	     // Stanza is not a presence notification. (It's probably a subscription type stanza.)
	     return true;
	 }
	 //this._call_backs(this.items, item);
	 return true;
     },
     /** PrivateFunction: _call_backs
      *
      */
     _call_backs : function(items, item)
     {
	 for (var i = 0; i < this._callbacks.length; i++) // [].forEach my love ...
	 {
	     this._callbacks[i](items, item);
	 }
     },
     /** PrivateFunction: _onReceiveIQ
      * Handle roster push.
      */
     _onReceiveIQ : function(iq)
     {
	 var id = iq.getAttribute('id');
	 var from = iq.getAttribute('from');
	 // Receiving client MUST ignore stanza unless it has no from or from = user's JID.
	 if (from && from !== "" && from != this._connection.jid && from != Strophe.getBareJidFromJid(this._connection.jid))
	     return true;
	 var iqresult = $iq({type: 'result', id: id, from: this._connection.jid});
	 this._connection.send(iqresult);
	 this._updateItems(iq);
	 return true;
     },
     /** PrivateFunction: _updateItems
      * Update items from iq
      */
     _updateItems : function(iq)
     {  
	 var query = iq.getElementsByTagName('query');
	 if (query.length !== 0)
	 {
	     this.ver = query.item(0).getAttribute('ver');
	     var self = this;
	     Strophe.forEachChild(query.item(0), 'item',
		 function (item)
		 {
		     self._updateItem(item);
		 }
	    );
	 }
	 this._call_backs(this.items);
     },
     /** PrivateFunction: _updateItem
      * Update internal representation of roster item
      */
     _updateItem : function(item)
     {
	 var jid           = item.getAttribute("jid");
	 var name          = item.getAttribute("name");
	 var subscription  = item.getAttribute("subscription");
	 var ask           = item.getAttribute("ask");
	 var groups        = [];
	 Strophe.forEachChild(item, 'group',
	     function(group)
	     {
		 groups.push(Strophe.getText(group));
	     }
	 );

	 if (subscription == "remove")
	 {
	     this.removeItem(jid);
	     return;
	 }

	 item = this.findItem(jid);

	 if (!item)
	 {
	     this.items.push({
		 name         : name,
		 jid          : jid,
		 subscription : subscription,
		 ask          : ask,
		 groups       : groups,
		 resources    : {}
	     });
	 }
	 else
	 {
	     item.name = name;
	     item.subscription = subscription;
	     item.ask = ask;
	     item.groups = groups;
	 }
     }
});
/**
 * OFMeet Extra Features
 *
 * Adds extra client side features for Openfire Meetings.
 */
Strophe.addConnectionPlugin('ofmeet', 
{
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
	
	init: function (conn) 
	{
		console.log("strophe plugin: ofmeet enabled", conn);
		
		this.connection = conn;	
		window.xmppConnection = conn;
		this.connection.addHandler(this.onMessage.bind(this), null, 'message'); 
		this.connection.addHandler(this.onPresence.bind(this), null, 'presence');        
		this.connection.addHandler(this.onPrivate.bind(this),  'jabber:iq:private', 'iq');
		
		this.connection.roster.registerCallback(function(items)
		{
			$(document).trigger('ofmeet.roster.items', [items]);
			return true;	
		});
		
		//$( "#toolbar" ).prepend('<a class="button icon-presentation" data-container="body" data-toggle="popover" data-placement="bottom" content="Share PDF Presentation" onclick="Strophe._connectionPlugins.ofmeet.openPDFDialog();"></a>');			
		//$( "#toolbar" ).prepend('<a class="button icon-share-doc" data-container="body" data-toggle="popover" data-placement="bottom" content="Share Application" onclick="Strophe._connectionPlugins.ofmeet.openAppsDialog();"></a>');			
	},
	
	resize: function() 
	{
		if ($('#presentation>iframe')) {
		    $('#presentation>iframe').width(this.getPresentationWidth());
		    $('#presentation>iframe').height(this.getPresentationHeight());
		}    
	},

	getPresentationWidth: function() 
	{
		var availableWidth = window.innerWidth;
		var availableHeight = this.getPresentationHeight();

		var aspectRatio = 16.5 / 9.0;
		if (availableHeight < availableWidth / aspectRatio) {
		    availableWidth = Math.floor(availableHeight * aspectRatio);
		}
		return availableWidth;
	},

	getPresentationHeight: function () 
	{
		var remoteVideos = $('#remoteVideos');
		return window.innerHeight - remoteVideos.outerHeight();
	}, 	

	pdfReady: function() 
	{
		console.log("ofmuc.pdfReady");	
		
		this.setPresentationVisible(true); 
		//this.videoLayout.resizeLargeVideoContainer();
		//this.videoLayout.positionLarge();
		//this.videoLayout.resizeThumbnails();  
		this.resize();
		$.prompt.close();
	},

	pdfShare: function(action, url) 
	{
		console.log("ofmuc.pdfShare", url, action, this)
		var msg = $msg({to: window.xmppRoomJid, type: 'groupchat'});
		msg.c('pdfshare', {xmlns: 'http://igniterealtime.org/protocol/pdfshare', action: action, url: url}).up();
		window.xmppConnection.send(msg);        
	},

	pdfStart: function(url) 
	{
		console.log("ofmuc.pdfStart", url);

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

	pdfStop: function(url) 
	{    
		console.log("ofmuc.pdfStop", url);	

		this.setPresentationVisible(false);

		if (this.appFrame)
		{
			this.appFrame.contentWindow.location.href = "about:blank";
			this.appFrame = null;

			$('#presentation').html('');		
		}
	},

	pfdGoto: function(page) 
	{
		console.log("ofmuc.pfdGoto", page);

		this.pdfPage = page;

		if (this.sharePDF != null)
		{
			this.pdfShare("goto", this.sharePDF + "#" + page);
		}
	},

	pfdMessage: function(msg) 
	{
		console.log("pfdMessage", msg);

		if (this.appFrame)
		{
			this.pdfShare("message", JSON.stringify(msg));
		}        
	},

	handlePdfShare: function (action, url, from)
	{
		console.log("local handlePdfShare", url, action, from);

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
	openPDFDialog: function()
	{
		console.log("ofmeet plugin: openPDFDialog");	  	
		var __that = this;

		if (__that.sharePDF) 
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
						__that.pdfShare("destroy", __that.sharePDF);
						__that.pdfStop(__that.sharePDF);
						__that.sharePDF = null;	
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

		for (var i=0; i<__that.urls.length; i++)
		{
			if (__that.urls[i].url.indexOf(".pdf") > -1 && __that.urls[i].url.indexOf(".PDF") > -1) urlsList = urlsList + '<option value="' + __that.urls[i].url + '">' + __that.urls[i].name + '</option>'
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
					__that.sharePDF = document.getElementById('pdfiUrl').value;

					if (__that.sharePDF)
					{
						setTimeout(function()
						{
							__that.pdfStart(__that.sharePDF  + "&control=true");
							__that.pdfShare("create", __that.sharePDF  + "&control=false");
						}, 500);
					}
				}					 
			}
		});    
		}		
	},
	
	setPresentationVisible: function(visible) 
	{   
		var __that = this;
		
		if (visible) 
		{
		    $('#largeVideo').fadeOut(300, function () {
			//__that.videoLayout.setLargeVideoVisible(false);
			$('#presentation>iframe').fadeIn(300, function() {
			    $('#presentation>iframe').css({opacity:'1'});
			    //ToolbarToggler.dockToolbar(false);
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
			//__that.videoLayout.setLargeVideoVisible(true);
			//ToolbarToggler.dockToolbar(true);
		    });            
		}
	},

	isPresentationVisible: function () 
	{
		return ($('#presentation>iframe') != null && $('#presentation>iframe').css('opacity') == 1);
	},	
	
	openAppsDialog: function()
	{
		console.log("ofmeet plugin: openAppsDialog");			
	},
	
	sipPhone: function()
	{
		console.log("ofmeet plugin: openAppsDialog", this.sipEnabled, window.xmppRoomJid);	
		
		if (this.sipEnabled)
		{	
			$("#siphone").css({display: "none"});	
			$("#siphone" ).html('&nbsp;');
			this.sipEnabled = false;
			
			$("#contactlist").css({display: "block"});			
			APP.UI.toggleContactList();				
		} else {
			APP.UI.toggleContactList();
			$("#contactlist").css({display: "none"});
						
			$("#siphone" ).html('<iframe style="height: 100%;width:100%" src="phone/index.html?room=' + Strophe.getNodeFromJid(window.xmppRoomJid) + '" id="sipPhoneDiv"></iframe>');			
			$("#siphone").css({display: "block"});			
			
			setTimeout(function()
			{
				var videoWidth = $("#videospace").width() - 100;			
				$("#videospace").width(videoWidth);
			}, 500);
				
			this.sipEnabled = true;			
		}
	
	},

	onPresence: function (pres) 
	{   		
                var presence = $(pres);
		var __that = this;
		
		var jid = presence.attr('from');
		var bare_jid = Strophe.getBareJidFromJid(jid);

		presence.find('ofmeet').each(function() 
		{
			if (!__that.roomJid)
			{
				window.xmppRoomJid = bare_jid;

				if (config.sip)
				{
					var room = Strophe.getNodeFromJid(jid);
					$( "#toolbar" ).prepend('<a class="button icon-telephone" data-container="body" data-toggle="popover" data-placement="bottom" content="SIP Phone" onclick="Strophe._connectionPlugins.ofmeet.sipPhone();"></a>');			
					$( "#videoconference_page" ).append('<div id="siphone" class="right-panel" style="display:none;height: 100%;width: 100%;max-width:300px"></div>');
				}

				__that.roomJid = bare_jid;
			}
			
		});

		if (jid.substring(0, 5) == "rayo-") return true;			
		if (jid.substring(0, 5) == "Jitsi") return true;			

		if (this.connection.roster.isSelf(bare_jid)) 
		{
		    if ((this.connection.jid !== jid) &&(presence.attr('type') !== 'unavailable')) {
			// Another resource has changed it's status, we'll update ours as well.

		    }
		    return true;
		}

		var ignore = false;

		for (i = 0; i < pres.childNodes.length; i++) 
		{
			var xmlns = pres.childNodes[i].getAttribute("xmlns");  

			if (xmlns && (xmlns.match(Strophe.NS.MUC) || xmlns.match("urn:xmpp:rayo") ))
			{
				ignore = true;				
			}			
		}

		if (ignore) return true;

		$(document).trigger('ofmeet.contact.presence',
		{	
			type: presence.attr('type'),
			full_jid: jid,
			jid: bare_jid,
			state:  presence.attr('type') == "unavailable" ? "offline" : presence.find('show').text() || 'online',
			status: presence.find('status').text(),
			isSelf: this.connection.roster.isSelf(bare_jid)
		});
                	
		return true;	
	},
	
	onPrivate: function (iq) 
	{    
		var iq = $(iq);
		
		$('conference', iq).each(function() {
			var item = $(this);
			$(document).trigger('ofmeet.room.items', [{autojoin: item.attr('autojoin'), jid: item.attr('jid'), name: item.attr('name')}]);
		});
		return true;	
	},
	
	onMessage: function (message) 
	{
		console.log("onMessage", message);
    		var __that = this;		
    		
		var from = $(message).attr("from");
		var to = $(message).attr("to");	
		var type = $(message).attr("type");
		farparty = Strophe.getResourceFromJid(from);		
		
		if (type == "chat")
		{
			$(message).find('body').each(function ()  	
			{
				var body = $('<div/>').text($(this).text()).html();
				var timestamp = moment().clone().startOf('day');

				if ($(message).find('delay').length > 0) {
				    timestamp = moment($(message).find('delay').attr('stamp')).clone().startOf('day');
				}

				$(document).trigger('ofmeet.contact.message', {from: from, body: body, timestamp: timestamp, to: to});					
			});
			
			return true;
		}
		
		$(message).find('pdfshare').each(function() 
		{
			var action = $(this).attr('action');
			var url = $(this).attr('url');		

			if (Strophe.getResourceFromJid(from) != Strophe.getResourceFromJid(__that.connection.jid))
			{				
				__that.handlePdfShare(action, url, farparty);	
			}
		});
		
		return true;
	},
	
	getVCard: function getVCard(jid, callback, errorback) 
	{
		this.connection.vCard.get(jid, function(vCard)
		{
			if (callback) callback(vCard);	

		}, function(error) {
			if (errorback) errorback(error);	
			console.error(error);
		});				

	},

	setVCard: function setVCard(vCard, callback, errorback) 
	{
		this.connection.vCard.set(vCard, function(resp)
		{
			if (callback) callback(resp);	

		}, function(error) {
			if (errorback) errorback(error);			
			console.error(error);
		});				

	},	

	fetchContacts: function fetchContacts() 
	{
		this.connection.roster.get();
	},	
	
	findUsers: function findUsers(search, callback)  
	{
		console.log('findUsers ' + search);

		var iq = $iq({type: 'set', to: "search." + this.connection.domain}).c('query', {xmlns: 'jabber:iq:search'}).c('x').t(search).up().c('email').t(search).up().c('nick').t(search);

		this.connection.sendIQ(iq, function(response)
		{	
			console.log('findUsers response', response)
			var users = [];

			$(response).find('item').each(function() 
			{
				var current = $(this);							    					
				var jid = current.attr('jid');
				var username = Strophe.getNodeFromJid(jid);

				var name = current.find('nick').text();
				var email = current.find('email').text();		

				users.push({username: username, name: name, email: email, jid: jid});								
			});

			if (callback) 
				callback(users);
			else 
				$(document).trigger('ofmeet.find.users', {users: users});

		}, function (error) {		
			console.error(error);
		});
	},	

	fetchBookmarks: function fetchBookmarks() 
	{		
		this.connection.sendIQ($iq({type: "get"}).c("query", {xmlns: "jabber:iq:private"}).c("storage", {xmlns: "storage:bookmarks"}).tree(), function(resp)
		{
			//console.log("get bookmarks", resp)

			$(resp).find('conference').each(function() 
			{	
				$(document).trigger('ofmeet.bookmark.conference.item', {name: $(this).attr("name"), jid: $(this).attr("jid")});				
			})

			$(resp).find('url').each(function() 
			{
				$(document).trigger('ofmeet.bookmark.url.item', {name: $(this).attr("name"), url: $(this).attr("url")});
			});

		}, function (error) {		
			console.error(error);
		});		
	},

	fetchChatHistory: function fetchChatHistory(from, to, callback) 
	{		
		this.connection.mam.query(from, {"with": to,  onMessage: function(message) 
		{
			//console.log("Message from ", message);

			var msg = $(message).find("forwarded message");
			var body = $(message).find("forwarded message body").text();
			var timestamp = $(message).find("forwarded delay").attr("stamp");
			var item = {from: msg.attr("from"), to: msg.attr("to"), type: msg.attr("type"), body: body, timestamp: timestamp};

			if (callback) callback(item);
			$(document).trigger('ofmeet.chat.history.item', item);
			return true;			

		}, onComplete: function(response) {

			$(document).trigger('ofmeet.chat.history.complete');		

		}, onError: function(error) {
			console.error("ERROR ", error);		
		}});
	},

	fetchWorkgroups: function fetchWorkgroups() 
	{
		console.log("fetch workgroups")
		var __that = this;

		var iq = $iq({type: 'get', to: "workgroup." + this.connection.domain}).c('workgroups', {jid: this.connection.jid, xmlns: 'http://jabber.org/protocol/workgroup'});

		this.connection.sendIQ(iq, function(response)
		{
		    console.log("fetch workgroups", response)

		    $(response).find('workgroup').each(function() 
		    {
			var current = $(this);
			var jid = current.attr('jid');	
			var name = Strophe.getNodeFromJid(jid);
			var room = 'workgroup-' + name + "@conference." + __that.connection.domain;

			$(document).trigger('ofmeet.workgroup.item', {name: name, jid: jid, room: room});

		    });

		}, function (error) {		
			console.error(error);
		});
	},

	joinWorkgroup: function joinWorkgroup(workgroup, maxChats, callback, errorback) 
	{
		console.log("join Workgroup")
		this.connection.workgroup.joinWorkgroup(workgroup, maxChats, callback, errorback);			
	},

	leaveWorkgroup: function leaveWorkgroup(workgroup) 
	{
		console.log("join leaveWorkgroup")
		this.connection.workgroup.joinWorkgroup(workgroup);			
	},	

	setPresence: function(config) 
	{
		var presence;

		if (config.show  && config.show.toLowerCase() == "unavailable")
		{
			presence = $pres({type: "unavailable"});

		} else {	

			presence = $pres();	

			if (config.show  && config.show.toLowerCase() != "available")
			{	
				if ("dnd,xa,away,chat".indexOf(config.show) == -1) config.show = "chat";
				presence = presence.c('show').t(config.show).up();
			}

			if (config.status) 
			{
				config.status = Strophe.xmlescape(config.status);	
				presence = presence.c('status').t(config.status).up();
			}
		}			

		this.connection.send(presence);
	},

	sendMessage: function(message, callback, errorback)
	{
		try {
			var msg = $msg({to:message.jid, type:"chat"}).c("body").t(message.body).up();

			if (message.thread) msg.c("thread").t(message.thread).up();
			this.connection.send(msg);
		
			if (callback) callback();
		} catch (e) {			
			if (errorback) errorback(e);
		}	
	},

	setProperties: function(props, callback, errorback)
	{
		props.action = "set_user_properties";		
		this.sendJsonRequest(props, callback, errorback);				
	},

	getProperties: function(username, callback, errorback)
	{
		this.sendJsonRequest({username: username, action: "get_user_properties"}, callback, errorback);	
	},
	
	getConferenceId: function(room, callback, errorback)
	{
		this.sendJsonRequest({room: room, action: "get_conference_id"}, callback, errorback);	
	},

	getUserGroups: function(username, callback, errorback)
	{
		this.sendJsonRequest({username: username, action: "get_user_groups"}, callback, errorback);	
	},	

	sendJsonRequest: function(request, callback, errorback)
	{		
		this.connection.sendIQ($iq({to: this.connection.domain, type: 'get'}).c("request", {xmlns: 'http://igniterealtime.org/protocol/ofmeet'}).t(JSON.stringify(request)),

			function (resp) 
			{
				var response  = resp.querySelector("response");
				var json = response.innerHTML && response.innerHTML != "" ? JSON.parse(response.innerHTML) : {};
				json.action = null;
				if (callback) callback(json);
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

