package org.jivesoftware.openfire.plugin.ofmeet;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.jitsi.videobridge.Conference;
import org.jitsi.videobridge.HarvesterConfiguration;
import org.jitsi.videobridge.VideoChannel;
import org.jitsi.videobridge.Videobridge;
import org.jitsi.videobridge.openfire.PluginImpl;
import org.jivesoftware.openfire.container.Plugin;
import org.jivesoftware.openfire.container.PluginManager;

import java.io.File;

/**
 * A wrapper object for the Jitsi Videobridge Openfire plugin.
 *
 * This wrapper can be used to instantiate/initialize and tearing down an instance of that plugin. An instance of this
 * class is re-usable.
 *
 * @author Guus der Kinderen, guus.der.kinderen@gmail.com
 */
public class JitsiPluginWrapper
{
    private static final Logger Log = LoggerFactory.getLogger(JitsiPluginWrapper.class );

    private PluginImpl jitsiPlugin;

    /**
     * Initialize the wrapped component.
     *
     * @throws Exception On any problem.
     */
    public synchronized void initialize(final PluginManager manager, final File pluginDirectory) throws Exception
    {
        Log.debug( "Initializing Jitsi Videobridge..." );

        if ( jitsiPlugin != null )
        {
            Log.warn( "Another Jitsi Videobridge appears to have been initialized earlier! Unexpected behavior might be the result of this new initialization!" );
        }
        jitsiPlugin = new PluginImpl();
        jitsiPlugin.initializePlugin( manager, pluginDirectory );
        Log.trace( "Successfully initialized Jitsi Videobridge." );
    }

    /**
     * Destroying the wrapped component. After this call, the wrapped component can be re-initialized.
     *
     * @throws Exception On any problem.
     */
    public synchronized void destroy() throws Exception
    {
        Log.debug( "Destroying Jitsi Videobridge..." );

        if ( jitsiPlugin == null )
        {
            Log.warn( "Unable to destroy the Jitsi Videobridge, as none appears to be running!" );
        }

        jitsiPlugin.destroyPlugin();
        jitsiPlugin = null;
        Log.trace( "Successfully destroyed Jitsi Videobridge." );
    }

    public Videobridge getVideobridge() {
        return jitsiPlugin.getComponent().getVideobridge();
    }
}
