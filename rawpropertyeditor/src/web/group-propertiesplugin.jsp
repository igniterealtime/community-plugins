<%@page import="java.util.Hashtable"%>

<%@ page import="java.net.URLEncoder"%>
<%@ page import="org.jivesoftware.util.Log"%>
<%@ page
	import="org.jivesoftware.openfire.XMPPServer,
           org.jivesoftware.openfire.plugin.RawPropertyEditor,
           org.jivesoftware.util.ParamUtils,org.jivesoftware.openfire.*,
           java.util.HashMap,
           java.util.Map,org.jivesoftware.util.*,org.apache.commons.lang.StringEscapeUtils;"
	errorPage="error.jsp"%>

<%@ taglib uri="http://java.sun.com/jstl/core_rt" prefix="c"%>
<%@ taglib uri="http://java.sun.com/jstl/fmt_rt" prefix="fmt"%>
<%
	boolean edit = request.getParameter("edit") != null;
	String group = ParamUtils.getParameter(request, "group");
	String propname2 = request.getParameter("propname2");
	String propvalue2 = request.getParameter("propvalue2");
	RawPropertyEditor plugin = (RawPropertyEditor) XMPPServer.getInstance().getPluginManager()
			.getPlugin("RawPropertyEditor");
	Map<String, String> properties = null;

	if (!group.isEmpty() && group != null) {
		try {
			properties = plugin.getGroupProperties(group);
		} catch (Exception e) {
		}
	}

	if (request.getParameter("save") != null && request.getParameter("save").equals("true")) {
		try {

			System.out.println(group + propname2 + propvalue2 + "");
			plugin.addGroupProperties(group, propname2, propvalue2);
			properties = plugin.getGroupProperties(group);
		} catch (Exception e) {

		}

	}
	if (request.getParameter("delete") != null && request.getParameter("delete").equals("true")) {
		try {
			plugin.deleteGroupProperties(group, propname2);
			properties = plugin.getGroupProperties(group);
		} catch (Exception e) {

		}

	}
%>



<html>
<head>
<title>Group Properties</title>
<meta name="subPageID" content="group-propertiesplugin" />
<meta name="extraParams"
	content="<%="group=" + URLEncoder.encode(group, "UTF-8")%>" />
<style type="text/css">
.button {
	background-color: #4CAF50;
	border: none;
	color: white;
	padding: 8px 16px;
	text-align: center;
	text-decoration: none;
	display: inline-block;
	font-size: 12px;
	margin: 4px 2px;
	-webkit-transition-duration: 0.4s;
	transition-duration: 0.4s;
	cursor: pointer;
}

.button {
	background-color: white;
	color: black;
	border: 2px solid #ffffff;
}

.button:hover {
	background-color: #E55B0A;
	color: white;
}
}
</style>

</head>
<body onload="loaded();">

	<form action="group-propertiesplugin.jsp<%="?group=" + group%>"
		method="post" name="propform" id="propform">

		<input type="hidden" name="edit" value=""> <input
			type="hidden" name="propname2" value=""> <input type="hidden"
			name="propvalue2" value=""> <input type="hidden" name="save"
			value="false"> <input type="hidden" name="delete"
			value="false">
		<p>
			Below is a summary of the group <B> <%=group%>'s
			</B> properties
		</p>
		<div class="jive-table">
			<table cellpadding="0" cellspacing="0" border="0" width="100%">
				<thead>
					<tr>
						<th nowrap>Property Name</th>
						<th nowrap>Property Value</th>
						<th style="text-align: center;">Edit</th>
						<%
							/*
												<th style="text-align: center;"><fmt:message
														key="server.properties.encrypt" /></th>
													*/
						%>
						<th style="text-align: center;">Delete</th>
					</tr>
				</thead>
				<tbody>


					<%
						if (properties != null
								|| request.getParameter("edit") != null && request.getParameter("edit").equals("true")) {
							properties = plugin.getGroupProperties(group);
							for (Map.Entry<String, String> property : properties.entrySet()) {
								String propname = property.getKey().toString();
								String propvalue = property.getValue().toString();
								String propnameES = StringUtils.replace(StringUtils.escapeHTMLTags(propname), "'", "''");
								String propvalueES = StringUtils.replace(StringUtils.escapeHTMLTags(propvalue), "'", "''");
					%>

					<tr>
						<td><%=propnameES%></td>
						<td><%=propvalueES%></td>
						<td align="center"><img src="images/file1.png"
							onclick="doedit('<%=StringEscapeUtils.escapeHtml(StringEscapeUtils.escapeJavaScript(propname)) + "','"
							+ StringEscapeUtils.escapeHtml(StringEscapeUtils.escapeJavaScript(propvalue)) + "','"
							+ group%>')"></td>
						<%
							/*
																																				<td align="center"><img src="images/file2.png"></td>*/
						%>
						<td align="center"><img src="images/file.png"
							onclick="dodelete('<%=StringEscapeUtils.escapeHtml(StringEscapeUtils.escapeJavaScript(propname)) + "','"
							+ StringEscapeUtils.escapeHtml(StringEscapeUtils.escapeJavaScript(propvalue)) + "','"
							+ group%>')"></td>


					</tr>

					<%
						}
					%>
					<tr>
						<td colspan="5"><button type="button" class="button"
								onclick="doadd()" style="width: 100%">Add</button></td>
					</tr>
					<%
						}
					%>

				</tbody>
			</table>
		</div>




		<%
			if (request.getParameter("edit") != null && request.getParameter("edit").equals("true")) {
		%>

		<div class="jive-table">
			<table cellpadding="0" cellspacing="0" border="0" width="100%">
				<thead>
					<tr>
						<th colspan="2"><label id="editlabel" value="Edit Property"></th>
					</tr>
				</thead>
				<tbody>
					<tr valign="top">
						<td>Property Name:</td>
						<td><input type="textfield" id="propname" name="propname"
							value="<%=propname2%>"
							style="z-index: auto; position: relative; line-height: normal; font-size: 13.3333px; transition: none; background: transparent !important;"></td>
					</tr>
					<tr valign="top">
						<td>Property Value:</td>
						<td>

							</div> <textarea cols="45" rows="5" id="propValue" name="propValue"
								style="z-index: auto; position: relative; line-height: normal; font-size: 13.3333px; transition: none; background: transparent !important;"><%=propvalue2%></textarea>
						</td>
					</tr>
					<%
						/*
																					<tr valign="top">
																						<td>Property Encryption:</td>
																						<td><input type="radio" name="encrypt" value="true">Encrypt
																							this property value<br> <input type="radio" name="encrypt"
																							value="false" checked="">Do not encrypt this property
																							value</td>
																					</tr>*/
					%>
				</tbody>
				<tfoot>
					<tr>
						<td colspan="2"><input type="submit" name="jsdosave"
							value="Save Property"
							onclick="dosave('<%=StringEscapeUtils.escapeHtml(StringEscapeUtils.escapeJavaScript(propname2)) + "','"
						+ StringEscapeUtils.escapeHtml(StringEscapeUtils.escapeJavaScript(propvalue2))%>')"></td>
					</tr>
				</tfoot>
			</table>
		</div>
		<input style="visibility: hidden;" type="submit" name="btnsubmit"
			value="Search">
	</form>

	<%
		}
	%>
	<script language="JavaScript" type="text/javascript">
	

		function doedit(jspropname, jspropvalue, jsuserE) {

			document.propform.propname2.value = jspropname;
			document.propform.propvalue2.value = jspropvalue;
			document.propform.edit.value = "true";
			

		
			
			document.getElementById("propform").submit();

		}
		function dosave(propname, propvalue) {
			
			
			document.propform.propname2.value = document
					.getElementById('propname').value;
			;
			document.propform.propvalue2.value = document
					.getElementById('propValue').value;
			document.propform.save.value = "true";

			document.getElementById("propform").submit();
		}
		function dodelete(propname, propvalue, group) {

			
			document.propform.delete.value = "true";
			document.propform.propname2.value = propname;
		
			document.getElementById("propform").submit();
			
		}
		function doadd(){
			document.propform.propname2.value = "";
			document.propform.propvalue2.value = "";
			document.propform.edit.value = "true";
	

			
			document.getElementById("propform").submit();
		}
		
	</script>
</html>

