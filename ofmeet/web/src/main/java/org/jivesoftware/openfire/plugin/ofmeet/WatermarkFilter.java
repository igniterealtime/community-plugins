/*
 * Copyright (c) 2017 Ignite Realtime Foundation. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.jivesoftware.openfire.plugin.ofmeet;

import org.igniterealtime.openfire.plugin.ofmeet.config.OFMeetConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.*;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URL;
import java.net.URLConnection;

/**
 * A Filter that proxies the watermark images, as configured to be used by the Jitsi Meet webapplication.
 *
 * Jitsi supports two watermark images, 'watermark.png' and 'rightwatermark.png'. The former is typically used for the
 * standard Jitsi logo, which this servlet will serve by default. The latter is referred to as the 'brand' watermark,
 * which by default is empty.
 *
 * @author Guus der Kinderen, guus.der.kinderen@gmail.com
 */
public class WatermarkFilter implements Filter
{
    private static final Logger Log = LoggerFactory.getLogger( WatermarkFilter.class );

    protected static void serve( HttpServletResponse response, URL url ) throws IOException
    {
        try
        {
            final URLConnection urlConnection = url.openConnection();
            response.setContentLength( urlConnection.getContentLength() );
            response.setContentType( urlConnection.getContentType() );

            try ( final InputStream input = urlConnection.getInputStream();
                  final OutputStream output = response.getOutputStream() )
            {
                final byte[] buffer = new byte[ 1024 ];
                int bytesRead;
                while ( ( bytesRead = input.read( buffer ) ) != -1 )
                {
                    output.write( buffer, 0, bytesRead );
                }
            }
        }
        catch ( IOException e )
        {
            Log.warn( "Unable to serve the URL '{}' as proxied content.", url, e );
            response.sendError( HttpServletResponse.SC_INTERNAL_SERVER_ERROR );
        }
    }

    @Override
    public void init( FilterConfig filterConfig ) throws ServletException
    {

    }

    @Override
    public void doFilter( ServletRequest servletRequest, ServletResponse servletResponse, FilterChain chain ) throws IOException, ServletException
    {
        if ( servletRequest instanceof HttpServletRequest )
        {
            final HttpServletRequest request = (HttpServletRequest) servletRequest;
            final HttpServletResponse response = (HttpServletResponse) servletResponse;

            if ( request.getRequestURI().endsWith( "rightwatermark.png" ) )
            {
                Log.trace( "[{}] Right/Brand Watermark requested.", request.getRemoteAddr() );
                final URL logoLocation = new OFMeetConfig().getBrandWatermarkLogoUrl();
                if ( logoLocation == null )
                {
                    Log.trace( "[{}] No Right/Brand Watermark URL is configured. Returning default image (if any exists).", request.getRemoteAddr(), new Throwable() );
                }
                else
                {
                    Log.trace( "[{}] Right/Brand Watermark URL is: {}. Retrieving and returning its content.", request.getRemoteAddr(), logoLocation );
                    serve( response, logoLocation );
                    return;
                }
            }
            else if ( request.getRequestURI().endsWith( "watermark.png" ) )
            {
                Log.trace( "[{}] Left/Jitsi Watermark requested.", request.getRemoteAddr() );
                final URL logoLocation = new OFMeetConfig().getWatermarkLogoUrl();
                if ( logoLocation == null )
                {
                    Log.trace( "[{}] No Left/Jitsi Watermark URL is configured. Returning default image (if any exists).", request.getRemoteAddr() );
                }
                else
                {
                    Log.trace( "[{}] Right/Brand Watermark URL is: {}. Retrieving and returning its content.", request.getRemoteAddr(), logoLocation );
                    serve( response, logoLocation );
                    return;
                }
            }
            else
            {
                Log.warn( "[{}] A request was processed by this servlet that should not be mapped to this servlet in the first place! Request URL: {}", request.getRemoteAddr(), request.getRequestURL() );
                response.sendError( HttpServletResponse.SC_INTERNAL_SERVER_ERROR );
            }
        }
        chain.doFilter( servletRequest, servletResponse );
    }

    @Override
    public void destroy()
    {

    }
}
