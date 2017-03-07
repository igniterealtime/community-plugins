package org.jivesoftware.openfire.plugin.ofmeet;

import net.java.sip.communicator.util.ServiceUtils;
import org.jitsi.jicofo.FocusBundleActivator;
import org.jitsi.jicofo.JvbDoctor;
import org.jitsi.jicofo.auth.AuthenticationAuthority;
import org.jitsi.jicofo.reservation.ReservationSystem;
import org.jivesoftware.openfire.XMPPServer;
import org.jivesoftware.util.JiveGlobals;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.xmpp.component.ComponentManagerFactory;
import org.jitsi.impl.osgi.framework.OSGiLauncher;
import org.jitsi.jicofo.FocusManager;
import org.jitsi.jicofo.osgi.JicofoBundleConfig;
import org.jitsi.jicofo.xmpp.FocusComponent;
import org.jitsi.meet.OSGi;
import org.jitsi.meet.OSGiBundleConfig;

/**
 * A wrapper object for the Jitsi Component Focus (jicofo) component.
 *
 * This wrapper can be used to instantiate/initialize and tearing down an instance of the wrapped component. An instance
 * of this class is re-usable.
 *
 * @author Guus der Kinderen, guus.der.kinderen@gmail.com
 */
public class JitsiJicofoWrapper
{
    private static final Logger Log = LoggerFactory.getLogger( JitsiJicofoWrapper.class );

    private String jicofoSubdomain = "focus";

    private FocusComponent jicofoComponent;
    private OSGiLauncher jicofoLauncher;

    /**
     * Initialize the wrapped component.
     *
     * @throws Exception On any problem.
     */
    public synchronized void initialize() throws Exception
    {
        Log.debug( "Initializing Jitsi Focus Component (jicofo)...");

        if ( jicofoComponent != null || jicofoLauncher != null )
        {
            Log.warn( "Another Jitsi Focus Component (jicofo) appears to have been initialized earlier! Unexpected behavior might be the result of this new initialization!" );
        }

        String focusUserName = JiveGlobals.getProperty("org.jitsi.videobridge.ofmeet.focus.user.jid" );
        if ( focusUserName == null || focusUserName.isEmpty() )
        {
            Log.warn( "The focus user JID is not configured in property 'org.jitsi.videobridge.ofmeet.focus.user.jid', which is likely going to cause problems!" );
            focusUserName = XMPPServer.getInstance().createJID( "focus", "unused" ).toBareJID();
        }

        final String focusPassword = JiveGlobals.getProperty("org.jitsi.videobridge.ofmeet.focus.user.password", "" );
        if ( focusPassword == null || focusPassword.isEmpty())
        {
            Log.warn( "The focus user password is not configured in property 'org.jitsi.videobridge.ofmeet.focus.user.password', which is likely going to cause problems!" );
        }

        System.setProperty( FocusManager.HOSTNAME_PNAME, XMPPServer.getInstance().getServerInfo().getHostname() );
        System.setProperty( FocusManager.XMPP_DOMAIN_PNAME, XMPPServer.getInstance().getServerInfo().getXMPPDomain() );
        System.setProperty( FocusManager.FOCUS_USER_DOMAIN_PNAME, XMPPServer.getInstance().getServerInfo().getXMPPDomain() );
        System.setProperty( FocusManager.FOCUS_USER_NAME_PNAME, focusUserName.split("@")[0]);
        System.setProperty( FocusManager.FOCUS_USER_PASSWORD_PNAME, focusPassword);

        // Disable health check. Our JVB is not an external component, so there's no need to check for its connectivity.
        // Also, the health check appears to cumulatively use and not release resources!
        System.setProperty( JvbDoctor.HEALTH_CHECK_INTERVAL_PNAME, "-1" );
        System.setProperty( "org.jitsi.jicofo.PING_INTERVAL", "-1" );

        // Disable JVB rediscovery. We are running with one hard-coded videobridge, there's no need for dynamic detection of others.
        System.setProperty( "org.jitsi.jicofo.SERVICE_REDISCOVERY_INTERVAL", "-1" ); // Aught to use a reference to ComponentsDiscovery.REDISCOVERY_INTERVAL_PNAME, but that constant is private.

        boolean focusAnonymous = "false".equals(JiveGlobals.getProperty("ofmeet.security.enabled", "true"));

        // The static OSGi instance will have a bundle config set (which is done in the videobridge plugin. We
        // can't re-initialize that, without breaking the videobridge code. Instead, we'll manually track a
        // launcher for the jicofo OSGi bundle.
        final OSGiBundleConfig jicofoConfig = new JicofoBundleConfig();
        jicofoLauncher = new OSGiLauncher( jicofoConfig.getBundles() );

        jicofoComponent = new FocusComponent( XMPPServer.getInstance().getServerInfo().getHostname(), 0, XMPPServer.getInstance().getServerInfo().getXMPPDomain(), jicofoSubdomain, null, focusAnonymous, focusUserName);

        // Instead of #init, manually start the OSGi launcher! #jicofoComponent.init();
        jicofoLauncher.start( jicofoComponent );

        ComponentManagerFactory.getComponentManager().addComponent(jicofoSubdomain, jicofoComponent);

        Log.trace( "Successfully initialized Jitsi Focus Component (jicofo).");
    }

    /**
     * Destroying the wrapped component. After this call, the wrapped component can be re-initialized.
     *
     * @throws Exception On any problem.
     */
    public synchronized void destroy() throws Exception
    {
        Log.debug( "Destroying Jitsi Focus Component..." );

        if ( jicofoComponent == null)
        {
            Log.warn( "Unable to destroy the Jitsi Focus Component, as none appears to be running!" );
        }
        else
        {
            ComponentManagerFactory.getComponentManager().removeComponent(jicofoSubdomain);
            jicofoSubdomain = null;
            jicofoComponent = null;

        }
        if ( jicofoLauncher == null )
        {
            Log.warn( "Unable to destroy the Jitsi Focus Component as none appears to be running!" );
        }
        else
        {
            // Instead of jicofoComponent.dispose(), manually stop the OSGi launcher that we're tracking.
            jicofoLauncher.stop( jicofoComponent );
            jicofoLauncher = null;
        }

        Log.trace( "Successfully destroyed Jitsi Focus Component.   " );
    }

    public FocusComponent getFocusComponent()
    {
        return jicofoComponent;
    }

    public ReservationSystem getReservationService()
    {
        return ServiceUtils.getService(FocusBundleActivator.bundleContext, ReservationSystem.class);
    }

    public FocusManager getFocusManager()
    {
        return ServiceUtils.getService(FocusBundleActivator.bundleContext, FocusManager.class);
    }

    public AuthenticationAuthority getAuthenticationAuthority()
    {
        return ServiceUtils.getService( FocusBundleActivator.bundleContext, AuthenticationAuthority.class);
    }
}
