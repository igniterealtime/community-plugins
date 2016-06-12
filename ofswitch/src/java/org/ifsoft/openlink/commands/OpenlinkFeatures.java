package org.ifsoft.openlink.commands;


import java.util.List;

public class OpenlinkFeatures {
	public List<String> featuresSet;

	public String MicrophoneGain;

	public String CallForwardInterest;

	public String CallForwardDestintion;

	public List<String> getFeaturesSet() {
		return featuresSet;
	}

	public void setFeaturesSet(List<String> featuresSet) {
		this.featuresSet = featuresSet;
	}

	public String getMicrophoneGain() {
		return MicrophoneGain;
	}

	public void setMicrophoneGain(String microphoneGain) {
		MicrophoneGain = microphoneGain;
	}

	public String getCallForwardInterest() {
		return CallForwardInterest;
	}

	public void setCallForwardInterest(String callForwardInterest) {
		CallForwardInterest = callForwardInterest;
	}

	public String getCallForwardDestintion() {
		return CallForwardDestintion;
	}

	public void setCallForwardDestintion(String callForwardDestintion) {
		CallForwardDestintion = callForwardDestintion;
	}


}
