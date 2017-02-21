package org.jivesoftware.openfire.plugin.ofmeet;

import org.jivesoftware.util.Base64;

import java.security.Principal;
import java.security.SecureRandom;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * A manager of access tokens for a user. The generated access token is cryptographically strong.
 *
 * This class is intended to be used as a singleton. The instance is thread-safe.
 *
 * @author Guus der Kinderen, guus@goodbytes.nl
 */
// TODO Tokens remain active until Jetty logs out a principal. I'm not sure if that happens when sessions implicitly end (eg timeout). Perhaps these tokens should have a limited time-span.
public class TokenManager
{
    private static final Logger Log = LoggerFactory.getLogger( TokenManager.class );
    private static TokenManager instance = null;
    protected final Map<Principal, Set<String>> userToToken = new HashMap<>();
    protected final Map<String, Principal> tokenToUser = new HashMap<>();
    private final SecureRandom random = new SecureRandom();


    public synchronized static TokenManager getInstance()
    {
        if ( instance == null )
        {
            instance = new TokenManager();
        }
        return instance;
    }

    /**
     * Generates a new access token.
     *
     * The token is guaranteed not to be used at the time of invocation.
     *
     * @return a base64 encoded, unique access token (never null, never empty)
     */
    protected synchronized String generateToken()
    {
        String encoded;
        do
        {
            final byte bytes[] = new byte[ 40 ];
            random.nextBytes( bytes );
            encoded = Base64.encodeBytes( bytes );
            if ( encoded == null || encoded.isEmpty() )
            {
                throw new IllegalStateException( "Generated a null or empty random Base64 String?" );
            }
        }
        while ( tokenToUser.containsKey( encoded ) );

        return encoded;
    }

    /**
     * Ensures that an access token is registered for the user.
     *
     * Invoking this method is a thread-safe alternative to the following:
     * <pre>{@code
     * String token = retrieveToken( identity );
     * if (token == null) {
     *   token = registerNewToken( identity );
     * }
     * return token;
     * }</pre>
     *
     * @param identity A user identity (cannot be null).
     * @return an access token for the user (never null).
     */
    public synchronized String registerIfAbsent( Principal identity )
    {
        String token = retrieveToken( identity );
        if (token == null) {
            token = registerNewToken( identity );
        }
        return token;
    }

    /**
     * Adds a new access token for a user.
     *
     * If a token was previously registered for this user, the old value is discarded.
     *
     * @param identity A user identity (cannot be null).
     * @return a new access token for the user (never null).
     */
    public synchronized String registerNewToken( Principal identity )
    {
        final String token = generateToken();

        Set<String> tokens = userToToken.get( identity );
        if ( tokens == null ) {
            tokens = new HashSet<>();
        }
        tokens.add( token );
        userToToken.put( identity, tokens );
        tokenToUser.put( token, identity );

		Log.warn("storing local token " + token + "\n" + identity);
        return token;
    }

    /**
     * Adds a new azure access token for a user.
     *
     * If a token was previously registered for this user, the old value is discarded.
     *
     * @param identity A user identity (cannot be null).
     * @param new access token for the user (cannot be null).
     */
    public synchronized void registerNewAzureToken( Principal identity, String token )
    {
        Set<String> tokens = new HashSet<>();
        tokens.add( token );
        userToToken.put( identity, tokens );
        tokenToUser.put( token, identity );

		Log.warn("storing azure token " + token + "\n" + identity);
    }


    /**
     * Verifies if an access token is currently registered for a user.
     *
     * @param identity A user identity (cannot be null).
     * @return true when an access token for the user is currently active, otherwise false.
     */
    public synchronized boolean containsToken( Principal identity )
    {
        return userToToken.containsKey( identity );
    }

    /**
     * Retrieves an access token for a user.
     *
     * No assumptions can be made which token is returned by this method, when more than one token has been registered
     * for the user.
     *
     * @param identity A user identity (cannot be null).
     * @return The access token, or null if no access token is registered for the user.
     */
    public synchronized String retrieveToken( Principal identity )
    {
        final Set<String> tokens = userToToken.get(identity);
        if ( tokens == null ) {
            return null;
        }
        return tokens.iterator().next();
    }

    /**
     * Invalidates the access tokens for a user.
     *
     * If no access token was active for this user, an invocation of this method has no effect.
     *
     * @param identity A user identity (cannot be null).
     */
    public synchronized void revoke( Principal identity )
    {
        final Set<String> tokens = userToToken.remove( identity );
        if ( tokens != null ) {
            for ( String token : tokens ) {
                tokenToUser.remove( token );
            }
        }
    }

    /**
     * Returns the user that is identified by the provided token.
     *
     * @param token A token (not null)
     * @return A user when the token is currently valid, otherwise null.
     */
    public synchronized Principal validate( String token )
    {
        return tokenToUser.get( token );
    }
}
