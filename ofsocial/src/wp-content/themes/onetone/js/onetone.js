  ///// contact form
  
  function IsEmail(email) {
        var regex = /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        if(!regex.test(email)) {
           return false;
        }else{
           return true;
        }
      }
	  

	jQuery("form.contact-form #submit").click(function(){
	var obj = jQuery(this).parents(".contact-form");
	var Name    = obj.find("input#name").val();
	var Email   = obj.find("input#email").val();
	var Message = obj.find("textarea#message").val();
	var sendto  = obj.find("input#sendto").val();
	Name    = Name.replace('Name','');
	Email   = Email.replace('Email','');
	Message = Message.replace('Message','');
	if( !obj.find(".noticefailed").length ){
		obj.append('<div class="noticefailed"></div>');
		}
	obj.find(".noticefailed").text("");
   if( !IsEmail( Email ) ) {
	obj.find(".noticefailed").text("Please enter valid email.");
	return false;
	}
	if(Name ===""){
	obj.find(".noticefailed").text("Please enter your name.");
	return false;
	}
	if(Message === ""){
	obj.find(".noticefailed").text("Message is required.");
	return false;
	}
	obj.find(".noticefailed").html("");
	obj.find(".noticefailed").append("<img alt='loading' class='loading' src='"+onetone_params.themeurl+"/images/loading.gif' />");
	
	 jQuery.ajax({
				 type:"POST",
				 dataType:"json",
				 url:onetone_params.ajaxurl,
				 data:"Name="+Name+"&Email="+Email+"&Message="+Message+"&sendto="+sendto+"&action=onetone_contact",
				 success:function(data){ 
				     if(data.error==0){
						 obj.find(".noticefailed").addClass("noticesuccess").removeClass("noticefailed");
						 obj.find(".noticesuccess").html(data.msg);
						 }else{
							 obj.find(".noticefailed").html(data.msg);	
							 }
							 jQuery('.loading').remove();obj[0].reset();
					},
					error:function(){
						obj.find(".noticefailed").html("Error.");
						obj.find('.loading').remove();
						}
						});
	 });


  //top menu

	jQuery(".site-navbar,.home-navbar").click(function(){
				jQuery(".top-nav").toggle();
			});
	
  jQuery('.top-nav ul li').hover(function(){
	jQuery(this).find('ul:first').slideDown(100);
	jQuery(this).addClass("hover");
	},function(){
	jQuery(this).find('ul').css('display','none');
	jQuery(this).removeClass("hover");
	});
  jQuery('.top-nav li ul li:has(ul)').find("a:first").append(" <span class='menu_more'>»</span> ");
 
   jQuery(".top-nav > ul > li,.main-nav > li").click(function(){
	jQuery(".top-nav > ul > li,.main-nav > li").removeClass("active");
	jQuery(this).addClass("active");
    });
   
   //
     ////
  var windowWidth = jQuery(window).width(); 
  if(windowWidth > 939){
	  if(jQuery(".site-main .sidebar").height() > jQuery(".site-main .main-content").height()){
		  jQuery(".site-main .main-content").css("height",(jQuery(".site-main .sidebar").height()+140)+"px");
		  }
	}else{
		jQuery(".site-main .main-content").css("height","auto");
		}
	jQuery(window).resize(function() {
	var windowWidth = jQuery(window).width(); 
	 if(windowWidth > 939){
	  if(jQuery(".site-main .sidebar").height() > jQuery(".site-main .main-content").height()){
		  jQuery(".site-main .main-content").css("height",(jQuery(".site-main .sidebar").height()+140)+"px");
		  }
	}		else{
		jQuery(".site-main .main-content").css("height","auto");
		}	
		
		if(windowWidth > 919){
			jQuery(".top-nav").show();
		}else{
			jQuery(".top-nav").hide();
			}
		
  });

// sticky menu

(function($){
	$.fn.sticky = function( options ) {
		// adding a class to users div
		$(this).addClass('sticky-header');
		var settings = $.extend({
            'scrollSpeed '  : 500
            }, options);


   ////// get homepage sections
	var sections = [];
				jQuery(".top-nav .onetone-menuitem > a").each(function() {
				linkHref =  $(this).attr('href').split('#')[1];
				$target =  $('#' + linkHref);
 
				if($target.length) {
					topPos = $target.offset().top;
					sections[linkHref] = Math.round(topPos);
				
					
				}
			});
				
		//////////		
				
		return $('.sticky-header .home-navigation ul li.onetone-menuitem a').each( function() {
			
			if ( settings.scrollSpeed ) {

				var scrollSpeed = settings.scrollSpeed

			}
			
			
 if( $("body.admin-bar").length){
		if( $(window).width() < 765) {
				stickyTop = 46;
				
			} else {
				stickyTop = 32;
			}
	  }
	  else{
		  stickyTop = 0;
		  }
		  $(this).css({'top':stickyTop});

			var stickyMenu = function(){

				var scrollTop = $(window).scrollTop(); 
				if (scrollTop > stickyTop) { 
					$('.sticky-header').css({ 'position': 'fixed'}).addClass('fxd');
					} else {
						$('.sticky-header').css({ 'position': 'static' }).removeClass('fxd'); 
					}   
					
			//// set nav menu active status
			var returnValue = null;
			var windowHeight = Math.round($(window).height() * 0.3);

			for(var section in sections) {
				
				if((sections[section] - windowHeight) < scrollTop) {
					position = section;
					
				}
			}
			 
          if( typeof position !== "undefined" && position !== null ) {
			 
				jQuery(".home-navigation .onetone-menuitem ").removeClass("current");
			    jQuery(".home-navigation .onetone-menuitem ").find('a[href$="#' + position + '"]').parent().addClass("current");;
		  }

        ////
			};
			stickyMenu();
			$(window).scroll(function() {
				 stickyMenu();
			});
			  $(this).on('click', function(e){
				var selectorHeight = $('.sticky-header').height();   
				e.preventDefault();
		 		var id = $(this).attr('href');
				if(typeof $('section'+ id).offset() !== 'undefined'){
				if( $("header").css("position") === "static")
				goTo = $(id).offset().top  - 2*selectorHeight;
				else
				 goTo = $(id).offset().top - selectorHeight;
				 
				$("html, body").animate({ scrollTop: goTo }, scrollSpeed);
				}

			});	
					
		});

	}

})(jQuery);

//slider
 if(jQuery("section.homepage-slider").length){
 jQuery("#onetone-owl-slider").owlCarousel({
	navigation : false, // Show next and prev buttons
	slideSpeed : 300,
	paginationSpeed : 400,
	singleItem:true,
	autoPlay:parseInt(onetone_params.slideSpeed)
 
});
}

jQuery(document).ready(function($){
								
 $(".site-nav-toggle").click(function(){
                $(".site-nav").toggle();
            });
 // retina logo
if( window.devicePixelRatio > 1 ){
	if($('.normal_logo').length && $('.retina_logo').length){
		$('.normal_logo').hide();
		$('.retina_logo').show();
		}
	//
	$('.page-title-bar').addClass('page-title-bar-retina');
	
	}
	
//video background
								
if(typeof onetone_bigvideo !== 'undefined' && onetone_bigvideo!=null){
for(var i=0;i<onetone_bigvideo.length;i++){
$(onetone_bigvideo[i].video_section_item).tubular(onetone_bigvideo[i].options);
   }
  }
  
  $(".homepage section.section").each(function(){
	if($(this).find("#tubular-container").length > 0){
		$(this).css({"height":(jQuery(window).height()-$("header").height())+"px"});
		$(this).find("#tubular-container,#tubular-player").css({"height":(jQuery(window).height()-$("header").height())+"px"});
		}						
 });
 $(".play-video").on("click", function(){
        var video = $(this).parents('section.section').find('video')[0];
        video.play();
        $(".play-video").hide();
    });
// BACK TO TOP 											
 $(window).scroll(function(){
		if($(window).scrollTop() > 200){
			$("#back-to-top").fadeIn(200);
		} else{
			$("#back-to-top").fadeOut(200);
		}
	});
	
  	$('#back-to-top, .back-to-top').click(function() {
		  $('html, body').animate({ scrollTop:0 }, '800');
		  return false;
	});
	
/* ------------------------------------------------------------------------ */
/* parallax background image 										  	    */
/* ------------------------------------------------------------------------ */
 $('.onetone-parallax').parallax("50%", 0.1);

// parallax scrolling
if( $('.parallax-scrolling').length ){
	$('.parallax-scrolling').parallax({speed : 0.15});
	}

/* ------------------------------------------------------------------------ */
/*  sticky header             	  								  	    */
/* ------------------------------------------------------------------------ */
	
jQuery(window).scroll(function(){
							   
		if(jQuery("body.admin-bar").length){
		if(jQuery(window).width() < 765) {
				stickyTop = 46;
				
			} else {
				stickyTop = 32;
			}
	  }
	  else{
		        stickyTop = 0;
		  }
		  var scrollTop = $(window).scrollTop(); 
				if (scrollTop > stickyTop) { 
				    $('.fxd-header').css({'top':stickyTop}).show();
					$('header').addClass('fixed-header');
				}else{
					$('.fxd-header').hide();
					$('header').removeClass('fixed-header');
					}
 });
 	
// scheme
 if( typeof onetone_params.primary_color !== 'undefined' && onetone_params.primary_color !== '' ){
 less.modifyVars({
        '@color-main': onetone_params.primary_color
    });
   }
   
/* ------------------------------------------------------------------------ */
/*  sticky header             	  								  	    */
/* ------------------------------------------------------------------------ */
 $(document).on('click', "header .main-header .site-nav ul a[href^='#'],a.scroll",function(e){
				if($("body.admin-bar").length){
				  if($(window).width() < 765) {
						  stickyTop = 46;
					  } else {
						  stickyTop = 32;
					  }
				}
				else{
						  stickyTop = 0;
					}
					
					if($(window).width() <= 919) {
					$(".site-nav").hide();
					}
					
				var selectorHeight = 0;
                if( $('.fxd-header').length )
			    var selectorHeight = $('.fxd-header').height();  

				var scrollTop = $(window).scrollTop(); 
				e.preventDefault();
		 		var id = $(this).attr('href');
				if(typeof $(id).offset() !== 'undefined'){
	
				     var goTo = $(id).offset().top - 2*selectorHeight - stickyTop  + 1;
				     $("html, body").animate({ scrollTop: goTo }, 1000);
				}

			});	
 $('header .fxd-header .site-nav ul').onePageNav({filter: 'a[href^="#"]',scrollThreshold:0.3});	
  //prettyPhoto
 $("a[rel^='portfolio-image']").prettyPhoto();	 
 // gallery lightbox
 $(".gallery .gallery-item a").prettyPhoto({animation_speed:'fast',slideshow:10000, hideflash: true});

 });