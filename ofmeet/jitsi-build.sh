#!/bin/sh
set -e
if [ ! -f ~/github/jitsi-meet/jitsi-meet.tar.bz2 ]; then
  echo "Cannot find jitsi-meet distributable! Did you run `make source-package` ?";
  exit 1;
fi

rm -rf ~/github/community-plugins/ofmeet/publicweb/src/main/webapp/jitsi-meet
#tar jxf ~/github/jitsi-meet/jitsi-meet.tar.bz2 --directory ~/github/community-plugins/ofmeet/publicweb/src/main/webapp
curl https://download.jitsi.org/jitsi-meet/src/jitsi-meet-1.0.1959.tar.bz2 | tar jx --directory ~/github/community-plugins/ofmeet/publicweb/src/main/webapp

#cp -R ~/github/jitsi-meet ~/github/community-plugins/ofmeet/publicweb/src/main/webapp/jitsi-meet
#rm -rf ~/github/community-plugins/ofmeet/publicweb/src/main/webapp/jitsi-meet/android
#rm -rf ~/github/community-plugins/ofmeet/publicweb/src/main/webapp/jitsi-meet/modules
#rm -rf ~/github/community-plugins/ofmeet/publicweb/src/main/webapp/jitsi-meet/node_modules
#rm -rf ~/github/community-plugins/ofmeet/publicweb/src/main/webapp/jitsi-meet/.git
#rm -rf ~/github/community-plugins/ofmeet/publicweb/src/main/webapp/jitsi-meet/.vagrant
#rm -rf ~/github/community-plugins/ofmeet/publicweb/src/main/webapp/jitsi-meet/Vagrantfile
git checkout -- ~/github/community-plugins/ofmeet/publicweb/src/main/webapp/jitsi-meet/index.html
mvn clean package
#sh ~/github/community-plugins/ofmeet/build.sh
#cp ~/github/community-plugins/openfire_4_1_4/target/openfire/plugins/*.jar ~/github/Openfire/target/openfire/plugins/

