package org.ifsoft.openlink.component;

import java.util.Map;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Collection;
import java.io.*;

public class OpenlinkInterest extends AbstractInterest  {

	private String interestId 				= "" + System.currentTimeMillis();
	private String interestType 			= "";
	private String interestValue			= "";
	private String callset 					= null;
	private String interestLabel			= "";
	private String siteName					= "";
	private String defaultInterest 			= "false";
	private Map<String, OpenlinkUserInterest> traderLyncUserInterests = new HashMap();


	//-------------------------------------------------------
	//
	//
	//
	//-------------------------------------------------------

	public OpenlinkInterest(String interestId) {
		this.interestId = interestId;
	}

	public String getDefault() {
		return defaultInterest;
	}

	public void setDefault(String defaultInterest) {
		this.defaultInterest = defaultInterest;
	}

	public String getInterestId() {
		return interestId;
	}

	public String getInterestType() {
		return interestType;
	}

	public void setInterestType(String interestType) {
		this.interestType = interestType;
	}

	public String getInterestLabel() {
		return interestLabel;
	}

	public void setInterestLabel(String interestLabel) {
		this.interestLabel = interestLabel;
	}

	public String getInterestValue() {
		return interestValue;
	}

	public void setInterestValue(String interestValue) {
		this.interestValue = interestValue;
	}

	public String getCallset() {
		return callset;
	}

	public void setCallset(String callset) {
		this.callset = callset;
	}

	public String getSiteName() {
		return siteName;
	}

	public void setSiteName(String siteName) {
		this.siteName = siteName;
	}

	public OpenlinkUserInterest addUserInterest(OpenlinkUser traderLyncUser, String defaultInterest)
	{
		OpenlinkUserInterest traderLyncUserInterest = null;

		if (!traderLyncUserInterests.containsKey(traderLyncUser.getUserNo()))
		{
			traderLyncUserInterest = new OpenlinkUserInterest();
			traderLyncUserInterest.setUser(traderLyncUser);
			traderLyncUserInterest.setInterest(this);
			traderLyncUserInterest.setDefault(defaultInterest);

			this.traderLyncUserInterests.put(traderLyncUser.getUserNo(), traderLyncUserInterest);

		} else {

			traderLyncUserInterest = traderLyncUserInterests.get(traderLyncUser.getUserNo());
		}

		return traderLyncUserInterest;
	}

	public Map<String, OpenlinkUserInterest> getUserInterests()
	{
		return traderLyncUserInterests;
	}

	public void setInterests(Map<String, OpenlinkUserInterest> traderLyncUserInterests)
	{
		this.traderLyncUserInterests = traderLyncUserInterests;
	}
}
