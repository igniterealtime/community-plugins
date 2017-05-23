package org.jivesoftware.openfire.plugin.ofmeet.sasl;

import java.security.Provider;

/**
 * A Provider implementation for an OfMeet-specific SASL mechanisms.
 *
 * @author Guus der Kinderen, guus.der.kinderen@gmail.com
 */
public class OfMeetSaslProvider extends Provider
{
    /**
     * The provider name.
     */
    public static final String NAME = "OfMeetSasl";

    /**
     * The provider version number.
     */
    public static final double VERSION = 1.0;

    /**
     * A description of the provider and its services.
     */
    public static final String INFO = "OfMeet-specific SASL mechansims.";

    public OfMeetSaslProvider()
    {
        super( NAME, VERSION, INFO );

        put( "SaslServerFactory." + OfMeetSaslServer.MECHANISM_NAME, OfMeetSaslServerFactory.class.getCanonicalName() );
    }
}