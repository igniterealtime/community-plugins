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

import org.jivesoftware.util.JiveGlobals;
import org.json.JSONArray;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Arrays;

/**
 * A servlet that generates a snippet of javascript (json) that is the 'interfaceConfig' variable, as used by the Jitsi
 * Meet webapplication.
 *
 * @author Guus der Kinderen, guus.der.kinderen@gmail.com
 */
public class InterfaceConfigServlet extends HttpServlet
{
    private static final Logger Log = LoggerFactory.getLogger( InterfaceConfigServlet.class );

    public void doGet( HttpServletRequest request, HttpServletResponse response ) throws ServletException, IOException
    {
        try
        {
            Log.trace( "[{}] interface_config requested.", request.getRemoteAddr() );

            final JSONObject config = new JSONObject();

            config.put( "MAIN_TOOLBAR_BUTTONS",                  new JSONArray( JiveGlobals.getListProperty( "org.jitsi.videobridge.ofmeet.main.toolbar.buttons", Arrays.asList( "microphone", "camera", "desktop", "invite", "hangup" ) ) ) );
            config.put( "TOOLBAR_BUTTONS",                       new JSONArray( JiveGlobals.getListProperty( "org.jitsi.videobridge.ofmeet.toolbar.buttons",      Arrays.asList( "authentication", "microphone", "camera", "desktop", "recording", "security", "invite", "chat", "etherpad", "sharedvideo", "fullscreen", "sip", "dialpad", "settings", "hangup", "filmstrip", "contacts" ) ) ) );
            config.put( "SETTINGS_SECTIONS",                     new JSONArray( JiveGlobals.getListProperty( "org.jitsi.videobridge.ofmeet.settings.sections",    Arrays.asList( "language", "devices", "moderator" ) ) ) );

            config.put( "CANVAS_EXTRA",                          JiveGlobals.getIntProperty(     "org.jitsi.videobridge.ofmeet.canvas.extra",                  104                 ) );
            config.put( "CANVAS_RADIUS",                         JiveGlobals.getIntProperty(     "org.jitsi.videobridge.ofmeet.canvas.radius",                 7                   ) );
            config.put( "SHADOW_COLOR",                          JiveGlobals.getProperty(        "org.jitsi.videobridge.ofmeet.shadow.color",                  "#ffffff"           ) );
            config.put( "DEFAULT_BACKGROUND",                    JiveGlobals.getProperty(        "org.jitsi.videobridge.ofmeet.default.background",            "#474747"           ) );
            config.put( "INITIAL_TOOLBAR_TIMEOUT",               JiveGlobals.getIntProperty(     "org.jitsi.videobridge.ofmeet.initial.toolbar.timeout",       20000               ) );
            config.put( "TOOLBAR_TIMEOUT",                       JiveGlobals.getIntProperty(     "org.jitsi.videobridge.ofmeet.toolbar.timeout",               4000                ) );
            config.put( "DEFAULT_REMOTE_DISPLAY_NAME",           JiveGlobals.getProperty(        "org.jitsi.videobridge.ofmeet.default.remote.displayname",    "Change Me"         ) );
            config.put( "DEFAULT_DOMINANT_SPEAKER_DISPLAY_NAME", JiveGlobals.getProperty(        "org.jitsi.videobridge.ofmeet.default.speaker.displayname",   "Speaker"           ) );
            config.put( "DEFAULT_LOCAL_DISPLAY_NAME",            JiveGlobals.getProperty(        "org.jitsi.videobridge.ofmeet.default.local.displayname",     "Me"                ) );
            config.put( "SHOW_JITSI_WATERMARK",                  JiveGlobals.getBooleanProperty( "org.jitsi.videobridge.ofmeet.show.watermark",                false               ) );
            config.put( "JITSI_WATERMARK_LINK",                  JiveGlobals.getProperty(        "org.jitsi.videobridge.ofmeet.watermark.link",                ""                  ) );
            config.put( "SHOW_BRAND_WATERMARK",                  JiveGlobals.getBooleanProperty( "org.jitsi.videobridge.ofmeet.brand.show.watermark",          false               ) );
            config.put( "BRAND_WATERMARK_LINK",                  JiveGlobals.getProperty(        "org.jitsi.videobridge.ofmeet.brand.watermark.link",          ""                  ) );
            config.put( "SHOW_POWERED_BY",                       JiveGlobals.getBooleanProperty( "org.jitsi.videobridge.ofmeet.show.poweredby",                false               ) );
            config.put( "GENERATE_ROOMNAMES_ON_WELCOME_PAGE",    JiveGlobals.getBooleanProperty( "org.jitsi.videobridge.ofmeet.random.roomnames",              true                ) );
            config.put( "APP_NAME",                              JiveGlobals.getProperty(        "org.jitsi.videobridge.ofmeet.application.name",              "Openfire Meetings" ) );
            config.put( "INVITATION_POWERED_BY",                 JiveGlobals.getBooleanProperty( "org.jitsi.videobridge.ofmeet.invitation.poweredby",          true                ) );
            config.put( "VIDEO_LAYOUT_FIT",                      JiveGlobals.getProperty(        "org.jitsi.videobridge.ofmeet.video.layout.fit",              "both"              ) );
            config.put( "SHOW_CONTACTLIST_AVATARS",              JiveGlobals.getBooleanProperty( "org.jitsi.videobridge.ofmeet.show.contactlist.avatars",      false               ) );
            config.put( "filmStripOnly",                         JiveGlobals.getBooleanProperty( "org.jitsi.videobridge.ofmeet.filmstriponly",                 false               ) );
            config.put( "RANDOM_AVATAR_URL_PREFIX",              JiveGlobals.getProperty(        "org.jitsi.videobridge.ofmeet.random.avatar.url.prefix",      ""                  ) );
            config.put( "RANDOM_AVATAR_URL_SUFFIX",              JiveGlobals.getProperty(        "org.jitsi.videobridge.ofmeet.random.avatar.url.suffix",      ""                  ) );
            config.put( "FILM_STRIP_MAX_HEIGHT",                 JiveGlobals.getIntProperty(     "org.jitsi.videobridge.ofmeet.film.strip.max.height",         120                 ) );
            config.put( "LOCAL_THUMBNAIL_RATIO_WIDTH",           JiveGlobals.getIntProperty(     "org.jitsi.videobridge.ofmeet.local.thumbnail.ratio.width",   16                  ) );
            config.put( "LOCAL_THUMBNAIL_RATIO_HEIGHT",          JiveGlobals.getIntProperty(     "org.jitsi.videobridge.ofmeet.local.thumbnail.ratio.height",  9                   ) );
            config.put( "REMOTE_THUMBNAIL_RATIO_WIDTH",          JiveGlobals.getIntProperty(     "org.jitsi.videobridge.ofmeet.remote.thumbnail.ration.width", 1                   ) );
            config.put( "REMOTE_THUMBNAIL_RATIO_HEIGHT",         JiveGlobals.getIntProperty(     "org.jitsi.videobridge.ofmeet.remote.thumbnail.ratio.height", 1                   ) );
            config.put( "ENABLE_FEEDBACK_ANIMATION",             JiveGlobals.getBooleanProperty( "org.jitsi.videobridge.ofmeet.enable.feedback_animation",     false               ) );
            config.put( "DISABLE_FOCUS_INDICATOR",               JiveGlobals.getBooleanProperty( "org.jitsi.videobridge.ofmeet.disable.focus.indicator",       false               ) );
            config.put( "ACTIVE_SPEAKER_AVATAR_SIZE",            JiveGlobals.getIntProperty(     "org.jitsi.videobridge.ofmeet.active.speaker.avatarsize",     100                 ) );

            // Add response headers that instruct not to cache this data.
            response.setHeader( "Expires",       "Sat, 6 May 1995 12:00:00 GMT" );
            response.setHeader( "Cache-Control", "no-store, no-cache, must-revalidate" );
            response.addHeader( "Cache-Control", "post-check=0, pre-check=0" );
            response.setHeader( "Pragma",        "no-cache" );
            response.setHeader( "Content-Type",  "application/javascript" );
            response.setHeader( "Connection",    "close" );

            // Write out the JSON object.
            response.getOutputStream().println( "var interfaceConfig = " + config.toString( 2 ) + ";" );
        }
        catch ( Exception e )
        {
            Log.error( "[{}] Failed to generate interfaceconfig!", request.getRemoteAddr(), e );
        }
    }
}