<?php
// global $wp_registered_sidebars;
#########################################
function onetone_widgets_init() {
	
	global $sidebars ;
	  $sidebars =   array(
            ''  => __( 'No Sidebar', 'onetone' ),
		    'default_sidebar'  => __( 'Default Sidebar', 'onetone' ),
			'sidebar-1'  => __( 'Sidebar 1', 'onetone' ),
			'sidebar-2'  => __( 'Sidebar 2', 'onetone' ),
			'sidebar-3'  => __( 'Sidebar 3', 'onetone' ),
			'sidebar-4'  => __( 'Sidebar 4', 'onetone' ),
			'sidebar-5'  => __( 'Sidebar 5', 'onetone' ),
			'sidebar-5'  => __( 'Sidebar 5', 'onetone' ),
			'sidebar-6'  => __( 'Sidebar 6', 'onetone' ),
			'sidebar-7'  => __( 'Sidebar 7', 'onetone' ),
			'sidebar-8'  => __( 'Sidebar 8', 'onetone' ),
			'footer_widget_1'  => __( 'Footer Area One', 'onetone' ),
			'footer_widget_2'  => __( 'Footer Area Two', 'onetone' ),
			'footer_widget_3'  => __( 'Footer Area Three', 'onetone' ),
			'footer_widget_4'  => __( 'Footer Area Four', 'onetone' ),
          );
	  
	  foreach( $sidebars as $k => $v ){
		  if( $k !='' ){
		  register_sidebar(array(
			'name' => $v,
			'id'   => $k,
			'before_widget' => '<div id="%1$s" class="widget widget-box %2$s">', 
			'after_widget' => '<span class="seperator extralight-border"></span></div>', 
			'before_title' => '<h2 class="widget-title">', 
			'after_title' => '</h2>' 
			));
		  }
		  }
	    
		
}
add_action( 'widgets_init', 'onetone_widgets_init' );