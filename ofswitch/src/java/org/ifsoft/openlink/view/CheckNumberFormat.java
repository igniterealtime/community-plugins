package org.ifsoft.openlink.view;

import java.io.IOException;
import java.util.Collection;
import java.util.Locale;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import javax.servlet.*;
import javax.servlet.annotation.*;

import org.slf4j.*;
import org.slf4j.Logger;

import org.jivesoftware.openfire.XMPPServer;
import org.jivesoftware.util.JiveGlobals;

import org.ifsoft.openlink.OpenlinkConstants.Properties;
import org.ifsoft.openlink.component.*;



@WebServlet(value="/checkNumberFormat", name="checkNumberFormat") public class CheckNumberFormat extends HttpServlet{

    private static final Logger Log = LoggerFactory.getLogger(CheckNumberFormat.class);

	public void init(ServletConfig servletConfig) throws ServletException
	{
		super.init(servletConfig);
	}

	@Override protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
	{
		response.setHeader("Expires", "Sat, 6 May 1995 12:00:00 GMT");
		response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
		response.addHeader("Cache-Control", "post-check=0, pre-check=0");
		response.setHeader("Pragma", "no-cache");
		response.setHeader("Content-Type", "text/html");
		response.setHeader("Connection", "close");

		ServletOutputStream out 		= response.getOutputStream();
		String pbxCountryCode			= Locale.getDefault().getCountry();
		String number 					= "";
		String pbxAccessDigits			= "";
		String pbxNumberLength			= "";
		String internalPrefix			= "";
		String pbxAreaCode				= "";
		String pbxTrunkCode				= "";
		String phoneNumberLength		= "";
		String formattedNumber			= "";
		String formattedCanonicalNumber = "";
		String error			 		= "";
		String siteID					= "";
		String useIDD					= "yes";
		String siteData					= "";


		number 			= request.getParameter("num");
		pbxCountryCode	= request.getParameter("pbxCountryCode");
		pbxAccessDigits = request.getParameter("pbxAccessDigits");
		pbxNumberLength	= request.getParameter("pbxNumberLength");
		pbxAreaCode		= request.getParameter("pbxAreaCode");
		internalPrefix 	= request.getParameter("pbxNumberPrefix");
		pbxTrunkCode	= request.getParameter("pbxTrunkCode");
		phoneNumberLength = request.getParameter("phoneNumberLength");
		useIDD			= request.getParameter("useIDD");
		siteData		= request.getParameter("site");

		if(null == pbxCountryCode)
			pbxCountryCode = Locale.getDefault().getCountry();
		if(null == pbxAccessDigits)
			pbxAccessDigits = "";
		if(null == pbxNumberLength)
			pbxNumberLength = "";
		if(null == pbxAreaCode)
			pbxAreaCode = "";
		if(null == number)
			number = "";
		if(null == internalPrefix)
			internalPrefix = "";
		if(null == useIDD)
			useIDD = "no";
		else
			useIDD = "yes";
		if(null == siteData)
			siteData = "";
		if(null == pbxTrunkCode)
			pbxTrunkCode = "";
		if(null == phoneNumberLength)
			phoneNumberLength = "";



		if(null != number && !"".equalsIgnoreCase(number)) {
			try {
				// Ensure Area Code is a number
				if(pbxAreaCode.length() > 0)
					Integer.parseInt(pbxAreaCode);
				TelephoneNumberFormatter telnumFormatter = new TelephoneNumberFormatter(new Locale("en", pbxCountryCode));
				telnumFormatter.setExtensionNumberLength(Integer.parseInt(pbxNumberLength));
				telnumFormatter.setOutsideAccess(pbxAccessDigits);
				telnumFormatter.setAreaCode(pbxTrunkCode);
				telnumFormatter.setRealAreaCode(pbxAreaCode);
				telnumFormatter.setPhoneNumberLength(Long.parseLong(phoneNumberLength));
				telnumFormatter.setInternalPrefixes(internalPrefix);
				telnumFormatter.setUseIDDFormat(useIDD);
				telnumFormatter.setLocale(new Locale("en", pbxCountryCode));
				String internalNum = telnumFormatter.isInternalRoutingPrefix(number);
				if(null != internalNum) {
					formattedCanonicalNumber = formattedNumber = internalNum;
				} else {
					formattedCanonicalNumber = telnumFormatter.formatCanonicalNumber(number);
					formattedNumber = telnumFormatter.formatDialableNumber(formattedCanonicalNumber);
				}
			} catch (TelephoneNumberFormatException e) {
				error = e.getMessage();
				Log.error("Caught exception while formatting number", e);
			} catch(NumberFormatException e){
				error = e.getMessage() + " Provide numeric value for Area Code / Phone Number length";
			}
			catch (Exception e) {
				error = e.toString();
				Log.error("caught exception while formatting number", e);
			}

		}

		out.println("");
		out.println("<html>");
		out.println("    <head>");
		out.println("        <title>Number Formatting</title>");
		out.println("        <meta name=\"pageID\" content=\"TRADERLYNC-CHECK-NUMBER-FORMAT\"/>");
		out.println("		<script type=\"text/javascript\">");
		out.println("			function populateFields() {");
		out.println("				var siteId = document.getElementById(\"site\");");
		out.println("				var siteData = siteId.options[siteId.selectedIndex].value;");
		out.println("				if(siteData != \"none\") {");
		out.println("					var daillingData = siteData.split(\":\");");
		out.println("					document.getElementById(\"pbxCountryCode\").value=daillingData[0];");
		out.println("					document.getElementById(\"pbxAccessDigits\").value=daillingData[1];");
		out.println("					document.getElementById(\"pbxNumberLength\").value=daillingData[2];");
		out.println("					document.getElementById(\"pbxNumberPrefix\").value=daillingData[3];");
		out.println("					document.getElementById(\"pbxAreaCode\").value=daillingData[4];");
		out.println("					document.getElementById(\"pbxTrunkCode\").value=daillingData[6];");
		out.println("					document.getElementById(\"phoneNumberLength\").value=daillingData[7];");
		out.println("					if(daillingData[5] == \"yes\") {");
		out.println("						document.getElementById(\"useIDD\").checked=true;");
		out.println("						document.getElementById(\"useIDD\").value=\"yes\";");
		out.println("					} else {");
		out.println("						document.getElementById(\"useIDD\").checked=false;");
		out.println("						document.getElementById(\"useIDD\").value=\"no\";");
		out.println("					}");
		out.println("				} else {");
		out.println("					document.getElementById(\"pbxAccessDigits\").value=\"\";");
		out.println("					document.getElementById(\"pbxNumberLength\").value=\"\";");
		out.println("					document.getElementById(\"pbxNumberPrefix\").value=\"\";");
		out.println("					document.getElementById(\"pbxAreaCode\").value=\"\";");
		out.println("					document.getElementById(\"useIDD\").checked=false;");
		out.println("					document.getElementById(\"useIDD\").value=\"no\";");
		out.println("					document.getElementById(\"pbxTrunkCode\").value=\"\";");
		out.println("					document.getElementById(\"phoneNumberLength\").value=\"\";");
		out.println("				}");
		out.println("			}");
		out.println("		</script>");
		out.println("    </head>");
		out.println("    <body>");
		out.println("<form action=\"traderlync-check-number-format\" method=\"get\">");

		if (error.length() > 1) {
			out.println("<div class=\"error\">");
			out.println(error);
			out.println("</div>");
		}

		out.println("<div class=\"jive-contentBoxHeader\">Phone Number Rules</div>");
		out.println("<div class=\"jive-contentBox\">");
		out.println("	 <table>");
		out.println("<tr><td>Site</td><td><Select name = 'site' id = 'site' onchange=\"populateFields()\">");
		out.println("<option value='none'>Select</option>");

		Site site = OpenlinkComponent.self.site;

		String country 				= JiveGlobals.getProperty(Properties.Openlink_PBX_COUNTRY_CODE + "."  + site.getName().toLowerCase(), Locale.getDefault().getCountry());
		String siePbxAccessDigits 	= JiveGlobals.getProperty(Properties.Openlink_PBX_ACCESS_DIGITS 	+ "."  + site.getName().toLowerCase(), "");
		String siteAreaCode 		= JiveGlobals.getProperty(Properties.Openlink_AREA_CODE  		+ "."  + site.getName().toLowerCase(), "");
		String sitePbxNumberLength 	= JiveGlobals.getProperty(Properties.Openlink_PBX_NUMBER_LENGTH 	+ "."  + site.getName().toLowerCase(), "");
		String sitePbxNumberPrefix 	= JiveGlobals.getProperty(Properties.Openlink_PBX_NUMBER_PREFIX 	+ "."  + site.getName().toLowerCase(), "");
		String sitePbxTrunkCode		= JiveGlobals.getProperty(Properties.Openlink_PBX_AREA_TRUNK_CODE + "." + site.getName().toLowerCase(), "");
		String sitePhoneNumberLength = JiveGlobals.getProperty(Properties.Openlink_PBX_LOCAL_PHONE_NUMBERLENGTH + "." + site.getName().toLowerCase(), "");
		String siteUseIDDFormat		= JiveGlobals.getProperty(Properties.Openlink_PBX_USE_IDD 		+ "."  + site.getName().toLowerCase(), "");

		String scriptArgument = country+":"+siePbxAccessDigits+":"+sitePbxNumberLength+":"+sitePbxNumberPrefix+":"+siteAreaCode+":"+siteUseIDDFormat+":"+sitePbxTrunkCode+":"+sitePhoneNumberLength;

		if(siteData.equals(scriptArgument)) {
			out.println("<option selected value='" + scriptArgument + "'>" + site.getName() + "</option>");
		} else {
			out.println("<option value='" + scriptArgument + "'>" + site.getName() + "</option>");
		}
		out.println("</select></td><td>Select Site from list to test Dailling rules applied for Destination numbers</td></tr>");
		out.println("	 	<tr><td>Country Code</td><td><select name='pbxCountryCode' id = 'pbxCountryCode'>");

		String[] listofCountryCodes = TelephoneNumberFormatter.getISOCountryCodes();

		for (int i=0; i<listofCountryCodes.length; i++)
		{
			if (pbxCountryCode.equals(listofCountryCodes[i]))
				out.println(	 	"<option selected value='" +  listofCountryCodes[i] + "'>" + listofCountryCodes[i] + "</option>");
			else
				out.println(	 	"<option value='" +  listofCountryCodes[i] + "'>" + listofCountryCodes[i] + "</option>");
		}

		out.println("	 	    </select></td>");
		out.println("	 		<td>Country code for determining international dial code. For example GB for United Kingdom, US for United states of America.<p/> Your server country code is " + Locale.getDefault().getCountry() + "</td></tr>");
		out.println("	 	<tr><td>External/PBX Access Digits</td><td><input size='20' type='text' name='pbxAccessDigits' id='pbxAccessDigits' value='" + pbxAccessDigits + "'></td>");
		out.println("	 		<td>Dial digits required to access external lines through PBX. Usually 9</td></tr>");
		out.println("	 	<tr><td>Internal/PBX Number Length</td><td><input size='20' type='text' name='pbxNumberLength' id = 'pbxNumberLength' value='" + pbxNumberLength + "'></td>");
		out.println("	 		<td>How many digits are in an internal PBX phone number. Usually 4 or 5.</td></tr>");
		out.println("	 	<tr><td>Internal Routing Prefixes</td><td><input size='20' type='text' name='pbxNumberPrefix' id = 'pbxNumberPrefix' value='" + internalPrefix + "'></td>");
		out.println("	 		<td>Internal routing numbers start with these prefixes, Configure prefixes each seperated by ','(Optional Parameter). E.g: 71, 12</td></tr>");
		out.println("	 	<tr><td>Trunk Code</td><td><input size='20' type='text' name='pbxTrunkCode' id = 'pbxTrunkCode' value='" + pbxTrunkCode + "'></td>");
		out.println("	 		<td>Code used to dial long distance numbers like other town or state or province</td></tr>");
		out.println("	 	<tr><td>Area Code</td><td><input size='20' type='text' name='pbxAreaCode' id = 'pbxAreaCode' value='" + pbxAreaCode + "'></td>");
		out.println("	 		<td>The area code for own town, state or province within your country</td></tr>");
		out.println("	 	<tr><td>Local phone number length</td><td><input size='20' type='text' name='phoneNumberLength' id = 'phoneNumberLength' value='" + phoneNumberLength + "'></td>");
		out.println("	 		<td>Number of Digits in Local numbers including area code. Eg. 10 for London - GB</td></tr>");
		if(useIDD.equals("yes")) {
			out.println("	 	<tr><td>Use IDD format</td><td><input size='20' type='checkbox' name='useIDD' id = 'useIDD' value='yes' checked/></td>");
			out.println("	 		<td>Use International Dialing Digit format only Eg: 0044201234567</td></tr>");
		} else {
			out.println("	 	<tr><td>Use IDD format</td><td><input size='20' type='checkbox' name='useIDD' id = 'useIDD'/></td>");
			out.println("	 		<td>Use International Dialing Digit format only Eg: 0044201234567</td></tr>");
		}
		out.println("	 </table>");
		out.println("</div>");
		out.println("");

		out.println("<div class=\"jive-contentBoxHeader\">Format Number</div>");
		out.println("<div class=\"jive-contentBox\">");
		out.println("<table>");
		out.println("<tr>");
		out.println("<td>Enter Number</td><td><input type = 'text' name='num' value='"+ number +"'/></td><td> </td><td> </td><td>Formatted CanonicalNumber</td><td><input type='text' name = 'canonicalNumber' id='canonicalNumber' disabled value='"+ formattedCanonicalNumber +"'></td><td> </td><td> </td><td>Formatted Number</td><td><input type='text' name='formattedNumber' id='formattedNumber' disabled value='"+ formattedNumber +"'></td>");
		out.println("</tr>");
		out.println("<tr>");
		out.println("<td><input type = 'submit' value='Check Format'/>");
		out.println("</tr>");
		out.println("</table>");
		out.println("</div>");
		out.println("</body>");
		out.println("</html>");
	}
}
