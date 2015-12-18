<?php
/**
* The archive template file.
*
*/
get_header(); 

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
        
 <?php get_footer();?>