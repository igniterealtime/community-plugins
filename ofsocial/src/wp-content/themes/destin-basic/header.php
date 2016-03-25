<?php
/**
 * The Header for our theme.
 *
 * Displays all of the <head> section and everything up till <main>
 * and the left sidebar conditional
 *
 * @since 1.0.0
 */
?><!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<link rel="profile" href="http://gmpg.org/xfn/11">
	<link rel="pingback" href="<?php bloginfo( 'pingback_url' ); ?>">
	<!--[if IE]><script src="<?php echo BAVOTASAN_THEME_URL; ?>/library/js/html5.js"></script><![endif]-->
	<?php wp_head(); ?>
</head>

<body <?php body_class(); ?>>

	<div id="page" class="clearfix">
		<header id="header">
			<div class="container">
				<?php $tag = ( is_front_page() && is_home() ) ? 'h1' : 'div'; ?>
				<<?php echo $tag; ?> id="site-title"><a href="<?php echo esc_url( home_url() ); ?>" title="<?php echo esc_attr( get_bloginfo( 'name', 'display' ) ); ?>" rel="home">
					<?php bloginfo( 'name' ); ?>
				</a></<?php echo $tag; ?>>
				<div id="site-description"><?php bloginfo( 'description' ); ?></div>
			</div>

			<nav id="site-navigation" class="navbar navbar-inverse" role="navigation">
				<div class="container">
					<h3 class="sr-only"><?php _e( 'Main menu', 'destin-basic' ); ?></h3>
					<a class="sr-only" href="#primary" title="<?php esc_attr_e( 'Skip to content', 'destin-basic' ); ?>"><?php _e( 'Skip to content', 'destin-basic' ); ?></a>

					<div class="navbar-header">
						<button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">
					        <span class="icon-bar"></span>
					        <span class="icon-bar"></span>
					        <span class="icon-bar"></span>
					    </button>
					</div>

					<div class="collapse navbar-collapse">
						<?php
						$menu_class = ( is_rtl() ) ? ' navbar-right' : '';

						wp_nav_menu( array( 'theme_location' => 'primary', 'container' => '', 'menu_class' => 'nav navbar-nav' . $menu_class, 'fallback_cb' => 'bavotasan_default_menu' ) );
						?>
					</div>
				</div>
			</nav><!-- #site-navigation -->
		</header>

		<main>
