package org.ifsoft.openlink.component;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;

import org.jivesoftware.util.Log;
import org.jivesoftware.openfire.XMPPServer;
import org.jivesoftware.util.JiveGlobals;
import org.jivesoftware.openfire.SessionManager;
import org.jivesoftware.openfire.session.LocalClientSession;
import org.jivesoftware.openfire.session.Session;

import org.ifsoft.openlink.*;

import org.xmpp.packet.JID;


public class OpenlinkUser extends AbstractUser implements OpenlinkConstants, Comparable
{
	private String userType = "Openlink";
	private boolean enabled = true;
	private boolean intercom = false;
	private boolean autoPrivate = false;
	private boolean autoHold = true;
	private String userName;
	private String userId;
	private String userNo;
	private String deviceNo = "0.0.0.0";
	private String handsetNo = "1";
	private String handsetCallId = null;
	private int handsets = 1;
	private long   siteID;
	private String siteName;
	private String personalDDI = null;
	private String callset = null;
	private String defaultUser = "false";
	private OpenlinkInterest defaultInterest = null;
	private OpenlinkUserInterest waitingInterest = null;

	private List<OpenlinkGroup> traderLyncGroups 				= new ArrayList();

	private Map<String, OpenlinkInterest> traderLyncInterests = new HashMap<String, OpenlinkInterest>();
	public Map<String, String> traderLyncTrunks = new HashMap<String, String>();

	private String nextStepHandset = "1";
	private String nextStepDDI;
	private String nextStepCallSet;
	private String nextStepLine;
	private String nextStepSpeedial;
	private String nextStepPrivacy;
	private boolean nextStepAutoHold;
	private String nextStepAction = null;

	private String lastPrivacy = null;
	private String lastCallForward = "";
	private String lastCallForwardInterest = "";

	private OpenlinkCall currentHS1Call = null;
	private OpenlinkCall currentHS2Call = null;
	private OpenlinkCall currentICMCall = null;

	private String callback = null;
	private OpenlinkCallback phoneCallback = null;
	private boolean callbackActive = false;
	private String vscLine = null;

//-------------------------------------------------------
//
//
//
//-------------------------------------------------------



	public String getProfileName()
	{
		return getUserNo();
	}

	public boolean enabled()
	{
		return enabled;
	}

	public void setEnabled(boolean enabled)
	{
		this.enabled = enabled;
	}

	public boolean autoPrivate()
	{
		return autoPrivate;
	}

	public void setAutoPrivate(boolean autoPrivate)
	{
		this.autoPrivate = autoPrivate;
		this.lastPrivacy = autoPrivate ? "true" : "false";
	}

	public boolean autoHold()
	{
		return autoHold;
	}

	public void setAutoHold(boolean autoHold)
	{
		this.autoHold = autoHold;
	}

	public boolean intercom()
	{
		return intercom;
	}

	public void setIntercom(boolean intercom)
	{
		this.intercom = intercom;
	}

	public int getHandsets()
	{
		return handsets;
	}

	public void setHandsets(int handsets)
	{
		this.handsets = handsets;
	}

	public OpenlinkUserInterest getWaitingInterest()
	{
		return waitingInterest;
	}

	public void setWaitingInterest(OpenlinkUserInterest waitingInterest)
	{
		this.waitingInterest = waitingInterest;
	}

	public String getLastPrivacy() {
		return lastPrivacy;
	}

	public void setLastPrivacy(String lastPrivacy)
	{
		this.lastPrivacy = lastPrivacy;
		this.autoPrivate = "true".equals(lastPrivacy);
	}

	public OpenlinkCall getCurrentHS1Call() {
		return currentHS1Call;
	}

	public void setCurrentHS1Call(OpenlinkCall currentHS1Call)
	{
		this.currentHS1Call = currentHS1Call;
	}

	public OpenlinkCall getCurrentHS2Call() {
		return currentHS2Call;
	}

	public void setCurrentHS2Call(OpenlinkCall currentHS2Call)
	{
		this.currentHS2Call = currentHS2Call;
	}

	public OpenlinkCall getCurrentICMCall() {
		return currentICMCall;
	}

	public void setCurrentICMCall(OpenlinkCall currentICMCall)
	{
		this.currentICMCall = currentICMCall;
	}

	public String getLastCallForward()
	{
		return lastCallForward;
	}

	public void setLastCallForward(String lastCallForward)
	{
		this.lastCallForward = lastCallForward;
	}

	public String getLastCallForwardInterest()
	{
		return lastCallForwardInterest;
	}

	public void setLastCallForwardInterest(String lastCallForwardInterest)
	{
		this.lastCallForwardInterest = lastCallForwardInterest;
	}

	public String getUserName()
	{
		return userName;
	}

	public void setUserName(String userName)
	{
		this.userName = userName;
	}

	public String getUserType()
	{
		return userType;
	}

	public void setUserType(String userType)
	{
		this.userType = userType;
	}

	public String getVSCLine()
	{
		return vscLine;
	}

	public void setVSCLine(String vscLine)
	{
		this.vscLine = vscLine;
	}

	public String getCallset()
	{
		return callset;
	}

	public void setCallset(String callset)
	{
		this.callset = callset;
	}

	public String getDefault()
	{
		return defaultUser;
	}

	public void setDefault(String defaultUser)
	{
		this.defaultUser = defaultUser;
	}

	public OpenlinkInterest getDefaultInterest()
	{
		return defaultInterest;
	}

	public void setDefaultInterest(OpenlinkInterest defaultInterest)
	{
		this.defaultInterest = defaultInterest;
	}

	public String getPersonalDDI()
	{
		return personalDDI;
	}

	public void setPersonalDDI(String personalDDI)
	{
		this.personalDDI = personalDDI;
	}

	public String getUserId()
	{
		return userId;
	}

	public void setUserId(String userId)
	{
		this.userId = userId;
	}

	public String getUserNo()
	{
		return userNo;
	}

	public void setUserNo(String userNo) {
		this.userNo = userNo;
	}

	public void setDeviceNo(String device)
	{
		if (getPhoneCallback() == null)
		{
				setPhoneCallback(new OpenlinkCallback());
		}

		getPhoneCallback().setVirtualDeviceId(device);
	}

	public String getDeviceNo()
	{
		if (getPhoneCallback() != null)
			return getPhoneCallback().getVirtualDeviceId();
		else {

			try {
				Session session = (LocalClientSession) XMPPServer.getInstance().getSessionManager().getSession(new JID(getProfileName() + "@" + OpenlinkComponent.self.getDomain() + "/traderlync"));

				if (session == null)
					return "0.0.0.0";
				else
					return session.getHostAddress();
			}

			catch (Exception e) {

				return "0.0.0.0";
			}
		}
	}

	public String getCallback() {
		return callback;
	}

	public void setCallback(String callback)
	{
		this.callback = callback;
	}

	public OpenlinkCallback getPhoneCallback()
	{
		return phoneCallback;
	}

	public void setPhoneCallback(OpenlinkCallback phoneCallback)
	{
		this.phoneCallback = phoneCallback;
	}

	public void setCallbackActive(boolean callbackActive)
	{
		this.callbackActive = callbackActive;
	}

	public boolean getCallbackActive()
	{
		return callbackActive;
	}


	public boolean callbackAvailable(OpenlinkComponent component)
	{
		if (getPhoneCallback() != null)
		{
			if (!getCallbackActive())
			{
				//component.traderLyncLinkService.activateCallback(getPhoneCallback());
			}

			return true;

		} else return false;
	}

//-------------------------------------------------------
//
//
//
//-------------------------------------------------------


	public void processConnectedNextSteps(OpenlinkComponent component, String line, String turretNo, String handset)
	{
		Log.debug("OpenlinkUser - processConnectedNextSteps " + nextStepAction + " " + turretNo + " " + handset);

		if (nextStepAction != null && turretNo.equals(getDeviceNo()) && handset.equals(nextStepHandset))
		{
			if ("speedDial".equals(nextStepAction))
			{
				Log.debug("processConnectedNextSteps " + nextStepAction + " " + nextStepSpeedial + " " + nextStepHandset+ " " + line);

				//component.traderLyncLinkService.dialDigits(line, nextStepSpeedial);

				if (nextStepPrivacy != null && "true".equals(nextStepPrivacy))
				{
					try {
						Thread.sleep(500);
					} catch (Exception e) { }

					//component.traderLyncLinkService.privateCall(turretNo, handset, "true".equals(nextStepPrivacy) ? "Y" : "N");
				}

				resetNextSteps();

			} else if ("privacy".equals(nextStepAction)) {

				if (nextStepPrivacy != null && "true".equals(nextStepPrivacy))
				{
					//component.traderLyncLinkService.privateCall(turretNo, handset, "true".equals(nextStepPrivacy) ? "Y" : "N");
				}

				resetNextSteps();
			}

		}
	}

	public void resetNextSteps()
	{
		nextStepAction 	= null;
	}

	public boolean nextStepsDone()
	{
		return nextStepAction == null;
	}

	public void processConsoleNextSteps(OpenlinkComponent component)
	{
		if (nextStepAction != null && !"0.0.0.0".equals(getDeviceNo()))
		{
			if ("selectDDI".equals(nextStepAction))
			{
				//checkAndHoldActiveCall(component, nextStepHandset, nextStepAutoHold);
				//component.traderLyncLinkService.selectDDI(nextStepDDI, getDeviceNo(), nextStepHandset);

				if (nextStepSpeedial != null)
				{
					nextStepAction = "speedDial";
				}

			} else if ("selectCallset".equals(nextStepAction)) {

				//checkAndHoldActiveCall(component, nextStepHandset, nextStepAutoHold);
				//component.traderLyncLinkService.selectCallset(nextStepCallSet, getDeviceNo(), nextStepHandset);

				if (nextStepSpeedial != null)
				{
					nextStepAction = "speedDial";
				}

			} else if ("selectLine".equals(nextStepAction)) {

				//checkAndHoldActiveCall(component, nextStepHandset, nextStepAutoHold);
				//component.traderLyncLinkService.selectLine(nextStepLine, getDeviceNo(), nextStepHandset);
				nextStepAction = "privacy";

			}
		}
	}

	public String getHandsetNo() {
		return handsetNo;
	}

	public void setHandsetNo(String handsetNo) {
		this.handsetNo = handsetNo;
	}

	public String getHandsetCallId() {
		return handsetCallId;
	}

	public void setHandsetCallId(String handsetCallId) {
		this.handsetCallId = handsetCallId;
	}


	public String getCurretHandsetNo()
	{
		if (nextStepHandset == null)
			return handsetNo;
		else
			return nextStepHandset;
	}


	public long getSiteID() {
		return siteID;
	}

	public void setSiteID(long siteID) {
		this.siteID = siteID;
	}

	public String getSiteName() {
		return siteName;
	}

	public void setSiteName(String siteName) {
		this.siteName = siteName;
	}

	public List<OpenlinkGroup> getGroups() {
		return traderLyncGroups;
	}

	public void setGroups(List<OpenlinkGroup> traderLyncGroups) {
		this.traderLyncGroups = traderLyncGroups;
	}

	public Map<String, OpenlinkInterest> getInterests() {
		return traderLyncInterests;
	}

	public void addInterest(OpenlinkInterest traderLyncInterest)
	{
		if (!traderLyncInterests.containsKey(traderLyncInterest.getInterestId()))
		{
			this.traderLyncInterests.put(traderLyncInterest.getInterestId(), traderLyncInterest);
		}
	}

//-------------------------------------------------------
//
//
//
//-------------------------------------------------------


	public void selectLine(OpenlinkComponent component, String line, String handset, String privacy, String hold)
	{
		try {
			nextStepPrivacy = privacy == null ? getLastPrivacy() : privacy;
			nextStepAutoHold = hold == null ? autoHold() : "true".equals(hold);

			if (callbackAvailable(component))
			{
				nextStepHandset = getPhoneCallback().getLocalHandset();

			} else {

				handset = handset == null ? getHandsetNo() : handset;
				nextStepHandset = handset;
			}

			if ("0.0.0.0".equals(getDeviceNo()))
			{
				nextStepLine = line;
				nextStepAction = "selectLine";

				//component.traderLyncLinkService.getUserConsole(getUserNo());

			} else {
				nextStepAction = "privacy";
				//checkAndHoldActiveCall(component, handset, nextStepAutoHold);
				//component.traderLyncLinkService.selectLine(line, getDeviceNo(), nextStepHandset);
			}

		}
		catch(Exception e) {
			Log.error("OpenlinkUser - selectDDI error: " + e.toString());
		}
	}

	public void selectDDI(OpenlinkComponent component, String ddi, String handset, String privacy, String hold, String dialDigtraderLync)
	{
		Log.debug("OpenlinkUser - selectDDI " + ddi + " " + dialDigtraderLync + " " + handset + " " + privacy);

		try {
			nextStepPrivacy = privacy == null ? getLastPrivacy() : privacy;
			nextStepAutoHold = hold == null ? autoHold() : "true".equals(hold);

			if (callbackAvailable(component))
			{
				nextStepHandset = getPhoneCallback().getLocalHandset();

			} else {

				handset = handset == null ? getHandsetNo() : handset;
				nextStepHandset = handset;
			}

			if ("0.0.0.0".equals(getDeviceNo()))
			{
				nextStepDDI = ddi;
				nextStepCallSet = null;
				nextStepSpeedial = dialDigtraderLync;
				nextStepAction = "selectDDI";

				//component.traderLyncLinkService.getUserConsole(getUserNo());

			} else {

				if (dialDigtraderLync == null || "".equals(dialDigtraderLync))
				{
					nextStepAction = "privacy";

				} else {

					nextStepSpeedial = dialDigtraderLync;
					nextStepAction = "speedDial";
				}
				//checkAndHoldActiveCall(component, handset, nextStepAutoHold);
				//component.traderLyncLinkService.selectDDI(ddi, getDeviceNo(), nextStepHandset);
			}

		}
		catch(Exception e) {
			Log.error("OpenlinkUser - selectDDI error: " + e.toString());
		}
	}


    public int compareTo(Object object)
    {
        if (object instanceof OpenlinkUser) {
            return getUserId().compareTo(((OpenlinkUser)object).getUserId());
        }
        return getClass().getName().compareTo(object.getClass().getName());
    }

}
