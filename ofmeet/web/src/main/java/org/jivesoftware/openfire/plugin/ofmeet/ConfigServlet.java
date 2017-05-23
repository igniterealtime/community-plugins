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

/*
 * Jitsi Videobridge, OpenSource video conferencing.
 *
 * Distributable under LGPL license.
 * See terms of license at gnu.org.
 */

package org.jivesoftware.openfire.plugin.ofmeet;

import org.igniterealtime.openfire.plugin.ofmeet.config.OFMeetConfig;
import org.jivesoftware.openfire.XMPPServer;
import org.jivesoftware.util.JiveGlobals;
import org.json.JSONArray;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;

/**
 * A servlet that generates a snippet of javascript (json) that is the 'config' variable, as used by the Jitsi
 * Meet webapplication.
 *
 * @author Guus der Kinderen, guus.der.kinderen@gmail.com
 */
public class ConfigServlet extends HttpServlet
{
    /*
        As compared to version 0.3 of OFMeet, various bits are missing:
        - user avatars cannot be set in the config any longer - likely, it needs to be retrieved by the webapp though XMPP
        - bookmarks/autojoin should now also be retrieved by the webapp, through XMPP.
        - authentication should no longer occur at a servlet base, as the webapp now performs XMPP-based auth. We want to prevent duplicate logins.
        - SIP functionality was removed (but should likely be restored).
        - usenodejs config property was removed (does not appear to do anything any longer?)
     */
    private static final Logger Log = LoggerFactory.getLogger( ConfigServlet.class );
    public static String globalConferenceId = null;

    public void doGet( HttpServletRequest request, HttpServletResponse response ) throws ServletException, IOException
    {
        try
        {
            Log.trace( "[{}] config requested.", request.getRemoteAddr() );

            final OFMeetConfig ofMeetConfig = new OFMeetConfig();

            final String xmppDomain = XMPPServer.getInstance().getServerInfo().getXMPPDomain();

            final JSONArray conferences = new JSONArray();

            writeHeader( response );

            ServletOutputStream out = response.getOutputStream();

            String recordingKey = null;


            int minHDHeight = JiveGlobals.getIntProperty( "org.jitsi.videobridge.ofmeet.min.hdheight", 540 );
            int resolution = JiveGlobals.getIntProperty( "org.jitsi.videobridge.ofmeet.resolution", 360 );
            boolean audioMixer = JiveGlobals.getBooleanProperty( "org.jitsi.videobridge.ofmeet.audio.mixer", false );
            int audioBandwidth = JiveGlobals.getIntProperty( "org.jitsi.videobridge.ofmeet.audio.bandwidth", 128 );
            int videoBandwidth = JiveGlobals.getIntProperty( "org.jitsi.videobridge.ofmeet.video.bandwidth", 4096 );
            boolean useNicks = JiveGlobals.getBooleanProperty( "org.jitsi.videobridge.ofmeet.usenicks", false );
            boolean useIPv6 = JiveGlobals.getBooleanProperty( "org.jitsi.videobridge.ofmeet.useipv6", false );
            boolean useStunTurn = JiveGlobals.getBooleanProperty( "org.jitsi.videobridge.ofmeet.use.stunturn", false );
            boolean recordVideo = JiveGlobals.getBooleanProperty( "org.jitsi.videobridge.ofmeet.media.record", false );
            String defaultSipNumber = JiveGlobals.getProperty( "org.jitsi.videobridge.ofmeet.default.sip.number", "" );
            boolean useRtcpMux = JiveGlobals.getBooleanProperty( "org.jitsi.videobridge.ofmeet.use.rtcp.mux", true );
            boolean useBundle = JiveGlobals.getBooleanProperty( "org.jitsi.videobridge.ofmeet.use.bundle", true );
            boolean enableWelcomePage = JiveGlobals.getBooleanProperty( "org.jitsi.videobridge.ofmeet.enable.welcomePage", true );
            boolean enableRtpStats = JiveGlobals.getBooleanProperty( "org.jitsi.videobridge.ofmeet.enable.rtp.stats", true );
            boolean openSctp = JiveGlobals.getBooleanProperty( "org.jitsi.videobridge.ofmeet.open.sctp", true );
            String desktopSharing = JiveGlobals.getProperty( "org.jitsi.videobridge.ofmeet.desktop.sharing", "ext" );
            String chromeExtensionId = JiveGlobals.getProperty( "org.jitsi.videobridge.ofmeet.chrome.extension.id", "fohfnhgabmicpkjcpjpjongpijcffaba" );
            String desktopShareSrcs = JiveGlobals.getProperty( "org.jitsi.videobridge.ofmeet.desktop.sharing.sources", "[\"screen\", \"window\"]" );
            String minChromeExtVer = JiveGlobals.getProperty( "org.jitsi.videobridge.ofmeet.min.chrome.ext.ver", "0.1" );
            int startBitrate = JiveGlobals.getIntProperty( "org.jitsi.videobridge.ofmeet.start.bitrate", 800 );
            boolean logStats = JiveGlobals.getBooleanProperty( "org.jitsi.videobridge.ofmeet.enable.stats.logging", false );
            String focusUserJid = JiveGlobals.getProperty( "org.jitsi.videobridge.ofmeet.focus.user.jid", "focus@" + xmppDomain );
            String iceServers = JiveGlobals.getProperty( "org.jitsi.videobridge.ofmeet.iceservers", "" );
            String xirsysUrl = JiveGlobals.getProperty( "ofmeet.xirsys.url", null );

            if ( xirsysUrl != null )
            {
                Log.info( "OFMeetConfig. found xirsys Url " + xirsysUrl );

                String xirsysJson = getHTML( xirsysUrl );
                Log.info( "OFMeetConfig. got xirsys json " + xirsysJson );

                JSONObject jsonObject = new JSONObject( xirsysJson );
                iceServers = jsonObject.getString( "d" );

                Log.info( "OFMeetConfig. got xirsys iceSevers " + iceServers );
            }

            final JSONObject config = new JSONObject();

            final Map<String, String> hosts = new HashMap<>();
            hosts.put( "domain", xmppDomain );
            hosts.put( "muc", "conference." + xmppDomain );
            hosts.put( "bridge", "jitsi-videobridge." + xmppDomain );
            hosts.put( "focus", "focus." + xmppDomain );
            config.put( "hosts", hosts );


            if ( iceServers != null && !iceServers.trim().isEmpty() )
            {
                config.put( "iceServers", iceServers.trim() );
            }
            config.put( "enforcedBridge", "jitsi-videobridge." + xmppDomain );
            config.put( "useStunTurn", useStunTurn );
            config.put( "useIPv6", useIPv6 );
            config.put( "useNicks", useNicks );
            config.put( "useRtcpMux", useRtcpMux );
            config.put( "useBundle", useBundle );
            config.put( "enableWelcomePage", enableWelcomePage );
            config.put( "enableRtpStats", enableRtpStats );
            config.put( "openSctp", openSctp );

            if ( recordingKey == null || recordingKey.isEmpty() )
            {
                config.put( "enableRecording", recordVideo );
            }
            else
            {
                config.put( "recordingKey", recordingKey );
            }
            config.put( "clientNode", "http://igniterealtime.org/ofmeet/jitsi-meet/" );
            config.put( "focusUserJid", focusUserJid );
            config.put( "defaultSipNumber", defaultSipNumber );
            config.put( "desktopSharing", desktopSharing );
            config.put( "chromeExtensionId", chromeExtensionId );
            config.put( "desktopSharingSources", new JSONArray( desktopShareSrcs ) );
            config.put( "minChromeExtVersion", minChromeExtVer );
            config.put( "minHDHeight", minHDHeight );
            config.put( "desktopSharingFirefoxExtId", "jidesha@meet.jit.si" );
            config.put( "desktopSharingFirefoxDisabled", false );
            config.put( "desktopSharingFirefoxMaxVersionExtRequired", -1 );
            config.put( "desktopSharingFirefoxExtensionURL", request.getScheme() + "://" + request.getServerName() + ":" + request.getServerPort() + request.getContextPath() + "/jidesha-0.1.1-fx.xpi");
            config.put( "desktopSharingFirefoxExtId", "jidesha@meet.jit.si" );
            config.put( "hiddenDomain", "recorder." + xmppDomain );
            config.put( "startBitrate", startBitrate );
            config.put( "recordingType", "colibri" );
            config.put( "disableAudioLevels", false );
            config.put( "stereo", false );
            config.put( "requireDisplayName", false );
            config.put( "startAudioMuted", 9 );
            config.put( "startVideoMuted", 9 );
            config.put( "resolution", resolution );
            config.put( "audioMixer", audioMixer );
            config.put( "audioBandwidth", audioBandwidth );
            config.put( "videoBandwidth", videoBandwidth );

            config.put( "useRoomAsSharedDocumentName", false );
            config.put( "logStats", logStats );
            config.put( "conferences", conferences );
            if ( globalConferenceId != null && !globalConferenceId.isEmpty() )
            {
                config.put( "globalConferenceId", globalConferenceId );
            }
            config.put( "disableRtx", true );
            config.put( "bosh", getMostPreferredConnectionURL( request ) );

            config.put( "channelLastN", ofMeetConfig.getChannelLastN() );
            config.put( "adaptiveLastN", ofMeetConfig.getAdaptiveLastN() );
            config.put( "disableSimulcast", !ofMeetConfig.getSimulcast() );

            // TODO: find out if both of the settings below are in use (seems silly).
            config.put( "adaptiveSimulcast", ofMeetConfig.getAdaptiveSimulcast() );
            config.put( "disableAdaptiveSimulcast", !ofMeetConfig.getAdaptiveSimulcast() );

            out.println( "var config = " + config.toString( 2 ) + ";" );
        }
        catch ( Exception e )
        {
            Log.error( "OFMeetConfig doGet Error", e );
        }
    }

    private void writeHeader( HttpServletResponse response )
    {
        try
        {
            response.setHeader( "Expires", "Sat, 6 May 1995 12:00:00 GMT" );
            response.setHeader( "Cache-Control", "no-store, no-cache, must-revalidate" );
            response.addHeader( "Cache-Control", "post-check=0, pre-check=0" );
            response.setHeader( "Pragma", "no-cache" );
            response.setHeader( "Content-Type", "application/javascript" );
            response.setHeader( "Connection", "close" );
        }
        catch ( Exception e )
        {
            Log.error( "OFMeetConfig writeHeader Error", e );
        }
    }

    private String getHTML( String urlToRead )
    {
        URL url;
        HttpURLConnection conn;
        BufferedReader rd;
        String line;
        StringBuilder result = new StringBuilder();

        try
        {
            url = new URL( urlToRead );
            conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod( "GET" );
            rd = new BufferedReader( new InputStreamReader( conn.getInputStream() ) );
            while ( ( line = rd.readLine() ) != null )
            {
                result.append( line );
            }
            rd.close();
        }
        catch ( Exception e )
        {
            Log.error( "getHTML", e );
        }

        return result.toString();
    }

    /**
     * Generates an URL on which client / BOSH connections are expected.
     *
     * This method will verify if the websocket plugin is available. If it is, the websocket endpoint is returned. When
     * websocket is not available, the http-bind endpoint is returned.
     *
     * The request that is made to this servlet is used to determine if the client prefers secure/encrypted connections
     * (https, wss) over plain ones (http, ws), and to determine what the server address and port is.
     *
     * @param request the request to this servlet.
     * @return An URL (never null).
     * @throws MalformedURLException When an URL could not be constructed.
     */
    public static URL getMostPreferredConnectionURL( HttpServletRequest request ) throws MalformedURLException
    {
        Log.debug( "[{}] Generating BOSH URL based on {}", request.getRemoteAddr(), request.getRequestURL() );
        if ( XMPPServer.getInstance().getPluginManager().getPlugin( "websocket" ) != null )
        {
            Log.debug( "[{}] Websocket plugin is available. Returning a websocket address.", request.getRemoteAddr() );
            final String websocketScheme;
            if ( request.getScheme().endsWith( "s" ) )
            {
                websocketScheme = "wss";
            }
            else
            {
                websocketScheme = "ws";
            }

            return new URL( websocketScheme, request.getServerName(), request.getServerPort(), "/ws/" );
        }
        else
        {
            Log.debug( "[{}] No Websocket plugin available. Returning an HTTP-BIND address.", request.getRemoteAddr() );
            return new URL( request.getScheme(), request.getServerName(), request.getServerPort(), "/http-bind/" );
        }
    }
}