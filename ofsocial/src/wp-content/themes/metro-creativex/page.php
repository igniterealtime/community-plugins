<?php
/**
 * The template for displaying all pages.
 * @package metro-creativex
 */
get_header(); ?>
	<?php  while ( have_posts() ) : the_post(); ?>
		<?php do_action('page_title','metro_creativex_page_title');?>
		</div><!--/topside-->
		<?php
			do_action('metro_customizr_page_title');
		?>
		<div id="content">
			<div class="post">
				<?php 
					the_content(); 
					wp_link_pages();
					edit_post_link( __('Edit page', 'metro-creativex'));
				?>
			</div><!--/post-->
			<?php metro_creativex_pagination(); ?>
			<?php comments_template(); ?>
		</div><!-- /content -->
		<?php do_action('metro_customizr_right_sidebar');?>
	<?php endwhile; ?>
<?php get_footer(); ?>