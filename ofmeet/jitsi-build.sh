#!/bin/sh
set -e
rm -rf ~/github/community-plugins/ofmeet/publicweb/src/main/webapp/jitsi-meet
cp -R ~/github/jitsi-meet ~/github/community-plugins/ofmeet/publicweb/src/main/webapp/jitsi-meet
rm -rf ~/github/community-plugins/ofmeet/publicweb/src/main/webapp/jitsi-meet/android
rm -rf ~/github/community-plugins/ofmeet/publicweb/src/main/webapp/jitsi-meet/modules
rm -rf ~/github/community-plugins/ofmeet/publicweb/src/main/webapp/jitsi-meet/node_modules
rm -rf ~/github/community-plugins/ofmeet/publicweb/src/main/webapp/jitsi-meet/.git
rm -rf ~/github/community-plugins/ofmeet/publicweb/src/main/webapp/jitsi-meet/.vagrant
rm -rf ~/github/community-plugins/ofmeet/publicweb/src/main/webapp/jitsi-meet/Vagrantfile
git checkout -- ~/github/community-plugins/ofmeet/publicweb/src/main/webapp/jitsi-meet/index.html
mvn clean package
#sh ~/github/community-plugins/ofmeet/build.sh
#cp ~/github/community-plugins/openfire_4_1_4/target/openfire/plugins/*.jar ~/github/Openfire/target/openfire/plugins/

