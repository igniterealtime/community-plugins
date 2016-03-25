<?php
/**
 * The template for displaying article headers
 *
 * @since 1.0.0
 */
$format = get_post_format();
$icon = array( 'audio' => 'fa-music', 'video' => 'fa-film', '0' => 'fa-file', 'gallery' => 'fa-camera-retro', 'image' => 'fa-picture-o', 'chat' => 'fa-bullhorn' );
?>

	<?php
	if ( is_single() ) :
		the_title( '<h1 class="entry-title"><i class="fa ' . $icon[$format] . '"></i> ', '</h1>' );
	else :
		the_title( sprintf( '<h2 class="entry-title taggedlink"><i class="fa ' . $icon[$format] . '"></i> <a href="%s" rel="bookmark">', esc_url( get_permalink() ) ), '</a></h2>' );
	endif;
	?>

	<div class="entry-meta top-entry-meta">
		<?php
		echo '<i class="fa fa-bookmark"></i>Posted in ';
	    the_category( ', ' );

		if ( comments_open() )
			echo '&nbsp;&nbsp;&nbsp;&nbsp;<i class="fa fa-comments"></i> ';

		comments_popup_link( __( '0 Comments', 'destin-basic' ), __( '1 Comment', 'destin-basic' ), __( '% Comments', 'destin-basic' ), '', '' );
		?>
	</div>
	<div class="entry-meta">
		<?php
		printf( __( 'by %s on %s', 'destin-basic' ),
			'<span class="vcard author"><span class="fn"><a href="' . get_author_posts_url( get_the_author_meta( 'ID' ) ) . '" title="' . esc_attr( sprintf( __( 'Posts by %s', 'destin-basic' ), get_the_author() ) ) . '" rel="author">' . get_the_author() . '</a></span></span>', '<a href="' . get_permalink() . '" class="time"><time class="date published updated" datetime="' . esc_attr( get_the_date( 'Y-m-d' ) ) . '">' . get_the_date() . '</time></a>'
			);
		?>
	</div>