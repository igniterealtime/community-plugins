#!/bin/bash
# This script collects and puts in place various dependencies of the OFMeet project.

JITSI_MEET_GIT_REFERENCE=1959
JICOFO_GIT_REFERENCE=jitsi-meet_$JITSI_MEET_GIT_REFERENCE
VIDEOBRIDGE_GIT_REFERENCE=jitsi-meet_$JITSI_MEET_GIT_REFERENCE
OPENFIRE_GIT_REFERENCE=master

WORK_DIR=./work
CLONE_DIR=./repositories

JITSI_MEET_DOWNLOAD_DIR=$CLONE_DIR/jitsi-meet-$JITSI_MEET_GIT_REFERENCE
JICOFO_GIT_CLONE_DIR=$CLONE_DIR/jitsi-jicofo-$JICOFO_GIT_REFERENCE
VIDEOBRIDGE_GIT_CLONE_DIR=$CLONE_DIR/jitsi-videobridge-$VIDEOBRIDGE_GIT_REFERENCE
OPENFIRE_GIT_CLONE_DIR=$CLONE_DIR/igniterealtime-openfire-$OPENFIRE_GIT_REFERENCE

# For a truly clean reproduction, delete artifacts from the local maven repository before executing this script.
# $ rm -rf ~/.m2/repository/org/igniterealtime/
# $ rm -rf ~/.m2/repository/org/jitsi/

# Removes the working directory.
#
function cleanWork {
    rm -rf $WORK_DIR
    mkdir -p $WORK_DIR
}

# Removes all local GIT clones
#
function cleanRepositories {
    rm -rf $CLONE_DIR
}

# Makes sure that the most-up-to-date upstream state of a GIT repository is stored locally.
#
# Arguments:
# - first:  A human readable name (such as 'Jitsi Videobridge')
# - second: The repository URL (from where to fetch data).
# - third:  The repository reference (defines what data to retrieve. Typically a tag name)
# - fourth: The local directory in which to repository data is stored.
function retrieveFromUpstreamGit
{
    # Input validation
    if [ -z "$4" ]
    then
        echo "function 'retrieveFromUpstreamGit' must have four arguments: <name> <repoURL> <revision> <localDir>"
        return 1
    fi

    echo "Making sure local clone of $1 GIT repository exists. Looking in: $4"

    # Check out sources.
    if [ "$(ls -A $4)" ]
    then
        echo "Directory '$4' exists and is not empty. Assuming it contains an up-to-date shallow clone."
    else
        echo "Directory '$4' does not exists or is empty. Attempting git clone."
        mkdir -p "$4"
        git clone --depth 1 "$2" "$4"
    fi

    echo "";
}

# Makes sure that a resource is stored locally.
#
# Arguments:
# - first:  A human readable name (such as 'Jitsi Meet')
# - second: The repository URL (from where to fetch data).
# - third: The local directory in which to repository data is stored.
function download
{
    # Input validation
    if [ -z "$3" ]
    then
        echo "function 'download' must have three arguments: <name> <URL> <localDir>"
        return 1
    fi

    echo "Downloading $1 into $3."
    mkdir -p "$3"
    cd "$3" && { curl -O $2 ; cd -; }
    echo ""
}

# Builds and installs a Maven project.
#
# Arguments:
# - first:  A human readable name (such as 'Jitsi Jicofo')
# - third: The local directory in which to project sources are stored.
function buildAndInstallMavenProject
{
    # Input validation
    if [ -z "$2" ]
    then
        echo "function 'buildAndInstallMavenProject' must have two arguments: <name> <localDir>"
        return 1
    fi

    local POM_FILE="$2/pom.xml"
    if [ ! -f "$POM_FILE" ]
    then
        echo "This Maven POM file is expected to exist (but does not): $POM_FILE"
        return 2
    fi

    echo "Building/installing Maven project $1..."
    mvn -f "$POM_FILE" --batch-mode -Dmaven.test.skip=true clean install

    echo "";
}

echo "Collecting upstream data..."
retrieveFromUpstreamGit "Jitsi Jicofo" "https://github.com/jitsi/jicofo.git" "$JICOFO_GIT_REFERENCE" "$JICOFO_GIT_CLONE_DIR"
retrieveFromUpstreamGit "Jitsi Videobridge" "https://github.com/jitsi/jitsi-videobridge.git" "$VIDEOBRIDGE_GIT_REFERENCE" "$VIDEOBRIDGE_GIT_CLONE_DIR"
retrieveFromUpstreamGit "Ignite Realtime Openfire" "https://github.com/igniterealtime/Openfire.git" "$OPENFIRE_GIT_REFERENCE" "$OPENFIRE_GIT_CLONE_DIR"
download "Jitsi Meet" "https://download.jitsi.org/jitsi-meet/src/jitsi-meet-1.0.$JITSI_MEET_GIT_REFERENCE.tar.bz2" "$JITSI_MEET_DOWNLOAD_DIR"
echo "Done collecting upstream data."
echo ""

echo "Building upstream projects..."
buildAndInstallMavenProject "Ignite Realtime Openfire" "$OPENFIRE_GIT_CLONE_DIR"
buildAndInstallMavenProject "Jitsi Jicofo" "$JICOFO_GIT_CLONE_DIR"
buildAndInstallMavenProject "Jitsi Videobridge" "$VIDEOBRIDGE_GIT_CLONE_DIR"
buildAndInstallMavenProject "Jitsi Videobridge Openfire plugin" "$VIDEOBRIDGE_GIT_CLONE_DIR/openfire"
echo "Done building upstream projects."

echo "Put in place the Jitsi Meet source code"
rm -rf web/src/main/webapp/jitsi-meet
tar jx -f "$JITSI_MEET_DOWNLOAD_DIR/jitsi-meet-1.0.$JITSI_MEET_GIT_REFERENCE.tar.bz2" --directory web/src/main/webapp
# Retain the index file, as that has OFMeet-specific customization.
git checkout -- web/src/main/webapp/jitsi-meet/index.html

cleanWork


echo "Done."