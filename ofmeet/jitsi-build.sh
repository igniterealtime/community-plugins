#!/bin/sh
set -e
rm -rf ~/github/community-plugins/ofmeet/src/jitsi-meet
cp -R ~/github/jitsi-meet ~/github/community-plugins/ofmeet/src/
rm -rf ~/github/community-plugins/ofmeet/src/jitsi-meet/android
rm -rf ~/github/community-plugins/ofmeet/src/jitsi-meet/modules
rm -rf ~/github/community-plugins/ofmeet/src/jitsi-meet/node_modules
rm -rf ~/github/community-plugins/ofmeet/src/jitsi-meet/.git
sh ~/github/community-plugins/ofmeet/build.sh
cp ~/github/community-plugins/openfire_4_1_4/target/openfire/plugins/*.jar ~/github/Openfire/target/openfire/plugins/

