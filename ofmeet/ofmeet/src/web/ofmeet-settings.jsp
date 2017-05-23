<%--
  ~ Copyright (c) 2017 Ignite Realtime Foundation. All rights reserved.
  ~
  ~ Licensed under the Apache License, Version 2.0 (the "License");
  ~ you may not use this file except in compliance with the License.
  ~ You may obtain a copy of the License at
  ~
  ~      http://www.apache.org/licenses/LICENSE-2.0
  ~
  ~ Unless required by applicable law or agreed to in writing, software
  ~ distributed under the License is distributed on an "AS IS" BASIS,
  ~ WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  ~ See the License for the specific language governing permissions and
  ~ limitations under the License.
  --%>
<%@ page import="org.ice4j.ice.harvest.MappingCandidateHarvesters" %>
<%@ page import="org.jitsi.impl.neomedia.transform.srtp.SRTPCryptoContext" %>
<%@ page import="org.jitsi.videobridge.openfire.PluginImpl" %>
<%@ page import="org.jivesoftware.openfire.XMPPServer" %>
<%@ page import="org.jivesoftware.openfire.plugin.ofmeet.OfMeetPlugin" %>
<%@ page import="java.net.InetAddress" %>
<%@ page import="java.util.Map" %>
<%@ page import="java.util.HashMap" %>
<%@ page import="org.jivesoftware.util.*" %>
<%@ page import="java.net.UnknownHostException" %>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/fmt" prefix="fmt" %>
<%@ taglib uri="admin" prefix="admin" %>
<jsp:useBean id="random" class="java.util.Random"/>
<jsp:useBean id="ofmeetConfig" class="org.igniterealtime.openfire.plugin.ofmeet.config.OFMeetConfig"/>
<%
    boolean update = request.getParameter( "update" ) != null;

    final Cookie csrfCookie = CookieUtils.getCookie( request, "csrf" );
    final String csrfParam = ParamUtils.getParameter( request, "csrf" );

    // Get handle on the plugin
    final OfMeetPlugin container = (OfMeetPlugin) XMPPServer.getInstance().getPluginManager().getPlugin( "ofmeet" );

    final Map<String, String> errors = new HashMap<>();

    if ( update )
    {
        if ( csrfCookie == null || csrfParam == null || !csrfCookie.getValue().equals( csrfParam ) )
        {
            errors.put( "csrf", "CSRF Failure!" );
        }

        final String minPort = request.getParameter( "minport" );
        try {
            final int port = Integer.parseInt( minPort );
            if ( port < 1 && port > 65535 ) {
                errors.put( "minPort", "Port number is out of the valid range (1 >= port => 65535)." );
            }
        } catch (NumberFormatException ex ) {
            errors.put( "minPort", "Cannot parse value as integer value." );
        }

        final String maxPort = request.getParameter( "maxport" );
        try {
            final int port = Integer.parseInt( maxPort );
            if ( port < 1 && port > 65535 ) {
                errors.put( "maxport", "Port number is out of the valid range (1 >= port => 65535)." );
            }
        } catch (NumberFormatException ex ) {
            errors.put( "maxport", "Cannot parse value as integer value." );
        }

        InetAddress localAddress;
        final String localAddressVal = request.getParameter( "localaddress" );
        if ( localAddressVal == null || localAddressVal.isEmpty() )
        {
            localAddress = null;
        }
        else
        {
            try
            {
                localAddress = InetAddress.getByName( localAddressVal );
            }
            catch ( UnknownHostException e )
            {
                errors.put( "localAddress", "Value is not an IP address." );
                localAddress = null;
            }
        }

        InetAddress publicAddress;
        final String publicAddressVal = request.getParameter( "publicaddress" );
        if ( publicAddressVal == null || publicAddressVal.isEmpty() )
        {
            publicAddress = null;
        }
        else
        {
            try
            {
                publicAddress = InetAddress.getByName( publicAddressVal );
            }
            catch ( UnknownHostException e )
            {
                errors.put( "publicAddress", "Value is not an IP address." );
                publicAddress = null;
            }
        }


        final boolean checkreplay = ParamUtils.getBooleanParameter( request, "checkreplay" );
        final boolean securityenabled = ParamUtils.getBooleanParameter( request, "securityenabled" );
        final String authusername = request.getParameter( "authusername" );
        final String sippassword = request.getParameter( "sippassword" );
        final String server = request.getParameter( "server" );
        final String outboundproxy = request.getParameter( "outboundproxy" );
        final String iceServers = request.getParameter( "iceservers" );
        final boolean useIPv6 = ParamUtils.getBooleanParameter( request, "useipv6" );
        final boolean useNicks = ParamUtils.getBooleanParameter( request, "usenicks" );
        final String resolution = request.getParameter( "resolution" );
        try {
            Integer.parseInt( resolution );
        } catch (NumberFormatException ex ) {
            errors.put( "resolution", "Cannot parse value as integer value." );
        }
        final String audiobandwidth = request.getParameter( "audiobandwidth" );
        try {
            Integer.parseInt( audiobandwidth );
        } catch (NumberFormatException ex ) {
            errors.put( "audiobandwidth", "Cannot parse value as integer value." );
        }
        final String videobandwidth = request.getParameter( "videobandwidth" );
        try {
            Integer.parseInt( videobandwidth );
        } catch (NumberFormatException ex ) {
            errors.put( "videobandwidth", "Cannot parse value as integer value." );
        }
        final boolean audiomixer = ParamUtils.getBooleanParameter( request, "audiomixer" );
        final String clientusername = request.getParameter( "clientusername" );
        final String clientpassword = request.getParameter( "clientpassword" );
        final String enableSip = request.getParameter( "enableSip" );
        final boolean allowdirectsip = ParamUtils.getBooleanParameter( request, "allowdirectsip" );
        final String focusjid = request.getParameter( "focusjid" );
        final String focuspassword = request.getParameter( "focuspassword" );
        final String hqVoice = request.getParameter( "hqVoice" );
        final boolean globalIntercom = ParamUtils.getBooleanParameter( request, "globalIntercom" );

        int channelLastN = -1;
        try {
            channelLastN = Integer.parseInt( request.getParameter( "channellastn" ) );
        } catch (NumberFormatException ex ) {
            errors.put( "channellastn", "Cannot parse value as integer value." );
        }

        final boolean adaptivelastn = ParamUtils.getBooleanParameter( request, "adaptivelastn" );
        final boolean simulcast = ParamUtils.getBooleanParameter( request, "simulcast" );
        final boolean adaptivesimulcast = ParamUtils.getBooleanParameter( request, "adaptivesimulcast" );

        if ( errors.isEmpty() )
        {
            JiveGlobals.setProperty( PluginImpl.MIN_PORT_NUMBER_PROPERTY_NAME, minPort );
            JiveGlobals.setProperty( PluginImpl.MAX_PORT_NUMBER_PROPERTY_NAME, maxPort );
            JiveGlobals.setProperty( SRTPCryptoContext.CHECK_REPLAY_PNAME, Boolean.toString( checkreplay ) );
            JiveGlobals.setProperty( "ofmeet.security.enabled", Boolean.toString( securityenabled ) );
            JiveGlobals.setProperty( "voicebridge.default.proxy.sipauthuser", authusername );
            JiveGlobals.setProperty( "voicebridge.default.proxy.sippassword", sippassword );
            JiveGlobals.setProperty( "voicebridge.default.proxy.sipserver", server );
            JiveGlobals.setProperty( "voicebridge.default.proxy.outboundproxy", outboundproxy );
            JiveGlobals.setProperty( "org.jitsi.videobridge.ofmeet.iceservers", iceServers );
            JiveGlobals.setProperty( "org.jitsi.videobridge.ofmeet.useipv6", Boolean.toString( useIPv6 ) );
            JiveGlobals.setProperty( "org.jitsi.videobridge.ofmeet.usenicks", Boolean.toString( useNicks ) );
            JiveGlobals.setProperty( "org.jitsi.videobridge.ofmeet.resolution", resolution );
            JiveGlobals.setProperty( "org.jitsi.videobridge.ofmeet.audio.bandwidth", audiobandwidth );
            JiveGlobals.setProperty( "org.jitsi.videobridge.ofmeet.video.bandwidth", videobandwidth );
            JiveGlobals.setProperty( "org.jitsi.videobridge.ofmeet.audio.mixer", Boolean.toString( audiomixer ) );
            JiveGlobals.setProperty( "org.jitsi.videobridge.ofmeet.sip.username", clientusername );
            JiveGlobals.setProperty( "org.jitsi.videobridge.ofmeet.sip.password", clientpassword );
            JiveGlobals.setProperty( "org.jitsi.videobridge.ofmeet.sip.enabled", enableSip );
            JiveGlobals.setProperty( "org.jitsi.videobridge.ofmeet.allow.direct.sip", Boolean.toString( allowdirectsip ) );
            JiveGlobals.setProperty( "org.jitsi.videobridge.ofmeet.sip.hq.voice", hqVoice );
            JiveGlobals.setProperty( "org.jitsi.videobridge.ofmeet.focus.user.jid", focusjid );
            JiveGlobals.setProperty( "org.jitsi.videobridge.ofmeet.focus.user.password", focuspassword );

            ofmeetConfig.setLocalNATAddress( localAddress );
            ofmeetConfig.setPublicNATAddress( publicAddress );
            ofmeetConfig.setChannelLastN( channelLastN );
            ofmeetConfig.setAdaptiveLastN( adaptivelastn );
            ofmeetConfig.setSimulcast( simulcast );
            ofmeetConfig.setAdaptiveSimulcast( adaptivesimulcast );

            container.configureGlobalIntercom( globalIntercom );

            container.populateJitsiSystemPropertiesWithJivePropertyValues();

            container.restartNeeded = true;

            response.sendRedirect( "ofmeet-settings.jsp?settingsSaved=true" );
            return;
        }
    }

    final String csrf = StringUtils.randomString( 15 );
    CookieUtils.setCookie( request, response, "csrf", csrf, -1 );

    pageContext.setAttribute( "csrf", csrf );
    pageContext.setAttribute( "errors", errors );
    pageContext.setAttribute( "restartNeeded", container.restartNeeded );
    pageContext.setAttribute( "serverInfo", XMPPServer.getInstance().getServerInfo() );
    pageContext.setAttribute( "MIN_PORT_NUMBER_PROPERTY_NAME", PluginImpl.MIN_PORT_NUMBER_PROPERTY_NAME );
    pageContext.setAttribute( "MAX_PORT_NUMBER_PROPERTY_NAME", PluginImpl.MAX_PORT_NUMBER_PROPERTY_NAME );
    pageContext.setAttribute( "NAT_HARVESTER_LOCAL_ADDRESS_PNAME", MappingCandidateHarvesters.NAT_HARVESTER_LOCAL_ADDRESS_PNAME );
    pageContext.setAttribute( "NAT_HARVESTER_PUBLIC_ADDRESS_PNAME", MappingCandidateHarvesters.NAT_HARVESTER_PUBLIC_ADDRESS_PNAME );
    pageContext.setAttribute( "CHECK_REPLAY_PNAME", SRTPCryptoContext.CHECK_REPLAY_PNAME );
%>
<html>
<head>
    <title><fmt:message key="config.page.settings.title"/></title>
    <meta name="pageID" content="ofmeet-settings"/>
</head>
<body>

<c:choose>
    <c:when test="${not empty param.settingsSaved and empty errors}">
        <admin:infoBox type="success"><fmt:message key="config.page.configuration.save.success" /></admin:infoBox>
    </c:when>
    <c:otherwise>
        <c:forEach var="err" items="${errors}">
            <admin:infobox type="error">
                <c:choose>
                    <c:when test="${err.key eq 'csrf'}"><fmt:message key="global.csrf.failed"/></c:when>
                    <c:otherwise>
                        <c:if test="${not empty err.value}">
                            <c:out value="${err.value}"/>
                        </c:if>
                        (<c:out value="${err.key}"/>)
                    </c:otherwise>
                </c:choose>
            </admin:infobox>
        </c:forEach>
    </c:otherwise>
</c:choose>

<c:if test="${restartNeeded}">
    <admin:infoBox type="warning"><fmt:message key="config.page.configuration.restart.warning"/></admin:infoBox>
</c:if>

<p><fmt:message key="config.page.settings.introduction" /></p>

<form action="ofmeet-settings.jsp" method="post">

    <fmt:message key="config.page.configuration.ofmeet.title" var="boxtitleofmeet"/>
    <admin:contentBox title="${boxtitleofmeet}">
        <table cellpadding="3" cellspacing="0" border="0" width="100%">
            <tr>
                <td nowrap colspan="2">
                    <input type="checkbox" name="useipv6" ${admin:getBooleanProperty( "org.jitsi.videobridge.ofmeet.useipv6", false) ? "checked" : ""}>
                    <fmt:message key="config.page.configuration.ofmeet.useipv6.enabled_desc" />
                </td>
            </tr>
            <tr>
                <td nowrap colspan="2">
                    <input type="checkbox" name="usenicks" ${admin:getBooleanProperty( "org.jitsi.videobridge.ofmeet.usenicks", false) ? "checked" : ""}>
                    <fmt:message key="config.page.configuration.ofmeet.usenicks.enabled_desc" />
                </td>
            </tr>

            <tr>
                <td colspan="2" align="left" width="200"><fmt:message key="config.page.configuration.ofmeet.iceservers"/>:</td>
            </tr>
            <tr>
                <td colspan="2">
                    <input type="text" size="100" maxlength="256" name="iceservers"
                           value="${admin:getProperty("org.jitsi.videobridge.ofmeet.iceservers", "")}"
                           placeholder="{ 'iceServers': [{ 'url': 'stun:stun.l.google.com:19302' }] }">
                </td>
            </tr>
            <tr>
                <td align="left" width="200"><fmt:message key="config.page.configuration.ofmeet.resolution"/>:</td>
                <td><input type="text" size="10" maxlength="100" name="resolution" value="${admin:getIntProperty("org.jitsi.videobridge.ofmeet.resolution", 360)}"></td>
            </tr>
            <tr>
                <td align="left" width="200"><fmt:message key="config.page.configuration.ofmeet.audio.bandwidth"/>:</td>
                <td><input type="text" size="10" maxlength="100" name="audiobandwidth" value="${admin:getIntProperty("org.jitsi.videobridge.ofmeet.audio.bandwidth", 64)}"></td>
            </tr>
            <tr>
                <td align="left" width="200"><fmt:message key="config.page.configuration.ofmeet.video.bandwidth"/>:</td>
                <td><input type="text" size="10" maxlength="100" name="videobandwidth" value="${admin:getIntProperty("org.jitsi.videobridge.ofmeet.video.bandwidth", 512)}"></td>
            </tr>
            <tr>
                <td nowrap colspan="2">
                    <input type="checkbox" name="globalIntercom" ${admin:getBooleanProperty( "org.jitsi.videobridge.ofmeet.global.intercom", false) ? "checked" : ""}>
                    <fmt:message key="config.page.configuration.global.intercom"/>
                </td>
            </tr>
        </table>
    </admin:contentBox>

    <fmt:message key="config.page.configuration.media.title" var="boxtitlemedia"/>
    <admin:contentBox title="${boxtitlemedia}">

        <table cellpadding="3" cellspacing="0" border="0" width="100%">
            <tr>
                <td align="left" width="200"><fmt:message key="config.page.configuration.min.port"/>:</td>
                <td><input name="minport" type="text" maxlength="5" size="5" value="${admin:getIntProperty( MIN_PORT_NUMBER_PROPERTY_NAME, 5000)}"/></td>
            </tr>
            <tr>
                <td align="left" width="200"><fmt:message key="config.page.configuration.max.port"/>:</td>
                <td><input name="maxport" type="text" maxlength="5" size="5" value="${admin:getIntProperty( MAX_PORT_NUMBER_PROPERTY_NAME, 6000)}"/></td>
            </tr>
            <tr>
                <td align="left" width="200"><fmt:message key="config.page.configuration.local.ip.address"/>:</td>
                <td><input name="localaddress" type="text" maxlength="20" size="15" value="${ofmeetConfig.localNATAddress.hostAddress}"/></td>
            </tr>
            <tr>
                <td align="left" width="200"><fmt:message key="config.page.configuration.public.ip.address"/>:</td>
                <td><input name="publicaddress" type="text" maxlength="20" size="15" value="${ofmeetConfig.publicNATAddress.hostAddress}"/></td>
            </tr>
            <tr>
                <td nowrap colspan="2">
                    <input type="checkbox" name="checkreplay" ${admin:getBooleanProperty( CHECK_REPLAY_PNAME, false) ? "checked" : ""}>
                    <fmt:message key="config.page.configuration.checkreplay.enabled_description" />
                </td>
            </tr>
            <tr>
                <td nowrap colspan="2">
                    <input type="checkbox" name="audiomixer" ${admin:getBooleanProperty( "org.jitsi.videobridge.ofmeet.audio.mixer", false) ? "checked" : ""}>
                    <fmt:message key="config.page.configuration.audiomixer.enabled_description" />
                </td>
            </tr>
        </table>
    </admin:contentBox>

    <fmt:message key="config.page.configuration.security.title" var="boxtitlesecurity"/>
    <admin:contentBox title="${boxtitlesecurity}">
        <table cellpadding="3" cellspacing="0" border="0" width="100%">
            <tr>
                <td align="left" width="200"><fmt:message key="config.page.configuration.focus.jid"/>:</td>
                <td><input type="text" size="20" maxlength="100" name="focusjid" value="${admin:getProperty("org.jitsi.videobridge.ofmeet.focus.user.jid", "focus@".concat( serverInfo.XMPPDomain ))}"></td>
            </tr>
            <tr>
                <td align="left" width="200"><fmt:message key="config.page.configuration.focus.password"/>:</td>
                <td><input type="password" size="20" maxlength="100" name="focuspassword" value="${admin:getProperty("org.jitsi.videobridge.ofmeet.focus.user.password", "focus-password-".concat( random.nextInt(15) ) )}"></td>
            </tr>
            <tr>
                <td nowrap colspan="2">
                    <input type="checkbox" name="securityenabled" ${admin:getBooleanProperty( "ofmeet.security.enabled", true) ? "checked" : ""}>
                    <fmt:message key="config.page.configuration.security.enabled_description" />
                </td>
            </tr>
        </table>
    </admin:contentBox>

    <fmt:message key="config.page.configuration.lastn.title" var="boxtitlelastn"/>
    <admin:contentBox title="${boxtitlelastn}">
        <p><fmt:message key="config.page.configuration.lastn.description"/></p>
        <table cellpadding="3" cellspacing="0" border="0" width="100%">
            <tr>
                <td align="left" width="200"><fmt:message key="config.page.configuration.channellastn"/>:</td>
                <td><input type="text" size="20" maxlength="20" name="channellastn" value="${ofmeetConfig.channelLastN}"></td>
            </tr>
            <tr>
                <td nowrap colspan="2">
                    <input type="checkbox" name="adaptivelastn" ${ofmeetConfig.adaptiveLastN ? "checked" : ""}>
                    <fmt:message key="config.page.configuration.adaptivelastn" />
                </td>
            </tr>
        </table>
    </admin:contentBox>

    <fmt:message key="config.page.configuration.simulcast.title" var="boxtitlesimulcast"/>
    <admin:contentBox title="${boxtitlesimulcast}">
        <p><fmt:message key="config.page.configuration.simulcast.description"/></p>
        <table cellpadding="3" cellspacing="0" border="0" width="100%">
            <tr>
                <td nowrap colspan="2">
                    <input type="checkbox" name="simulcast" ${ofmeetConfig.simulcast ? "checked" : ""}>
                    <fmt:message key="config.page.configuration.simulcast" />
                </td>
            </tr>
            <tr>
                <td nowrap colspan="2">
                    <input type="checkbox" name="adaptivesimulcast" ${ofmeetConfig.adaptiveSimulcast ? "checked" : ""}>
                    <fmt:message key="config.page.configuration.adaptivesimulcast" />
                </td>
            </tr>
        </table>
    </admin:contentBox>

    <input type="hidden" name="csrf" value="${csrf}">

    <input type="submit" name="update" value="<fmt:message key="global.save_settings" />">
</form>
</body>
</html>