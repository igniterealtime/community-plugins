<?php
    $left_sidebar = esc_attr(onetone_option('left_sidebar_search',''));

	 if ( $left_sidebar && is_active_sidebar( $left_sidebar ) ){
	 dynamic_sidebar( $left_sidebar );
	 }
	 elseif( is_active_sidebar( 'default_sidebar' ) ) {
	 dynamic_sidebar('default_sidebar');
	 }