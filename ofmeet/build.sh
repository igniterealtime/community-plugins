#!/bin/bash
# ../buildtools/apache-ant-1.9.7/bin/ant -f build.xml -lib ../buildtools/maven-ant-tasks-2.1.3/ clean jar

JICOFO_GIT_REFERENCE=jitsi-meet_1947
VIDEOBRIDGE_GIT_REFERENCE=jitsi-meet_1947
OPENFIRE_GIT_REFERENCE=4.1

WORK_DIR=./work
CLONE_DIR=./repositories

JICOFO_GIT_CLONE_DIR=$CLONE_DIR/jitsi-jicofo-$JICOFO_GIT_REFERENCE
VIDEOBRIDGE_GIT_CLONE_DIR=$CLONE_DIR/jitsi-videobridge-$VIDEOBRIDGE_GIT_REFERENCE
OPENFIRE_GIT_CLONE_DIR=$CLONE_DIR/igniterealtime-openfire-$OPENFIRE_GIT_REFERENCE

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
        echo "Directory '$4' exists and is not empty. Assuming it contains an up-to-date shallow clone.."
    else
        echo "Directory '$4' does not exists or is empty. Attempting git clone"
        mkdir -p "$4"
        git clone --depth 1 "$2" "$4"
    fi

    echo "";
}

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

echo "Collecting upstream GIT data..."
retrieveFromUpstreamGit "Jitsi Jicofo" "https://github.com/jitsi/jicofo.git" "$JICOFO_GIT_REFERENCE" "$JICOFO_GIT_CLONE_DIR"
retrieveFromUpstreamGit "Jitsi Videobridge" "https://github.com/jitsi/jitsi-videobridge.git" "$VIDEOBRIDGE_GIT_REFERENCE" "$VIDEOBRIDGE_GIT_CLONE_DIR"
retrieveFromUpstreamGit "Ignite Realtime Openfire" "https://github.com/igniterealtime/Openfire.git" "$OPENFIRE_GIT_REFERENCE" "$OPENFIRE_GIT_CLONE_DIR"
echo "Done collecting upstream GIT data."
echo ""

echo "Building upstream GIT projects..."
buildAndInstallMavenProject "Jitsi Jicofo" "$JICOFO_GIT_CLONE_DIR"
buildAndInstallMavenProject "Jitsi Videobridge" "$VIDEOBRIDGE_GIT_CLONE_DIR"
buildAndInstallMavenProject "Jitsi Videobridge Openfire plugin" "$VIDEOBRIDGE_GIT_CLONE_DIR/openfire"
buildAndInstallMavenProject "Ignite Realtime Openfire" "$OPENFIRE_GIT_CLONE_DIR"
echo "Done building upstream GIT projects."

cleanWork


echo "Done."