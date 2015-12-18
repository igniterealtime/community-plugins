<?php
    global  $page_meta;

	$left_sidebar = (isset($page_meta['left_sidebar']) && $page_meta['left_sidebar']!="")?$page_meta['left_sidebar']:'';
	 if ( $left_sidebar && is_active_sidebar( $left_sidebar ) ){
	 dynamic_sidebar( $left_sidebar );
	 }
	 elseif( is_active_sidebar( 'default_sidebar' ) ) {
	 dynamic_sidebar('default_sidebar');
	 }