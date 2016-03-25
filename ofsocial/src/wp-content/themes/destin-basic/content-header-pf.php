<?php
/**
 * The template for displaying article headers
 *
 * @since 1.0.0
 */
$format = get_post_format();
$icon = array( 'audio' => 'fa-music', 'video' => 'fa-film', '0' => 'fa-file', 'gallery' => 'fa-camera-retro', 'image' => 'fa-picture-o', 'chat' => 'fa-bullhorn', 'link' => 'fa-link', 'quote' => 'fa-quote-left', 'aside' => 'fa-asterisk', 'status' => 'fa-plus-square' );
$class = ( 'quote' == $format || 'aside' == $format || 'status' == $format || 'link' == $format ) ? ' post-format-header' : '';
?>

	<header class="entry-header<?php echo $class; ?>">
		<?php
		if ( is_single() ) :
			the_title( '<h1 class="entry-title"><i class="fa ' . $icon[$format] . '"></i> ', '</h1>' );
		else :
			the_title( sprintf( '<h2 class="entry-title taggedlink"><i class="fa ' . $icon[$format] . '"></i> <a href="%s" rel="bookmark">', esc_url( get_permalink() ) ), '</a></h2>' );
		endif;
		?>
	</header>