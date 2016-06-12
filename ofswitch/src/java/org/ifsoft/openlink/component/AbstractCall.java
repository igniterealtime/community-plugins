package org.ifsoft.openlink.component;

import java.util.*;
import org.apache.log4j.Logger;

public abstract class AbstractCall
{
    protected Logger Log = Logger.getLogger(getClass().getName());

	public String callid = "";
	public String ddi = "";
	public String ddiLabel = "";
	public String prefix = "";
	public String phantomDDI = "";
	public String line = "";
	public String label = "";
	public String console = "0.0.0.0";
	public String handset = "0";
	public String direction = "Outgoing";
	public String participation = "Inactive";
	public String firstParticipation = "Inactive";
	public String proceedingDigits = "";
	public String proceedingDigitsBuffer = "";
	public String proceedingDigitsLabel = "";
	public String connectState = "CallOriginated";
	public boolean transferFlag = false;
	public boolean platformIntercom = false;
	public boolean published = false;
	public boolean deleted = false;
	public boolean localConferenced = false;
	public boolean delivered = false;

    public long creationTimeStamp = System.currentTimeMillis();
    public long startTimeStamp = 0;
   	public long ringTimeStamp = 0;
    public long completionTimeStamp = 0;
    public long firstTimeStamp = 0;
	public List<String> validActions = new ArrayList();
	public List<Long> durations = new ArrayList();

	private String privacy = "N";
	private String status = "State";
	private String state = "Unknown";
	private String cli = "";
	private String cliLabel = "";

	public void clear()
	{
		platformIntercom = false;
		transferFlag = false;
	}

	public void start()
	{

	}

	public List getValidActions()
	{
		return validActions;
	}


	public void setValidActions()
	{
        validActions.clear();

        if("CallMissed".equals(getState()))
        {
            // no actions
        }

        if("ConnectionCleared".equals(getState()))
        {
            // no actions
        }

        if("ConnectionBusy".equals(getState()))
        {
            // no actions
        }

        if("CallBusy".equals(getState()))
        {
            setCallBusyActions();
        }


        if("CallConferenced".equals(getState()))
        {
			setCallConferencedActions();
        }

        if("CallHeld".equals(getState()))
        {
			setCallHeldActions();
        }

        if("CallHeldElsewhere".equals(getState()))
        {
			setCallHeldElsewhereActions();
        }

        if("CallTransferring".equals(getState()))
        {
			setCallTransferringActions();
        }

        if("CallTransferred".equals(getState()))
        {
			setCallTransferredActions();
        }


        if("CallFailed".equals(getState()))
        {
			setCallFailedActions();
        }

        if("CallOriginated".equals(getState()))
        {
			setCallOriginatedActions();
        }

        if("CallDelivered".equals(getState()))
        {
 			if("Incoming".equals(getDirection()))
 			{
				validActions.add("AnswerCall");

			} else {

				setCallDeliveredActions();
			}
        }

        if("CallEstablished".equals(getState()))
        {
            setCallEstablishedActions();
        }

	}

    protected void setCallFailedActions()
    {

	}

    protected void setCallOriginatedActions()
    {

	}

    protected void setCallEstablishedActions()
    {

    }

    protected void setCallDeliveredActions()
    {

    }

    protected void setCallBusyActions()
    {

    }

    protected void setCallHeldActions()
    {
    }


    protected void setCallHeldElsewhereActions()
    {

    }

    protected void setCallConferencedActions()
    {

    }

    protected void setCallTransferringActions()
    {

	}

    protected void setCallTransferredActions()
    {

	}

	private void addValidAction(String action)
	{
		if (!validActions.contains(action))
		{
			validActions.add(action);
		}
	}

	private void removeValidAction(String action)
	{
		if (validActions.contains(action))
		{
			int pos = validActions.indexOf(action);
			validActions.remove(pos);
		}
	}

	public List<Long> getDurations()
	{
		return durations;
	}

	public void initialiseDuration()
	{
		durations = new ArrayList();

		startTimeStamp = 0;
		completionTimeStamp = 0;
		firstTimeStamp = 0;
        creationTimeStamp = System.currentTimeMillis();
	}


	public void startDuration()
	{
		if (startTimeStamp == 0L)
		{
			startTimeStamp = System.currentTimeMillis();
			completionTimeStamp = 0;
		}

		if (firstTimeStamp == 0L)
		{
			firstTimeStamp = startTimeStamp;
		}

	}

	public void startParticipation()
	{
		if (firstTimeStamp == 0L)
		{
			firstTimeStamp = System.currentTimeMillis();
		}

		firstParticipation = "Active";

	}

	public void endDuration()
	{
		completionTimeStamp = System.currentTimeMillis();

		long duration = getLegDuration();

		if (duration > 0)
		{
			durations.add(getLegDuration());
			completionTimeStamp = 0;
			startTimeStamp = 0;
		}
	}

	public long getLegDuration()
	{
		if (completionTimeStamp != 0)
		{
			if (startTimeStamp != 0)
			{
				return ((completionTimeStamp - startTimeStamp));

			} else {

				return 0;
			}

		} else {

			if (startTimeStamp != 0)
			{
				return ((System.currentTimeMillis() - startTimeStamp));

			} else {

				return 0;
			}
		}
	}

	public long getRingDuration()
	{
		return ((System.currentTimeMillis() - creationTimeStamp));
	}


	public long getDuration()
	{
		long totalDuration = getLegDuration();

		Iterator it4 = getDurations().iterator();

		while( it4.hasNext() )
		{
			long duration = (Long)it4.next();
			totalDuration = totalDuration + duration;
		}

		return totalDuration;
	}


	public String getCalledNumber(String interestType)
	{
		if ("N".equals(getPrivacy()) || ("Y".equals(getPrivacy()) && "Active".equals(getParticipation())))
		{
			if ("Incoming".equals(getDirection()))
			{
				return getDDI();

			} else {

				return getCLI();
			}
		} else return "";
	}

	public String getCalledName(String interestType)
	{
		if ("N".equals(getPrivacy()) || ("Y".equals(getPrivacy()) && "Active".equals(getParticipation())))
		{
			String theName = null;

			if ("Incoming".equals(getDirection()))
			{
				theName = (getDDILabel());

			} else {

				theName = getCLILabel();
			}

			if (theName == null || "".equals(theName))
			{
				theName = getCalledNumber(interestType);
			}

			return theName;

		} else return "";
	}

	public String getCallerNumber(String interestType)
	{
		if ("Incoming".equals(getDirection()))
		{
			return(getCLI());

		} else {

			return getDDI();
		}
	}

	public String getCallerName(String interestType)
	{
		String theName = null;

		if ("Incoming".equals(getDirection()))
		{
			theName =  (getCLILabel());

		} else {

			theName =  (getDDILabel());
		}

		if (theName == null || "".equals(theName))
		{
			theName = getCallerNumber(interestType);
		}

		return theName;
	}

	public String getCallID()
	{
		return callid;
	}

	public String getStatus()
	{
		return status;
	}

	public String getState()
	{
		return state;
	}

	public void setStatus(String status)
	{
		this.status = status;
	}

	public void setState(String state)
	{
		this.state = state;
		status = "State";
	}

	public String getPrivacy()
	{
		return privacy;
	}

	public void setPrivacy(String privacy)
	{
		this.privacy = privacy;
		status = "Privacy";
	}

	public String getParticipation()
	{
		return participation;
	}

	public String getProceedingDigits()
	{
		return proceedingDigits;
	}

	public String getProceedingDigitsLabel()
	{
		return proceedingDigitsLabel;
	}

	public String getDirection()
	{
		return direction;
	}

	public String getPrefix()
	{
		return prefix;
	}

	public String getLine()
	{
		return (line);
	}

	public String getConsole()
	{
		return (console);
	}

	public String getUser()
	{
		return (console);
	}

	public String getHandset()
	{
		return handset;
	}

	public String getLineName()
	{
		return (label);
	}

	public String getDDI()
	{
		return ddi;
	}

	public String getCLI()
	{
		return (cli);
	}

	public void setCLI(String cli)
	{
		this.cli = cli;
		status = "Caller";
	}

	public String getDDILabel()
	{
		return ddiLabel;
	}

	public String getCLILabel()
	{
		return (cliLabel);
	}

	public void setCLILabel(String cliLabel)
	{
		this.cliLabel = cliLabel;
	}

	public String getPhantomDDI()
	{
		return (phantomDDI);
	}

}