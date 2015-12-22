# Openfire Meetings Plugin Readme
Provides high quality, scalable video conferences using Jitsi Meet and Jitsi Videobridge

## Overview
Ignite Realtime is pleased to announce "Openfire Meetings", a new plugin for Openfire that continues the development of the ofmeet web application which was part of the now deprecated [Jitsi-videobridge plugin](https://community.igniterealtime.org/community/support/jitsi_videobridge_plugin).

**PLEASE NOTE** - You will need at least Openfire 3.10.0 to use this plugin. You will also need the [Openfire Meetings Chrome extension](https://chrome.google.com/webstore/detail/openfire-meetings-chrome/fohfnhgabmicpkjcpjpjongpijcffaba?hl=en-GB) for screen sharing, co-browsing and application sharing.

[![ofmeet1.png](https://community.igniterealtime.org/servlet/JiveServlet/downloadImage/38-1730-22181/432-272/ofmeet1.png)](https://community.igniterealtime.org/servlet/JiveServlet/showImage/38-1730-22181/ofmeet1.png)

Openfire Meetings is a complete standalone plugin powered by Jitsi Videobridge. It does not depend on any other plugins. It can be enhanced by adding the optional client control and fastpath plugins. The client control plugin will enable the management and user provisioning of PDF presentation urls and conference bookmarks. Users can select presentations and conferences from a pull down list.

[![ofmeet3.png](https://community.igniterealtime.org/servlet/JiveServlet/downloadImage/38-1730-22275/428-160/ofmeet3.png)](https://community.igniterealtime.org/servlet/JiveServlet/showImage/38-1730-22275/ofmeet3.png)

The front-end web application is a combination of Candy and Jitsi Meet and enables the following features

*   Openfire user authentication directly from web browser for both Candy and Jitsi Meet
*   Audio, Video and Telephone (SIP) conferencing directly with Jitsi Meet and from Candy
*   Desktop sharing (screen and applications) using the Openfire Meetings Chrome extension
*   Fastpath user agent with audio and video using the Candy and Jitsi Meet web applications. It also requires Fastpath plugin to be installed.
*   Configuration directly from Openfire admin web pages.

[![ofmeet2.png](https://community.igniterealtime.org/servlet/JiveServlet/downloadImage/38-1730-22276/397-224/ofmeet2.png)](https://community.igniterealtime.org/servlet/JiveServlet/showImage/38-1730-22276/ofmeet2.png)

##How to use

<span>Jitsi Meet -</span> select room - https://your-server.com:7443/ofmeet
specify room - https://your-server.com:7443/ofmeet/?r=xxxxx
audio only (no video) - https://your-server.com:7443/ofmeet/?r=xxxxx&novideo=true

<span>Spark Plugin -</span> download https://your-server.com:7443/ofmeet/spark/ofmeet-plugin.jar

Candy - https://your-server.com:7443/ofmeet/candy.html

JavaScript example - https://your-server.com:7443/ofmeet/api

Replace port 7443 by 7070 for http instead of https

[![ofmeet5.png](https://community.igniterealtime.org/servlet/JiveServlet/downloadImage/38-1730-22278/ofmeet5.png)](https://community.igniterealtime.org/servlet/JiveServlet/showImage/38-1730-22278/ofmeet5.png)


It also has a meeting planner feature that enables you to schedule meetings in advance using a calendar. When you add a meeting to the calendar, a request to join the meeting is automatically generated and sent to each participant using Openfire's email service 15 mins before the meeting starts. Included in the email is a link to join the meeting from a Chrome web browser.

[![Image2.jpg](https://community.igniterealtime.org/servlet/JiveServlet/downloadImage/38-1762-66498/379-215/Image2.jpg)](https://community.igniterealtime.org/servlet/JiveServlet/showImage/38-1762-66498/Image2.jpg)[![Image5.jpg](https://community.igniterealtime.org/servlet/JiveServlet/downloadImage/38-1762-66502/212-175/Image5.jpg)](https://community.igniterealtime.org/servlet/JiveServlet/showImage/38-1762-66502/Image5.jpg)

In order to use this feature, you will need:

*   Registered Openfire users with valid email address,
*   A persistent MUC room to host each planned meeting
*   The Openfire ClientControl plugin installed to create a room bookmark that links the room to users or user groups. Bookmarks with all users selected are ignored.
    [![Image6.jpg](https://community.igniterealtime.org/servlet/JiveServlet/downloadImage/38-1762-66501/375-210/Image6.jpg)](https://community.igniterealtime.org/servlet/JiveServlet/showImage/38-1762-66501/Image6.jpg)
*   The Openfire Email Service configured to deliver emails
    [![Image4.jpg](https://community.igniterealtime.org/servlet/JiveServlet/downloadImage/38-1762-66500/Image4.jpg)](https://community.igniterealtime.org/servlet/JiveServlet/showImage/38-1762-66500/Image4.jpg)

The calendar is implemented using the excellent open source [FullCalendar](http://fullcalendar.io/) jQuery plugin by Adam Shaw.


Discussion place is in the [community plugins, here](https://community.igniterealtime.org/community/plugins/commplugins/openfire-meetings/activity)