/*
 * Jitsi Videobridge, OpenSource video conferencing.
 *
 * Distributable under LGPL license.
 * See terms of license at gnu.org.
 */

package org.jivesoftware.openfire.plugin.ofmeet;

import net.sf.json.*;
import org.dom4j.Element;
import org.jitsi.videobridge.Conference;
import org.jitsi.videobridge.Videobridge;
import org.jivesoftware.openfire.XMPPServer;
import org.jivesoftware.openfire.group.Group;
import org.jivesoftware.openfire.group.GroupManager;
import org.jivesoftware.openfire.group.GroupNotFoundException;
import org.jivesoftware.openfire.plugin.spark.Bookmark;
import org.jivesoftware.openfire.plugin.spark.BookmarkManager;
import org.jivesoftware.openfire.roster.Roster;
import org.jivesoftware.openfire.roster.RosterItem;
import org.jivesoftware.openfire.sip.sipaccount.SipAccount;
import org.jivesoftware.openfire.sip.sipaccount.SipAccountDAO;
import org.jivesoftware.openfire.vcard.VCardManager;
import org.jivesoftware.util.JiveGlobals;
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
import java.net.URL;
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;


public class ConfigServlet extends HttpServlet
{
    private static final Logger Log = LoggerFactory.getLogger( ConfigServlet.class );
    public static final long serialVersionUID = 24362462L;
    public static String globalConferenceId = null;

    public void doGet( HttpServletRequest request, HttpServletResponse response ) throws ServletException, IOException
    {
        try
        {
            Log.info( "Config servlet" );
            String hostname = XMPPServer.getInstance().getServerInfo().getHostname();
            String domain = XMPPServer.getInstance().getServerInfo().getXMPPDomain();
            String userName = null;
            String userAvatar = "null";
            String connectionUrl = request.getScheme() + "://" + request.getServerName() + ":" + request.getServerPort() + "/http-bind/";
            String accessToken = null;
            SipAccount sipAccount = null;

            if ( XMPPServer.getInstance().getPluginManager().getPlugin( "websocket" ) != null )
            {
                final String websocketScheme;
                if ( request.getScheme().endsWith( "s" ) )
                {
                    websocketScheme = "wss";
                }
                else
                {
                    websocketScheme = "ws";
                }
                connectionUrl = websocketScheme + "://" + request.getServerName() + ":" + request.getServerPort() + "/ws/";
            }

            boolean securityEnabled = JiveGlobals.getBooleanProperty( "ofmeet.security.enabled", true );

            final JSONArray conferences = new JSONArray();

            if ( securityEnabled )
            {
                userName = request.getUserPrincipal().getName();

                final String token = TokenManager.getInstance().retrieveToken( request.getUserPrincipal() );

                if ( token != null )
                {
                    accessToken = token;
                }

                VCardManager vcardManager = VCardManager.getInstance();
                Element vcard = vcardManager.getVCard( userName );

                if ( vcard != null )
                {
                    Element photo = vcard.element( "PHOTO" );

                    if ( photo != null )
                    {
                        String type = photo.element( "TYPE" ).getText();
                        String binval = photo.element( "BINVAL" ).getText();
                        userAvatar = "data:" + type + ";base64," + binval.replace( "\n", "" ).replace( "\r", "" );
                    }
                }

                boolean sipAvailable = XMPPServer.getInstance().getPluginManager().getPlugin( "sip" ) != null;
                boolean switchAvailable = XMPPServer.getInstance().getPluginManager().getPlugin( "ofswitch" ) != null;

                if ( sipAvailable )
                {
                    sipAccount = SipAccountDAO.getAccountByUser( userName );
                }

                try
                {

                    boolean isBookmarksAvailable = XMPPServer.getInstance().getPluginManager().getPlugin( "bookmarks" ) != null;

                    if ( isBookmarksAvailable )
                    {
                        final Collection<Bookmark> bookmarks = BookmarkManager.getBookmarks();

                        for ( Bookmark bookmark : bookmarks )
                        {
                            boolean addBookmarkForUser = bookmark.isGlobalBookmark() || isBookmarkForJID( userName, bookmark );

                            if ( addBookmarkForUser )
                            {
                                if ( bookmark.getType() == Bookmark.Type.group_chat )
                                {
                                    String url = bookmark.getProperty( "url" );

                                    if ( url == null )
                                    {
                                        String id = bookmark.getBookmarkID() + "" + System.currentTimeMillis();
                                        String rootUrl = JiveGlobals.getProperty( "ofmeet.root.url.secure", "https://" + hostname + ":" + JiveGlobals.getProperty( "httpbind.port.secure", "7443" ) );
                                        url = rootUrl + "/ofmeet/?b=" + id;
                                        bookmark.setProperty( "url", url );
                                    }
                                    final JSONObject conference = new JSONObject();
                                    conference.put( "url", url );
                                    conference.put( "name", bookmark.getName() );
                                    conference.put( "jid", bookmark.getValue() );
                                    conferences.put( conference );
                                }
                            }
                        }
                    }

                }
                catch ( Exception e )
                {
                    Log.warn( "Unable to read bookmarks!", e );
                }
            }

            boolean nodejs = XMPPServer.getInstance().getPluginManager().getPlugin( "nodejs" ) != null;

            writeHeader( response );

            ServletOutputStream out = response.getOutputStream();

            String recordingKey = null;


            // new ones
            boolean disableSimulcast = JiveGlobals.getBooleanProperty( "org.jitsi.videobridge.ofmeet.disable.simulcast", false );
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
            boolean adaptiveLastN = JiveGlobals.getBooleanProperty( "org.jitsi.videobridge.ofmeet.adaptive.lastn", false );
            boolean adaptiveSimulcast = JiveGlobals.getBooleanProperty( "org.jitsi.videobridge.ofmeet.adaptive.simulcast", false );
            boolean useRtcpMux = JiveGlobals.getBooleanProperty( "org.jitsi.videobridge.ofmeet.use.rtcp.mux", true );
            boolean useBundle = JiveGlobals.getBooleanProperty( "org.jitsi.videobridge.ofmeet.use.bundle", true );
            boolean enableWelcomePage = JiveGlobals.getBooleanProperty( "org.jitsi.videobridge.ofmeet.enable.welcomePage", true );
            boolean enableRtpStats = JiveGlobals.getBooleanProperty( "org.jitsi.videobridge.ofmeet.enable.rtp.stats", true );
            boolean openSctp = JiveGlobals.getBooleanProperty( "org.jitsi.videobridge.ofmeet.open.sctp", true );
            String desktopSharing = JiveGlobals.getProperty( "org.jitsi.videobridge.ofmeet.desktop.sharing", "ext" );
            String chromeExtensionId = JiveGlobals.getProperty( "org.jitsi.videobridge.ofmeet.chrome.extension.id", "fohfnhgabmicpkjcpjpjongpijcffaba" );
            int channelLastN = JiveGlobals.getIntProperty( "org.jitsi.videobridge.ofmeet.channel.lastn", -1 );
            String desktopShareSrcs = JiveGlobals.getProperty( "org.jitsi.videobridge.ofmeet.desktop.sharing.sources", "[\"screen\", \"window\"]" );
            String minChromeExtVer = JiveGlobals.getProperty( "org.jitsi.videobridge.ofmeet.min.chrome.ext.ver", "0.1" );
            int startBitrate = JiveGlobals.getIntProperty( "org.jitsi.videobridge.ofmeet.start.bitrate", 800 );
            boolean logStats = JiveGlobals.getBooleanProperty( "org.jitsi.videobridge.ofmeet.enable.stats.logging", false );
            String focusUserJid = JiveGlobals.getProperty( "org.jitsi.videobridge.ofmeet.focus.user.jid", "focus@" + domain );
            String iceServers = JiveGlobals.getProperty( "org.jitsi.videobridge.ofmeet.iceservers", "" );

            String xirsysUrl = JiveGlobals.getProperty( "ofmeet.xirsys.url", null );

            if ( xirsysUrl != null )
            {
                Log.info( "Config. found xirsys Url " + xirsysUrl );

                String xirsysJson = getHTML( xirsysUrl );
                Log.info( "Config. got xirsys json " + xirsysJson );

                JSONObject jsonObject = new JSONObject( xirsysJson );
                iceServers = jsonObject.getString( "d" );

                Log.info( "Config. got xirsys iceSevers " + iceServers );
            }

            if ( "on".equals( JiveGlobals.getProperty( "org.jitsi.videobridge.ofmeet.global.intercom", "off" ) ) )
            {
                final OfMeetPlugin ofmeet = (OfMeetPlugin) XMPPServer.getInstance().getPluginManager().getPlugin( "ofmeet" );
                Videobridge videobridge = ofmeet.getVideobridge();

                if ( globalConferenceId == null || videobridge.getConference( globalConferenceId, null ) == null )
                {
                    Conference conference = videobridge.createConference( null, "Openfire Meetings" );
                    conference.setLastKnownFocus( domain );
                    globalConferenceId = conference.getID();
                }
            }

            final JSONObject config = new JSONObject();

            final Map<String, String> hosts = new HashMap<>();
            hosts.put( "domain", domain );
            hosts.put( "muc", "conference." + domain );
            hosts.put( "bridge", "videobridge." + domain );
            hosts.put( "focus", "focus." + domain );
            config.put( "hosts", hosts );

            if ( sipAccount != null )
            {
                final Roster roster = XMPPServer.getInstance().getRosterManager().getRoster( userName );
                final JSONArray sipPeers = new JSONArray();

                for ( final RosterItem item : roster.getRosterItems() )
                {
                    final String peerUser = item.getJid().getNode();
                    final SipAccount peerAccount = SipAccountDAO.getAccountByUser( peerUser );

                    if ( peerAccount != null )
                    {
                        final JSONObject peer = new JSONObject();
                        peer.put( "username", peerAccount.getSipUsername() );
                        peer.put( "name", peerAccount.getDisplayName() );
                        sipPeers.put( peer );
                    }
                }

                final JSONObject sip = new JSONObject();
                sip.put( "peers", sipPeers );
                sip.put( "username", sipAccount.getSipUsername() );
                sip.put( "authusername", sipAccount.getAuthUsername() );
                sip.put( "displayname", sipAccount.getDisplayName() );
                sip.put( "password", sipAccount.getPassword() );
                sip.put( "server", sipAccount.getServer() );
                sip.put( "enabled", sipAccount.isEnabled() );
                sip.put( "voicemail", sipAccount.getVoiceMailNumber() );
                sip.put( "outboundproxy", sipAccount.getOutboundproxy() );

                config.put( "sip", sip );
            }

            if ( iceServers != null && !iceServers.trim().isEmpty() )
            {
                config.put( "iceServers", iceServers.trim() );
            }
            config.put( "enforcedBridge", "videobridge." + domain );
            config.put( "disableSimulcast", disableSimulcast );
            config.put( "useStunTurn", useStunTurn );
            config.put( "useIPv6", useIPv6 );
            config.put( "useNicks", useNicks );
            config.put( "adaptiveLastN", adaptiveLastN );
            config.put( "adaptiveSimulcast", adaptiveSimulcast );
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
            config.put( "desktopSharingSources", JSONArray.fromString( desktopShareSrcs ) );
            config.put( "minChromeExtVersion", minChromeExtVer );
            config.put( "channelLastN", channelLastN );
            config.put( "minHDHeight", minHDHeight );
            config.put( "useNodeJs", nodejs );
            config.put( "desktopSharingFirefoxExtId", "jidesha@meet.jit.si" );
            config.put( "desktopSharingFirefoxDisabled", false );
            config.put( "desktopSharingFirefoxMaxVersionExtRequired", -1 );
            config.put( "desktopSharingFirefoxExtensionURL", request.getScheme() + "://" + request.getServerName() + ":" + request.getServerPort() + request.getContextPath() + "/jidesha-0.1.1-fx.xpi");
            config.put( "desktopSharingFirefoxExtId", "jidesha@meet.jit.si" );
            config.put( "hiddenDomain", "recorder." + domain );
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

            if ( userName != null && !userName.isEmpty() )
            {
                config.put( "id", userName + "@" + domain );
            }

            if ( accessToken != null && !accessToken.isEmpty() )
            {
                config.put( "password", accessToken );
            }
            config.put( "userAvatar", userAvatar );
            config.put( "useRoomAsSharedDocumentName", false );
            config.put( "logStats", logStats );
            config.put( "conferences", conferences );
            if ( globalConferenceId != null && !globalConferenceId.isEmpty() )
            {
                config.put( "globalConferenceId", globalConferenceId );
            }
            config.put( "disableRtx", true );
            config.put( "bosh", connectionUrl );

            out.println( "var config = " + config.toString( 2 ) + ";" );

            // UI Config
            String defaultBackground = JiveGlobals.getProperty( "org.jitsi.videobridge.ofmeet.default.background", "#474747" );
            int canvasExtra = JiveGlobals.getIntProperty( "org.jitsi.videobridge.ofmeet.canvas.extra", 104 );
            int canvasRadius = JiveGlobals.getIntProperty( "org.jitsi.videobridge.ofmeet.canvas.radius", 7 );
            String shadowColor = JiveGlobals.getProperty( "org.jitsi.videobridge.ofmeet.shadow.color", "#ffffff" );
            int initialToolbarTimeout = JiveGlobals.getIntProperty( "org.jitsi.videobridge.ofmeet.initial.toolbar.timeout", 20000 );
            int toolbarTimeout = JiveGlobals.getIntProperty( "org.jitsi.videobridge.ofmeet.toolbar.timeout", 4000 );
            String defRemoteDisplName = JiveGlobals.getProperty( "org.jitsi.videobridge.ofmeet.default.remote.displayname", "Change Me" );
            String defDomSpkrDisplName = JiveGlobals.getProperty( "org.jitsi.videobridge.ofmeet.default.speaker.displayname", "Speaker" );
            String defLocalDisplName = JiveGlobals.getProperty( "org.jitsi.videobridge.ofmeet.default.local.displayname", "Me" );
            String watermarkLink = JiveGlobals.getProperty( "org.jitsi.videobridge.ofmeet.watermark.link", "" );
            boolean showWatermark = JiveGlobals.getBooleanProperty( "org.jitsi.videobridge.ofmeet.show.watermark", false );
            String brandWatermarkLink = JiveGlobals.getProperty( "org.jitsi.videobridge.ofmeet.brand.watermark.link", "" );
            boolean brandShowWatermark = JiveGlobals.getBooleanProperty( "org.jitsi.videobridge.ofmeet.brand.show.watermark", false );
            boolean showPoweredBy = JiveGlobals.getBooleanProperty( "org.jitsi.videobridge.ofmeet.show.poweredby", false );
            boolean randomRoomNames = JiveGlobals.getBooleanProperty( "org.jitsi.videobridge.ofmeet.random.roomnames", true );
            String applicationName = JiveGlobals.getProperty( "org.jitsi.videobridge.ofmeet.application.name", "Openfire Meetings" );
            int activeSpkrAvatarSize = JiveGlobals.getIntProperty( "org.jitsi.videobridge.ofmeet.active.speaker.avatarsize", 100 );
            boolean showContactListAvatars = JiveGlobals.getBooleanProperty( "org.jitsi.videobridge.ofmeet.show.contactlist.avatars", false );
            boolean initationPoweredBy = JiveGlobals.getBooleanProperty( "org.jitsi.videobridge.ofmeet.invitation.poweredby", true );
            String videoLayoutFit = JiveGlobals.getProperty( "org.jitsi.videobridge.ofmeet.video.layout.fit", "both" );
            String toolbarButtons = JiveGlobals.getProperty( "org.jitsi.videobridge.ofmeet.toolbar.buttons", "'authentication', 'microphone', 'camera', 'desktop','recording', 'security', 'invite', 'chat', 'etherpad', 'sharedvideo','fullscreen', 'sip', 'dialpad', 'settings', 'hangup', 'filmstrip','contacts'" );
            String settingsSections = JiveGlobals.getProperty( "org.jitsi.videobridge.ofmeet.settings.sections", "'language', 'devices', 'moderator'" );
            String mainToolbarButtons = JiveGlobals.getProperty( "org.jitsi.videobridge.ofmeet.main.toolbar.buttons", "'microphone', 'camera', 'desktop', 'invite', 'hangup'" );
            if ( !toolbarButtons.trim().startsWith( "[" ) )
            {
                toolbarButtons = "[" + toolbarButtons;
            }
            if ( !toolbarButtons.trim().endsWith( "]" ) )
            {
                toolbarButtons = toolbarButtons + "]";
            }
            if ( !settingsSections.trim().startsWith( "[" ) )
            {
                settingsSections = "[" + settingsSections;
            }
            if ( !settingsSections.trim().endsWith( "]" ) )
            {
                settingsSections = settingsSections + "]";
            }
            if ( !mainToolbarButtons.trim().startsWith( "[" ) )
            {
                mainToolbarButtons = "[" + mainToolbarButtons;
            }
            if ( !mainToolbarButtons.trim().endsWith( "]" ) )
            {
                mainToolbarButtons = mainToolbarButtons + "]";
            }

            final JSONObject interfaceConfig = new JSONObject();

            interfaceConfig.put( "CANVAS_EXTRA", canvasExtra );
            interfaceConfig.put( "CANVAS_RADIUS", canvasRadius );
            interfaceConfig.put( "SHADOW_COLOR", shadowColor );
            interfaceConfig.put( "DEFAULT_BACKGROUND", defaultBackground );
            interfaceConfig.put( "INITIAL_TOOLBAR_TIMEOUT", initialToolbarTimeout );
            interfaceConfig.put( "TOOLBAR_TIMEOUT", toolbarTimeout );
            interfaceConfig.put( "DEFAULT_REMOTE_DISPLAY_NAME", defRemoteDisplName );
            interfaceConfig.put( "DEFAULT_DOMINANT_SPEAKER_DISPLAY_NAME", defDomSpkrDisplName );
            interfaceConfig.put( "DEFAULT_LOCAL_DISPLAY_NAME", defLocalDisplName );
            interfaceConfig.put( "SHOW_JITSI_WATERMARK", showWatermark );
            interfaceConfig.put( "JITSI_WATERMARK_LINK", watermarkLink );
            interfaceConfig.put( "SHOW_BRAND_WATERMARK", brandShowWatermark );
            interfaceConfig.put( "BRAND_WATERMARK_LINK", brandWatermarkLink );
            interfaceConfig.put( "SHOW_POWERED_BY", showPoweredBy );
            interfaceConfig.put( "GENERATE_ROOMNAMES_ON_WELCOME_PAGE", randomRoomNames );
            interfaceConfig.put( "APP_NAME", applicationName );
            interfaceConfig.put( "INVITATION_POWERED_BY", initationPoweredBy );
            interfaceConfig.put( "MAIN_TOOLBAR_BUTTONS", JSONArray.fromString( mainToolbarButtons ) );
            interfaceConfig.put( "TOOLBAR_BUTTONS", JSONArray.fromString( toolbarButtons ) );
            interfaceConfig.put( "SETTINGS_SECTIONS", JSONArray.fromString( settingsSections ) );
            interfaceConfig.put( "VIDEO_LAYOUT_FIT", videoLayoutFit );
            interfaceConfig.put( "SHOW_CONTACTLIST_AVATARS", showContactListAvatars );
            interfaceConfig.put( "filmStripOnly", false );
            interfaceConfig.put( "RANDOM_AVATAR_URL_PREFIX", "" );
            interfaceConfig.put( "RANDOM_AVATAR_URL_SUFFIX", "" );
            interfaceConfig.put( "FILM_STRIP_MAX_HEIGHT", 120 );
            interfaceConfig.put( "LOCAL_THUMBNAIL_RATIO_WIDTH", 16 );
            interfaceConfig.put( "LOCAL_THUMBNAIL_RATIO_HEIGHT", 9 );
            interfaceConfig.put( "REMOTE_THUMBNAIL_RATIO_WIDTH", 1 );
            interfaceConfig.put( "REMOTE_THUMBNAIL_RATIO_HEIGHT", 1 );
            interfaceConfig.put( "ENABLE_FEEDBACK_ANIMATION", false );
            interfaceConfig.put( "DISABLE_FOCUS_INDICATOR", false );
            interfaceConfig.put( "ACTIVE_SPEAKER_AVATAR_SIZE", activeSpkrAvatarSize );

            out.println( "var interfaceConfig = " + interfaceConfig.toString( 2 ) + ";" );
        }
        catch ( Exception e )
        {
            Log.error( "Config doGet Error", e );
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
            Log.error( "Config writeHeader Error", e );
        }
    }

    private boolean isBookmarkForJID( String username, Bookmark bookmark )
    {
        if ( username == null || username.equals( "null" ) )
        {
            return false;
        }

        if ( bookmark.getUsers().contains( username ) )
        {
            return true;
        }

        Collection<String> groups = bookmark.getGroups();

        if ( groups != null && !groups.isEmpty() )
        {
            GroupManager groupManager = GroupManager.getInstance();

            for ( String groupName : groups )
            {
                try
                {
                    Group group = groupManager.getGroup( groupName );

                    if ( group.isUser( username ) )
                    {
                        return true;
                    }
                }
                catch ( GroupNotFoundException e )
                {
                    Log.debug( e.getMessage(), e );
                }
            }
        }
        return false;
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
}