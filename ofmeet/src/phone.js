var Phone = (function(my) {

    my.isVisible = function() {
        return $('#siphone').is(':visible');
    };

    my.open = function() {

	var button = $("#sipCallButton > a");

	$("#siphone" ).html('<iframe style="height: 100%;width:100%" src="phone/index.html?room=' + Strophe.getNodeFromJid(roomName) + '" id="sipPhoneDiv"></iframe>');			
	$("#siphone").css({display: "block"});			

	button.addClass("glow");   
    
    };
    
    my.close = function() {

	var button = $("#sipCallButton > a");
	
	$("#siphone").css({display: "none"});	
	$("#siphone" ).html('&nbsp;');
	
	button.removeClass("glow");	
    };    
    
    return my;
}(Phone || {}));
