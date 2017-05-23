OFMeet project
==============

This project produces two Openfire plugins, offocus and ofmeet, that, combined, provide a WebRTC-based video conference solution for Openfire.

The OFMeet project bundles various third-party products, notably:
- the [Jitsi Videobridge](https://github.com/jitsi/jitsi-videobridge) project;
- the [Jitsi Conference Focus (jicofo)](https://github.com/jitsi/jitsi-meet) project; 
- the [Jitsi Meet](https://github.com/jitsi/jitsi-meet) webclient.

Installation
------------
Install the offocus and ofmeet plugins into your Openfire instance.

Build instructions
------------------

This project is a Apache Maven project, but has dependencies that are not published in publicly accessible Maven repositories.

To be able to build this project, the Maven artifacts for Openfire, Jitsi Videobridge, the Jitsi Videobridge Openfire plugin and Jicofo should be installed in your local Maven repository. This project provides a script that will download the source code for these projects, build them, and install them in your local repository.

    # Download, build and install all dependencies
    ./build.sh
    
    # Build the OFMeet artifacts
    mvn clean package
