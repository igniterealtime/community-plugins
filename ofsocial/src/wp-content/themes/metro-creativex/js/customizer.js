/**
 * Contains handlers to make Theme Customizer preview reload changes asynchronously.
 */
( function( $ ) {
	// Site title and description.
	wp.customize( 'blogname', function( value ) {
		value.bind( function( to ) {
			$( '.site-title a' ).text( to );
		} );
	} );
	wp.customize( 'blogdescription', function( value ) {
		value.bind( function( to ) {
			$( '.site-description' ).text( to );
		} );
	} );
	// Header text color.
	wp.customize( 'header_textcolor', function( value ) {
		value.bind( function( to ) {
			if ( 'blank' === to ) {
				$( '.site-title, .site-description' ).css( {
					'clip': 'rect(1px, 1px, 1px, 1px)',
					'position': 'absolute'
				} );
			} else {
				$( '.site-title,  .site-description' ).css( {
					'clip': 'auto',
					'position': 'static'
				} );

				$( '.site-title a' ).css( {
					'color': to
				} );
			}
		} );
	} );
	
	
	wp.customize( 'metro-creativex_logo', function( value ) {
		value.bind( function( to ) {
			if( to != '' ) {
				$( '.site-logo' ).removeClass( 'metro_creativex_only_customizer' );
				$( '.header-logo-wrap' ).addClass( 'metro_creativex_only_customizer' );
			}
			else {
				$( '.site-logo' ).addClass( 'metro_creativex_only_customizer' );
				$( '.header-logo-wrap' ).removeClass( 'metro_creativex_only_customizer' );
			}
				
            $(".site-logo img").attr( "src", to );
		} );
	} );

	wp.customize( 'metro-creativex_text_color', function( value ) {
		value.bind( function( to ) {
		jQuery('#metro_creativex_text_color').remove();
		prev = '<style id="metro_creativex_text_color" type="text/css">#topside h1, #content article .post_content, #content p, .insidepost_date, header, #searchform .searchtext, p, span { color: '+to+' !important; }</style>';	
		jQuery('head').append(prev);
		} );
		
	} );
	
	wp.customize( 'metro-creativex_link_color', function( value ) {
		value.bind( function( to ) {
			jQuery('#metro_creativex_link_color').remove();
			prev = '<style id="metro_creativex_link_color">.left-sidebar li a, #content article .post_content a, a { color: '+to+' !important; }</style>';
			jQuery('head').append(prev);
		} );
	} );
	
	wp.customize( 'metro-creativex_link_color_hover', function( value ) {
		value.bind( function( to ) {
			jQuery('#metro_creativex_link_color_hover').remove();
			prev = '<style id="metro_creativex_link_color_hover">.left-sidebar li a:hover, #content article .post_content a:hover, a:hover { color: '+to+' !important;</style>';
			jQuery('head').append(prev);
		} );
	} );
	
	wp.customize( 'metro-creativex_nav_color', function( value ) {
		value.bind( function( to ) {
			jQuery('#metro_creativex_nav_color').remove();
			prev = '<style id="metro_creativex_nav_color">#topside .pages ul a { color: '+to+' !important; }</style>';
			jQuery('head').append(prev);
		} );
	} );
	
	wp.customize( 'metro-creativex_nav_color_hover', function( value ) {
		value.bind( function( to ) {
			jQuery('#metro_creativex_nav_color_hover').remove();
			prev = '<style id="metro_creativex_nav_color_hover">#topside .pages ul a:hover { color: '+to+' !important; }</style>';
			jQuery('head').append(prev);
		} );
	} );
	
	wp.customize( 'metro-creativex_sidebar_title_color', function( value ) {
		value.bind( function( to ) {
			jQuery('#metro_creativex_title_color').remove();
			prev = '<style id="metro_creativex_title_color">.widget-title { color: '+to+' !important; }</style>';
			jQuery('head').append(prev);
		} );
	} );
	
	
	
	



} )( jQuery );