<?php
/**
 * The default template for displaying content. Used for both single and index/archive/search.
 *
 * @package metro-creativex
 */
	$post_id = get_the_ID();
?>
			<article <?php post_class(); do_action('metro_creativex_post_background',$post_id);?>>
				<?php 
					$metro_creativex_posttitle = get_the_title();
					$metro_creativex_feat_image = wp_get_attachment_image_src( get_post_thumbnail_id( $post->ID ), 'single-post-thumbnail' );
					if(isset($metro_creativex_feat_image[0])):
						echo '<div class="img">'.get_the_post_thumbnail().'</div>';
					endif;	
				?>
				<div class="post_icon" style="background-image:url(<?php echo get_template_directory_uri(); ?>/images/pt_standard.png);"></div>
				<div class="post_content">
					<a href="<?php the_permalink(); ?>"><?php the_title(); ?></a>
					<div class="short_excerpt">
						<?php echo metro_creativex_excerpt_max_charlength(160); ?>
					</div><!--/excerpt-->
					<div class="post_date"><?php the_time( get_option( 'date_format' ) ); ?></div>
				</div><!--/post_content-->
			</article>
