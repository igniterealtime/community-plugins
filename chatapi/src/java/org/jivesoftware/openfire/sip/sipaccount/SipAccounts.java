package org.jivesoftware.openfire.sip.sipaccount;

import java.util.List;
import java.util.Collection;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;

/**
 * The Class SipAccounts.
 */
@XmlRootElement(name = "accounts")
public class SipAccounts {

	/** The accounts. */
	Collection<SipAccount> accounts;

	/**
	 * Instantiates a new account entities.
	 */
	public SipAccounts() {

	}

	/**
	 * Instantiates a new account entities.
	 *
	 * @param accounts
	 *            the accounts
	 */
	public SipAccounts(Collection<SipAccount> accounts) {
		this.accounts = accounts;
	}

	/**
	 * Gets the accounts.
	 *
	 * @return the accounts
	 */
	@XmlElement(name = "account")
	public Collection<SipAccount> getAccounts() {
		return accounts;
	}

	/**
	 * Sets the accounts.
	 *
	 * @param accounts
	 *            the new accounts
	 */
	public void setAccounts(Collection<SipAccount> accounts) {
		this.accounts = accounts;
	}

}
