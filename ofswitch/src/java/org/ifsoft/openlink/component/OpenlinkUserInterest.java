package org.ifsoft.openlink.component;

import java.io.Serializable;
import java.util.*;
import org.xmpp.packet.JID;
import org.jivesoftware.util.Log;

import org.ifsoft.openlink.calllog.*;

public class OpenlinkUserInterest extends AbstractUserInterest
{

    private OpenlinkUser traderLyncUser;
    private OpenlinkInterest traderLyncInterest;
    private String defaultInterest;
	private String callFWD = "false";
	private String callFWDDigits = "";
    private Map<String, OpenlinkCall> traderLyncCalls;
	private Map<String, OpenlinkSubscriber> traderLyncSubscribers;
	private int maxNumCalls = 0;

    public OpenlinkUserInterest()
    {
        defaultInterest = "false";
        traderLyncCalls = Collections.synchronizedMap( new HashMap<String, OpenlinkCall>());
        traderLyncSubscribers = Collections.synchronizedMap( new HashMap<String, OpenlinkSubscriber>());
    }

	public String getInterestName() {
		return traderLyncInterest.getInterestId() + traderLyncUser.getUserNo();
	}

    public void handleCallInfo(String sCallNo, String sOpenlinkLineNo, String sOpenlinkLineName, String sNewLineState, String speakerCount, String handsetCount, String direction, String sPrivacyOn, String sRealDDI, String lineType, String sELC)
    {
        OpenlinkCall traderLyncCall = createCallById(sCallNo);
        traderLyncCall.start();
        traderLyncCall.line = sOpenlinkLineNo;
        traderLyncCall.label = sOpenlinkLineName;
		traderLyncCall.console = getUser().getDeviceNo();
		traderLyncCall.handset = getUser().getHandsetNo();
		traderLyncCall.direction = "I".equals(direction) ? "Incoming" : "Outgoing";
		traderLyncCall.setPrivacy(sPrivacyOn);

		if ("I".equals(sNewLineState))
		{
			traderLyncCall.setState("ConnectionCleared");
		}

		if ("R".equals(sNewLineState))
		{
			traderLyncCall.setState("CallDelivered");
        	traderLyncCall.direction = "Incoming";
		}

		if ("C".equals(sNewLineState) || "A".equals(sNewLineState))
		{
			traderLyncCall.setState("CallEstablished");
		}

		if ("H".equals(sNewLineState))
		{
			traderLyncCall.setState("CallHeld");
		}

		if ("F".equals(sNewLineState))
		{
			traderLyncCall.setState("CallConferenced");
		}

		traderLyncCall.setValidActions();
	}

    public void handleCallELC(String sCallNo, String sOpenlinkLineNo, String sOpenlinkLineName, String sOpenlinkConsoleNo, String sOpenlinkUserNo, String sHandsetNo, String sELC, String sConnectOrDisconnect)
    {
        OpenlinkCall traderLyncCall = createCallById(sCallNo);
        traderLyncCall.line = sOpenlinkLineNo;

		Log.info("handleCallELC " + traderLyncCall.callid + " "  + sConnectOrDisconnect);

        if("C".equals(sConnectOrDisconnect))
        {
            traderLyncCall.localConferenced = true;
        	traderLyncCall.setState("CallConferenced");

        } else {
            traderLyncCall.localConferenced = false;
 			traderLyncCall.setState("CallEstablished");
		}

		traderLyncCall.setValidActions();

    }

    public void handleBusyLine(String sCallNo, String sOpenlinkLineNo, String sOpenlinkLineName, String sOpenlinkConsoleNo, String sOpenlinkUserNo, String sOldLineState, String sNewLineState,
            String sHandsetOrSpeaker, String sSpeakerNo, String sHandsetNo, String sConnectOrDisconnect)
	{

    }

    public void handleConnectionCleared(String sCallNo)
    {
        OpenlinkCall traderLyncCall = createCallById(sCallNo);
        traderLyncCall.setState("ConnectionCleared");
        traderLyncCall.setValidActions();
        traderLyncCall.participation = "Inactive";
        traderLyncCall.endDuration();

        traderLyncCall.clear();

        getUser().setIntercom(false);
/*
        if ("1".equals(sHandsetNo))
        	getUser().setCurrentHS1Call(null);

 		else if ("2".equals(sHandsetNo))
        	getUser().setCurrentHS2Call(null);

 		else if ("65".equals(sSpeakerNo))
	        getUser().setCurrentICMCall(null);
*/
    }

    public void handleCallOutgoing(String state, String sCallNo, String sCLI, String sOpenlinkLabel)
    {
        OpenlinkCall traderLyncCall = createCallById(sCallNo);
		traderLyncCall.setCLI(sCLI);
		traderLyncCall.setCLILabel(sCLI);
        traderLyncCall.label = sOpenlinkLabel;
        traderLyncCall.direction = "Outgoing";
        traderLyncCall.connectState = state;
        traderLyncCall.setState(state);
		traderLyncCall.setValidActions();
        traderLyncCall.participation = "Active";
    }

    public void handleCallIncoming(String sCallNo, String from, String to)
    {
        OpenlinkCall traderLyncCall = createCallById(sCallNo);
        traderLyncCall.start();
        traderLyncCall.line = sCallNo;

        traderLyncCall.ddi = to;
        traderLyncCall.ddiLabel = to;
		traderLyncCall.setCLI(from);
		traderLyncCall.setCLILabel(from);

        traderLyncCall.label = getInterest().getInterestLabel();
        traderLyncCall.direction = "Incoming";
        traderLyncCall.connectState = "CallEstablished";
        traderLyncCall.setState("CallDelivered");
		traderLyncCall.setValidActions();
        traderLyncCall.participation = "Inactive";
    }

    public void handleCallConnected(String sCallNo)
    {
		Log.debug("setCurrentCall " + sCallNo);

        OpenlinkCall traderLyncCall = createCallById(sCallNo);
        traderLyncCall.start();
        traderLyncCall.label = getInterest().getInterestLabel();

		setCurrentCall(traderLyncCall);

        traderLyncCall.setState(traderLyncCall.connectState);
        traderLyncCall.setValidActions();
        traderLyncCall.startDuration();
        traderLyncCall.participation = "Active";
		traderLyncCall.startParticipation();
    }


    public void handleCallPrivate(String sCallNo, String sOpenlinkLineNo, String sOpenlinkConsoleNo, String sOpenlinkUserNo, String sHandsetNo, String sPrivacyOn)
    {
        OpenlinkCall traderLyncCall = getCallById(sCallNo);

        if (traderLyncCall != null)
        {
			traderLyncCall.setPrivacy(sPrivacyOn);
			traderLyncCall.setValidActions();
		}
    }


    public void handleCallPrivateElsewhere(String sCallNo, String sOpenlinkLineNo, String sOpenlinkConsoleNo, String sOpenlinkUserNo, String sHandsetNo, String sPrivacyOn)
    {
        OpenlinkCall traderLyncCall = getCallById(sCallNo);

        if (traderLyncCall != null)
        {
			traderLyncCall.setPrivacy(sPrivacyOn);
			traderLyncCall.setValidActions();
		}
    }


    public void handleCallAbandoned(String sCallNo)
    {
        OpenlinkCall traderLyncCall = getCallById(sCallNo);

        if (traderLyncCall != null)
        {
			traderLyncCall.setState("CallMissed");
			traderLyncCall.setValidActions();
			traderLyncCall.clear();
		}
    }

    public void handleCallConferenced(String sCallNo)
    {
        OpenlinkCall traderLyncCall = getCallById(sCallNo);

        if (traderLyncCall != null)
        {
			setCurrentCall(traderLyncCall);

			traderLyncCall.setState("CallConferenced");
			traderLyncCall.setValidActions();
			traderLyncCall.startDuration();
			traderLyncCall.participation = "Active";
			traderLyncCall.startParticipation();
		}
    }



	public OpenlinkCall getCurrentCall(String handset)
	{
		OpenlinkCall traderLyncCall = null;

		OpenlinkCall intercomCall = getUser().getCurrentICMCall();
		OpenlinkCall traderLyncCall1 = getUser().getCurrentHS1Call();
		OpenlinkCall traderLyncCall2 = getUser().getCurrentHS2Call();

		if ("1".equals(handset))
			traderLyncCall = traderLyncCall1;

		else if ("2".equals(handset))
			traderLyncCall = traderLyncCall2;

		else if ("0".equals(handset))
			traderLyncCall = intercomCall;

		else if ("3".equals(handset))
			traderLyncCall = traderLyncCall1;

        return traderLyncCall;
	}

	private void setCurrentCall(OpenlinkCall traderLyncCall)
	{
		Log.debug("setCurrentCall " + traderLyncCall.getCallID() + " " + traderLyncCall.handset + " " + traderLyncCall.speaker);

        traderLyncCall.console = getUser().getDeviceNo();

        if ("1".equals(traderLyncCall.handset))
        	getUser().setCurrentHS1Call(traderLyncCall);

        else if ("2".equals(traderLyncCall.handset))
        	getUser().setCurrentHS2Call(traderLyncCall);

        else if ("65".equals(traderLyncCall.speaker))
        	getUser().setCurrentICMCall(traderLyncCall);

        else if ("3".equals(traderLyncCall.handset))
        	getUser().setCurrentHS1Call(traderLyncCall);
	}

    public void handleCallBusy(String sCallNo)
    {
        OpenlinkCall traderLyncCall = getCallById(sCallNo);

        if (traderLyncCall != null)
        {
			traderLyncCall.start();
			traderLyncCall.setState("CallBusy");
			traderLyncCall.delivered = true;
			traderLyncCall.setValidActions();
			traderLyncCall.participation = "Inactive";
		}
    }


    public void handleCallFailed(String sCallNo, String sOpenlinkLineNo, String sOpenlinkLineName, String sOpenlinkConsoleNo, String sOpenlinkUserNo, String sOldLineState, String sNewLineState,
            String sHandsetOrSpeaker, String sSpeakerNo, String sHandsetNo, String sConnectOrDisconnect)
    {
        OpenlinkCall traderLyncCall = getCallById(sCallNo);

        if (traderLyncCall != null)
        {
			traderLyncCall.clear();

			traderLyncCall.line = sOpenlinkLineNo;
			traderLyncCall.label = sOpenlinkLineName;
			traderLyncCall.setState("CallFailed");
			traderLyncCall.setValidActions();
			traderLyncCall.participation = "Inactive";
		}
    }

    public void handleCallHeld(String sCallNo)
    {
        OpenlinkCall traderLyncCall = getCallById(sCallNo);

        if (traderLyncCall != null)
        {
			traderLyncCall.setState("CallHeld");
			traderLyncCall.setValidActions();
			traderLyncCall.participation = "Inactive";
			traderLyncCall.endDuration();
		}
    }

    public void handleTransfer(String sCallNo, String sOpenlinkLineNo, String sOpenlinkConsoleNo, String sOpenlinkUserNo, String sTransferUserNo)
    {
        OpenlinkCall traderLyncCall = getCallById(sCallNo);

        if (traderLyncCall != null)
        {
			traderLyncCall.traderLyncTransferFlag = true;
		}
    }

    public void handleIntercom(String sCallNo)
    {
        OpenlinkCall traderLyncCall = createCallById(sCallNo);
        traderLyncCall.platformIntercom = true;
        traderLyncCall.setState("CallEstablished");
        traderLyncCall.setValidActions();

        getUser().setIntercom(true);
    }

    public void handleCallProgress(String sCallNo, String sOpenlinkLineNo, String sChannelNo, String sOpenlinkFlag)
    {
        OpenlinkCall traderLyncCall = getCallById(sCallNo);

        if (traderLyncCall != null)
        {
			traderLyncCall.setCallProgress(sOpenlinkFlag);

			if ("Outgoing".equals(traderLyncCall.direction))
			{
				if("CallOriginated".equals(traderLyncCall.getState()))
				{
					if("0".equals(sOpenlinkFlag))
					{
						if("D".equals(getInterest().getInterestType()))
						{
							traderLyncCall.setState("CallDelivered");

						} else
							traderLyncCall.setState("CallEstablished");

					} else if("4".equals(sOpenlinkFlag) || "1".equals(sOpenlinkFlag)) {

						traderLyncCall.setState("CallEstablished");

					} else
						traderLyncCall.setState("CallFailed");
				} else

				if("CallDelivered".equals(traderLyncCall.getState()))
				{
					if("2".equals(sOpenlinkFlag))
					{
						traderLyncCall.setState("CallEstablished");

					} else if("4".equals(sOpenlinkFlag) || "1".equals(sOpenlinkFlag)) {

						traderLyncCall.setState("CallEstablished");

					} else
						traderLyncCall.setState("CallFailed");
				}

				traderLyncCall.setValidActions();
			}

			if("CallEstablished".equals(traderLyncCall.getState()))
			{
				traderLyncCall.startDuration();
			}
		}
    }

    public void handleCallProceeding(OpenlinkComponent component, String sCallNo, String sOpenlinkLineNo, String sDigits, String sEndFlag)
    {
        OpenlinkCall traderLyncCall = getCallById(sCallNo);

        if (traderLyncCall != null)
        {
			traderLyncCall.proceedingDigitsBuffer = (new StringBuilder()).append(traderLyncCall.proceedingDigitsBuffer).append(sDigits.trim()).toString();

			if("Y".equals(sEndFlag) && !"".equals(traderLyncCall.proceedingDigitsBuffer))
			{
				traderLyncCall.proceedingDigits = traderLyncCall.proceedingDigitsBuffer;
				traderLyncCall.proceedingDigitsBuffer = "";
				traderLyncCall.proceedingDigitsLabel = traderLyncCall.proceedingDigits;

				String cononicalNumber = traderLyncCall.proceedingDigits;

				try
				{
					cononicalNumber = component.formatCanonicalNumber(traderLyncCall.proceedingDigits);
				}
				catch(Exception e) { }

				//if(component.traderLyncLdapService.cliLookupTable.containsKey(cononicalNumber))
				//	traderLyncCall.proceedingDigitsLabel = (String)component.traderLyncLdapService.cliLookupTable.get(cononicalNumber);
			}
		}
    }


    public void handleCallMoved(String sCallNo, String sOpenlinkLineNo, String sOpenlinkLineNo2)
    {
        OpenlinkCall traderLyncCall = getCallById(sCallNo);

        if (traderLyncCall != null)
        {
        	traderLyncCall.line = sOpenlinkLineNo2;
		}
    }

    public void handleRecallTransfer(String sCallNo, String sOpenlinkLineNo, String sOpenlinkLineNo2, String transferStatusFlag)
    {
        OpenlinkCall traderLyncCall = getCallById(sCallNo);

        if (traderLyncCall != null)
        {
			if("0".equals(transferStatusFlag))
			{
				traderLyncCall.setState("CallTransferring");
				traderLyncCall.transferFlag = false;

			} else if("1".equals(transferStatusFlag)) {

				traderLyncCall.setState("CallEstablished");
				traderLyncCall.transferFlag = false;

				if (traderLyncCall.previousCalledNumber != null)
				{
					Iterator<OpenlinkUserInterest> it3 = getInterest().getUserInterests().values().iterator();

					while( it3.hasNext() )
					{
						OpenlinkUserInterest theUserInterest = (OpenlinkUserInterest)it3.next();
						OpenlinkCall theCall = theUserInterest.getCallByLine(traderLyncCall.getLine());

						if (theCall != null)
						{
							theCall.proceedingDigits = traderLyncCall.previousCalledNumber;
							theCall.proceedingDigitsLabel = traderLyncCall.previousCalledLabel;
						}
					}
				}

			} else if("2".equals(transferStatusFlag)) {

				traderLyncCall.setState("CallTransferred");

			}

			traderLyncCall.setValidActions();
		}
    }

    public String getDefault()
    {
        return defaultInterest;
    }

    public void setDefault(String defaultInterest)
    {
        this.defaultInterest = defaultInterest;
    }

    public OpenlinkUser getUser()
    {
        return traderLyncUser;
    }

    public void setUser(OpenlinkUser traderLyncUser)
    {
        this.traderLyncUser = traderLyncUser;
    }

    public Map<String, OpenlinkSubscriber> getSubscribers()
    {
        return traderLyncSubscribers;
    }

    public void setSubscribers(Map<String, OpenlinkSubscriber> traderLyncSubscribers)
    {
        this.traderLyncSubscribers = traderLyncSubscribers;
    }

    public boolean isSubscribed(JID subscriber)
    {
        return traderLyncSubscribers.containsKey(subscriber.getNode());
    }


    public OpenlinkSubscriber getSubscriber(JID subscriber)
    {
        OpenlinkSubscriber traderLyncSubscriber = null;

        if (traderLyncSubscribers.containsKey(subscriber.getNode()))
        {
            traderLyncSubscriber = (OpenlinkSubscriber)traderLyncSubscribers.get(subscriber.getNode());
        } else
        {
            traderLyncSubscriber = new OpenlinkSubscriber();
            traderLyncSubscriber.setJID(subscriber);
            traderLyncSubscribers.put(subscriber.getNode(), traderLyncSubscriber);
        }
        return traderLyncSubscriber;
    }

    public void removeSubscriber(JID subscriber)
    {
		traderLyncSubscribers.remove(subscriber.getNode());
	}

    public boolean canPublish(OpenlinkComponent component)
    {
		if (traderLyncSubscribers.size() == 0)
		{
			return false;
		}

		boolean anySubscriberOnline = false;

		Iterator<OpenlinkSubscriber> iter = traderLyncSubscribers.values().iterator();

		while( iter.hasNext() )
		{
			OpenlinkSubscriber subscriber = (OpenlinkSubscriber)iter.next();

			if (subscriber.getOnline() || component.isComponent(subscriber.getJID()))
			{
				anySubscriberOnline = true;
				break;
			}
		}

		return anySubscriberOnline;
    }

    public OpenlinkInterest getInterest()
    {
        return traderLyncInterest;
    }

    public void setInterest(OpenlinkInterest traderLyncInterest)
    {
        this.traderLyncInterest = traderLyncInterest;
    }


    public synchronized OpenlinkCall createCallById(String callID)
    {
		Log.debug("createCallById " + callID);

        OpenlinkCall traderLyncCall = null;

        if(traderLyncCalls.containsKey(callID))
        {
            traderLyncCall = (OpenlinkCall)traderLyncCalls.get(callID);

        } else {

            traderLyncCall = new OpenlinkCall();
            traderLyncCall.callid = callID;
            traderLyncCall.setOpenlinkUserInterest(this);

			if("D".equals(getInterest().getInterestType()))	// set default caller ID for directory numbers
			{
				traderLyncCall.ddi = getInterest().getInterestValue();
				traderLyncCall.ddiLabel = getInterest().getInterestLabel();
			}

            traderLyncCall.initialiseDuration();

            traderLyncCalls.put(callID, traderLyncCall);
        }
        return traderLyncCall;
    }


    public OpenlinkCall getCallById(String callID)
    {
        OpenlinkCall traderLyncCall = null;

        if(traderLyncCalls.containsKey(callID))
        {
            traderLyncCall = (OpenlinkCall)traderLyncCalls.get(callID);
		}
        return traderLyncCall;
	}

	public OpenlinkCall getCallByLine(String line)
	{
        OpenlinkCall lineCall = null;

		Iterator it2 = traderLyncCalls.values().iterator();

		while( it2.hasNext() )
		{
			OpenlinkCall traderLyncCall = (OpenlinkCall)it2.next();

			if (line.equals(traderLyncCall.line))
			{
				lineCall = traderLyncCall;
				break;
			}
		}

		return  lineCall;
	}

    public OpenlinkCall removeCallById(String callID)
    {
		OpenlinkCall traderLyncCall = null;

        if(traderLyncCalls.containsKey(callID))
        {
            traderLyncCall = (OpenlinkCall)traderLyncCalls.get(callID);
            traderLyncCalls.remove(callID);
        }

        return traderLyncCall;
	}

    public Map<String, OpenlinkCall> getCalls()
    {
        return traderLyncCalls;
    }


	public boolean isLineActive(String line)
	{
		OpenlinkCall traderLyncCall1 = getUser().getCurrentHS1Call();
		OpenlinkCall traderLyncCall2 = getUser().getCurrentHS2Call();

		boolean active = false;

		if (traderLyncCall1 != null && !"".equals(traderLyncCall1.line))
		{
			if (line.equals(String.valueOf(Long.parseLong(traderLyncCall1.line))))
				active = true;
		}

		if (traderLyncCall2 != null && !"".equals(traderLyncCall2.line))
		{
			if (line.equals(String.valueOf(Long.parseLong(traderLyncCall2.line))))
				active = true;
		}

		return active;
	}

	public boolean getHandsetBusyStatus()
	{
		OpenlinkCall traderLyncCall1 = getUser().getCurrentHS1Call();
		OpenlinkCall traderLyncCall2 = getUser().getCurrentHS2Call();

		if (traderLyncCall1 == null && traderLyncCall2 == null)
			return false;

		Iterator it2 = traderLyncCalls.values().iterator();
		boolean busy1 = false;
		boolean busy2 = false;

		while( it2.hasNext() )
		{
			OpenlinkCall traderLyncCall = (OpenlinkCall)it2.next();

			if (traderLyncCall1 != null && traderLyncCall.getCallID().equals(traderLyncCall1.getCallID()))
			{
				busy1 = true;
			}

			if (traderLyncCall2 != null && traderLyncCall.getCallID().equals(traderLyncCall2.getCallID()))
			{
				busy2 = true;
			}
		}

		return  busy1 && busy2;
	}

	public int getActiveCalls()
	{
		Iterator it2 = traderLyncCalls.values().iterator();
		int calls = 0;

		while( it2.hasNext() )
		{
			OpenlinkCall traderLyncCall = (OpenlinkCall)it2.next();

			if (! "ConnectionCleared".equals(traderLyncCall.getState()))
			{
				calls++;
			}
		}

		return calls;
	}

	public boolean getBusyStatus()
	{
		return (getActiveCalls() >= getMaxNumCalls());
	}

	public String getCallFWD() {
		return callFWD;
	}

	public void setCallFWD(String callFWD) {
		this.callFWD = callFWD;
	}

	public String getCallFWDDigits() {
		return callFWDDigits;
	}

	public void setCallFWDDigits(String callFWDDigits) {
		this.callFWDDigits = callFWDDigits;
	}

	public void setMaxNumCalls(int maxNumCalls) {
		this.maxNumCalls = maxNumCalls;
	}

	public int getMaxNumCalls() {
		return maxNumCalls;
	}

    public void logCall(OpenlinkCall traderLyncCall, String domain, long site)
    {
		String callId =  traderLyncCall.getCallID() + "-" + System.currentTimeMillis();
		String tscId = traderLyncCall.line;

		//if ("CallMissed".equals(traderLyncCall.getState()) || "CallEstablished".equals(traderLyncCall.getState()))
		//{
			Log.debug("writing call record " + callId + " " + traderLyncCall.getState());

			CallLogger.getLogger().logCall(tscId, callId, getUser().getProfileName(), getInterestName(), traderLyncCall.getState(), traderLyncCall.direction, traderLyncCall.creationTimeStamp, traderLyncCall.getDuration(), traderLyncCall.getCallerNumber(getInterest().getInterestType()), traderLyncCall.getCallerName(getInterest().getInterestType()), traderLyncCall.getCalledNumber(getInterest().getInterestType()), traderLyncCall.getCalledName(getInterest().getInterestType()));

			Iterator it3 = getInterest().getUserInterests().values().iterator();

			while( it3.hasNext() )
			{
				OpenlinkUserInterest traderLyncParticipant = (OpenlinkUserInterest)it3.next();

				OpenlinkCall participantCall = traderLyncParticipant.getCallByLine(traderLyncCall.getLine());

				if (participantCall != null)
				{
					Log.debug("writing call participant record " + callId + " " + traderLyncParticipant.getUser().getUserId());

					//if (("Active".equals(participantCall.firstParticipation) && "ConnectionCleared".equals(participantCall.getState())))
					//{
						CallLogger.getLogger().logParticipant(tscId, callId, traderLyncParticipant.getUser().getUserId() + "@" + traderLyncParticipant.getUser().getUserNo() + "." + domain, participantCall.direction, participantCall.firstParticipation, participantCall.firstTimeStamp, participantCall.getDuration());
					//}

					//if ("CallMissed".equals(participantCall.getState()))
					//{
					//	CallLogger.getLogger().logParticipant(tscId, callId, traderLyncParticipant.getUser().getUserId() + "@" + traderLyncParticipant.getUser().getUserNo() + "." + domain, participantCall.direction, participantCall.firstParticipation, participantCall.creationTimeStamp, participantCall.getRingDuration());
					//}

				}
			}
		//}
    }
}
