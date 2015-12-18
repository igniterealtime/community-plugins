<?php
    $left_sidebar_blog_posts = esc_attr(onetone_option('left_sidebar_blog_posts',''));

	 if ( $left_sidebar_blog_posts && is_active_sidebar( $left_sidebar_blog_posts ) ){
	 dynamic_sidebar( $left_sidebar_blog_posts );
	 }
	 elseif( is_active_sidebar( 'default_sidebar' ) ) {
	 dynamic_sidebar('default_sidebar');
	 }