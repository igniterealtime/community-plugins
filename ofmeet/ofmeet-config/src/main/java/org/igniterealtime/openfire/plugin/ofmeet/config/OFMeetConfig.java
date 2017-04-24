/*
 * Copyright (c) 2017 Ignite Realtime Foundation. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.igniterealtime.openfire.plugin.ofmeet.config;

import org.jivesoftware.util.JiveGlobals;

/**
 * A utility class to store various configuration items for OFMeet. The purpose of this class is to centralize all
 * interaction with Jive properties (and the definition of their default values)
 *
 * @author Guus der Kinderen, guus.der.kinderen@gmail.com
 */
public class OFMeetConfig
{
    private static OFMeetConfig INSTANCE = null;

    public static OFMeetConfig getInstance()
    {
        if ( INSTANCE == null )
        {
            INSTANCE = new OFMeetConfig();
        }
        return INSTANCE;
    }

    public void setChannelLastN( int lastN )
    {
        JiveGlobals.setProperty( "org.jitsi.videobridge.ofmeet.channel.lastn", Integer.toString( lastN ) );
    }

    public int getChannelLastN()
    {
        return JiveGlobals.getIntProperty("org.jitsi.videobridge.ofmeet.channel.lastn", -1 );
    }

    public void resetChannelLastN()
    {
        JiveGlobals.deleteProperty("org.jitsi.videobridge.ofmeet.channel.lastn" );
    }

    public void setAdaptiveLastN( boolean adaptiveChannelLastN )
    {
        JiveGlobals.setProperty( "org.jitsi.videobridge.ofmeet.adaptive.lastn", Boolean.toString( adaptiveChannelLastN ) );
    }

    public boolean getAdaptiveLastN()
    {
        return JiveGlobals.getBooleanProperty("org.jitsi.videobridge.ofmeet.adaptive.lastn", false );
    }

    public void resetAdaptiveLastN()
    {
        JiveGlobals.deleteProperty("org.jitsi.videobridge.ofmeet.adaptive.lastn" );
    }

    public void setSimulcast( boolean simulcast )
    {
        JiveGlobals.setProperty( "org.jitsi.videobridge.ofmeet.simulcast", Boolean.toString( simulcast ) );
    }

    public boolean getSimulcast()
    {
        return JiveGlobals.getBooleanProperty( "org.jitsi.videobridge.ofmeet.simulcast", true );
    }

    public void resetSimulcast()
    {
        JiveGlobals.deleteXMLProperty("org.jitsi.videobridge.ofmeet.simulcast" );
    }

    public void setAdaptiveSimulcast( boolean simulcast )
    {
        JiveGlobals.setProperty( "org.jitsi.videobridge.ofmeet.adaptive.simulcast", Boolean.toString( simulcast ) );
    }

    public boolean getAdaptiveSimulcast()
    {
        return JiveGlobals.getBooleanProperty("org.jitsi.videobridge.ofmeet.adaptive.simulcast", false );
    }

    public void resetAdaptiveSimulcast()
    {
        JiveGlobals.deleteXMLProperty("org.jitsi.videobridge.ofmeet.adaptive.simulcast" );
    }
}
