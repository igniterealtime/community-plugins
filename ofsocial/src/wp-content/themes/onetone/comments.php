<?php

	if ( post_password_required() ) { ?>
		<p class="nocomments"><?php _e('This post is password protected. Enter the password to view comments.', 'onetone'); ?></p> 
	<?php
		return;
	}
?>

<?php if ( have_comments() ) : ?>
	<h3 id="comments"><?php comments_number(__('No comment', 'onetone'), __('Has one comment', 'onetone'), __('% comments', 'onetone'));?> <?php printf(__('to &#8220;%s&#8221;', 'onetone'), the_title('', '', false)); ?></h3>
<p class="upcomment"><?php _e('You can ','onetone'); ?><a id="leaverepond" href="#comments"><?php _e('leave a reply','onetone'); ?></a>  <?php _e(' or ','onetone'); ?> <a href="<?php trackback_url(true); ?>" rel="trackback"><?php _e('Trackback','onetone'); ?></a> <?php _e('this post.','onetone'); ?></p>
	<ol id="thecomments" class="commentlist comments-list">
	<?php wp_list_comments('type=comment&callback=onetone_comment');?>
	</ol>

<!-- comments pagenavi Start. -->
	<?php
	if (get_option('page_comments')) {
		$comment_pages = paginate_comments_links('echo=0');
		if ($comment_pages) {
?>
		<div id="commentnavi">
			<span class="pages"><?php _e('Comment pages', 'onetone'); ?></span>
			<div id="commentpager">
				<?php echo $comment_pages; ?>
				
			</div>
			<div class="fixed"></div>
		</div>
<?php
		}
	}
?>

 <?php else : // this is displayed if there are no comments so far ?>

	<?php if ( comments_open() ) : ?>
		<!-- If comments are open, but there are no comments. -->

	 <?php else : // comments are closed ?>
		<!-- If comments are closed. -->
		<p class="nocomments"><?php //_e('Comments are closed.', 'onetone'); ?></p>

	<?php endif; ?>
<?php endif; ?>


<?php if ( comments_open() ) : ?>

<div id="respond" class="respondbg">

<?php if ( get_option('comment_registration') && !is_user_logged_in() ) : ?>
<p><?php printf(__('You must be <a href="%s">logged in</a> to post a comment.', 'onetone'), wp_login_url( get_permalink() )); ?></p>
<?php else : ?>
<?php 
$commenter = wp_get_current_commenter();
$req = get_option( 'require_name_email' );
$aria_req = ( $req ? " aria-required='true'" : '' );
global $required_text;

$comments_args = array(
'class_submit' => 'submit',
         'comment_notes_before' => '<p class="comment-notes">' .
    __( 'Your email address will not be published.', 'onetone' ) . ( $req ? $required_text : '' ) .
    '</p>',
        // change the title of the reply section
        'title_reply'=>__('Leave a Reply', 'onetone'),
        // remove "Text or HTML to be displayed after the set of comment fields"
        'comment_notes_after' => '',
        // redefine your own textarea (the comment body)
        'comment_field' => '<div class="clear"></div><p class="form-allowed-tags"></p>
<section class="comment-form-comment form-group"><div id="comment-textarea"><textarea id="comment" name="comment" placeholder="'.__('Message', 'onetone').'"  cols="45" rows="8"  class="textarea-comment form-control" aria-required="true"></textarea></div></section>',
		'fields' => apply_filters( 'comment_form_default_fields', array(

    'author' =>
      '<div class="row"><section class="comment-form-author form-group col-md-4"><input id="author" class="input-name form-control" name="author" placeholder="'.__('Name', 'onetone').'"  type="text" value="' . esc_attr( $commenter['comment_author'] ) .
      '" size="30"' . $aria_req . ' /></section>',

    'email' =>
      '<section class="comment-form-email form-group col-md-4"><input id="email" class="input-name form-control" name="email" placeholder="'.__('Email', 'onetone').'"  type="text" value="' . esc_attr(  $commenter['comment_author_email'] ) .
      '" size="30"' . $aria_req . ' /></section>',

    'url' =>
      '<section class="comment-form-url form-group col-md-4"><input id="url" class="input-name form-control" placeholder="'.__('Website', 'onetone').'" name="url"  type="text" value="' . esc_attr( $commenter['comment_author_url'] ) .
      '" size="30" /></section></div>'
    ))
);
?>
<?php comment_form($comments_args);?>

<?php endif; // If registration required and not logged in ?>
</div>
<?php endif;  ?>