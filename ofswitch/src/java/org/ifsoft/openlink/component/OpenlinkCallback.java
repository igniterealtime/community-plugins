package org.ifsoft.openlink.component;

import java.util.Date;

public class OpenlinkCallback extends AbstractCallback
{
	private String remoteHandset 			= null;
	private String localHandset				= null;
	private String virtualDeviceId			= null;
	private String virtualUserId			= null;
	private OpenlinkUser traderLyncUser		= null;
	private Date timestamp					= null;

    public OpenlinkCallback()
    {

    }

	public Date getTimestamp()
	{
		return timestamp;
	}

	public void setTimestamp(Date timestamp)
	{
		this.timestamp = timestamp;
	}

	public String getRemoteHandset()
	{
		return remoteHandset;
	}

	public void setRemoteHandset(String remoteHandset)
	{
		this.remoteHandset = remoteHandset;
	}

	public String getLocalHandset()
	{
		return localHandset;
	}

	public void setLocalHandset(String localHandset)
	{
		this.localHandset = localHandset;
	}

	public String getVirtualDeviceId()
	{
		return virtualDeviceId;
	}

	public void setVirtualDeviceId(String virtualDeviceId)
	{
		this.virtualDeviceId = virtualDeviceId;
	}

	public String getVirtualUserId()
	{
		return virtualUserId;
	}

	public void setVirtualUserId(String virtualUserId)
	{
		this.virtualUserId = virtualUserId;
	}


	public OpenlinkUser getOpenlinkUser()
	{
		return traderLyncUser;
	}

	public void setOpenlinkUser(OpenlinkUser traderLyncUser)
	{
		this.traderLyncUser = traderLyncUser;
	}


}

