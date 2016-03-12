# Openfire Meetings Plugin
An [Openfire](http://www.igniterealtime.org/projects/openfire/) plugin that provides high quality, scalable video
conferences using Jitsi Meet and Jitsi Videobridge.

![Dele in action!](https://community.igniterealtime.org/servlet/JiveServlet/showImage/38-1730-22276/ofmeet2.png)

## Features
The Ignite Realtime community is pleased to present "Openfire Meetings", a plugin for Openfire. Openfire Meetings is a
complete standalone plugin powered by Jitsi Videobridge, Jitsi Meet, Candy, Fastpath, TogetherJS and other components.
It does not depend on any other plugins, although its functionality can be improved when combined with other plugins.
Please refer to the configuration section below for details.

Openfire Meetings provides a web-based real-time communications application that enables the following features:
* Web-based clients based on Jitsi Meet as well as Candy;
* Openfire user authentication directly from web browser;
* Audio and Video conferencing;
* Telephone (SIP) conferencing;
* Online Meeting/Conference hosting and planning;

With the optional Openfire Meetings Chrome Extension, these additional features are available:
* Screen sharing;
* Co-browsing;
* Application sharing;

When a Remote Desktop Control Native Application is combined with the Openfire Meetings Chrome Extension, the
following features are enabled:
 * Remote desktop control;

Openfire FastPath is a solution built on top of Openfire that adds support for managed queued chat requests. Openfire
Meetings includes support for FastPath. This allows all interaction between a website user an agent to occur in Openfire
Meetings web clients, which will make available all Openfire Meetings functionality to both parties. Using Openfire
Meetings, FastPath sessions are thus enhanced with audio, video, desktop sharing (application and screen), remote
control and all other features of Openfire Meetings!

## History
The Openfire Meetings plugin continues the development of the ofmeet web application which was part of the now
deprecated [Jitsi-videobridge plugin](https://community.igniterealtime.org/community/support/jitsi_videobridge_plugin).

## Venue for discussion and feedback
The place to discuss the Openfire Meetings plugin is in the [community plugins](https://community.igniterealtime.org/community/plugins/commplugins/openfire-meetings/activity)
section of the Ignite Realtime community.

## Installation and Configuration
**PLEASE NOTE** - You will need at least Openfire 4.0.1 to use this plugin.

Openfire Meetings is installed as any regular Openfire plugin: Log into the Openfire Admin Console, and navigate to the
"plugins" tab. There, select the "Available Plugins" menu item, find the "Openfire Meetings" plugin in the list of
available plugins, and press the install button.

Alternatively, download the ```ofmeet.jar``` file and place the file in the Openfire plugins directory. Within
approximately one minute, the plugin will be deployed automatically.

Once deployed, various screens are added to the Openfire Admin Console where the configuration of Openfire Meetings can
be adjusted when needed.

### Optional component: Openfire Meetings Chrome Extension

To enable screen sharing, remote desktop control, co-browsing and application sharing, your users will have to install
the [Openfire Meetings Chrome Extension](https://chrome.google.com/webstore/detail/openfire-meetings-chrome/fohfnhgabmicpkjcpjpjongpijcffaba?hl=en-GB)
in their browser.

![Openfire Meetings Chrome Extension installation screen](https://community.igniterealtime.org/servlet/JiveServlet/showImage/38-1730-22181/ofmeet1.png)

### Optional component: Remote Desktop Control Native Application

When combined with the Openfire Meetings Chrome Extension, the Remote Desktop Control Native Application will enable
remote desktop control functionality.

To install Remote Desktop Control Native Application, first download and extract the native application from
https://github.com/igniterealtime/community-plugins into any suitable folder. Run ```install_host.bat``` (Windows) or
```install_host.sh``` (Linux / OS X) to install and register the native application with the Chrome extension.

Run ```uninstall_host.bat``` or ```uninstall_host.sh``` to unregister the native application when you are done with it.

To grant another user remote control of your desktop, share your desktop, select a participant and click on the remote
control button. Alternatively, any viewer of your screen share can request for remote control access by clicking on the
remote control button while viewing your screen.

### Optional component: Openfire Bookmarks plugin

When combined with the Openfire Bookmarks plugin, Openfire Meetings will allow users to provision PDF presentation URLs
and meeting/conference bookmarks. Users can select presentations and conferences from a pull down list.

![Meeting/Conference provisioning](https://community.igniterealtime.org/servlet/JiveServlet/showImage/38-1730-22275/ofmeet3.png)

![Creating a bookmark for a room](https://community.igniterealtime.org/servlet/JiveServlet/showImage/38-1762-66501/Image6.jpg)

The Openfire Bookmarks plugin is a stand-alone plugin for Openfire, that can be downloaded from the Openfire Admin
Console, or, alternatively, from the [Openfire Plugins web page](http://www.igniterealtime.org/projects/openfire/plugins.jsp).

### Optional component: Openfire Meetings Spark plugin

The Openfire Meetings Spark plugin provides a button from a MUC room or chat window within the Spark client, to open a
Crome window to a Jitsi Meet-based web client. From a MUC room, the web client room is the same room name. From a chat,
an unique, temporariy room will be created.

The Openfire Meetings Spark plugin is obtained from the Openfire Meetings plugin itself. After installation of Openfire
Meetings, the Spark plugin can be downloaded from ```https://your-server.com:7443/ofmeet/spark/ofmeet-plugin.jar```

## How to use

### ... the Openfire Meetings Jitsi Meet-based web client

Openfire Meetings includes a Jitsi Meet-based web client. To make use of this client, point your browser to any of these
addresses:

* ```https://your-server.com:7443/ofmeet``` - To select or create a room;
* ```https://your-server.com:7443/ofmeet/?r=xxxxx``` - To join a specific room;
* ```https://your-server.com:7443/ofmeet/?r=xxxxx&novideo=true``` - To join a specific room, audio only (no video);

To use HTTP instead of HTTPS, replace port 7443 by 7070. Please note that for webRTC audio and video, HTTPS is mandatory.

### ... the Openfire Meetings Candy-based web client

Openfire Meetings includes a Candy-based web client. To make use of this client, point your browser to this address:

* ```https://your-server.com:7443/ofmeet/candy.html```

To use HTTP instead of HTTPS, replace port 7443 by 7070. Please note that for webRTC audio and video, HTTPS is mandatory.

Candy can also be accessed as a toolbar panel from the Openfire Meetings Chrome Extension, by clicking on the Openfire icon on the chrome web browser toolbar.
You must enable Chrome panels otherwise a popup window will be opened instead.
To enable chrome panels feature in Chrome, type in "chrome://flags/#enable-panels" in the url bar - click on "enable" under "enable panels" - Make sure to click on "relaunch now " at the bottom of the page , to take effect .

### ... the Meeting/Conference planner and hosting feature

The Meeting/Conference planner feature enables you to schedule meetings/conferences in advance using a calendar.
![Meeting/Conference planning](https://community.igniterealtime.org/servlet/JiveServlet/showImage/38-1762-66498/Image2.jpg)

When you add a meeting to the calendar, a request to join the meeting is automatically generated and sent to each
participant using Openfire's email service 15 mins before the meeting starts. Included in the email is a link to join
the meeting from a Chrome web browser.
![Email invitation](https://community.igniterealtime.org/servlet/JiveServlet/showImage/38-1762-66502/Image5.jpg)

In order to use this feature, you will need:
* Registered Openfire users with valid email address;
* A persistent MUC room to host each planned meeting;
* The Openfire bookmarks plugin installed to create a room bookmark that links the room to users or user groups
  (Bookmarks with all users selected are ignored);
* The Openfire Email Service configured to deliver emails;
The calendar is implemented using the excellent open source [FullCalendar](http://fullcalendar.io/) jQuery plugin by
Adam Shaw.

### ... Openfire Meetings-enhanced FastPath
The Candy-based web client that ships with Openfire Meetings supports FastPath. When a FastPath Agent logs in and uses
the client, FastPath functionality will be exposed, similar to the functionality provided by the Spark client that
agents would use in a scenario where Openfire Meetings is not used.

Openfire Meetings ships with a FastPath javascript library that is intended to be integrated within the website that
is offering FastPath services to end-users. Similar to the FastPath webchat solution, this library allows users to
enter a managed queue.

After installation of Openfire Meetings, the FastPath javascript library can be accessed on ```https://your-server.com:7443/ofmeet/fastpath/```.

