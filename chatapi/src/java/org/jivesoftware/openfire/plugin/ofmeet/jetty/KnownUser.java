package org.jivesoftware.openfire.plugin.ofmeet.jetty;

import java.io.Serializable;
import java.security.Principal;

/**
 * A simple Principal implementation that wraps only a name.
 *
 * @author Guus der Kinderen, guus.der.kinderen@gmail.com
 */
public class KnownUser implements Principal, Serializable
{
    private static final long serialVersionUID = 2L;
    private final String name;
    private final String username;

    public KnownUser( String name, String username)
    {
        this.name = name;
        this.username = username;
    }

    public String getName()
    {
        return name;
    }

    @Override
    public boolean equals( Object o )
    {
        if ( this == o )
        {
            return true;
        }
        if ( !( o instanceof KnownUser ) )
        {
            return false;
        }

        KnownUser knownUser = (KnownUser) o;

        return name.equals( knownUser.name );
    }

    @Override
    public int hashCode()
    {
        return name.hashCode();
    }

    @Override
    public String toString()
    {
        return username;
    }
}
