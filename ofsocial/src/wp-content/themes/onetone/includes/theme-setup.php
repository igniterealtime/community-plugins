<?php


function onetone_setup(){
	global $content_width;
	$lang = get_template_directory(). '/languages';
	load_theme_textdomain('onetone', $lang);
	add_theme_support( 'post-thumbnails' ); 
	$args = array();
	$header_args = array( 
	    'default-image'          => '',
		 'default-repeat' => 'repeat',
        'default-text-color'     => 'CC9966',
        'width'                  => 1120,
        'height'                 => 80,
        'flex-height'            => true
     );
	
	// Enable support for Post Formats.
	add_theme_support( 'post-formats', array( 'aside', 'image', 'video', 'quote', 'link', 'gallery', 'status', 'audio' ) );
	
	add_theme_support( 'custom-background', $args );
	add_theme_support( 'custom-header', $header_args );
	add_theme_support( 'automatic-feed-links' );
	add_theme_support('nav_menus');
	add_theme_support( "title-tag" );
	register_nav_menus( array(
							  'primary' => __( 'Primary Menu', 'onetone' ),
							  'home_menu' => __( 'Home Page Header Menu', 'onetone' ),
							  'top_bar_menu' => __( 'Top Bar Menu', 'onetone' ),
											  
											  ));

	add_editor_style("editor-style.css");
	if ( ! isset( $content_width ) ) $content_width = 1120;
	
}

add_action( 'after_setup_theme', 'onetone_setup' );



 function onetone_custom_scripts(){
	 global $page_meta,$post,$active_magee_shortcodes ;
	 if($post){
	$page_meta = get_post_meta( $post->ID ,'_onetone_post_meta');
	}
	
	if( isset($page_meta[0]) && $page_meta[0]!='' )
	$page_meta = @json_decode( $page_meta[0],true );
	
    $theme_info = wp_get_theme();
	$detect = new Mobile_Detect;
	
	
	wp_enqueue_style('Yanone-Kaffeesatz', esc_url('//fonts.googleapis.com/css?family=Open+Sans:300,400,700|Yanone+Kaffeesatz'), false, '', false );
    wp_enqueue_style('onetone-font-awesome',  get_template_directory_uri() .'/plugins/font-awesome/css/font-awesome.min.css', false, '4.3.0', false);
	wp_enqueue_style('onetone-bootstrap',  get_template_directory_uri() .'/plugins/bootstrap/css/bootstrap.min.css', false, '3.3.4', false);
	wp_enqueue_style('onetone-owl-carousel',  get_template_directory_uri() .'/css/owl.carousel.css', false, '1.3.3', false);
	wp_enqueue_style('onetone-owl-theme',  get_template_directory_uri() .'/css/owl.theme.css', false, '1.3.3', false);
	wp_enqueue_style('prettyPhoto',  get_template_directory_uri() .'/css/prettyPhoto.css', false, '3.1.5', false);
	
	if( !onetone_is_plugin_active('magee-shortcodes/Magee.php') ){
     wp_enqueue_style('onetone-shortcodes',  get_template_directory_uri() .'/css/shortcode.css', false, $theme_info->get( 'Version' ), false);
    }
	
	wp_enqueue_style( 'onetone-main', get_stylesheet_uri(), array(), $theme_info->get( 'Version' ) );
	
	wp_enqueue_style('onetone-onetone',  get_template_directory_uri() .'/css/onetone.css', false, $theme_info->get( 'Version' ), false);
	wp_enqueue_style('onetone-ms',  get_template_directory_uri() .'/css/onetone-ms.css', false, $theme_info->get( 'Version' ), false);
	wp_enqueue_style('onetone-scheme',  get_template_directory_uri() .'/css/scheme.less', false, $theme_info->get( 'Version' ), false);
	
	
   $background_array  = onetone_option("page_background");
   $background        = onetone_get_background($background_array);
   $header_image      = get_header_image();
   $onetone_custom_css = "";
	if (isset($header_image) && ! empty( $header_image )) {
	$onetone_custom_css .= ".home-header{background:url(".$header_image. ") repeat;}\n";
	}
    if ( 'blank' != get_header_textcolor() && '' != get_header_textcolor() ){
     $header_color        =  ' color:#' . get_header_textcolor() . ';';
	 $onetone_custom_css .=  'header .site-name,header .site-description,header .site-tagline{'.$header_color.'}';
		}
	else{
	$onetone_custom_css .=  'header .site-name,header .site-description,header .site-tagline{display:none;}';	
		
		}
	$custom_css           =  onetone_option("custom_css");
	$onetone_custom_css  .=  '.site{'.$background.'}';
	
	$links_color = onetone_option( 'links_color','#963');
	
	//scheme
	$primary_color = esc_attr(onetone_option('primary_color',$links_color));

	
	
	$links_color = onetone_option( 'links_color');
	
	//if($links_color == "" || $links_color == null)
	//$links_color = "#963";
	if($links_color )
	$onetone_custom_css  .=  'a{color:'.$links_color.';}';


	$top_menu_font_color = onetone_option( 'font_color');
	if($top_menu_font_color !="" && $top_menu_font_color!=null){
		$onetone_custom_css  .=  'header .site-nav > ul > li > a {color:'.$top_menu_font_color.'}';
		}
		
	// header
	$sticky_header_background_color    = esc_attr(onetone_option('sticky_header_background_color',''));
    $sticky_header_background_opacity  = esc_attr(onetone_option('sticky_header_background_opacity','1')); 
	$header_background_color           = esc_attr(onetone_option('header_background_color',''));
    $header_background_opacity         = esc_attr(onetone_option('header_background_opacity','1')); 
	$header_border_color               = esc_attr(onetone_option('header_border_color','')); 
	$page_title_bar_background_color   = esc_attr(onetone_option('page_title_bar_background_color','')); 
	$page_title_bar_borders_color      = esc_attr(onetone_option('page_title_bar_borders_color','')); 
	
	// sticky header background
	if($sticky_header_background_color){
		$rgb = onetone_hex2rgb( $sticky_header_background_color );
	    $onetone_custom_css .= ".fxd-header {
		background-color: rgba(".$rgb[0].",".$rgb[1].",".$rgb[2].",".$sticky_header_background_opacity.");
		}";
		
		}
		
		// main header background
	if( $header_background_color ){
		$rgb = onetone_hex2rgb( $header_background_color );
	    $onetone_custom_css .= ".main-header {
		background-color: rgba(".$rgb[0].",".$rgb[1].",".$rgb[2].",".$header_background_opacity.");
		}";
		
		}
	
	// sticky header
  
	$sticky_header_opacity               =  onetone_option('sticky_header_background_opacity','1');
	$sticky_header_menu_item_padding     =  onetone_option('sticky_header_menu_item_padding','');
	$sticky_header_navigation_font_size  =  onetone_option('sticky_header_navigation_font_size','');
	$sticky_header_logo_width            =  onetone_option('sticky_header_logo_width','');
	$logo_left_margin                    =  onetone_option('logo_left_margin','');
	$logo_right_margin                   =  onetone_option('logo_right_margin','');
	$logo_top_margin                     =  onetone_option('logo_top_margin','');
	$logo_bottom_margin                  =  onetone_option('logo_bottom_margin','');
		
	if( $sticky_header_background_color ){
		$rgb = onetone_hex2rgb( $sticky_header_background_color );
	    $onetone_custom_css .= ".fxd-header{background-color: rgba(".$rgb[0].",".$rgb[1].",".$rgb[2].",".esc_attr($sticky_header_opacity).");}\r\n";
		
	}
	
	
    if( $sticky_header_menu_item_padding )
	$onetone_custom_css .= ".fxd-header .site-nav > ul > li > a {padding:".absint($sticky_header_menu_item_padding)."px;}\r\n";
	if( $sticky_header_navigation_font_size )
	$onetone_custom_css .= ".fxd-header .site-nav > ul > li > a {font-size:".absint($sticky_header_navigation_font_size)."px;}\r\n";
	if( $sticky_header_logo_width )
	$onetone_custom_css .= ".fxd-header img.site-logo{ width:".absint($sticky_header_logo_width)."px;}\r\n";
	
	if( $logo_left_margin )
	$onetone_custom_css .= ".fxd-header img.site-logo{ margin-left:".absint($logo_left_margin)."px;}\r\n";
	if( $logo_right_margin )
	$onetone_custom_css .= ".fxd-header img.site-logo{ margin-right:".absint($logo_right_margin)."px;}\r\n";
	if( $logo_top_margin )
	$onetone_custom_css .= ".fxd-header img.site-logo{ margin-top:".absint($logo_top_margin)."px;}\r\n";
	if( $logo_bottom_margin )
	$onetone_custom_css .= ".fxd-header img.site-logo{ margin-bottom:".absint($logo_bottom_margin)."px;}\r\n";
	
	
	// top bar
	$display_top_bar             = onetone_option('display_top_bar','yes');
	$top_bar_background_color    = onetone_option('top_bar_background_color','');
	$top_bar_info_color          = onetone_option('top_bar_info_color','');
	$top_bar_menu_color          = onetone_option('top_bar_menu_color','');
	
	if( $top_bar_background_color )
	$onetone_custom_css .= ".top-bar{background-color:".$top_bar_background_color.";}";
	
	if( $display_top_bar == 'yes' )
	$onetone_custom_css .= ".top-bar{display:block;}";
	
	if( $top_bar_info_color  )
	$onetone_custom_css .= ".top-bar-info{color:".$top_bar_info_color.";}";
	
	if( $top_bar_menu_color  )
	$onetone_custom_css .= ".top-bar ul li a{color:".$top_bar_menu_color.";}";
	
	// Header background
    $header_background_image     = onetone_option('header_background_image','');
	$header_background_full      = onetone_option('header_background_full','');
	$header_background_repeat    = onetone_option('header_background_repeat','');
	$header_background_parallax  = onetone_option('header_background_parallax','');
	
	$header_background       = '';
	if( $header_background_image ){
		$header_background  .= "header .main-header{\r\n";
		
	    $header_background  .= "background-image: url(".esc_url($header_background_image).");\r\n";
		if( $header_background_full == 'yes' )
		$header_background  .= "-webkit-background-size: cover;
								-moz-background-size: cover;
								-o-background-size: cover;
								background-size: cover;\r\n";
	   if( $header_background_parallax  == 'no' )		
	   $header_background  .=  "background-repeat:".$header_background_repeat.";";
	   if( $header_background_parallax  == 'yes' )
	   $header_background  .= "background-attachment: fixed;
		                       background-position:top center;
							   background-repeat: no-repeat;";
	   
								
        $header_background  .= "}\r\n";	
	}
	
	
	$onetone_custom_css .= $header_background;
	
	// Header  Padding
	$header_top_padding     = onetone_option('header_top_padding','');
	$header_bottom_padding  = onetone_option('header_bottom_padding','');
	
	if( $header_top_padding )
	$onetone_custom_css .= ".site-nav > ul > li > a{padding-top:".$header_top_padding."}";
	
	if( $header_bottom_padding )
	$onetone_custom_css .= ".site-nav > ul > li > a{padding-bottom:".$header_bottom_padding."}";
	
	//background 
	$content_background_color          = esc_attr(onetone_option('content_background_color',''));
	$sidebar_background_color          = esc_attr(onetone_option('sidebar_background_color',''));
	$footer_background_color           = esc_attr(onetone_option('footer_background_color',''));
	$copyright_background_color        = esc_attr(onetone_option('copyright_background_color',''));
		
	// content backgroud color
		
    if( $content_background_color )
	 $onetone_custom_css  .= ".col-main {background-color:".$content_background_color.";}";
	 
	if( $sidebar_background_color )
	$onetone_custom_css  .= ".col-aside-left,.col-aside-right {background-color:".$sidebar_background_color.";}";
	
	//footer background
	if( $footer_background_color )
	 $onetone_custom_css  .= "footer .footer-widget-area{background-color:".$footer_background_color.";}";
	 
	 if( $copyright_background_color )
	 $onetone_custom_css  .= "footer .footer-info-area{background-color:".$copyright_background_color."}";
	 
		
	// Element Colors
	
	$footer_widget_divider_color       = esc_attr(onetone_option('footer_widget_divider_color',''));
	$form_background_color             = esc_attr(onetone_option('form_background_color',''));
	$form_text_color                   = esc_attr(onetone_option('form_text_color',''));
	$form_border_color                 = esc_attr(onetone_option('form_border_color',''));
	

	if( $footer_widget_divider_color )
	$onetone_custom_css  .= ".footer-widget-area .widget-box li{\r\nborder-color:".$footer_widget_divider_color.";}";
	
	if( $form_background_color )
	$onetone_custom_css  .= "footer input,footer textarea{background-color:".$form_background_color.";}";
	
	if( $form_text_color )
	$onetone_custom_css  .= "footer input,footer textarea{color:".$form_text_color.";}";
	
	if( $form_border_color )
	$onetone_custom_css  .= "footer input,footer textarea{border-color:".$form_border_color.";}";
	
	
	//Layout Options
	
	$page_content_top_padding          = esc_attr(onetone_option('page_content_top_padding',''));
	$page_content_bottom_padding       = esc_attr(onetone_option('page_content_bottom_padding',''));
	$hundredp_padding                  = esc_attr(onetone_option('hundredp_padding',''));
	$sidebar_padding                   = esc_attr(onetone_option('sidebar_padding',''));
	$column_top_margin                 = esc_attr(onetone_option('column_top_margin',''));
	$column_bottom_margin              = esc_attr(onetone_option('column_bottom_margin',''));
	
	if( $page_content_top_padding )
	$onetone_custom_css  .= ".post-inner,.page-inner{padding-top:".$page_content_top_padding.";}";
	if( $page_content_bottom_padding )
	$onetone_custom_css  .= ".post-inner,.page-inner{padding-bottom:".$page_content_bottom_padding.";}";
	
	if( isset($page_meta['padding_top']) && $page_meta['padding_top'] !='' )
	$onetone_custom_css  .= ".post-inner,.page-inner{padding-top:".esc_attr($page_meta['padding_top']).";}";
	if( isset($page_meta['padding_bottom']) && $page_meta['padding_bottom'] !='' )
	$onetone_custom_css  .= ".post-inner,.page-inner{padding-bottom:".esc_attr($page_meta['padding_bottom']).";}";
	
	
	
	if( $sidebar_padding )
	$onetone_custom_css  .= ".col-aside-left,.col-aside-right{padding:".$sidebar_padding.";}";
	if( $column_top_margin )
	$onetone_custom_css  .= ".col-lg-1, .col-lg-10, .col-lg-11, .col-lg-12, .col-lg-2, .col-lg-3, .col-lg-4, .col-lg-5, .col-lg-6, .col-lg-7, .col-lg-8, .col-lg-9, .col-md-1, .col-md-10, .col-md-11, .col-md-12, .col-md-2, .col-md-3, .col-md-4, .col-md-5, .col-md-6, .col-md-7, .col-md-8, .col-md-9, .col-sm-1, .col-sm-10, .col-sm-11, .col-sm-12, .col-sm-2, .col-sm-3, .col-sm-4, .col-sm-5, .col-sm-6, .col-sm-7, .col-sm-8, .col-sm-9, .col-xs-1, .col-xs-10, .col-xs-11, .col-xs-12, .col-xs-2, .col-xs-3, .col-xs-4, .col-xs-5, .col-xs-6, .col-xs-7, .col-xs-8, .col-xs-9{margin-top:".$column_top_margin.";}";
	
	if( $column_bottom_margin )
	$onetone_custom_css  .= ".col-lg-1, .col-lg-10, .col-lg-11, .col-lg-12, .col-lg-2, .col-lg-3, .col-lg-4, .col-lg-5, .col-lg-6, .col-lg-7, .col-lg-8, .col-lg-9, .col-md-1, .col-md-10, .col-md-11, .col-md-12, .col-md-2, .col-md-3, .col-md-4, .col-md-5, .col-md-6, .col-md-7, .col-md-8, .col-md-9, .col-sm-1, .col-sm-10, .col-sm-11, .col-sm-12, .col-sm-2, .col-sm-3, .col-sm-4, .col-sm-5, .col-sm-6, .col-sm-7, .col-sm-8, .col-sm-9, .col-xs-1, .col-xs-10, .col-xs-11, .col-xs-12, .col-xs-2, .col-xs-3, .col-xs-4, .col-xs-5, .col-xs-6, .col-xs-7, .col-xs-8, .col-xs-9{margin-bottom:".$column_bottom_margin.";}";
	
	
	//fonts color
	
	$header_tagline_color              = esc_attr(onetone_option('header_tagline_color',''));
	$page_title_color                  = esc_attr(onetone_option('page_title_color',''));
	$h1_color                          = esc_attr(onetone_option('h1_color',''));
	$h2_color                          = esc_attr(onetone_option('h2_color',''));
	$h3_color                          = esc_attr(onetone_option('h3_color',''));
	$h4_color                          = esc_attr(onetone_option('h4_color',''));
	$h5_color                          = esc_attr(onetone_option('h5_color',''));
	$h6_color                          = esc_attr(onetone_option('h6_color',''));
	$body_text_color                   = esc_attr(onetone_option('body_text_color',''));
	$link_color                        = esc_attr(onetone_option('link_color',''));
	$breadcrumbs_text_color            = esc_attr(onetone_option('breadcrumbs_text_color',''));
	$sidebar_widget_headings_color     = esc_attr(onetone_option('sidebar_widget_headings_color',''));
	$footer_headings_color             = esc_attr(onetone_option('footer_headings_color',''));
	$footer_text_color                 = esc_attr(onetone_option('footer_text_color',''));
	$footer_link_color                 = esc_attr(onetone_option('footer_link_color',''));
	
	if( $header_tagline_color )
	$onetone_custom_css  .= ".site-tagline{color:".$header_tagline_color.";}";
	if( $page_title_color )
	$onetone_custom_css  .= ".page-title h1{color:".$page_title_color.";}";
	if( $h1_color )
	$onetone_custom_css  .= "h1{color:".$h1_color.";}";
	if( $h2_color )
	$onetone_custom_css  .= "h2{color:".$h2_color.";}";
	if( $h3_color )
	$onetone_custom_css  .= "h3{color:".$h3_color.";}";
	if( $h4_color )
	$onetone_custom_css  .= "h4{color:".$h4_color.";}";
	if( $h5_color )
	$onetone_custom_css  .= "h5{color:".$h5_color.";}";
	if( $h6_color )
	$onetone_custom_css  .= "h6{color:".$h6_color.";}";
	if( $body_text_color )
	$onetone_custom_css  .= ".entry-content,.entry-content p{color:".$body_text_color.";}";
	if( $link_color )
	$onetone_custom_css  .= ".entry-summary a, .entry-content a{color:".$link_color.";}";
	if( $breadcrumbs_text_color )
	$onetone_custom_css  .= ".breadcrumb-nav span,.breadcrumb-nav a{color:".$breadcrumbs_text_color.";}";
	if( $sidebar_widget_headings_color )
	$onetone_custom_css  .= ".col-aside-left .widget-title,.col-aside-right .widget-title{color:".$sidebar_widget_headings_color.";}";
	if( $footer_headings_color )
	$onetone_custom_css  .= ".footer-widget-area .widget-title{color:".$footer_headings_color.";}";
	if( $footer_text_color )
	$onetone_custom_css  .= ".footer-widget-area,.footer-widget-area p,.footer-widget-area span{color:".$footer_text_color.";}";
	if( $footer_link_color )
	$onetone_custom_css  .= ".footer-widget-area a{color:".$footer_link_color.";}";
	
	//Main Menu Colors 
	$main_menu_background_color_1   = esc_attr(onetone_option('main_menu_background_color_1',''));
	$main_menu_font_color_1         = esc_attr(onetone_option('main_menu_font_color_1',''));
	$main_menu_font_hover_color_1   = esc_attr(onetone_option('main_menu_font_hover_color_1',''));
	$main_menu_background_color_2   = esc_attr(onetone_option('main_menu_background_color_2',''));
	$main_menu_font_color_2         = esc_attr(onetone_option('main_menu_font_color_2',''));
	$main_menu_font_hover_color_2   = esc_attr(onetone_option('main_menu_font_hover_color_2',''));
	$main_menu_separator_color_2    = esc_attr(onetone_option('main_menu_separator_color_2',''));
	$woo_cart_menu_background_color = esc_attr(onetone_option('woo_cart_menu_background_color',''));
	if( $main_menu_background_color_1 )
	$onetone_custom_css  .= ".main-header{background-color:".$main_menu_background_color_1.";}";
	if( $main_menu_font_color_1 )
	$onetone_custom_css  .= "#menu-main > li > a {color:".$main_menu_font_color_1.";}";
	if( $main_menu_font_hover_color_1 )
	$onetone_custom_css  .= "#menu-main > li > a:hover{color:".$main_menu_font_hover_color_1.";}";
	if( $main_menu_background_color_2 )
	$onetone_custom_css  .= ".main-header .sub-menu{background-color:".$main_menu_background_color_2.";}";
	if( $main_menu_font_color_2 )
	$onetone_custom_css  .= "#menu-main  li li a{color:".$main_menu_font_color_2.";}";
	if( $main_menu_font_hover_color_2 )
	$onetone_custom_css  .= "#menu-main  li li a:hover{color:".$main_menu_font_hover_color_2.";}";
	if( $main_menu_separator_color_2 )
	$onetone_custom_css  .= ".site-nav  ul li li a{border-color:".$main_menu_separator_color_2." !important;}";
		
	
	$onetone_custom_css  .=  $custom_css;
	
	wp_add_inline_style( 'onetone-main', $onetone_custom_css );
	if(is_home()){
	wp_enqueue_script( 'onetone-bigvideo', get_template_directory_uri().'/plugins/jquery.tubular.1.0.js', array( 'jquery' ), '1.0', true );
	}
	wp_enqueue_script( 'onetone-bootstrap', get_template_directory_uri().'/plugins/bootstrap/js/bootstrap.min.js', array( 'jquery' ), '3.3.4 ', false );
    wp_enqueue_script( 'onetone-nav', get_template_directory_uri().'/plugins/jquery.nav.js', array( 'jquery' ), '1.4.14 ', false );
	wp_enqueue_script( 'onetone-scrollTo', get_template_directory_uri().'/plugins/jquery.scrollTo.js', array( 'jquery' ), '1.4.14 ', false );
	wp_enqueue_script( 'onetone-carousel', get_template_directory_uri().'/plugins/owl.carousel.js', array( 'jquery' ), '1.3.3', true );
	wp_enqueue_script( 'onetone-parallax', get_template_directory_uri().'/plugins/jquery.parallax-1.1.3.js', array( 'jquery' ), '1.1.3', true );
	wp_enqueue_script( 'onetone-respond', get_template_directory_uri().'/plugins/respond.min.js', array( 'jquery' ), '', true );
	wp_enqueue_script( 'onetone-less', get_template_directory_uri().'/plugins/less.min.js', array( 'jquery' ), '2.5.1', true );
	wp_enqueue_script( 'prettyPhoto', get_template_directory_uri().'/plugins/jquery.prettyPhoto.js', array( 'jquery' ), '3.1.5', true );
	wp_enqueue_script( 'onetone-default', get_template_directory_uri().'/js/onetone.js', array( 'jquery' ),$theme_info->get( 'Version' ), true );
	
	if ( is_singular() && comments_open() && get_option( 'thread_comments' ) ){wp_enqueue_script( 'comment-reply' );}
	
	$slide_time = onetone_option("slide_time");
	$slide_time = is_numeric($slide_time)?$slide_time:"5000";
	
	$isMobile = 0;
	if( $detect->isMobile() && !$detect->isTablet() ){
		$isMobile = 1;
		}
	
	$sticky_header    = esc_attr(onetone_option('enable_sticky_header','yes'));
	
	
	
	
	wp_localize_script( 'onetone-default', 'onetone_params', array(
			'ajaxurl'        => admin_url('admin-ajax.php'),
			'themeurl' => get_template_directory_uri(),
			'slideSpeed'  => $slide_time,
			'sticky_header' => $sticky_header,
			'isMobile' =>$isMobile,
			'primary_color' => $primary_color,
			
		)  );
	
	}
	
	function onetone_admin_scripts(){
		global $pagenow;
		$theme_info = wp_get_theme();
		wp_enqueue_script( 'onetone-admin', get_template_directory_uri().'/js/admin.js', array( 'jquery' ), $theme_info->get( 'Version' ), false );
		wp_enqueue_style( 'onetone-admin', get_template_directory_uri().'/css/admin.css', false, $theme_info->get( 'Version' ), false);
		if( $pagenow == "themes.php" && (isset($_GET['page']) && $_GET['page'] == "onetone-options")):
		
		wp_enqueue_style('onetone-font-awesome',  get_template_directory_uri() .'/plugins/font-awesome/css/font-awesome.min.css', false, '4.4.0', false);
		wp_enqueue_style('onetone-options',  get_template_directory_uri() .'/css/options.css', false, $theme_info->get( 'Version' ), false);
		endif;
		
		}
	

  add_action( 'wp_enqueue_scripts', 'onetone_custom_scripts' );
  add_action( 'admin_enqueue_scripts', 'onetone_admin_scripts' );



function onetone_of_get_options($default = false) {
	
	global $options_saved;
	$options_saved = false;
	//$optionsframework_settings = get_option(ONETONE_OPTIONS_PREFIXED.'optionsframework');
	
	// Gets the unique option id
	//$option_name = $optionsframework_settings['id'];
	
	$option_name  = optionsframework_option_name();
	
	if ( get_option($option_name) ) {
		$options = get_option($option_name);
		$options_saved = true;
	}
/*	else{
		
		 $location = apply_filters( 'options_framework_location', array('includes/admin-options.php') );

	        if ( $optionsfile = locate_template( $location ) ) {
				
	            $maybe_options = require_once $optionsfile;
	            if ( is_array( $maybe_options ) ) {
					$options = $maybe_options;
	            } else if ( function_exists( 'optionsframework_options' ) ) {
					$options = optionsframework_options();
				}
	        }
	    $options = apply_filters( 'of_options', $options );
		$config  =  $options;
		foreach ( (array) $config as $option ) {
			if ( ! isset( $option['id'] ) ) {
				continue;
			}
			if ( ! isset( $option['std'] ) ) {
				continue;
			}
			if ( ! isset( $option['type'] ) ) {
				continue;
			}
				$output[$option['id']] = apply_filters( 'of_sanitize_' . $option['type'], $option['std'], $option );
		}
		$options = $output;
		
		
		}*/
		
	if ( isset($options) ) {
		return $options;
	} else {
		return $default;
	}
}


global $onetone_options;
$onetone_options = onetone_of_get_options();


function onetone_option($name,$default=''){
	global $onetone_options;
	if(isset($onetone_options[$name]))
	return $onetone_options[$name];
	else
	return $default;
}

/* 
 * This is an example of how to add custom scripts to the options panel.
 * This one shows/hides the an option when a checkbox is clicked.
 */

add_action('optionsframework_custom_scripts', 'onetone_optionsframework_custom_scripts');

function onetone_optionsframework_custom_scripts() { 

}

add_filter('options_framework_location','onetone_options_framework_location_override');

function onetone_options_framework_location_override() {
	return array('includes/admin-options.php');
}

function onetone_optionscheck_options_menu_params( $menu ) {
	
	$menu['page_title'] = __( 'Onetone Options', 'onetone');
	$menu['menu_title'] = __( 'Onetone Options', 'onetone');
	$menu['menu_slug'] = 'onetone-options';
	return $menu;
}

add_filter( 'optionsframework_menu', 'onetone_optionscheck_options_menu_params' );

/*function onetone_wp_title( $title, $sep ) {
	global $paged, $page;
	if ( is_feed() )
		return $title;

	// Add the site name.
	$title .= get_bloginfo( 'name' );

	// Add the site description for the home/front page.
	$site_description = get_bloginfo( 'description', 'display' );
	if ( $site_description && ( is_home() || is_front_page() ) )
		$title = "$title $sep $site_description";

	// Add a page number if necessary.
	if ( $paged >= 2 || $page >= 2 )
		$title = "$title $sep " . sprintf( __( ' Page %s ', 'onetone' ), max( $paged, $page ) );

	return $title;
}
add_filter( 'wp_title', 'onetone_wp_title', 10, 2 );*/


function onetone_title( $title ) {
if ( $title == '' ) {
  return __( 'Untitled', 'onetone');
  } else {
  return $title;
  }
}
add_filter( 'the_title', 'onetone_title' );