<?php
/**
 * A unique identifier is defined to store the options in the database and reference them from the theme.
 */
function optionsframework_option_name() {

	$themename = get_option( 'stylesheet' );
	$themename = preg_replace("/\W/", "_", strtolower($themename) );

	if( is_child_theme() ){	
		$themename = str_replace("_child","",$themename ) ;
		}
	if( defined('ICL_LANGUAGE_CODE') && ICL_LANGUAGE_CODE != 'en' )
	$themename = $themename.ICL_LANGUAGE_CODE;
	
	return $themename;
}

global $social_icons;

$social_icons = array(
			array('title'=>'Facebook','icon' => 'facebook', 'link'=>'#'),
			array ('title'=>'Twitter','icon' => 'twitter', 'link'=>'#'), 
			array('title'=>'LinkedIn','icon' => 'linkedin', 'link'=>'#'),
			array  ('title'=>'YouTube','icon' => 'youtube', 'link'=>'#'),
			array('title'=>'Skype','icon' => 'skype', 'link'=>'#'),
			array ('title'=>'Pinterest','icon' => 'pinterest', 'link'=>'#'),
			array('title'=>'Google+','icon' => 'google-plus', 'link'=>'#'),
			array('title'=>'Email','icon' => 'envelope', 'link'=>'#'),
			array ('title'=>'RSS','icon' => 'rss', 'link'=>'#')
        );



/**
 * Defines an array of options that will be used to generate the settings page and be saved in the database.
 * When creating the 'id' fields, make sure to use all lowercase and no spaces.
 *
 */


function optionsframework_options() {
     global $social_icons,$sidebars;
	 
	 $os_fonts        = onetone_options_typography_get_os_fonts();
    $os_fonts        = array_merge(array('' => __( '-- Default --', 'onetone' ) ), $os_fonts);
	$font_color         = array('color' =>  '');
	$section_font_color = array('color' => '');
 
    $section_title_typography_defaults_1 = array(
		'size'  => '36px',
		'face'  => '',
		'style' => '700',
		'color' => '#666666' );
		
		$section_content_typography_defaults_1 = array(
		'size'  => '14px',
		'face'  => '',
		'style' => '400',
		'color' => '#666666' );
		
		$typography_options = array(
		'sizes'  => array( '10','11','12','13','14','16','18','20','24','26','28','30','35','36','38','40','46','48','50','60' ),
		'faces'  => $os_fonts,
		'styles' => array(
				  'normal' =>  'normal',
				  'italic' => 'italic', 
				  'bold' => 'bold',
				  'bold italic' => 'bold italic',
				  '100' => '100', 
				  '200' =>  '200',
				  '300' => '300',
				  '400' => '400', 
				  '500' =>  '500', 
				  '600' =>  '600', 
				  '700' =>  '700', 
				  '800' =>  '800',
				  '900' =>  '900' 
				  ),
		
		'color'  => true );
    
	$choices =  array( 
          
            'yes'   => __( 'Yes', 'onetone' ),
            'no' => __( 'No', 'onetone' )
 
        );
	$choices2 =  array( 
          
            '1'   => __( 'Yes', 'onetone' ),
            '0' => __( 'No', 'onetone' )
 
        );
    $choices_reverse =  array( 
          
           'no'=> __( 'No', 'onetone' ),
            'yes' => __( 'Yes', 'onetone' )
         
        );
	$align =  array( 
          '' => __( 'Default', 'onetone' ),
          'left' => __( 'left', 'onetone' ),
          'right' => __( 'right', 'onetone' ),
           'center'  => __( 'center', 'onetone' )         
        );
	$repeat = array( 
			
			'repeat' => __( 'repeat', 'onetone' ),
			'repeat-x'  => __( 'repeat-x', 'onetone' ),
			'repeat-y' => __( 'repeat-y', 'onetone' ),
			'no-repeat'  => __( 'no-repeat', 'onetone' )
			
		  );
	
	$position =  array( 
			
		   'top left' => __( 'top left', 'onetone' ),
			'top center' => __( 'top center', 'onetone' ),
			'top right' => __( 'top right', 'onetone' ),
			 'center left' => __( 'center left', 'onetone' ),
			 'center center'  => __( 'center center', 'onetone' ),
			 'center right' => __( 'center right', 'onetone' ),
			 'bottom left'  => __( 'bottom left', 'onetone' ),
			 'bottom center'  => __( 'bottom center', 'onetone' ),
			 'bottom right' => __( 'bottom right', 'onetone' )
			  
		  );
  
    $opacity             =  array_combine(range(0.1,1,0.1), range(0.1,1,0.1));
    $font_size           =  array_combine(range(1,100,1), range(1,100,1));
	$section_title       = array("","","","GALLERY","OUR TEAM","ABOUT","TESTIMONIALS","","CONTACT");
	$section_menu        = array("Home","","Services","Gallery","Team","About","Testimonials","","Contact");
	$section_slug        = array('home','','services','gallery','team','about','testimonials','','contact');
	$section_padding     = array('','30px 0','50px 0','50px 0','50px 0','50px 0','10px 0 50px','50px 0','50px 0');
	$text_align          = array('center','left','center','center','center','left','center','left','center');
	
	$default_section_num = count($section_menu);
	$section_num         = onetone_option('section_num',9);
	$section_background  = array(
	     array(
		'color' => '',
		'image' => ONETONE_THEME_BASE_URL.'/images/home-bg01.jpg',
		'repeat' => 'repeat',
		'position' => 'top left',
		'attachment'=>'scroll' ),
		 array(
		'color' => '#eeeeee',
		'image' => '',
		'repeat' => 'repeat',
		'position' => 'top left',
		'attachment'=>'scroll' ),
		 array(
		'color' => '#ffffff',
		'image' => '',
		'repeat' => 'repeat',
		'position' => 'top left',
		'attachment'=>'scroll' ),
		 array(
		'color' => '#eeeeee',
		'image' => '',
		'repeat' => 'repeat',
		'position' => 'top left',
		'attachment'=>'scroll' ),
		 ##  section 5
		 array(
		'color' => '#ffffff',
		'image' => '',
		'repeat' => 'repeat',
		'position' => 'top left',
		'attachment'=>'scroll' ),
		 array(
		'color' => '',
		'image' => esc_url('http://www.mageewp.com/onetone/wp-content/uploads/sites/17/2015/11/banner_large.jpg'),
		'repeat' => 'repeat',
		'position' => 'top left',
		'attachment'=>'scroll' ),
		 array(
		'color' => '#eda869',
		'image' => esc_url('http://www.mageewp.com/onetone/wp-content/uploads/sites/17/2015/11/123.jpg'),
		'repeat' => 'no-repeat',
		'position' => 'bottom center',
		'attachment'=>'scroll' ),
		 array(
		'color' => '#ffffff',
		'image' => '',
		'repeat' => 'repeat',
		'position' => 'top left',
		'attachment'=>'scroll' ),
		 
		  array(
		'color' => '',
		'image' => esc_url('http://www.mageewp.com/onetone/wp-content/uploads/sites/17/2015/11/last4.jpg'),
		'repeat' => 'repeat',
		'position' => 'top left',
		'attachment'=>'scroll' )
		 
		 
		 
			);
	$section_css_class = array("section-banner","","","","","","","","");
	
	
	$section_title_typography_defaults = array(
      array('size'  => '48px','face'  => '','style' => 'normal','color' => '#666666' ),
	  array('size'  => '48px','face'  => '','style' => 'normal','color' => '#666666' ),
	  array('size'  => '48px','face'  => '','style' => 'normal','color' => '#666666' ),
	  array('size'  => '36px','face'  => '','style' => 'bold','color' => '#666666' ),
	  array('size'  => '36px','face'  => '','style' => 'bold','color' => '#666666' ),
	  array('size'  => '36px','face'  => '','style' => 'bold','color' => '#ffffff' ),
	  array('size'  => '36px','face'  => '','style' => 'bold','color' => '#ffffff' ),
	  array('size'  => '36px','face'  => '','style' => 'bold','color' => '#666666' ),
	  array('size'  => '36px','face'  => '','style' => 'bold','color' => '#666666' ),
											   
         );
	
		$section_content_typography_defaults = array(
          array('size'  => '14px','face'  => '','style' => 'normal','color' => '#666666' ),
		  array('size'  => '14px','face'  => '','style' => 'normal','color' => '#666666' ),
		  array('size'  => '14px','face'  => '','style' => 'normal','color' => '#666666' ),
		  array('size'  => '14px','face'  => '','style' => 'normal','color' => '#666666' ),
		  array('size'  => '14px','face'  => '','style' => 'normal','color' => '#666666' ),
		  array('size'  => '14px','face'  => '','style' => 'normal','color' => '#ffffff' ),
		  array('size'  => '14px','face'  => '','style' => 'normal','color' => '#ffffff' ),
		  array('size'  => '14px','face'  => '','style' => 'normal','color' => '#666666' ),
		  array('size'  => '14px','face'  => '','style' => 'normal','color' => '#666666' ),
		  array('size'  => '14px','face'  => '','style' => 'normal','color' => '#666666' ),
													 
          );
		
	
	
	$section_content   = array('<div class="banner-box">

&nbsp;
<h1>Powerful One page Theme</h1>
<div class="sub-title">Based on Bootstrap framework and Shortcodes, quick set and easy build, <br>shines one page small business website.</div>
<div class="banner-scroll"><a class="scroll" href="#about" data-section="about"><img src="'.esc_url('http://www.mageewp.com/onetone/wp-content/themes/onetone/images/down.png').'" alt="" /></a></div>
<div class="banner-sns">
<ul class="">
	<li><a href="#"><i class="fa fa-2 fa-facebook">&nbsp;</i></a></li>
	<li><a href="#"><i class="fa fa-2 fa-skype">&nbsp;</i></a></li>
	<li><a href="#"><i class="fa fa-2 fa-twitter">&nbsp;</i></a></li>
	<li><a href="#"><i class="fa fa-2 fa-linkedin">&nbsp;</i></a></li>
	<li><a href="#"><i class="fa fa-2 fa-google-plus">&nbsp;</i></a></li>
	<li><a href="#"><i class="fa fa-2 fa-rss">&nbsp;</i></a></li>
</ul>
</div>
</div>',

'[ms_promo_box style="normal" border_color="" border_width="0" background_color="" button_color="#eda869" button_link="" button_icon="" button_text="Click Me" class="" id=""]
<h4>Morbi rutrum, elit ac fermentum egestas, tortor ante vestibulum est, eget scelerisque nisl velit eget tellus.</h4>
[/ms_promo_box]',


			'[ms_row]
[ms_column style="1/3"]
[ms_featurebox style="1" title_font_size="18px" title_color="#666666" icon_circle="no" icon_size="46px" title="FREE PSD TEMPLATE " icon="fa-leaf" alignment="left" icon_animation_type="" icon_color="#000000" icon_background_color="" icon_border_color="" icon_border_width="" flip_icon="none" spinning_icon="no" icon_image="" icon_image_width="" icon_image_height="" link_url="" link_target="_blank" link_text= link_color="" content_color="#666666" content_box_background_color="" class="" id=""]Integer pulvinar elementum est, suscipit ornare ante finibus ac. Praesent vel ex dignissim, rhoncus eros luctus, dignissim arcu. [/ms_featurebox]
[/ms_column]
[ms_column style="1/3"]
[ms_featurebox style="1" title_font_size="18px" title_color="#666666" icon_circle="no" icon_size="46px" title="FREE PSD TEMPLATE" icon="fa-hourglass-end" alignment="left" icon_animation_type="" icon_color="#000000" icon_background_color="" icon_border_color="" icon_border_width="" flip_icon="none" spinning_icon="no" icon_image="" icon_image_width="" icon_image_height="" link_url="" link_target="_blank" link_text= link_color="" content_color="#666666" content_box_background_color="" class="" id=""]Integer pulvinar elementum est, suscipit ornare ante finibus ac. Praesent vel ex dignissim, rhoncus eros luctus, dignissim arcu.[/ms_featurebox]
[/ms_column]
[ms_column style="1/3"]
[ms_featurebox style="1" title_font_size="18px" title_color="#666666" icon_circle="no" icon_size="46px" title="FREE PSD TEMPLATE" icon="fa-signal" alignment="left" icon_animation_type="" icon_color="#000000" icon_background_color="" icon_border_color="" icon_border_width="" flip_icon="none" spinning_icon="no" icon_image="" icon_image_width="" icon_image_height="" link_url="" link_target="_blank" link_text="" link_color="" content_color="#666666" content_box_background_color="" class="" id=""]Integer pulvinar elementum est, suscipit ornare ante finibus ac. Praesent vel ex dignissim, rhoncus eros luctus, dignissim arcu. [/ms_featurebox]
[/ms_column]
[/ms_row]
[ms_row]
[ms_column style="1/3"]
[ms_featurebox style="1" title_font_size="18px" title_color="#666666" icon_circle="no" icon_size="46px" title="FREE PSD TEMPLATE" icon="fa-heart" alignment="left" icon_animation_type="" icon_color="#000000" icon_background_color="" icon_border_color="" icon_border_width="" flip_icon="none" spinning_icon="no" icon_image="" icon_image_width="" icon_image_height="" link_url="" link_target="_blank" link_text="" link_color="" content_color="#666666" content_box_background_color="" class="" id=""]Integer pulvinar elementum est, suscipit ornare ante finibus ac. Praesent vel ex dignissim, rhoncus eros luctus, dignissim arcu.[/ms_featurebox]
[/ms_column]
[ms_column style="1/3"]
[ms_featurebox style="1" title_font_size="18px" title_color="#666666" icon_circle="no" icon_size="46px" title="FREE PSD TEMPLATE " icon="fa-video-camera" alignment="left" icon_animation_type="" icon_color="#000000" icon_background_color="" icon_border_color="" icon_border_width="" flip_icon="none" spinning_icon="no" icon_image="" icon_image_width="" icon_image_height="" link_url="" link_target="_blank" link_text="" link_color="" content_color="#666666" content_box_background_color="" class="" id=""]Integer pulvinar elementum est, suscipit ornare ante finibus ac. Praesent vel ex dignissim, rhoncus eros luctus, dignissim arcu.[/ms_featurebox]
[/ms_column]
[ms_column style="1/3"]
[ms_featurebox style="1" title_font_size="18px" title_color="#666666" icon_circle="no" icon_size="46px" title="FREE PSD TEMPLATE" icon="fa-tag" alignment="left" icon_animation_type="" icon_color="#000000" icon_background_color="" icon_border_color="" icon_border_width="" flip_icon="none" spinning_icon="no" icon_image="" icon_image_width="" icon_image_height="" link_url="" link_target="_blank" link_text="" link_color="" content_color="#666666" content_box_background_color="" class="" id=""]Integer pulvinar elementum est, suscipit ornare ante finibus ac. Praesent vel ex dignissim, rhoncus eros luctus, dignissim arcu.[/ms_featurebox]
[/ms_column]
[/ms_row]',


			'<p>Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere ce.<br>Etiam ut dui eu nisi lobortis rhoncus ac quis nunc.</p>
[ms_divider style="blank" align="left"  width="100%"  margin_top="30px" margin_bottom="0" border_size="" border_color="" icon="" class="" id=""]
[ms_row no_padding="yes"]
[ms_column style="1/3"][ms_image_frame src="'.esc_url('http://www.mageewp.com/onetone/wp-content/uploads/sites/17/2015/11/7.jpg').'" link="javascript:;" link_target="_self" class="" id=""][/ms_column]
[ms_column style="1/3"][ms_image_frame src="'.esc_url('http://www.mageewp.com/onetone/wp-content/uploads/sites/17/2015/11/8.jpg').'" link="javascript:;" link_target="_self" class="" id=""][/ms_column]
[ms_column style="1/3"][ms_image_frame src="'.esc_url('http://www.mageewp.com/onetone/wp-content/uploads/sites/17/2015/11/9.jpg').'" link="javascript:;" link_target="_self" class="" id=""][/ms_column]
[ms_column style="1/3"][ms_image_frame src="'.esc_url('http://www.mageewp.com/onetone/wp-content/uploads/sites/17/2015/11/10.jpg').'" link="javascript:;" link_target="_self" class="" id=""][/ms_column]
[ms_column style="1/3"][ms_image_frame src="'.esc_url('http://www.mageewp.com/onetone/wp-content/uploads/sites/17/2015/11/11.jpg').'" link="javascript:;" link_target="_self" class="" id=""][/ms_column]
[ms_column style="1/3"][ms_image_frame src="'.esc_url('http://www.mageewp.com/onetone/wp-content/uploads/sites/17/2015/11/12.jpg').'" link="javascript:;" link_target="_self" class="" id=""][/ms_column]
[/ms_row]',


			'<p style="text-align: center;">Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere ce.<br>Etiam ut dui eu nisi lobortis rhoncus ac quis nunc.</p>
[ms_divider style="blank" align="left"  width="100%"  margin_top="30px" margin_bottom="0" border_size="" border_color="" icon="" class="" id=""]
[ms_row]
[ms_column style="1/4"]
[ms_person name="Kevin Perry" title="Software Developer" picture="'.esc_url('http://www.mageewp.com/onetone/wp-content/uploads/sites/17/2015/11/001.jpg').'" piclink="" picborder="1px" picbordercolor="#eeeeee" picborderradius="0" iconboxedradius="4px"iconcolor="#000000" icon1="fa-facebook" icon2="fa-twitter" icon3="fa-google-plus" icon4="" icon5="" link1="" link2="" link3="" link4="" link5="" class="" id=""]Vivamus congue justo eget diam interdum scelerisque. In hac habitasse platea dictumst. [/ms_person]
[/ms_column]
[ms_column style="1/4"]
[ms_person name="Jennifer Lee" title="Software Engineer" picture="'.esc_url('http://www.mageewp.com/onetone/wp-content/uploads/sites/17/2015/11/002.jpg').'" piclink="" picborder="1px" picbordercolor="#eeeeee" picborderradius="0" iconboxedradius="4px" iconcolor="#000000" icon1="fa-facebook" icon2="fa-twitter" icon3="fa-google-plus" icon4="" icon5="" link1="" link2="" link3="" link4="" link5="" class="" id=""]Vivamus congue justo eget diam interdum scelerisque. In hac habitasse platea dictumst. [/ms_person]
[/ms_column]
[ms_column style="1/4"]
[ms_person name="Brandon Ross" title="Java Developer" picture="'.esc_url('http://www.mageewp.com/onetone/wp-content/uploads/sites/17/2015/11/003.jpg').'" piclink="" picborder="1px" picbordercolor="#eeeeee" picborderradius="0" iconboxedradius="4px" iconcolor="#000000" icon1="fa-facebook" icon2="fa-twitter" icon3="fa-google-plus" icon4="" icon5="" link1="" link2="" link3="" link4="" link5="" class="" id=""]Vivamus congue justo eget diam interdum scelerisque. In hac habitasse platea dictumst. [/ms_person]
[/ms_column]
[ms_column style="1/4"]
[ms_person name="Sara Wright" title="Systems Engineer" picture="'.esc_url('http://www.mageewp.com/onetone/wp-content/uploads/sites/17/2015/11/004.jpg').'" piclink="" picborder="1px" picbordercolor="#eeeeee" picborderradius="0" iconboxedradius="4px" iconcolor="#000000" icon1="fa-facebook" icon2="fa-twitter" icon3="fa-google-plus" icon4="" icon5="" link1="" link2="" link3="" link4="" link5="" class="" id=""]Vivamus congue justo eget diam interdum scelerisque. In hac habitasse platea dictumst. [/ms_person]
[/ms_column]
[/ms_row]',


			'<p style="text-align:center;">Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cet.<br>
Etiam ut dui eu nisi lobortis rhoncus ac quis nunc.</p>
[ms_row]
[ms_column style="2/3" class="" id=""]
<h3 style="color: #ffffff;">Biography</h3>
<p>Morbi rutrum, elit ac fermentum egestas, tortor ante vestibulum est, eget scelerisque nisl velit eget tellus. Fusce porta facilisis luctus. Integer neque dolor, rhoncus nec euismod eget, pharetra et tortor. Nulla id pulvinar nunc. Vestibulum auctor nisl vel lectus ullamcorper sed pellentesque dolor eleifend. Praesent lobortis magna vel diam mattis sagittis.Mauris porta odio eu risus scelerisque id facilisis ipsum dictum vitae volutpat. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed pulvinar neque eu purus sollicitudin et sollicitudin dui ultricies. Maecenas cursus auctor tellus sit amet blandit. Maecenas a erat ac nibh molestie interdum. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Sed lorem enim, ultricies sed sodales id, convallis molestie ipsum. Morbi eget dolor ligula. Vivamus accumsan rutrum nisi nec elementum. Pellentesque at nunc risus. Phasellus ullamcorper bibendum varius. Quisque quis ligula sit amet felis ornare porta. Aenean viverra lacus et mi elementum mollis. Praesent eu justo elit.</p>
[/ms_column]
[ms_column style="1/3" class="" id=""]
<h3 style="color: #ffffff;">Personal Info</h3>
[ms_list icon="fa-phone" icon_color="" icon_boxed="no" background_color="" boxed_shape="square" item_border="no" item_size="14px" class="" id=""][ms_list_item]+1123 2456 689[/ms_list_item][/ms_list]
[ms_list icon="fa-map-marker" icon_color="" icon_boxed="no" background_color="" boxed_shape="square" item_border="no" item_size="14px" class="" id=""][ms_list_item]3301 Lorem Ipsum, Dolor Sit St[/ms_list_item][/ms_list]
[ms_list icon="fa-envelope-o" icon_color="" icon_boxed="no" background_color="" boxed_shape="square" item_border="no" item_size="14px" class="" id=""][ms_list_item]<a href="#">support@mageewp.com</a>.[/ms_list_item][/ms_list]
[ms_list icon="fa-internet-explorer" icon_color="" icon_boxed="no" background_color="" boxed_shape="square" item_border="no" item_size="14px" class="" id=""][ms_list_item]<a href="#">Mageewp.com</a>[/ms_list_item][/ms_list]
[/ms_column]
[/ms_row]',

'<p style="text-align: center; color: #ffffff;">Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere c.<br>Etiam ut dui eu nisi lobortis rhoncus ac quis nunc.</p>',

'[ms_row]
[ms_column style="1/3" class="" id=""]
[ms_testimonial style="normal" name="JACK GREEN" avatar="'.esc_url('http://www.mageewp.com/onetone/wp-content/uploads/sites/17/2015/11/111.jpg').'" byline="Web Developer" alignment="none" class="" id=""]Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris consequat non ex quis consectetur. Aliquam iaculis dolor erat, ut ornare dui vulputate nec. Cras a sem mattis, tincidunt urna nec, iaculis nisl. Nam congue ultricies dui.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris consequat non ex quis consectetur. Aliquam iaculis dolor erat, ut ornare dui vulputate nec. Cras a sem mattis, tincidunt urna nec, iaculis nisl. Nam congue ultricies dui.[/ms_testimonial]
[/ms_column]
[ms_column style="1/3" class="" id=""]
[ms_testimonial style="normal" name="ANNA CASS" avatar="'.esc_url('http://www.mageewp.com/onetone/wp-content/uploads/sites/17/2015/11/222.jpg').'" byline="Conference" alignment="none" class="" id=""]Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris consequat non ex quis consectetur. Aliquam iaculis dolor erat, ut ornare dui vulputate nec. Cras a sem mattis, tincidunt urna nec, iaculis nisl. Nam congue ultricies dui.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris consequat non ex quis consectetur. Aliquam iaculis dolor erat, ut ornare dui vulputate nec. Cras a sem mattis, tincidunt urna nec, iaculis nisl. Nam congue ultricies dui.[/ms_testimonial]
[/ms_column]
[ms_column style="1/3" class="" id=""]
[ms_testimonial style="normal" name="JEREMY THOMAS" avatar="'.esc_url('http://www.mageewp.com/onetone/wp-content/uploads/sites/17/2015/11/333.jpg').'" byline="CEO Conference" alignment="none" class="" id=""]Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris consequat non ex quis consectetur. Aliquam iaculis dolor erat, ut ornare dui vulputate nec. Cras a sem mattis, tincidunt urna nec, iaculis nisl. Nam congue ultricies dui.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris consequat non ex quis consectetur. Aliquam iaculis dolor erat, ut ornare dui vulputate nec. Cras a sem mattis, tincidunt urna nec, iaculis nisl. Nam congue ultricies dui.[/ms_testimonial]
[/ms_column]
[ms_row]',

'<p style="text-align: center; color: #666666;">Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere ced.<br>Etiam ut dui eu nisi lobortis rhoncus ac quis nunc.</p>
<div class="contact-area"><form class="contact-form" action="" method="post"><input id="name" tabindex="1" name="name" size="22" type="text" value="" placeholder="Name" />
<input id="email" tabindex="2" name="email" size="22" type="text" value="" placeholder="Email" />
<textarea id="message" tabindex="4" cols="39" name="x-message" rows="7" placeholder="Message"></textarea>
<input id="sendto" name="sendto" type="hidden" value="YOUR EMAIL HERE(Default Admin Email)" />
<input id="submit" name="submit" type="button" value="Post" /></form></div>'
	);
	//$section_background_video = array("ab0TSkLe-E0","","","","","");

	$options = array();
   
	
	////HOME PAGE
		$options[] = array(
		'icon' => 'fa-home',
		'name' => __('Home Page', 'onetone'),
		'type' => 'heading');
		
		//HOME PAGE SECTION
		
	   $options[] = array(
		'name' => __('Content Sections Num', 'onetone'),
		'desc' => __('The number of home page sections.', 'onetone'),
		'id' => 'section_num',
		'std' => $section_num,
		'type' => 'text');
		
		$options[] = array('name' => __('Section Background Video', 'onetone'),'std' => 'ab0TSkLe-E0','desc' => __('YouTube Video ID', 'onetone'),'id' => 'section_background_video_0',
		'type' => 'text');
		
		$options[] = array(
		'name' => __('Video Controls', 'onetone'),
		'desc' => __('Display video control buttons.', 'onetone'),
		'id' => 'video_controls',
		'std' => '1',
		'class' => 'mini',
		'options' => $choices2,
		'type' => 'select');
		
		$video_background_section = array("0"=>"No video background");
		if( is_numeric( $section_num ) ){
		for($i=1; $i <= $section_num; $i++){
			$video_background_section[$i] = "Secion ".$i;
			}
		}
		$options[] = array('name' => __('Video Background Section', 'onetone'),'std' => '1','id' => 'video_background_section',
		'type' => 'select','options'=>$video_background_section);
		
		
		$options[] = array('name' => __('Section 1 Content', 'onetone'),'std' => 'content','id' => 'section_1_content',
		'type' => 'select','options'=>array("content"=>"Content","slider"=>"Slider"));

		if(isset($section_num) && is_numeric($section_num) && $section_num>0){
		$section_num = $section_num;
		}
		else{
		$section_num = $default_section_num;
		}
	
		for($i=0; $i < $section_num; $i++){
		
		if(!isset($section_title[$i])){$section_title[$i] = "";}
		if(!isset($section_menu[$i])){$section_menu[$i] = "";}
		if(!isset($section_background[$i])){
		$section_background[$i] = array(
										'color' => '',
										'image' => '',
										'repeat' => '',
										'position' => '',
										'attachment'=>'');
		}
		if(!isset($section_css_class[$i])){$section_css_class[$i] = "";}
		if(!isset($section_content[$i])){$section_content[$i] = "";}
		if(!isset($section_slug[$i])){ $section_slug[$i] = "";}
		if(!isset($text_align[$i])){ $text_align[$i] = "";}
		
		$section_name = onetone_option('section_title_'.$i);
		$section_name = $section_name?$section_name:onetone_option('menu_title_'.$i);
        $section_name = $section_name?$section_name:sprintf(__('Section %s', 'onetone'),($i+1));
		
		if(!isset($section_title_typography_defaults[$i])){ $section_title_typography_defaults[$i] = $section_title_typography_defaults_1;}
		if(!isset($section_content_typography_defaults[$i])){ $section_content_typography_defaults[$i] = $section_title_typography_defaults_1;}
		
		
		
		$options[] = array('name' => '','id' => 'section_group_start_'.$i.'','type' => 'start_group','class'=>'home-section group_close');
		
		$options[] =   	 array(
						  'id'          => 'sections_titled_'.$i,
						  'name'       => $section_name.' <span id="accordion-group-section-'.$i.'" class="fa fa-plus"></span>',
						  'desc'        => '',
						  'std'         => '',
						  'type'        => 'textblock-titled',
						  'rows'        => '',
						  'class'       => 'section-accordion close accordion-group-title-section-'.$i
        
      );
		
		$options[] = array(
						   'name' => __('Section Title', 'onetone'),
						   'id' => 'section_title_'.$i.'',
						   'type' => 'text',
						   'std'=>$section_title[$i],
						   'class'=>'section-item accordion-group-item accordion-group-section-'.$i
						   );
		$options[] = array(
						   'name' => __('Menu Title', 'onetone'),
						   'id' => 'menu_title_'.$i.'',
						   'type' => 'text',
						   'std'=>$section_menu[$i],
						   'desc'=> __('This title will display in the header menu. It is required', 'onetone'),
						   'class'=>'section-item accordion-group-item accordion-group-section-'.$i
						   );
		$options[] = array(
						   'name' => __('Menu Slug', 'onetone'),
						   'id' => 'menu_slug_'.$i.'',
						   'type' => 'text',
						   'std'=>$section_slug[$i],
						   'desc'=> __('The  "slug" is the URL-friendly version of the name. It is usually all lowercase and contains only letters, numbers, and hyphens.', 'onetone'),
						   'class'=>'section-item accordion-group-item accordion-group-section-'.$i
						   );
		
		$options[] = array(
						   'name' =>  __('Section Background', 'onetone'),
						   'id' => 'section_background_'.$i.'',
						   'std' => $section_background[$i],
						   'type' => 'background' ,
						   'class'=>'section-item accordion-group-item accordion-group-section-'.$i
						   );
		
		$options[] = array(
						   'name' => __('Parallax Scrolling Background Image', 'onetone'),
						   'std' => 'no',
						   'id' => 'parallax_scrolling_'.$i.'',
		                   'type' => 'select',
						   'class'=>'mini section-item accordion-group-item accordion-group-section-'.$i,
						   'options'=>$choices
						   );

		
		$options[] = array(
						   'name' => __('Section Css Class', 'onetone'),
						   'id' => 'section_css_class_'.$i.'',
						   'type' => 'text',
						   'std'=>$section_css_class[$i],
						   'class'=>'section-item accordion-group-item accordion-group-section-'.$i
						   );
		$options[] = array(
						   'name' => __('Section Padding', 'onetone'),
						   'id' => 'section_padding_'.$i.'',
						   'type' => 'text',
						   'std'=>$section_padding[$i],
						   'class'=>'section-item accordion-group-item accordion-group-section-'.$i
						   );
		
		$options[] = array(
						   'name' => __('Text Align', 'onetone'),
						   'std' => $text_align[$i],
						   'id' => 'text_align_'.$i.'',
		                   'type' => 'select',
						   'class'=>'mini section-item accordion-group-item accordion-group-section-'.$i,
						   'options'=>$align
						   );
		
		
	    $options[] = array(
						   'name' => __('Section Content', 'onetone'),
						   'id' => 'section_content_'.$i,
						   'std' => $section_content[$i],
						   'type' => 'editor',
						   'class'=>'section-item accordion-group-item accordion-group-section-'.$i
						   );
		
		$options[] = array(
						  'name' => __('Section Title Typography', 'onetone'),
						  'id'   => "section_title_typography_".$i,
						  'std'  => $section_title_typography_defaults[$i],
						  'type' => 'typography',
						  'options' => $typography_options ,
						  'class'=>'section-item accordion-group-item accordion-group-section-'.$i
						  );
		$options[] = array(
						  'name' => __('Section Content Typography', 'onetone'),
						  'id'   => "section_content_typography_".$i,
						  'std'  => $section_content_typography_defaults[$i],
						  'type' => 'typography',
						  'options' => $typography_options ,
						  'class'=>'section-item accordion-group-item accordion-group-section-'.$i
						  );
						  
		
		$options[] = array(
						  'name' => '',
						  'desc' => '<div style="overflow:hidden; background-color:#eee; padding:20px;"><a data-section="'.$i.'" class="delete-section button" title="'.__('Delete this section', 'onetone').'">'.__('Delete this section', 'onetone').'</a></div>',
						  'id' => 'delete_section_'.$i,
						  'std' => '',
						  'type' => 'info',
						  'class'=>'section-item accordion-group-item accordion-group-section-'.$i
						  );
	
		$options[] = array('name' => '','id' => 'section_group_end_'.$i.'','type' => 'end_group');
		
		
		}

		//END HOME PAGE SECTION
		
		// General
	$options[] = array(
		'icon' => 'fa-tachometer',
		'name' => __('General Options', 'onetone'),
		'type' => 'heading');


		
	$options[] = array(
		'name' => __('Favicon', 'onetone'),
		'desc' => sprintf(__('An icon associated with a URL that is variously displayed, as in a browser\'s address bar or next to the site name in a bookmark list. Learn more about <a href="%s" target="_blank">Favicon</a>', 'onetone'),esc_url("http://en.wikipedia.org/wiki/Favicon")),
		'id' => 'favicon',
		'type' => 'upload');


	
	$options[] = array(
		'name' =>  __('Back to Top Button', 'onetone'),
		'id' => 'back_to_top_btn',
		'std' => 'show',
		'class' => 'mini',
		'type' => 'select',
		'options'=>array("show"=> __('Show', 'onetone'),"hide"=>__('Hide', 'onetone'))
		);
		
		
	$options[] = array(
		'name' => __('Custom CSS', 'onetone'),
		'desc' => __('The following css code will add to the header before the closing &lt;/head&gt; tag.', 'onetone'),
		'id' => 'custom_css',
		'std' => 'body{margin:0px;}',
		'type' => 'textarea');
	
	$options[] = array(
        'id'          => 'tracking_titled',
        'name'       => __( 'Tracking', 'onetone' ),
        'desc'        => '',
        'std'         => '',
        'type'        => 'textblock-titled',
        'section'     => 'general_tab_section',
        
        'class'       => 'sub_section_titled',
        
      );
		
	 $options[] =  array(
        'id'          => 'tracking_code',
        'name'       => __( 'Tracking Code', 'onetone' ),
        'desc'        => __( 'Paste your Google Analytics (or other) tracking code here. This will be added into the header template of your theme. Please put code inside script tags.', 'onetone' ),
        'std'         => '',
        'type'        => 'textarea',
        'section'     => 'general_tab_section',
        'rows'        => '8',
        
        'class'       => '',
        
      );
	 $options[] =  array(
        'id'          => 'space_before_head',
        'name'       => __( 'Space before &lt;/head&gt;', 'onetone' ),
        'desc'        => __( 'Add code before the head tag.', 'onetone' ),
        'std'         => '',
        'type'        => 'textarea',
        'section'     => 'general_tab_section',
        'rows'        => '6',
        
        'class'       => '',
        
      );
	 $options[] =  array(
        'id'          => 'space_before_body',
        'name'       => __( 'Space before &lt;/body&gt;', 'onetone' ),
        'desc'        => __( 'Add code before the body tag.', 'onetone' ),
        'std'         => '',
        'type'        => 'textarea',
        'section'     => 'general_tab_section',
        'rows'        => '6',
        
        'class'       => '',
        
      );
	 
	 // header
	 
	   $options[] =  array(
		'icon' => 'fa-h-square', 
		'name' => __('Header', 'onetone'),
		'type' => 'heading'
		);
	
		
		  ////
		$options[] =   	 array(
        'id'          => 'header_background_titled',
        'name'       => __( 'Header Background', 'onetone' ).' <span id="accordion-group-header_background" class="fa fa-plus"></span>',
        'desc'        => '',
        'std'         => '',
        'type'        => 'textblock-titled',
        'section'     => 'header_tab_section',
        'rows'        => '4',
        'class'       => 'section-accordion close',
        
      );
		
		
		
		$options[] = array(
        'id'          => 'header_background_image',
        'name'       => __( 'Header Background Image', 'onetone' ),
        'desc'        => __( 'Background Image For Header Area', 'onetone' ),
        'std'         => '',
        'type'        => 'upload',
        'section'     => 'header_tab_section',
        
        'class'       => 'accordion-group-item accordion-group-header_background',
        
      );
		$options[] = array(
        'id'          => 'header_background_full',
        'name'       => __( '100% Background Image', 'onetone' ),
        'desc'        => __( 'Turn on to have the header background image display at 100% in width and height and scale according to the browser size.', 'onetone' ),
        'std'         => 'yes',
        'type'        => 'select',
        'section'     => 'header_tab_section',
        
        'class'       => 'accordion-group-item accordion-group-header_background',
		'options'     => $choices
      );
		$options[] = array(
        'id'          => 'header_background_parallax',
        'name'       => __( 'Parallax Background Image', 'onetone' ),
        'desc'        => __( 'Turn on to enable parallax scrolling on the background image for header top positions.', 'onetone' ),
        'std'         => 'no',
        'type'        => 'select',
        'section'     => 'header_tab_section',
        
        'class'       => 'accordion-group-item accordion-group-header_background',
		'options'     => $choices_reverse
      );
		
		$options[] =  array(
        'id'          => 'header_background_repeat',
        'name'       => __( 'Background Repeat', 'onetone' ),
        'desc'        => __( 'Select how the background image repeats.', 'onetone' ),
        'std'         => '',
        'type'        => 'select',
        'section'     => 'header_tab_section',
        
        'class'       => 'accordion-group-item accordion-group-header_background',
        'options'     => $repeat
      );
		$options[] =  array(
        'id'          => 'header_top_padding',
        'name'       => __( 'Header Top Padding', 'onetone' ),
        'desc'        => __( 'In pixels or percentage, ex: 10px or 10%.', 'onetone' ),
        'std'         => '0px',
        'type'        => 'text',
        'section'     => 'header_tab_section',
        
        'class'       => 'accordion-group-item accordion-group-header_background',
        
      );
		 $options[] = array(
        'id'          => 'header_bottom_padding',
        'name'       => __( 'Header Bottom Padding', 'onetone' ),
        'desc'        => __( 'In pixels or percentage, ex: 10px or 10%.', 'onetone' ),
        'std'         => '0px',
        'type'        => 'text',
        'section'     => 'header_tab_section',
        
        'class'       => 'accordion-group-item accordion-group-header_background',
        
      );
		 
	//// Top Bar
	 $options[] = array(
        'id'          => 'top_bar_options',
        'name'       => __( 'Top Bar Options', 'onetone' ).' <span id="accordion-group-3" class="fa fa-plus"></span>',
        'desc'        => '',
        'std'         => '',
        'type'        => 'textblock-titled',
        'section'     => 'header_tab_section',
        'rows'        => '4',
        
        'class'       => 'section-accordion close',
        
      );
		$options[] = array(
        'id'          => 'display_top_bar',
        'name'       => __( 'Display Top Bar', 'onetone' ),
        'desc'        => '',
        'std'         => '',
        'type'        => 'select',
        'section'     => 'header_tab_section',
        
        'class'       => 'accordion-group-item accordion-group-3',
        'options'     => $choices
      );
	$options[] = array(
        'id'          => 'top_bar_background_color',
        'name'       => __( 'Background Color', 'onetone' ),
        'desc'        => '',
        'std'         => '',
        'type'        => 'color',
        'section'     => 'header_tab_section',
        
        'class'       => 'accordion-group-item accordion-group-3',
        
      );
		$options[] =  array(
        'id'          => 'top_bar_left_content',
        'name'       => __( 'Left Content', 'onetone' ),
        'desc'        => '',
        'std'         => '',
        'type'        => 'select',
        'section'     => 'header_tab_section',
        
        'class'       => 'accordion-group-item accordion-group-3',
        'options'     => array( 
          'info'     => __( 'info', 'onetone' ),
          'sns'     => __( 'sns', 'onetone' ),
          'menu'     => __( 'menu', 'onetone' ),
          'none'     => __( 'none', 'onetone' ),
           
        )
      );	 
		$options[] = array(
        'id'          => 'top_bar_right_content',
        'name'       => __( 'Right Content', 'onetone' ),
        'desc'        => '',
        'std'         => '',
        'type'        => 'select',
        'section'     => 'header_tab_section',
        
        'class'       => 'accordion-group-item accordion-group-3',
        'options'     => array( 
          'info'     => __( 'info', 'onetone' ),
            
          'sns'     => __( 'sns', 'onetone' ),
            
          'menu'     => __( 'menu', 'onetone' ),
            
          'none'     => __( 'none', 'onetone' ),
           
        ),
	
      );		 
		$options[] = array(
        'id'          => 'top_bar_info_color',
        'name'       => __( 'Info Color', 'onetone' ),
        'desc'        => '',
        'std'         => '',
        'type'        => 'color',
        'section'     => 'header_tab_section',
        
        'class'       => 'accordion-group-item accordion-group-3',
        
      );
	$options[] = 	array(
        'id'          => 'top_bar_info_content',
        'name'       => __( 'Info Content', 'onetone' ),
        'desc'        => '',
        'std'         => '',
        'type'        => 'textarea',
        'section'     => 'header_tab_section',
        'rows'        => '4',
        'class'       => 'accordion-group-item accordion-group-3',
        
      );
		$options[] = array(
        'id'          => 'top_bar_menu_color',
        'name'       => __( 'Menu Color', 'onetone' ),
        'desc'        => '',
        'std'         => '',
        'type'        => 'color',
        'section'     => 'header_tab_section',
        'class'       => 'accordion-group-item accordion-group-3',
        
      );
				
 $options[] = array(
        'id'          => 'social_links',
        'name'       => __( 'Social Links', 'onetone' ),
        'desc'        => '',
        'std'         => '',
        'type'        => 'textblock-titled',
        'section'     => 'header_tab_section',
        'rows'        => '4',
        'class'       => 'accordion-group-item accordion-group-3',
        
      );
		if( $social_icons ):
$i = 1;
 foreach($social_icons as $social_icon){
	
	 $options[] =  array(
        'id'          => 'header_social_title_'.$i,
        'name'       => __( 'Social Title', 'onetone' ) .' '.$i,
        'desc'        => '',
        'std'         => $social_icon['title'],
        'type'        => 'text',
        'section'     => 'header_tab_section',
        'class'       => 'accordion-group-item accordion-group-3',
        
      );
 $options[] = array(
        'id'          => 'header_social_icon_'.$i,
        'name'       => __( 'Social Icon', 'onetone' ).' '.$i,
        'desc'        => __( 'FontAwesome Icon', 'onetone' ),
        'std'         => $social_icon['icon'],
        'type'        => 'text',
        'section'     => 'header_tab_section',
        'class'       => 'accordion-group-item accordion-group-3',
        
      );
 $options[] = array(
        'id'          => 'header_social_link_'.$i,
        'name'       => __( 'Social Icon Link', 'onetone' ).' '.$i,
        'desc'        => '',
        'std'         => $social_icon['link'],
        'type'        => 'text',
        'section'     => 'header_tab_section',
        'class'       => 'accordion-group-item accordion-group-3',
        
      );

	 $i++;
	 }
	endif;	
	
		
 $options[] =  array(
        'id'          => 'top_bar_social_icons_color',
        'name'       => __( 'Social Icons Color', 'onetone' ),
        'desc'        => '',
        'std'         => '',
        'type'        => 'color',
        'section'     => 'header_tab_section',
        'class'       => 'accordion-group-item accordion-group-3',
        
      );
$options[] = array(
        'id'          => 'top_bar_social_icons_tooltip_position',
        'name'       => __( 'Social Icon Tooltip Position', 'onetone' ),
        'desc'        => '',
        'std'         => 'bottom',
        'type'        => 'select',
        'section'     => 'header_tab_section',
        'class'       => 'accordion-group-item accordion-group-3',
        'options'     => array( 
          'left'     => __( 'left', 'onetone' ),
            
		   'right'     => __( 'right', 'onetone' ),
            
          'bottom'     => __( 'bottom', 'onetone' ),
           
        ),
	
      );

// Sticky Header
 $options[] =   array(
		'icon' => 'fa-thumb-tack', 
		'name' => __('Sticky Header', 'onetone'),
		'type' => 'heading'
		);
		
		
$options[] =  array(
        'id'          => 'enable_sticky_header',
        'name'       => __( 'Enable Sticky Header', 'onetone' ),
        'desc'        => '',
        'std'         => '',
        'type'        => 'select',
        'section'     => 'sticky_header_tab_section',
        
        'class'       => '',
        'options'     => $choices
      );
$options[] = array(
        'id'          => 'enable_sticky_header_tablets',
        'name'       => __( 'Enable Sticky Header on Tablets', 'onetone' ),
        'desc'        => '',
        'std'         => '',
        'type'        => 'select',
        'section'     => 'sticky_header_tab_section',
        
        'class'       => '',
        'options'     => $choices
      );
$options[] = array(
        'id'          => 'enable_sticky_header_mobiles',
        'name'       => __( 'Enable Sticky Header on Mobiles', 'onetone' ),
        'desc'        => '',
        'std'         => '',
        'type'        => 'select',
        'section'     => 'sticky_header_tab_section',
        
        'class'       => '',
        'options'     => $choices
      );



		
$options[] = array(
        'id'          => 'sticky_header_menu_item_padding',
        'name'       => __( 'Sticky Header Menu Item Padding', 'onetone' ),
        'desc'        => __( 'Controls the space between each menu item in the sticky header. Use a number without \'px\', default is 0. ex: 10', 'onetone' ),
        'std'         => '0',
        'type'        => 'text',
        'section'     => 'sticky_header_tab_section',
        
        'class'       => '',
        
      );
$options[] = array(
        'id'          => 'sticky_header_navigation_font_size',
        'name'       => __( 'Sticky Header Navigation Font Size', 'onetone' ),
        'desc'        => __( 'Controls the font size of the menu items in the sticky header. Use a number without \'px\', default is 14. ex: 14', 'onetone' ),
        'std'         => '14',
        'type'        => 'text',
        'section'     => 'sticky_header_tab_section',
        
        'class'       => '',
        
      );
$options[] = array(
        'id'          => 'sticky_header_logo_width',
        'name'       => __( 'Sticky Header Logo Width', 'onetone' ),
        'desc'        => __( 'Controls the logo width in the sticky header. Use a number without \'px\'.', 'onetone' ),
        'std'         => '',
        'type'        => 'text',
        'section'     => 'sticky_header_tab_section',
        
        'class'       => '',
        
      );



	//// logo
$options[] =  array(
		'icon' => 'fa-star', 
		'name' => __('Logo', 'onetone'),
		'type' => 'heading'
		);
$options[] = array(
        'id'          => 'logo',
        'name'       => __( 'Logo', 'onetone' ),
        'desc'        => '',
        'std'         => '',
        'type'        => 'textblock-titled',
        'section'     => 'logo_tab_section',
        'rows'        => '4',
        
        'class'       => 'sub_section_titled',
        
      );
$options[] = array(
        'id'          => 'logo',
        'name'       => __( 'Upload Logo', 'onetone' ),
        'desc'        => __( 'Select an image file for your logo.', 'onetone' ),
        'std'         => '',
        'type'        => 'upload',
        'section'     => 'logo_tab_section',
        
        'class'       => '',
        
      );
	
$options[] =  array(
        'id'          => 'logo_retina',
        'name'       => __( 'Upload Logo (Retina Version @2x)', 'onetone' ),
        'desc'        => __( 'Select an image file for the retina version of the logo. It should be exactly 2x the size of main logo.', 'onetone' ),
        'std'         => '',
        'type'        => 'upload',
        'section'     => 'logo_tab_section',
        
        'class'       => '',
        
      );
$options[] = array(
        'id'          => 'retina_logo_width',
        'name'       => __( 'Standard Logo Width for Retina Logo', 'onetone' ),
        'desc'        => __( 'If retina logo is uploaded, enter the standard logo (1x) version width, do not enter the retina logo width. Use a number without \'px\', ex: 40', 'onetone' ),
        'std'         => '',
        'type'        => 'text',
        'section'     => 'logo_tab_section',
        
        'class'       => '',
        
      );

$options[] =  array(
        'id'          => 'retina_logo_height',
        'name'       => __( 'Standard Logo Height for Retina Logo', 'onetone' ),
        'desc'        => __( 'If retina logo is uploaded, enter the standard logo (1x) version height, do not enter the retina logo height. Use a number without \'px\', ex: 40', 'onetone' ),
        'std'         => '',
        'type'        => 'text',
        'section'     => 'logo_tab_section',
        
        'class'       => '',
        
      );
	
$options[] =  array(
        'id'          => 'sticky_header_logo',
        'name'       => __( 'Sticky Header Logo', 'onetone' ).' <span id="accordion-group-sticky_header" class="fa fa-plus"></span>',
        'desc'        => '',
        'std'         => '',
        'type'        => 'textblock-titled',
        'section'     => 'logo_tab_section',
        'rows'        => '4',
        
        'class'       => 'section-accordion close',
        
      );
$options[] = array(
        'id'          => 'sticky_logo',
        'name'       => __( 'Upload Logo', 'onetone' ),
        'desc'        => __( 'Select an image file for your logo.', 'onetone' ),
        'std'         => '',
        'type'        => 'upload',
        'section'     => 'logo_tab_section',
        
        'class'       => 'accordion-group-item accordion-group-sticky_header',
        
      );
	
$options[] =  array(
        'id'          => 'sticky_logo_retina',
        'name'       => __( 'Upload Logo (Retina Version @2x)', 'onetone' ),
        'desc'        => __( 'Select an image file for the retina version of the logo. It should be exactly 2x the size of main logo.', 'onetone' ),
        'std'         => '',
        'type'        => 'upload',
        'section'     => 'logo_tab_section',
        
        'class'       => 'accordion-group-item accordion-group-sticky_header',
        
      );
$options[] = array(
        'id'          => 'sticky_logo_width_for_retina_logo',
        'name'       => __( 'Sticky Logo Width for Retina Logo', 'onetone' ),
        'desc'        => __( 'If retina logo is uploaded, enter the standard logo (1x) version width, do not enter the retina logo width. Use a number without \'px\', ex: 40', 'onetone' ),

        'std'         => '',
        'type'        => 'text',
        'section'     => 'logo_tab_section',
        
        'class'       => 'accordion-group-item accordion-group-sticky_header',
        
      );
$options[] = array(
        'id'          => 'sticky_logo_height_for_retina_logo',
        'name'       => __( 'Sticky Logo Height for Retina Logo', 'onetone' ),
        'desc'        => __( 'If retina logo is uploaded, enter the standard logo (1x) version height, do not enter the retina logo height. Use a number without \'px\', ex: 40', 'onetone' ),
        'std'         => '',
        'type'        => 'text',
        'section'     => 'logo_tab_section',
        
        'class'       => 'accordion-group-item accordion-group-sticky_header',
        
      );
	
$options[] =  array(
        'id'          => 'logo_left_margin',
        'name'       => __( 'Logo Left Margin', 'onetone' ),
        'desc'        => __( 'Use a number without \'px\', ex: 40', 'onetone' ),
        'std'         => '',
        'type'        => 'text',
        'section'     => 'logo_tab_section',
        
        'class'       => '',
        
      );
$options[] = array(
        'id'          => 'logo_right_margin',
        'name'       => __( 'Logo Right Margin', 'onetone' ),
        'desc'        => __( 'Use a number without \'px\', ex: 40', 'onetone' ),
        'std'         => '',
        'type'        => 'text',
        'section'     => 'logo_tab_section',
        
        'class'       => '',
        
      );
$options[] = array(
        'id'          => 'logo_top_margin',
        'name'       => __( 'Logo Top Margin', 'onetone' ),
        'desc'        => __( 'Use a number without \'px\', ex: 40', 'onetone' ),
        'std'         => '',
        'type'        => 'text',
        'section'     => 'logo_tab_section',
        
        'class'       => '',
        
      );
$options[] = array(
        'id'          => 'logo_bottom_margin',
        'name'       => __( 'Logo Bottom Margin', 'onetone' ),
        'desc'        => __( 'Use a number without \'px\', ex: 40', 'onetone' ),
        'std'         => '',
        'type'        => 'text',
        'section'     => 'logo_tab_section',
        
        'class'       => '',
        
      );

// styleling
$options[] =  array(
		'icon' => 'fa-eyedropper', 
		'name' => __('Styling', 'onetone'),
		'type' => 'heading'
		);
/*$options[] = array(
        'id'          => 'primary_color',
        'name'       => __( 'Primary Color', 'onetone' ),
        'desc'        => '',
        'std'         => '',
        'type'        => 'select',
        'section'     => 'styling_tab_section',
        
        'class'       => '',
        'options'     => array( 
          'red'     => 'red',
            
          'blue'     => 'blue',
            
          'green'     => 'green',
            
          'grey'     => 'grey',
           
        ),
	
      );*/
$options[] =  array(
        'id'          => 'primary_color',
        'name'       => __( 'Primary Color', 'onetone' ),
        'desc'        => '',
        'std'         => '#963',
        'type'        => 'color',
        'section'     => 'styling_tab_section',
        'class'       => '',
        
      );
	
	//Background Colors

$options[] =  array(
        'id'          => 'background_colors',
        'name'       => __( 'Background Colors', 'onetone' ).' <span id="accordion-group-background_colors" class="fa fa-plus"></span>',
        'desc'        => '',
        'std'         => '',
        'type'        => 'textblock-titled',
        'section'     => 'styling_tab_section',
        'rows'        => '4',
        
        'class'       => 'section-accordion close',
        
      );
$options[] =  array(
        'id'          => 'sticky_header_background_color',
        'name'       => __( 'Sticky Header Background Color', 'onetone' ),
        'desc'        => '',
        'std'         => '',
        'type'        => 'color',
        'section'     => 'styling_tab_section',
        
        'class'       => 'accordion-group-item accordion-group-background_colors',
        
      );
$options[] = array(
        'id'          => 'sticky_header_background_opacity',
        'name'       => __( 'Sticky Header Background Opacity', 'onetone' ),
        'desc'        => __( 'Opacity only works with header top position and ranges between 0 (transparent) and 1.', 'onetone' ),
        'std'         => '0.7',
        'type'        => 'select',
        'section'     => 'styling_tab_section',
        
        'options'     => $opacity,
        'class'       => 'accordion-group-item accordion-group-background_colors',
        
      );
$options[] = array(
        'id'          => 'header_background_color',
        'name'       => __( 'Header Background Color', 'onetone' ),
        'desc'        => '',
        'std'         => '',
        'type'        => 'color',
        'section'     => 'styling_tab_section',
        
        'class'       => 'accordion-group-item accordion-group-background_colors',
        
      );
$options[] = array(
        'id'          => 'header_background_opacity',
        'name'       => __( 'Header Background Opacity', 'onetone' ),
        'desc'        => __( 'Opacity only works with header top position and ranges between 0 (transparent) and 1.', 'onetone' ),
        'std'         => '1',
        'type'        => 'select',
        'section'     => 'styling_tab_section',
        
        'options'     => $opacity,
        'class'       => 'accordion-group-item accordion-group-background_colors',
        
      );

$options[] = array(
        'id'          => 'content_background_color',
        'name'       => __( 'Content Background Color', 'onetone' ),
        'desc'        => '',
        'std'         => '',
        'type'        => 'color',
        'section'     => 'styling_tab_section',
        
        'class'       => 'accordion-group-item accordion-group-background_colors',
        
      );
$options[] = array(
        'id'          => 'sidebar_background_color',
        'name'       => __( 'Sidebar Background Color', 'onetone' ),
        'desc'        => '',
        'std'         => '',
        'type'        => 'color',
        'section'     => 'styling_tab_section',
        
        'class'       => 'accordion-group-item accordion-group-background_colors',
        
      );
$options[] = array(
        'id'          => 'footer_background_color',
        'name'       => __( 'Footer Background Color', 'onetone' ),
        'desc'        => '',
        'std'         => '',
        'type'        => 'color',
        'section'     => 'styling_tab_section',
        
        'class'       => 'accordion-group-item accordion-group-background_colors',
        
      );

$options[] = array(
        'id'          => 'copyright_background_color',
        'name'       => __( 'Copyright Background Color', 'onetone' ),
        'desc'        => '',
        'std'         => '',
        'type'        => 'color',
        'section'     => 'styling_tab_section',
        
        'class'       => 'accordion-group-item accordion-group-background_colors',
        
      );

	
//Background Colors

$options[] =  array(
        'id'          => 'element_colors',
        'name'       => __( 'Element Colors', 'onetone' ).' <span id="accordion-group-element_colors" class="fa fa-plus"></span>',
        'desc'        => '',
        'std'         => '',
        'type'        => 'textblock-titled',
        'section'     => 'styling_tab_section',
        'rows'        => '4',
        
        'class'       => 'section-accordion close',
        
      );
$options[] =  array(
        'id'          => 'footer_widget_divider_color',
        'name'       => __( 'Footer Widget Divider Color', 'onetone' ),
        'desc'        => __( 'Controls the divider color in the footer.', 'onetone' ),
        'std'         => '',
        'type'        => 'color',
        'section'     => 'styling_tab_section',
        
        'class'       => 'accordion-group-item accordion-group-element_colors',
        
      );
$options[] =  array(
        'id'          => 'form_background_color',
        'name'       => __( 'Form Background Color', 'onetone' ),
        'desc'        => __( 'Controls the background color of form fields.', 'onetone' ),
        'std'         => '',
        'type'        => 'color',
        'section'     => 'styling_tab_section',
        
        'class'       => 'accordion-group-item accordion-group-element_colors',
        
      );
$options[] =  array(
        'id'          => 'form_text_color',
        'name'       => __( 'Form Text Color', 'onetone' ),
        'desc'        => __( 'Controls the text color for forms.', 'onetone' ),
        'std'         => '',
        'type'        => 'color',
        'section'     => 'styling_tab_section',
        
        'class'       => 'accordion-group-item accordion-group-element_colors',
        
      );
$options[] =  array(
        'id'          => 'form_border_color',
        'name'       => __( 'Form Border Color', 'onetone' ),
        'desc'        => __( 'Controls the border color for forms.', 'onetone' ),
        'std'         => '',
        'type'        => 'color',
        'section'     => 'styling_tab_section',
        
        'class'       => 'accordion-group-item accordion-group-element_colors',
        
      );
//  layout options

$options[] =  array(
        'id'          => 'layout_options',
        'name'       => __( 'Layout Options', 'onetone' ).' <span id="accordion-group-layout_options" class="fa fa-plus"></span>',
        'desc'        => '',
        'std'         => '',
        'type'        => 'textblock-titled',
        'section'     => 'styling_tab_section',
        'rows'        => '4',
        
        'class'       => 'section-accordion close',
        
      );
$options[] =  array(
        'id'          => 'page_content_top_padding',
        'name'       => __( 'Page Content Top Padding', 'onetone' ),
        'desc'        => __( 'In pixels or percentage, ex: 10px or 10%.', 'onetone' ),
        'std'         => '55px',
        'type'        => 'text',
        'section'     => 'styling_tab_section',
        
        'class'       => 'accordion-group-item accordion-group-layout_options',
        
      );
$options[] =  array(
        'id'          => 'page_content_bottom_padding',
        'name'       => __( 'Page Content Bottom Padding', 'onetone' ),
        'desc'        => __( 'In pixels or percentage, ex: 10px or 10%.', 'onetone' ),
        'std'         => '40px',
        'type'        => 'text',
        'section'     => 'styling_tab_section',
        
        'class'       => 'accordion-group-item accordion-group-layout_options',
        
      );
$options[] =  array(
        'id'          => 'hundredp_padding',
        'name'       => __( '100% Width Left/Right Padding ###', 'onetone' ),
        'desc'        => __( 'This option controls the left/right padding for page content when using 100% site width or 100% width page template. In pixels or percentage, ex: 10px or 10%.', 'onetone' ),
        'std'         => '20px',
        'type'        => 'text',
        'section'     => 'styling_tab_section',
        
        'class'       => 'accordion-group-item accordion-group-layout_options',
        
      );
$options[] =  array(
        'id'          => 'sidebar_padding',
        'name'       => __( 'Sidebar Padding', 'onetone' ),
        'desc'        => __( 'Enter a pixel or percentage based value, ex: 5px or 5%', 'onetone' ),
        'std'         => '0',
        'type'        => 'text',
        'section'     => 'styling_tab_section',
        
        'class'       => 'accordion-group-item accordion-group-layout_options',
        
      );
$options[] =  array(
        'id'          => 'column_top_margin',
        'name'       => __( 'Column Top Margin', 'onetone' ),
        'desc'        => __( 'Controls the top margin for all column sizes. In pixels or percentage, ex: 10px or 10%.', 'onetone' ),
        'std'         => '0px',
        'type'        => 'text',
        'section'     => 'styling_tab_section',
        
        'class'       => 'accordion-group-item accordion-group-layout_options',
        
      );
$options[] =  array(
        'id'          => 'column_bottom_margin',
        'name'       => __( 'Column Bottom Margin', 'onetone' ),
        'desc'        => __( 'Controls the bottom margin for all column sizes. In pixels or percentage, ex: 10px or 10%.', 'onetone' ),
        'std'         => '20px',
        'type'        => 'text',
        'section'     => 'styling_tab_section',
        
        'class'       => 'accordion-group-item accordion-group-layout_options',
        
      );
	 
	 //  layout options

$options[] =  array(
        'id'          => 'font_colors',
        'name'       => __( 'Font Colors', 'onetone' ).' <span id="accordion-group-font_colors_options" class="fa fa-plus"></span>',
        'desc'        => '',
        'std'         => '',
        'type'        => 'textblock-titled',
        'section'     => 'styling_tab_section',
        'rows'        => '4',
        
        'class'       => 'section-accordion close',
        
      );
 
 
// header tagline/page title/h1-h6/body text/link/breadcrumb text/sidebar widget headings/footer headings/footer text/footer link
       
 
$options[] =  array(
        'id'          => 'header_tagline_color',
        'name'       => __( 'Header Tagline', 'onetone' ),
        'desc'        => '',
        'std'         => '',
        'type'        => 'color',
        'section'     => 'styling_tab_section',
        
        'class'       => 'accordion-group-item accordion-group-font_colors_options',
        
      );
$options[] =  array(
        'id'          => 'page_title_color',
        'name'       => __( 'Page Title', 'onetone' ),
        'desc'        => '',
        'std'         => '',
        'type'        => 'color',
        'section'     => 'styling_tab_section',
        
        'class'       => 'accordion-group-item accordion-group-font_colors_options',
        
      );

$options[] =  array(
        'id'          => 'h1_color',
        'name'       => __( 'Heading 1 (H1) Font Color', 'onetone' ),
        'desc'        => '',
        'std'         => '',
        'type'        => 'color',
        'section'     => 'styling_tab_section',
        
        'class'       => 'accordion-group-item accordion-group-font_colors_options',
        
      );
$options[] =  array(
        'id'          => 'h2_color',
        'name'       => __( 'Heading 2 (H2) Font Color', 'onetone' ),
        'desc'        => '',
        'std'         => '',
        'type'        => 'color',
        'section'     => 'styling_tab_section',
        
        'class'       => 'accordion-group-item accordion-group-font_colors_options',
        
      );
$options[] =  array(
        'id'          => 'h3_color',
        'name'       => __( 'Heading 3 (H3) Font Color', 'onetone' ),
        'desc'        => '',
        'std'         => '',
        'type'        => 'color',
        'section'     => 'styling_tab_section',
        
        'class'       => 'accordion-group-item accordion-group-font_colors_options',
        
      );
$options[] =  array(
        'id'          => 'h4_color',
        'name'       => __( 'Heading 4 (H4) Font Color', 'onetone' ),
        'desc'        => '',
        'std'         => '',
        'type'        => 'color',
        'section'     => 'styling_tab_section',
        
        'class'       => 'accordion-group-item accordion-group-font_colors_options',
        
      );
$options[] =  array(
        'id'          => 'h5_color',
        'name'       => __( 'Heading 5 (H5) Font Color', 'onetone' ),
        'desc'        => '',
        'std'         => '',
        'type'        => 'color',
        'section'     => 'styling_tab_section',
        
        'class'       => 'accordion-group-item accordion-group-font_colors_options',
        
      );
$options[] =  array(
        'id'          => 'h6_color',
        'name'       => __( 'Heading 6 (H6) Font Color', 'onetone' ),
        'desc'        => '',
        'std'         => '',
        'type'        => 'color',
        'section'     => 'styling_tab_section',
        
        'class'       => 'accordion-group-item accordion-group-font_colors_options',
        
      );
 
$options[] =  array(
        'id'          => 'body_text_color',
        'name'       => __( 'Body Text Color', 'onetone' ),
        'desc'        => '',
        'std'         => '',
        'type'        => 'color',
        'section'     => 'styling_tab_section',
        
        'class'       => 'accordion-group-item accordion-group-font_colors_options',
        
      );
$options[] =  array(
        'id'          => 'links_color',
        'name'       => __( 'Links Color', 'onetone' ),
        'desc'        => '',
        'std'         => '',
        'type'        => 'color',
        'section'     => 'styling_tab_section',
        
        'class'       => 'accordion-group-item accordion-group-font_colors_options',
        
      );
$options[] =  array(
        'id'          => 'breadcrumbs_text_color',
        'name'       => __( 'Breadcrumbs Text Color', 'onetone' ),
        'desc'        => '',
        'std'         => '',
        'type'        => 'color',
        'section'     => 'styling_tab_section',
        
        'class'       => 'accordion-group-item accordion-group-font_colors_options',
        
      );

$options[] =  array(
        'id'          => 'sidebar_widget_headings_color',
        'name'       => __( 'Sidebar Widget Headings Color', 'onetone' ),
        'desc'        => '',
        'std'         => '',
        'type'        => 'color',
        'section'     => 'styling_tab_section',
        
        'class'       => 'accordion-group-item accordion-group-font_colors_options',
        
      );
$options[] = array(
        'id'          => 'footer_headings_color',
        'name'       => __( 'Footer Headings Color', 'onetone' ),
        'desc'        => '',
        'std'         => '',
        'type'        => 'color',
        'section'     => 'styling_tab_section',
        
        'class'       => 'accordion-group-item accordion-group-font_colors_options',
        
      );
$options[] = array(
        'id'          => 'footer_text_color',
        'name'       => __( 'Footer Text Color', 'onetone' ),
        'desc'        => '',
        'std'         => '',
        'type'        => 'color',
        'section'     => 'styling_tab_section',
        
        'class'       => 'accordion-group-item accordion-group-font_colors_options',
        
      );
$options[] = array(
        'id'          => 'footer_link_color',
        'name'       => __( 'Footer Link Color', 'onetone' ),
        'desc'        => '',
        'std'         => '',
        'type'        => 'color',
        'section'     => 'styling_tab_section',
        
        'class'       => 'accordion-group-item accordion-group-font_colors_options',
        
      );
 

	 // main menu colors

$options[] =  array(
        'id'          => 'main_menu_colors',
        'name'       => __( 'Main Menu Colors', 'onetone' ).' <span id="accordion-group-main_menu_colors_options" class="fa fa-plus"></span>',
        'desc'        => '',
        'std'         => '',
        'type'        => 'textblock-titled',
        'section'     => 'styling_tab_section',
        'rows'        => '4',
        
        'class'       => 'section-accordion close',
        
      );

$options[] =  array(
        'id'          => 'main_menu_background_color_1',
        'name'       => __( 'Main Menu Background Color', 'onetone' ),
        'desc'        => '',
        'std'         => '',
        'type'        => 'color',
        'section'     => 'styling_tab_section',
        
        'class'       => 'accordion-group-item accordion-group-main_menu_colors_options',
        
      );
$options[] =  array(
        'id'          => 'main_menu_font_color_1',
        'name'       => __( 'Main Menu Font Color ( First Level )', 'onetone' ),
        'desc'        => '',
        'std'         => '',
        'type'        => 'color',
        'section'     => 'styling_tab_section',
        
        'class'       => 'accordion-group-item accordion-group-main_menu_colors_options',
        
      );
$options[] =  array(
        'id'          => 'main_menu_font_hover_color_1',
        'name'       => __( 'Main Menu Font Hover Color ( First Level )', 'onetone' ),
        'desc'        => '',
        'std'         => '',
        'type'        => 'color',
        'section'     => 'styling_tab_section',
        
        'class'       => 'accordion-group-item accordion-group-main_menu_colors_options',
        
      );
$options[] =  array(
        'id'          => 'main_menu_background_color_2',
        'name'       => __( 'Main Menu Background Color ( Sub Level )', 'onetone' ),
        'desc'        => '',
        'std'         => '',
        'type'        => 'color',
        'section'     => 'styling_tab_section',
        
        'class'       => 'accordion-group-item accordion-group-main_menu_colors_options',
        
      );
   
$options[] =  array(
        'id'          => 'main_menu_font_color_2',
        'name'       => __( 'Main Menu Font Color ( Sub Level )', 'onetone' ),
        'desc'        => '',
        'std'         => '',
        'type'        => 'color',
        'section'     => 'styling_tab_section',
        
        'class'       => 'accordion-group-item accordion-group-main_menu_colors_options',
        
      );
$options[] =  array(
        'id'          => 'main_menu_font_hover_color_2',
        'name'       => __( 'Main Menu Font Hover Color ( Sub Level )', 'onetone' ),
        'desc'        => '',
        'std'         => '',
        'type'        => 'color',
        'section'     => 'styling_tab_section',
        
        'class'       => 'accordion-group-item accordion-group-main_menu_colors_options',
        
      );
$options[] =  array(
        'id'          => 'main_menu_separator_color_2',
        'name'       => __( 'Main Menu Separator Color ( Sub Levels )', 'onetone' ),
        'desc'        => '',
        'std'         => '',
        'type'        => 'color',
        'section'     => 'styling_tab_section',
        
        'class'       => 'accordion-group-item accordion-group-main_menu_colors_options',
        
      );




 //Sidebar
 
$options[] =  array(
		'icon' => 'fa-columns', 
		'name' => __('Sidebar', 'onetone'),
		'type' => 'heading'
		);

$options[] =  array(
        'id'          => 'sidebar_blog_posts',
        'name'       => __( 'Blog Posts', 'onetone' ).' <span id="accordion-group-8" class="fa fa-plus"></span>',
        'desc'        => '',
        'std'         => '',
        'type'        => 'textblock-titled',
        'section'     => 'sidebar_tab_section',
        'rows'        => '4',
        
        'class'       => 'section-accordion close',
        
      );
 
$options[] =  array(
        'id'          => 'left_sidebar_blog_posts',
        'name'       => __( 'Left Sidebar', 'onetone' ),
        'desc'        => '',
        'std'         => '',
        'type'        => 'select',
        'section'     => 'sidebar_tab_section',
        
        'class'       => 'accordion-group-item accordion-group-8',
        'options'     => $sidebars,
	
      );
$options[] =  array(
        'id'          => 'right_sidebar_blog_posts',
        'name'       => __( 'Right Sidebar', 'onetone' ),
        'desc'        => '',
        'std'         => '',
        'type'        => 'select',
        'section'     => 'sidebar_tab_section',
        
        'class'       => 'accordion-group-item accordion-group-8',
        'options'     => $sidebars,
	
      );
 //
 
 
 //
$options[] =  array(
        'id'          => 'sidebar_blog_archive',
        'name'       => __( 'Blog Archive / Category Pages', 'onetone' ).' <span id="accordion-group-10" class="fa fa-plus"></span>',
        'desc'        => '',
        'std'         => '',
        'type'        => 'textblock-titled',
        'section'     => 'sidebar_tab_section',
        'rows'        => '4',
        
        'class'       => 'section-accordion close',
        
      );
 
$options[] =  array(
        'id'          => 'left_sidebar_blog_archive',
        'name'       => __( 'Left Sidebar', 'onetone' ),
        'desc'        => '',
        'std'         => '',
        'type'        => 'select',
        'section'     => 'sidebar_tab_section',
        
        'class'       => 'accordion-group-item accordion-group-10',
        'options'     => $sidebars,
	
      );
$options[] =  array(
        'id'          => 'right_sidebar_blog_archive',
        'name'       => __( 'Right Sidebar', 'onetone' ),
        'desc'        => '',
        'std'         => '',
        'type'        => 'select',
        'section'     => 'sidebar_tab_section',
        
        'class'       => 'accordion-group-item accordion-group-10',
        'options'     => $sidebars,
	
      );

    //Sidebar search'
$options[] =  array(
        'id'          => 'sidebar_search',
        'name'       => __( 'Search Page', 'onetone' ).' <span id="accordion-group-14" class="fa fa-plus"></span>',
        'desc'        => '',
        'std'         => '',
        'type'        => 'textblock-titled',
        'section'     => 'sidebar_tab_section',
        'rows'        => '4',
        
        'class'       => 'section-accordion close',
        
      );
 
$options[] =  array(
        'id'          => 'left_sidebar_search',
        'name'       => __( 'Left Sidebar', 'onetone' ),
        'desc'        => '',
        'std'         => '',
        'type'        => 'select',
        'section'     => 'sidebar_tab_section',
        
        'class'       => 'accordion-group-item accordion-group-14',
        'options'     => $sidebars,
	
      );
$options[] =  array(
        'id'          => 'right_sidebar_search',
        'name'       => __( 'Right Sidebar', 'onetone' ),
        'desc'        => '',
        'std'         => '',
        'type'        => 'select',
        'section'     => 'sidebar_tab_section',
        
        'class'       => 'accordion-group-item accordion-group-14',
        'options'     => $sidebars,
	
      );
 
     //Sidebar 404 page'
$options[] =  array(
        'id'          => 'sidebar_404',
        'name'       => __( '404 Page', 'onetone' ).' <span id="accordion-group-404" class="fa fa-plus"></span>',
        'desc'        => '',
        'std'         => '',
        'type'        => 'textblock-titled',
        'section'     => 'sidebar_tab_section',
        'rows'        => '4',
        
        'class'       => 'section-accordion close',
        
      );
 
$options[] =  array(
        'id'          => 'left_sidebar_404',
        'name'       => __( 'Left Sidebar', 'onetone' ),
        'desc'        => '',
        'std'         => '',
        'type'        => 'select',
        'section'     => 'sidebar_tab_section',
        
        'class'       => 'accordion-group-item accordion-group-404',
        'options'     => $sidebars,
	
      );
$options[] =  array(
        'id'          => 'right_sidebar_404',
        'name'       => __( 'Right Sidebar', 'onetone' ),
        'desc'        => '',
        'std'         => '',
        'type'        => 'select',
        'section'     => 'sidebar_tab_section',
        
        'class'       => 'accordion-group-item accordion-group-404',
        'options'     => $sidebars,
	
      );

	
		
		
			// Slider
		$options[] = array(
	    'icon' => 'fa-sliders',			   
		'name' => __('Slider', 'onetone'),
		'type' => 'heading');
		
	
		
		//HOME PAGE SLIDER
		$options[] = array('name' => __('Slideshow', 'onetone'),'id' => 'group_title','type' => 'title');
		
		
		$options[] =   	 array(
						  'id'          => 'slide_titled_1',
						  'name'       => __('Slide 1', 'onetone').' <span id="accordion-group-slide-1" class="fa fa-plus"></span>',
						  'desc'        => '',
						  'std'         => '',
						  'type'        => 'textblock-titled',
						  'rows'        => '',
						  'class'       => 'section-accordion close',
        
      );
		
		$options[] = array(
						   'name' => __('Image', 'onetone'),
						   'id' => 'onetone_slide_image_1',
						   'type' => 'upload',
						   'std'=>ONETONE_THEME_BASE_URL.'/images/banner-1.jpg',
						   'class'=>'slide-item accordion-group-item accordion-group-slide-1'
						   );
		

		$options[] = array(
						   'name' => __('Text', 'onetone'),
						   'id' => 'onetone_slide_text_1',
						   'type' => 'editor',
						   'std'=>'<h1>The jQuery slider that just slides.</h1><p>No fancy effects or unnecessary markup.</p><a class="btn" href="#download">Download</a>',
						   'class'=>'slide-item accordion-group-item accordion-group-slide-1'
						   );
		
	
		
		$options[] =   	 array(
						  'id'          => 'slide_titled_2',
						  'name'       => __('Slide 2', 'onetone').' <span id="accordion-group-slide-2" class="fa fa-plus"></span>',
						  'desc'        => '',
						  'std'         => '',
						  'type'        => 'textblock-titled',
						  'rows'        => '',
						  'class'       => 'section-accordion close',
        
      );
		$options[] = array(
						   'name' => __('Image', 'onetone'),
						   'id' => 'onetone_slide_image_2',
						   'type' => 'upload',
						   'std'=>ONETONE_THEME_BASE_URL.'/images/banner-2.jpg',
						   'class'=>'slide-item accordion-group-item accordion-group-slide-2'
						   );
		
		$options[] = array(
						   'name' => __('Text', 'onetone'),
						   'id' => 'onetone_slide_text_2',
						   'type' => 'editor',
						   'std'=>'<h1>Fluid, flexible, fantastically minimal.</h1><p>Use any HTML in your slides, extend with CSS. You have full control.</p><a class="btn" href="#download">Download</a>',
						   'class'=>'slide-item accordion-group-item accordion-group-slide-2'
						   );
		
		$options[] =   	 array(
						  'id'          => 'slide_titled_3',
						  'name'       => __('Slide 3', 'onetone').' <span id="accordion-group-slide-3" class="fa fa-plus"></span>',
						  'desc'        => '',
						  'std'         => '',
						  'type'        => 'textblock-titled',
						  'rows'        => '',
						  'class'       => 'section-accordion close',
        
      );
		
		$options[] = array(
						   'name' => __('Image', 'onetone'),
						   'id' => 'onetone_slide_image_3',
						   'type' => 'upload',
						   'std'=>ONETONE_THEME_BASE_URL.'/images/banner-3.jpg',
						   'class'=>'slide-item accordion-group-item accordion-group-slide-3'
						   );
		
		$options[] = array(
						   'name' => __('Text', 'onetone'),
						   'id' => 'onetone_slide_text_3',
						   'type' => 'editor',
						   'std'=>'<h1>Open-source.</h1><p> Vestibulum auctor nisl vel lectus ullamcorper sed pellentesque dolor eleifend.</p><a class="btn" href="#">Contribute</a>',
						   'class'=>'slide-item accordion-group-item accordion-group-slide-3'
						   );
		
		
		
		$options[] =   	 array(
						  'id'          => 'slide_titled_4',
						  'name'       => __('Slide 4', 'onetone').' <span id="accordion-group-slide-4" class="fa fa-plus"></span>',
						  'desc'        => '',
						  'std'         => '',
						  'type'        => 'textblock-titled',
						  'rows'        => '',
						  'class'       => 'section-accordion close',
        
      );
		
		$options[] = array(
						   'name' => __('Image', 'onetone'),
						   'id' => 'onetone_slide_image_4',
						   'type' => 'upload',
						   'std'=>ONETONE_THEME_BASE_URL.'/images/banner-4.jpg',
						   'class'=>'slide-item accordion-group-item accordion-group-slide-4'
						   );
		
		$options[] = array(
						   'name' => __('Text', 'onetone'),
						   'id' => 'onetone_slide_text_4',
						   'type' => 'editor','std'=>'<h1>Uh, that\'s about it.</h1><p>I just wanted to show you another slide.</p><a class="btn" href="#download">Download</a>',
						    'class'=>'slide-item accordion-group-item accordion-group-slide-4'
						   );
		
		$options[] =   	 array(
						  'id'          => 'slide_titled_5',
						  'name'       => __('Slide 5', 'onetone').' <span id="accordion-group-slide-5" class="fa fa-plus"></span>',
						  'desc'        => '',
						  'std'         => '',
						  'type'        => 'textblock-titled',
						  'rows'        => '',
						  'class'       => 'section-accordion close',
        
      );
		
	
		$options[] = array(
						   'name' => __('Image', 'onetone'),
						   'id' => 'onetone_slide_image_5',
						   'type' => 'upload',
						   'class'=>'slide-item accordion-group-item accordion-group-slide-5'
						   );
	 
		$options[] = array(
						   'name' => __('Text', 'onetone'),
						   'id' => 'onetone_slide_text_5',
						   'type' => 'editor',
						   'class'=>'slide-item accordion-group-item accordion-group-slide-5'
						   );
	 
	
		

		
		$options[] = array(
		'name' => __('Slide Speed', 'onetone'),
		'id' => 'slide_time',
		'std' => '5000',
		'desc'=>__('Milliseconds between the end of the sliding effect and the start of the nex one.','onetone'),
		'type' => 'text');		
		
		//END HOME PAGE SLIDER
		
			// FOOTER
	    $options[] = array(
		'icon' => 'fa-hand-o-down',
		'name' => __('Footer', 'onetone'),
		'type' => 'heading');
	
        $options[] = array(
		'name' => __('Enable Footer Widgets Area', 'onetone'),
		'desc' => '',
		'id' => 'enable_footer_widget_area',
		'std' => '0',
		'type' => 'checkbox');
		
		 // 404
		
		$options[] = array(	
						   'icon' => 'fa-frown-o',
						   'name' => __('404 page', 'onetone'),
						   'type' => 'heading'
						   );
		$options[] = array(
		
		'name' => __('404 page content', 'onetone'),
		'desc' => '',
		'id' => 'content_404',
		'std' => '<h2>WHOOPS!</h2>
                        <p>THERE IS NOTHING HERE.<br>PERHAPS YOU WERE GIVEN THE WRONG URL?</p>',
		'type' => 'editor');
		
		
	return $options;
}