package org.ifsoft.openlink.component;

import java.util.*;

public class OpenlinkCall extends AbstractCall
{
	public String speaker = "00";
	public boolean traderLyncTransferFlag = false;
	private boolean callbackActive = false;
	private boolean voiceDropActive = false;
	private boolean callbackAvailable = false;
	private String callProgressFlag = null;
	private OpenlinkUserInterest traderLyncUserInterest;

	public String previousCalledNumber = null;
	public String previousCalledLabel = null;


	public void setVoiceDropActive(boolean voiceDropActive)
	{
		this.voiceDropActive = voiceDropActive;
	}

	public boolean getVoiceDropActive()
	{
		return voiceDropActive;
	}

	public void setCallbackActive(boolean callbackActive)
	{
		this.callbackActive = callbackActive;
	}

	public boolean getCallbackActive()
	{
		return callbackActive;
	}

	public void setCallbackAvailable(boolean callbackAvailable)
	{
		this.callbackAvailable = callbackAvailable;
	}

	public boolean getCallbackAvailable()
	{
		return callbackAvailable;
	}

	public void setCallProgress(String callProgressFlag)
	{
		this.callProgressFlag = callProgressFlag;
	}

	public String getCallProgress()
	{
		return callProgressFlag;
	}

	public void setOpenlinkUserInterest(OpenlinkUserInterest traderLyncUserInterest)
	{
		this.traderLyncUserInterest = traderLyncUserInterest;
	}

	public OpenlinkUserInterest getOpenlinkUserInterest()
	{
		return traderLyncUserInterest;
	}

	public void clear()
	{
		callProgressFlag = null;
		previousCalledNumber = null;
		proceedingDigitsLabel = null;
		traderLyncTransferFlag = false;

		super.clear();
	}

    @Override protected void setCallFailedActions()
    {
		validActions.add("ClearConnection");
		validActions.add("ClearCall");
	}

    @Override protected void setCallOriginatedActions()
    {
		validActions.add("ClearConnection");
		validActions.add("SendDigits");
		validActions.add("ClearCall");
	}

    @Override protected void setCallEstablishedActions()
    {
		validActions.add("ClearConnection");
		validActions.add("HoldCall");
        validActions.add("ConsultationCall");

		if (!platformIntercom)
		{
			if (!getCallbackActive())
				validActions.add("IntercomTransfer");

			validActions.add("SingleStepTransfer");

			if("Y".equals(getPrivacy()))
				validActions.add("PublicCall");
			else
				validActions.add("PrivateCall");

			if (!getCallbackActive())
			{
				if (localConferenced)
				{
					validActions.add("ClearConference");

				} else {

					validActions.add("ConferenceCall");
				}
			}

			validActions.add("SendDigit");
			validActions.add("ClearCall");



			if (getCallbackAvailable() && "N".equals(getPrivacy()))
			{
		    	validActions.add("AddThirdParty");
		    	validActions.add("RemoveThirdParty");

		    	if (getVoiceDropActive())
		    	{
					validActions.add("StartVoiceDrop");
					validActions.add("StopVoiceDrop");
				}
			}
		}

    }

    @Override protected void setCallDeliveredActions()
    {
		validActions.add("ClearConnection");
		validActions.add("HoldCall");

		if (!platformIntercom)
		{
			if("Y".equals(getPrivacy()))
				validActions.add("PublicCall");
			else
				validActions.add("PrivateCall");

			if (!getCallbackActive())
			{
				if (localConferenced)
				{
					validActions.add("ClearConference");

				} else {

					validActions.add("ConferenceCall");
				}
			}

			validActions.add("SendDigit");
			validActions.add("ClearCall");
		}

    }

    @Override protected void setCallBusyActions()
    {
		if("N".equals(getPrivacy()))
		{
			if (delivered && "Outgoing".equals(direction) || "Incoming".equals(direction))
			{
				validActions.add("JoinCall");

				if (getCallbackAvailable())
				{
					validActions.add("AddThirdParty");
					validActions.add("RemoveThirdParty");
				}
			}
		}
    }

    @Override protected void setCallHeldActions()
    {
		validActions.add("RetrieveCall");
    }


    @Override protected void setCallHeldElsewhereActions()
    {
		if("N".equals(getPrivacy()))
		{
			validActions.add("RetrieveCall");
		}
    }

    @Override protected void setCallConferencedActions()
    {
		if (localConferenced  && !getCallbackActive())
		{
			validActions.add("ClearConference");
			validActions.add("ClearCall");

		} else {

			validActions.add("ClearConnection");
			validActions.add("ClearCall");

			if (getCallbackAvailable())
			{
		    	validActions.add("AddThirdParty");
		    	validActions.add("RemoveThirdParty");
			}
		}

    }

    @Override protected void setCallTransferringActions()
    {
		validActions.add("ClearConnection");
		validActions.add("HoldCall");
        validActions.add("ConsultationCall");
	}

    @Override protected void setCallTransferredActions()
    {
		setCallTransferringActions();

		//if(transferFlag)	// consulatative transfer
		//{
			validActions.add("TransferCall");
		//}

	}
}