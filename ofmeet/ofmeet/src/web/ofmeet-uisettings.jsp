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
<%@ page import="org.jivesoftware.openfire.plugin.ofmeet.*" %>
<%@ page import="org.jivesoftware.openfire.*" %>
<%@ page import="org.jivesoftware.util.*" %>
<%@ page import="java.net.URL" %>
<%@ page import="java.net.MalformedURLException" %>
<%@ page import="java.util.*" %>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/fmt" prefix="fmt" %>
<%@ taglib uri="admin" prefix="admin" %>
<jsp:useBean id="ofmeetConfig" class="org.igniterealtime.openfire.plugin.ofmeet.config.OFMeetConfig"/>
<%
    boolean update = request.getParameter("update") != null;

	final Cookie csrfCookie = CookieUtils.getCookie( request, "csrf" );
	final String csrfParam = ParamUtils.getParameter( request, "csrf" );

	// Get handle on the plugin
	final OfMeetPlugin container = (OfMeetPlugin) XMPPServer.getInstance().getPluginManager().getPlugin("ofmeet");

	final Map<String, String> errors = new HashMap<>();

    if ( update )
	{
		if ( csrfCookie == null || csrfParam == null || !csrfCookie.getValue().equals( csrfParam ) )
		{
			errors.put( "csrf", "CSRF Failure!" );
		}

        final String applicationName = request.getParameter( "applicationName" );
        final String activeSpkrAvatarSize = request.getParameter( "activeSpkrAvatarSize" );
        try {
            Integer.parseInt( activeSpkrAvatarSize );
        } catch (NumberFormatException ex ) {
            errors.put( "activeSpkrAvatarSize", "Cannot parse value as integer value." );
        }

        final String canvasExtra = request.getParameter( "canvasExtra" );
        try {
            Integer.parseInt( canvasExtra );
        } catch (NumberFormatException ex ) {
            errors.put( "canvasExtra", "Cannot parse value as integer value." );
        }

        final String canvasRadius = request.getParameter( "canvasRadius" );
        try {
            Integer.parseInt( canvasRadius );
        } catch (NumberFormatException ex ) {
            errors.put( "canvasRadius", "Cannot parse value as integer value." );
        }
        final String shadowColor = request.getParameter( "shadowColor" );
        final String initialToolbarTimeout = request.getParameter( "initialToolbarTimeout" );
        try {
            Long.parseLong( initialToolbarTimeout );
        } catch (NumberFormatException ex ) {
            errors.put( "initialToolbarTimeout", "Cannot parse value as long value." );
        }

        final String toolbarTimeout = request.getParameter( "toolbarTimeout" );
        try {
            Long.parseLong( toolbarTimeout );
        } catch (NumberFormatException ex ) {
            errors.put( "toolbarTimeout", "Cannot parse value as long value." );
        }
        final String defRemoteDisplName = request.getParameter( "defRemoteDisplName" );
        final String defDomSpkrDisplName = request.getParameter( "defDomSpkrDisplName" );
        final String defLocalDisplName = request.getParameter( "defLocalDisplName" );

        final boolean showPoweredBy = ParamUtils.getBooleanParameter( request, "showPoweredBy" );
        final boolean randomRoomNames = ParamUtils.getBooleanParameter( request, "randomRoomNames" );

        final boolean showWatermark = ParamUtils.getBooleanParameter( request, "showWatermark" );
        final String watermarkLogoUrlValue = request.getParameter( "watermarkLogoUrl" );
        URL watermarkLogoUrl = null;
        if ( watermarkLogoUrlValue != null && !watermarkLogoUrlValue.isEmpty() )
        {
            try {
                watermarkLogoUrl = new URL( watermarkLogoUrlValue );
            } catch ( MalformedURLException e ) {
                errors.put( "watermarkLogoUrl", "Cannot parse value as a URL." );
            }
        }
        final String watermarkLink = request.getParameter( "watermarkLink" );

        final boolean brandShowWatermark = ParamUtils.getBooleanParameter( request, "brandShowWatermark" );
        URL brandWatermarkLogoUrl = null;
        final String brandWatermarkLogoUrlValue = request.getParameter( "brandWatermarkLogoUrl" );
        if ( brandWatermarkLogoUrlValue != null && !brandWatermarkLogoUrlValue.isEmpty() )
        {
            try {
                brandWatermarkLogoUrl = new URL( brandWatermarkLogoUrlValue );
            } catch ( MalformedURLException e ) {
                errors.put( "brandWatermarkLogoUrl", "Cannot parse value as a URL." );
            }
        }
        final String brandWatermarkLink = request.getParameter( "brandWatermarkLink" );

        // Buttons
        final String[] buttonsEnabled = new String[99];
        final String[] buttonsOnTop = new String[99];
        for ( final String buttonName : ofmeetConfig.getButtonsImplemented() )
        {
            final boolean buttonEnabled = ParamUtils.getBooleanParameter( request, "button-enabled-" + buttonName );
            if ( buttonEnabled )
            {
                final int position = ParamUtils.getIntParameter( request, "button-order-" + buttonName, -1 );
                if ( position < 0 )
                {
                    errors.put( "buttons", "Missing position for button: " + buttonName );
                }
                else
                {
                    final boolean onTop = "top".equals( ParamUtils.getParameter( request, "button-position-" + buttonName ) );
                    buttonsEnabled[ position ] = buttonName;
                    if ( onTop )
                    {
                        buttonsOnTop[ position ] = buttonName;
                    }
                }
            }
        }

        if ( errors.isEmpty() )
		{
            JiveGlobals.setProperty( "org.jitsi.videobridge.ofmeet.application.name", applicationName );
            JiveGlobals.setProperty( "org.jitsi.videobridge.ofmeet.active.speaker.avatarsize", activeSpkrAvatarSize );
            JiveGlobals.setProperty( "org.jitsi.videobridge.ofmeet.canvas.extra", canvasExtra );
            JiveGlobals.setProperty( "org.jitsi.videobridge.ofmeet.canvas.radius", canvasRadius );
            JiveGlobals.setProperty( "org.jitsi.videobridge.ofmeet.shadow.color", shadowColor );
            JiveGlobals.setProperty( "org.jitsi.videobridge.ofmeet.initial.toolbar.timeout", initialToolbarTimeout );
            JiveGlobals.setProperty( "org.jitsi.videobridge.ofmeet.toolbar.timeout", toolbarTimeout );
            JiveGlobals.setProperty( "org.jitsi.videobridge.ofmeet.default.remote.displayname", defRemoteDisplName );
            JiveGlobals.setProperty( "org.jitsi.videobridge.ofmeet.default.speaker.displayname", defDomSpkrDisplName );
            JiveGlobals.setProperty( "org.jitsi.videobridge.ofmeet.default.local.displayname", defLocalDisplName );
            JiveGlobals.setProperty( "org.jitsi.videobridge.ofmeet.show.poweredby", Boolean.toString( showPoweredBy ) );
            JiveGlobals.setProperty( "org.jitsi.videobridge.ofmeet.random.roomnames", Boolean.toString( randomRoomNames ) );
            JiveGlobals.setProperty( "org.jitsi.videobridge.ofmeet.watermark.link", watermarkLink );
            JiveGlobals.setProperty( "org.jitsi.videobridge.ofmeet.show.watermark", Boolean.toString( showWatermark ) );
            JiveGlobals.setProperty( "org.jitsi.videobridge.ofmeet.brand.watermark.link", brandWatermarkLink );
            JiveGlobals.setProperty( "org.jitsi.videobridge.ofmeet.brand.show.watermark", Boolean.toString( brandShowWatermark ) );

            ofmeetConfig.setWatermarkLogoUrl( watermarkLogoUrl );
            ofmeetConfig.setBrandWatermarkLogoUrl( brandWatermarkLogoUrl );

            ofmeetConfig.setButtonsEnabled( Arrays.asList( buttonsEnabled ) );
            ofmeetConfig.setButtonsOnTop( Arrays.asList( buttonsOnTop ) );

			container.populateJitsiSystemPropertiesWithJivePropertyValues();

            response.sendRedirect( "ofmeet-uisettings.jsp?settingsSaved=true" );
            return;
		}
	}

    final String csrf = StringUtils.randomString( 15 );
	CookieUtils.setCookie( request, response, "csrf", csrf, -1 );

	pageContext.setAttribute( "csrf", csrf );
	pageContext.setAttribute( "errors", errors );
%>
<html>
<head>
	<title><fmt:message key="config.page.uisettings.title" /></title>
	<meta name="pageID" content="ofmeet-uisettings"/>
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

<p><fmt:message key="config.page.uisettings.introduction" /></p>

<form action="ofmeet-uisettings.jsp" method="post">

	<fmt:message key="config.page.configuration.ui.title" var="boxtitle"/>
	<admin:contentBox title="${boxtitle}">
        <table cellpadding="3" cellspacing="0" border="0" width="100%">
            <tr>
                <td width="200"><fmt:message key="ofmeet.application.name"/>:</td>
                <td><input type="text" size="60" maxlength="100" name="applicationName" value="${admin:getProperty("org.jitsi.videobridge.ofmeet.application.name", "Openfire Meetings")}"></td>
            </tr>
            <tr>
                <td width="200"><fmt:message key="ofmeet.active.speaker.avatarsize"/>:</td>
                <td><input type="text" size="60" maxlength="100" name="activeSpkrAvatarSize" value="${admin:getIntProperty("org.jitsi.videobridge.ofmeet.active.speaker.avatarsize", 100)}"></td>
            </tr>
            <tr>
                <td width="200"><fmt:message key="ofmeet.canvas.extra"/>:</td>
                <td><input type="text" size="60" maxlength="100" name="canvasExtra" value="${admin:getIntProperty("org.jitsi.videobridge.ofmeet.canvas.extra", 104)}"></td>
            </tr>
            <tr>
                <td width="200"><fmt:message key="ofmeet.canvas.radius"/>:</td>
                <td><input type="text" size="60" maxlength="100" name="canvasRadius" value="${admin:getIntProperty("org.jitsi.videobridge.ofmeet.canvas.radius", 7)}"></td>
            </tr>
            <tr>
                <td width="200"><fmt:message key="ofmeet.shadow.color"/>:</td>
                <td><input type="text" size="60" maxlength="100" name="shadowColor" value="${admin:getProperty("org.jitsi.videobridge.ofmeet.shadow.color", "#ffffff")}"></td>
            </tr>
            <tr>
                <td width="200"><fmt:message key="ofmeet.default.remote.displayname"/>:</td>
                <td><input type="text" size="60" maxlength="100" name="defRemoteDisplName" value="${admin:getProperty("org.jitsi.videobridge.ofmeet.default.remote.displayname", "Change Me")}"></td>
            </tr>
            <tr>
                <td width="200"><fmt:message key="ofmeet.default.speaker.displayname"/>:</td>
                <td><input type="text" size="60" maxlength="100" name="defDomSpkrDisplName" value="${admin:getProperty("org.jitsi.videobridge.ofmeet.default.speaker.displayname", "Speaker")}"></td>
            </tr>
            <tr>
                <td width="200"><fmt:message key="ofmeet.default.local.displayname"/>:</td>
                <td><input type="text" size="60" maxlength="100" name="defLocalDisplName" value="${admin:getProperty("org.jitsi.videobridge.ofmeet.default.local.displayname", "Me")}"></td>
            </tr>
            <tr>
                <td nowrap colspan="2">
                    <input type="checkbox" name="showPoweredBy" ${admin:getBooleanProperty( "org.jitsi.videobridge.ofmeet.show.poweredby", false) ? "checked" : ""}>
                    <fmt:message key="ofmeet.show.poweredby.enabled" />
                </td>
            </tr>
            <tr>
                <td nowrap colspan="2">
                    <input type="checkbox" name="randomRoomNames" ${admin:getBooleanProperty( "org.jitsi.videobridge.ofmeet.random.roomnames", true) ? "checked" : ""}>
                    <fmt:message key="ofmeet.random.roomnames.enabled" />
                </td>
            </tr>
		</table>
	</admin:contentBox>

    <fmt:message key="ofmeet.toolbar.title" var="boxtitleToolbar"/>
    <admin:contentBox title="${boxtitleToolbar}">
        <p><fmt:message key="ofmeet.toolbar.timeout.description"/></p>
        <table cellpadding="3" cellspacing="0" border="0" width="100%">
            <tr>
                <td width="200"><fmt:message key="ofmeet.initial.toolbar.timeout"/>:</td>
                <td><input type="text" size="10" maxlength="20" name="initialToolbarTimeout" value="${admin:getLongProperty("org.jitsi.videobridge.ofmeet.initial.toolbar.timeout", 20000)}"></td>
            </tr>
            <tr>
                <td width="200"><fmt:message key="ofmeet.toolbar.timeout"/>:</td>
                <td><input type="text" size="10" maxlength="20" name="toolbarTimeout" value="${admin:getLongProperty("org.jitsi.videobridge.ofmeet.toolbar.timeout", 4000)}"></td>
            </tr>
        </table>
        <br/>
        <p><fmt:message key="ofmeet.toolbar.buttons.description"/></p>
        <div class="jive-table">
            <table cellpadding="3" cellspacing="0" border="0" width="100%">
                <tr>
                    <th>&nbsp;</th>
                    <th><fmt:message key="ofmeet.toolbar.button_name"/></th>
                    <th><fmt:message key="ofmeet.toolbar.button_description"/></th>
                    <th style="text-align: center" width="80"><fmt:message key="ofmeet.toolbar.enabled"/></th>
                    <th style="text-align: center" width="80"><fmt:message key="ofmeet.toolbar.left_toolbar"/></th>
                    <th style="text-align: center" width="80"><fmt:message key="ofmeet.toolbar.top_toolbar"/></th>
                </tr>
                <c:forEach items="${ofmeetConfig.buttonsImplemented}" var="buttonName" varStatus="status">
                    <tr class="${ ( (status.index + 1) % 2 ) eq 0 ? 'jive-even' : 'jive-odd'}">
                        <td width="1%">${status.count}</td>
                        <td><c:out value="${buttonName}"/></td>
                        <td><fmt:message key="ofmeet.toolbar.button.${buttonName}.description"/></td>
                        <td align="center"><input type="checkbox" name="button-enabled-${buttonName}" ${ofmeetConfig.buttonsEnabled.contains( buttonName ) ? 'checked': ''}></td>
                        <td align="center"><input type="radio" name="button-position-${buttonName}" value="left"${ofmeetConfig.buttonsOnTop.contains( buttonName ) ? '': 'checked'}/></td>
                        <td align="center"><input type="radio" name="button-position-${buttonName}" value="top" ${ofmeetConfig.buttonsOnTop.contains( buttonName ) ? 'checked': ''}/>
                                           <input type="hidden" name="button-order-${buttonName}" value="${status.count}"/>
                        </td>
                    </tr>
                </c:forEach>
            </table>
        </div>
    </admin:contentBox>

    <fmt:message key="ofmeet.watermark.title" var="boxtitleWatermarks"/>
    <admin:contentBox title="${boxtitleWatermarks}">
        <p><fmt:message key="ofmeet.watermark.description"/></p>
        <table cellpadding="3" cellspacing="0" border="0" width="100%">
            <tr>
                <td colspan="3" nowrap>
                    <input type="checkbox" name="showWatermark" ${admin:getBooleanProperty( "org.jitsi.videobridge.ofmeet.show.watermark", false) ? "checked" : ""}>
                    <fmt:message key="ofmeet.show.watermark.enabled" />
                </td>
            </tr>
            <tr>
                <td width="15"></td>
                <td>
                    <fmt:message key="ofmeet.watermark.logo.url"/>:
                </td>
                <td>
                    <input type="text" size="60" maxlength="100" name="watermarkLogoUrl" placeholder="https:/meet.jit.si/images/watermark.png" value="${ofmeetConfig.watermarkLogoUrl}">
                </td>
            </tr>
            <tr>
                <td width="15"></td>
                <td width="200">
                    <fmt:message key="ofmeet.watermark.link"/>:
                </td>
                <td>
                    <input type="text" size="60" maxlength="100" name="watermarkLink" placeholder="http://example.org" value="${admin:getProperty("org.jitsi.videobridge.ofmeet.watermark.link", "")}">
                </td>
            </tr>
            <tr><td colspan="3">&nbsp;</td></tr>
            <tr>
                <td colspan="3" nowrap>
                    <input type="checkbox" name="brandShowWatermark" ${admin:getBooleanProperty( "org.jitsi.videobridge.ofmeet.brand.show.watermark", false) ? "checked" : ""}>
                    <fmt:message key="ofmeet.brand.show.watermark.enabled" />
                </td>
            </tr>
            <tr>
                <td width="15"></td>
                <td width="200">
                    <fmt:message key="ofmeet.watermark.logo.url"/>:
                </td>
                <td>
                    <input type="text" size="60" maxlength="100" name="brandWatermarkLogoUrl" value="${ofmeetConfig.brandWatermarkLogoUrl}">
                </td>
            </tr>
            <tr>
                <td width="15"></td>
                <td>
                    <fmt:message key="ofmeet.watermark.link"/>:
                </td>
                <td>
                    <input type="text" size="60" maxlength="100" name="brandWatermarkLink" value="${admin:getProperty("org.jitsi.videobridge.ofmeet.brand.watermark.link", "")}">
                </td>
            </tr>
        </table>
    </admin:contentBox>


    <input type="hidden" name="csrf" value="${csrf}">

    <input type="submit" name="update" value="<fmt:message key="global.save_settings" />">

</form>
</body>
</html>