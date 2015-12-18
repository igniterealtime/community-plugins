<?php

define( 'ONETONE_THEME_BASE_URL', get_template_directory_uri());
define( 'ONETONE_OPTIONS_FRAMEWORK', get_template_directory().'/admin/' ); 
define( 'ONETONE_OPTIONS_FRAMEWORK_URI',  ONETONE_THEME_BASE_URL. '/admin/'); 
define('ONETONE_OPTIONS_PREFIXED' ,'onetone_');

define( 'OPTIONS_FRAMEWORK_DIRECTORY', get_template_directory_uri() . '/admin/' );
require_once dirname( __FILE__ ) . '/admin/options-framework.php';
require_once get_template_directory() . '/includes/admin-options.php';



/**
 * Required: include options framework.
 **/
load_template( trailingslashit( get_template_directory() ) . 'admin/options-framework.php' );

/**
 * Mobile Detect Library
 **/
 if(!class_exists("Mobile_Detect")){
   load_template( trailingslashit( get_template_directory() ) . 'includes/Mobile_Detect.php' );
 }
/**
 * Theme setup
 **/
 
load_template( trailingslashit( get_template_directory() ) . 'includes/theme-setup.php' );

/**
 * Theme Functions
 **/
 
load_template( trailingslashit( get_template_directory() ) . 'includes/theme-functions.php' );

/**
 * Theme breadcrumb
 */
load_template( trailingslashit( get_template_directory() ) . 'includes/breadcrumb-trail.php');

/**
 * Theme widget
 **/
 
load_template( trailingslashit( get_template_directory() ) . 'includes/theme-widget.php' );

/**
 * Meta box
 **/
 
load_template( trailingslashit( get_template_directory() ) . 'includes/metabox-options.php' );


/**
 * Include the TGM_Plugin_Activation class.
 */
load_template( trailingslashit( get_template_directory() ) . 'includes/class-tgm-plugin-activation.php' );


add_action( 'tgmpa_register', 'onetone_theme_register_required_plugins' );

/**
 * Register the required plugins for this theme.
 *
 * In this example, we register two plugins - one included with the TGMPA library
 * and one from the .org repo.
 *
 * The variable passed to tgmpa_register_plugins() should be an array of plugin
 * arrays.
 *
 * This function is hooked into tgmpa_init, which is fired within the
 * TGM_Plugin_Activation class constructor.
 */
function onetone_theme_register_required_plugins() {

    /**
     * Array of plugin arrays. Required keys are name and slug.
     * If the source is NOT from the .org repo, then source is also required.
     */
    $plugins = array(
		// This is an example of how to include a plugin pre-packaged with a theme
		array(
			'name'     				=> __('Magee Shortcodes','onetone'), // The plugin name
			'slug'     				=> 'magee-shortcodes', // The plugin slug (typically the folder name)
			'source'   				=> esc_url('https://downloads.wordpress.org/plugin/magee-shortcodes.zip'), // The plugin source
			'required' 				=> true, // If false, the plugin is only 'recommended' instead of required
			'version' 				=> '1.2.4', // E.g. 1.0.0. If set, the active plugin must be this version or higher, otherwise a notice is presented
			'force_activation' 		=> false, // If true, plugin is activated upon theme activation and cannot be deactivated until theme switch
			'force_deactivation' 	=> false, // If true, plugin is deactivated upon theme switch, useful for theme-specific plugins
			'external_url' 			=> '', // If set, overrides default API URL and points to an external URL
			'id'           => 'magee-shortcodes', 
			
		
		),
		
	);

    /**
     * Array of configuration settings. Amend each line as needed.
     * If you want the default strings to be available under your own theme domain,
     * leave the strings uncommented.
     * Some of the strings are added into a sprintf, so see the comments at the
     * end of each line for what each argument will be.
     */
    $config = array(
        'id'           => 'onetone',                 // Unique ID for hashing notices for multiple instances of TGMPA.
        'default_path' => '',                      // Default absolute path to pre-packaged plugins.
        'menu'         => 'onetone-install-plugins', // Menu slug.
        'has_notices'  => true,                    // Show admin notices or not.
        'dismissable'  => false,                    // If false, a user cannot dismiss the nag message.
        'dismiss_msg'  => '',                      // If 'dismissable' is false, this message will be output at top of nag.
        'is_automatic' => false,                   // Automatically activate plugins after installation or not.
        'message'      => '',                      // Message to output right before the plugins table.
        'strings'      => array(
            'page_title'                      => __( 'Install Required Plugins', 'onetone' ),
            'menu_title'                      => __( 'Install Plugins', 'onetone' ),
            'installing'                      => __( 'Installing Plugin: %s', 'onetone' ), // %s = plugin name.
            'oops'                            => __( 'Something went wrong with the plugin API.', 'onetone' ),
            'notice_can_install_required'     => _n_noop( 'This theme requires the following plugin: %1$s.<br/><span style="color:red;">NOTICE:</span> Onetone includes all shortcodes inside the Magee Shortcodes plugin. As to best user experience, please activate it now.', 'This theme requires the following plugins: %1$s.<br/><span style="color:red;">NOTICE:</span> Onetone includes all shortcodes inside the Magee Shortcodes plugin. As to best user experience, please activate it now.', 'onetone' ), // %1$s = plugin name(s).
            'notice_can_install_recommended'  => _n_noop( 'This theme recommends the following plugin: %1$s.', 'This theme recommends the following plugins: %1$s.', 'onetone' ), // %1$s = plugin name(s).
            'notice_cannot_install'           => _n_noop( 'Sorry, but you do not have the correct permissions to install the %s plugin. Contact the administrator of this site for help on getting the plugin installed.', 'Sorry, but you do not have the correct permissions to install the %s plugins. Contact the administrator of this site for help on getting the plugins installed.', 'onetone' ), // %1$s = plugin name(s).
            'notice_can_activate_required'    => _n_noop( 'The following required plugin is currently inactive: %1$s.<br/><span style="color:red;">NOTICE:</span> Onetone includes all shortcodes inside the Magee Shortcodes plugin. As to best user experience, please activate it now.', 'The following required plugins are currently inactive: %1$s.<br/><span style="color:red;">NOTICE:</span> Onetone includes all shortcodes inside the Magee Shortcodes plugin. As to best user experience, please activate it now.', 'onetone' ), // %1$s = plugin name(s).
            'notice_can_activate_recommended' => _n_noop( 'The following recommended plugin is currently inactive: %1$s.', 'The following recommended plugins are currently inactive: %1$s.', 'onetone' ), // %1$s = plugin name(s).
            'notice_cannot_activate'          => _n_noop( 'Sorry, but you do not have the correct permissions to activate the %s plugin. Contact the administrator of this site for help on getting the plugin activated.', 'Sorry, but you do not have the correct permissions to activate the %s plugins. Contact the administrator of this site for help on getting the plugins activated.', 'onetone' ), // %1$s = plugin name(s).
            'notice_ask_to_update'            => _n_noop( 'The following plugin needs to be updated to its latest version to ensure maximum compatibility with this theme: %1$s.', 'The following plugins need to be updated to their latest version to ensure maximum compatibility with this theme: %1$s.', 'onetone' ), // %1$s = plugin name(s).
            'notice_cannot_update'            => _n_noop( 'Sorry, but you do not have the correct permissions to update the %s plugin. Contact the administrator of this site for help on getting the plugin updated.', 'Sorry, but you do not have the correct permissions to update the %s plugins. Contact the administrator of this site for help on getting the plugins updated.', 'onetone' ), // %1$s = plugin name(s).
            'install_link'                    => _n_noop( 'Begin installing plugin', 'Begin installing plugins', 'onetone' ),
            'activate_link'                   => _n_noop( 'Begin activating plugin', 'Begin activating plugins', 'onetone' ),
            'return'                          => __( 'Return to Required Plugins Installer', 'onetone' ),
            'plugin_activated'                => __( 'Plugin activated successfully.', 'onetone' ),
            'complete'                        => __( 'All plugins installed and activated successfully. %s', 'onetone' ), // %s = dashboard link.
            'nag_type'                        => 'updated' // Determines admin notice type - can only be 'updated', 'update-nag' or 'error'.
        )
    );

    tgmpa( $plugins, $config );

}

add_filter('widget_text', 'do_shortcode');

