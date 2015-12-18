<?php
/**
* The main template file.
*
*/
 ?>
<?php
if ( 'page' == get_option( 'show_on_front' ) && ( '' != get_option( 'page_for_posts' ) ) && $wp_query->get_queried_object_id() == get_option( 'page_for_posts' ) ) :
get_header(); 
else:
get_header('home'); 
endif;
?>
<?php
if ( 'page' == get_option( 'show_on_front' ) && ( '' != get_option( 'page_for_posts' ) ) && $wp_query->get_queried_object_id() == get_option( 'page_for_posts' ) ) :

$left_sidebar   = onetone_option('left_sidebar_blog_archive','');
$right_sidebar  = onetone_option('right_sidebar_blog_archive','');
$aside          = 'no-aside';
if( $left_sidebar !='' )
$aside          = 'left-aside';
if( $right_sidebar !='' )
$aside          = 'right-aside';
if(  $left_sidebar !='' && $right_sidebar !='' )
$aside          = 'both-aside';
?>

<div class="post-wrap">
            <div class="container">
                <div class="post-inner row <?php echo $aside; ?>">
                    <div class="col-main">
                        <section class="post-main" role="main" id="content">                        
                            <article class="page type-page" id="">
                            <?php if (have_posts()) :?>
                                <!--blog list begin-->
                                <div class="blog-list-wrap">
                                
                                <?php while ( have_posts() ) : the_post();?>
                                <?php get_template_part("content",get_post_format() ); ?>
                                <?php endwhile;?>
                                </div>
                                <?php endif;?>
                                <!--blog list end-->
                                <!--list pagination begin-->
                                <nav class="post-list-pagination" role="navigation">
                                    <?php if(function_exists("onetone_native_pagenavi")){onetone_native_pagenavi("echo",$wp_query);}?>
                                </nav>
                                <!--list pagination end-->
                            </article>
                            
                            
                            <div class="post-attributes"></div>
                        </section>
                    </div>
                    <?php if( $left_sidebar !='' ):?>
                    <div class="col-aside-left">
                        <aside class="blog-side left text-left">
                            <div class="widget-area">
                                <?php get_sidebar('archiveleft');?> 
                            </div>
                        </aside>
                    </div>
                    <?php endif; ?>
                    <?php if( $right_sidebar !='' ):?>
                    <div class="col-aside-right">
                       <?php get_sidebar('archiveright');?>
                    </div>
                    <?php endif; ?>
                    
                </div>
            </div>  
        </div>
<?php else: ?>
<div class="post-wrap">
  <div class="container-fullwidth">
    <div class="page-inner row no-aside" style="padding-top: 0; padding-bottom: 0;">
      <div class="col-main">
        <section class="post-main" role="main" id="content">
          <article class="page type-page homepage" id="">
            <?php
 global $onetone_options, $allowedposttags ;
 $allowedposttags['input']  = array ( 'class' => 1, 'id'=> 1, 'style' => 1, 'type' => 1, 'value' => 1 ,'placeholder'=> 1,'size'=> 1,'tabindex'=> 1,'aria-required'=> 1);
 $allowedposttags['iframe'] = array(
					'align' => true,
					'width' => true,
					'height' => true,
					'frameborder' => true,
					'name' => true,
					'src' => true,
					'id' => true,
					'class' => true,
					'style' => true,
					'scrolling' => true,
					'marginwidth' => true,
					'marginheight' => true,
					
  );
					 
 
 $video_array               = array();
 $section_num               = onetone_option( 'section_num',9 ); 
 $section_background_video  = onetone_option( 'section_background_video_0' ,'ab0TSkLe-E0');
 $video_background_section  = onetone_option( 'video_background_section',1 );
 $video_background_section  = $video_background_section == ""?1:$video_background_section;
 $video_controls            = onetone_option( 'video_controls' ,1);
 $video_controls            = $video_controls == ""?1:$video_controls;
 $section_1_content         = onetone_option( 'section_1_content' ,'content');
 
 
 // default home page sections data
 $default_options = array(
				  //section 1
				  array(
						'section_title'=>'',
						'menu_title'=>'Home',
						'menu_slug'=>'home',
						'section_background'=>array(
											  'color' => '',
											  'image' => ONETONE_THEME_BASE_URL.'/images/home-bg01.jpg',
											  'repeat' => 'repeat',
											  'position' => 'top left',
											  'attachment'=>'scroll' ),
						'section_title_typography'=> array('size'  => '48px','face'  => '','style' => 'normal','color' => '#666666' ),
						'section_content_typography'=> array('size'  => '14px','face'  => '','style' => 'normal','color' => '#666666' ),
						'parallax_scrolling'=>'no',
						'section_css_class'=>'section-banner',
						'section_padding'=>'',
						'text_align'=>'left',
						'section_content'=>'<div class="banner-box">

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
						),
				  
				  //section 2
				  array(
						'section_title'=>'',
						'menu_title'=>'',
						'menu_slug'=>'',
						'section_background'=>array(
											  'color' => '#eeeeee',
											  'image' => '',
											  'repeat' => 'repeat',
											  'position' => 'top left',
											  'attachment'=>'scroll' ),
						'section_title_typography'=> array('size'  => '48px','face'  => '','style' => 'normal','color' => '#666666' ),
						'section_content_typography'=> array('size'  => '14px','face'  => '','style' => 'normal','color' => '#666666' ),
						'parallax_scrolling'=>'no',
						'section_css_class'=>'',
						'section_padding'=>'30px 0',
						'text_align'=>'left',
						'section_content'=>'<style type="text/css" scoped="scoped">.promo_box-5642db4234fc2 .promo-action a{ background-color:#eda869; </style><div class="magee-promo-box  promo_box-5642db4234fc2" id="">
                                        <div class="promo-info">
                                            
<h4>Morbi rutrum, elit ac fermentum egestas, tortor ante vestibulum est, eget scelerisque nisl velit eget tellus.</h4>

                                        </div>
                                        <div class="promo-action">
                                            <a href="#" class="btn-normal btn-lg"><i class="fa "></i> Click Me</a>
                                        </div>
                                    </div>',
						),
				  
				  
				  //section 3
				  array(
						'section_title'=>'',
						'menu_title'=>'Services',
						'menu_slug'=>'services',
						'section_background'=> array(
												  'color' => '#ffffff',
												  'image' => '',
												  'repeat' => 'repeat',
												  'position' => 'top left',
												  'attachment'=>'scroll' ),
						'section_title_typography'=> array('size'  => '48px','face'  => '','style' => 'normal','color' => '#666666' ),
						'section_content_typography'=> array('size'  => '14px','face'  => '','style' => 'normal','color' => '#666666' ),
						'parallax_scrolling'=>'no',
						'section_css_class'=>'',
						'section_padding'=>'50px 0',
						'text_align'=>'center',
						'section_content'=>'<div id="" class=" row">
<div class=" col-md-4" id="">
<style type="text/css">.feature-box-5642db4235f60 h3 {font-size:18px;}.feature-box-5642db4235f60 h3 {color:#666666;}.feature-box-5642db4235f60 .icon-box{color:#000000;}.feature-box-5642db4235f60 .feature-content,.feature-box-5642db4235f60 .feature-content p{color:#666666;}.feature-box-5642db4235f60 .icon-box{font-size:46px;}</style><div class="magee-feature-box style1  feature-box-5642db4235f60" id="" data-os-animation="fadeOut"><div class="icon-box " data-animation=""> <i class="feature-box-icon fa fa-leaf  fa-fw"></i></div><h3>FREE PSD TEMPLATE </h3><div class="feature-content"><p>Integer pulvinar elementum est, suscipit ornare ante finibus ac. Praesent vel ex dignissim, rhoncus eros luctus, dignissim arcu. </p><a href="" target="_blank" class="feature-link"></a></div></div>
</div>
<div class=" col-md-4" id="">
<style type="text/css">.feature-box-5642db42363df h3 {font-size:18px;}.feature-box-5642db42363df h3 {color:#666666;}.feature-box-5642db42363df .icon-box{color:#000000;}.feature-box-5642db42363df .feature-content,.feature-box-5642db42363df .feature-content p{color:#666666;}.feature-box-5642db42363df .icon-box{font-size:46px;}</style><div class="magee-feature-box style1  feature-box-5642db42363df" id="" data-os-animation="fadeOut"><div class="icon-box " data-animation=""> <i class="feature-box-icon fa fa-hourglass-end  fa-fw"></i></div><h3>FREE PSD TEMPLATE</h3><div class="feature-content"><p>Integer pulvinar elementum est, suscipit ornare ante finibus ac. Praesent vel ex dignissim, rhoncus eros luctus, dignissim arcu.</p><a href="" target="_blank" class="feature-link"></a></div></div>
</div>
<div class=" col-md-4" id="">
<style type="text/css">.feature-box-5642db423682b h3 {font-size:18px;}.feature-box-5642db423682b h3 {color:#666666;}.feature-box-5642db423682b .icon-box{color:#000000;}.feature-box-5642db423682b .feature-content,.feature-box-5642db423682b .feature-content p{color:#666666;}.feature-box-5642db423682b .icon-box{font-size:46px;}</style><div class="magee-feature-box style1  feature-box-5642db423682b" id="" data-os-animation="fadeOut"><div class="icon-box " data-animation=""> <i class="feature-box-icon fa fa-signal  fa-fw"></i></div><h3>FREE PSD TEMPLATE</h3><div class="feature-content"><p>Integer pulvinar elementum est, suscipit ornare ante finibus ac. Praesent vel ex dignissim, rhoncus eros luctus, dignissim arcu. </p><a href="" target="_blank" class="feature-link"></a></div></div>
</div>
</div>
<div id="" class=" row">
<div class=" col-md-4" id="">
<style type="text/css">.feature-box-5642db4236ff8 h3 {font-size:18px;}.feature-box-5642db4236ff8 h3 {color:#666666;}.feature-box-5642db4236ff8 .icon-box{color:#000000;}.feature-box-5642db4236ff8 .feature-content,.feature-box-5642db4236ff8 .feature-content p{color:#666666;}.feature-box-5642db4236ff8 .icon-box{font-size:46px;}</style><div class="magee-feature-box style1  feature-box-5642db4236ff8" id="" data-os-animation="fadeOut"><div class="icon-box" data-animation=""> <i class="feature-box-icon fa fa-heart  fa-fw"></i></div><h3>FREE PSD TEMPLATE</h3><div class="feature-content"><p>Integer pulvinar elementum est, suscipit ornare ante finibus ac. Praesent vel ex dignissim, rhoncus eros luctus, dignissim arcu.</p><a href="" target="_blank" class="feature-link"></a></div></div>
</div>
<div class=" col-md-4" id="">
<style type="text/css">.feature-box-5642db423744b h3 {font-size:18px;}.feature-box-5642db423744b h3 {color:#666666;}.feature-box-5642db423744b .icon-box{color:#000000;}.feature-box-5642db423744b .feature-content,.feature-box-5642db423744b .feature-content p{color:#666666;}.feature-box-5642db423744b .icon-box{font-size:46px;}</style><div class="magee-feature-box style1  feature-box-5642db423744b" id="" data-os-animation="fadeOut"><div class="icon-box " data-animation=""> <i class="feature-box-icon fa fa-video-camera  fa-fw"></i></div><h3>FREE PSD TEMPLATE </h3><div class="feature-content"><p>Integer pulvinar elementum est, suscipit ornare ante finibus ac. Praesent vel ex dignissim, rhoncus eros luctus, dignissim arcu.</p><a href="" target="_blank" class="feature-link"></a></div></div>
</div>
<div class=" col-md-4" id="">
<style type="text/css">.feature-box-5642db423788d h3 {font-size:18px;}.feature-box-5642db423788d h3 {color:#666666;}.feature-box-5642db423788d .icon-box{color:#000000;}.feature-box-5642db423788d .feature-content,.feature-box-5642db423788d .feature-content p{color:#666666;}.feature-box-5642db423788d .icon-box{font-size:46px;}</style><div class="magee-feature-box style1  feature-box-5642db423788d" id="" data-os-animation="fadeOut"><div class="icon-box " data-animation=""> <i class="feature-box-icon fa fa-tag  fa-fw"></i></div><h3>FREE PSD TEMPLATE</h3><div class="feature-content"><p>Integer pulvinar elementum est, suscipit ornare ante finibus ac. Praesent vel ex dignissim, rhoncus eros luctus, dignissim arcu.</p><a href="" target="_blank" class="feature-link"></a></div></div>
</div>
</div>
',
						),
				  
				    //section 4
				  array(
						'section_title'=>'GALLERY',
						'menu_title'=>'Gallery',
						'menu_slug'=>'gallery',
						'section_background'=> array(
												'color' => '#eeeeee',
												'image' => '',
												'repeat' => 'repeat',
												'position' => 'top left',
												'attachment'=>'scroll' ),
						'section_title_typography'=> array('size'  => '36px','face'  => '','style' => 'bold','color' => '#666666' ),
						'section_content_typography'=> array('size'  => '14px','face'  => '','style' => 'normal','color' => '#666666' ),
						'parallax_scrolling'=>'no',
						'section_css_class'=>'',
						'section_padding'=>'50px 0',
						'text_align'=>'center',
						'section_content'=>'<p>Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere ce.<br>Etiam ut dui eu nisi lobortis rhoncus ac quis nunc.</p>
<style type="text/css" scoped="scoped">.divider-5642db4238104{ margin-top: 30px;margin-bottom:0;width:100%;}.divider-5642db4238104 .divider-border{border-bottom-width:; border-color:;}.divider-5642db4238104 .double-line.divider-inner-item .divider-inner{border-top-width: ; border-bottom-width: ;}.divider-5642db4238104 .divider-border.divider-inner-item .divider-inner{ border-bottom-width: ;} </style><div class=" divider divider-5642db4238104" id="" style="margin-top:; margin-bottom:;"><div class="divider-inner divider-border"></div></div>
<div id="" class=" no-padding row">
<div class=" col-md-4" id=""><div class="img-frame rounded"><div class="img-box figcaption-middle text-center fade-in"><a target="_self" href="javascript:;">
                                                        <img src="'.esc_url('http://www.mageewp.com/onetone/wp-content/uploads/sites/17/2015/11/7.jpg').'" class="feature-img">
                                                        <div class="img-overlay dark">
                                                            <div class="img-overlay-container">
                                                                <div class="img-overlay-content">
                                                                    <i class="fa fa-link"></i>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </a></div></div></div>
<div class=" col-md-4" id=""><div class="img-frame rounded"><div class="img-box figcaption-middle text-center fade-in"><a target="_self" href="javascript:;">
                                                        <img src="'.esc_url('http://www.mageewp.com/onetone/wp-content/uploads/sites/17/2015/11/8.jpg').'" class="feature-img">
                                                        <div class="img-overlay dark">
                                                            <div class="img-overlay-container">
                                                                <div class="img-overlay-content">
                                                                    <i class="fa fa-link"></i>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </a></div></div></div>
<div class=" col-md-4" id=""><div class="img-frame rounded"><div class="img-box figcaption-middle text-center fade-in"><a target="_self" href="javascript:;">
                                                        <img src="'.esc_url('http://www.mageewp.com/onetone/wp-content/uploads/sites/17/2015/11/9.jpg').'" class="feature-img">
                                                        <div class="img-overlay dark">
                                                            <div class="img-overlay-container">
                                                                <div class="img-overlay-content">
                                                                    <i class="fa fa-link"></i>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </a></div></div></div>
<div class=" col-md-4" id=""><div class="img-frame rounded"><div class="img-box figcaption-middle text-center fade-in"><a target="_self" href="javascript:;">
                                                        <img src="'.esc_url('http://www.mageewp.com/onetone/wp-content/uploads/sites/17/2015/11/10.jpg').'" class="feature-img">
                                                        <div class="img-overlay dark">
                                                            <div class="img-overlay-container">
                                                                <div class="img-overlay-content">
                                                                    <i class="fa fa-link"></i>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </a></div></div></div>
<div class=" col-md-4" id=""><div class="img-frame rounded"><div class="img-box figcaption-middle text-center fade-in"><a target="_self" href="javascript:;">
                                                        <img src="'.esc_url('http://www.mageewp.com/onetone/wp-content/uploads/sites/17/2015/11/11.jpg').'" class="feature-img">
                                                        <div class="img-overlay dark">
                                                            <div class="img-overlay-container">
                                                                <div class="img-overlay-content">
                                                                    <i class="fa fa-link"></i>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </a></div></div></div>
<div class=" col-md-4" id=""><div class="img-frame rounded"><div class="img-box figcaption-middle text-center fade-in"><a target="_self" href="javascript:;">
                                                        <img src="'.esc_url('http://www.mageewp.com/onetone/wp-content/uploads/sites/17/2015/11/12.jpg').'" class="feature-img">
                                                        <div class="img-overlay dark">
                                                            <div class="img-overlay-container">
                                                                <div class="img-overlay-content">
                                                                    <i class="fa fa-link"></i>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </a></div></div></div>
</div>',
			
						),
				 
				 //section 5
				  array(
						'section_title'=>'OUR TEAM',
						'menu_title'=>'Team',
						'menu_slug'=>'team',
						'section_background'=> array(
											  'color' => '#ffffff',
											  'image' => '',
											  'repeat' => 'repeat',
											  'position' => 'top left',
											  'attachment'=>'scroll' ),
						'section_title_typography'=> array('size'  => '36px','face'  => '','style' => 'bold','color' => '#666666' ),
						'section_content_typography'=> array('size'  => '14px','face'  => '','style' => 'normal','color' => '#666666' ),
						'parallax_scrolling'=>'no',
						'section_css_class'=>'',
						'section_padding'=>'50px 0',
						'text_align'=>'left',
						'section_content'=>'<p style="text-align: center">Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere ce.<br>
  Etiam ut dui eu nisi lobortis rhoncus ac quis nunc.</p>
<style type="text/css" scoped="scoped">
.divider-5642db4239a47{ margin-top: 30px;margin-bottom:0;width:100%;}.divider-5642db4239a47 .divider-border{border-bottom-width:; border-color:;}.divider-5642db4239a47 .double-line.divider-inner-item .divider-inner{border-top-width: ; border-bottom-width: ;}.divider-5642db4239a47 .divider-border.divider-inner-item .divider-inner{ border-bottom-width: ;} 
</style>
<div class=" divider divider-5642db4239a47" id="" style="margin-top:; margin-bottom:;">
  <div class="divider-inner divider-border"></div>
</div>
<div id="" class=" row">
  <div class=" col-md-3" id="">
    <style type="text/css" scoped="scoped">
.person-5642db423a0e2 .person-vcard.person-social li a i{ border-radius: 4px; background-color:#595959;} .person-5642db423a0e2 .img-box img{ border-radius: 0; display: inline-block;} .person-5642db423a0e2 .img-box img{border-width: 1px;border-style: solid;}.person-5642db423a0e2 .img-box img{border-color: #eeeeee;}
</style>
    <div class="magee-person-box  person-5642db423a0e2" id="">
      <div class="person-img-box">
        <div class="img-box figcaption-middle text-center fade-in"><a href="#"><img src="'.esc_url('http://www.mageewp.com/onetone/wp-content/uploads/sites/17/2015/11/001.jpg').'">
          <div class="img-overlay primary">
            <div class="img-overlay-container">
              <div class="img-overlay-content"><i class="fa fa-link"></i></div>
            </div>
          </div>
          </a></div>
      </div>
      <div class="person-vcard text-center">
        <h3 class="person-name" style="text-transform: uppercase;">Kevin Perry</h3>
        <h4 class="person-title" style="text-transform: uppercase;">Software Developer</h4>
        <p class="person-desc">Vivamus congue justo eget diam interdum scelerisque. In hac habitasse platea dictumst. </p>
        <ul class="person-social">
          <li><a href="#"><i class="fa fa-facebook"></i></a></li>
          <li><a href="#"><i class="fa fa-twitter"></i></a></li>
          <li><a href="#"><i class="fa fa-google-plus"></i></a></li>
        </ul>
      </div>
    </div>
  </div>
  <div class=" col-md-3" id="">
    <style type="text/css" scoped="scoped">
.person-5642db423a4bd .person-vcard.person-social li a i{ border-radius: 4px; background-color:#000000;} .person-5642db423a4bd .img-box img{ border-radius: 0; display: inline-block;} .person-5642db423a4bd .img-box img{border-width: 1px;border-style: solid;}.person-5642db423a4bd .img-box img{border-color: #eeeeee;}
</style>
    <div class="magee-person-box  person-5642db423a4bd" id="">
      <div class="person-img-box">
        <div class="img-box figcaption-middle text-center fade-in"><a href="#"><img src="'.esc_url('http://www.mageewp.com/onetone/wp-content/uploads/sites/17/2015/11/002.jpg').'">
          <div class="img-overlay primary">
            <div class="img-overlay-container">
              <div class="img-overlay-content"><i class="fa fa-link"></i></div>
            </div>
          </div>
          </a></div>
      </div>
      <div class="person-vcard text-center">
        <h3 class="person-name" style="text-transform: uppercase;">Jennifer Lee</h3>
        <h4 class="person-title" style="text-transform: uppercase;">Software Engineer</h4>
        <p class="person-desc">Vivamus congue justo eget diam interdum scelerisque. In hac habitasse platea dictumst. </p>
        <ul class="person-social">
          <li><a href="#"><i class="fa fa-facebook"></i></a></li>
          <li><a href="#"><i class="fa fa-twitter"></i></a></li>
          <li><a href="#"><i class="fa fa-google-plus"></i></a></li>
        </ul>
      </div>
    </div>
  </div>
  <div class=" col-md-3" id="">
    <style type="text/css" scoped="scoped">
.person-5642db423a876 .person-vcard.person-social li a i{ border-radius: 4px; background-color:#000000;} .person-5642db423a876 .img-box img{ border-radius: 0; display: inline-block;} .person-5642db423a876 .img-box img{border-width: 1px;border-style: solid;}.person-5642db423a876 .img-box img{border-color: #eeeeee;}
</style>
    <div class="magee-person-box  person-5642db423a876" id="">
      <div class="person-img-box">
        <div class="img-box figcaption-middle text-center fade-in"><a href="#"><img src="'.esc_url('http://www.mageewp.com/onetone/wp-content/uploads/sites/17/2015/11/003.jpg').'">
          <div class="img-overlay primary">
            <div class="img-overlay-container">
              <div class="img-overlay-content"><i class="fa fa-link"></i></div>
            </div>
          </div>
          </a></div>
      </div>
      <div class="person-vcard text-center">
        <h3 class="person-name" style="text-transform: uppercase;">Brandon Ross</h3>
        <h4 class="person-title" style="text-transform: uppercase;">Java Developer</h4>
        <p class="person-desc">Vivamus congue justo eget diam interdum scelerisque. In hac habitasse platea dictumst. </p>
        <ul class="person-social">
          <li><a href="#"><i class="fa fa-facebook"></i></a></li>
          <li><a href="#"><i class="fa fa-twitter"></i></a></li>
          <li><a href="#"><i class="fa fa-google-plus"></i></a></li>
        </ul>
      </div>
    </div>
  </div>
  <div class=" col-md-3" id="">
    <style type="text/css" scoped="scoped">
.person-5642db423ac2a .person-vcard.person-social li a i{ border-radius: 4px; background-color:#000000;} .person-5642db423ac2a .img-box img{ border-radius: 0; display: inline-block;} .person-5642db423ac2a .img-box img{border-width: 1px;border-style: solid;}.person-5642db423ac2a .img-box img{border-color: #eeeeee;}
</style>
    <div class="magee-person-box  person-5642db423ac2a" id="">
      <div class="person-img-box">
        <div class="img-box figcaption-middle text-center fade-in"><a href="#"><img src="'.esc_url('http://www.mageewp.com/onetone/wp-content/uploads/sites/17/2015/11/004.jpg').'">
          <div class="img-overlay primary">
            <div class="img-overlay-container">
              <div class="img-overlay-content"><i class="fa fa-link"></i></div>
            </div>
          </div>
          </a></div>
      </div>
      <div class="person-vcard text-center">
        <h3 class="person-name" style="text-transform: uppercase;">Sara Wright</h3>
        <h4 class="person-title" style="text-transform: uppercase;">Systems Engineer</h4>
        <p class="person-desc">Vivamus congue justo eget diam interdum scelerisque. In hac habitasse platea dictumst. </p>
        <ul class="person-social">
          <li><a href="#"><i class="fa fa-facebook"></i></a></li>
          <li><a href="#"><i class="fa fa-twitter"></i></a></li>
          <li><a href="#"><i class="fa fa-google-plus"></i></a></li>
        </ul>
      </div>
    </div>
  </div>
</div>
',
			
						),
				  
				  
				  //section 6
				  array(
						'section_title'=>'ABOUT',
						'menu_title'=>'About',
						'menu_slug'=>'about',
						'section_background'=> array(
												'color' => '',
												'image' => esc_url('http://www.mageewp.com/onetone/wp-content/uploads/sites/17/2015/11/banner_large.jpg'),
												'repeat' => 'repeat',
												'position' => 'top left',
												'attachment'=>'scroll' ),
						'section_title_typography'=> array('size'  => '36px','face'  => '','style' => 'bold','color' => '#ffffff' ),
						'section_content_typography'=> array('size'  => '14px','face'  => '','style' => 'normal','color' => '#ffffff' ),
						'parallax_scrolling'=>'no',
						'section_css_class'=>'',
						'section_padding'=>'50px 0',
						'text_align'=>'left',
						'section_content'=>'<p style="text-align:center">Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cet.<br>
    Etiam ut dui eu nisi lobortis rhoncus ac quis nunc.</p>
  <div id="" class=" row">
    <div class=" col-md-8" id="">
      <h3 style="color: #ffffff">Biography</h3>
      <p>Morbi rutrum, elit ac fermentum egestas, tortor ante vestibulum est, eget scelerisque nisl velit eget tellus. Fusce porta facilisis luctus. Integer neque dolor, rhoncus nec euismod eget, pharetra et tortor. Nulla id pulvinar nunc. Vestibulum auctor nisl vel lectus ullamcorper sed pellentesque dolor eleifend. Praesent lobortis magna vel diam mattis sagittis.Mauris porta odio eu risus scelerisque id facilisis ipsum dictum vitae volutpat. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed pulvinar neque eu purus sollicitudin et sollicitudin dui ultricies. Maecenas cursus auctor tellus sit amet blandit. Maecenas a erat ac nibh molestie interdum. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Sed lorem enim, ultricies sed sodales id, convallis molestie ipsum. Morbi eget dolor ligula. Vivamus accumsan rutrum nisi nec elementum. Pellentesque at nunc risus. Phasellus ullamcorper bibendum varius. Quisque quis ligula sit amet felis ornare porta. Aenean viverra lacus et mi elementum mollis. Praesent eu justo elit.</p>
    </div>
    <div class=" col-md-4" id="">
      <h3 style="color: #ffffff">Personal Info</h3>
      <style type="text/css" scoped="scoped"> 
.list-5642db423bf0c ul {margin: 0;} .list-5642db423bf0c li{list-style-type: none;padding-bottom: .8em;position: relative;padding-left: 2em;font-size:14px}
			.list-5642db423bf0c li i{text-align: center;width: 1.6em;height: 1.6em;line-height: 1.6em;position: absolute;top: 0;
				left: 0;background-color: ;color: ;} 
			.list-5642db423bf0c-icon-list-circle li i {border-radius: 50%;} .list-5642db423bf0c-icon-list-square li i {border-radius: 0;} 
</style>
      <ul class="magee-icon-list  list-5642db423bf0c" id="">
        <li><i class="fa fa-phone"></i> +1123 2456 689</li>
      </ul>
      <style type="text/css" scoped="scoped"> 
.list-5642db423c1c0 ul {margin: 0;} .list-5642db423c1c0 li{list-style-type: none;padding-bottom: .8em;position: relative;padding-left: 2em;font-size:14px}
			.list-5642db423c1c0 li i{text-align: center;width: 1.6em;height: 1.6em;line-height: 1.6em;position: absolute;top: 0;
				left: 0;background-color: ;color: ;} 
			.list-5642db423c1c0-icon-list-circle li i {border-radius: 50%;} .list-5642db423c1c0-icon-list-square li i {border-radius: 0;} 
</style>
      <ul class="magee-icon-list  list-5642db423c1c0" id="">
        <li><i class="fa fa-map-marker"></i> 3301 Lorem Ipsum, Dolor Sit St</li>
      </ul>
      <style type="text/css" scoped="scoped"> 
.list-5642db423c446 ul {margin: 0;} .list-5642db423c446 li{list-style-type: none;padding-bottom: .8em;position: relative;padding-left: 2em;font-size:14px}
			.list-5642db423c446 li i{text-align: center;width: 1.6em;height: 1.6em;line-height: 1.6em;position: absolute;top: 0;
				left: 0;background-color: ;color: ;} 
			.list-5642db423c446-icon-list-circle li i {border-radius: 50%;} .list-5642db423c446-icon-list-square li i {border-radius: 0;} 
</style>
      <ul class="magee-icon-list  list-5642db423c446" id="">
        <li><i class="fa fa-envelope-o"></i> <a href="#">support@mageewp.com</a>.</li>
      </ul>
      <style type="text/css" scoped="scoped"> 
.list-5642db423c6ef ul {margin: 0;} .list-5642db423c6ef li{list-style-type: none;padding-bottom: .8em;position: relative;padding-left: 2em;font-size:14px}
			.list-5642db423c6ef li i{text-align: center;width: 1.6em;height: 1.6em;line-height: 1.6em;position: absolute;top: 0;
				left: 0;background-color: ;color: ;} 
			.list-5642db423c6ef-icon-list-circle li i {border-radius: 50%;} .list-5642db423c6ef-icon-list-square li i {border-radius: 0;} 
</style>
      <ul class="magee-icon-list  list-5642db423c6ef" id="">
        <li><i class="fa fa-internet-explorer"></i> <a href="#">Mageewp.com</a></li>
      </ul>
    </div>
  </div>',
			
						),
				  
				  //section 7
				  array(
						'section_title'=>'TESTIMONIALS',
						'menu_title'=>'Testimonials',
						'menu_slug'=>'testimonials',
						'section_background'=>  array(
												  'color' => '#eda869',
												  'image' => esc_url('http://www.mageewp.com/onetone/wp-content/uploads/sites/17/2015/11/123.jpg'),
												  'repeat' => 'no-repeat',
												  'position' => 'bottom center',
												  'attachment'=>'scroll' ),
						'section_title_typography'=> array('size'  => '36px','face'  => '','style' => 'bold','color' => '#ffffff' ),
						'section_content_typography'=> array('size'  => '14px','face'  => '','style' => 'normal','color' => '#ffffff' ),
						'parallax_scrolling'=>'no',
						'section_css_class'=>'',
						'section_padding'=>'10px 0 50px',
						'text_align'=>'center',
						'section_content'=>'<p style="text-align: center;>Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere c.<br>Etiam ut dui eu nisi lobortis rhoncus ac quis nunc.</p>',
			
						),
				  
				   //section 8
				  array(
						'section_title'=>'',
						'menu_title'=>'',
						'menu_slug'=>'',
						'section_background'=>  array(
												  'color' => '#ffffff',
												  'image' => '',
												  'repeat' => 'no-repeat',
												  'position' => 'bottom center',
												  'attachment'=>'scroll' ),
						'section_title_typography'=> array('size'  => '36px','face'  => '','style' => 'bold','color' => '#666666' ),
						'section_content_typography'=> array('size'  => '14px','face'  => '','style' => 'normal','color' => '#666666' ),
						'parallax_scrolling'=>'no',
						'section_css_class'=>'',
						'section_padding'=>'50px 0',
						'text_align'=>'left',
						'section_content'=>'<div id="" class=" row"></div>
  <div class=" col-md-4" id="">
    <div class="magee-testimonial-box   " is="">
      <div class="testimonial-content">
        <div class="testimonial-quote">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris consequat non ex quis consectetur. Aliquam iaculis dolor erat, ut ornare dui vulputate nec. Cras a sem mattis, tincidunt urna nec, iaculis nisl. Nam congue ultricies dui.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris consequat non ex quis consectetur. Aliquam iaculis dolor erat, ut ornare dui vulputate nec. Cras a sem mattis, tincidunt urna nec, iaculis nisl. Nam congue ultricies dui.</div>
      </div>
      <div class="testimonial-vcard style1">
        <div class="testimonial-avatar"><img src="'.esc_url('http://www.mageewp.com/onetone/wp-content/uploads/sites/17/2015/11/111.jpg').'" class="img-circle"></div>
        <div class="testimonial-author">
          <h4 class="name" style="text-transform: uppercase;color: #000;">JACK GREEN</h4>
          <div class="title">Web Developer</div>
        </div>
      </div>
    </div>
  </div>
  <div class=" col-md-4" id="">
    <div class="magee-testimonial-box   " is="">
      <div class="testimonial-content">
        <div class="testimonial-quote">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris consequat non ex quis consectetur. Aliquam iaculis dolor erat, ut ornare dui vulputate nec. Cras a sem mattis, tincidunt urna nec, iaculis nisl. Nam congue ultricies dui.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris consequat non ex quis consectetur. Aliquam iaculis dolor erat, ut ornare dui vulputate nec. Cras a sem mattis, tincidunt urna nec, iaculis nisl. Nam congue ultricies dui.</div>
      </div>
      <div class="testimonial-vcard style1">
        <div class="testimonial-avatar"><img src="'.esc_url('http://www.mageewp.com/onetone/wp-content/uploads/sites/17/2015/11/222.jpg').'" class="img-circle"></div>
        <div class="testimonial-author">
          <h4 class="name" style="text-transform: uppercase;color: #000;">ANNA CASS</h4>
          <div class="title">Conference</div>
        </div>
      </div>
    </div>
  </div>
  <div class=" col-md-4" id="">
    <div class="magee-testimonial-box   " is="">
      <div class="testimonial-content">
        <div class="testimonial-quote">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris consequat non ex quis consectetur. Aliquam iaculis dolor erat, ut ornare dui vulputate nec. Cras a sem mattis, tincidunt urna nec, iaculis nisl. Nam congue ultricies dui.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris consequat non ex quis consectetur. Aliquam iaculis dolor erat, ut ornare dui vulputate nec. Cras a sem mattis, tincidunt urna nec, iaculis nisl. Nam congue ultricies dui.</div>
      </div>
      <div class="testimonial-vcard style1">
        <div class="testimonial-avatar"><img src="'.esc_url('http://www.mageewp.com/onetone/wp-content/uploads/sites/17/2015/11/333.jpg').'" class="img-circle"></div>
        <div class="testimonial-author">
          <h4 class="name" style="text-transform: uppercase;color: #000;">JEREMY THOMAS</h4>
          <div class="title">CEO Conference</div>
        </div>
      </div>
    </div>
  </div>
  <div id="" class=" row"></div>',

			
						),
				  
				  
				    
  //section 9
				  array(
						'section_title'=>'CONTACT',
						'menu_title'=>'Contact',
						'menu_slug'=>'contact',
						'section_background'=>  array(
												  'color' => '',
												  'image' => esc_url('http://www.mageewp.com/onetone/wp-content/uploads/sites/17/2015/11/last4.jpg'),
												  'repeat' => 'no-repeat',
												  'position' => 'bottom center',
												  'attachment'=>'scroll' ),
						'section_title_typography'=> array('size'  => '36px','face'  => '','style' => 'bold','color' => '#666666' ),
						'section_content_typography'=> array('size'  => '14px','face'  => '','style' => 'normal','color' => '#666666' ),
						'parallax_scrolling'=>'no',
						'section_css_class'=>'',
						'section_padding'=>'50px 0',
						'text_align'=>'center',
						'section_content'=>'<p style="text-align: center; color: #666666;">Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere ced.<br>Etiam ut dui eu nisi lobortis rhoncus ac quis nunc.</p>
<div class="contact-area"><form class="contact-form" action="" method="post"><input id="name" tabindex="1" name="name" size="22" type="text" value="" placeholder="Name" />
<input id="email" tabindex="2" name="email" size="22" type="text" value="" placeholder="Email" />
<textarea id="message" tabindex="4" cols="39" name="x-message" rows="7" placeholder="Message"></textarea>
<input id="sendto" name="sendto" type="hidden" value="YOUR EMAIL HERE(Default Admin Email)" />
<input id="submit" name="submit" type="button" value="Post" /></form></div>',
			
						),
				  
				  );
 

 if(isset($section_num) && is_numeric($section_num ) && $section_num >0):
 for( $i = 0; $i < $section_num ;$i++){
	 
	 if( $section_1_content == 'slider' && $i == 0 ){
		 
		echo onetone_get_default_slider(); 
		 
		 }else{
 
 $section_title       = onetone_option( 'section_title_'.$i ,isset($default_options[$i]['section_title'])?$default_options[$i]['section_title']:'');
 $section_menu        = onetone_option( 'menu_title_'.$i ,isset($default_options[$i]['menu_title'])?$default_options[$i]['menu_title']:'');
 $section_background  = onetone_option( 'section_background_'.$i,isset($default_options[$i]['section_background'])?$default_options[$i]['section_background']:'' );
 $parallax_scrolling  = onetone_option( 'parallax_scrolling_'.$i,isset($default_options[$i]['parallax_scrolling'])?$default_options[$i]['parallax_scrolling']:'' );
 $section_css_class   = onetone_option( 'section_css_class_'.$i ,isset($default_options[$i]['section_css_class'])?$default_options[$i]['section_css_class']:'');
 $section_content     = onetone_option( 'section_content_'.$i ,isset($default_options[$i]['section_content'])?$default_options[$i]['section_content']:onetone_option( 'sction_content_'.$i ));

 $section_slug        = onetone_option( 'menu_slug_'.$i ,isset($default_options[$i]['menu_slug'])?$default_options[$i]['menu_slug']:'');
 $section_padding     = onetone_option( 'section_padding_'.$i ,isset($default_options[$i]['section_padding'])?$default_options[$i]['section_padding']:'50px 0');
 $text_align          = onetone_option( 'text_align_'.$i,isset($default_options[$i]['text_align'])?$default_options[$i]['text_align']:'');
 
 
 
 $section_title_typography    = onetone_option( 'section_title_typography_'.$i,isset($default_options[$i]['section_title_typography'])?$default_options[$i]['section_title_typography']:'');
 $title_typography            = onetone_get_typography( $section_title_typography );
 
 $section_content_typography  = onetone_option( 'section_content_typography_'.$i,isset($default_options[$i]['section_content_typography'])?$default_options[$i]['section_content_typography']:'');
 $content_typography          = onetone_get_typography( $section_content_typography );
 

 if( $section_slug )
  $section_slug =  sanitize_title($section_slug );
  else
  $section_slug = 'section-'.($i+1);
  
 $section_css = '';
 $background  = onetone_get_background($section_background);
 
 $sanitize_title = $section_slug; 
 
 $css_class = isset($section_css_class)?$section_css_class:"";
 
  $background_video = '';
  $video_wrap = '';
  $video_enable = 0;
  $detect = new Mobile_Detect;
  if($section_background_video != "" && $video_background_section == ($i+1) && !$detect->isMobile() && !$detect->isTablet() ){
	$video_enable = 1;  
  }
  
  if( $parallax_scrolling == "yes" ){
	 $css_class  .= ' onetone-parallax';
	 $section_css .= 'background-attachment:fixed;background-position:50% 0;background-repeat:no-repeat;';
	 }
  
 if($video_enable == 1){

    $background_video  = array("videoId"=>$section_background_video,"mute"=>false,"start"=>3 ,"container" =>"section.onetone-".$sanitize_title,"playerid"=>$sanitize_title);
    $video_section_item = "section.onetone-".$sanitize_title;
    $video_array[]  =  array("options"=>$background_video,  "video_section_item"=>$video_section_item );
	$background = "";
	$video_wrap = "video-section";
	}
	$section_css .= $background;
	if( $section_padding )
    $section_css .= 'padding:'.$section_padding.';';
	
	$section_content_css = '';
	$section_title_css = 'section#'.$section_slug.' .section-title{text-align:center;}';
	if( $title_typography )
	$section_title_css .= 'section#'.$section_slug.' .section-title{'.$title_typography.' }';
	
	if( $content_typography )
	$section_content_css .= 'section#'.$section_slug.' .home-section-content,section#'.$section_slug.' .home-section-content p{'.$content_typography.'}';
	
	if( $text_align )
    $section_content_css .= 'section#'.$section_slug.' .home-section-content{text-align:'.$text_align.'}';
	
	$section_content_css .=  'section#'.$section_slug.' {'.$section_css.'}';

 ?>
 <style><?php echo $section_title_css;?> <?php echo $section_content_css;?></style>
            <section id="<?php echo $section_slug;?>" class="section <?php echo esc_attr($css_class);?> onetone-<?php echo $sanitize_title;?> <?php echo $video_wrap;?>"  >
              <div class="home-container container" >
                <?php if($section_title){?>
                <h1 class="section-title"><?php echo esc_attr($section_title);?></h1>
                <?php } ?>
                <div class="home-section-content">
                <?php echo do_shortcode(wp_kses( $section_content, $allowedposttags  ));?> 
                </div>
                </div>
              <div class="clear"></div>
              <?php 
	  if( $video_enable == 1 && $video_controls == 1 ){
		   $background = "";
		if(  !$detect->isMobile() && !$detect->isTablet() ){
		
	  echo '<p class="black-65" id="video-controls">
		  <a class="tubular-play" href="#"><i class="fa fa-play "></i></a>&nbsp; &nbsp;&nbsp;&nbsp;
		  <a class="tubular-pause" href="#"><i class="fa fa-pause "></i></a>&nbsp;&nbsp;&nbsp;&nbsp;
		  <a class="tubular-volume-up" href="#"><i class="fa fa-volume-up "></i></a>&nbsp;&nbsp;&nbsp;&nbsp;
		  <a class="tubular-volume-down" href="#"><i class="fa fa-volume-off "></i></a> 
	  </p>';
		}
	 }
	 ?>
            </section>
            <?php
 }
 }
  if($video_array !="" && $video_array != NULL ){
  wp_localize_script( 'onetone-bigvideo', 'onetone_bigvideo',$video_array);
  
		}

 endif;
 ?>
            <div class="clear"></div>
          </article>
        </section>
      </div>
    </div>
  </div>
</div>
<?php endif;?>
<?php get_footer();?>
