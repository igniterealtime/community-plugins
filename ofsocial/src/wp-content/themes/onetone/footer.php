<?php
 $enable_footer_widget_area = esc_attr(onetone_option('enable_footer_widget_area',''));
?>
<!--Footer-->
		<footer>
        <?php if( $enable_footer_widget_area == '1' ):?>
			<div class="footer-widget-area">
				<div class="container">
					<div class="row">
							<div class="col-md-3 col-md-6">
							<?php
							if(is_active_sidebar("footer_widget_1")){
	                           dynamic_sidebar("footer_widget_1");
                                  	}
							?>
						</div>
						<div class="col-md-3 col-md-6">
				        <?php
							if(is_active_sidebar("footer_widget_2")){
	                           dynamic_sidebar("footer_widget_2");
                                  	}
							?>
						</div>
						<div class="col-md-3 col-md-6">
							<?php
							if(is_active_sidebar("footer_widget_3")){
	                           dynamic_sidebar("footer_widget_3");
                                  	}
							?>
						</div>
                        <div class="col-md-3 col-md-6">
							<?php
							if(is_active_sidebar("footer_widget_4")){
	                           dynamic_sidebar("footer_widget_4");
                                  	}
							?>
						</div>
                        
					</div>
				</div>
			</div>
            <?php endif;?>
			<div class="footer-info-area">
				<div class="container">	
					<div class="site-info">
					  <?php
                      if( is_home() || is_front_page()){
                        printf(__('Designed by <a href="%s">MageeWP Themes</a>.','onetone'),esc_url('http://www.mageewp.com/'));
                      }else{
						 printf(__('Designed by MageeWP Themes.','onetone')); 
						  }
                      ?>
					</div>
				</div>
			</div>			
		</footer>
	</div>
    <?php wp_footer();?>	
</body>
</html>