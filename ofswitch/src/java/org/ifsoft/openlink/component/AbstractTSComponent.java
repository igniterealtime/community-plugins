package org.ifsoft.openlink.component;

import org.apache.log4j.Logger;

import org.xmpp.component.Component;
import org.xmpp.component.AbstractComponent;
import org.xmpp.component.ComponentException;
import org.xmpp.component.ComponentManager;
import org.xmpp.component.ComponentManagerFactory;

import org.xmpp.packet.JID;
import java.util.List;

public abstract class AbstractTSComponent extends AbstractComponent
{
    protected Logger Log = Logger.getLogger(getClass().getName());

	public AbstractTSComponent(int maxThreadpoolSize, int maxQueueSize, boolean enforceIQResult)
	{
        super(maxThreadpoolSize, maxQueueSize, enforceIQResult);
	}

}
