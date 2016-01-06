<% 
	response.setContentType("text/xml"); 
%>
<%@ page import = "org.jivesoftware.util.*, java.util.Map" %>
<%
	Map<String, String[]> parameters = request.getParameterMap();

	for(String parameter : parameters.keySet()) 
	{
		String[] values = parameters.get(parameter);
		
		for (int i=0; i<values.length; i++)
		{
			Log.info(parameter + "[" + i + "] = " + values[i]);
		}
	}
%>
<document type="freeswitch/xml">
  <section name="result">
    <result status="not found" />
  </section>
</document>