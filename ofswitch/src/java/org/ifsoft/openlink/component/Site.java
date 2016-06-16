package org.ifsoft.openlink.component;

import org.jivesoftware.database.JiveID;

@JiveID(200)
public class Site {

	private long   siteID;
	private String name;
	private String privateHost;
	private String publicHost;
	private String defaultProxy;
	private String defaultExten;


	public long getSiteID() {
		return siteID;
	}
	public void setSiteID(long siteID) {
		this.siteID = siteID;
	}

	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}

	public String getPrivateHost() {
		return privateHost;
	}
	public void setPrivateHost(String privateHost) {
		this.privateHost = privateHost;
	}

	public String getDefaultProxy() {
		return defaultProxy;
	}
	public void setDefaultProxy(String defaultProxy) {
		this.defaultProxy = defaultProxy;
	}

	public String getDefaultExten() {
		return defaultExten;
	}
	public void setDefaultExten(String defaultExten) {
		this.defaultExten = defaultExten;
	}

	public String getPublicHost() {
		return publicHost;
	}
	public void setPublicHost(String publicHost) {
		this.publicHost = publicHost;
	}
}
