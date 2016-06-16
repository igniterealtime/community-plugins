package org.ifsoft.openlink.component;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Locale;
import java.util.MissingResourceException;
import java.util.PropertyResourceBundle;
import java.util.ResourceBundle;
import java.util.StringTokenizer;
import java.util.Vector;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.regex.PatternSyntaxException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class TelephoneNumberFormatter
{
	private static final Logger Log = LoggerFactory.getLogger(TelephoneNumberFormatter.class);

	private final static String nameSpaceBase = "traderlynk.";
	private final static String telephonyNameSpace = nameSpaceBase + "telephony.";

	private final static String telephonyCountryCode = telephonyNameSpace + "CountryCode";
	private final static String telephonyCountryName = telephonyNameSpace + "CountryName";
	private final static String telephonySameAreaRule = telephonyNameSpace + "SameAreaRule";
	private final static String telephonyLongDistanceRule = telephonyNameSpace + "LongDistanceRule";
	private final static String telephonyInternationalRule = telephonyNameSpace + "InternationalRule";
	private final static String telephonyAreaCodePrefix = telephonyNameSpace + "AreaCodePrefix";
	private final static String telephonyInternationalCarrierCode = telephonyNameSpace + "InternationalCarrierCode";
	private final static String telephonyLongDistanceCarrierCode = telephonyNameSpace + "LongDistanceCarrierCode";
	private final static String telephonyLongDistanceAccess = telephonyNameSpace + "LongDistanceAccess";
	private final static String telephonyOutsideAccess = telephonyNameSpace + "OutsideAccess";
	private final static String telephonyAreaCode = telephonyNameSpace + "AreaCode";
	private final static String telephonyExtensionNumberLength = telephonyNameSpace + "ExtensionNumberLength";
	private final static String telephonyExclusionPattern = telephonyNameSpace + "ExclusionPattern";
	private final static String telephonyCountryCodeList = telephonyNameSpace + "CountryCodeList";

	private TSCLocale myLocale ;
	private String CountryCode = null;
	private String CountryName = null;
	private String SameAreaRule  = null;
	private String LongDistanceRule = null;
	private String InternationalRule = null;

	//Location Specific Properties

	private String InternationalCarrierCode = null;
	private String LongDistanceCarrierCode = null;
	private String LongDistanceAccess = null;
	private String OutsideAccess = null;
	private String AreaCode = null;
	private String useIDDFormat = null;
	private Integer ExtensionNumberLength = null;
	private String AreaCodePrefix = null;
	private String internalRoutingPrefix = null;
	private String realAreaCode;
	private long phoneNumberLength;

	private String countryCodeList = null;

	private ResourceBundle myResources;

	private Pattern patCanonicalLocalAreaNumber ;
	private Pattern patCanonicalNationalNumber ;
	private Pattern patCanonicalInternationalNumber ;
	private Pattern patExtensionNumber ;
	private Pattern patDialableNumber ;
	private Pattern patInternationalNumber;
	private Pattern patNationalNumber;
	private Pattern patCanonicalWithBracketedZero;

	private static List countryCodes = null;
	static String[] AreaCodePrefixes = new String[1000];

	private boolean initialised = false;
	private boolean compiled = false;

	private String anyDialableRegex = "[0-9A-F*#]";
	private String nonZeroDialableRegex = "[1-9A-F*#]";
	private String anyDigitRegex = "[0-9]";
	private String nonZeroDigitRegex = "[1-9]";

	private String validRuleCharacters = "0123456789ABCD*#EFGLMNS,";
	private String ruleStringRegex = "[0-9A-DLMNS*#,]*(EFG|FG|G)";



	//	private Pattern[] DialableCountryCodePatterns = {};
	//	private Pattern[] CanonicalCountryCodePatterns = {};

	private String[] DialableCountryCodeStrings = {};
	private String[] CanonicalCountryCodeStrings = {};

	private List exclusionList = new Vector();
	private Pattern[] ExclusionPatterns = {};

	private static HashMap mapofLocales = null;
	private static String[] listofLocales = null;
	static TSCLocale locales[] = null;
	static String isoCountryCode[] = null;

	static {
		buildKnownLocales();
	}

	public TelephoneNumberFormatter(Locale locale)
	{
		myLocale = new TSCLocale(locale);

		Log.info(getLocaleDebugInfo() +  "TelephoneNumberFormatter - Constructor");
	}


	private static TSCLocale[] getAvailableLocales()
	{

		if (isoCountryCode == null)
		{
			ResourceBundle resource	= PropertyResourceBundle.getBundle("Telephony", new Locale("","GB")) ;
			String countryCodeList = resource.getString("CountryCodeList");
			isoCountryCode = countryCodeList.split(",");
		}

		if (locales == null)
		{
			locales = new TSCLocale[isoCountryCode.length];
			List cCodes = new ArrayList();
			int i;

			for (i = 0; i < isoCountryCode.length; i++) {
				Locale locale = new Locale("",isoCountryCode[i]);
				locales[i] = new TSCLocale(locale);
				ResourceBundle resource	= PropertyResourceBundle.getBundle("Telephony", locale);
				locales[i].setDisplayCountry(resource.getString("CountryName"));
				String code = removeNonDigits(resource.getString("CountryCode"));
				Integer countryCode = new Integer(code);

				if (cCodes.indexOf(countryCode) == -1) {
					cCodes.add(countryCode);
				}
				try {
					AreaCodePrefixes[countryCode.intValue()] = resource.getString("AreaCodePrefix");
				}
				catch(Exception e) {
					AreaCodePrefixes[countryCode.intValue()] = "0";
				}
			}
			countryCodes = new ArrayList(cCodes);
			Collections.reverse(countryCodes);

			int insertAt = 0;

			for (i=0;i<countryCodes.size(); i++) {
				if (((Integer)countryCodes.get(i)).intValue() % 10 == 0) {
					countryCodes.add(insertAt++,countryCodes.remove(i));
				}
			}
		}
		return locales;
	}

	public List getCountryCodes()
	{
		return countryCodes;
	}


	public static String[] getISOCountryCodes()
	{
		if (isoCountryCode == null) {
			getAvailableLocales();
		}
		return isoCountryCode;
	}

	private static void buildKnownLocales()
	{
		if (listofLocales == null)
		{
			mapofLocales = new HashMap();

			TSCLocale[] availableLocalesList = TelephoneNumberFormatter.getAvailableLocales() ;
			String[] localeStringList =  new String[availableLocalesList.length];
			int i;

			for (i=0; i<availableLocalesList.length; i++) {
				localeStringList[i] = availableLocalesList[i].getDisplayCountry();
				mapofLocales.put(localeStringList[i],availableLocalesList[i]);
			}
			Arrays.sort(localeStringList);
			listofLocales = localeStringList;
		}
	}

	public static Locale getLocalebyName(String name) throws TelephoneNumberFormatException
	{
		if (mapofLocales == null) {
			buildKnownLocales();
		}
		if (mapofLocales.containsKey( name)) {
			return ((TSCLocale)mapofLocales.get(name)).getLocale();
		} else{
            throw new TelephoneNumberFormatException("Unrecognised Country Name" );
		}
	}

	public static TSCLocale getMyriadLocalebyName(String name) throws TelephoneNumberFormatException
	{
		if (mapofLocales == null) {
			buildKnownLocales();
		}
		if (mapofLocales.containsKey( name)) {
			return ((TSCLocale)mapofLocales.get(name));
		} else {
            throw new TelephoneNumberFormatException("Unrecognised Country Name" );
		}
	}

	public static String[] getListofLocales()
	{
		if (mapofLocales == null) {
			buildKnownLocales();
		}
		return listofLocales;
	}

	private String getProperty(String telephonyPropertyName)
	{
	    String val = System.getProperty(telephonyPropertyName);
	    if (val != null) {
    		Log.info(getLocaleDebugInfo() +  "Setting " + telephonyPropertyName + " to '" + val + "'");
		}
		return val;
	}

	private void getSystemProperties() throws  TelephoneNumberFormatException
	{
	    if (CountryCode == null) CountryCode = getProperty( telephonyCountryCode);
	    if (CountryName  == null) CountryName = getProperty( telephonyCountryName);
	    if (SameAreaRule  == null) SameAreaRule = getProperty(telephonySameAreaRule);
	    if (LongDistanceRule  == null) LongDistanceRule = getProperty(telephonyLongDistanceRule);
	    if (InternationalRule  == null) InternationalRule = getProperty(telephonyInternationalRule);
	    if (AreaCodePrefix  == null) AreaCodePrefix = getProperty(telephonyAreaCodePrefix);
	    if (InternationalCarrierCode  == null) InternationalCarrierCode = getProperty(telephonyInternationalCarrierCode);
	    if (LongDistanceCarrierCode  == null) LongDistanceCarrierCode = getProperty(telephonyLongDistanceCarrierCode);
	    if (LongDistanceAccess  == null) LongDistanceAccess = getProperty(telephonyLongDistanceAccess);
	    if (OutsideAccess  == null) OutsideAccess = getProperty(telephonyOutsideAccess);
	    if (AreaCode  == null) AreaCode = getProperty(telephonyAreaCode);

	    if (ExtensionNumberLength == null) {
	    	String len = getProperty(telephonyExtensionNumberLength);
		    if (len != null) {
		    	try {
		            ExtensionNumberLength = new Integer(len);
		        } catch (Exception e) {
		            // ignore any conversion errors and set it back to null
			    	Log.error( getLocaleDebugInfo() + "Extension number length not set to " + len);
		            ExtensionNumberLength = null;
		        }
		    }
	    }

		if (System.getProperty(telephonyExclusionPattern) != null) {
	    	Log.info( getLocaleDebugInfo() + "Adding '" + System.getProperty(telephonyExclusionPattern) + "' to Exclusion Patterns");
	    	exclusionList.add( System.getProperty(telephonyExclusionPattern));
		}
	    String patternString = System.getProperty(telephonyExclusionPattern + "0");
	    int i;
	    for (i=1;patternString != null;i++) {
	    	Log.info( getLocaleDebugInfo() + "Adding '" + patternString + "' to Exclusion Patterns");
	    	exclusionList.add(patternString);
	    	patternString = System.getProperty(telephonyExclusionPattern +new Integer(i).toString());
		}
	}

	public void init() throws TelephoneNumberFormatException
	{
		String resource = null;
		try {
			Log.info(getLocaleDebugInfo() + "Setting Properties from 'System.Properties'");
			getSystemProperties();
			myResources	= PropertyResourceBundle.getBundle("Telephony",new Locale("",myLocale.getCountry())) ;
			Log.info(getLocaleDebugInfo() + "Setting Locale Specific Properties from file 'Telephony__" + myLocale.getCountry() + ".properties'");

			if (CountryCode == null) {
				resource = "CountryCode";
				CountryCode = myResources.getString(resource);
			}
			if (CountryName == null) {
				resource = "CountryName";
				CountryName = myResources.getString(resource);
			}
			if (SameAreaRule == null) {
				resource = "SameAreaRule";
				SameAreaRule = myResources.getString(resource);
			}
			if (LongDistanceRule == null) {
				resource = "LongDistanceRule";
				LongDistanceRule = myResources.getString(resource);
			}
			if (InternationalRule == null) {
				resource = "InternationalRule";
				InternationalRule = myResources.getString(resource);
			}
			if (AreaCodePrefix == null) {
				resource = "AreaCodePrefix";
				AreaCodePrefix = myResources.getString(resource);
			}
		} catch (MissingResourceException e) {
			Log.error(getLocaleDebugInfo() + "Missing resource '" + resource + "'",e);
            throw new TelephoneNumberFormatException("Missing resource '" + resource + "'",e);
		} catch (NullPointerException e) {
			Log.error(getLocaleDebugInfo() + "Unable to Load Locale " + myLocale.toString(),e);
            throw new TelephoneNumberFormatException("Unable to Load Locale " + myLocale.toString(),e);
		}
		try {
			Log.info(getLocaleDebugInfo() + "Setting Locale Specific Properties from file 'Telephony.properties'");

			if (InternationalCarrierCode == null) {
				resource = "InternationalCarrierCode";
				InternationalCarrierCode = myResources.getString(resource);
			}

			if (LongDistanceCarrierCode == null) {
				resource = "LongDistanceCarrierCode";
				LongDistanceCarrierCode = myResources.getString(resource);
			}

			if (LongDistanceAccess == null) {
				resource = "LongDistanceAccess";
				LongDistanceAccess = myResources.getString(resource);
			}

			if (OutsideAccess == null) {
				resource = "OutsideAccess";
				OutsideAccess = myResources.getString(resource);
			}

			if (AreaCode == null) {
				resource = "AreaCode";
				AreaCode = myResources.getString(resource);
			}

			if (ExtensionNumberLength == null) {
				resource = "ExtensionNumberLength";
				ExtensionNumberLength = new Integer(myResources.getString(resource));
			}

			if (AreaCodePrefix == null) {
				resource = "AreaCodePrefix";
				AreaCodePrefix = myResources.getString(resource);
			}
		}
		catch (MissingResourceException e) {
			//	This is not an error because these properties may be set by method calls
			Log.info(getLocaleDebugInfo() + "Missing resource '" + resource + "' from Telephony.properties");
		}

		try {
			initCountryCodes();
		} catch (IOException e) {
			Log.error(getLocaleDebugInfo() + "Unable to Load County Codes from CountryCodeList.properties",e);
            throw new TelephoneNumberFormatException("Unable to Load County Codes from CountryCodeList.properties" ,e);
		}

		// check LongDistanceRule and AreaCode for consistancy

		initialised = true;

		if (LongDistanceRule.equals("") && !AreaCode.equals("")) {
		    Log.error(getLocaleDebugInfo() + "Unexpected Trunk Code '" + AreaCode + "' supplied with Long Distance Rule set to '" + LongDistanceRule + "'");
			initialised = false;
            throw new TelephoneNumberFormatException("Unexpected Trunk Code '" + AreaCode + "' supplied with Long Distance Rule set to '" + LongDistanceRule + "'");
		}

		if (!LongDistanceRule.equals( "") && AreaCode.equals("")) {
		    Log.error(getLocaleDebugInfo() + "Trunk Code must be supplied with Long Distance Rule set to '" + LongDistanceRule + "'");
			initialised = false;
            throw new TelephoneNumberFormatException("Trunk Code must be supplied with Long Distance Rule set to '" + LongDistanceRule + "'");
		}

		if (initialised)
		    initPatterns();
	}

	public boolean isAreaCodeRequired() throws TelephoneNumberFormatException
	{
	    boolean ret = false;
	    if (LongDistanceRule != null)
	        ret = !LongDistanceRule.equals("");
	    else {
	        // Need to get the LongDistanceRule as it will be in init...
	        // this needs to be kept in step with init....

	        // Try properties...
	        String ldr = getProperty(telephonyLongDistanceRule);
	        if (ldr == null) {
	            // Try resources...
		        try {
		            if (myResources == null)
		                myResources	= PropertyResourceBundle.getBundle("Telephony",new Locale("",myLocale.getCountry() )) ;
                    ldr = myResources.getString("LongDistanceRule");
                } catch (MissingResourceException e) {
                    throw new TelephoneNumberFormatException("Cannot determine LongDistanceRule setting", e);
                }
	        }
	        ret = !ldr.equals("");
	    }
	    return ret;
	}

	private void initCountryCodes()	throws IOException , TelephoneNumberFormatException
	{
		if (countryCodes == null) {
			getAvailableLocales();
		}
		setCountryCodeList(countryCodes);
	}

	private void initPatterns() throws TelephoneNumberFormatException
	{

		if (!initialised){
			//	Cant compile patterns until all properties are set
			Log.info(getLocaleDebugInfo() + "Unable to Compile patterns until all properties are set");
		} else {
			try {
				//	Now Compile all the patterns
				Log.info(getLocaleDebugInfo() + "All properties now set, Compiling patterns");
				compilePatterns();
		        compiled = true;
			} catch (PatternSyntaxException e) {
				Log.error(getLocaleDebugInfo() + "Unable to Compile all patterns Syntax Error",e);
				throw new TelephoneNumberFormatException("Unable to Compile all patterns Syntax Error",e);
			} catch (NumberFormatException e) {
				Log.error(getLocaleDebugInfo() + "Unable to Compile all patterns Syntax Error",e);
				throw new TelephoneNumberFormatException("Unable to Compile all patterns Syntax Error",e);
			} catch (IOException e) {
				Log.error(getLocaleDebugInfo() + "Unable to Compile all patterns IO Error",e);
				throw new TelephoneNumberFormatException("Unable to Compile all patterns IO Error",e);
			}
		}
	}

	private void compilePatterns() throws PatternSyntaxException, FileNotFoundException, TelephoneNumberFormatException
	{

		//The pattern to match inArea Canonical Local area Number "+CCCAAAAnnnnnnnn"
		patCanonicalLocalAreaNumber = Pattern.compile("\\+(" + this.getCountryCode() + this.getAreaCode() + anyDialableRegex + "+)");

		Log.debug(getLocaleDebugInfo() + "CanonicalLocalAreaNumber Pattern = " + patCanonicalLocalAreaNumber.pattern());

		//The pattern to match inCountry Canonical National Number "+CCCnnnnnnnnnnnn"
		patCanonicalNationalNumber = Pattern.compile("\\+(" + this.getCountryCode()  + anyDialableRegex + "+)");
		Log.debug(getLocaleDebugInfo() + "CanonicalNationalNumber Pattern = " + patCanonicalNationalNumber.pattern());

		//The pattern to match Canonical InterNational Number "+cccnnnnnnnnnnnn"
        patCanonicalInternationalNumber = Pattern.compile("\\+(" + nonZeroDialableRegex + anyDialableRegex + "+)");
		Log.debug(getLocaleDebugInfo() + "CanonicalInternationalNumber Pattern = " + patCanonicalInternationalNumber.pattern());

		int len = ExtensionNumberLength.intValue();

		if (len != 0) {
			//The pattern to match Extension Number "nnnnn" where number of n's is the extension number length
			patExtensionNumber = Pattern.compile(anyDialableRegex + "{1," + new Integer(len).toString() + "}");
			Log.debug(getLocaleDebugInfo() + "ExtensionNumber Pattern = " + patExtensionNumber.pattern());
		} else {
			patExtensionNumber = null;
			Log.debug(getLocaleDebugInfo() + "ExtensionNumber Length = 0, Pattern set to null");
		}

		//The pattern to match a Dialable Number

        patDialableNumber = Pattern.compile("(" + OutsideAccess + "|" + LongDistanceAccess + ")?(" + anyDialableRegex + "+)" );
		Log.debug(getLocaleDebugInfo() + "DialableNumber Pattern = " + patDialableNumber.pattern());

		//The pattern to match a Dialable International Number

        patInternationalNumber = Pattern.compile("(" + OutsideAccess + "|" + LongDistanceAccess + ")?" + convertRuletoRegex(InternationalRule) + nonZeroDialableRegex + anyDialableRegex + "+)");
		Log.debug(getLocaleDebugInfo() + "InternationalNumber Pattern = " + patInternationalNumber.pattern());

		//The pattern to match a Dialable National Number

        patNationalNumber = Pattern.compile("(" + OutsideAccess + "|" + LongDistanceAccess + ")?" + convertRuletoRegex(LongDistanceRule) + nonZeroDialableRegex + anyDialableRegex + "+)");
		Log.debug(getLocaleDebugInfo() + "NationalNumber Pattern = " + patNationalNumber.pattern());

		//The pattern to match a Canonical Number with Extra "0" in brackets i.e. "+ccc(0)aaaannnnnnnn"

    	patCanonicalWithBracketedZero = Pattern.compile("\\+(" + nonZeroDigitRegex + anyDigitRegex + "*)\\(0\\)(" +  anyDialableRegex + "+)");

		Log.debug(getLocaleDebugInfo() + "CanonicalWithBracketedZero Pattern = " + patCanonicalWithBracketedZero.pattern());
		compileExclusionPatterns();
	}


	private void compileExclusionPatterns()
	{
		if (exclusionList != null) {
			Log.debug(getLocaleDebugInfo() + "Exclusion List has " + exclusionList.size() + " entries");

			Iterator it = exclusionList.iterator();
			ExclusionPatterns = new Pattern[exclusionList.size()];
			int i = 0;

			while(it.hasNext()) {
				ExclusionPatterns[i] = Pattern.compile((String)it.next());
				Log.debug(getLocaleDebugInfo() + "Exclusion Pattern[" + i + "] = " + ExclusionPatterns[i].pattern());
				i++;
			}
		}
	}

	public String removeAccessDigitsAndformatCanonicalNumber(String dialableNumb) throws TelephoneNumberFormatException
	{
		String ret = null;

        //Remove any extra spaces
        String Number = dialableNumb.trim();

        // Check if number fits any give exclusion if so then do nothing with it
        Matcher matcher = null;
        for (int i=0; i<ExclusionPatterns.length ; i++){
            matcher = ExclusionPatterns[i].matcher(Number);
            if (matcher.matches()) {
                Log.debug(getLocaleDebugInfo() + " Number matches an Exclusion Pattern returning it as is'" + Number + "'");
                return Number;
            }
        }

		if (dialableNumb.length() > getExtensionNumberLength())	{
			if (dialableNumb.startsWith(getOutsideAccess())) {
				//Strip out the first digit in the "destinationNumber"
				int outsideAccessLength = getOutsideAccess().length();
				dialableNumb = dialableNumb.substring(outsideAccessLength);
			}
		}
		ret = formatCanonicalNumber(dialableNumb);
		return ret;
	}

    public String addAccessDigitsAndformatCanonicalNumber(String dialableNumb) throws TelephoneNumberFormatException
    {
        //Remove any extra spaces
        String Number = dialableNumb.trim();

        // Check if number fits any give exclusion if so then do nothing with it
        Matcher matcher = null;
        for (int i=0; i<ExclusionPatterns.length ; i++) {
            matcher = ExclusionPatterns[i].matcher(Number);
            if (matcher.matches()) {
                Log.debug(getLocaleDebugInfo() + "Number matches an Exclusion Pattern returning it as is'" + Number + "'");
                return Number;
            }
        }

        String ret = null;
        if (dialableNumb.length() > getExtensionNumberLength())
            dialableNumb = getOutsideAccess() + dialableNumb;

        ret = formatCanonicalNumber(dialableNumb);
        return ret;
    }

	public String formatCanonicalNumber(String dialableNumb) throws TelephoneNumberFormatException
	{
		if (!initialised) {
			initPatterns();
		}

		int i;
		String ret = null;
		Matcher matcher = null;

		try {
			String Number = dialableNumb.trim();

			for (i=0; i<ExclusionPatterns.length ; i++) {
				matcher = ExclusionPatterns[i].matcher(Number);
				if (matcher.matches()) {
					Log.debug(getLocaleDebugInfo() + "Number matches an Exclusion Pattern returning it as is'" + Number + "'");
					return Number;
				}
			}

			if ((i=Number.indexOf('+')) > -1) {
				// it is a canonical number so add international rule first
				Number = getOutsideAccess() + applyTelephonyLocationRules(Number.substring(++i), InternationalRule);
			}
			// Removed the next else for bug found by RAB when importing Spanish number with 00,EFG as the international code
			// else

			Number = removeNonDialableChars(Number);

			if (Number.length() > this.getExtensionNumberLength() ) {
				for (i = 0; i < DialableCountryCodeStrings.length && ret == null; i++) {
					matcher = Pattern.compile(DialableCountryCodeStrings[i]).matcher(Number);
					if (matcher.matches()) {
						ret = transformCanonicalNumber(matcher.group(1) + matcher.group(5));
					}
				}
				if (ret == null)
				{
					matcher = patInternationalNumber.matcher(Number);
					if (matcher.matches())
					{
						ret =  "+" + matcher.group(2);
					}
				}
				if (ret == null)
				{
					matcher = patNationalNumber.matcher(Number);
					if (matcher.matches()) {
						// If Number starts with 9, then its been dropped by group(2), hence made this change
						// ret = "+" + CountryCode + matcher.group(2);
						String convertNumber = matcher.group(0);
						if(!"yes".equalsIgnoreCase(getUseDDIFormat())) {
							ret = "+" + CountryCode + convertNumber;
						} else {
							ret = "+" + formatNumberForIDD(checkNumberStartsWithAreaCode(convertNumber));
						}
					}
				}
				if (ret == null)
				{
					matcher = patDialableNumber.matcher(Number);
					// This matcher has (X|9) where the later 9 will be dropped by matcher.group(2), hence made group to '0'
					if (matcher.matches()) {
						//ret = "+" + CountryCode + AreaCode + matcher.group(2);
						String convertNumber = matcher.group(0);
						if(!"yes".equalsIgnoreCase(getUseDDIFormat())) {
							ret = "+" + CountryCode + AreaCode + convertNumber;
						} else {
							ret = "+" + formatNumberForIDD(checkNumberStartsWithAreaCode(convertNumber));
						}
					}
				}
			}
			if (ret == null)
			{
				if (patExtensionNumber != null) {
					matcher = patExtensionNumber.matcher(Number);
					if (matcher.matches()) {
						ret = matcher.group(0);
					}
				}
			}
			if (ret == null)
				throw new TelephoneNumberFormatException("Can not Transform Number '" + dialableNumb + "' into Canonical Format");
			else {
				Log.debug(getLocaleDebugInfo() + "Formated Number '" + dialableNumb + "' to Canonical Number '" + ret + "'");
				return ret;
			}
		}
		catch (TelephoneNumberFormatException tnfe)
		{
			throw tnfe;
		}
		catch (Exception e)
		{
			throw new TelephoneNumberFormatException("Exception caught formating number "  + dialableNumb + " into Canonical form",e );

		}
	}

	public String formatDialableNumber(String canonicalNumb) throws TelephoneNumberFormatException
	{
		if (!initialised) {
			initPatterns();
		}

		int i;
		Matcher matcher = null;
		String ret = null;

		try {
			//Remove any extra spaces
			String Number = canonicalNumb.trim();

			// Check if number fits any give exclusion if so then do nothing with it

			// Check if number now starts with the "+" character

			boolean isCanonicalNumber = Number.charAt(0) == '+';

			if (patExtensionNumber != null) {
				matcher = patExtensionNumber.matcher(Number);
				if (matcher.matches())
					ret = matcher.group(0);
			}
			if (ret == null) {
				// it was not an extension number

				//does it start with the "+" character
				if (!isCanonicalNumber)
					//No so it is an error
					throw new TelephoneNumberFormatException("Number '" + canonicalNumb + "' not in Canonical Format");

				//Now remove all spaces from the number
				Number = removeSpaces(Number);
				//Check for a Canonical Number with an Extra "0" character in brackets i.e. "+ccc(0)aaaannnnnnnn"
				matcher = patCanonicalWithBracketedZero.matcher(Number);
				if (matcher.matches()) {
					// it did match so use recursion to format the numbers without the "(0)" i.e. "+cccaaaannnnnnnn"
					ret = formatDialableNumber("+" + matcher.group(1) + matcher.group(2));
				}
				else {
					//Check for country code followed by the optional digit to be dropped i.e. "+cccxaaaannnnnnnn"
					// NOTE NOTE NOTE
						//This works OK for most countries
						//except when dialling Italy and former USSR countries, when the '0' must always be dialled.
						//When dialling area codes to Finland, Iceland or Turkey the initial '0' or '9' should be removed
					//NOTE NOTE NOTE
/*					for (i = 0; i < CanonicalCountryCodeStrings.length && ret == null; i++)
					{
						matcher = Pattern.compile(CanonicalCountryCodeStrings[i]).matcher('+' + Number);
						if (matcher.matches()){
							// it did match so use recursion to format the numbers without the "n" i.e. "+cccaaaannnnnnnn"
								ret = formatDialableNumber("+" + matcher.group(1) + matcher.group(3));
//								ret = "+" + matcher.group(1) + matcher.group(3);
							}
					}
*/
					Number = removeNonDialableChars(Number);
					if(!"yes".equalsIgnoreCase(getUseDDIFormat())) {
						if (ret == null) {
							//Check for a local area number
							if (this.AreaCode.length() > 0) {
								matcher = patCanonicalLocalAreaNumber.matcher('+' + Number);
								if (matcher.matches()) {
									ret = formatDialableLocalAreaNumber(matcher.group(1));
								}
							}
						}
						if (ret == null) {
							//Check for a National number
							matcher = patCanonicalNationalNumber.matcher('+' + Number);
							if (matcher.matches()) {
								ret = formatDialableNationalNumber(matcher.group(1));
							}
						}
						if (ret == null) {
							//Check for a InterNational number
							matcher = patCanonicalInternationalNumber.matcher('+' + Number);
							if (matcher.matches()) {
								ret = formatDialableInternationalNumber(matcher.group(1));
							}
						}
/*
						if (ret == null) {
							matcher = patDialableNumber.matcher(Number);
							if (matcher.matches())
								ret = matcher.group(0);
						}
						if (ret == null) {
							String DialableNumber = null;
							if (!isCanonicalNumber) {
								String CanonicalNumber = formatCanonicalNumber(Number);
								ret = formatDialableNumber(CanonicalNumber);
							}else
								ret = Number;
						}
*/
					} else {
						Number = removeNonDialableChars(Number);
						ret = getOutsideAccess() + applyTelephonyLocationRules(applyLocalAreaRule(Number), InternationalRule);
					}
				}
			}
			if (ret == null)
				throw new TelephoneNumberFormatException("Number '" + canonicalNumb + "' not in recognised Canonical Format");
			else {
				Log.debug(getLocaleDebugInfo() + "Formated Number '" + canonicalNumb + "' to Dialable Number '" + ret + "'");
				return ret;
			}
		} catch (TelephoneNumberFormatException tnfe) {
			throw tnfe;
		} catch (Exception e) {
			throw new TelephoneNumberFormatException("Exception caught formating number "  + canonicalNumb + " into Dialable form",e );
		}
	}

	public void setExclusionList(List exclusions)
	{
		exclusionList = exclusions;
	}


	public List getExclusionList()
	{
		return exclusionList;
	}


	private String transformCanonicalNumber(String dialableNumb) throws TelephoneNumberFormatException
	{
		if (!initialised)
		{
			initPatterns();
		}
		Matcher matcher = null;
		String ret = null;

		String Number = dialableNumb.trim();
//		boolean CanonicalNumber = Number.charAt(0) == '+';
		Number = removeNonDialableChars(Number);


//		matcher = patInternatonalWithExtraZero.matcher(Number);
//		if (matcher.matches())
//			return formatCanonicalNumber(matcher.group(1) + matcher.group(5));

		matcher = patInternationalNumber.matcher(Number);
		if (matcher.matches())
		{
			ret =  "+" + matcher.group(2);
		}

		if (ret == null)
		{
			matcher = patNationalNumber.matcher(Number);
			if (matcher.matches())
			{
				ret =  "+" + CountryCode + matcher.group(2);
			}
		}

		if (ret == null)
		{
			if (patExtensionNumber != null)
			{
				matcher = patExtensionNumber.matcher(Number);
				if (matcher.matches())
					ret =  matcher.group(0);
			}
		}
		if (ret == null) {
			throw new TelephoneNumberFormatException("Can not Format Number '" + dialableNumb + "' into Canonical Format");
		} else {
			Log.debug(getLocaleDebugInfo() + "Transformed Number '" + dialableNumb + "' to Canonical Number '" + ret + "'");
			return ret;
		}
	}

	private static boolean isDialableChar(char c)
	{
		if ((c <= '9' && c >= '0') || (c <= 'F' && c >= 'A') || c == '*' || c == '#')
			return true;
		else
			return false;
	}

	private boolean isValidRuleCharacter(char c)
	{
		if (validRuleCharacters.indexOf(c) > -1) {
			return true;
		}
		return false;
	}

	private boolean isValidRuleString(String str)
	{
		int i;
		for (i = 0;i < str.length();i++) {
			if (!isValidRuleCharacter(str.charAt(i))) return false;
		}
		if (str.equals(""))
		    return true;

		Pattern patRuleString = Pattern.compile(ruleStringRegex);
		return patRuleString.matcher(str).matches() ;
	}

	private void checkValidRuleString(String str) throws TelephoneNumberFormatException
	{
		if (!isValidRuleString(str)) {
			Log.error(getLocaleDebugInfo() + "Invalid Rule '" + str + "' entered");
			throw(new TelephoneNumberFormatException("Invalid Rule '" + str + "' entered"));
		}
	}

	private void checkDialableString(String str) throws TelephoneNumberFormatException
	{
		if (!isDialableString(str)) {
			Log.error(getLocaleDebugInfo() + "Non Dialable Number '" + str + "' entered");
			throw(new TelephoneNumberFormatException("Non Dialable Number '" + str + "' entered"));
		}
	}

	public static boolean isDialableString(String str)
	{
		int i;
		for (i = 0;i < str.length();i++) {
			if (!isDialableChar(str.charAt(i))) return false;
		}
		return true;
	}

	private String removeNonDialableChars(String Numb)
	{
		String Number = "";
		for ( int i = 0; i < Numb.length(); i++) {
			if (isDialableChar(Numb.charAt(i))) {
				Number = Number + Numb.charAt(i);
			}
		}
		return Number;
	}

	private String removeSpaces(String Numb)
	{
		String Number = "";
		for ( int i = 0; i < Numb.length(); i++) {
			if (Numb.charAt(i) != ' ' ) {
				Number = Number + Numb.charAt(i);
			}
		}
		return Number;
	}

	private static String removeNonDigits(String Numb)
	{
		String Number = "";
		for ( int i = 0; i < Numb.length(); i++) {
			if (Numb.charAt(i) <= '9' && Numb.charAt(i) >= '0') {
				Number = Number + Numb.charAt(i);
			}
		}
		return Number;
	}


	private String convertRuletoRegex(String Rule)
	{
		int i;
		String regex = "";

		for (i = 0; i < Rule.length(); i++)
		{
			switch (Rule.charAt(i))
			{
// The country code
				case 'E':
				{
					return  regex + "(";
//					break;
				}
// The Area code
				case 'F':
				{
					return regex + "(";
//					break;
				}
// The number past the Country and area code

				case 'G':
				{
					return regex + "(";
//					break;
				}
// All digits dial as is
				case '0':
				case '1':
				case '2':
				case '3':
				case '4':
				case '5':
				case '6':
				case '7':
				case '8':
				case '9':
				case 'A':
				case 'B':
				case 'C':
				case 'D':
				case '*':
				case '#':
				{
					regex = regex + Rule.charAt(i);
					break;
				}
				case 'N':
				{
					//N Optional long-distance carrier.
					regex = regex + this.getLongDistanceCarrierCode();
					break;
				}
				case 'S':
				{
					//S Optional international carrier.
					regex = regex + this.getInternationalCarrierCode();
					break;
				}
				case 'L':
				{
					//L Mandatory long-distance carrier.
					regex = regex + this.getLongDistanceCarrierCode();
					break;
				}
				case 'M':
				{
					//M Mandatory international carrier.
					regex = regex + this.getInternationalCarrierCode();
					break;
				}
				default:
				{
					break;
				}
			}

		}
		if (regex.equals( ""))
				regex = "(";
		return regex;
	}

	private String formatDialableLocalAreaNumber(String num)
	{
		// return (this.getOutsideAccess() + applyTelephonyLocationRules(num, SameAreaRule));
//		return (this.getOutsideAccess() + this.getAreaCode() + applyTelephonyLocationRules(num, SameAreaRule));
		return applyLocalAreaRule(applyTelephonyLocationRules(num, SameAreaRule));
	}

	private String formatDialableNationalNumber(String num)
	{
		if (LongDistanceRule.equals(""))
	        return(applyLocalAreaRule(applyTelephonyLocationRules(num, SameAreaRule)));
	    else
//	        return(this.getOutsideAccess() + applyTelephonyLocationRules(num, LongDistanceRule));
			return applyLocalAreaRule(applyTelephonyLocationRules(num,LongDistanceRule));
	}

	private String formatDialableInternationalNumber(String num)
	{
		return(this.getOutsideAccess() + applyTelephonyLocationRules(num, InternationalRule));
	}

	String getPrefix(String rule)
	{
		int i;
		String dialString = "";
		for (i = 0; i < rule.length(); i++) {
			switch (rule.charAt(i)) {
				case '0':
				case '1':
				case '2':
				case '3':
				case '4':
				case '5':
				case '6':
				case '7':
				case '8':
				case '9':
				case 'A':
				case 'B':
				case 'C':
				case 'D':
				{
					dialString = dialString + rule.charAt(i);
					break;
				}
			}
		}
		return dialString;
	}

	String getInterNationalPrefix()
	{
		return getPrefix(InternationalRule);
	}

	String getNationalPrefix()
	{
		return getPrefix(LongDistanceRule);
	}

	private String applyTelephonyLocationRules(String num, String Rule)
	{
		int i;
		String dialString = "";

		for (i = 0; i < Rule.length(); i++)
		{
			switch (Rule.charAt(i))
			{
				// The country code
				case 'E':
				{
					// Followed by Area code and Local Number
					if ((Rule.charAt(i+1) == 'F') && (Rule.charAt(i+2) == 'G')) {
						dialString = dialString + num;
						// Skip over the F and G
						i += 2;
					} else {
			            Log.warn("Acording to the country list rule this can not happen");
					}
					break;
				}
				// The Area code
				case 'F':
				{
					// Followed by Local Number
					if (Rule.charAt(i+1) == 'G') {
						// can only be in Country so we can get the number ok
						// Skip over the G
						dialString = checkNumberStartsWithAreaCode(dialString + num.substring(this.getCountryCode().length()));
						i += 1;
					} else {
		            	Log.warn("Acording to the country list rule this can not happen");
					}
					break;
				}
				// The number past the Country and area code
				// can only be in Country and in Area so we can get the number ok
				case 'G':
				{
					dialString = dialString + num.substring(this.getCountryCode().length() + this.getAreaCode().length());
					break;
				}
				// All digits dial as is
				case '0':
				case '1':
				case '2':
				case '3':
				case '4':
				case '5':
				case '6':
				case '7':
				case '8':
				case '9':
				case 'A':
				case 'B':
				case 'C':
				case 'D':
				case '*':
				case '#':
				{
					dialString = dialString + Rule.charAt(i);
					break;
				}
				case ',':
				{
					//, Pause for a fixed time.
					dialString = dialString + 'P';
					break;
				}
				case 'N':
				{
					//N Optional long-distance carrier.
					dialString = dialString + this.getLongDistanceCarrierCode();
					break;
				}
				case 'S':
				{
					//S Optional international carrier.
					dialString = dialString + this.getInternationalCarrierCode();
					break;
				}
				case 'L':
				{
					//L Mandatory long-distance carrier.
					dialString = dialString + this.getLongDistanceCarrierCode();
					break;
				}
				case 'M':
				{
					//M Mandatory international carrier.
					dialString = dialString + this.getInternationalCarrierCode();
					break;
				}
				// Can not do any of the rest of these
				case '!':
				{
					//! Flash (1/2 second on-hook, 1/2 second off-hook).
					break;
				}
				case 'W':
				{
					//W Wait for a second dial tone.
					break;
				}
				case 'T':
				{
					//T Subsequent numbers are to be tone dialed.
					break;
				}
				case 'P':
				{
					//P Subsequent numbers are to be pulse dialed.
					break;
				}
				// I do not know what the rest of the cases do so we will have to add code when we find out.
				case ' ':
				{
					break;
				}
				default:
				{
					break;
				}
			}
		}
		return dialString;
	}

	private void setCountryCodeList(List countryCodeList) throws TelephoneNumberFormatException
	{
		if (!initialised)
		{
			initPatterns();
		}

		int i;
		// NOTE These patterns are not compiled now as creating many numberformaters uses up an inordinate amount of memory
		//Create Patterns for Dialable and Canonical Numbers with an Extra "n" after the country code

		DialableCountryCodeStrings = new String[countryCodeList.size()];
		CanonicalCountryCodeStrings = new String[countryCodeList.size()];

		// Pattern prefix and suffix to match a diallable international number with an extra "n" between country code and Adrea code
		// Each Country's pattern will be of form "<Optional Access Digits><InterNational Access Digits><CountryCode>n<RestOfNumber>"
		String patDialablePrefix = "((" + OutsideAccess + "|" + LongDistanceAccess + ")?" + convertRuletoRegex(InternationalRule);
		String patDialableSuffix = ")(" + nonZeroDialableRegex + anyDialableRegex + "+)";

		// Pattern prefix and suffix to match a canonical international number with an extra "n" between country code and Area code
		// Each Country's pattern will be of form "+<CountryCode>n<RestOfNumber>
		String patCanonicalPrefix = "\\+(";
		String patCanonicalSuffix = ")(" + nonZeroDialableRegex + anyDialableRegex + "+)";

		for (i = 0; i < countryCodeList.size(); i++)
		{
			// Create the Dialable pattern for this country
			int countryCode = ((Integer)countryCodeList.get(i)).intValue();
			String pat = patDialablePrefix + countryCodeList.get(i).toString() + "))(" + AreaCodePrefixes[countryCode] + patDialableSuffix;
			DialableCountryCodeStrings[i] = pat;
			// Create the Canonical pattern for this country
			pat = patCanonicalPrefix + countryCodeList.get(i).toString() + ")(" +  AreaCodePrefixes[countryCode] + patCanonicalSuffix;
			CanonicalCountryCodeStrings[i] = pat;
		}
	}

	public boolean isInitialised()
	{
		return initialised && compiled;
	}

	private String getLocaleDebugInfo()
	{
		if (myLocale != null)
			return "[" +  myLocale.getDisplayCountry() + "] ";
		else
			return "[Locale Not Set] ";
	}


	public String getCountryCode() {
		return CountryCode;
	}

	public void setCountryCode(String countryCode)throws TelephoneNumberFormatException {

	    countryCode = countryCode.trim();
	    try {
			checkDialableString(countryCode);
			CountryCode = countryCode;
			Log.info(getLocaleDebugInfo() + "Country Code set to '" + CountryCode + "'");
			initPatterns();
		} catch(NullPointerException npe) {
			Log.error(getLocaleDebugInfo() + "Country Code '" + countryCode + "' not set " + npe);
			throw new TelephoneNumberFormatException("Country Code '" + countryCode + "' not set",npe);
		} catch(TelephoneNumberFormatException tnfe) {
			throw tnfe;
		}
	}

	public String getCountryName() {
		return CountryName;
	}

	public void setCountryName(String countryName) throws TelephoneNumberFormatException {
	    countryName = countryName.trim();
	    try {
			CountryName = countryName;
			Log.info(getLocaleDebugInfo() + "Country Name set to '" + CountryName + "'");
			// Country Name is not used at all yet so will not need to re-compile patterns
			//initPatterns();
		} catch(NullPointerException npe) {
			Log.error(getLocaleDebugInfo() + "Country Name '" + countryName + "' not set " + npe);
			throw new TelephoneNumberFormatException("Country Name '" + countryName + "' not set",npe);
		}
	}

	public String getInternationalRule() {
		return InternationalRule;
	}

	public void setInternationalRule(String internationalRule) throws TelephoneNumberFormatException {

	    internationalRule = internationalRule.trim();
	    try {
			checkValidRuleString(internationalRule);
			InternationalRule = internationalRule;
			Log.info(getLocaleDebugInfo() + "International Rule set to '" + InternationalRule + "'");
			initPatterns();
		} catch(NullPointerException npe) {
			Log.error(getLocaleDebugInfo() + "International Rule '" + internationalRule + "' not set " + npe);
			throw new TelephoneNumberFormatException("International Rule '" + internationalRule + "' not set",npe);
		} catch(TelephoneNumberFormatException tnfe) {
			throw tnfe;
		}
	}

	public String getLongDistanceRule() {
		return LongDistanceRule;
	}

	public void setLongDistanceRule(String longDistanceRule) throws TelephoneNumberFormatException {

	    longDistanceRule = longDistanceRule.trim();
	    try {
			checkValidRuleString(longDistanceRule);
			LongDistanceRule = longDistanceRule;
			Log.info(getLocaleDebugInfo() + "Long Distance Rule set to '" + LongDistanceRule + "'");
			initPatterns();
		} catch(NullPointerException npe) {
			Log.error(getLocaleDebugInfo() + "Long Distance Rule '" + longDistanceRule + "' not set " + npe);
			throw new TelephoneNumberFormatException("Long Distance Rule '" + longDistanceRule + "' not set",npe);
		} catch(TelephoneNumberFormatException tnfe) {
			throw tnfe;
		}
	}

	public String getSameAreaRule() {
		return SameAreaRule;
	}


	public void setSameAreaRule(String sameAreaRule) throws TelephoneNumberFormatException {

	    sameAreaRule = sameAreaRule.trim();
	    try {
			checkValidRuleString(sameAreaRule);
			SameAreaRule = sameAreaRule;
			Log.info(getLocaleDebugInfo() + "Same Area Rule set to '" + SameAreaRule + "'");
			initPatterns();
		} catch(NullPointerException npe) {
			Log.error(getLocaleDebugInfo() + "Same Area Rule '" + sameAreaRule + "' not set " + npe);
			throw new TelephoneNumberFormatException("Same Area Rule '" + sameAreaRule + "' not set",npe);
		} catch(TelephoneNumberFormatException tnfe) {
			throw tnfe;
		}
	}

	public String getAreaCode() {
		return AreaCode;
	}

	public void setAreaCode(String areaCode) throws TelephoneNumberFormatException {

		areaCode = areaCode.trim();
		try {
			checkDialableString(areaCode);
			AreaCode = areaCode;
			Log.info(getLocaleDebugInfo() + "Area Code set to '" + AreaCode + "'");
			initPatterns();
		} catch(NullPointerException npe) {
			Log.error(getLocaleDebugInfo() + "Area Code '" + areaCode + "' not set " + npe);
			throw new TelephoneNumberFormatException("Area Code '" + areaCode + "' not set",npe);
		} catch(TelephoneNumberFormatException tnfe) {
			throw tnfe;
		}
	}


	public String getInternationalCarrierCode() {
		return InternationalCarrierCode;
	}

	public void setInternationalCarrierCode(String internationalCarrierCode) throws TelephoneNumberFormatException {

	    internationalCarrierCode = internationalCarrierCode.trim();
	    try {
			checkDialableString(internationalCarrierCode);
			InternationalCarrierCode = internationalCarrierCode;
			Log.info(getLocaleDebugInfo() + "International Carrier Code set to '" + InternationalCarrierCode + "'");
			initPatterns();
		} catch(NullPointerException npe) {
			Log.error(getLocaleDebugInfo() + "International Carrier Code '" + internationalCarrierCode + "' not set " + npe);
			throw new TelephoneNumberFormatException("International Carrier Code '" + internationalCarrierCode + "' not set",npe);
		} catch(TelephoneNumberFormatException tnfe) {
			throw tnfe;
		}
	}

	public String getLongDistanceAccess() {
		return LongDistanceAccess;
	}

	public void setLongDistanceAccess(String longDistanceAccess) throws TelephoneNumberFormatException {

	    longDistanceAccess = longDistanceAccess.trim();
	    try {
			longDistanceAccess = longDistanceAccess.trim();
			checkDialableString(longDistanceAccess);
			LongDistanceAccess = longDistanceAccess;
			Log.info(getLocaleDebugInfo() + "Long Distance Access set to '" + LongDistanceAccess + "'");
			initPatterns();
		} catch(NullPointerException npe) {
			Log.error(getLocaleDebugInfo() + "Long Distance Access '" + longDistanceAccess + "' not set " + npe);
			throw new TelephoneNumberFormatException("Long Distance Access '" + longDistanceAccess + "' not set",npe);
		} catch(TelephoneNumberFormatException tnfe) {
			throw tnfe;
		}
	}


	public String getLongDistanceCarrierCode() {
		return LongDistanceCarrierCode;
	}


	public void setLongDistanceCarrierCode(String longDistanceCarrierCode) throws TelephoneNumberFormatException {

	    longDistanceCarrierCode = longDistanceCarrierCode.trim();
	    try {
			checkDialableString(longDistanceCarrierCode);
			LongDistanceCarrierCode = longDistanceCarrierCode;
			Log.info(getLocaleDebugInfo() + "Long Distance Carrier Code set to '" + LongDistanceCarrierCode + "'");
			initPatterns();
		} catch(NullPointerException npe) {
			Log.error(getLocaleDebugInfo() + "Long Distance Carrier Code '" + longDistanceCarrierCode + "' not set " + npe);
			throw new TelephoneNumberFormatException("Long Distance Carrier Code '" + longDistanceCarrierCode + "' not set",npe);
		} catch(TelephoneNumberFormatException tnfe) {
			throw tnfe;
		}
	}

	public String getOutsideAccess() {
		return OutsideAccess;
	}

	public void setOutsideAccess(String outsideAccess) throws TelephoneNumberFormatException {

	    try {
			outsideAccess = outsideAccess.trim();
			checkDialableString(outsideAccess);

			OutsideAccess = outsideAccess;
			Log.info(getLocaleDebugInfo() + "Outside Access set to '" + OutsideAccess + "'");
			initPatterns();
		} catch(NullPointerException npe) {
			Log.error(getLocaleDebugInfo() + "Outside Access '" + outsideAccess + "' not set " + npe);
			throw new TelephoneNumberFormatException("Outside Access '" + outsideAccess + "' not set",npe);
		} catch(TelephoneNumberFormatException tnfe) {
			throw tnfe;
		}
	}

	public Locale getLocale()
	{
		return myLocale.getLocale();
	}

	public void setLocale(Locale locale) throws TelephoneNumberFormatException {
		try {
			Log.info("setLocale - " + locale);
			myLocale = new TSCLocale(locale);
			init();
		} catch(NullPointerException npe) {
			Log.error(getLocaleDebugInfo() + "Locale '" + locale + "' not set " + npe);
			throw new TelephoneNumberFormatException("Locale '" + locale + "' not set",npe);
		} catch(TelephoneNumberFormatException tnfe) {
			throw tnfe;
		}
	}

	public int getExtensionNumberLength() {
		return ExtensionNumberLength.intValue();
	}

	public void setExtensionNumberLength(int extensionNumberLength) throws TelephoneNumberFormatException {
		try {
			if (extensionNumberLength >= 0 && extensionNumberLength < 10) {
				ExtensionNumberLength = new Integer(extensionNumberLength);
				initPatterns();
			} else {
				Log.error(getLocaleDebugInfo() + "Extention Number length '" + new Integer(extensionNumberLength).toString()  + "' is invalid");
				throw(new TelephoneNumberFormatException("Extention Number length '" + new Integer(extensionNumberLength).toString() + "' is invalid"));
			}
		} catch(NullPointerException npe) {
			Log.error(getLocaleDebugInfo() + "Extention Number length '" + extensionNumberLength + "' not set " + npe);
			throw new TelephoneNumberFormatException("Extention Number length '" + extensionNumberLength + "' not set",npe);
		} catch(TelephoneNumberFormatException tnfe) {
			throw tnfe;
		}
	}

	public void setInternalPrefixes(String internalPrefixes) {
		try {
			this.internalRoutingPrefix = internalPrefixes.trim();
//			initPatterns();
		} catch (NullPointerException ne) {
			internalRoutingPrefix = "";
			Log.error(getLocaleDebugInfo() + " Internal Routing prefixes '" + internalRoutingPrefix + "' not set '" + ne);
		}
	}

	public String getInternalRoutingPrefixes() {
		return internalRoutingPrefix;
	}

	public String getAreaCodePrefix()
	{
		return AreaCodePrefix;
	}


	public String getAreaCodePrefix(int cCode)
	{
		return AreaCodePrefixes[cCode];
	}


	public void setAreaCodePrefix(String areaCodePrefix)
	{
		AreaCodePrefix = areaCodePrefix.trim();
	}

	public String isInternalRoutingPrefix(String number) throws TelephoneNumberFormatException {
		boolean interNationalNumber = false;

		number = convertAlpha(number);

		if(null != number && number.length() > 0 && number.startsWith("+"))
			interNationalNumber = true;
		else
			interNationalNumber = false;

		number = removeNonDialableChars(number);
		number = interNationalNumber ? "+" + number : number;

		StringTokenizer prefixTokens = new StringTokenizer(getInternalRoutingPrefixes(), ",");
		while(prefixTokens.hasMoreTokens()) {
			String prefix = prefixTokens.nextToken().trim();
			if(number.startsWith(prefix)) {
				return number;
			}
		}
		return null;
	}

	public void setUseIDDFormat(String useIDDFormat) {
		this.useIDDFormat = useIDDFormat;
	}

	public String getUseDDIFormat() {
		return useIDDFormat;
	}


	public String getRealAreaCode() {
		return realAreaCode;
	}


	public void setRealAreaCode(String realAreaCode) {
		this.realAreaCode = realAreaCode;
	}


	public long getPhoneNumberLength() {
		return phoneNumberLength;
	}

	public void setPhoneNumberLength(long phoneNumberLength) {
		this.phoneNumberLength = phoneNumberLength;
	}

	private String applyLocalAreaRule(String number) {

		if(checkForUSLocale() && number.startsWith(getCountryCode())) {
			number = number.substring(getCountryCode().length());
		}

		if(!"yes".equalsIgnoreCase(useIDDFormat)) {
			if (number.length() < phoneNumberLength)
				return getOutsideAccess() + getAreaCode() + getRealAreaCode() + checkNumberStartsWithAreaCode(number);
			else
				return getOutsideAccess() + getAreaCode() + checkNumberStartsWithAreaCode(number);
		} else {
			String retNumber = "";
			if (number.length() < phoneNumberLength)
				retNumber = getRealAreaCode() + checkNumberStartsWithAreaCode(number);
			else
				retNumber = checkNumberStartsWithAreaCode(number);

			return retNumber;
		}
	}

	private String checkNumberStartsWithAreaCode(String number) {
		if (AreaCode.length() > 0 && number.startsWith(AreaCode)) {
			String tempString =number.substring(AreaCode.length());
			return tempString;
		} else
			return number;
	}

	private boolean checkForUSLocale(){
		return (getLocale().getCountry().equalsIgnoreCase("us"));
	}

	private String formatNumberForIDD(String number) {
		number = checkNumberStartsWithAreaCode(number);
		if(number.length() < getPhoneNumberLength()) {
			return getCountryCode() + getRealAreaCode() + number;
		} else {
			return getCountryCode() + number;
		}
	}

	public String convertAlpha(String input)
	{
		int inputlength = input.length();
		input = input.toLowerCase();
		String phonenumber = "";

		for (int i = 0; i < inputlength; i++) {
			int character = input.charAt(i);

			switch(character) {
				case '+': phonenumber+="+";break;
				case '*': phonenumber+="*";break;
				case '#': phonenumber+="#";break;
				case '0': phonenumber+="0";break;
				case '1': phonenumber+="1";break;
				case '2': phonenumber+="2";break;
				case '3': phonenumber+="3";break;
				case '4': phonenumber+="4";break;
				case '5': phonenumber+="5";break;
				case '6': phonenumber+="6";break;
				case '7': phonenumber+="7";break;
				case '8': phonenumber+="8";break;
				case '9': phonenumber+="9";break;
				case  'a': case 'b': case 'c': phonenumber+="2";break;
				case  'd': case 'e': case 'f': phonenumber+="3";break;
				case  'g': case 'h': case 'i': phonenumber+="4";break;
				case  'j': case 'k': case 'l': phonenumber+="5";break;
				case  'm': case 'n': case 'o': phonenumber+="6";break;
				case  'p': case 'q': case 'r': case 's': phonenumber+="7";break;
				case  't': case 'u': case 'v': phonenumber+="8";break;
				case  'w': case 'x': case 'y': case 'z': phonenumber+="9";break;
		   }
		}

		return (phonenumber);
	}

}