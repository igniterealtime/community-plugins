package org.ifsoft.openlink.component;

import java.io.*;
import org.apache.log4j.Logger;

public abstract class AbstractGroupMember
{
    protected Logger Log = Logger.getLogger(getClass().getName());

	private String abstractMemberID			= null;

	public String getMemberID() {
		return abstractMemberID;
	}

	public void setMemberID(String abstractMemberID) {
		this.abstractMemberID = abstractMemberID;
	}
}

