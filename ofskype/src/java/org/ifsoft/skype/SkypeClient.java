package org.ifsoft.skype;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.xmpp.packet.*;

import java.io.*;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;

import java.net.URL;
import java.net.URLEncoder;
import java.net.URLDecoder;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.apache.commons.httpclient.*;
import org.apache.commons.httpclient.methods.*;
import org.apache.commons.httpclient.params.HttpClientParams;

import org.jivesoftware.openfire.XMPPServer;
import org.jivesoftware.openfire.group.*;
import org.jivesoftware.openfire.user.*;
import org.jivesoftware.openfire.roster.*;

import org.jivesoftware.community.http.HttpClientManager;
import org.jivesoftware.community.http.impl.HttpClientManagerImpl;
import org.jivesoftware.community.util.DateUtils;
import org.jivesoftware.community.util.StringUtils;
import org.jivesoftware.util.*;

import net.sf.json.JSONException;
import net.sf.json.JSONObject;
import net.sf.json.JSONArray;

import com.google.common.collect.*;
import com.google.common.base.Predicate;

import com.microsoft.aad.adal4j.AuthenticationContext;
import com.microsoft.aad.adal4j.AuthenticationResult;

import org.ifsoft.lync.ucwa.*;

import javax.sip.*;
import javax.sip.message.*;
import javax.sdp.SdpFactory;
import javax.sdp.SessionDescription;
import javax.sdp.MediaDescription;
import javax.sdp.Attribute;

import org.ifsoft.sip.*;

import org.jivesoftware.openfire.plugin.ofskype.OfSkypePlugin;


public class SkypeClient {

    private static final Logger Log = LoggerFactory.getLogger(SkypeClient.class);

    private HttpClientManager httpClientManager = new HttpClientManagerImpl();
    private TaskEngine taskEngine = TaskEngine.getInstance();
    private final List pendingRequests = (List)org.ifsoft.lync.ucwa.Lists.newArrayList();
    private final ProviderStatus currentStatus = new ProviderStatus();
    private final ArrayDeque updateQueue = new ArrayDeque(1000);
   	public final Map<String, LyncBuddy> buddies = new ConcurrentHashMap<String, LyncBuddy>();
   	public final Map<String, ChatRoom> conversations = new ConcurrentHashMap<String, ChatRoom>();
   	public final Map<String, String> participants = new ConcurrentHashMap<String, String>();
   	public final Map<String, ActivePhoneAudio> callIds = new ConcurrentHashMap<String, ActivePhoneAudio>();

    private final Set subscribedUsers = (Set)Sets.newHashSet();
	public JID jid;
	public String sipUrl;
	public String service;
	public String emailAddress;
	public String myWorkPhoneNumber;
	public String myHomePhoneNumber;
	public String myMobilePhoneNumber;
	public String myOtherPhoneNumber;
    public String myName;
    public String myAvatar;
    public String myAvailability = "";
    public String myConferenceNumber = null;
    public String myNote = "";
    public String from = null;
    public String to = null;
    public String recordingPath = null;
    public String clientId = null;
    public String domain;
    public String oAuthToken = null;
    public RegisterProcessing registerProcessing = null;
    public Response response = null;
    public ServerTransaction serverTransaction = null;

    public boolean privateCall = false;
    public boolean incomingCall = false;
    public String privacyOwner = null;
    public String privacyRelationship = "";
    public String sourceNetwork = "SameEnterprise";

	private String signInData;
	private String autoDiscoverPath;

    private Pattern sipFromResourcePattern;
    private Pattern jsonLinePattern;
    private Pattern reasonPattern;
    private Pattern oauthPathHeaderPattern;
   	private Thread pollingThread = null;
    private String host;
    private String password;
    private String user;
    private String oAuthGenerationUrl;
    private Date invalidateSubscriptionsTime;
    private boolean pollingRunning;
    private String selfApplicationResource;
    private String applicationPath;
    private String presenceSubscriptionsPath;
    private String searchPath;
    private String contactsPath;
    private String groupsPath;
    private String batchPath;
    private String eventsPath;
    private String makeMeAvailablePath;
    private String callForwardingSettingsPath;
	private String turnOffCallForwardingPath;
	private String simultaneousRingToContactPath;
    private String mePath;
    private AtomicInteger failCount;
    private String startMessagingPath;
    private String startPhoneAudioPath;
    private String myPresencePath;
    private String myNotePath;
    private String myPhotoPath;
    private String myPhonesPath;
    private boolean cache;

    private String stopPhoneAudioHref = null;
    private String holdPhoneAudioHref = null;
    private String resumePhoneAudioHref = null;


    public SkypeClient(String username, String password, String domain, String url)
    {
		this.user = username;
		this.domain = domain;
		this.password = password;
		this.sipUrl = url;

        Log.info("SkypeClient " + username + " " + password + " " + domain + " " + url);

        sipFromResourcePattern = Pattern.compile("^.*?/people/([^/]*)/[^/]*$");
        jsonLinePattern = Pattern.compile("^\\W*(\\{.*?\\})\\W*$");
        reasonPattern = Pattern.compile("reason=\"([^\"]*)");
        oauthPathHeaderPattern = Pattern.compile("^\\W*MsRtcOAuth\\W+href=\"([^\"]*)\".*");
        failCount = new AtomicInteger(0);
        pollingRunning = false;
    }

    public String getDomain()
    {
		return domain;
	}

    public void setClientId(JID jid, boolean cache)  throws Exception
    {
		this.jid = jid;
		this.cache = cache;
    }

    public void doLogin() throws Exception
    {
        //Log.info("Initializing lync client");
        currentStatus.setErrorCode(ErrorCode.CONNECTING);
        try
        {
        	getOnlineToken();
            Log.info((new StringBuilder("Initializing UCWA provider. url: ")).append(host).toString());
            logon();
            currentStatus.setErrorCode(ErrorCode.SUCCESS);
        }
        catch(JSONException ex)
        {
            Log.error("Couldn't parse server data.", ex);
            currentStatus.setErrorCode(ErrorCode.INVALID_LOGIN_DATA);
            currentStatus.setErrorMessage(ex.getMessage());
        }
        catch(Exception ex)
        {
            Log.error("Exception was thrown while initializing provider.", ex);
            currentStatus.setErrorCode(ErrorCode.FAILED);
            currentStatus.setErrorMessage(ex.getMessage());
        }
    }

    private void getOnlineToken()
    {
		clientId = JiveGlobals.getProperty("skype.clientid." + domain, "ff8474ef-2f73-4d6a-b2ab-a6d7d8364ab2");
        Log.info("getOnlineToken " + clientId);

        String authority = "https://login.microsoftonline.com/common/oauth2/authorize";
        String resourceUri = "https://webdir1e.online.lync.com";
        String rootResource = "https://webdir1e.online.lync.com/Autodiscover/AutodiscoverService.svc/root/oauth/user?originalDomain=" + domain;

        AuthenticationContext context = null;
        AuthenticationResult result = null;
        ExecutorService service = null;

        try {
            service = Executors.newFixedThreadPool(1);
            context = new AuthenticationContext(authority, false, service);

            Future<AuthenticationResult> future = context.acquireToken(resourceUri, clientId, sipUrl, password, null);
            result = future.get();

			if (result != null)
			{
				String tempOAuthToken = result.getAccessToken();

				Log.info("SkypeClient got 1st token " + tempOAuthToken);

				GetMethod request = new GetMethod(rootResource);
				request.addRequestHeader("Authorization", "Bearer " + tempOAuthToken);

				URL url2 = new URL(request.getURI().toString());
				HttpClient httpClient = httpClientManager.getClient(url2);
				int responseCode = httpClient.executeMethod(request);

				Log.info("SkypeClient got response " + responseCode);

				if(responseCode == 200)
				{
					String jsonStr = getStringFromResponse(request);
					Log.info("SkypeClient got user resource json\n" + jsonStr);

					JSONObject jsonObject = sanitizeJson(jsonStr);
					JSONObject myLinks = jsonObject.getJSONObject("_links");

					while (myLinks.has("redirect") || myLinks.has("user"))
					{
						String redirect = null;

						if (myLinks.has("redirect"))
							redirect = myLinks.getJSONObject("redirect").getString("href");
						else
							redirect = myLinks.getJSONObject("user").getString("href");

						Log.info("SkypeClient got redirect " + redirect);

						GetMethod request2 = new GetMethod(redirect);
						URL url3 = new URL(request2.getURI().toString());
						resourceUri = url3.getProtocol() + "://" + url3.getAuthority();

            			future = context.acquireToken(resourceUri, clientId, sipUrl, password, null);
          				result = future.get();

						if (result != null)
						{
							tempOAuthToken = result.getAccessToken();
							request2.addRequestHeader("Authorization", "Bearer " + tempOAuthToken);

							HttpClient httpClient2 = httpClientManager.getClient(url3);
							int responseCode2 = httpClient2.executeMethod(request2);

							Log.info("SkypeClient got response " + responseCode2 + " " + tempOAuthToken);

							if(responseCode == 200)
							{
								jsonStr = getStringFromResponse(request2);
								Log.info("SkypeClient got user resource json\n" + jsonStr);

								jsonObject = sanitizeJson(jsonStr);
								myLinks = jsonObject.getJSONObject("_links");

								if (myLinks.has("applications"))
								{
									applicationPath = myLinks.getJSONObject("applications").getString("href");
									host = myLinks.getJSONObject("self").getString("href");;

        							Log.info("SkypeClient found application " + applicationPath + " " + host);

									url3 = new URL(host);
									host = url3.getProtocol() + "://" + url3.getAuthority();

									future = context.acquireToken(host, clientId, sipUrl, password, null);
									result = future.get();

									if (result != null)
									{
										oAuthToken = result.getAccessToken();
        								Log.info("SkypeClient got final token " + oAuthToken);
									}
								}

							} else {
								break;
							}
						} else {
							break;
						}
					}
				}
			}

        } catch (Exception e) {
			Log.error("of_authenticate_365", e);

        } finally {
            service.shutdown();
        }
    }

    private void uninitialize()
    {
        //Log.info("Disconnecting Lync provider");
        pollingRunning = false;
        currentStatus.setErrorCode(ErrorCode.UNASSIGNED);

        try
        {
			if (turnOffCallForwardingPath != null)
			{
				//postRequest(turnOffCallForwardingPath, null);
			}

            MethodExecutionResult executionResult = request("DELETE", selfApplicationResource, null);
            //Log.info((new StringBuilder("Response from DELETE application: ")).append(executionResult.getResponseCode()).toString());
        }
        catch(Exception e)
        {
            String message = "Failed deleting the logical application created by the UCWA Plugin.";
            Log.error(message, e);
        }

        invalidateSubscriptions();
    }

    public void makeMeAvailable(String status)
    {
		makeMeAvailable(status, true, true);
	}

    public void makeMeAvailable(final String status, final boolean messaging, final boolean phoneAudio)
    {
		try {
			Log.info("makeAvailable " + makeMeAvailablePath);

			JSONObject reqBody = new JSONObject();
			//reqBody.put("phoneNumber", "+441634251467");
			reqBody.put("signInAs", status);

			JSONArray supportedMessageFormats = new JSONArray();
			supportedMessageFormats.put(0, "Plain");
			//supportedMessageFormats.put(1, "Html");
			reqBody.put("supportedMessageFormats", supportedMessageFormats);

			JSONArray supportedModalities = new JSONArray();
			if (messaging) supportedModalities.put(0, "Messaging");
			//if (phoneAudio) supportedModalities.put(1, "PhoneAudio");
			if (phoneAudio) supportedModalities.put(1, "Audio");

			reqBody.put("supportedModalities", supportedModalities);

			postRequest(makeMeAvailablePath, reqBody);

		}
		catch(Exception e)
		{
			Log.error("Failed makeMeAvailable", e);
		}
    }

    public void getMyLinks()
    {
		try {
			Log.info("getMyLinks " + mePath);

			MethodExecutionResult response = getRequest(mePath);
			JSONObject jsonObject = response.getJson();

			JSONObject myLinks = jsonObject.getJSONObject("_links");
			myName = jsonObject.getString("name");

			Log.info(myName + " me " + jsonObject);

			if (myLinks.has("presence")) myPresencePath = myLinks.getJSONObject("presence").getString("href");
			if (myLinks.has("note")) myNotePath = myLinks.getJSONObject("note").getString("href");
			if (myLinks.has("photo")) myPhotoPath = myLinks.getJSONObject("photo").getString("href");
			if (myLinks.has("phones")) myPhonesPath = myLinks.getJSONObject("phones").getString("href");

			if (myPhotoPath != null)
			{
				myAvatar = pushAvatar(sipUrl, myPhotoPath, myName);
			}

			getMePhones();

			if (myLinks.has("reportMyActivity"))
			{
				String reportMyActivity = myLinks.getJSONObject("reportMyActivity").getString("href");
				taskEngine.scheduleAtFixedRate(new ReportMyActivity(reportMyActivity), 0,  180000);
			}

		}
		catch(Exception e)
		{
			Log.error("Failed getMyLinks", e);
		}
    }

	public void getMePhones()
	{
		Log.info("getMePhones " + myPresencePath + " " + myNotePath + " " + myPhotoPath + " " + myPhonesPath);

		try {

			if (myPhonesPath != null)
			{
				MethodExecutionResult phonesResponse = getRequest(myPhonesPath);
				JSONArray phones = phonesResponse.getJson().getJSONObject("_embedded").getJSONArray("phone");

				for(int i = 0; i < phones.length(); i++)
				{
					JSONObject phone = phones.getJSONObject(i);
					String number = phone.getString("number");

					if ("work".equals(phone.getString("type")) && "".equals(phone) == false) myWorkPhoneNumber = number;
					if ("mobile".equals(phone.getString("type")) && "".equals(phone) == false) myMobilePhoneNumber = number;
					if ("other".equals(phone.getString("type")) && "".equals(phone) == false) myOtherPhoneNumber = number;
				}

				Log.info(myName + " phones " + myWorkPhoneNumber + " " + myMobilePhoneNumber + " " + myOtherPhoneNumber);
			}
		}
		catch(Exception e)
		{
			Log.error("Failed getMePhones", e);
		}
	}

	public void acceptWithAnswer(String url, String sdp)
	{
		try
		{
			sdp = sdp.replace("UDP/TLS/RTP/SAVPF", "RTP/SAVP");
			sdp = sdp.replace("t=0 0", "b=CT:99980\nt=0 0\na=x-devicecaps:audio:send,recv;video:send,recv");
			SessionDescription sd =  SdpFactory.getInstance().createSessionDescription(sdp);

			MediaDescription md = ((MediaDescription) sd.getMediaDescriptions(false).get(0));
			Vector<Attribute> attributes = (Vector<Attribute>) md.getAttributes(false);
			String ssrc = null;
			Vector<Attribute> deletes = new Vector<Attribute>();
			boolean rtcpMux = false;

			try {

				for (Attribute attrib : attributes)
				{
					if (attrib.getName().equals("rtcp-mux")) rtcpMux = true;
				}

				for (Attribute attrib : attributes)
				{
					Log.info("acceptWithAnswer attribute " + attrib.getName() + "=" + attrib.getValue());

					if (attrib.getName().equals("crypto"))
					{
						attrib.setValue(attrib.getValue() + "|2^31");
					}

					if (attrib.getName().equals("ssrc"))
					{
						String value = attrib.getValue();
						ssrc = value.substring(0, value.indexOf(" "));
						//deletes.add(attrib);
					}

					if (rtcpMux && attrib.getName().equals("rtcp"))
					{
						deletes.add(attrib);
					}

					if (attrib.getName().equals("candidate"))
					{
						//attrib.setValue(attrib.getValue().replace(" generation 0","").replace("udp","UDP"));
					}

					if (attrib.getName().equals("msid-semantic")) deletes.add(attrib);
				}

				for (Attribute attrib : deletes)
				{
					attributes.remove(attrib);
				}

				attributes.add(SdpFactory.getInstance().createAttribute("x-ssrc-range", ssrc + "-" + ssrc));
				//attributes.add(SdpFactory.getInstance().createAttribute("rtcp-fb", "* x-message app send:dsh recv:dsh"));
				//attributes.add(SdpFactory.getInstance().createAttribute("rtcp-rsize", null));
				//attributes.add(SdpFactory.getInstance().createAttribute("label", "main-audio"));
				//attributes.add(SdpFactory.getInstance().createAttribute("x-source", "main-audio"));

			} catch (Exception ec) {
				Log.error("acceptWithAnswer error", ec);
			}

			String sessionContext = "ofskype-" + System.currentTimeMillis();
			url = url.indexOf("http") == 0 ? url : host + url;
			HttpMethod request = new PostMethod(url + "?sessionContext=" + sessionContext);
			PostMethod postRequest = (PostMethod)request;

			postRequest.setRequestEntity(new StringRequestEntity(sd.toString(), "application/sdp", "UTF-8"));
			request.setRequestHeader("Authorization", "Bearer " + oAuthToken);

			MethodExecutionResult result = executeMethod(request);

       		int responseCode =  result.getResponseCode();
        	String body = result.getBody();

			Log.info("acceptWithAnswer " + responseCode + ":" + body + "\n" + sd);
		}
		catch(Exception ex)
		{
			Log.error("acceptWithAnswer error", ex);
		}
	}

	public void setPresence(String availability)
	{
		if (mePath != null)
		{
			if (myPresencePath == null) myPresencePath = mePath + "/presence";

			myAvailability = availability;

			try
			{
				JSONObject reqBody = new JSONObject();
				reqBody.put("availability", availability);
				postRequest(myPresencePath, reqBody);

				Log.info("setPresence " + myName + " " + availability);
			}
			catch(Exception ex)
			{
				Log.error("setPresence error", ex);
			}
		}
	}

	public void setNote(String note)
	{
		if (mePath != null)
		{
			if (myNotePath == null) myNotePath = mePath + "/note";

			myNote = note;

			try
			{
				JSONObject reqBody = new JSONObject();
				reqBody.put("message", note);
				postRequest(myNotePath, reqBody);

				Log.info("setNote " + myName + " " + note);
			}
			catch(Exception ex)
			{
				Log.error("setNote error", ex);
			}
		}
	}

    private void logon() throws Exception
    {
		if (host == null) return;

        Log.info("logon with URI " + host);

        boolean initialized = false;
        failCount.set(0);

		if(host.endsWith("/")) host = host.substring(0, host.length() - 1);

        Log.info("logon - creating application");
        createApplication();

        Log.info("logon - creating poller");

        if (pollingThread != null) pollingThread.stop();

		pollingThread = new Thread(new AsyncDataChannelPollingTask(), "SkypeClient Presence poller");
		pollingThread.setDaemon(true);
		pollingThread.start();
		pollingRunning = true;
		currentStatus.setErrorCode(ErrorCode.SUCCESS);

		if (contactsPath != null)
		{
			Log.info("logon - get all contacts ");

			getContacts(contactsPath);
		}

		if (groupsPath != null)
		{
       		Log.info("logon - get all groups/contacts");
			getAllGroupContacts(groupsPath);
		}
	}


    public JSONArray fetchContacts()
    {
		//Log.info("fetchContacts " + contactsPath);

		JSONArray contacts = new JSONArray();

		if (contactsPath != null)
		{
			try {
				MethodExecutionResult contactsResult = getRequest(contactsPath);
				contacts = contactsResult.getJson().getJSONObject("_embedded").getJSONArray("contact");
			}
			catch(Exception e)
			{
				Log.error("fetchContacts error", e);
			}

		}

		return contacts;
    }


    public JSONArray searchContacts(String query, int limit)
    {
		//Log.info("searchContacts " + searchPath);

		JSONArray contacts = new JSONArray();

		if (contactsPath != null)
		{
			try {
				MethodExecutionResult contactsResult = getRequest(searchPath + "?query=" + query + "&limit=" + limit);
				contacts = contactsResult.getJson().getJSONObject("_embedded").getJSONArray("contact");
			}
			catch(Exception e)
			{
				Log.error("searchContacts error", e);
			}

		}

		return contacts;
    }

	private void getContacts(final String contactsPath)
	{
        try {
            Runnable callable = new Runnable() {

                public void run()
                {
                    try {
						MethodExecutionResult contactsResult = getRequest(contactsPath);
						//Log.info("getContacts " + contactsResult.getJson());


						JSONArray contacts = contactsResult.getJson().getJSONObject("_embedded").getJSONArray("contact");
						JSONArray contactList = new JSONArray();

						for(int i = 0; i < contacts.length(); i++)
						{
							JSONObject contact = contacts.getJSONObject(i);
							String uri = contact.getString("uri");
							String contactJid = uri.substring(4).toLowerCase();
							String name = contact.getString("name");

							//Log.info("found contact " + name);

							contactList.put(i, uri);

							//if (cache == false)
							//{
								String photoURL = contact.getJSONObject("_links").getJSONObject("contactPhoto").getString("href");
								//pushAvatar(contactJid, photoURL, name);
							//}
						}

						subscribePresence(contactList);

                    }
                    catch(Exception e)
                    {
						Log.error("getContacts error", e);
                    }
                }
            }
;
            taskEngine.submit(callable);

        }
        catch(Exception e)
        {
			Log.error("getContacts error", e);
        }
	}

	private String pushAvatar(String contactJid, String photoURL, String contactName)
	{
		//Log.info("pushAvatar " + contactJid + " " + photoURL);
		String base64String = null;

		if (photoURL != null)
		{
            try {
				base64String = fetchAvatar(photoURL);

				//Log.debug("pushAvatar photo\n" + base64String);

				if (sipUrl.equals(contactJid) == false)	// contacts
				{
					buddies.put(contactJid, new LyncBuddy(this, jid, new JID(contactJid), "", "", contactName, base64String));

				} else {										// me

					//component.addMe(new LyncBuddy(this, jid, new JID(contactJid), "", "", contactName, base64String));
				}

			}
			catch(Exception e)
			{
				Log.error("pushAvatar error", e);
			}
		}

		return base64String;
	}

    public String fetchAvatar(String photoURL)
    {
		Log.info("fetchAvatar " + photoURL);
		String base64String = null;

		try {
			byte[] avatar = getBytesRequest(photoURL, "image/png");

			if (avatar != null)
			{
				base64String = org.jivesoftware.util.Base64.encodeBytes(avatar);

			} else {
				Log.warn("Error fetchAvatar " + photoURL);
			}
		}
		catch(Exception e)
		{
			Log.error("fetchAvatar error", e);
		}

		return base64String;
	}


	private void getAllGroupContacts(final String groupsPath)
	{
        try {
            Runnable callable = new Runnable() {

                public void run()
                {
                    try {
						MethodExecutionResult groupsResult = getRequest(groupsPath);
						JSONObject _embedded = groupsResult.getJson().getJSONObject("_embedded");

						if (_embedded.has("pinnedGroup"))
						{
							JSONObject pinnedGroup = _embedded.getJSONObject("pinnedGroup");
							getGroupContacts(pinnedGroup.getString("name"), pinnedGroup.getJSONObject("_links").getJSONObject("groupContacts").getString("href"));
						}

						JSONObject defaultGroup = _embedded.getJSONObject("defaultGroup");
						getGroupContacts(defaultGroup.getString("name"), defaultGroup.getJSONObject("_links").getJSONObject("groupContacts").getString("href"));

						JSONArray distributionGroup = _embedded.getJSONArray("distributionGroup");

						for(int i = 0; i < distributionGroup.length(); i++)
						{
							if (distributionGroup.getJSONObject(i).getJSONObject("_links").has("groupContacts"))
							{
								getGroupContacts(distributionGroup.getJSONObject(i).getString("name"), distributionGroup.getJSONObject(i).getJSONObject("_links").getJSONObject("groupContacts").getString("href"));
							}
						}

						JSONArray group = _embedded.getJSONArray("group");

						for(int i = 0; i < group.length(); i++)
						{
							if (group.getJSONObject(i).getJSONObject("_links").has("groupContacts"))
							{
								getGroupContacts(group.getJSONObject(i).getString("name"), group.getJSONObject(i).getJSONObject("_links").getJSONObject("groupContacts").getString("href"));
							}
						}
                    }
                    catch(Exception e)
                    {
						Log.error("getAllGroupContacts error", e);
                    }
                }
            }
;
            taskEngine.submit(callable);
        }
        catch(Exception e)
        {
			Log.error("getAllGroupContacts error", e);
        }
	}

	private void getGroupContacts(final String groupName, final String href)
	{
		try {
			MethodExecutionResult response = getRequest(href);
			JSONObject jsonObject = response.getJson();
			//Log.info("getGroupContacts " + groupName + "\n" + jsonObject);

			JSONArray contacts = jsonObject.getJSONObject("_embedded").getJSONArray("contact");

			int externalContacts = 0;

			for(int i = 0; i < contacts.length(); i++)
			{
				JSONObject contact = contacts.getJSONObject(i);
				String srcNetwork = contact.getString("sourceNetwork");

				if (srcNetwork.contains("SameEnterprise") == false) externalContacts++;
			}

			boolean sharedGroup = externalContacts == 0 && groupName.indexOf("family") == -1;

			for(int i = 0; i < contacts.length(); i++)
			{
				JSONObject contact = contacts.getJSONObject(i);
				String sip = contact.getString("uri").substring(4).toLowerCase();
				String workPhoneNumber = contact.has("workPhoneNumber") ? workPhoneNumber = contact.getString("workPhoneNumber")  : "";
				String displayName = contact.getString("name");
				String srcNetwork = contact.getString("sourceNetwork");
				boolean isInternal = srcNetwork.contains("SameEnterprise");

				//Log.info("getGroupContacts, found contact " + groupName + " " + displayName + " " + sip + " " + workPhoneNumber);

				if (buddies.containsKey(sip))
				{
					LyncBuddy buddy = buddies.get(sip);

					buddy.workPhoneNumber = workPhoneNumber;

					JID contactJid = new JID(JID.escapeNode(sip) + "@" + jid.getDomain());

					if (srcNetwork.contains("SameEnterprise"))
					{
						contactJid = new JID((new JID(sip)).getNode() + "@" + jid.getDomain());
					}

					//component.addRosterItem(buddy, jid, contactJid, displayName, groupName, /*sharedGroup*/ false);
					buddy.sendContactPhoto();
				}
			}
		}
		catch(Exception e)
		{
			Log.error("getGroupContacts error", e);
		}
	}

    public long getLastReceivedTimeA() {
        return 0;
    }

    public long getLastReceivedTimeB() {
        return 0;
    }

    public JID getClientId() {
        return jid;
    }

    public void close()
    {
        //Log.info("SkypeClient close");

		uninitialize();

		for (LyncBuddy buddy : buddies.values())
		{
			try {
				buddy.session.close();

			} catch ( Exception e ) { }
		}

		buddies.clear();
    }

    private HttpMethod createHttpMethod(String path, String method, Object body, String token)
    {
		Log.info("createHttpMethod " + path + " " + method + " " + body + " " + token);

		if (path == null) path = "";

        HttpMethod request = null;
        String uri = path.indexOf("http") == 0 ? path : host + path;
        try
        {
            if("POST".equalsIgnoreCase(method))
            {
                request = new PostMethod(uri);
                PostMethod postRequest = (PostMethod)request;

                if (body != null)
                {
					if (body instanceof JSONObject) postRequest.setRequestEntity(new StringRequestEntity(body.toString(), "application/json", "UTF-8"));
					if (body instanceof String) postRequest.setRequestEntity(new StringRequestEntity(body.toString(), "text/plain", "UTF-8"));
				}

            } else {
				if("DELETE".equalsIgnoreCase(method))
					request = new DeleteMethod(uri);
				else
					request = new GetMethod(uri);
			}
            request.setRequestHeader("Authorization", (new StringBuilder("Bearer ")).append(token).toString());
        }
        catch(UnsupportedEncodingException e)
        {
            String message = (new StringBuilder("Failed creating ")).append(method).append(" method to URL [").append(uri).append("] due to unsupported encoding").toString();
            Log.error(message, e);
        }
        return request;
    }


    public void subscribePresence(final JSONArray contacts) throws SessionExpiredException
    {
		if (presenceSubscriptionsPath != null)
		{
			try {
				Runnable callable = new Runnable() {

					public void run()
					{
						try {
							JSONObject reqBody = new JSONObject();
							reqBody.put("duration", getSubscriptionDuration());
							reqBody.put("uris", contacts);
							postRequest(presenceSubscriptionsPath, reqBody);
						}
						catch(Exception e)
						{
							Log.error("Error while subscribing to contacts", e);
						}
					}
				}
	;
				taskEngine.submit(callable);
			}
			catch(Exception e)
			{
				Log.error("Failed to subscribe to user presence", e);
			}
		}
    }

    private int getSubscriptionDuration()
    {
        return 30;
    }


    private PollingResult getEvents()
    {
        PollingResult result = new PollingResult(true);
        try
        {
            MethodExecutionResult executionResult = getRequest(eventsPath);
            JSONObject res = executionResult.getJson();

            Log.warn("getEvents \n" + res);

            if(executionResult.getResponseCode() > 204 || res == null)
            {
                String message = String.format("Error while running polling request. Got responde code %d from server with message: '%s'", new Object[] {
                    Integer.valueOf(executionResult.getResponseCode()), executionResult.getBody()
                });
                Log.error(message);
                result.setSuccess(false);
                result.setErrorMessage(message);
                result.setWebFail(true);
                result.setErrorResponse(executionResult.getBody());

                return result;

            } else  {
                //Log.info("getEvents " + res);
            }

			if (res.has("_links"))
			{
            	eventsPath = res.getJSONObject("_links").getJSONObject("next").getString("href");

				synchronized(updateQueue)
				{
					JSONArray senders = res.getJSONArray("sender");

					for(int i = 0; i < senders.length(); i++)
					{
						JSONObject sender = senders.getJSONObject(i);
						JSONArray events = sender.getJSONArray("events");

						//Log.info("Incoming event from " + sender);

						for(int j = 0; j < events.length(); j++)
						{
							JSONObject event = events.getJSONObject(j);
							JSONObject link = event.getJSONObject("link");

							Log.info("Incoming link " + link);
							Log.info("Incoming event " + event);

							if("phoneAudio".equals(link.getString("rel")))
							{
								JSONObject phoneAudio = event.getJSONObject("_embedded").getJSONObject("phoneAudio");
								JSONObject phoneAudioLinks = phoneAudio.getJSONObject("_links");

								if (phoneAudioLinks.has("stopPhoneAudio"))
								{
									stopPhoneAudioHref = phoneAudioLinks.getJSONObject("stopPhoneAudio").getString("href");
								}

								if (phoneAudioLinks.has("holdPhoneAudio"))
								{
									holdPhoneAudioHref = phoneAudioLinks.getJSONObject("holdPhoneAudio").getString("href");
								}

								if (phoneAudioLinks.has("resumePhoneAudio"))
								{
									resumePhoneAudioHref = phoneAudioLinks.getJSONObject("resumePhoneAudio").getString("href");
								}


								String selfPhoneAudioHref = phoneAudioLinks.getJSONObject("self").getString("href");
								String phoneAudioState = phoneAudio.getString("state");

								if ("Disconnected".equals(phoneAudioState))
								{
									for (ActivePhoneAudio activePhoneAudio :  callIds.values())
									{
										if (activePhoneAudio.selfPhoneAudioHref.equals(selfPhoneAudioHref))
										{
											//TraderLyncComponent.self.outgoingCallNotification(this.user, activePhoneAudio.callId, false, null, null);
										}
									}
								}
							}

/*
{
	"_embedded":{
		"audioVideoInvitation":{
			"threadId":"AdHImvRmKGPHFoIBQcWiHS0dvcF87Q==",
			"_links":{
				"audioVideo":{"href":"/ucwa/oauth/v1/applications/10672188129/communication/conversations/b65b47e0-8178-47a8-8f48-8868245f1b1a/audioVideo"},
				"mediaOffer":{"href":"data:multipart/alternative;charset=utf-8;boundary=d38d183e-6415-438f-8ff5-4ed634919226,--d38d183e-6415-438f-8ff5-4ed634919226%0d%0aContent-Type%3a+application%2fsdp%0d%0aContent-ID%3a+%3c32149ef6638b65004752a1465a8bc569%40olajide.net%3e%0d%0aContent-Disposition%3a+session%3b+handling%3doptional%3b+ms-proxy-2007fallback%0d%0a%0d%0av%3d0%0d%0ao%3d-+0+0+IN+IP4+131.253.141.166%0d%0as%3dsession%0d%0ac%3dIN+IP4+131.253.141.166%0d%0ab%3dCT%3a99980%0d%0at%3d0+0%0d%0am%3daudio+55441+RTP%2fAVP+117+104+114+9+112+111+0+103+8+116+115+97+13+118+101%0d%0aa%3dcandidate%3aBJG5XDfUp7LbhulOKzU0MdyDFaXqTEkyPo9FoVQxwxY+1+DhULez4ppG6UIm8QTT2eNA+UDP+0.830+192.168.1.253+50004+%0d%0aa%3dcandidate%3aBJG5XDfUp7LbhulOKzU0MdyDFaXqTEkyPo9FoVQxwxY+2+DhULez4ppG6UIm8QTT2eNA+UDP+0.830+192.168.1.253+50005+%0d%0aa%3dcandidate%3asRUsqXqQt9zOvke99XYbA4GhshUxhXPllH9d%2fFZYnLQ+1+zM3NryK01WlFKEj8lAJgvQ+UDP+0.410+131.253.141.166+55441+%0d%0aa%3dcandidate%3asRUsqXqQt9zOvke99XYbA4GhshUxhXPllH9d%2fFZYnLQ+2+zM3NryK01WlFKEj8lAJgvQ+UDP+0.410+131.253.141.166+52487+%0d%0aa%3dcandidate%3aQExbZsVtU%2bqCArBf8Zj0hnc0BmhzTLuzA2UFGHBO0Xo+1+lCoYgy%2bfbgHH0l0ZGgziiw+UDP+0.550+146.198.59.239+50006+%0d%0aa%3dcandidate%3aQExbZsVtU%2bqCArBf8Zj0hnc0BmhzTLuzA2UFGHBO0Xo+2+lCoYgy%2bfbgHH0l0ZGgziiw+UDP+0.550+146.198.59.239+50007+%0d%0aa%3dcryptoscale%3a1+client+AES_CM_128_HMAC_SHA1_80+inline%3algCqKXxbxZbNm5y6BN76dUfRBW3Z4UI53IwDLj7C%7c2%5e31%7c1%3a1%0d%0aa%3dcrypto%3a2+AES_CM_128_HMAC_SHA1_80+inline%3al66PA6e3xsp7M%2fCaclNPb3wejr5sKhr2ZLzDfyno%7c2%5e31%7c1%3a1%0d%0aa%3dcrypto%3a3+AES_CM_128_HMAC_SHA1_80+inline%3aBl5qaZ1TJtBuTACwDszIaFAnKJ%2f5JYF6zkmNgTph%7c2%5e31%0d%0aa%3dmaxptime%3a200%0d%0aa%3drtcp%3a52487%0d%0aa%3drtpmap%3a117+G722%2f8000%2f2%0d%0aa%3drtpmap%3a104+SILK%2f16000%0d%0aa%3dfmtp%3a104+useinbandfec%3d1%3b+usedtx%3d0%0d%0aa%3drtpmap%3a114+x-msrta%2f16000%0d%0aa%3dfmtp%3a114+bitrate%3d29000%0d%0aa%3drtpmap%3a9+G722%2f8000%0d%0aa%3drtpmap%3a112+G7221%2f16000%0d%0aa%3dfmtp%3a112+bitrate%3d24000%0d%0aa%3drtpmap%3a111+SIREN%2f16000%0d%0aa%3dfmtp%3a111+bitrate%3d16000%0d%0aa%3drtpmap%3a0+PCMU%2f8000%0d%0aa%3drtpmap%3a103+SILK%2f8000%0d%0aa%3dfmtp%3a103+useinbandfec%3d1%3b+usedtx%3d0%0d%0aa%3drtpmap%3a8+PCMA%2f8000%0d%0aa%3drtpmap%3a116+AAL2-G726-32%2f8000%0d%0aa%3drtpmap%3a115+x-msrta%2f8000%0d%0aa%3dfmtp%3a115+bitrate%3d11800%0d%0aa%3drtpmap%3a97+RED%2f8000%0d%0aa%3drtpmap%3a13+CN%2f8000%0d%0aa%3drtpmap%3a118+CN%2f16000%0d%0aa%3drtpmap%3a101+telephone-event%2f8000%0d%0aa%3dfmtp%3a101+0-16%0d%0aa%3dptime%3a20%0d%0a%0d%0a--d38d183e-6415-438f-8ff5-4ed634919226%0d%0aContent-Type%3a+application%2fsdp%0d%0aContent-ID%3a+%3c16dc9d71101116c17454be00d1d3a843%40olajide.net%3e%0d%0aContent-Disposition%3a+session%3b+handling%3doptional%0d%0a%0d%0av%3d0%0d%0ao%3d-+0+1+IN+IP4+131.253.141.158%0d%0as%3dsession%0d%0ac%3dIN+IP4+131.253.141.158%0d%0ab%3dCT%3a99980%0d%0at%3d0+0%0d%0aa%3dx-devicecaps%3aaudio%3asend%2crecv%3bvideo%3asend%2crecv%0d%0am%3daudio+59224+RTP%2fAVP+117+104+114+9+112+111+0+103+8+116+115+97+13+118+101%0d%0aa%3dx-ssrc-range%3a4170446592-4170446592%0d%0aa%3drtcp-fb%3a*+x-message+app+send%3adsh+recv%3adsh%0d%0aa%3drtcp-rsize%0d%0aa%3dlabel%3amain-audio%0d%0aa%3dx-source%3amain-audio%0d%0aa%3dice-ufrag%3aqTWN%0d%0aa%3dice-pwd%3a2o2rsADDtO3pvvcdWePDtHhn%0d%0aa%3dcandidate%3a1+1+UDP+2130706431+192.168.1.253+50016+typ+host+%0d%0aa%3dcandidate%3a1+2+UDP+2130705918+192.168.1.253+50017+typ+host+%0d%0aa%3dcandidate%3a2+1+TCP-PASS+174456319+131.253.141.198+54367+typ+relay+raddr+131.253.141.254+rport+50019+%0d%0aa%3dcandidate%3a2+2+TCP-PASS+174455806+131.253.141.198+54367+typ+relay+raddr+131.253.141.254+rport+50019+%0d%0aa%3dcandidate%3a3+1+UDP+184548351+131.253.141.158+59224+typ+relay+raddr+146.198.59.239+rport+50002+%0d%0aa%3dcandidate%3a3+2+UDP+184547838+131.253.141.158+53988+typ+relay+raddr+146.198.59.239+rport+50003+%0d%0aa%3dx-candidate-ipv6%3a4+1+UDP+184547839+2a01%3a111%3a202b%3aa%3a%3a24+52280+typ+relay+raddr+146.198.59.239+rport+50002+%0d%0aa%3dx-candidate-ipv6%3a4+2+UDP+184547326+2a01%3a111%3a202b%3aa%3a%3a24+57150+typ+relay+raddr+146.198.59.239+rport+50003+%0d%0aa%3dcandidate%3a5+1+UDP+1694234623+146.198.59.239+50002+typ+srflx+raddr+192.168.1.253+rport+50002+%0d%0aa%3dcandidate%3a5+2+UDP+1694234110+146.198.59.239+50003+typ+srflx+raddr+192.168.1.253+rport+50003+%0d%0aa%3dcandidate%3a6+1+TCP-ACT+174847487+131.253.141.198+54367+typ+relay+raddr+131.253.141.254+rport+50019+%0d%0aa%3dcandidate%3a6+2+TCP-ACT+174846974+131.253.141.198+54367+typ+relay+raddr+131.253.141.254+rport+50019+%0d%0aa%3dx-candidate-ipv6%3a7+1+TCP-PASS+174453759+2a01%3a111%3a202b%3aa%3a%3a4c+59744+typ+relay+raddr+131.253.141.254+rport+50019+%0d%0aa%3dx-candidate-ipv6%3a7+2+TCP-PASS+174453246+2a01%3a111%3a202b%3aa%3a%3a4c+59744+typ+relay+raddr+131.253.141.254+rport+50019+%0d%0aa%3dx-candidate-ipv6%3a8+1+TCP-ACT+174846463+2a01%3a111%3a202b%3aa%3a%3a4c+59744+typ+relay+raddr+131.253.141.254+rport+50019+%0d%0aa%3dx-candidate-ipv6%3a8+2+TCP-ACT+174845950+2a01%3a111%3a202b%3aa%3a%3a4c+59744+typ+relay+raddr+131.253.141.254+rport+50019+%0d%0aa%3dcandidate%3a9+1+TCP-ACT+1684795391+131.253.141.254+50019+typ+srflx+raddr+192.168.1.253+rport+50019+%0d%0aa%3dcandidate%3a9+2+TCP-ACT+1684794878+131.253.141.254+50019+typ+srflx+raddr+192.168.1.253+rport+50019+%0d%0aa%3dcryptoscale%3a1+client+AES_CM_128_HMAC_SHA1_80+inline%3algCqKXxbxZbNm5y6BN76dUfRBW3Z4UI53IwDLj7C%7c2%5e31%7c1%3a1%0d%0aa%3dcrypto%3a2+AES_CM_128_HMAC_SHA1_80+inline%3al66PA6e3xsp7M%2fCaclNPb3wejr5sKhr2ZLzDfyno%7c2%5e31%7c1%3a1%0d%0aa%3dcrypto%3a3+AES_CM_128_HMAC_SHA1_80+inline%3aBl5qaZ1TJtBuTACwDszIaFAnKJ%2f5JYF6zkmNgTph%7c2%5e31%0d%0aa%3dmaxptime%3a200%0d%0aa%3drtcp%3a53988%0d%0aa%3drtpmap%3a117+G722%2f8000%2f2%0d%0aa%3drtpmap%3a104+SILK%2f16000%0d%0aa%3dfmtp%3a104+useinbandfec%3d1%3b+usedtx%3d0%0d%0aa%3drtpmap%3a114+x-msrta%2f16000%0d%0aa%3dfmtp%3a114+bitrate%3d29000%0d%0aa%3drtpmap%3a9+G722%2f8000%0d%0aa%3drtpmap%3a112+G7221%2f16000%0d%0aa%3dfmtp%3a112+bitrate%3d24000%0d%0aa%3drtpmap%3a111+SIREN%2f16000%0d%0aa%3dfmtp%3a111+bitrate%3d16000%0d%0aa%3drtpmap%3a0+PCMU%2f8000%0d%0aa%3drtpmap%3a103+SILK%2f8000%0d%0aa%3dfmtp%3a103+useinbandfec%3d1%3b+usedtx%3d0%0d%0aa%3drtpmap%3a8+PCMA%2f8000%0d%0aa%3drtpmap%3a116+AAL2-G726-32%2f8000%0d%0aa%3drtpmap%3a115+x-msrta%2f8000%0d%0aa%3dfmtp%3a115+bitrate%3d11800%0d%0aa%3drtpmap%3a97+RED%2f8000%0d%0aa%3drtpmap%3a13+CN%2f8000%0d%0aa%3drtpmap%3a118+CN%2f16000%0d%0aa%3drtpmap%3a101+telephone-event%2f8000%0d%0aa%3dfmtp%3a101+0-16%0d%0aa%3drtcp-mux%0d%0aa%3dptime%3a20%0d%0a%0d%0a--d38d183e-6415-438f-8ff5-4ed634919226--%0d%0a"},
				"reportMediaDiagnostics":{"href":"/ucwa/oauth/v1/applications/10672188129/communication/callMediaDiagnostics?callId=fc86b78dd87947949c7831d88abbb311&fromUri=sip%3adele%40olajide.net&mediaType=Audio&toUri=sip%3adele%40traderlynk.com"},
				"sendProvisionalAnswer":{"href":"/ucwa/oauth/v1/applications/10672188129/communication/audioVideoInvitations/5bc132f55a2941059141aa0625584ffe/sendProvisionalAnswer"},
				"decline":{"href":"/ucwa/oauth/v1/applications/10672188129/communication/audioVideoInvitations/5bc132f55a2941059141aa0625584ffe/decline"},
				"self":{"href":"/ucwa/oauth/v1/applications/10672188129/communication/audioVideoInvitations/5bc132f55a2941059141aa0625584ffe"},
				"acceptWithAnswer":{"href":"/ucwa/oauth/v1/applications/10672188129/communication/audioVideoInvitations/5bc132f55a2941059141aa0625584ffe/acceptWithAnswer"},
				"to":{"href":"/ucwa/oauth/v1/applications/10672188129/people/dele@traderlynk.com"},
				"conversation":{"href":"/ucwa/oauth/v1/applications/10672188129/communication/conversations/b65b47e0-8178-47a8-8f48-8868245f1b1a"}
			},
			"_embedded":{
				"from":{
					"_links":{
						"contact":{"href":"/ucwa/oauth/v1/applications/10672188129/people/dele@olajide.net"},
						"contactPresence":{"href":"/ucwa/oauth/v1/applications/10672188129/people/dele@olajide.net/presence"},
						"self":{"href":"/ucwa/oauth/v1/applications/10672188129/communication/conversations/b65b47e0-8178-47a8-8f48-8868245f1b1a/participants/dele@olajide.net"},
						"conversation":{"href":"/ucwa/oauth/v1/applications/10672188129/communication/conversations/b65b47e0-8178-47a8-8f48-8868245f1b1a"}
					},
					"sourceNetwork":"Federated",
					"name":"Dele Olajide",
					"rel":"participant",
					"anonymous":false,
					"uri":"sip:dele@olajide.net",
					"local":false
				}
			},
			"importance":"Normal",
			"subject":"",
			"bandwidthControlId":"fc86b78dd87947949c7831d88abbb311",
			"privateLine":false,
			"rel":"audioVideoInvitation",
			"state":"Connecting",
			"direction":"Incoming"
		}
	},
	"link":{
		"rel":"audioVideoInvitation",
		"href":"/ucwa/oauth/v1/applications/10672188129/communication/audioVideoInvitations/5bc132f55a2941059141aa0625584ffe"
	},
	"type":"started"
}
*/
							if("audioVideoInvitation".equals(link.getString("rel")))
							{
								JSONObject audioVideoInvitation = event.getJSONObject("_embedded").getJSONObject("audioVideoInvitation");
								JSONObject audioVideoInvitationLinks = audioVideoInvitation.getJSONObject("_links");

								String acceptWithAnswerHref = null;

								if (audioVideoInvitationLinks.has("acceptWithAnswer"))
								{
									acceptWithAnswerHref = audioVideoInvitationLinks.getJSONObject("acceptWithAnswer").getString("href");
								}

								if (audioVideoInvitationLinks.has("mediaOffer"))
								{
									String multipartAlternative = audioVideoInvitationLinks.getJSONObject("mediaOffer").getString("href");

									int pos = multipartAlternative.indexOf(",");

									if (pos > -1)
									{
										String header = multipartAlternative.substring(0, pos);
										String body = multipartAlternative.substring(pos + 1);
										String boundary = header.substring(header.indexOf("boundary=") + 9);
										String[] multiparts = body.split("--" + boundary);

										for (int z=0; z<multiparts.length; z++)
										{
											String sdp = URLDecoder.decode(multiparts[z], "UTF-8");

											if (sdp.indexOf("ms-proxy-2007fallback") == -1 && sdp.indexOf("handling=optional") > -1)
											{
												sdp = sdp.substring(sdp.indexOf("v=0"));
												OfSkypePlugin.self.makeCall(sipUrl, sdp, audioVideoInvitation);
												break;
											}
										}
									}
								}

							}

							if("phoneAudioInvitation".equals(link.getString("rel")))
							{
								JSONObject phoneAudioInvitation = event.getJSONObject("_embedded").getJSONObject("phoneAudioInvitation");
								JSONObject phoneAudioInvitationLinks = phoneAudioInvitation.getJSONObject("_links");

								if (phoneAudioInvitationLinks.has("phoneAudio"))
								{
									String href = phoneAudioInvitationLinks.getJSONObject("phoneAudio").getString("href");
									String callId = phoneAudioInvitation.getString("operationId");

									ActivePhoneAudio activePhoneAudio = new ActivePhoneAudio();

									activePhoneAudio.stopPhoneAudioHref = stopPhoneAudioHref;
									activePhoneAudio.holdPhoneAudioHref = holdPhoneAudioHref;
									activePhoneAudio.resumePhoneAudioHref = resumePhoneAudioHref;
									activePhoneAudio.selfPhoneAudioHref = href;
									activePhoneAudio.callId = callId;

									callIds.put(callId, activePhoneAudio);

									Log.info("phoneAudioInvitation " + href + " " + callId);
								}
							}

							if("contactPresence".equals(link.getString("rel")) || "contactNote".equals(link.getString("rel")))
							{
								JSONObject contact = event.getJSONObject("in");
								String rel = contact.getString("rel");
								String href = contact.getString("href");

								if("contact".equals(rel))
								{
									updateQueue.push(new UCWAUpdateEvent("contactPresence", (new StringBuilder(String.valueOf(href))).append("/presence").toString()));
									updateQueue.push(new UCWAUpdateEvent("contactNote", (new StringBuilder(String.valueOf(href))).append("/note").toString()));
									result.setAddedEvents(true);

								} else  {
									String msg = String.format("Error while parsing contactPresence or contactNote events. The rel property contained an invalid value '%s'.", new Object[] {
										rel
									});
									Log.error(msg);
									result.setSuccess(false);
									result.setErrorMessage(msg);
								}
							}


							if("onlineMeetingInvitation".equals(link.getString("rel")))
							{
								JSONObject onlineMeetingInvitation = event.getJSONObject("_embedded").getJSONObject("onlineMeetingInvitation");
								JSONObject onlineMeetingInvitationLinks = onlineMeetingInvitation.getJSONObject("_links");

								String sip = onlineMeetingInvitation.getJSONObject("_embedded").getJSONObject("from").getString("uri").substring(4);
								String type = event.getString("type");

								Log.info("Got onlineMeetingInvitation " + sip + " " + type);

								if ("started".equals(type))
								{
									if (onlineMeetingInvitationLinks.has("accept"))
									{
										String acceptPath = onlineMeetingInvitationLinks.getJSONObject("accept").getString("href");

										// auto-accept
										postRequest(acceptPath, null);
									}
								}
							}

							if("messagingInvitation".equals(link.getString("rel")))
							{
								JSONObject messagingInvitation = event.getJSONObject("_embedded").getJSONObject("messagingInvitation");
								JSONObject invitationLinks = messagingInvitation.getJSONObject("_links");

								if (invitationLinks.has("accept"))
								{
									String acceptPath = invitationLinks.getJSONObject("accept").getString("href");
									String message = dataUriDecode(invitationLinks.getJSONObject("message").getString("href"));
									String conversationPath = invitationLinks.getJSONObject("conversation").getString("href");

									String sip = messagingInvitation.getJSONObject("_embedded").getJSONObject("from").getString("uri").substring(4);
									Log.info("messagingInvitation lync -> xmpp " + sip + " " + conversationPath);
									conversations.put(conversationPath, new ChatRoom(sip, conversationPath));
									conversations.put(sip, new ChatRoom(sip, conversationPath));

									try {
										if (buddies.containsKey(sip))
										{
											LyncBuddy buddy = buddies.get(sip);
											buddy.sendMessagingInvite(message);
										}
									} catch (Exception e) {
										Log.error("messagingInvitation ", e);
									}

									// auto-accept
									Log.info("Got message invitation " + message + " " + sip);
									postRequest(acceptPath, null);

								} else {

									if (messagingInvitation.has("_embedded") && messagingInvitation.getJSONObject("_embedded").has("acceptedByParticipant"))
									{
										JSONArray acceptedByParticipant = messagingInvitation.getJSONObject("_embedded").getJSONArray("acceptedByParticipant");

										if (acceptedByParticipant != null)
										{
											for(int z = 0; z < acceptedByParticipant.length(); z++)
											{
												JSONObject participant = acceptedByParticipant.getJSONObject(z);
												String sip = participant.getString("uri").substring(4);
												String conversationPath = participant.getJSONObject("_links").getJSONObject("conversation").getString("href");

												Log.info("messagingInvitation xmpp -> lync " + sip + " " + conversationPath);

												conversations.put(conversationPath, new ChatRoom(sip, conversationPath, messagingInvitation.getString("operationId")));
												conversations.put(sip, new ChatRoom(sip, conversationPath, messagingInvitation.getString("operationId")));
											}
										}
									}
								}
							}

							if("message".equals(link.getString("rel")))
							{
								JSONObject message = event.getJSONObject("_embedded").getJSONObject("message").getJSONObject("_links");
								String conversationHref = sender.getString("href");
								String msgUri = null;

								if (message.has("htmlMessage"))
								{
									msgUri = dataUriDecode(message.getJSONObject("htmlMessage").getString("href"));
								}

								if (message.has("plainMessage"))
								{
									msgUri = dataUriDecode(message.getJSONObject("plainMessage").getString("href"));
								}

								if (msgUri != null)
								{
									Log.info("New message " + msgUri + " " + conversationHref);

									String sendMessageUri = conversationHref + "/messaging/messages";
									postRequest(sendMessageUri + "?operationContext=" + System.currentTimeMillis(), "re: " + msgUri);

									if (conversations.containsKey(conversationHref))
									{
										ChatRoom chatRoom = conversations.get(conversationHref);

										if (buddies.containsKey(chatRoom.sip))
										{
											LyncBuddy buddy = buddies.get(chatRoom.sip);
											buddy.sendMessage(msgUri, chatRoom.operationId);
										}

										//component.incomingChat(this, jid, chatRoom.sip, msgUri, chatRoom.operationId);

									} else {
										//component.incomingChat(this, jid, null, msgUri, null);
									}
								}
							}

							if("messaging".equals(link.getString("rel")))
							{
								JSONObject messagingLinks= event.getJSONObject("_embedded").getJSONObject("messaging").getJSONObject("_links");
								String state = event.getJSONObject("_embedded").getJSONObject("messaging").getString("state");

								if ("Connected".equals(state))
								{
									String sendMessageUri = messagingLinks.getJSONObject("sendMessage").getString("href");
								}

								if ("Disconnected".equals(state))
								{
									if (messagingLinks.has("addMessaging"))
									{
										String addMessagingUri = messagingLinks.getJSONObject("addMessaging").getString("href");

										Log.info("Adding messaging modality " + addMessagingUri);
										//postRequest(addMessagingUri, null);
									}

								}
							}

							if("conversation".equals(link.getString("rel")))
							{
								if (event.has("_embedded"))
								{
									JSONObject conversation = event.getJSONObject("_embedded").getJSONObject("conversation").getJSONObject("_links");
									String state = event.getJSONObject("_embedded").getJSONObject("conversation").getString("state");

									if ("Disconnected".equals(state))
									{
										String conversationHref = conversation.getJSONObject("self").getString("href");

										if (conversations.containsKey(conversationHref))
										{
											ChatRoom chatRoom = conversations.get(conversationHref);

											if (buddies.containsKey(chatRoom.sip))
											{
												LyncBuddy buddy = buddies.get(chatRoom.sip);
												buddy.leaveChatRoom(chatRoom.operationId);
											}

											conversations.remove(chatRoom.sip);
											conversations.remove(conversationHref);
										}
									}


									if ("Conferenced".equals(state))				// online meeting, we have to add partcipant to get messages
									{
										if (conversation.has("addParticipant"))
										{
											String addParticipantUri = conversation.getJSONObject("addParticipant").getString("href");

											Log.info("Adding participant " + addParticipantUri);

											JSONObject reqBody = new JSONObject();
											reqBody.put("sessionContext",  "add-participant-" + System.currentTimeMillis());
											reqBody.put("to", "sip:" + sipUrl);
											postRequest(addParticipantUri, reqBody);
										}
									}
								}
							}
						}

					}
				}
			}
        }
        catch(Exception e)
        {
            Log.error("Exception was thrown while calling GetEvents", e);
            return new PollingResult(false, (new StringBuilder("Error while polling for presence, details in logs: ")).append(e.getMessage()).toString());
        }
        return result;
    }


    public String requestAction(String callId, String action)
    {
		Log.info("requestAction " + callId + " " + action);

		try {

			if (callIds.containsKey(callId))
			{
				ActivePhoneAudio phoneAudio = callIds.get(callId);

				String href = null;

				if (action.equals("stopPhoneAudio"))
				{
					callIds.remove(callId);
					href = phoneAudio.stopPhoneAudioHref;
				}
				else

				if (action.equals("holdPhoneAudio"))
				{
					href = phoneAudio.holdPhoneAudioHref;
				}

				else

				if (action.equals("resumePhoneAudio"))
				{
					href = phoneAudio.resumePhoneAudioHref;
				}

				if (href != null)
				{
					MethodExecutionResult executionResult = postRequest(href, null);
					return executionResult.getResponseCode() < 400 ? null : "Normalization Failed";

				} else {
					return "Action not supported";
				}
			} else {
				return "Call Id not found";
			}
		}
		catch(Exception e)
		{
			Log.error("requestAction error", e);
			return e.toString();
		}
    }

    public String makePhoneCall(String to, String phoneNumber, String callId, String subject)
    {
		Log.info("makePhoneCall " + to + " " + callId + " " + subject + " " + phoneNumber + " " + startPhoneAudioPath);

		if (phoneNumber.indexOf("tel:") == -1) phoneNumber = "tel:" + phoneNumber;
		if (to.indexOf("tel:") == 0) to = to.substring(4);

		try {

			boolean ucwaEnabled = JiveGlobals.getBooleanProperty("skype.ucwa.enabled", true);

			if (ucwaEnabled)
			{
				JSONObject reqBody = new JSONObject();
				reqBody.put("phoneNumber", phoneNumber);
				reqBody.put("operationId", callId);
				reqBody.put("subject", subject);
				reqBody.put("to", to);

				MethodExecutionResult executionResult = postRequest(startPhoneAudioPath, reqBody);

				return executionResult.getResponseCode() < 400 ? null : "makePhoneCall Failed";
			}
		}
		catch(Exception e)
		{
			Log.error("makePhoneCall error", e);
			return e.toString();
		}

		return "makePhoneCall Failed";
    }

	private String extractDDI(String telephoneUri)
	{
		String ddi = null;

		if (telephoneUri != null)
		{
			int pos = telephoneUri.indexOf(";ddi=");

			if (pos > -1)
			{
				ddi = telephoneUri.substring(pos + 5);
				pos = ddi.indexOf(";");
				if (pos == -1) pos = ddi.length();
				ddi = ddi.substring(0, pos);
			}
		}

		return ddi;
	}

	private String extractTel(String telephoneUri)
	{
		String tel = "";

		if (telephoneUri != null)
		{
			int pos = telephoneUri.indexOf(";");
			if (pos == -1) pos = telephoneUri.length();
			tel = telephoneUri.substring(0, pos);
			if (tel.startsWith("tel:")) tel = tel.substring(4);
		}

		return tel;
	}

    public void sendInvite(String sip, String roomId, String subject)
    {
		Log.info("sendInvite " + sip);

		if (conversations.containsKey(sip) == false)
		{
			Log.info("sendInvite new conversation " + sip);

			try {
				JSONObject reqBody = new JSONObject();
				reqBody.put("importance", "Normal");
				reqBody.put("sessionContext", "TL-SC-" + System.currentTimeMillis());
				reqBody.put("operationId", roomId + "|" + System.currentTimeMillis());
				reqBody.put("subject", subject);
				reqBody.put("to", "sip:" + sip);

				postRequest(startMessagingPath, reqBody);

			}
			catch(Exception e)
			{
				Log.error("sendInvite error", e);
			}
		} else {
			Log.info("sendInvite re-use existing conversation " + sip);
		}
    }


    public void closeConversation(String sip)
    {
		Log.info("closeConversation " + sip);

        try {

			if (conversations.containsKey(sip))
			{
				//Log.info("closeConversation found " + conversations.get(sip).conversationHref);

				String conversationHref = conversations.get(sip).conversationHref;
				String stopMessageUri = conversationHref + "/messaging/terminate";
				postRequest(stopMessageUri, null);
				//request("DELETE", conversationHref, null);
			}
        }
        catch(Exception e)
        {
            Log.error("closeConversation error", e);
        }
	}

    public void sendMessage(String sip, String text)
    {
		Log.info("sendMessage " + sip + " " + text);

        try {

			if (conversations.containsKey(sip))
			{
				String sendMessageUri = conversations.get(sip).conversationHref + "/messaging/messages";
				postRequest(sendMessageUri + "?operationContext=" + System.currentTimeMillis(), text);
			}
        }
        catch(Exception e)
        {
            Log.error("sendMessage error", e);
        }
    }
    private JSONObject sanitizeJson(String response) throws JSONException
    {
        return new JSONObject(response.replaceAll("^[^{]", ""));
    }

    private InitCallResponse getInitialPath() throws IOException, JSONException
    {
		Log.info("getInitialPath " + host + " " + oAuthToken);

        URI uri = new URI(host, false);
        String originalPath = "";

        if(!StringUtils.isNullOrEmpty(uri.getPath()))
        {
            originalPath = uri.getPath();
            if(originalPath.endsWith("/")) originalPath = originalPath.substring(0, originalPath.length() - 1);
        }

        uri.setPath((new StringBuilder(String.valueOf(originalPath))).append("/Autodiscover/AutodiscoverService.svc/root/oauth/user").toString());

        if(uri.getHost() == null)
        {
			Log.error("The server URL is not valid " + host);
			return null;
		}

        uri.setQuery((new StringBuilder("originalDomain=")).append(urlEncode(uri.getHost())).toString());
        GetMethod request = new GetMethod(uri.toString());

        if(oAuthToken != null) request.addRequestHeader("Authorization", (new StringBuilder("Bearer ")).append(oAuthToken).toString());

        URL url = new URL(uri.toString());
        HttpClient httpClient = httpClientManager.getClient(url);
        int responseCode = httpClient.executeMethod(request);

        if(responseCode == 401)
        {
            Header responseHeaders[] = request.getResponseHeaders("WWW-Authenticate");
            Header aheader[];
            int k = (aheader = responseHeaders).length;

            for(int j = 0; j < k; j++)
            {
                Header h = aheader[j];
                String value = h.getValue();
                Matcher matcher = oauthPathHeaderPattern.matcher(value);

                if(matcher.find()) return new InitCallResponse(matcher.group(1), responseCode);
            }

            String message = "Got the expected 401 from server, but required headers were not present.";
            Log.error(message);

        } else if(responseCode == 200)  {

            String jsonStr = getStringFromResponse(request);
            //Log.info((new StringBuilder("Response 200 from auto-discover: ")).append(jsonStr).toString());
            JSONObject res = sanitizeJson(jsonStr);

            if(res.has("_links"))
            {
                JSONObject applications = res.getJSONObject("_links").getJSONObject("applications");
                return new InitCallResponse(applications.getString("href"), responseCode);
            }

            if(res.has("User"))
            {
                JSONArray links = res.getJSONObject("User").getJSONArray("Links");
                for(int i = 0; i < links.length(); i++)
                {
                    JSONObject link = links.getJSONObject(i);
                    if("Ucwa".equals(link.getString("token")))
                        return new InitCallResponse(link.getString("href"), responseCode);
                }

            } else  {
                String message = "Got invalid JSON from autodiscover method.";
                Log.error((new StringBuilder(String.valueOf(message))).append(" Response: ").append(jsonStr).toString());
            }

        } else  {
            Log.error("Got an unexpected response code from server while trying to acquire oAuth tokens " + responseCode);
			return null;
        }

        Log.error("Failed to get oAuth tokens. oAuth acquisition headers were not found in the unauthenticated request.");
        return null;
    }

    private String urlEncode(String user) throws UnsupportedEncodingException
    {
        return URLEncoder.encode(user, "UTF-8");
    }

    private MethodExecutionResult postBatchRequest(String resourcePath, List updates)
    {
		String uri = resourcePath.indexOf("http") == 0 ? resourcePath : host + resourcePath;
		MethodExecutionResult response;
		String boundary = UUID.randomUUID().toString();

        try
        {
			PostMethod postRequest = new PostMethod(uri);
			URL url = new URL(uri);
			String body = parseBatchPresenceMultipartBody(boundary, updates, url.getHost());
			postRequest.setRequestEntity(new StringRequestEntity(body, (new StringBuilder("multipart/batching;boundary=\"")).append(boundary).append("\"").toString(), "UTF-8"));
			postRequest.setRequestHeader("Authorization", (new StringBuilder("Bearer ")).append(oAuthToken).toString());
			postRequest.setRequestHeader("Accept", "multipart/batching");

			response = executeMethodString(postRequest);

			if(response == null || response.getBody() == null)
            	return null;

            return response;
        }
        catch(Exception e)
        {
            Log.error((new StringBuilder("Failed creating batch method to URL [")).append(uri).append("]").toString(), e);
            return null;
        }
    }

	private String dataUriDecode(String uri)
	{
		if (!uri.toLowerCase().startsWith("data:")) {
			return uri;
		}

		try {
			String data = uri.substring(uri.indexOf(',') + 1);
			return URLDecoder.decode(data, "UTF-8");
		} catch (UnsupportedEncodingException e) {
			return null;
		}
	}

    private String parseBatchPresenceMultipartBody(String boundary, List updates, String host)
    {
        StringBuilder sb = new StringBuilder();
        sb.append("--").append(boundary);

        for(Iterator iterator = updates.iterator(); iterator.hasNext(); sb.append("\r\n\r\n").append("--").append(boundary))
        {
            UCWAUpdateEvent presenceResource = (UCWAUpdateEvent)iterator.next();

            sb.append("\r\n");
            sb.append("Content-Type: application/http;msgtype=request\r\n\r\n");
            sb.append("GET ").append(presenceResource.getHref()).append(" HTTP/1.1\r\n");
            sb.append("Host: ").append(host).append("\r\n");
            sb.append("Accept: application/json\r\n");
        }

        return sb.append("--\r\n").toString();
    }

    private MethodExecutionResult postRequest(String resourcePath, Object body) throws Exception
    {
        return request("POST", resourcePath, body);
    }

    private MethodExecutionResult getRequest(String resourcePath) throws Exception
    {
        return request("GET", resourcePath, null);
    }

    private byte[] getBytesRequest(String resourcePath, String mime) throws Exception
    {
		String uri = resourcePath.indexOf("http") == 0 ? resourcePath : host + resourcePath;
		HttpMethod request = new GetMethod(uri);
        request.setRequestHeader("Authorization", (new StringBuilder("Bearer ")).append(oAuthToken).toString());
        request.setRequestHeader("Accept", mime);

        URL url = new URL(request.getURI().toString());
        HttpClient httpClient = httpClientManager.getClient(url);
        int responseCode = httpClient.executeMethod(request);

        //Log.info("getBytesRequest " + resourcePath + " " + mime + " " + responseCode);

        if(responseCode == 200 || responseCode == 201)
            return request.getResponseBody();
        else
        	return null;
    }

    private MethodExecutionResult request(String method, String resourcePath, Object body) throws Exception
    {
        HttpMethod httpMethod = createHttpMethod(resourcePath, method, body, oAuthToken);

        if(httpMethod == null)
            return null;
        else
            return executeMethod(httpMethod);
    }

    public MethodExecutionResult executeMethod(HttpMethod request) throws Exception
    {
        MethodExecutionResult response = executeMethodString(request);

        if(response == null || response.getBody() == null)
            return null;
        else
            return response;
    }

    private MethodExecutionResult executeMethodString(HttpMethod request) throws Exception
    {
        Log.info("executeMethodString " + request.getURI().toString() + " " + request);

        URL url = new URL(request.getURI().toString());
        HttpClient httpClient = httpClientManager.getClient(url);
        MethodExecutionResult result = new MethodExecutionResult();
        int responseCode = httpClient.executeMethod(request);
        result.setResponseCode(responseCode);
        result.setBody(getStringFromResponse(request));

        if(responseCode == 200 || responseCode == 201)
        {
            if(result.getBody() != null && !result.getBody().isEmpty()) return result;

        } else  {

            if(responseCode == 204)
            {
                result.setBody("{}");
                return result;
            }

            if(responseCode == 401)
            {
                String message = "Server returned unauthorized response (401).";
                Header diagnosticsHeader = request.getResponseHeader("X-Ms-diagnostics");

                if(diagnosticsHeader != null)
                {
                    String value = diagnosticsHeader.getValue();
                    Matcher matcher = reasonPattern.matcher(value);
                    if(matcher.find())
                        message = (new StringBuilder(String.valueOf(message))).append(" ").append(matcher.group(1)).toString();
                }
                //Log.info((new StringBuilder("Got 401 from server, regenerating oAuth tokens. Message: ")).append(message).toString());
                getOnlineToken();

            } else if(responseCode == 409 || responseCode == 404)  {

                if(currentStatus.getErrorCode() == ErrorCode.SUCCESS)
                {
                    String message = String.format("Got %d response from server.", new Object[] {
                        Integer.valueOf(responseCode)
                    });
                    Log.error(message);
                }
            } else {
        		Log.error("executeMethodString " + request.getURI().toString() + " " + request);
                String message = (new StringBuilder("Got unexpected result from server. Response received with responseCode: ")).append(responseCode).append(" and response data '").append(result.getBody()).append("'.").toString();
                Log.error(message);
            }
        }
        return result;
    }

    private void createApplication() throws Exception
    {
        //Log.info("createApplication");

        JSONObject req = new JSONObject();
        req.accumulate("UserAgent", "UCWA Plugin for Openfire");
        String randomObjectId = UUID.randomUUID().toString().substring(0, 8);
        req.accumulate("EndpointId", (new StringBuilder("UCWA_Client_")).append(randomObjectId).toString());
        req.accumulate("Culture", "en-US");
        MethodExecutionResult response = postRequest(applicationPath, req);
        JSONObject jsonObject = response.getJson();

        if(jsonObject == null)
        {
            String message = String.format("Error while initializing UCWA connection, invalid response to application creation request. Got code %d with message '%s'", new Object[] {
                Integer.valueOf(response.getResponseCode()), response.getBody()
            });
            Log.error(message);
            currentStatus.setErrorCode(ErrorCode.CONNECTION_ERROR);
            currentStatus.setErrorMessage(message);
            return;
        }
        //Log.info((new StringBuilder("Got valid response for application creation request: ")).append(jsonObject.toString()).toString());
        try
        {
            JSONObject embedded = jsonObject.getJSONObject("_embedded");
            presenceSubscriptionsPath = embedded.getJSONObject("people").getJSONObject("_links").getJSONObject("presenceSubscriptions").getString("href");
      		mePath = embedded.getJSONObject("me").getJSONObject("_links").getJSONObject("self").getString("href");
            makeMeAvailablePath = embedded.getJSONObject("me").getJSONObject("_links").getJSONObject("makeMeAvailable").getString("href");
            //callForwardingSettingsPath = embedded.getJSONObject("me").getJSONObject("_links").getJSONObject("callForwardingSettings").getString("href");
           	searchPath = embedded.getJSONObject("people").getJSONObject("_links").getJSONObject("search").getString("href");
           	contactsPath = embedded.getJSONObject("people").getJSONObject("_links").getJSONObject("myContacts").getString("href");
           	groupsPath = embedded.getJSONObject("people").getJSONObject("_links").getJSONObject("myGroups").getString("href");
            JSONObject links = jsonObject.getJSONObject("_links");
            eventsPath = links.getJSONObject("events").getString("href");
            batchPath = links.getJSONObject("batch").getString("href");
            selfApplicationResource = links.getJSONObject("self").getString("href");
			startMessagingPath = embedded.getJSONObject("communication").getJSONObject("_links").getJSONObject("startMessaging").getString("href");
			//startPhoneAudioPath = embedded.getJSONObject("communication").getJSONObject("_links").getJSONObject("startPhoneAudio").getString("href");
        }
        catch(JSONException _ex)
        {
            String message = String.format("Error while initializing UCWA connection, invalid response to application creation request (response code %d). Invalid JSON object: '%s'", new Object[] {
                Integer.valueOf(response.getResponseCode()), response.getBody()
            });
            Log.error(message, _ex);
            currentStatus.setErrorCode(ErrorCode.CONNECTION_ERROR);
            currentStatus.setErrorMessage(message);
        }
    }

    private void invalidateSubscriptions()
    {
        invalidateSubscriptionsTime = new Date();
    }

    private String getStringFromResponse(HttpMethod method) throws IOException
    {
        StringBuilder responseContent;
        BufferedReader reader;
        responseContent = new StringBuilder();
        reader = null;

        try
        {
            reader = new BufferedReader(new InputStreamReader(method.getResponseBodyAsStream()));
            String line;

            while((line = reader.readLine()) != null)
                responseContent.append(line).append(System.getProperty("line.separator"));
        }
        catch(Exception e)
        {
            Log.warn("Error while extracting response body from response");

			if(reader != null)
				try
				{
					reader.close();
				}
				catch(IOException _ex) { }
            return null;
        }

        if(reader != null)
            try {
                reader.close();
            }
            catch(IOException _ex) { }

        return responseContent.toString();
    }

	private class InitCallResponse
	{
		private String path;
		private int responseCode;

		public int getResponseCode()
		{
			return responseCode;
		}

		public String getPath()
		{
			return path;
		}

		public InitCallResponse(String path, int responseCode)
		{
			this.path = path;
			this.responseCode = responseCode;
		}
	}

    public class MethodExecutionResult
    {
        private String body;
        private int responseCode;

        public String getBody()
        {
            return body;
        }

        public void setBody(String body)
        {
            this.body = body;
        }

        public int getResponseCode()
        {
            return responseCode;
        }

        public void setResponseCode(int responseCode)
        {
            this.responseCode = responseCode;
        }

        public boolean isEmpty()
        {
            return body == null || body.isEmpty();
        }

        public JSONObject getJson()
        {
            if(isEmpty())
                return null;

            try {
                return sanitizeJson(body);
            }
            catch(JSONException e)
            {
                SkypeClient.Log.error(String.format("Error while parging string '%s' to JSON object", new Object[] {body}), e);
            }
            return null;
        }

        public MethodExecutionResult()
        {
            body = "";
            responseCode = 0;
        }
    }

    private class AsyncDataChannelPollingTask implements Runnable
    {
        public void run()
        {
            SkypeClient.Log.info("AsyncDataChannelPollingTask started");

            for(; pollingRunning; SkypeClient.Log.info("AsyncDataChannelPollingTask finished"))
            {
                long now = System.currentTimeMillis();

				int maxErrors = 16;

				if(maxErrors == -1 || failCount.get() < maxErrors)
				{
					PollingResult result = getEvents();

					if(result.isSuccess())
					{
						failCount.set(0);

						if(result.isAddedEvents())
							taskEngine.submit(new AsyncWorkerChannelTask());

					} else {
						failCount.incrementAndGet();
						SkypeClient.Log.error(result.getErrorMessage());
					}

				} else 	{
					String message = "Aborting IM async data channel polling due to multiple error count";
					currentStatus.setErrorCode(ErrorCode.CONNECTION_ERROR);
					currentStatus.setErrorMessage(message);
					SkypeClient.Log.info(message);
					break;
				}
            }
        }
    }

    private class AsyncWorkerChannelTask implements Runnable
    {
        public void run()
        {
            SkypeClient.Log.info("AsyncWorkerChannelTask started");

            try {
                List updates = org.ifsoft.lync.ucwa.Lists.newArrayList();

                synchronized(updateQueue)
                {
                    for(int i = 0; i < 64; i++)
                    {
                        if(updateQueue.isEmpty())
                            break;

                        UCWAUpdateEvent update = (UCWAUpdateEvent)updateQueue.pop();

                        if(!updates.contains(update))
                            updates.add(update);
                    }

                }
                if(!updates.isEmpty())
                {
                    batchUpdatePresence(updates);
				}
            }
            catch(Exception e)
            {
                SkypeClient.Log.error("Failed executing presence actions", e);
            }

            SkypeClient.Log.info("AsyncWorkerChannelTask finished");
        }
    }

    private void batchUpdatePresence(List updates)
    {
		Log.info("batchUpdatePresence " + updates + " " + batchPath);

        MethodExecutionResult batchResponse = postBatchRequest(batchPath, updates);

        if(batchResponse != null)
        {
            List userPresenceList = org.ifsoft.lync.ucwa.Lists.newArrayList();
            analyzeBatchResponse(batchResponse.getBody(), userPresenceList);

            if(!userPresenceList.isEmpty())
                handle(new UserPresenceChangedEvent(userPresenceList));
        }
    }

    public void handle(UserPresenceChangedEvent e)
    {
        List usersPresence = e.getUsersPresence();

        //Log.info((new StringBuilder("Received user presence event with ")).append(usersPresence.size()).append(" entries").toString());

        for(Iterator iterator = usersPresence.iterator(); iterator.hasNext();)
        {
            UserPresence userPresence = (UserPresence)iterator.next();
            try
            {
                String sip = userPresence.getUserId();
                //Log.info("UserPresenceChangedEvent " + sip + " " + userPresence.getShow() + " " + userPresence.getStatusMessage());

				if (buddies.containsKey(sip))
				{
					LyncBuddy buddy = buddies.get(sip);
					buddy.updatePresenceItem(userPresence.getShow(), userPresence.getStatusMessage());
				}

				//component.incomingPresence(this, jid, sip, userPresence.getShow(), userPresence.getStatusMessage());

            }
            catch(Exception _ex)
            {
                String message = (new StringBuilder("Failed handling user presence event entry: ")).append(userPresence).toString();
                Log.error(message);
            }
        }
    }

    private String getUserId(JSONObject response)
    {
        try
        {
            if(response.has("_links"))
                return getSipFromResource(response.getJSONObject("_links").getJSONObject("self").getString("href"));
        }
        catch(Exception e)
        {
            String message = "There was an error while updating user presence.";
            Log.error(message, e);
        }
        return null;
    }

    private int getNumericStatus(String availability, String activity)
    {
        if("Online".equals(availability))
            return 3000;
        if("Away".equals(availability))
            return !"Off work".equals(activity) ? 15000 : 0x76506bbf;
        if("BeRightBack".equals(availability))
            return 12000;
        if("Busy".equals(availability))
            return 6000;
        if("DoNotDisturb".equals(availability))
            return 9000;
        if("IdleBusy".equals(availability))
            return 6000;
        if("IdleOnline".equals(availability))
            return 4500;
        return !"Offline".equals(availability) ? 5 : 18000;
    }

    private String getSipFromResource(String resource)
    {
        Matcher matcher = sipFromResourcePattern.matcher(resource);

        if(matcher.find() && matcher.groupCount() > 0)
        {
            return matcher.group(1);

        } else {
            String message = String.format("Could not parse resource '%s'.", new Object[] {
                resource
            });
            Log.error(message);
            return null;
        }
    }

    private void getUserPresence(JSONObject response, UserPresence userPresence)
    {
        try
        {
            if(response.has("availability"))
            {
                String availability = response.getString("availability");
                String activity = null;

                if(response.has("activity"))
                    activity = response.getString("activity");

                userPresence.setShow(availability);
                userPresence.setStatus(getNumericStatus(availability, activity));
            }
            if(response.has("message"))
            {
                String text = response.getString("message");
                userPresence.setStatusMessage(text);
            }
        }
        catch(Exception e)
        {
            String message = "There was an error while updating user presence.";
            Log.error(message, e);
        }
    }

    private void analyzeBatchResponse(String batchResponse, List userPresenceList)
    {
        Scanner scanner = new Scanner(batchResponse);

 		while (scanner.hasNextLine())
 		{
 			String json;
        	String line = scanner.nextLine();
        	Matcher matcher = jsonLinePattern.matcher(line);

			if(!matcher.find() || matcher.groupCount() != 1)
				continue;

			json = matcher.group(1);
			JSONObject response;
			final String userId;
			response = new JSONObject(json);
			userId = getUserId(response);

        	if (userId != null)
        	{
            	try {
					UnmodifiableIterator iterator = Iterators.filter(userPresenceList.iterator(), new Predicate() {

						public boolean apply(UserPresence input)
						{
							return input != null && input.getUserId().equals(userId);
						}

						public boolean apply(Object obj)
						{
							return apply((UserPresence)obj);
						}
					});

					boolean add = true;
					UserPresence userPresence;

					if(iterator.hasNext())
					{
						userPresence = (UserPresence)iterator.next();
						add = false;

					} else {
						userPresence = new UserPresence(userId);
					}
					getUserPresence(response, userPresence);

					if(add)
						userPresenceList.add(userPresence);
				}
				catch(JSONException e)
				{
					Log.error("Updating user presence for user failed", e);
				}
			}
		}
    }


    private class PollingResult
    {
        private boolean isSuccess;
        private boolean isWebFail;
        private String errorMessage;
        private String errorResponse;
        private boolean addedEvents;

        private boolean isSuccess()
        {
            return isSuccess;
        }

        private void setSuccess(boolean success)
        {
            isSuccess = success;
        }

        private boolean isWebFail()
        {
            return isWebFail;
        }

        private void setWebFail(boolean webFail)
        {
            isWebFail = webFail;
        }

        private String getErrorMessage()
        {
            return errorMessage;
        }

        private void setErrorMessage(String errorMessage)
        {
            this.errorMessage = errorMessage;
        }

        private String getErrorResponse()
        {
            return errorResponse;
        }

        private void setErrorResponse(String errorResponse)
        {
            this.errorResponse = errorResponse;
        }

        private boolean isAddedEvents()
        {
            return addedEvents;
        }

        public void setAddedEvents(boolean addedEvents)
        {
            this.addedEvents = addedEvents;
        }


        private PollingResult(boolean success, String errorMessage)
        {
            isWebFail = false;
            errorResponse = null;
            this.errorMessage = errorMessage;
            isSuccess = success;
        }

        public PollingResult(boolean success)
        {
            isWebFail = false;
            errorResponse = null;
            isSuccess = success;
        }
    }

    private class RegisterSubscribedUserTask implements Runnable
    {
        private UserPresence userPresence;

        public void run()
        {
            SkypeClient.Log.info("RegisterSubscribedUserTask - Started");

            synchronized(subscribedUsers)
            {
                subscribedUsers.add(userPresence.getUserId());
            }
            SkypeClient.Log.info("RegisterSubscribedUserTask - Done");
        }

        public RegisterSubscribedUserTask(UserPresence userPresence)
        {
            this.userPresence = userPresence;
        }
    }

    private class UCWAUpdateEvent
    {
        String rel;
        String href;

        private String getHref()
        {
            return href;
        }

        private String getRel()
        {
            return rel;
        }

        public int hashCode()
        {
            return (new StringBuilder(String.valueOf(rel))).append(href).toString().hashCode();
        }

        public boolean equals(Object obj)
        {
            return (obj instanceof UCWAUpdateEvent) && hashCode() == obj.hashCode();
        }

        public UCWAUpdateEvent(String rel, String href)
        {
            this.rel = rel;
            this.href = href;
        }
    }

    private class ReportMyActivity extends TimerTask
    {
		private String activityPath;

        public ReportMyActivity(String activityPath)
        {
            this.activityPath = activityPath;
        }

        public void run()
        {
            //Log.info("ReportMyActivity started");
            try
            {
				postRequest(activityPath, null);
            }
            catch(Exception e)
            {
                Log.error("ReportMyActivity error", e);
            }

            //Log.info("ReportMyActivity finished");
        }
    }

    private class ActivePhoneAudio
    {
		public String stopPhoneAudioHref = null;
		public String holdPhoneAudioHref = null;
		public String resumePhoneAudioHref = null;
		public String selfPhoneAudioHref = null;
		public String callId = null;
	}

    private class ChatRoom
    {
		public String sip = null;
		public String operationId = null;
		public String conversationHref = null;

		public ChatRoom(String sip, String conversationHref, String operationId)
		{
			this.sip = sip;
			this.conversationHref = conversationHref;

			int pos = operationId.indexOf("|");

			if (pos > -1)
				this.operationId = operationId.substring(0, pos);
			else
				this.operationId = operationId;
		}

		public ChatRoom(String sip, String conversationHref)
		{
			this.sip = sip;
			this.conversationHref = conversationHref;
		}
	}

}
