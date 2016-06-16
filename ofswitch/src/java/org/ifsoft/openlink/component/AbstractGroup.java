package org.ifsoft.openlink.component;

import java.util.*;
import org.apache.log4j.Logger;

public abstract class AbstractGroup
{
    protected Logger Log = Logger.getLogger(getClass().getName());

	private String abstractName 			= null;
	private String abstractGroupID			= null;
    private Map<String, AbstractGroupMember> abstractMembers;

    public AbstractGroup()
    {
        abstractMembers = Collections.synchronizedMap( new HashMap<String, AbstractGroupMember>());
    }

	public String getName()
	{
		return abstractName;
	}

	public void setName(String abstractName)
	{
		this.abstractName = abstractName;
	}

	public String getGroupID()
	{
		return abstractGroupID;
	}

	public void setGroupID(String abstractGroupID)
	{
		this.abstractGroupID = abstractGroupID;
	}

	public AbstractGroupMember getMember(String ID)
	{
		return abstractMembers.get(ID);
	}

	public boolean isMember(String ID)
	{
		return abstractMembers.containsKey(ID);
	}

	public void addMember(String ID, AbstractGroupMember member)
	{
		abstractMembers.put(ID, member);
	}
}

