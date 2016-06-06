/*
 * Jitsi Videobridge, OpenSource video conferencing.
 *
 * Distributable under LGPL license.
 * See terms of license at gnu.org.
 */

package org.jitsi.videobridge.openfire;

import org.jivesoftware.util.*;
import org.jivesoftware.openfire.*;
import org.jivesoftware.openfire.vcard.VCardManager;
import org.jivesoftware.openfire.plugin.spark.*;
import org.jivesoftware.openfire.group.Group;
import org.jivesoftware.openfire.group.GroupManager;
import org.jivesoftware.openfire.group.GroupNotFoundException;

import org.slf4j.*;
import org.slf4j.Logger;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.ServletOutputStream;

import java.io.*;
import java.net.*;
import java.util.*;
import java.text.*;
import java.security.Principal;

import org.jitsi.videobridge.openfire.PluginImpl;
import org.jitsi.videobridge.*;
import org.jivesoftware.openfire.plugin.ofmeet.TokenManager;
import org.jivesoftware.openfire.sip.sipaccount.*;

import org.dom4j.*;

import net.sf.json.*;


public class Config extends HttpServlet
{
    private static final Logger Log = LoggerFactory.getLogger(Config.class);
	public static final long serialVersionUID = 24362462L;
	public static String globalConferenceId = null;

	public void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

		try {
			Log.info("Config servlet");
			String hostname = XMPPServer.getInstance().getServerInfo().getHostname();
			String domain = XMPPServer.getInstance().getServerInfo().getXMPPDomain();
			String userName = null;
			String userAvatar = "null";
			String connectionUrl = "window.location.protocol + '//' + window.location.host + '/http-bind/'";
			String accessToken = null;
			SipAccount sipAccount = null;
			String conferences = "[";

			if (XMPPServer.getInstance().getPluginManager().getPlugin("websocket") != null)
			{
				connectionUrl = "'wss://' + window.location.host + '/ws/'";
			}

			String securityEnabled = JiveGlobals.getProperty("ofmeet.security.enabled", "true");

			if ("true".equals(securityEnabled))
			{
				userName = request.getUserPrincipal().getName();

				final String token = TokenManager.getInstance().retrieveToken(request.getUserPrincipal());

				if (token != null)
				{
					accessToken = token;
				}

				VCardManager vcardManager = VCardManager.getInstance();
				Element vcard = vcardManager.getVCard(userName);

				if (vcard != null)
				{
					Element photo = vcard.element("PHOTO");

					if (photo != null)
					{
						String type = photo.element("TYPE").getText();
						String binval = photo.element("BINVAL").getText();
						userAvatar = "data:" + type + ";base64," + binval.replace("\n", "").replace("\r", "");;
					}
				}

				boolean sipAvailable = XMPPServer.getInstance().getPluginManager().getPlugin("sip") != null;
				boolean switchAvailable = XMPPServer.getInstance().getPluginManager().getPlugin("ofswitch") != null;

				if (sipAvailable)
				{
					sipAccount = SipAccountDAO.getAccountByUser(userName);
				}

				try {

					boolean isBookmarksAvailable = XMPPServer.getInstance().getPluginManager().getPlugin("bookmarks") != null;

					if (isBookmarksAvailable)
					{
						final Collection<Bookmark> bookmarks = BookmarkManager.getBookmarks();

						for (Bookmark bookmark : bookmarks)
						{
							boolean addBookmarkForUser = bookmark.isGlobalBookmark() || isBookmarkForJID(userName, bookmark);

							if (addBookmarkForUser)
							{
								if (bookmark.getType() == Bookmark.Type.group_chat)
								{
									String url = bookmark.getProperty("url");

									if (url == null)
									{
										String id = bookmark.getBookmarkID() + "" + System.currentTimeMillis();
										String rootUrl = JiveGlobals.getProperty("ofmeet.root.url.secure", "https://" + hostname + ":" + JiveGlobals.getProperty("httpbind.port.secure", "7443"));
										url = rootUrl + "/ofmeet/?b=" + id;
										bookmark.setProperty("url", url);
									}
									conferences = conferences + (conferences.equals("[") ? "" : ",");
									conferences = conferences + "{url: '" + url + "', name: '" + bookmark.getName() + "', jid: '" + bookmark.getValue() + "'}";
								}
							}
						}
					}

				} catch (Exception e) {

				}
			}

			conferences = conferences + "]";

			boolean nodejs = XMPPServer.getInstance().getPluginManager().getPlugin("nodejs") != null;

			writeHeader(response);

			ServletOutputStream out = response.getOutputStream();

			String recordingKey = null;

			if (JiveGlobals.getProperty("ofmeet.autorecord.enabled", "false").equals("true"))
			{
				recordingKey = JiveGlobals.getProperty("org.jitsi.videobridge.ofmeet.recording.secret", "secret");
			}

			// new ones
			String disableSimulcast 	= JiveGlobals.getProperty("org.jitsi.videobridge.ofmeet.disable.simulcast", "false");
			String minHDHeight			= JiveGlobals.getProperty("org.jitsi.videobridge.ofmeet.min.hdheight", "540");

			String resolution 			= JiveGlobals.getProperty("org.jitsi.videobridge.ofmeet.resolution", "360");
			String audioMixer			= JiveGlobals.getProperty("org.jitsi.videobridge.ofmeet.audio.mixer", "false");
			String audioBandwidth 		= JiveGlobals.getProperty("org.jitsi.videobridge.ofmeet.audio.bandwidth", "128");
			String videoBandwidth 		= JiveGlobals.getProperty("org.jitsi.videobridge.ofmeet.video.bandwidth", "4096");
			String useNicks 			= JiveGlobals.getProperty("org.jitsi.videobridge.ofmeet.usenicks", "false");
			String useIPv6 				= JiveGlobals.getProperty("org.jitsi.videobridge.ofmeet.useipv6", "false");
			String useStunTurn 			= JiveGlobals.getProperty("org.jitsi.videobridge.ofmeet.use.stunturn", "false");
			String recordVideo 			= JiveGlobals.getProperty("org.jitsi.videobridge.ofmeet.media.record", "false");
			String defaultSipNumber 	= JiveGlobals.getProperty("org.jitsi.videobridge.ofmeet.default.sip.number", "");
			String adaptiveLastN 		= JiveGlobals.getProperty("org.jitsi.videobridge.ofmeet.adaptive.lastn", "false");
			String adaptiveSimulcast	= JiveGlobals.getProperty("org.jitsi.videobridge.ofmeet.adaptive.simulcast", "false");
			String useRtcpMux 			= JiveGlobals.getProperty("org.jitsi.videobridge.ofmeet.use.rtcp.mux", "true");
			String useBundle 			= JiveGlobals.getProperty("org.jitsi.videobridge.ofmeet.use.bundle", "true");
			String enableWelcomePage	= JiveGlobals.getProperty("org.jitsi.videobridge.ofmeet.enable.welcomePage", "true");
			String enableRtpStats 		= JiveGlobals.getProperty("org.jitsi.videobridge.ofmeet.enable.rtp.stats", "true");
			String openSctp 			= JiveGlobals.getProperty("org.jitsi.videobridge.ofmeet.open.sctp", "true");
			String desktopSharing 		= JiveGlobals.getProperty("org.jitsi.videobridge.ofmeet.desktop.sharing", "ext");
			String chromeExtensionId	= JiveGlobals.getProperty("org.jitsi.videobridge.ofmeet.chrome.extension.id", "fohfnhgabmicpkjcpjpjongpijcffaba");
			String channelLastN 		= JiveGlobals.getProperty("org.jitsi.videobridge.ofmeet.channel.lastn", "-1");
			String desktopShareSrcs		= JiveGlobals.getProperty("org.jitsi.videobridge.ofmeet.desktop.sharing.sources", "[\"screen\", \"window\"]");
			String minChromeExtVer		= JiveGlobals.getProperty("org.jitsi.videobridge.ofmeet.min.chrome.ext.ver", "0.1");
			String enableFirefoxSupport = JiveGlobals.getProperty("org.jitsi.videobridge.ofmeet.enable.firefox.support", "false");
			String logStats 			= JiveGlobals.getProperty("org.jitsi.videobridge.ofmeet.enable.stats.logging", "false");
			String focusUserJid 		= JiveGlobals.getProperty("org.jitsi.videobridge.ofmeet.focus.user.jid", "focus@"+domain);
			String iceServers 			= JiveGlobals.getProperty("org.jitsi.videobridge.ofmeet.iceservers", "");

			String xirsysUrl = JiveGlobals.getProperty("ofmeet.xirsys.url", null);

			if (xirsysUrl != null)
			{
				Log.info("Config. found xirsys Url " + xirsysUrl);

				String xirsysJson = getHTML(xirsysUrl);
				Log.info("Config. got xirsys json " + xirsysJson);

				JSONObject jsonObject = new JSONObject(xirsysJson);
				iceServers = jsonObject.getString("d");

				Log.info("Config. got xirsys iceSevers " + iceServers);
			}

			if ("on".equals(JiveGlobals.getProperty("org.jitsi.videobridge.ofmeet.global.intercom", "off")))
			{
				Videobridge videobridge = PluginImpl.component.getVideobridge();

				if (globalConferenceId == null || videobridge.getConference(globalConferenceId, null) == null)
				{
					Conference conference = videobridge.createConference(null);
					if (recordVideo.equals("true")) conference.setRecording(true);
					conference.setLastKnownFocus(domain);
					globalConferenceId = conference.getID();
				}
			}

			out.println("var config = {");
			out.println("    hosts: {");
			out.println("        domain: '" + domain + "',");
			out.println("        muc: 'conference." + domain + "',");
			out.println("        bridge: 'videobridge." + domain + "',");
			out.println("        focus: 'focus." + domain + "',");
			out.println("    },");
			out.println("    getroomnode: function (path)");
			out.println("    {");
			out.println("		var name = 'r';");
			out.println("		var roomnode = null;");

			out.println("		var results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(window.location.href);");

			out.println("		if (!results)");
			out.println("			roomnode = null; ");
			out.println("		else 	roomnode = results[1] || undefined;	");

			out.println("		if (!roomnode) {");
			out.println("			roomnode = Math.random().toString(36).substr(2, 20);");
			out.println("			window.history.pushState('VideoChat', 'Room: ' + roomnode, path + '?r=' + roomnode);");
			out.println("		}");
			out.println("		return roomnode.toLowerCase();    ");
			out.println("    },	");

			if (sipAccount != null)
			{
				out.println("    sip: {");
				out.println("        username: '" 			+ sipAccount.getSipUsername() + "',");
				out.println("        authusername: '" 		+ sipAccount.getAuthUsername() + "',");
				out.println("        displayname: '" 		+ sipAccount.getDisplayName() + "',");
				out.println("        password: '" 			+ sipAccount.getPassword() + "',");
				out.println("        server: '" 			+ sipAccount.getServer() + "',");
				out.println("        enabled: " 			+ sipAccount.isEnabled() + ",");
				out.println("        voicemail: '" 			+ sipAccount.getVoiceMailNumber() + "',");
				out.println("        outboundproxy: '" 		+ sipAccount.getOutboundproxy() + "',");
				out.println("    },");
			}

			if (!iceServers.trim().equals("")) out.println("    iceServers: " + iceServers + ",");
			out.println("    enforcedBridge: 'videobridge." + domain + "',");
			out.println("    disableSimulcast: " + disableSimulcast + ",");
			out.println("    useStunTurn: " + useStunTurn + ",");
			out.println("    useIPv6: " + useIPv6 + ",");
			out.println("    useNicks: " + useNicks + ",");
			out.println("    adaptiveLastN: " + adaptiveLastN + ",");
			out.println("    adaptiveSimulcast: " + adaptiveSimulcast + ",");
			out.println("    useRtcpMux: " + useRtcpMux + ",");
			out.println("    useBundle: " + useBundle + ",");
			out.println("    enableWelcomePage: " + enableWelcomePage + ",");
			out.println("    enableRtpStats: " + enableRtpStats + ",");
			out.println("    openSctp: " + openSctp + ",");
			if (recordingKey == null) out.println("    enableRecording: " + recordVideo + ",");
			if (recordingKey != null) out.println("    recordingKey: '" + recordingKey + "',");
			out.println("    clientNode: 'http://igniterealtime.org/ofmeet',");
			out.println("    focusUserJid: '" + focusUserJid + "',");
			out.println("    defaultSipNumber: '" + defaultSipNumber + "',");
			out.println("    desktopSharing: '" + desktopSharing + "',");
			out.println("    chromeExtensionId: '" + chromeExtensionId + "',");
			out.println("    desktopSharingSources: '" + desktopShareSrcs + "',");
			out.println("    minChromeExtVersion: '" + minChromeExtVer + "',");
			out.println("    channelLastN: " + channelLastN + ",");
			out.println("    minHDHeight: " + minHDHeight + ",");
			out.println("    useNodeJs: " + (nodejs ? "true" : "false") + ",");

			out.println("    desktopSharingFirefoxExtId: 'jidesha@meet.jit.si',");
			out.println("    desktopSharingFirefoxDisabled: false,");
			out.println("    desktopSharingFirefoxMaxVersionExtRequired: -1,");
			out.println("    desktopSharingFirefoxExtensionURL: window.location.protocol + '//' + window.location.host + '/ofmeet/jidesha-0.1.1-fx.xpi',");
			out.println("    desktopSharingFirefoxExtId: 'jidesha@meet.jit.si',");

			out.println("    hiddenDomain: 'recorder." + domain + "',");
			out.println("    startBitrate: '800',");
			out.println("    recordingType: 'colibri',");
			out.println("    disableAudioLevels: false,");
			out.println("    stereo: false,");
			out.println("    requireDisplayName: false,");
			out.println("    startAudioMuted: 9,");
			out.println("    startVideoMuted: 9,");

			out.println("    resolution: '" + resolution + "',");
			out.println("    audioMixer: " + audioMixer + ",");
			out.println("    audioBandwidth: '" + audioBandwidth + "',");
			out.println("    videoBandwidth: '" + videoBandwidth + "',");
			if (userName != null) out.println("    id: '" + userName + "@" + domain + "',");
			if (accessToken != null) out.println("    password: '" + accessToken + "',");
			out.println("    userAvatar: '" + userAvatar + "',");
			out.println("    enableFirefoxSupport: " + enableFirefoxSupport + ",");
			out.println("    logStats: " + logStats + ",");
			out.println("    conferences: " + conferences + ",");
			if (globalConferenceId != null) out.println("    globalConferenceId: '" + globalConferenceId + "',");
			out.println("    bosh: " + connectionUrl);
			out.println("};	");

			String canvasExtra				= JiveGlobals.getProperty("org.jitsi.videobridge.ofmeet.canvas.extra", "104");
			String canvasRadius				= JiveGlobals.getProperty("org.jitsi.videobridge.ofmeet.canvas.radius", "7");
			String shadowColor				= JiveGlobals.getProperty("org.jitsi.videobridge.ofmeet.shadow.color", "#ffffff");
			String initialToolbarTimeout	= JiveGlobals.getProperty("org.jitsi.videobridge.ofmeet.initial.toolbar.timeout", "20000");
			String toolbarTimeout			= JiveGlobals.getProperty("org.jitsi.videobridge.ofmeet.toolbar.timeout", "4000");
			String defRemoteDisplName		= JiveGlobals.getProperty("org.jitsi.videobridge.ofmeet.default.remote.displayname", "Change Me");
			String defDomSpkrDisplName		= JiveGlobals.getProperty("org.jitsi.videobridge.ofmeet.default.speaker.displayname", "Speaker");
			String defLocalDisplName		= JiveGlobals.getProperty("org.jitsi.videobridge.ofmeet.default.local.displayname", "Me");
			String watermarkLink			= JiveGlobals.getProperty("org.jitsi.videobridge.ofmeet.watermark.link", "");
			String showWatermark			= JiveGlobals.getProperty("org.jitsi.videobridge.ofmeet.show.watermark", "false");
			String brandWatermarkLink		= JiveGlobals.getProperty("org.jitsi.videobridge.ofmeet.brand.watermark.link", "");
			String brandShowWatermark		= JiveGlobals.getProperty("org.jitsi.videobridge.ofmeet.brand.show.watermark", "false");
			String showPoweredBy			= JiveGlobals.getProperty("org.jitsi.videobridge.ofmeet.show.poweredby", "false");
			String randomRoomNames			= JiveGlobals.getProperty("org.jitsi.videobridge.ofmeet.random.roomnames", "true");
			String applicationName			= JiveGlobals.getProperty("org.jitsi.videobridge.ofmeet.application.name", "Openfire Meetings");
			String activeSpkrAvatarSize		= JiveGlobals.getProperty("org.jitsi.videobridge.ofmeet.active.speaker.avatarsize", "100");

			String initationPoweredBy			= JiveGlobals.getProperty("org.jitsi.videobridge.ofmeet.invitation.poweredby", "true");
			String toolbarButtons			= JiveGlobals.getProperty("org.jitsi.videobridge.ofmeet.toolbar.buttons", "'authentication', 'microphone', 'camera', 'desktop','recording', 'security', 'invite', 'chat', 'etherpad', 'sharedvideo','fullscreen', 'sip', 'dialpad', 'settings', 'hangup', 'filmstrip','contacts'");

			out.println("var interfaceConfig = {");
			out.println("    CANVAS_EXTRA: " + canvasExtra + ",");
    		out.println("	 CANVAS_RADIUS: " + canvasRadius + ",");
			out.println("    SHADOW_COLOR: '" + shadowColor + "',");
			out.println("    INITIAL_TOOLBAR_TIMEOUT: " + initialToolbarTimeout + ",");
			out.println("    TOOLBAR_TIMEOUT: " + toolbarTimeout + ",");
			out.println("    DEFAULT_REMOTE_DISPLAY_NAME: '" + defRemoteDisplName + "',");
			out.println("    DEFAULT_DOMINANT_SPEAKER_DISPLAY_NAME: '" + defDomSpkrDisplName + "',");
    		out.println("	 DEFAULT_LOCAL_DISPLAY_NAME: '" + defLocalDisplName + "',");
			out.println("    SHOW_JITSI_WATERMARK: " + showWatermark + ",");
			out.println("    JITSI_WATERMARK_LINK: '" + watermarkLink + "',");
			out.println("    SHOW_BRAND_WATERMARK: " + brandShowWatermark + ",");
			out.println("    BRAND_WATERMARK_LINK: '" + brandWatermarkLink + "',");
			out.println("    SHOW_POWERED_BY: " + showPoweredBy + ",");
			out.println("    GENERATE_ROOMNAMES_ON_WELCOME_PAGE: " + randomRoomNames + ",");
			out.println("    APP_NAME: '" + applicationName + "',");

			out.println("    INVITATION_POWERED_BY: " + initationPoweredBy + ",");
			out.println("    TOOLBAR_BUTTONS: [" + toolbarButtons + "],");
			out.println("    filmStripOnly: false,");
			out.println("    RANDOM_AVATAR_URL_PREFIX: false,");
			out.println("    RANDOM_AVATAR_URL_SUFFIX: false,");
			out.println("    FILM_STRIP_MAX_HEIGHT: 120,");

			out.println("    ACTIVE_SPEAKER_AVATAR_SIZE: " + activeSpkrAvatarSize);
			out.println("}; ");
		}
		catch(Exception e) {
			Log.error("Config doGet Error", e);
		}
	}


    private void writeHeader(HttpServletResponse response)
    {

		try {
			response.setHeader("Expires", "Sat, 6 May 1995 12:00:00 GMT");
			response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
			response.addHeader("Cache-Control", "post-check=0, pre-check=0");
			response.setHeader("Pragma", "no-cache");
			response.setHeader("Content-Type", "application/javascript");
			response.setHeader("Connection", "close");
        }
        catch(Exception e)
        {
			Log.error("Config writeHeader Error", e);
        }
	}

    private boolean isBookmarkForJID(String username, Bookmark bookmark) {

		if (username == null || username.equals("null")) return false;

        if (bookmark.getUsers().contains(username)) {
            return true;
        }

        Collection<String> groups = bookmark.getGroups();

        if (groups != null && !groups.isEmpty()) {
            GroupManager groupManager = GroupManager.getInstance();

            for (String groupName : groups) {
                try {
                    Group group = groupManager.getGroup(groupName);

                    if (group.isUser(username)) {
                        return true;
                    }
                }
                catch (GroupNotFoundException e) {
                    Log.debug(e.getMessage(), e);
                }
            }
        }
        return false;
    }

   private String getHTML(String urlToRead)
   {
      URL url;
      HttpURLConnection conn;
      BufferedReader rd;
      String line;
      StringBuilder result = new StringBuilder();

      try {
         url = new URL(urlToRead);
         conn = (HttpURLConnection) url.openConnection();
         conn.setRequestMethod("GET");
         rd = new BufferedReader(new InputStreamReader(conn.getInputStream()));
         while ((line = rd.readLine()) != null) {
            result.append(line);
         }
         rd.close();
      } catch (IOException e) {
         Log.error("getHTML", e);
      } catch (Exception e) {
         Log.error("getHTML", e);
      }

	  return result.toString();
	}
}
