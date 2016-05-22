package org.jivesoftware.openfire.plugin.ofmeet.jetty;

import org.eclipse.jetty.security.DefaultIdentityService;
import org.eclipse.jetty.security.IdentityService;
import org.eclipse.jetty.security.LoginService;
import org.eclipse.jetty.util.component.AbstractLifeCycle;

/**
 * A partial implementation of LoginService that uses a default identity service implementation.
 *
 * @author Guus der Kinderen, guus.der.kinderen@gmail.com
 */
public abstract class AbstractLoginService extends AbstractLifeCycle implements LoginService
{
    protected IdentityService identityService = new DefaultIdentityService();
    protected String name;

    public String getName()
    {
        return name;
    }

    public void setName( String name )
    {
        if ( isRunning() )
        {
            throw new IllegalStateException( "Running" );
        }
        this.name = name;
    }

    public IdentityService getIdentityService()
    {
        return identityService;
    }

    public void setIdentityService( IdentityService identityService )
    {
        if ( isRunning() )
        {
            throw new IllegalStateException( "Running" );
        }
        this.identityService = identityService;
    }

    @Override
    public String toString()
    {
        return this.getClass().getSimpleName() + "[" + name + "]";
    }
}
