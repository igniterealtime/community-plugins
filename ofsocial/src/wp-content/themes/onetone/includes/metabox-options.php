<?php

/**
 * Calls the class on the post edit screen.
 */
function onetone_call_metaboxClass() {
    new onetone_metaboxClass();
}

if ( is_admin() ) {
    add_action( 'load-post.php', 'onetone_call_metaboxClass' );
    add_action( 'load-post-new.php', 'onetone_call_metaboxClass' );
}

/** 
 * The Class.
 */
class onetone_metaboxClass {

	/**
	 * Hook into the appropriate actions when the class is constructed.
	 */
	public function __construct() {
		add_action( 'add_meta_boxes', array( $this, 'onetone_add_meta_box' ) );
		add_action( 'save_post', array( $this, 'onetone_save' ) );
	}

	/**
	 * Adds the meta box container.
	 */
	public function onetone_add_meta_box( $post_type ) {
            $post_types = array( 'page');     //limit meta box to certain post types
            if ( in_array( $post_type, $post_types )) {
		add_meta_box(
			'onetone_page_meta_box'
			,__( 'Onetone Metabox Options', 'onetone' )
			,array( $this, 'onetone_render_meta_box_content' )
			,$post_type
			,'advanced'
			,'high'
		);
            }
	}
// get onetone sliders from plugin magee shrotcodes

 public static function onetone_sliders_meta(){
	 $onetone_sliders[] = array(
            'label'       => __( 'Select a slider', 'onetone' ),
            'value'       => ''
          );
	$onetone_custom_slider = new WP_Query( array( 'post_type' => 'magee_slider', 'post_status'=>'publish', 'posts_per_page' => -1 ) );
	while ( $onetone_custom_slider->have_posts() ) {
		$onetone_custom_slider->the_post();

		$onetone_sliders[] = array(
            'label'       => get_the_title(),
            'value'       => get_the_ID()
          );
	}
	wp_reset_postdata();
	return $onetone_sliders;
	 }
  
	/**
	 * Save the meta when the post is saved.
	 *
	 * @param int $post_id The ID of the post being saved.
	 */
	public function onetone_save( $post_id ) {
	
		/*
		 * We need to verify this came from the our screen and with proper authorization,
		 * because save_post can be triggered at other times.
		 */
		

		// Check if our nonce is set.
		if ( ! isset( $_POST['onetone_inner_custom_box_nonce'] ) )
			return $post_id;

		$nonce = $_POST['onetone_inner_custom_box_nonce'];

		// Verify that the nonce is valid.
		if ( ! wp_verify_nonce( $nonce, 'onetone_inner_custom_box' ) )
			return $post_id;
			
			

		// If this is an autosave, our form has not been submitted,
                //     so we don't want to do anything.
		if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) 
			return $post_id;

		// Check the user's permissions.
		if ( 'page' == $_POST['post_type'] ) {

			if ( ! current_user_can( 'edit_page', $post_id ) )
				return $post_id;
	
		} else {

			if ( ! current_user_can( 'edit_post', $post_id ) )
				return $post_id;
		}


		/* OK, its safe for us to save the data now. */

		// Sanitize the user input.
		//$show_breadcrumb        = sanitize_text_field( $_POST['onetone_show_breadcrumb'] );
		//$onetone_layout          = sanitize_text_field( $_POST['onetone_layout'] );

		if( isset($_POST) && $_POST ){
			
			
		$post_metas                      = array();
		$post_metas['header_position']   =  isset($_POST['header_position'])?$_POST['header_position']:'top';
		$post_metas['full_width']        =  isset($_POST['full_width'])?$_POST['full_width']:'no';
		$post_metas['padding_top']       =  isset($_POST['padding_top'])?$_POST['padding_top']:'';
		$post_metas['padding_bottom']    =  isset($_POST['padding_bottom'])?$_POST['padding_bottom']:'';
		$post_metas['display_breadcrumb'] =  isset($_POST['display_breadcrumb'])?$_POST['display_breadcrumb']:'yes';
		$post_metas['nav_menu']          =  isset($_POST['nav_menu'])?$_POST['nav_menu']:'';
		$post_metas['page_layout']       =  isset($_POST['page_layout'])?$_POST['page_layout']:'none';
		$post_metas['left_sidebar']      =  isset($_POST['left_sidebar'])?$_POST['left_sidebar']:'';
		$post_metas['right_sidebar']     =  isset($_POST['right_sidebar'])?$_POST['right_sidebar']:'';
		$post_metas['slider_banner']     =  isset($_POST['slider_banner'])?$_POST['slider_banner']:'0';
		$post_metas['banner_position']   =  isset($_POST['banner_position'])?$_POST['banner_position']:'1';
		$post_metas['magee_slider']      =  isset($_POST['magee_slider'])?$_POST['magee_slider']:'';
		$post_metas['display_title']     =  isset($_POST['display_title'])?$_POST['display_title']:'yes';
			 
		$onetone_post_meta = json_encode( $post_metas );
		// Update the meta field.
		update_post_meta( $post_id, '_onetone_post_meta', $onetone_post_meta );
		}

	
	}


	/**
	 * Render Meta Box content.
	 *
	 * @param WP_Post $post The post object.
	 */
	public function onetone_render_meta_box_content( $post ) {
	
	   global $wp_registered_sidebars;
	   
	 //  $magee_sliders = self::onetone_sliders_meta();
	   
		// Add an nonce field so we can check for it later.
		wp_nonce_field( 'onetone_inner_custom_box', 'onetone_inner_custom_box_nonce' );

		// Use get_post_meta to retrieve an existing value from the database.
	    $page_meta  = get_post_meta( $post->ID ,'_onetone_post_meta',true);
		$page_metas = @json_decode( $page_meta,true );
		if( $page_metas )
	    extract( $page_metas );
		
	
		/************ get nav menus*************/
		
		$nav_menus[] = array(
            'label'       => __( 'Default', 'onetone' ),
            'value'       => ''
          );
		$menus = get_registered_nav_menus();
		
		foreach ( $menus as $location => $description ) {
		$nav_menus[] = array(
					'label'       => $description,
					'value'       => $location
				  );
			
		}
		
		/* sidebars */

	  $sidebars[] = array(
				  'label'       => __( 'None', 'onetone' ),
				  'value'       => ''
				);
	  
	  foreach( $wp_registered_sidebars as $key => $value){
		  
		  $sidebars[] = array(
				  'label'       => $value['name'],
				  'value'       => $value['id'],
				);
		  }
		  
		// Display the form, using the current value.
		$full_width         = isset( $full_width )? $full_width:'no'; 
		$page_layout        = isset( $page_layout )? $page_layout:'none'; 
		$left_sidebar       = isset( $left_sidebar )? $left_sidebar:''; 
		$right_sidebar      = isset( $right_sidebar )? $right_sidebar:''; 
		$display_breadcrumb = isset( $display_breadcrumb )? $display_breadcrumb:'yes'; 
		$display_title      = isset( $display_title )? $display_title:'yes'; 
		
		$padding_top         = isset( $padding_top )? $padding_top:'50px';
		$padding_bottom      = isset( $padding_bottom )? $padding_top:'50px';
		
		echo '<p class="meta-options"><label for="full_width"  style="display: inline-block;width: 150px;">';
		_e( 'Content Full Width', 'onetone' );
		echo '</label> ';
		echo '<select name="full_width" id="full_width">
		<option '.selected($full_width,'no',false).' value="no">'.__("No","onetone").'</option>
		<option '.selected($full_width,'yes',false).' value="yes">'.__("Yes","onetone").'</option>
		</select></p>';
		
		
		echo '<p class="meta-options"><label for="display_breadcrumb"  style="display: inline-block;width: 150px;">';
		_e( 'Display Breadcrumb', 'onetone' );
		echo '</label> ';
		echo '<select name="display_breadcrumb" id="display_breadcrumb">
		<option '.selected($display_breadcrumb,'yes',false).' value="yes">'.__("Yes","onetone").'</option>
		<option '.selected($display_breadcrumb,'no',false).' value="no">'.__("No","onetone").'</option>
		</select></p>';
		
		echo '<p class="meta-options"><label for="padding_top"  style="display: inline-block;width: 150px;">';
		_e( 'Padding Top', 'onetone' );
		echo '</label> ';
		echo '<input name="padding_top" type="text" value="'.$padding_top.'" />';
		echo '</p>';
		
		echo '<p class="meta-options"><label for="padding_bottom"  style="display: inline-block;width: 150px;">';
		_e( 'Padding Bottom', 'onetone' );
		echo '</label> ';
		echo '<input name="padding_bottom" type="text" value="'.$padding_bottom.'" />';
		echo '</p>';	
		
		echo '<p class="meta-options"><label for="page_layout"  style="display: inline-block;width: 150px;">';
		_e( 'Page Layout', 'onetone' );
		echo '</label> ';
		echo '<select name="page_layout" id="page_layout">
		<option '.selected($page_layout,'none',false).' value="none">'.__("No Sidebar","onetone").'</option>
		<option '.selected($page_layout,'left',false).' value="left">'.__("Left Sidebar","onetone").'</option>
		<option '.selected($page_layout,'right',false).' value="right">'.__("Right Sidebar","onetone").'</option>
		<option '.selected($page_layout,'both',false).' value="both">'.__("Both Sidebar","onetone").'</option>
		</select></p>';
		
		
		echo '<p class="meta-options"><label for="left_sidebar"  style="display: inline-block;width: 150px;">';
		_e( 'Select Left Sidebar', 'onetone' );
		echo '</label> ';
		echo '<select name="left_sidebar" id="left_sidebar">';
		foreach( $sidebars as $sidebar ){
		echo '<option '.selected($left_sidebar,$sidebar['value'],false).' value="'.$sidebar['value'].'">'.$sidebar['label'].'</option>';
		}
		echo '</select></p>';
		
		echo '<p class="meta-options"><label for="right_sidebar"  style="display: inline-block;width: 150px;">';
		_e( 'Select Right Sidebar', 'onetone' );
		echo '</label> ';
		echo '<select name="right_sidebar" id="right_sidebar">';
		foreach( $sidebars as $sidebar ){
		echo '<option '.selected($right_sidebar,$sidebar['value'],false).' value="'.$sidebar['value'].'">'.$sidebar['label'].'</option>';
		}
		echo '</select></p>';
		
		
		
	}
}