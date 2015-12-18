<?php
    $left_sidebar_blog_archive = esc_attr(onetone_option('left_sidebar_blog_archive',''));

	 if ( $left_sidebar_blog_archive && is_active_sidebar( $left_sidebar_blog_archive ) ){
	 dynamic_sidebar( $left_sidebar_blog_archive );
	 }
	 elseif( is_active_sidebar( 'default_sidebar' ) ) {
	 dynamic_sidebar('default_sidebar');
	 }