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

package org.jivesoftware.openfire.plugin.ofmeet;

import org.jitsi.jicofo.FocusManager;
import org.jitsi.jicofo.auth.AuthenticationAuthority;
import org.jitsi.jicofo.reservation.ReservationSystem;
import org.jivesoftware.openfire.container.Plugin;
import org.jivesoftware.openfire.container.PluginManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;

/**
 * Created by guus on 25-4-17.
 */
public class FocusPlugin implements Plugin
{
    private static final Logger Log = LoggerFactory.getLogger( FocusPlugin.class );

    private final JitsiJicofoWrapper jitsiJicofoWrapper = new JitsiJicofoWrapper();


    @Override
    public void initializePlugin( PluginManager pluginManager, File file )
    {
        try
        {
            jitsiJicofoWrapper.initialize();
        }
        catch ( Exception e )
        {
            Log.error( "An exception occurred while initializing the Jitsi Jicofo wrapper.", e );
        }
    }

    @Override
    public void destroyPlugin()
    {
        try
        {
            jitsiJicofoWrapper.destroy();
        }
        catch ( Exception ex )
        {
            Log.error( "An exception occurred while trying to destroy the Jitsi Jicofo wrapper." );
        }
    }

    public ReservationSystem getReservationService()
    {
        return this.jitsiJicofoWrapper.getReservationService();
    }

    public FocusManager getFocusManager()
    {
        return this.jitsiJicofoWrapper.getFocusManager();
    }

    public AuthenticationAuthority getAuthenticationAuthority()
    {
        return this.jitsiJicofoWrapper.getAuthenticationAuthority();
    }
}
