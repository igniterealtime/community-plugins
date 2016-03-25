<?php
/**
 * Set up the default theme options
 *
 * @since 1.0.0
 */
function bavotasan_default_theme_options() {
	//delete_option( 'theme_mods_destin_basic' );
	return array(
		'width' => '1170',
		'layout' => 'right',
		'primary' => 'col-md-9',
	);
}

function bavotasan_theme_options() {
	$bavotasan_default_theme_options = bavotasan_default_theme_options();

	$return = array();
	foreach( $bavotasan_default_theme_options as $option => $value ) {
		$return[$option] = get_theme_mod( $option, $value );
	}

	return $return;
}

if ( class_exists( 'WP_Customize_Control' ) ) {
	class Bavotasan_Post_Layout_Control extends WP_Customize_Control {
		public $description;

	    public function render_content() {
			if ( empty( $this->choices ) )
				return;

			$name = '_customize-radio-' . $this->id;
			?>
			<span class="customize-control-title"><?php echo esc_html( $this->label ); ?></span>
			<?php
			foreach ( $this->choices as $value => $label ) :
				?>
				<label class="<?php echo esc_attr( $value ); ?>">
					<input type="radio" value="<?php echo esc_attr( $value ); ?>" name="<?php echo esc_attr( $name ); ?>" <?php $this->link(); checked( $this->value(), $value ); ?> />
					<?php echo '<div class="' . sanitize_title( $label ) . '"></div>'; ?>
				</label>
				<?php
			endforeach;
			if ( $this->description )
				echo '<p class="description">' . wp_kses_post( $this->description ) . '</p>';

	    }
	}
}

class Bavotasan_Customizer {
	public function __construct() {
		add_action( 'customize_register', array( $this, 'customize_register' ) );
		add_action( 'customize_controls_enqueue_scripts', array( $this, 'customize_controls_enqueue_scripts' ) );
	}

	/**
	 * Adds theme options to the Customizer screen
	 *
	 * This function is attached to the 'customize_register' action hook.
	 *
	 * @param	class $wp_customize
	 *
	 * @since 1.0.0
	 */
	public function customize_register( $wp_customize ) {
		$bavotasan_default_theme_options = bavotasan_default_theme_options();

		// Layout section panel
		$wp_customize->add_section( 'bavotasan_layout', array(
			'title' => __( 'Layout', 'destin-basic' ),
			'priority' => 35,
		) );

		$wp_customize->add_setting( 'width', array(
			'default' => $bavotasan_default_theme_options['width'],
            'sanitize_callback' => 'absint',
		) );

		$wp_customize->add_control( 'width', array(
			'label' => __( 'Site Width', 'destin-basic' ),
			'section' => 'bavotasan_layout',
			'priority' => 10,
			'type' => 'select',
			'choices' => array(
				'1170' => __( '1200px', 'destin-basic' ),
				'992' => __( '992px', 'destin-basic' ),
			),
		) );

		$choices =  array(
			'col-md-2' => '17%',
			'col-md-3' => '25%',
			'col-md-4' => '34%',
			'col-md-5' => '42%',
			'col-md-6' => '50%',
			'col-md-7' => '58%',
			'col-md-8' => '66%',
			'col-md-9' => '75%',
			'col-md-10' => '83%',
		);

		$wp_customize->add_setting( 'primary', array(
			'default' => $bavotasan_default_theme_options['primary'],
            'sanitize_callback' => 'esc_attr',
		) );

		$wp_customize->add_control( 'primary', array(
			'label' => __( 'Main Content Width', 'destin-basic' ),
			'section' => 'bavotasan_layout',
			'priority' => 15,
			'type' => 'select',
			'choices' => $choices,
		) );

		$wp_customize->add_setting( 'layout', array(
			'default' => $bavotasan_default_theme_options['layout'],
            'sanitize_callback' => 'esc_attr',
		) );

		$layout_choices = array(
			'left' => __( 'Left', 'destin-basic' ),
			'right' => __( 'Right', 'destin-basic' ),
		);

		$wp_customize->add_control( new Bavotasan_Post_Layout_Control( $wp_customize, 'layout', array(
			'label' => __( 'Sidebar Layout', 'destin-basic' ),
			'section' => 'bavotasan_layout',
			'priority' => 25,
			'choices' => $layout_choices,
		) ) );
	}

	public function customize_controls_enqueue_scripts() {
		wp_enqueue_script( 'bavotasan-customizer', BAVOTASAN_THEME_URL . '/library/js/admin/customizer.js', array( 'jquery' ), '', true );
        wp_localize_script( 'bavotasan-customizer', 'Bavotasan_Customizer', array(
            'upgradeAd' => __( 'Upgrade to premium version', 'destin-basic' ),
        ));

		wp_enqueue_style( 'bavotasan-customizer-styles', BAVOTASAN_THEME_URL . '/library/css/admin/customizer.css' );
	}
}
$bavotasan_customizer = new Bavotasan_Customizer;