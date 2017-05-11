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

import java.net.InetAddress;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.UnknownHostException;
import java.util.Arrays;
import java.util.List;

/**
 * A utility class to store various configuration items for OFMeet. The purpose of this class is to centralize all
 * interaction with Jive properties (and the definition of their default values)
 *
 * @author Guus der Kinderen, guus.der.kinderen@gmail.com
 */
public class OFMeetConfig
{
    // No static methods! Static methods are not accessible when using this class as a bean in the Admin Console JSP pages.
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

    public void setWatermarkLogoUrl( URL url )
    {
        JiveGlobals.setProperty( "org.jitsi.videobridge.ofmeet.watermark.logo", url == null ? null : url.toExternalForm() );
    }

    public URL getWatermarkLogoUrl()
    {
        final String value = JiveGlobals.getProperty( "org.jitsi.videobridge.ofmeet.watermark.logo" );
        if ( value == null || value.isEmpty() )
        {
            return null;
        }

        try
        {
            return new URL( value );
        }
        catch ( MalformedURLException e )
        {
            return null;
        }
    }

    public void resetWatermarkLogoUrl( URL url )
    {
        JiveGlobals.deleteProperty( "org.jitsi.videobridge.ofmeet.watermark.logo" );
    }

    public void setBrandWatermarkLogoUrl( URL url )
    {
        JiveGlobals.setProperty( "org.jitsi.videobridge.ofmeet.brand.watermark.logo", url == null ? null : url.toExternalForm() );
    }

    public URL getBrandWatermarkLogoUrl()
    {
        final String value = JiveGlobals.getProperty( "org.jitsi.videobridge.ofmeet.brand.watermark.logo" );
        if ( value == null || value.isEmpty() )
        {
            return null;
        }

        try
        {
            return new URL( value );
        }
        catch ( MalformedURLException e )
        {
            return null;
        }
    }

    public void resetBrandWatermarkLogoUrl( URL url )
    {
        JiveGlobals.deleteProperty( "org.jitsi.videobridge.ofmeet.brand.watermark.logo" );
    }

    public void setButtonsImplemented( List<String> buttons )
    {
        JiveGlobals.setProperty( "ofmeet.buttons.implemented", buttons );
    }

    public List<String> getButtonsImplemented()
    {
        // These should match the implementations that are provided in the defaultToolbarButtons.js file in jitsi-meet.
        // The order of this list is used as the default ordering of the buttons.
        return JiveGlobals.getListProperty( "ofmeet.buttons.implemented", Arrays.asList( "microphone", "camera", "desktop", "invite", "fullscreen", "hangup", "profile", "contacts", "chat", "recording", "etherpad", "sharedvideo", "sip", "dialpad", "settings", "raisehand" ) );
    }

    public void resetButtonsImplemented()
    {
        JiveGlobals.deleteProperty( "ofmeet.buttons.implemented" );
    }

    public void setButtonsEnabled( List<String> buttons )
    {
        JiveGlobals.setProperty( "ofmeet.buttons.enabled", buttons );
    }

    public List<String> getButtonsEnabled()
    {
        return JiveGlobals.getListProperty( "ofmeet.buttons.enabled", Arrays.asList( "microphone", "camera", "desktop", "invite", "fullscreen", "hangup", "profile", "contacts", "chat", "recording", "etherpad", "sharedvideo", "sip", "dialpad", "settings", "raisehand" ) );
    }

    public void resetButtonsEnabled()
    {
        JiveGlobals.deleteProperty( "ofmeet.buttons.enabled" );
    }

    public void setButtonsOnTop( List<String> buttons )
    {
        JiveGlobals.setProperty( "ofmeet.buttons.onTop", buttons );
    }

    public List<String> getButtonsOnTop()
    {
        return JiveGlobals.getListProperty( "ofmeet.buttons.onTop", Arrays.asList( "microphone", "camera", "desktop", "invite", "fullscreen", "hangup" ) );
    }

    public void resetButtonsOnTop()
    {
        JiveGlobals.deleteProperty( "ofmeet.buttons.onTop" );
    }

    public void setPublicNATAddress( InetAddress address )
    {
        JiveGlobals.setProperty( "org.ice4j.ice.harvest.NAT_HARVESTER_PUBLIC_ADDRESS", address == null ? null : address.getHostAddress() );
    }

    public InetAddress getPublicNATAddress()
    {
        final String address = JiveGlobals.getProperty( "org.ice4j.ice.harvest.NAT_HARVESTER_PUBLIC_ADDRESS" );
        if ( address == null || address.isEmpty() )
        {
            return null;
        }

        try
        {
            return InetAddress.getByName( address );
        }
        catch ( UnknownHostException e )
        {
            return null;
        }
    }

    public void resetPublicNATAddress()
    {
        JiveGlobals.deleteProperty( "org.ice4j.ice.harvest.NAT_HARVESTER_PUBLIC_ADDRESS" );
    }

    public void setLocalNATAddress( InetAddress address )
    {
        JiveGlobals.setProperty( "org.ice4j.ice.harvest.NAT_HARVESTER_PRIVATE_ADDRESS", address == null ? null : address.getHostAddress() );
    }

    public InetAddress getLocalNATAddress()
    {
        final String address = JiveGlobals.getProperty( "org.ice4j.ice.harvest.NAT_HARVESTER_PRIVATE_ADDRESS" );
        if ( address == null || address.isEmpty() )
        {
            return null;
        }

        try
        {
            return InetAddress.getByName( address );
        }
        catch ( UnknownHostException e )
        {
            return null;
        }
    }

    public void resetLocalNATAddress()
    {
        JiveGlobals.deleteProperty( "org.ice4j.ice.harvest.NAT_HARVESTER_PRIVATE_ADDRESS" );
    }

}
