package org.jivesoftware.openfire.plugin.ofmeet.sasl;

import org.jivesoftware.openfire.plugin.ofmeet.TokenManager;

import javax.security.sasl.Sasl;
import javax.security.sasl.SaslException;
import javax.security.sasl.SaslServer;
import java.security.Principal;

/**
 * A SaslServer implementation that is specific to OfMeet.
 *
 * @author Guus der Kinderen, guus.der.kinderen@gmail.com
 */
public class OfMeetSaslServer implements SaslServer
{
    public static final String MECHANISM_NAME = "OFMEET";

    private String authorizationID = null;

    private TokenManager tokenManager;

    public OfMeetSaslServer( TokenManager tokenManager )
    {
        this.tokenManager = tokenManager;
    }

    @Override
    public String getMechanismName()
    {
        return MECHANISM_NAME;
    }

    @Override
    public byte[] evaluateResponse( byte[] response ) throws SaslException
    {
        if ( response == null )
        {
            throw new IllegalArgumentException( "Argument 'response' cannot be null." );
        }

        final String decoded;
        try
        {
            decoded = new String( response, "UTF-8" );
        }
        catch ( Exception ex )
        {
            throw new SaslException( "Unable to decode client response.", ex );
        }

        final Principal principal = tokenManager.validate( decoded );
        if ( principal == null )
        {
            throw new SaslException( "Client response contained an invalid token." );
        }
        else
        {
            authorizationID = principal.getName();
            if ( authorizationID == null || authorizationID.isEmpty() )
            {
                throw new IllegalStateException(); // This should not happen. You're either authenticated, or not.
            }
        }

        return null;
    }

    public boolean isComplete()
    {
        return true;
    }

    public String getAuthorizationID()
    {
        if ( !isComplete() )
        {
            throw new IllegalStateException( MECHANISM_NAME + " authentication has not completed." );
        }

        return authorizationID;
    }

    public Object getNegotiatedProperty( String propName )
    {
        if ( !isComplete() )
        {
            throw new IllegalStateException( MECHANISM_NAME + " authentication has not completed." );
        }

        if ( Sasl.QOP.equals( propName ) )
        {
            return "auth";
        }
        return null;
    }

    public void dispose() throws SaslException
    {
        authorizationID = null;
        tokenManager = null;
    }

    public byte[] unwrap( byte[] incoming, int offset, int len ) throws SaslException
    {
        if ( !isComplete() )
        {
            throw new IllegalStateException( MECHANISM_NAME + " authentication has not completed." );
        }

        throw new IllegalStateException( MECHANISM_NAME + " supports neither integrity nor privacy." );
    }

    public byte[] wrap( byte[] outgoing, int offset, int len ) throws SaslException
    {
        if ( !isComplete() )
        {
            throw new IllegalStateException( MECHANISM_NAME + " authentication has not completed." );
        }

        throw new IllegalStateException( MECHANISM_NAME + " supports neither integrity nor privacy." );
    }
}
