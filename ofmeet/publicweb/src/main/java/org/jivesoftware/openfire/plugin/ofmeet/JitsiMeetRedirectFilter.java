package org.jivesoftware.openfire.plugin.ofmeet;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.*;
import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.util.HashSet;
import java.util.Set;

/**
 * A filter that forwards URLs to the jitsi-meet welcome page.
 *
 * The URLs that are forwarded are those that reference jitsi-rooms. These are identified as URLs that start with the
 * context on which the jitsi-meet application is hosted (as part of the OFMeet plugin), but excludes any further child
 * context.
 *
 * For example, these paths are forwarded:
 * <ul>
 *     <li>/ofmeet/jitsi-meet/myroom</li>
 *     <li>/ofmeet/jitsi-meet/my.room</li>
 * </ul>
 *
 * These paths are <em>not</em> forwarded:
 * <ul>
 *     <li>/ofmeet/jitsi-meet/room.js</li>
 *     <li>/ofmeet/jitsi-meet/room.png</li>
 *     <li>/ofmeet/jitsi-meet/childcontext/anything</li>
 * </ul>
 *
 * on any " followed by an exclusion of
 * patterns that match well-known file extensions (eg: css, javascript, images)
 *
 * @author Guus der Kinderen, guus.der.kinderen@gmail.com
 */
public class JitsiMeetRedirectFilter implements Filter
{
    private static final Logger Log = LoggerFactory.getLogger( JitsiMeetRedirectFilter.class );

    private final Set<String> excludedExtensions = new HashSet<>();

    @Override
    public void init( FilterConfig filterConfig ) throws ServletException
    {
        excludedExtensions.clear();
        excludedExtensions.add( "png" );
        excludedExtensions.add( "gif" );
        excludedExtensions.add( "jpg" );
        excludedExtensions.add( "ico" );
        excludedExtensions.add( "css" );
        excludedExtensions.add( "js" );
    }

    protected boolean hasCorrectContext( HttpServletRequest request )
    {
        return request.getRequestURI().matches( request.getContextPath() + "/jitsi-meet/([^/]+)$" );
    }

    protected boolean containsExcludedExtension( HttpServletRequest request )
    {
        final String uri = request.getRequestURI().toLowerCase();
        for ( final String excludedExtension : excludedExtensions )
        {
            if ( uri.endsWith( "." + excludedExtension ) || uri.contains( "." + excludedExtension + "?" ) )
            {
                return true;
            }
        }

        return false;
    }

    @Override
    public void doFilter( ServletRequest servletRequest, ServletResponse response, FilterChain filterChain ) throws IOException, ServletException
    {
        if ( servletRequest instanceof HttpServletRequest )
        {
            final HttpServletRequest request = (HttpServletRequest) servletRequest;
            if ( !hasCorrectContext( request ) )
            {
                Log.trace( "Not forwarding " + request.getRequestURI() + " (does not have correct context)." );
            }
            else if ( containsExcludedExtension( request ) )
            {
                Log.trace( "Not forwarding " + request.getRequestURI() + " (contains excluded extension)." );
            }
            else
            {
                Log.trace( "Forwarding " + request.getRequestURI() + " to /jitsi-meet/" );
                RequestDispatcher dispatcher = request.getRequestDispatcher( "/jitsi-meet/" );
                dispatcher.forward( request, response );
                return;
            }
        }
        filterChain.doFilter( servletRequest, response );
    }

    @Override
    public void destroy()
    {
    }
}
