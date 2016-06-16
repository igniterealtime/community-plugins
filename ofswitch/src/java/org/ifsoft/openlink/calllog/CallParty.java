package org.ifsoft.openlink.calllog;

/**
 *
 */
public class CallParty {

	private String name = null;
	private String number = null;

	public CallParty(String name, String number) {
		this.name = name;
		this.number = number;
	}

	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public String getNumber() {
		return number;
	}
	public void setNumber(String number) {
		this.number = number;
	}

}
