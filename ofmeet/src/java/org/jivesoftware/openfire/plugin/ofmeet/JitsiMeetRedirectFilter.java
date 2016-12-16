package org.jivesoftware.openfire.plugin.ofmeet;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.*;
import javax.servlet.http.HttpServletRequest;
import java.io.IOException;

/**
 * A filter that forwards URLs to the jitsi-meet welcome page.
 *
 * The URLs that are forwarded are those that reference jitsi-rooms. These are identified by a regular expression as
 * found in the Jitsi-Meet documentation (notably, the NGINX configuration). Note that this regular expression does not
 * cover the resources needed for the jitsi HTML to work properly (images, css files, javascript files etc).
 *
 * @author Guus der Kinderen, guus.der.kinderen@gmail.com
 */
public class JitsiMeetRedirectFilter implements Filter
{
    private static final Logger Log = LoggerFactory.getLogger( JitsiMeetRedirectFilter.class );

    @Override
    public void init( FilterConfig filterConfig ) throws ServletException
    {
    }

    @Override
    public void doFilter( ServletRequest servletRequest, ServletResponse response, FilterChain filterChain ) throws IOException, ServletException
    {
        if ( servletRequest instanceof HttpServletRequest )
        {
            final HttpServletRequest request = (HttpServletRequest) servletRequest;
            final String requestURI = request.getRequestURI();
            if ( requestURI.matches( request.getContextPath() + "/jitsi-meet/([a-zA-Z0-9=\\?]+)$" ) )
            {
                Log.trace( "Forwarding " + requestURI + " to /jitsi-meet/" );
                RequestDispatcher dispatcher = request.getRequestDispatcher( "/jitsi-meet/" );
                dispatcher.forward( request, response );
                return;
            }
            else
            {
                Log.trace( "Not forwarding " + requestURI + " (does not match pattern)." );
            }
        }
        filterChain.doFilter( servletRequest, response );
    }

    @Override
    public void destroy()
    {
    }
}
