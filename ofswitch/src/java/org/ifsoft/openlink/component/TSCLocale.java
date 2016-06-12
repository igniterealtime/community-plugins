package org.ifsoft.openlink.component;

import java.util.Locale;

class TSCLocale
{
	private Locale innerLocale = null;
	private String displayName = "";

	public TSCLocale(Locale locale)
	{
		innerLocale = locale;
		setDisplayCountry(locale.getDisplayCountry());
	}

	/**
	 * @return the locally stored display name
	 */
	public String getDisplayCountry()
	{
		return displayName;
	}

	/**
	 * @return the country code from the internally stored Locale
	 */
	public String getCountry()
	{
		return innerLocale.getCountry() ;
	}
	/**
	 * @return the internally store Locale
	 */
	public Locale getLocale()
	{
		return innerLocale;
	}
	/**
	 * @param name the String representing the Country Name to be stored locally here
	 *
	 */
	public void setDisplayCountry(String name)
	{
		displayName = name;
	}
}



