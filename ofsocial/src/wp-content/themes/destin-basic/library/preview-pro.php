<?php
class Bavotasan_Preview_Pro {
	private $theme_url = 'https://themes.bavotasan.com/themes/destin-wordpress-theme/';
	private $theme_name = 'Destin';

	public function __construct() {
		add_action( 'admin_menu', array( $this, 'admin_menu' ) );
	}

	/**
	 * Add a 'Upgrade' page
	 *
	 * This function is attached to the 'admin_menu' action hook.
	 *
	 * @since 1.0.0
	 */
	public function admin_menu() {
		add_theme_page( sprintf( __( 'Welcome to %s %s', 'destin-basic' ), BAVOTASAN_THEME_NAME, BAVOTASAN_THEME_VERSION ), __( 'Upgrade to Premium', 'destin-basic' ), 'edit_theme_options', 'bavotasan_preview_pro', array( $this, 'bavotasan_preview_pro' ) );

		// Remove upgrade page from Appearance menu
		remove_submenu_page( 'themes.php', 'bavotasan_preview_pro' );
	}

	public function bavotasan_preview_pro() {
		?>
		<style>
		.featured-image {
			margin: 20px auto !important;
		}

		.about-wrap .headline-feature h2 {
			text-align: center;
		}

		.about-wrap .dfw h3 {
			text-align: left;
		}

		.changelog.headline-feature.dfw {
			max-width: 68%;
		}

		.changelog.headline-feature.dfw {
			margin-left: auto;
			margin-right: auto;
		}

		.about-wrap ul {
			padding-left: 60px;
			list-style: disc;
			margin-bottom: 20px;
		}

		.about-wrap .theme-badge {
			position: absolute;
			top: 0;
			right: 0;
		}

		.about-wrap .feature-section {
			border: 0;
			padding: 0;
		}

		@media only screen and (max-width: 768px) {
			.changelog.headline-feature.dfw {
				max-width: 100%;
			}

			.about-wrap .theme-badge {
				display: none;
			}
		}
		</style>
		<div class="wrap about-wrap" id="custom-background">
			<h1><?php printf( __( 'Welcome to %s %s', 'destin-basic' ), BAVOTASAN_THEME_NAME, BAVOTASAN_THEME_VERSION ); ?></h1>

			<div class="about-text">
				<?php printf( __( 'Take your site to the next level with the full version of <em>%s</em>. Check out some of the advanced features that&rsquo;ll give you more control over your site&rsquo;s layout and design.', 'destin-basic' ), $this->theme_name ); ?>
			</div>
			<div class="theme-badge">
				<img src="<?php echo BAVOTASAN_THEME_URL; ?>/library/images/screenshot_sml.jpg" />
			</div>

			<h2 class="nav-tab-wrapper">
				<a href="<?php echo admin_url( 'themes.php?page=bavotasan_documentation' ); ?>" class="nav-tab"><?php _e( 'Documentation', 'destin-basic' ); ?></a>
				<a href="<?php echo admin_url( 'themes.php?page=bavotasan_preview_pro' ); ?>" class="nav-tab nav-tab-active"><?php _e( 'Upgrade', 'destin-basic' ); ?></a>
			</h2>

			<div class="changelog headline-feature dfw">
				<h2><?php _e( 'Social Menu', 'destin-basic' ); ?></h2>

				<div class="featured-image dfw-container">
					<img src="<?php echo BAVOTASAN_THEME_URL; ?>/library/images/social-menu.jpg" />
				</div>

				<p><?php _e( 'Establish your online presence by letting your visitors join your social network. Help them stay up to date on everything you&rsquo;re doing.', 'destin-basic' ); ?></p>
				<p><?php _e( 'Easily add a social menu by creating links to the most popular social media websites.', 'destin-basic' ); ?></p>
			</div>
			<hr />

			<div class="changelog headline-feature dfw">
				<h2><?php _e( 'Advanced Color Picker', 'destin-basic' ); ?></h2>

				<div class="featured-image dfw-container">
					<img src="<?php echo BAVOTASAN_THEME_URL; ?>/library/images/color-picker.jpg" />
				</div>

				<p><?php printf( __( 'Sometimes the default colors just aren&rsquo;t working for you. In %s you can use the advanced color picker to make sure you get the exact colors you want.', 'destin-basic' ), '<em>' . $this->theme_name . '</em>' ); ?></p>
				<p><?php _e( 'Easily select one of the eight preset colors or dive even deeper into your customization by using a more specific hex code.', 'destin-basic' ); ?></p>
			</div>
			<hr />

			<div class="changelog headline-feature dfw">
				<h2><?php _e( 'Google Fonts Manager', 'destin-basic' ); ?></h2>

				<div class="featured-image dfw-container">
					<img src="<?php echo BAVOTASAN_THEME_URL; ?>/library/images/google-fonts.jpg" />
				</div>

				<p><?php _e( 'Web-safe fonts are a thing of the past, so why not try to spice things up a bit?', 'destin-basic' ); ?></p>
				<p><?php _e( 'Choose from over 670 Google Fonts to improve your site&rsquo;s typeface readability and make things look even more amazing.', 'destin-basic' ); ?></p>
			</div>
			<hr />

			<div class="changelog headline-feature dfw">
				<h2><?php _e( 'Extended Widgetized Footer', 'destin-basic' ); ?></h2>

				<div class="featured-image dfw-container">
					<img src="<?php echo BAVOTASAN_THEME_URL; ?>/library/images/extended-footer.jpg" />
				</div>

				<p><?php _e( 'If you need to include more widgets on your site, take advantage of the Extended Footer.', 'destin-basic' ); ?></p>
				<p><?php _e( 'Use the Customizer to set the number of columns you want to appear. You can also customize your site&rsquo;s copyright notice.', 'destin-basic' ); ?></p>
			</div>
			<hr />

			<div class="changelog feature-list">
				<h2><?php _e( 'Even More Theme Options', 'destin-basic' ); ?></h2>
				<div class="feature-section col two-col">
					<div>
						<h4><?php _e( 'Full Width Posts/Pages', 'destin-basic' ); ?></h4>
						<p><?php _e( 'Each page/post has an option to remove both sidebars so you can use the full width of your site to display whatever you want.', 'destin-basic' ); ?></p>
					</div>
					<div class="last-feature">
						<h4><?php _e( 'Multiple Sidebar Layouts', 'destin-basic' ); ?></h4>
						<p><?php _e( 'Sometimes one sidebar just isn&rsquo;t enough, so add a second one and place it where you want.', 'destin-basic' ); ?></p>
					</div>
				</div>

				<div class="feature-section col two-col">
					<div>
						<h4><?php _e( 'Bootstrap Shortcodes', 'destin-basic' ); ?></h4>
						<p><?php printf( __( 'Shortcodes are awesome and easy to use. That&rsquo;s why %s comes with a bunch, like a slideshow carousel, alert boxes and more.', 'destin-basic' ), '<em>' . $this->theme_name . '</em>' ); ?></p>
					</div>
					<div class="last-feature">
						<h4><?php _e( 'Import/Export Tool', 'destin-basic' ); ?></h4>
						<p><?php _e( 'Once you&rsquo;ve set up your site exactly how you want, you can easily export the Theme Options and Custom CSS for safe keeping.', 'destin-basic' ); ?></p>
					</div>
				</div>
			</div>
			<hr />

			<p><a href="<?php echo $this->theme_url; ?>" target="_blank" class="button-primary button-large"><?php printf( __( 'Upgrade %s Now &rarr;', 'destin-basic' ), '<strong>' . BAVOTASAN_THEME_NAME . '</strong>' ); ?></a></p>
		</div>
		<?php
	}
}
$bavotasan_preview_pro = new Bavotasan_Preview_Pro;