<?php
    $right_sidebar_blog_archive = esc_attr(onetone_option('right_sidebar_blog_archive',''));

	 if ( $right_sidebar_blog_archive && is_active_sidebar( $right_sidebar_blog_archive ) ){
	    dynamic_sidebar( $right_sidebar_blog_archive );
	 }
	 elseif( is_active_sidebar( 'default_sidebar' ) ) {
	    dynamic_sidebar('default_sidebar');
	 }