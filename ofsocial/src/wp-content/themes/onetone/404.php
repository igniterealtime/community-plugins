<?php

get_header(); 
$left_sidebar    = onetone_option('left_sidebar_404');
$right_sidebar   = onetone_option('right_sidebar_404');
$sidebar         = 'none';

if( $left_sidebar )
$sidebar = 'left';
if( $right_sidebar )
$sidebar = 'right';
if( $left_sidebar && $right_sidebar )
$sidebar = 'both';
$container       = 'container';
global $allowedposttags

?>
<!--Main Area-->
<section class="page-title-bar title-left no-subtitle" style="">
    <div class="container">
      <?php onetone_get_breadcrumb(array("before"=>"<div class=''>","after"=>"</div>","show_browse"=>false,"separator"=>'','container'=>'div'));?>
      <div class="clearfix"></div>
    </div>
  </section>
<div class="page-wrap">
  <div class="<?php echo $container;?>">
    <div class="page-inner row <?php echo onetone_get_content_class($sidebar);?>">
      <div class="col-main">
        <section class="page-main" role="main" id="content">
          <div class="page-content">
          <?php echo do_shortcode(wp_kses_post(onetone_option('content_404'), $allowedposttags) );?>
           </div>
          <!-- #page-content -->
          <div class="post-attributes"></div>
        </section>
        <!-- #page-main -->
      </div>
      <!-- #col-main -->
      <?php if( $sidebar == 'left' || $sidebar == 'both'  ): ?>
      <div class="col-aside-left">
        <aside class="blog-side left text-left">
          <div class="widget-area">
            <?php get_sidebar('404left');?>
          </div>
        </aside>
      </div>
      <?php endif; ?>
      <?php if( $sidebar == 'right' || $sidebar == 'both'  ): ?>
      <div class="col-aside-right">
        <div class="widget-area">
          <?php get_sidebar('404right');?>
        </div>
      </div>
      <?php endif; ?>
      <!-- #col-side -->
    </div>
    <!-- #page-inner -->
  </div>
  <!-- #container -->
</div>
<!-- #page-wrap -->
<?php get_footer(); ?>