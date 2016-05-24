package org.jivesoftware.openfire.plugin.ofmeet.jetty;

import org.eclipse.jetty.security.DefaultUserIdentity;
import org.eclipse.jetty.server.UserIdentity;
import org.jivesoftware.openfire.XMPPServer;
import org.jivesoftware.openfire.auth.*;
import org.jivesoftware.openfire.plugin.ofmeet.TokenManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.security.auth.Subject;
import java.security.Principal;

/**
 * A Jetty LoginService implementation, that makes available an access token for a user that's logged in through Jetty.
 * The token, managed by the singleton {@link TokenManager} instance, is valid until the user is logged out.
 *
 * @author Guus der Kinderen, guus.der.kinderen@gmail.com
 */
public class OfMeetLoginService extends AbstractLoginService
{
    private static final Logger Log = LoggerFactory.getLogger( OfMeetLoginService.class );

    private final TokenManager tokenManager = TokenManager.getInstance();

    /**
     * AuthFactory supports both a bare username, as well as user@domain. However, UserManager only accepts the bare
     * username. If the provided value includes a domain, return only the node-part (after verifying that it's actually
     * a user of our domain).
     *
     * @param username A authentication ID, either as 'user@domain' or 'user' (not null, not empty)
     * @return the 'user' part (never null).
     */
    public static String asUserNameOfDomain( String username )
    {
        final String[] parts = username.split( "@", 2 );
        if ( parts.length > 1 )
        {
            if ( XMPPServer.getInstance().getServerInfo().getXMPPDomain().equals( parts[ 1 ] ) )
            {
                username = parts[ 0 ];
            }
            else
            {
                return null;
            }
        }

        return username;
    }

    /**
     * Login a user.
     *
     * @param username    The user name
     * @param credentials The users credentials
     * @return A UserIdentity if the credentials matched, otherwise null
     */
    @Override
    public UserIdentity login( String userName, Object credentials )
    {
        String username = asUserNameOfDomain( userName );

        if (username == null)
        {
			OfMeetAzure ofmeetAzure = new OfMeetAzure();
			username = ofmeetAzure.authenticateUser(userName, (String) credentials);
			credentials = ofmeetAzure.getAccessToken();
		}

        try
        {
            final AuthToken authToken = AuthFactory.authenticate( username, (String) credentials );

            final Principal principal = new KnownUser( authToken.getUsername() );
            final String[] roles = new String[]{"ofmeet"};

            final Subject subject = new Subject();
            subject.getPrincipals().add( principal );
            subject.setReadOnly();

            final UserIdentity identity = new DefaultUserIdentity( subject, principal, roles );

            tokenManager.registerIfAbsent( principal );

            Log.debug( "Login succeeded for '{}'.", username );
            return identity;
        }
        catch ( UnauthorizedException ex )
        {
            // Wrong password provided by user.
            Log.debug( "Login failed for '{}':", username, ex );
            return null;
        }
        catch ( ConnectionException | InternalUnauthenticatedException ex )
        {
            // System failure! Configuration should be checked server-sided.
            Log.warn( "An internal problem caused authentication to fail for '{}':", username, ex );
            return null;
        }
    }

    /**
     * Validate that a UserIdentity previously created by a call {@link #login(String, Object)} is still valid.
     *
     * @param identity The user to validate
     * @return true if authentication has not been revoked for the user.
     */
    @Override
    public boolean validate( UserIdentity identity )
    {
        return tokenManager.containsToken( identity.getUserPrincipal() );
    }

    /**
     * Revoke authentication for the user
     *
     * @param identity the user to invalidate.
     */
    @Override
    public synchronized void logout( UserIdentity identity )
    {
        tokenManager.revoke( identity.getUserPrincipal() );
    }
}
