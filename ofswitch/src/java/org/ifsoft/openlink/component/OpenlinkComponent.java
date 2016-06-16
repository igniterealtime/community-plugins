package org.ifsoft.openlink.component;

import java.net.*;
import java.io.*;
import java.util.*;
import java.util.concurrent.*;

import org.dom4j.Document;
import org.dom4j.DocumentHelper;
import org.dom4j.Element;

import org.jivesoftware.openfire.http.HttpBindManager;
import org.jivesoftware.openfire.SessionManager;
import org.jivesoftware.openfire.session.LocalClientSession;
import org.jivesoftware.openfire.session.Session;
import org.jivesoftware.openfire.RoutingTable;
import org.jivesoftware.openfire.XMPPServer;
import org.jivesoftware.openfire.PrivateStorage;
import org.jivesoftware.openfire.user.UserManager;
import org.jivesoftware.openfire.user.User;
import org.jivesoftware.openfire.vcard.*;
import org.jivesoftware.openfire.cluster.ClusterManager;
import org.jivesoftware.util.JiveGlobals;
import org.jivesoftware.openfire.roster.Roster;
import org.jivesoftware.openfire.roster.RosterItem;
import org.jivesoftware.openfire.roster.RosterManager;

import org.xmpp.component.Component;
import org.xmpp.component.AbstractComponent;
import org.xmpp.component.ComponentException;
import org.xmpp.component.ComponentManager;
import org.xmpp.component.ComponentManagerFactory;

import org.xmpp.packet.IQ;
import org.xmpp.packet.JID;
import org.xmpp.packet.Message;
import org.xmpp.packet.Packet;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.ifsoft.openlink.*;
import org.ifsoft.openlink.commands.*;

import net.sf.json.*;


public class OpenlinkComponent extends AbstractTSComponent implements OpenlinkConstants
{
    private static final Logger Log = LoggerFactory.getLogger(OpenlinkComponent.class);
	private ComponentManager componentManager;
	private JID componentJID = null;

	private PrivateStorage privateStorage;
	private UserManager userManager;
	private RosterManager rosterManager;
	private SessionManager sessionManager;
	private OpenlinkCommandManager openlinkManger;

	public Map<String, OpenlinkUserInterest> openlinkInterests;
	public Map<String, OpenlinkUser> traderLyncUserTable;
	public Map<String, OpenlinkInterest> traderLyncInterests;
	public Map<String, OpenlinkInterest> callInterests;
	public Map<String, OpenlinkUser> userProfiles;

    public TelephoneNumberFormatter telephoneNumberFormatter;
	public Site site;

	private Vector<OpenlinkUser> sortedProfiles;
    private Timer timer = null;

    static public OpenlinkComponent self;


//-------------------------------------------------------
//
//
//
//-------------------------------------------------------


	public OpenlinkComponent(Site site)
	{
        super(16, 1000, true);

        this.site = site;
        this.componentJID = new JID(getName() + "." + getDomain());
		sortedProfiles =  new Vector<OpenlinkUser>();

		self = this;

		Log.info( "["+ site.getName() + "] OpenlinkComponent Initialised");
	}

	public void componentEnable()
	{
        privateStorage 		= XMPPServer.getInstance().getPrivateStorage();
        userManager 		= XMPPServer.getInstance().getUserManager();
        rosterManager		= XMPPServer.getInstance().getRosterManager();
        sessionManager		= XMPPServer.getInstance().getSessionManager();

        componentManager 	= ComponentManagerFactory.getComponentManager();
        openlinkManger 		= new OpenlinkCommandManager();
        openlinkInterests 	= Collections.synchronizedMap( new HashMap<String, OpenlinkUserInterest>());
        traderLyncUserTable = Collections.synchronizedMap( new HashMap<String, OpenlinkUser>());
		traderLyncInterests = Collections.synchronizedMap( new HashMap<String, OpenlinkInterest>());
		callInterests		= Collections.synchronizedMap( new HashMap<String, OpenlinkInterest>());
		userProfiles 		= Collections.synchronizedMap( new HashMap<String, OpenlinkUser>());

        timer = new Timer();

		Log.info( "["+ site.getName() + "] Creating telephoneNumberFormatter object");

		setupTelephoneNumberFormatter();

		Log.info( "["+ site.getName() + "] Creating user profiles");

		getUserProfiles();

		openlinkManger.addCommand(new GetProfiles(this));
		openlinkManger.addCommand(new GetProfile(this));
		openlinkManger.addCommand(new GetInterests(this));
		openlinkManger.addCommand(new GetInterest(this));
		openlinkManger.addCommand(new GetFeatures(this));
		openlinkManger.addCommand(new MakeCall(this));
		openlinkManger.addCommand(new IntercomCall(this));
		openlinkManger.addCommand(new RequestAction(this));
		openlinkManger.addCommand(new SetFeature(this));
		openlinkManger.addCommand(new QueryFeatures(this));
		openlinkManger.addCommand(new ManageVoiceBridge(this));
    }


	public void componentDestroyed()
	{
		try {
			openlinkManger.stop();

        	if (timer != null) {
                timer.cancel();
            	timer = null;
        	}

		}
		catch(Exception e) {
			Log.error(e.toString());
		}
	}


	public void setupTelephoneNumberFormatter()
	{
		Log.info( "["+ site.getName() + "] setupTelephoneNumberFormatter");

		try
		{
			String pname = site.getName().toLowerCase();
			String country = JiveGlobals.getProperty(Properties.Openlink_PBX_COUNTRY_CODE + "."  + pname, Locale.getDefault().getCountry());

			String pbxAccessDigits 	= JiveGlobals.getProperty(Properties.Openlink_PBX_ACCESS_DIGITS	+ "."  + pname, "9");
			String areaCode 		= JiveGlobals.getProperty(Properties.Openlink_AREA_CODE  		+ "."  + pname, "0207");
			String pbxNumberLength 	= JiveGlobals.getProperty(Properties.Openlink_PBX_NUMBER_LENGTH + "."  + pname, "5");

			telephoneNumberFormatter = new TelephoneNumberFormatter(new Locale("en", country));
			telephoneNumberFormatter.setExtensionNumberLength(Integer.parseInt(pbxNumberLength));
			telephoneNumberFormatter.setOutsideAccess(pbxAccessDigits);
			telephoneNumberFormatter.setAreaCode(areaCode);
			telephoneNumberFormatter.setLocale(new Locale("en", country));
		}
		catch (Exception e)
		{
	        Log.error( "["+ site.getName() + "] setupTelephoneNumberFormatter " + e);
		}
	}

	public String formatCanonicalNumber(String dialDigits)
	{
		String canonicalNumber = dialDigits;

		try
		{
			canonicalNumber = telephoneNumberFormatter.formatCanonicalNumber(dialDigits);
		}
		catch (Exception e)
		{
	        Log.error( "["+ site.getName() + "] formatCanonicalNumber " + e);
		}

		return canonicalNumber;
	}

	public String formatDialableNumber(String cononicalNumber)
	{
		String dialableNumber = cononicalNumber;

		try
		{
			dialableNumber = telephoneNumberFormatter.formatDialableNumber(cononicalNumber);
		}
		catch (Exception e)
		{
			cononicalNumber = formatCanonicalNumber(cononicalNumber);

			try
			{
				dialableNumber = telephoneNumberFormatter.formatDialableNumber(cononicalNumber);
			}

			catch (Exception e1)
			{
	        	Log.error( "["+ site.getName() + "] formatDialableNumber " + e1);
			}
		}

		return dialableNumber;
	}

//-------------------------------------------------------
//
//
//
//-------------------------------------------------------

	@Override public String getDescription()
	{
		return "TraderLynk Component";
	}


	@Override public String getName()
	{
		return "traderlynk";
	}

	@Override public String getDomain()
	{
		return  XMPPServer.getInstance().getServerInfo().getXMPPDomain();
	}

	@Override public void postComponentStart()
	{

	}

	@Override public void postComponentShutdown()
	{

	}

	public JID getComponentJID()
	{
		return new JID(getName() + "." + getDomain());
	}

	public String getSiteName()
	{
		if (site == null)
			return "";
		else
			return site.getName();
	}

    public int getUserCount()
    {
        return traderLyncUserTable.values().size();
    }

    public List<OpenlinkUser> getUsers(int startIndex, int numResults)
    {
		List<OpenlinkUser> profiles  = new ArrayList<OpenlinkUser>();
		int counter = 0;

		if (startIndex == 0 || sortedProfiles.size() == 0)
		{
			sortedProfiles = new Vector<OpenlinkUser>(traderLyncUserTable.values());
			Collections.sort(sortedProfiles);
		}

		Iterator it = sortedProfiles.iterator();

		while( it.hasNext() )
		{
			OpenlinkUser traderLyncUser = (OpenlinkUser)it.next();

			if (counter > (startIndex + numResults))
			{
				break;
			}

			if (counter >= startIndex)
			{
				profiles.add(traderLyncUser);
			}

			counter++;
		}

        return profiles;
    }


//-------------------------------------------------------
//
//
//
//-------------------------------------------------------


	public void interceptMessage(Message received)
	{
		//traderLyncLinkService.interceptMessage(received);
	}

    @Override protected void handleMessage(Message received)
    {
		Log.info("["+ site.getName() + "] handleMessage \n"+ received.toString());
    }

	@Override protected void handleIQResult(IQ iq)
	{
		Log.info("["+ site.getName() + "] handleIQResult \n"+ iq.toString());

		Element element = iq.getChildElement();

		if (element != null)
		{
			String namespace = element.getNamespaceURI();

			if("http://jabber.org/protocol/pubsub#owner".equals(namespace))
			{
				Element subscriptions = element.element("subscriptions");

				if (subscriptions != null)
				{
					String node = subscriptions.attributeValue("node");

					Log.info("["+ site.getName() + "] handleIQResult found subscription node " + node);

					if (openlinkInterests.containsKey(node))
					{
						Log.info("["+ site.getName() + "] handleIQResult found user interest " + node);

						OpenlinkUserInterest traderLyncUserInterest = openlinkInterests.get(node);

						for ( Iterator<Element> i = subscriptions.elementIterator( "subscription" ); i.hasNext(); )
						{
							Element subscription = (Element) i.next();
							JID jid = new JID(subscription.attributeValue("jid"));
							String sub = subscription.attributeValue("subscription");

							OpenlinkSubscriber traderLyncSubscriber = traderLyncUserInterest.getSubscriber(jid);
							traderLyncSubscriber.setSubscription(sub);

							setSubscriberDetails(jid, traderLyncSubscriber);

							Log.info("["+ site.getName() + "] handleIQResult added subscriber " + jid);

						}
					}
				}
			}
		}
	}

    private void setSubscriberDetails(JID jid, OpenlinkSubscriber traderLyncSubscriber)
    {
		if (userManager.isRegisteredUser(jid.getNode()))
		{
			User user = null;

			try {
				user = userManager.getUser(jid.getNode());
			}
			catch(Exception e) { }

			if (user != null)
			{
				//traderLyncSubscriber.setOnline(presenceManager.isAvailable(user));
				traderLyncSubscriber.setName(user.getName());
				traderLyncSubscriber.setJID(jid); 				// we need the full JID including resource to get session object
			}
		}
	}

	@Override protected void handleIQError(IQ iq)
	{
		String xml = iq.toString();

		if (xml.indexOf("<create node=") == -1)
			Log.info("["+ site.getName() + "] handleIQError \n"+ iq.toString());
	}

   @Override public IQ handleDiscoInfo(IQ iq)
    {
    	JID jid = iq.getFrom();
		Element child = iq.getChildElement();
		String node = child.attributeValue("node");

		IQ iq1 = IQ.createResultIQ(iq);
		iq1.setType(org.xmpp.packet.IQ.Type.result);
		iq1.setChildElement(iq.getChildElement().createCopy());

		Element queryElement = iq1.getChildElement();
		Element identity = queryElement.addElement("identity");

		queryElement.addElement("feature").addAttribute("var",NAMESPACE_DISCO_INFO);
		queryElement.addElement("feature").addAttribute("var",NAMESPACE_XMPP_PING);

		identity.addAttribute("category", "component");
		identity.addAttribute("name", "traderLync");

		if (node == null) 				// Disco discovery of openlink
		{
			identity.addAttribute("type", "command-list");
			queryElement.addElement("feature").addAttribute("var", "http://jabber.org/protocol/commands");
			queryElement.addElement("feature").addAttribute("var", "http://xmpp.org/protocol/openlink:01:00:00");
			queryElement.addElement("feature").addAttribute("var", "http://xmpp.org/protocol/openlink:01:00:00#tsc");


		} else {

			// Disco discovery of Openlink command

			OpenlinkCommand command = openlinkManger.getCommand(node);

			if (command != null && command.hasPermission(jid))
			{
				identity.addAttribute("type", "command-node");
				queryElement.addElement("feature").addAttribute("var", "http://jabber.org/protocol/commands");
				queryElement.addElement("feature").addAttribute("var", "http://xmpp.org/protocol/openlink:01:00:00");
			}

		}
		//Log.info("["+ site.getName() + "] handleDiscoInfo "+ iq1.toString());
		return iq1;
    }


   @Override public IQ handleDiscoItems(IQ iq)
    {
    	JID jid = iq.getFrom();
		Element child = iq.getChildElement();
		String node = child.attributeValue("node");

		IQ iq1 = IQ.createResultIQ(iq);
		iq1.setType(org.xmpp.packet.IQ.Type.result);
		iq1.setChildElement(iq.getChildElement().createCopy());

		Element queryElement = iq1.getChildElement();
		Element identity = queryElement.addElement("identity");

		identity.addAttribute("category", "component");
		identity.addAttribute("name", "openlink");
		identity.addAttribute("type", "command-list");

		if ("http://jabber.org/protocol/commands".equals(node))
		{
			for (OpenlinkCommand command : openlinkManger.getCommands())
			{
				// Only include commands that the sender can invoke (i.e. has enough permissions)

				if (command.hasPermission(jid))
				{
					Element item = queryElement.addElement("item");
					item.addAttribute("jid", componentJID.toString());
					item.addAttribute("node", command.getCode());
					item.addAttribute("name", command.getLabel());
				}
			}
		}
		//Log.info("["+ site.getName() + "] handleDiscoItems "+ iq1.toString());
		return iq1;
    }

   @Override public IQ handleIQGet(IQ iq)
    {
		return handleIQPacket(iq);
	}

   @Override public IQ handleIQSet(IQ iq)
    {
		return handleIQPacket(iq);
	}

   private IQ handleIQPacket(IQ iq)
    {
		Log.info("["+ site.getName() + "] handleIQPacket \n"+ iq.toString());

		Element element = iq.getChildElement();
		IQ iq1 = IQ.createResultIQ(iq);
		iq1.setType(org.xmpp.packet.IQ.Type.result);
		iq1.setChildElement(iq.getChildElement().createCopy());

		if (element != null)
		{
			String namespace = element.getNamespaceURI();

			if("http://jabber.org/protocol/commands".equals(namespace))
				iq1 = openlinkManger.process(iq);
		}
		return iq1;
	}


//-------------------------------------------------------
//
//
//
//-------------------------------------------------------


	public String makeCallDefault(Element newCommand, JID jid, String handset, String privacy, String autoHold, String dialDigits)
	{
		return makeCallDefault(newCommand, jid, handset, privacy, autoHold, dialDigits, null);
	}

	public String makeCallDefault(Element newCommand, JID jid, String handset, String privacy, String autoHold, String dialDigits, String callId)
	{
		Log.info( "["+ site.getName() + "] makeCallDefault "+ jid + " " + handset + " " + dialDigits + " " + privacy);

		String errorMessage = "No default profile found";

		try {

			if (dialDigits != null && !"".equals(dialDigits))
			{
				dialDigits = makeDialableNumber(dialDigits);

				if (dialDigits == null || "".equals(dialDigits))
				{
					errorMessage = "Destination is not a dialable number";
					return errorMessage;
				}
			}

			boolean foundDefaultProfile = false;

			String userName = jid.getNode();
			Iterator<OpenlinkUser> it = traderLyncUserTable.values().iterator();

			while( it.hasNext() )
			{
				OpenlinkUser traderLyncUser = (OpenlinkUser)it.next();

				if (userName.equals(traderLyncUser.getUserId()) && "true".equals(traderLyncUser.getDefault()))
				{
					foundDefaultProfile = true;

					handset = handset == null ? traderLyncUser.getHandsetNo() : handset;
					privacy = privacy == null ? traderLyncUser.getLastPrivacy() : privacy;
					autoHold = autoHold == null ? (traderLyncUser.autoHold() ? "true" : "false")  : autoHold;

					if (traderLyncUser.getDefaultInterest() != null)
					{
						traderLyncUser.setWaitingInterest(null);
						errorMessage = makeOutgoingCall(traderLyncUser.getDefaultInterest().getUserInterests().get(traderLyncUser.getUserNo()), dialDigits, handset, callId);

					} else errorMessage = "no default interest found";

					break;
				}
			}

			if (foundDefaultProfile == false)
				errorMessage = "no default profile found";
		}
		catch(Exception e) {
        	Log.error("makeCallDefault " + e);
        	e.printStackTrace();
        	errorMessage = "Internal error - " + e.toString();
        }
        return errorMessage;
	}


	public String makeCall(Element newCommand, String userInterest, String handset, String privacy, String autoHold, String dialDigits)
	{
		return makeCall(newCommand, userInterest, handset, privacy, autoHold, dialDigits, null);
	}


	public String makeCall(Element newCommand, String userInterest, String handset, String privacy, String autoHold, String dialDigits, String callId)
	{
		Log.info( "["+ site.getName() + "] makeCall "+ userInterest + " " + dialDigits + " " + callId);

		String errorMessage = "Interest not found";

		try {

			if (openlinkInterests.containsKey(userInterest))
			{
				OpenlinkUserInterest traderLyncUserInterest = openlinkInterests.get(userInterest);
				OpenlinkUser traderLyncUser = traderLyncUserInterest.getUser();

				handset = handset == null ? traderLyncUser.getHandsetNo() : handset;
				privacy = privacy == null ? traderLyncUser.getLastPrivacy() : privacy;

				if ("D".equals(traderLyncUserInterest.getInterest().getInterestType()))
				{
					if (dialDigits != null && !"".equals(dialDigits))
					{
						dialDigits = makeDialableNumber(dialDigits);

						if (dialDigits == null || "".equals(dialDigits))
						{
							errorMessage = "Destination is not a dialable number";
							return errorMessage;
						}
					}
					errorMessage = makeOutgoingCall(traderLyncUserInterest, dialDigits, handset, callId);

				}

				else if ("L".equals(traderLyncUserInterest.getInterest().getInterestType()))
				{
					String digits = traderLyncUserInterest.getInterest().getInterestValue();
					if (digits.startsWith("tel:")) digits = digits.substring(4);
					errorMessage = makeOutgoingCall(traderLyncUserInterest, digits, handset, callId);
				}
			}
		}
		catch(Exception e) {
        	Log.error("makeCall " + e);
        	e.printStackTrace();
        	errorMessage = "Internal error - " + e.toString();
        }
        return errorMessage;
	}


	private String makeOutgoingCall(OpenlinkUserInterest traderLyncUserInterest, String dialDigits, String handset, String callId)
	{
		Log.info( "["+ site.getName() + "] makeOutgoingCall "+ traderLyncUserInterest.getInterest().getInterestValue() + " " + dialDigits + " " + callId);

		String deviceNo = traderLyncUserInterest.getUser().getDeviceNo();
		String username = traderLyncUserInterest.getUser().getUserId();
		String errorMessage = null;

		try {
			if (callId == null) callId = username + "-" + System.currentTimeMillis();

			errorMessage = null; //sendSkype4BRequest(traderLyncUserInterest, "startPhoneAudio", username, dialDigits, callId, handset);

			if (errorMessage == null)
			{
				callInterests.put(callId, traderLyncUserInterest.getInterest());

				if (deviceNo != null)
				{
					//connectHandsetLine(deviceNo, callId);
				}
				outgoingCallNotification(username, callId, true, dialDigits, traderLyncUserInterest.getInterest().getInterestLabel());
			}
		}

		catch(Exception e) {
			Log.error("makeOutgoingCall ", e);
			errorMessage = "Internal error - " + e.toString();
		}

		return errorMessage;
	}


	public String intercomCall(Element newCommand, String profileID, JID to, String groupID)
	{
		Log.info( "["+ site.getName() + "] intercomCall "+ profileID + " -> " + to + " => " + groupID);
		String errorMessage = null;

		try {
			OpenlinkUser fromUser = getOpenlinkProfile(profileID);

			if (groupID == null)
			{
				OpenlinkUser toUser = getOpenlinkUser(to);
				//traderLyncLinkService.platformIntercomCall(fromUser.getDeviceNo(), toUser.getUserNo());

			} else {

				//traderLyncLinkService.groupIntercomCall(fromUser.getDeviceNo(), groupID);
			}

			//errorMessage = waitForFirstEvent(newCommand, fromUser, true, "0");
		}
		catch(Exception e) {
        	Log.error("["+ site.getName() + "] intercomCall " + e);
        	e.printStackTrace();
        	errorMessage = "Internal error - " + e.toString();
        }
        return errorMessage;
	}


	private boolean isValidAction(OpenlinkCall traderLyncCall, String validAction)
	{
		boolean valid = false;

		Iterator it4 = traderLyncCall.getValidActions().iterator();

		while( it4.hasNext() )
		{
			String action = (String)it4.next();

			if (action.equals(validAction))
			{
				valid = true;
				break;
			}
		}

		return valid;
	}


	public String processUserAction(Element command, String userInterest, String action, String callID, String value1)
	{
		Log.info( "["+ site.getName() + "] processUserAction " + userInterest + " " + action + " " + callID + " " + value1);
		String errorMessage = null;

		try {

			if (openlinkInterests.containsKey(userInterest))
			{
				OpenlinkUserInterest traderLyncUserInterest = openlinkInterests.get(userInterest);
				OpenlinkInterest traderLyncInterest = traderLyncUserInterest.getInterest();
				OpenlinkUser traderLyncUser = traderLyncUserInterest.getUser();

				OpenlinkCall traderLyncCall = traderLyncUserInterest.getCallById(callID);

				if (traderLyncCall != null)
				{
					traderLyncCall.published = true;

					Log.info( "[" + site.getName() + "] processUserAction");

					if (isValidAction(traderLyncCall, action))
					{
						if ("AnswerCall".equals(action) || "JoinCall".equals(action) || "RetrieveCall".equals(action))
						{
							if (traderLyncUser.getDeviceNo() != null && !"0.0.0.0".equals(traderLyncUser.getDeviceNo()))
							{

								if ("D".equals(traderLyncInterest.getInterestType()))
								{
									errorMessage = null; //sendSkype4BRequest(traderLyncUserInterest, "resumePhoneAudio", traderLyncUser.getUserNo(), null, callID, null);

									if (errorMessage == null)
									{
										Iterator it = traderLyncInterest.getUserInterests().values().iterator();

										while( it.hasNext() )
										{
											OpenlinkUserInterest eachInterest = (OpenlinkUserInterest)it.next();

											if (eachInterest.getUser().getUserNo().equals(traderLyncUser.getUserNo()))
											{
												eachInterest.handleCallConnected(callID);

											} else {

												eachInterest.handleCallBusy(callID);
											}
										}

										publishOpenlinkCallEvent(traderLyncInterest);
									}

								}
								else

								if ("L".equals(traderLyncInterest.getInterestType()))
								{
									makeCall(null, userInterest, traderLyncUser.getHandsetNo(), null, null, userInterest);
								}

								if (traderLyncUser.autoPrivate())
								{
									//Thread.sleep(500);
									//traderLyncLinkService.privateCall(traderLyncUser.getDeviceNo(), traderLyncUser.getHandsetNo(), "Y");
								}

							} else {

								errorMessage = "User device not online";
							}
						}

						if ("ClearConnection".equals(action))
						{
							errorMessage = null; //sendSkype4BRequest(traderLyncUserInterest, "stopPhoneAudio", traderLyncUser.getUserNo(), null, callID, null);

							if (errorMessage == null)
							{
								Iterator it = traderLyncInterest.getUserInterests().values().iterator();

								while( it.hasNext() )
								{
									OpenlinkUserInterest eachInterest = (OpenlinkUserInterest)it.next();
									eachInterest.handleConnectionCleared(callID);
								}

								publishOpenlinkCallEvent(traderLyncInterest);
							}

							deleteEvents(traderLyncInterest, callID);
						}

						if ("PrivateCall".equals(action))
						{
							//traderLyncLinkService.privateCall(traderLyncCall.getConsole(), traderLyncCall.getHandset(), "Y");
						}

						if ("PublicCall".equals(action))
						{
							//traderLyncLinkService.privateCall(traderLyncCall.getConsole(), traderLyncCall.getHandset(), "N");
						}

						if ("SendDigits".equals(action))
						{
							value1 = makeDialableNumber(value1);

							if (value1 == null || "".equals(value1))
							{
								errorMessage = "A dialable number is required for SendDigits";

							} else {

								//traderLyncLinkService.dialDigits(traderLyncCall.getLine(), value1);
							}

						}

						if ("SendDigit".equals(action))
						{
							if (value1 != null && value1.length() > 0)
							{
								//traderLyncLinkService.dialDigit(traderLyncCall.getConsole(), traderLyncCall.getHandset(), value1.substring(0, 1));
								//traderLyncLinkService.publishOpenlinkUserCallEvent(traderLyncUserInterest);  // no event, so we force pub-sub of current event

							} else errorMessage = "A dialable digit must be provided for SendDigit action";
						}

						if ("ClearCall".equals(action))
						{
							errorMessage = null; //sendSkype4BRequest(traderLyncUserInterest, "stopPhoneAudio", traderLyncUser.getUserNo(), null, callID, null);

							if (errorMessage == null)
							{
								Iterator it = traderLyncInterest.getUserInterests().values().iterator();

								while( it.hasNext() )
								{
									OpenlinkUserInterest eachInterest = (OpenlinkUserInterest)it.next();
									eachInterest.handleConnectionCleared(callID);
								}

								publishOpenlinkCallEvent(traderLyncInterest);
							}

							deleteEvents(traderLyncInterest, callID);
						}

						if ("ConferenceCall".equals(action))
						{
							//traderLyncLinkService.joinELC(traderLyncCall.getConsole());
						}

						if ("ClearConference".equals(action))
						{
							//traderLyncLinkService.clearELC(traderLyncCall.getConsole());
							//traderLyncLinkService.clearLine(traderLyncCall.getLine());
						}

						if ("IntercomTransfer".equals(action))
						{
							try {
								OpenlinkUser newOpenlinkUser = getOpenlinkUser(new JID(value1));

								if (newOpenlinkUser != null)
								{
									//traderLyncLinkService.traderLyncTransferCall(traderLyncCall.getConsole(), traderLyncCall.getHandset(), traderLyncUser.getUserNo());

								} else errorMessage = value1 + " is either not a valid user or logged into a device";

							} catch (Exception e) {

								errorMessage = value1 + " is not a valid user identity";
							}
						}

						if ("ConsultationCall".equals(action))
						{
							if (!traderLyncCall.transferFlag)
							{
								value1 = makeDialableNumber(value1);

								if (value1 == null || "".equals(value1))
								{
									errorMessage = "A dialable number must be provided for ConsultationCall action";

								} else {

									traderLyncCall.previousCalledNumber = traderLyncCall.proceedingDigits;	// store old called number.
									traderLyncCall.previousCalledLabel = traderLyncCall.proceedingDigitsLabel;

									//traderLyncLinkService.transferCall(traderLyncCall.getConsole(), traderLyncCall.getHandset(), traderLyncCall.getLine(), value1);
									traderLyncCall.transferFlag = true;
								}

							} else {

								//traderLyncLinkService.ringRecall(traderLyncCall.getConsole(), traderLyncCall.getHandset());	// terminate current ConsultationCall
								traderLyncCall.transferFlag = false;

								if (traderLyncCall.previousCalledNumber != null)
								{
									Iterator<OpenlinkUserInterest> it3 = traderLyncUserInterest.getInterest().getUserInterests().values().iterator();

									while( it3.hasNext() )
									{
										OpenlinkUserInterest theUserInterest = (OpenlinkUserInterest)it3.next();
										OpenlinkCall theCall = theUserInterest.getCallByLine(traderLyncCall.getLine());

										if (theCall != null)
										{
											theCall.proceedingDigits = traderLyncCall.previousCalledNumber;
											theCall.proceedingDigitsLabel = traderLyncCall.previousCalledLabel;
										}
									}
								}
							}

							traderLyncCall.setValidActions();
							//traderLyncLinkService.publishOpenlinkUserCallEvent(traderLyncUserInterest);  // no event, so we force pub-sub of current event
						}

						if ("TransferCall".equals(action))
						{
							if (traderLyncCall.transferFlag)
							{
								//traderLyncLinkService.clearCall(traderLyncCall.getConsole(), traderLyncCall.getHandset());
								traderLyncCall.transferFlag = false;

							} else errorMessage = "ConsultationCall must be done before TransferCall";
						}

						if ("SingleStepTransfer".equals(action))
						{
							value1 = makeDialableNumber(value1);

							if (value1 == null || "".equals(value1))
							{
								errorMessage = "A dialable number must be provided for a SingleStepTransfer action";

							} else {

								//traderLyncLinkService.transferCall(traderLyncCall.getConsole(), traderLyncCall.getHandset(), traderLyncCall.getLine(), value1);
								//traderLyncLinkService.clearCall(traderLyncCall.getConsole(), traderLyncCall.getHandset());
							}
						}

						if ("AddThirdParty".equals(action))
						{
							value1 = makeDialableNumber(value1);

							if (value1 == null || "".equals(value1))
							{
								errorMessage = "A dialable number must be provided for a AddThirdParty action";

							} else {

								//errorMessage = traderLyncLinkService.addExternalCall(traderLyncCall.getLine(), value1);
							}
						}

						if ("RemoveThirdParty".equals(action))
						{
							//errorMessage = traderLyncLinkService.removeExternalCall(traderLyncCall.getLine(), makeDialableNumber(value1));
						}


						if ("HoldCall".equals(action))
						{

							if (traderLyncUser.getDeviceNo() != null && !"0.0.0.0".equals(traderLyncUser.getDeviceNo()))
							{
								errorMessage = null; //sendSkype4BRequest(traderLyncUserInterest, "holdPhoneAudio", traderLyncUser.getUserNo(), null, callID,  null);

								if (errorMessage == null)
								{
									Iterator it = traderLyncInterest.getUserInterests().values().iterator();

									while( it.hasNext() )
									{
										OpenlinkUserInterest eachInterest = (OpenlinkUserInterest)it.next();
										eachInterest.handleCallHeld(callID);
									}

									publishOpenlinkCallEvent(traderLyncInterest);
								}

							} else {

								errorMessage = "User device not online";
							}
						}


						if ("StartVoiceDrop".equals(action))
						{

							//VMessage message = getVMId(traderLyncUser, value1);

							//if (message == null)
							//{
							//	errorMessage = "A valid voice message feature Id must be provided for a StartVoiceDrop action";

							//} else {

								//String exten = traderLyncVmsService.getVMExtenToDial(traderLyncUser, message.getId(), message.getName());
								//errorMessage = traderLyncLinkService.addExternalCall(traderLyncCall.getLine(), makeDialableNumber(exten));
							//}
						}

						if ("StopVoiceDrop".equals(action))
						{
							//Message message = getVMId(traderLyncUser, value1);

							//if (message == null)
							//{
							//	errorMessage = "A valid voice message feature Id must be provided for a StartVoiceDrop action";

							//} else {

								//String exten = traderLyncVmsService.getVMExtenToDial(traderLyncUser, message.getId(), message.getName());
								//errorMessage = traderLyncLinkService.removeExternalCall(traderLyncCall.getLine(), makeDialableNumber(exten));
							//}
						}

					} else errorMessage = "Action is not valid";

				} else errorMessage = "Call id not found";

			} else errorMessage = "Interest not found";

		}
		catch(Exception e) {
        	Log.error("["+ site.getName() + "] processUserAction " + e);
        	e.printStackTrace();
        	errorMessage = "Request Action internal error - " + e.toString();
        }


        if (errorMessage != null && command != null)
        {
			Element note = command.addElement("note");
			note.addAttribute("type", "error");
			note.setText("Request Action - " + errorMessage);
		}

		return errorMessage;
	}


	public String setFeature(Element newCommand, String profileID, String featureID, String value1, String value2)
	{
		Log.info( "["+ site.getName() + "] setFeature " + profileID + " " + featureID + " " + value1 + " " + value2);
		String errorMessage = null;

		try {

			if (value1 != null && value1.length() > 0)
			{
				OpenlinkUser traderLyncUser = getOpenlinkProfile(profileID);

				if (traderLyncUser != null)
				{
					if ("hs_1".equals(featureID))
					{
						if (validateTrueFalse(value1))
							traderLyncUser.setHandsetNo("true".equals(value1.toLowerCase()) ? "1" : "2");
						else
							errorMessage = "value1 is not true or false";

					}

					else if ("hs_2".equals(featureID))
					{
						if (validateTrueFalse(value1))
							traderLyncUser.setHandsetNo("true".equals(value1.toLowerCase()) ? "2" : "1");
						else
							errorMessage = "value1 is not true or false";
					}

					else if ("priv_1".equals(featureID))
					{
						if (validateTrueFalse(value1))
							traderLyncUser.setAutoPrivate("true".equals(value1.toLowerCase()));
						else
							errorMessage = "value1 is not true or false";
					}

					else if ("hold_1".equals(featureID))
					{
						if (validateTrueFalse(value1))
							traderLyncUser.setAutoHold("true".equals(value1.toLowerCase()));
						else
							errorMessage = "value1 is not true or false";
					}

					else if ("callback_1".equals(featureID))
					{
						if (validateTrueFalse(value1))
						{
							if ("true".equals(value1.toLowerCase()))
							{
								if (value2 != null && !"".equals(value2))
								{
									String dialableNumber = makeDialableNumber(value2);

									if (dialableNumber != null && !"".equals(dialableNumber))
									{
										traderLyncUser.setCallback(dialableNumber);
										OpenlinkCallback traderLyncCallback = null; //traderLyncLinkService.allocateCallback(traderLyncUser);

										if (traderLyncCallback == null)
											errorMessage = "unable to allocate a virtual turret";

									} else errorMessage = "value2 is not a dialable number";

								} else {

									if (traderLyncUser.getCallback() != null)
									{
										OpenlinkCallback traderLyncCallback = null; //traderLyncLinkService.allocateCallback(traderLyncUser);

										if (traderLyncCallback == null)
											errorMessage = "unable to allocate a callback";

									} else errorMessage = "calback destination is missing";
								}

							} else  {

								//traderLyncLinkService.freeCallback(traderLyncUser.getUserNo());
								traderLyncUser.setPhoneCallback(null);
							}
						}
						else errorMessage = "value1 is not true or false";
					}

					else if ("fwd_1".equals(featureID))	// call forward
					{
						if (openlinkInterests.containsKey(value1))	// value is interest id
						{
							OpenlinkUserInterest traderLyncUserInterest = openlinkInterests.get(value1);

							if (traderLyncUser.getUserNo().equals(traderLyncUser.getUserNo()))
							{
								if ("D".equals(traderLyncUserInterest.getInterest().getInterestType()))
								{
									String pname = site.getName().toLowerCase();

									String pbxFWDCodePrefix	= JiveGlobals.getProperty(Properties.Openlink_PBX_FWD_CODE_PREFIX + "." + pname, "*41");
									String pbxFWDCodeSuffix = JiveGlobals.getProperty(Properties.Openlink_PBX_FWD_CODE_SUFFIX + "." + pname, "");
									String pbxFWDCodeCancel	= JiveGlobals.getProperty(Properties.Openlink_PBX_FWD_CODE_CANCEL + "." + pname, "*41");

									String dialDigits = null;

									if (value2 == null || "".equals(value2))
									{
										dialDigits = pbxFWDCodeCancel;
										errorMessage = doCallForward(dialDigits, traderLyncUserInterest, newCommand);

										if (errorMessage == null)
										{
											Iterator<OpenlinkUserInterest> iter2 = traderLyncUserInterest.getInterest().getUserInterests().values().iterator();

											while( iter2.hasNext() )
											{
												OpenlinkUserInterest theUserInterest = (OpenlinkUserInterest)iter2.next();
												theUserInterest.setCallFWD("false");
											}

											traderLyncUser.setLastCallForward("");
										}

									} else {

										String dialableNumber = makeDialableNumber(value2);

										if (dialableNumber != null && !"".equals(dialableNumber))
										{
											dialDigits = pbxFWDCodePrefix + dialableNumber + pbxFWDCodeSuffix;
											errorMessage = doCallForward(dialDigits, traderLyncUserInterest, newCommand);

											if (errorMessage == null)
											{
												Iterator<OpenlinkUserInterest> iter2 = traderLyncUserInterest.getInterest().getUserInterests().values().iterator();

												while( iter2.hasNext() )
												{
													OpenlinkUserInterest theUserInterest = (OpenlinkUserInterest)iter2.next();
													theUserInterest.setCallFWD("true");
													theUserInterest.setCallFWDDigits(value2);
												}

												traderLyncUser.setLastCallForwardInterest(value1);
												traderLyncUser.setLastCallForward(value2);
											}

										} else errorMessage = "value2 is not a dialable number";
									}

								} else errorMessage = "CallForward requires a directory number interest";

							} else errorMessage = "Interest does not belong to this profile";

						} else errorMessage = "Interest not found";
					}
					else errorMessage = "Feature not found";

				} else errorMessage = "Profile not found";

			} else errorMessage = "Input1 is missing";
		}
		catch(Exception e) {
			Log.error("["+ site.getName() + "] setFeature " + e);
        	e.printStackTrace();
			errorMessage = "Internal error - " + e.toString();
		}

        return errorMessage;
	}


	private String doCallForward(String dialDigits, OpenlinkUserInterest traderLyncUserInterest, Element newCommand)
	{
		String errorMessage = null;

		//traderLyncUserInterest.getUser().selectCallset(this, traderLyncUserInterest.getInterest().getCallset(), traderLyncUserInterest.getUser().getHandsetNo(), "true", "true", dialDigits);
		//errorMessage = waitForFirstEvent(newCommand, traderLyncUserInterest.getUser(), false, traderLyncUserInterest.getUser().getHandsetNo());
		//traderLyncLinkService.clearCall(traderLyncUserInterest.getUser().getDeviceNo(), traderLyncUserInterest.getUser().getHandsetNo());

		return errorMessage;
	}



	public String manageVoiceBridge(Element newCommand, JID userJID, List<Object[]> actions)
	{
		Log.info( "["+ site.getName() + "] manageVoiceMessage " + userJID + " ");
		String errorMessage = "";
		List<String> actionList = new ArrayList<String>();

		try {

			if (actions != null && actions.size() > 0)
			{
				Iterator it = actions.iterator();

				while( it.hasNext() )
				{
					Object[] action = (Object[])it.next();
					String name = (String) action[0];
					String value1 = (String) action[1];
					String value2 = (String) action[2];

					String thisErrorMessage = null; //traderLyncLinkService.manageCallParticipant(userJID, value1, name, value2);

					if (thisErrorMessage == null)
					{
						if ("MakeCall".equalsIgnoreCase(name))
						{
							actionList.add(value1);
						}

					} else {

						errorMessage = errorMessage + thisErrorMessage + "; ";
					}
				}

				if (actionList.size() > 0)
				{
					//traderLyncLinkService.handlePostBridge(actionList);
				}

			} else errorMessage = "Voice message features are missing";

		}
		catch(Exception e) {
			Log.error("["+ site.getName() + "] manageVoiceBridge " + e);
			e.printStackTrace();
			errorMessage = "Internal error - " + e.toString();
		}

        return errorMessage.length() == 0 ? null : errorMessage;
	}




	public String manageVoiceMessage(Element newCommand, String profileID, String featureId, String action, String value1)
	{
		Log.info( "["+ site.getName() + "] manageVoiceMessage " + profileID + " " + featureId + " " + action + " " + value1);
		String errorMessage = null;

		try {

			if (action != null && action.length() > 0)
			{
				OpenlinkUser traderLyncUser = getOpenlinkProfile(profileID);

				if (traderLyncUser != null)
				{
					action = action.toLowerCase();

					if ("record".equals(action))
					{

					}

					else if ("edit".equals(action))
					{

					}

					else if ("playback".equals(action))
					{

					}

					else if ("delete".equals(action))
					{

					}

					else if ("save".equals(action))
					{

					}

					else if ("archive".equals(action))
					{

					} else  errorMessage = "Action not supported";

				} else errorMessage = "Profile not found";

			} else errorMessage = "Action is missing";
		}
		catch(Exception e) {
			Log.error("["+ site.getName() + "] manageVoiceMessage " + e);
			e.printStackTrace();
			errorMessage = "Internal error - " + e.toString();
		}

        return errorMessage;
	}

	private void addVoiceMessageExtension(Element newCommand, String exten, OpenlinkUser traderLyncUser, String msgId)
	{
		Element iodata = newCommand.addElement("iodata", "urn:xmpp:tmp:io-data");
		iodata.addAttribute("type","output");
		Element devicestatus = iodata.addElement("out").addElement("devicestatus", "http://xmpp.org/protocol/openlink:01:00:00#device-status");
		devicestatus.addElement("profile").setText(traderLyncUser.getProfileName());
		Element feature = devicestatus.addElement("features").addElement("feature").addAttribute("id", msgId);
		Element voicemessage = feature.addElement("voicemessage").addAttribute("xmlns", "http://xmpp.org/protocol/openlink:01:00:00/features#voice-message");

		voicemessage.addElement("msglen");
		voicemessage.addElement("status").setText("ok");
		voicemessage.addElement("statusdescriptor");
		voicemessage.addElement("state");

		if (exten == null || exten.length() == 0)
			voicemessage.addElement("exten");
		else
			voicemessage.addElement("exten").setText(exten);
	}

//-------------------------------------------------------
//
//
//
//-------------------------------------------------------

	public List<OpenlinkUser> getOpenlinkProfiles(JID jid)
	{
		List<OpenlinkUser> traderLyncUsers = new ArrayList();
		String userName = jid.getNode();

		if (jid.getDomain().indexOf(getDomain()) > -1)
		{
			Iterator<OpenlinkUser> it = traderLyncUserTable.values().iterator();

			while( it.hasNext() )
			{
				OpenlinkUser traderLyncUser = (OpenlinkUser)it.next();

				if (userName.equals(traderLyncUser.getUserId()))
				{
					traderLyncUsers.add(traderLyncUser);
				}
			}
		}

		return traderLyncUsers;
	}


	public OpenlinkUser getOpenlinkUser(JID jid)
	{
		return getOpenlinkUser(jid.getNode());
	}


	public OpenlinkUser getOpenlinkUser(String userName)
	{
		Iterator<OpenlinkUser> it = traderLyncUserTable.values().iterator();

		while( it.hasNext() )
		{
			OpenlinkUser traderLyncUser = (OpenlinkUser)it.next();

			if (userName.equals(traderLyncUser.getUserId()) && !"0.0.0.0".equals(traderLyncUser.getDeviceNo()))
			{
				return traderLyncUser;
			}
		}
		return null;
	}


	public OpenlinkUser getOpenlinkProfile(String profileID)
	{
		OpenlinkUser traderLyncUser = null;

		if (traderLyncUserTable.containsKey(profileID))
		{
			traderLyncUser = traderLyncUserTable.get(profileID);
		}

		return traderLyncUser;
	}

	public OpenlinkUserInterest getOpenlinkInterest(String userInterest)
	{
		OpenlinkUserInterest traderLyncUserInterest = null;

		if (openlinkInterests.containsKey(userInterest))
		{
			traderLyncUserInterest = openlinkInterests.get(userInterest);
		}

		return traderLyncUserInterest;
	}

	public String getSiteID()
	{
		return String.valueOf(site.getSiteID());
	}

	public void sendPacket(Packet packet)
	{
		try {
			componentManager.sendPacket(this, packet);

		} catch (Exception e) {
			Log.error("Exception occured while sending packet." + e);

		}
	}


    public void getInterestSubscriptions()
    {
		Log.info( "["+ site.getName() + "] getInterestSubscriptions");

		try {
			Iterator<OpenlinkUser> iter = traderLyncUserTable.values().iterator();

			while(iter.hasNext())
			{
				OpenlinkUser traderLyncUser = (OpenlinkUser)iter.next();

				Iterator<OpenlinkInterest> iter2 = traderLyncUser.getInterests().values().iterator();

				while( iter2.hasNext() )
				{
					OpenlinkInterest traderLyncInterest = (OpenlinkInterest)iter2.next();
					getInterestSubscriptions(traderLyncInterest, traderLyncUser.getUserNo());
				}
			}
		}
		catch(Exception e) {
			Log.error("["+ site.getName() + "] getInterestSubscriptions " + e);
		}
    }


//-------------------------------------------------------
//
//
//
//-------------------------------------------------------


    public boolean validateTrueFalse(String value1)
    {
		boolean valid = false;
		String flag = value1.toLowerCase();

		if ("true".equals(flag) || "false".equals(flag))
		{
			valid = true;
		}
		return valid;
	}


    public String makeDialableNumber(String digits)
    {
		String dialableNumber = null;

		if ((digits != null && !"".equals(digits)) || digits.startsWith("sip:") || digits.startsWith("tel:"))
		{
			dialableNumber = digits;
/*
			String cononicalNumber = formatCanonicalNumber(convertAlpha(digits));

			if (cononicalNumber != null && !"".equals(cononicalNumber))
			{
				dialableNumber = formatDialableNumber(cononicalNumber);
			}
*/
			Log.info( "["+ site.getName() + "] makeDialableNumber " + digits + "=>" + dialableNumber);
		}

		return dialableNumber;
	}

	private String convertAlpha(String input)
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

	public boolean isComponent(JID jid) {
		final RoutingTable routingTable = XMPPServer.getInstance().getRoutingTable();

		if (routingTable != null)
		{
			return routingTable.hasComponentRoute(jid);
		}
		return false;
	}

	public void setRefreshCacheInterval()
	{
		Log.info( "["+ site.getName() + "] setRefreshCacheInterval ");

		try {


		}
		catch (Exception e)
		{
			Log.error("["+ site.getName() + "] setRefreshCacheInterval " + e);
		}
	}

//-------------------------------------------------------
//
//
//
//-------------------------------------------------------


	private void getUserProfiles()
	{
		try
		{
			Collection<User> users = userManager.getUsers();

            Iterator it = users.iterator();

			while( it.hasNext() )
			{
               	User user = (User)it.next();

				String userEmail = user.getEmail();
				String userPhone = user.getProperties().get("wirelynk.phone.other") != null ? user.getProperties().get("wirelynk.phone.other") : (userEmail != null && userEmail.indexOf(";fsu=") > -1 ? userEmail : "");
				String userId = user.getUsername(); //getUserNo(user.getEmail());

				if(userId != null && userId.equals(JiveGlobals.getProperty("wirelynk.default.username", "wirelynk")) == false && userPhone.indexOf(";wl=") == -1 && userPhone.indexOf(";ddi=") == -1 && userPhone.indexOf(";lid=") == -1)
				{
					Log.info( "["+ site.getName() + "] getUserProfiles - user profile " + user.getUsername());

					OpenlinkUser traderLyncUser = new OpenlinkUser();
					traderLyncUser.setUserName(user.getName());
					traderLyncUser.setUserId(userId);
					traderLyncUser.setUserNo(user.getUsername());
					traderLyncUser.setSiteName(getName());
					traderLyncUser.setSiteID(1);
					traderLyncUser.setHandsetNo("1");
					//traderLyncUser.setDeviceType("wirelynk");

					createInterest(traderLyncUser, userId, "D", user.getName(), "true", userId);

					if (userProfiles.containsKey(userId) == false)
					{
						traderLyncUser.setDefault("true");
						userProfiles.put(userId, traderLyncUser);
					}

					traderLyncUserTable.put(traderLyncUser.getUserNo(), traderLyncUser);

					Roster roster = rosterManager.getRoster(user.getUsername());

					List<RosterItem> rosterItems = new ArrayList<RosterItem>(roster.getRosterItems());
					Collections.sort(rosterItems, new RosterItemComparator());

					for (RosterItem rosterItem : rosterItems)
					{
						try {
							String interestNode = rosterItem.getJid().getNode();
							User itemUser = userManager.getUser(interestNode);
							String itemEmail = itemUser.getEmail();

							String phone = itemUser.getProperties().get("wirelynk.phone.other") != null ? itemUser.getProperties().get("wirelynk.phone.other") : (itemEmail != null && itemEmail.indexOf(";fsu=") > -1 ? itemEmail : "");

							if (phone.indexOf(";wl=") > -1 && (phone.indexOf(";ddi=") > -1 || phone.indexOf(";lid=") > -1) && userId.equals(interestNode) == false && interestNode.equals(JiveGlobals.getProperty("wirelynk.default.username", "wirelynk")) == false)
							{
								createInterest(traderLyncUser, interestNode, "L", rosterItem.getNickname(), "false", phone);
							}

						} catch (Exception e) {
	        				Log.error( "["+ site.getName() + "] " +  "Error in getProfiles ",e);
						}
					}

					createPubsubNode(user.getUsername() + "@" + getDomain());
				}
			}
		}
		catch (Exception e)
		{
	        Log.error( "["+ site.getName() + "] " +  "Error in getProfiles ",e);
		}
	}

	private void createInterest(OpenlinkUser traderLyncUser, String interestNode, String interestType, String nickname, String defaultInterest, String interestValue)
	{
		Log.info( "["+ site.getName() + "] createInterest " + interestNode);

		OpenlinkInterest traderLyncInterest = null;

		if (traderLyncInterests.containsKey(interestNode))
		{
			traderLyncInterest = traderLyncInterests.get(interestNode);

		} else {

			traderLyncInterest = new OpenlinkInterest(interestNode);
		}

		traderLyncInterest.setInterestType(interestType);
		traderLyncInterest.setSiteName(getName());
		traderLyncInterest.setInterestLabel(nickname);
		traderLyncInterest.setInterestValue(interestValue);

		traderLyncInterests.put(interestNode, traderLyncInterest);

		if (defaultInterest.equals("true"))
		{
			traderLyncUser.setDefaultInterest(traderLyncInterest);
		}

		OpenlinkUserInterest traderLyncUserInterest = traderLyncInterest.addUserInterest(traderLyncUser, defaultInterest);
		traderLyncUser.addInterest(traderLyncInterest);

		openlinkInterests.put(interestNode + traderLyncUser.getUserNo(), traderLyncUserInterest);

		createPubsubNode(traderLyncInterest.getInterestId() + traderLyncUser.getUserNo());
		getInterestSubscriptions(traderLyncInterest, traderLyncUser.getUserNo());
	}

//-------------------------------------------------------
//
//
//
//-------------------------------------------------------


	private String getUserNo(String email)
	{
		if (email != null)
		{
			int pos = email.indexOf("@");

			if ( pos > -1)
			{
				return email.substring(0, pos);

			} else {

				return email;
			}

		} else return null;
	}

	private String getTelVoiceNumber(Element vCard, String work, String voice)
	{
		String telVoiceNumber = null;

		for ( Iterator i = vCard.elementIterator( "TEL" ); i.hasNext(); )
		{
			Element tel = (Element) i.next();
			//Log.info( "["+ site.getName() + "] getTelVoiceNumber - tel " + tel.asXML());

			if (tel.element(work) != null && tel.element(voice) != null)
			{
				Element number = tel.element("NUMBER");

				if (number != null)
				{
					//Log.info( "["+ site.getName() + "] getTelVoiceNumber - number " + number.getText());
					telVoiceNumber = number.getText();
					break;
				}
			}
		}

		return telVoiceNumber;
	}

//-------------------------------------------------------
//
//
//
//-------------------------------------------------------


    public void outgoingCallNotification(String requester, String callId, boolean connected, String dialDigits, String label)
    {
		Log.info( "["+ site.getName() + "] outgoingCallNotification " + requester + " " + callId);

		try {

			if (callInterests.containsKey(callId))
			{
				OpenlinkInterest callInterest = callInterests.get(callId);

				Iterator<OpenlinkUserInterest> it4 = callInterest.getUserInterests().values().iterator();

				while( it4.hasNext() )
				{
					OpenlinkUserInterest userInterest = (OpenlinkUserInterest)it4.next();

					if (connected)
					{
						if (requester.equals(userInterest.getUser().getUserNo()))
						{
							userInterest.handleCallOutgoing("CallOriginated", callId, dialDigits, label);
							userInterest.handleCallOutgoing("CallDelivered", callId, dialDigits, label);
							userInterest.handleCallOutgoing("CallEstablished", callId, dialDigits, label);

						} else {

							userInterest.handleCallOutgoing("CallBusy", callId, dialDigits, label);
						}

					} else {

						userInterest.handleConnectionCleared(callId);
					}

				}

				publishOpenlinkCallEvent(callInterest);

				if (!connected)
				{
					//deleteEvents(callInterest, callId);
				}
			}

		} catch (Exception e) {

			Log.error( "["+ site.getName() + "] " +  "Error in outgoingCallNotification ", e);
		}
    }


/*
    public void notifyConferenceMonitors(ConferenceEvent conferenceEvent)
    {
		if ("IncomingCallsConference".equals(conferenceEvent.getConferenceId()) == false)
		{
			Log.info( "["+ site.getName() + "] notifyConferenceMonitors " + conferenceEvent.toString());

			try {

				if (conferenceEvent.equals(ConferenceEvent.MEMBER_LEFT) || conferenceEvent.equals(ConferenceEvent.MEMBER_JOINED))
				{
					Log.info( "["+ site.getName() + "] notifyConferenceMonitors looking for call " + conferenceEvent.getCallId() + " " + conferenceEvent.getMemberCount());

					CallHandler callHandler = CallHandler.findCall(conferenceEvent.getCallId());

					if (callHandler != null)
					{
						Log.info( "["+ site.getName() + "] notifyConferenceMonitors found call handler " + callHandler);

						CallParticipant callParticipant = callHandler.getCallParticipant();

						if (callParticipant != null && callParticipant.getDeviceAddress() != null)
						{
							Log.info( "["+ site.getName() + "] notifyConferenceMonitors found device " + callParticipant.getDeviceAddress());

							Iterator<OpenlinkUser> iter = traderLyncUserTable.values().iterator();

							while(iter.hasNext())
							{
								OpenlinkUser traderLyncUser = (OpenlinkUser)iter.next();

								if (callParticipant.getDeviceAddress().equals(traderLyncUser.getDeviceNo()))
								{
									if (conferenceEvent.equals(ConferenceEvent.MEMBER_JOINED))
									{
										Log.info( "["+ site.getName() + "] notifyConferenceMonitors setting device callid " + traderLyncUser.getUserNo() + " " + conferenceEvent.getCallId());
										traderLyncUser.setHandsetCallId(conferenceEvent.getCallId());

									} else {
										Log.info( "["+ site.getName() + "] notifyConferenceMonitors resetting device callid " + traderLyncUser.getUserNo() + " " + conferenceEvent.getCallId());
										traderLyncUser.setHandsetCallId(null);
									}
									break;
								}
							}

							// set call state

							if (callInterests.containsKey(conferenceEvent.getConferenceId()))
							{
								// conf id is our far party call id

								OpenlinkInterest callInterest = callInterests.get(conferenceEvent.getConferenceId());
								Log.info( "["+ site.getName() + "] notifyConferenceMonitors found far party " + callInterest.getInterestValue());

								Iterator it = callInterest.getUserInterests().values().iterator();

								while( it.hasNext() )
								{
									OpenlinkUserInterest traderLyncUserInterest = (OpenlinkUserInterest)it.next();
									handleCallState(conferenceEvent, traderLyncUserInterest);
								}

								publishOpenlinkCallEvent(callInterest);

								if (conferenceEvent.getMemberCount() == 1 && conferenceEvent.equals(ConferenceEvent.MEMBER_LEFT) && ConferenceManager.getLastMember(conferenceEvent.getConferenceId()).isConferenceMuted() == false)
								{
									// held callers are muted. orphan participant wil NOT be muted and should be disconnected

									Log.info( "["+ site.getName() + "] notifyConferenceMonitors tearing down " + conferenceEvent.getConferenceId());
									CallHandler.hangup(conferenceEvent.getConferenceId(), "User requested call termination");
									deleteEvents(callInterest, conferenceEvent.getConferenceId());
									ConferenceManager.endConference(conferenceEvent.getConferenceId());
								}
							}
						}
					}
				}

			} catch (Exception e) {

				Log.error( "["+ site.getName() + "] " +  "Error in notifyConferenceMonitors " + e);
				e.printStackTrace();
			}
		}
    }

*/
//-------------------------------------------------------
//
//
//
//-------------------------------------------------------

/*
	private void handleCallState(ConferenceEvent conferenceEvent, OpenlinkUserInterest traderLyncUserInterest)
	{
		Log.info( "["+ site.getName() + "] handleCallState " + traderLyncUserInterest.getUser().getUserNo() + " " + conferenceEvent.getMemberCount());

		OpenlinkInterest traderLyncInterest = traderLyncUserInterest.getInterest();
		OpenlinkUser traderLyncUser = traderLyncUserInterest.getUser();


		CallHandler callHandlerFarParty = CallHandler.findCall(conferenceEvent.getConferenceId()); // get far party call objects

		if (callHandlerFarParty != null && callHandlerFarParty.getCallParticipant() != null)
		{
			CallParticipant callParticipantFarParty = callHandlerFarParty.getCallParticipant();
			String activeUser = callParticipantFarParty.getRequester();

			if (conferenceEvent.getMemberCount() == 2)
			{
				Log.info( "["+ site.getName() + "] handleCallState  2 participants " + activeUser);

				// far party and a single user left,  find user and set as connected, everyone else busy

				if (conferenceEvent.equals(ConferenceEvent.MEMBER_JOINED))
				{
					if (activeUser.equals(traderLyncUser.getUserNo()))
					{
						traderLyncUserInterest.handleCallConnected(conferenceEvent.getConferenceId());

					} else {

						traderLyncUserInterest.handleCallBusy(conferenceEvent.getConferenceId());
					}

				} else {	// participant left, find last remaining participant

					if (activeUser.equals(traderLyncUser.getUserNo()) == false && traderLyncUser.getHandsetCallId() != null)
					{
						traderLyncUserInterest.handleCallConnected(conferenceEvent.getConferenceId());

					} else {

						traderLyncUserInterest.handleCallBusy(conferenceEvent.getConferenceId());
					}
				}

			} else if (conferenceEvent.getMemberCount() == 1)	{

				Log.info( "["+ site.getName() + "] handleCallState  1 participant " + traderLyncUser.getHandsetCallId());

				if (conferenceEvent.equals(ConferenceEvent.MEMBER_JOINED) && traderLyncUser.getHandsetCallId() != null)
				{
					// new joiner is a device (handset/speaker), we should be connected

					traderLyncUserInterest.handleCallConnected(conferenceEvent.getConferenceId());
				}


			} else {	// just change state of new joiner, everyone else keep old state

				Log.info( "["+ site.getName() + "] handleCallState  multiple participants " + traderLyncUser.getUserNo());

				if (conferenceEvent.equals(ConferenceEvent.MEMBER_JOINED) && activeUser.equals(traderLyncUser.getUserNo()))
				{
					traderLyncUserInterest.handleCallConferenced(conferenceEvent.getConferenceId());

				}
			}
		}

	}

*/

	public void logRecordEvent(OpenlinkUserInterest userInterest, JSONObject eventJSON, String callId, String direction)
	{
		Log.info("logRecordEvent " + callId + "\n" + eventJSON);

		OpenlinkCall traderLyncCall = userInterest.getCallById(callId);

		if (traderLyncCall != null)
		{
			traderLyncCall.line = (eventJSON.has("recording") ? eventJSON.getString("recording") : "");
			traderLyncCall.direction = direction;

			if (eventJSON.has("name")) traderLyncCall.ddi = eventJSON.getString("name");
			if (eventJSON.has("label")) traderLyncCall.ddiLabel = eventJSON.getString("label");

			if (eventJSON.has("number"))
			{
				String conference = eventJSON.getString("number");
				traderLyncCall.setCLI(conference);
				traderLyncCall.setCLILabel(conference);
			}

			userInterest.logCall(traderLyncCall, getDomain(), 0);
		}
	}

	public void sendUserInterestEvent(String username, JSONObject eventJSON)
	{
		Log.info("sendUserInterestEvent " + username + "\n" + eventJSON);

		String state = eventJSON.getString("state");
		String privateWire = eventJSON.getString("name");
		String label = eventJSON.getString("label");
		String callId = privateWire + username;

		if (traderLyncInterests.containsKey(privateWire))
		{
			OpenlinkInterest callInterest = traderLyncInterests.get(privateWire);

			if (callInterests.containsKey(callId) == false)
			{
				callInterests.put(callId, callInterest);
			}

			if (callInterest.getUserInterests().containsKey(username))
			{
				OpenlinkUserInterest userInterest = callInterest.getUserInterests().get(username);
				boolean processed = false;

				if (state.equals("ringing"))
				{
					String from = privateWire;
					String to = privateWire;

					if (eventJSON.has("from")) from =  eventJSON.getString("from");
					if (eventJSON.has("to")) from =  eventJSON.getString("to");

					userInterest.handleCallIncoming(callId, from, to);

					logRecordEvent(userInterest, eventJSON, callId, "Incoming");
					processed = true;
				}

				if (state.equals("originated"))
				{
					String dialDigits = privateWire;
					userInterest.handleCallOutgoing("CallOriginated", callId, dialDigits, label);
					userInterest.handleCallOutgoing("CallDelivered", callId, dialDigits, label);
					processed = true;
				}

				if (state.equals("connected") || state.equals("answered"))
				{
					userInterest.handleCallConnected(callId);

					if (state.equals("connected")) logRecordEvent(userInterest, eventJSON, callId, "Outgoing");
					processed = true;
				}

				if (state.equals("conferenced"))
				{
					userInterest.handleCallConferenced(callId);
					processed = true;
				}

				if (state.equals("busy"))
				{
					userInterest.handleCallBusy(callId);
					processed = true;
				}

				if (state.equals("idle"))
				{
					userInterest.handleConnectionCleared(callId);
					processed = true;
				}

				if (state.equals("held"))
				{
					userInterest.handleCallHeld(callId);
					processed = true;
				}

				if (processed)
				{
					publishOpenlinkUserCallEvent(userInterest);
				}

				if (state.equals("idle"))
				{
					userInterest.removeCallById(callId);
				}
			}
		}
	}


	public void handleCallIncomingPW(String callId, String privateWire, String from, String to)
	{
		OpenlinkInterest lineInterest = getInterest(callId, privateWire);

		if (lineInterest!= null)
		{
			Iterator<OpenlinkUserInterest> it = lineInterest.getUserInterests().values().iterator();

			while(it.hasNext())
			{
				OpenlinkUserInterest userInterest = (OpenlinkUserInterest)it.next();
				userInterest.handleCallIncoming(callId, from, to);
			}

			publishOpenlinkCallEvent(lineInterest);
		}
	}

	private OpenlinkInterest getInterest(String callId, String privateWire)
	{
		Log.info( "["+ site.getName() + "] getInterest " + callId + " " + privateWire);

		OpenlinkInterest callInterest = null;

		if (callInterests.containsKey(callId))
			callInterest = callInterests.get(callId);

		else {

			if (traderLyncInterests.containsKey(privateWire))
			{
				callInterest = traderLyncInterests.get(privateWire);
			}

			if (callInterest != null)
			{
				callInterests.put(callId, callInterest);
			}
		}

		return callInterest;
	}

	private void deleteEvents(OpenlinkInterest callInterest, String callId)
	{
		Log.info( "["+ site.getName() + "] deleteEvents " + callId);

		Iterator<OpenlinkUserInterest> it4 = callInterest.getUserInterests().values().iterator();

		while( it4.hasNext() )
		{
			OpenlinkUserInterest userInterest = (OpenlinkUserInterest)it4.next();
			OpenlinkCall traderLyncCall = userInterest.removeCallById(callId);

			if (traderLyncCall != null)
			{
				userInterest.logCall(traderLyncCall, getDomain(), 0);
			}
		}

		callInterests.remove(callId);
	}


//-------------------------------------------------------
//
//
//
//-------------------------------------------------------



	public synchronized void publishOpenlinkCallEvent(OpenlinkInterest traderLyncInterest)
	{
		if ((ClusterManager.isClusteringEnabled() && ClusterManager.isSeniorClusterMember()) || !ClusterManager.isClusteringEnabled())
		{
			Log.info( "["+ site.getName() + "] publishOpenlinkCallEvent - interest " + traderLyncInterest.getInterestId());

			Iterator it = traderLyncInterest.getUserInterests().values().iterator();

			while( it.hasNext() )
			{
				OpenlinkUserInterest traderLyncUserInterest = (OpenlinkUserInterest)it.next();
				publishOpenlinkUserCallEvent(traderLyncUserInterest);
			}
		}
	}

	public synchronized void publishOpenlinkUserCallEvent(OpenlinkUserInterest traderLyncUserInterest)
	{
		if ((ClusterManager.isClusteringEnabled() && ClusterManager.isSeniorClusterMember()) || !ClusterManager.isClusteringEnabled())
		{
			Log.info( "["+ site.getName() + "] publishOpenlinkUserEvent - user interest " + traderLyncUserInterest.getInterestName() + " enabled: " + traderLyncUserInterest.getUser().enabled());

			if (traderLyncUserInterest.getUser().enabled())
			{
				if (traderLyncUserInterest.canPublish(this))
				{
					publishOpenlinkUserInterestEvent(traderLyncUserInterest.getInterest(), traderLyncUserInterest);
				}

				updateCacheContent(traderLyncUserInterest);
			}
		}
	}


	private void publishOpenlinkUserInterestEvent(OpenlinkInterest traderLyncInterest, OpenlinkUserInterest traderLyncUserInterest)
	{
		Log.info( "["+ site.getName() + "] publishOpenlinkUserInterestEvent - scan user interest " + traderLyncUserInterest.getUser().getUserId() + " " + traderLyncUserInterest.getInterest().getInterestId());

		if (!"0.0.0.0".equals(traderLyncUserInterest.getUser().getDeviceNo()))
		{
			Log.info( "["+ site.getName() + "] publishOpenlinkUserInterestEvent - publish user interest " + traderLyncUserInterest.getUser().getUserId() + " " + traderLyncUserInterest.getInterest().getInterestId());

			String interestNode = traderLyncInterest.getInterestId() + traderLyncUserInterest.getUser().getUserNo();

			IQ iq = new IQ(IQ.Type.set);
			iq.setFrom(getName() + "." + getDomain());
			iq.setTo("pubsub." + getDomain());
			Element pubsub = iq.setChildElement("pubsub", "http://jabber.org/protocol/pubsub");
			Element publish = pubsub.addElement("publish").addAttribute("node", interestNode);
			Element item = publish.addElement("item").addAttribute("id", interestNode);
			Element calls = item.addElement("callstatus", "http://xmpp.org/protocol/openlink:01:00:00#call-status");
			boolean busy = traderLyncUserInterest.getBusyStatus();
			calls.addAttribute("busy", busy ? "true" : "false");

			if ("true".equals(traderLyncUserInterest.getCallFWD()))
			{
				calls.addAttribute("fwd", traderLyncUserInterest.getCallFWDDigits());
			}

			addOpenlinkCallsEvents(traderLyncInterest, traderLyncUserInterest, calls);

			if (calls.nodeCount() > 0)
			{
				sendPacket(iq);
			}

			JID profileJID = new JID(traderLyncUserInterest.getUser().getUserNo() + "@" + getDomain() + "/traderlync");

			Session session = (LocalClientSession) XMPPServer.getInstance().getSessionManager().getSession(profileJID);

			if (session != null)
			{

			}
		}
	}


	private void updateCacheContent(OpenlinkUserInterest traderLyncUserInterest)
	{
		Log.info( "["+ site.getName() + "] updateCacheContent - user interest " + traderLyncUserInterest.getInterestName());

		Iterator it2 = traderLyncUserInterest.getCalls().values().iterator();

		while( it2.hasNext() )
		{
			OpenlinkCall traderLyncCall = (OpenlinkCall)it2.next();
		}
	}


	private void addOpenlinkCallsEvents(OpenlinkInterest traderLyncInterest, OpenlinkUserInterest traderLyncUserInterest, Element calls)
	{
		Log.info( "["+ site.getName() + "] addOpenlinkCallsEvents - user interest " + traderLyncUserInterest.getInterestName());

		Iterator it2 = traderLyncUserInterest.getCalls().values().iterator();

		while( it2.hasNext() )
		{
			OpenlinkCall traderLyncCall = (OpenlinkCall)it2.next();

			if (!"Unknown".equals(traderLyncCall.getState()) && !traderLyncCall.deleted)
			{
				Element call = calls.addElement("call");
				addOpenlinkCallEvents(traderLyncInterest, traderLyncUserInterest, call, traderLyncCall);
			}
		}
	}

	public synchronized void addOpenlinkCallEvents(OpenlinkInterest traderLyncInterest, OpenlinkUserInterest traderLyncUserInterest, Element call, OpenlinkCall traderLyncCall)
	{
		Log.info( "["+ site.getName() + "] addOpenlinkCallEvents - user interest " + traderLyncUserInterest.getInterestName() + " " + traderLyncCall.getCallID());

		call.addElement("id").setText(traderLyncCall.getCallID());
		call.addElement("profile").setText(traderLyncUserInterest.getUser().getProfileName());
		call.addElement("interest").setText(traderLyncUserInterest.getInterestName());
		call.addElement("changed").setText(traderLyncCall.getStatus());
		call.addElement("state").setText(traderLyncCall.getState());
		call.addElement("direction").setText(traderLyncCall.getDirection());

		Element caller = call.addElement("caller");
		caller.addElement("number").setText(traderLyncCall.getCallerNumber(traderLyncInterest.getInterestType()));
		caller.addElement("name").setText(traderLyncCall.getCallerName(traderLyncInterest.getInterestType()));

		Element called = call.addElement("called");
		called.addElement("number").setText(traderLyncCall.getCalledNumber(traderLyncInterest.getInterestType()));
		called.addElement("name").setText(traderLyncCall.getCalledName(traderLyncInterest.getInterestType()));

		call.addElement("duration").setText(String.valueOf(traderLyncCall.getDuration()));

		Element actions = call.addElement("actions");

		Iterator it4 = traderLyncCall.getValidActions().iterator();

		while( it4.hasNext() )
		{
			String action = (String)it4.next();
			actions.addElement(action);
		}

		Element features  = call.addElement("features");
		addFeature(features, "priv_1", "Y".equals(traderLyncCall.getPrivacy()) ? "true" : "false");
		addFeature(features, "hs_1",  "1".equals(traderLyncCall.getHandset()) ? "true" : "false");
		addFeature(features, "hs_2",  "2".equals(traderLyncCall.getHandset()) ? "true" : "false");
/*
		if (traderLyncUserInterest.getUser().getCallback() != null && isCallbackAvailable() && traderLyncUserInterest.getUser().getCallbackActive())
		{
			addFeature(features, "callback_1",  traderLyncUserInterest.getUser().getCallback());
		}
*/
		Element participants  = call.addElement("participants");

		Iterator it3 = traderLyncInterest.getUserInterests().values().iterator();

		while( it3.hasNext() )
		{
			OpenlinkUserInterest traderLyncParticipant = (OpenlinkUserInterest)it3.next();

			if (!"0.0.0.0".equals(traderLyncParticipant.getUser().getDeviceNo()))
			{
				OpenlinkCall participantCall = traderLyncParticipant.getCallByLine(traderLyncCall.getLine());

				if (participantCall != null)
				{
					Element participant  = participants.addElement("participant");
					participant.addAttribute("jid", traderLyncParticipant.getUser().getUserId() + "@" + getDomain());

					participant.addAttribute("type", participantCall.getParticipation());
					participant.addAttribute("direction", participantCall.getDirection());

					if (participantCall.firstTimeStamp != 0)
					{
						participant.addAttribute("timestamp", String.valueOf(new Date(participantCall.firstTimeStamp)));
					}
				}
			}
		}
	}


	private void addFeature(Element features, String id, String value)
	{
		Element feature = features.addElement("feature");
		feature.addAttribute("id", id);
		feature.setText(value);
	}

	public synchronized void publishOpenlinkUserDeviceEvent(OpenlinkUser traderLyncUser)
	{
		Log.info( "["+ site.getName() + "] publishOpenlinkUserDeviceEvent - " + traderLyncUser.getUserId());

		if (!"0.0.0.0".equals(traderLyncUser.getDeviceNo()))
		{
			OpenlinkInterest traderLyncInterest = traderLyncUser.getDefaultInterest();

			if (traderLyncInterest != null)
			{
				String interestNode = traderLyncInterest.getInterestId() + traderLyncUser.getUserNo();

				IQ iq = new IQ(IQ.Type.set);
				iq.setFrom(getName() + "." + getDomain());
				iq.setTo("pubsub." + getDomain());
				Element pubsub = iq.setChildElement("pubsub", "http://jabber.org/protocol/pubsub");
				Element publish = pubsub.addElement("publish").addAttribute("node", interestNode);
				Element item = publish.addElement("item").addAttribute("id", interestNode);
				Element device = item.addElement("devicestatus", "http://xmpp.org/protocol/openlink:01:00:00#device-status");

				Element features  = device.addElement("features");
				addFeature(features, "icom_1", traderLyncUser.intercom() ? "true" : "false");

				sendPacket(iq);
			}
		}
	}

	public void createPubsubNode(String interestNode)
	{
		//Log.info("["+site.getName()+"] createPubsubNode - " + interestNode);

		String domain = getDomain();

		IQ iq1 = new IQ(IQ.Type.set);
		iq1.setFrom(getName() + "." + domain);
		iq1.setTo("pubsub." + domain);
		Element pubsub1 = iq1.setChildElement("pubsub", "http://jabber.org/protocol/pubsub");
		Element create = pubsub1.addElement("create").addAttribute("node", interestNode);

		Element configure = pubsub1.addElement("configure");
		Element x = configure.addElement("x", "jabber:x:data").addAttribute("type", "submit");

		Element field1 = x.addElement("field");
		field1.addAttribute("var", "FORM_TYPE");
		field1.addAttribute("type", "hidden");
		field1.addElement("value").setText("http://jabber.org/protocol/pubsub#node_config");

		//Element field2 = x.addElement("field");
		//field2.addAttribute("var", "pubsub#persist_items");
		//field2.addElement("value").setText("1");

		Element field3 = x.addElement("field");
		field3.addAttribute("var", "pubsub#max_items");
		field3.addElement("value").setText("1");

		Log.info("createPubsubNode " + iq1.toString());
		sendPacket(iq1);
	}

	public void getInterestSubscriptions(OpenlinkInterest traderLyncInterest, String userNo)
	{
		String interestNode = traderLyncInterest.getInterestId() + userNo;
		String domain = getDomain();

		Log.info("["+site.getName()+"] getInterestSubscriptions  - " + interestNode);

		IQ iq2 = new IQ(IQ.Type.get);
		iq2.setFrom(getName() + "." + domain);
		iq2.setTo("pubsub." + domain);
		Element pubsub2 = iq2.setChildElement("pubsub", "http://jabber.org/protocol/pubsub#owner");
		Element subscriptions = pubsub2.addElement("subscriptions").addAttribute("node", interestNode);

		Log.info("subscriptions " + iq2.toString());
		sendPacket(iq2);
	}

    class RosterItemComparator implements Comparator<RosterItem>
    {
        public int compare(RosterItem itemA, RosterItem itemB)
        {
            return itemA.getJid().toBareJID().compareTo(itemB.getJid().toBareJID());
        }
    }

//-------------------------------------------------------
//
//
//
//-------------------------------------------------------

	public void loadProfile(String userName)
	{
		Log.info("["+site.getName()+"] loadProfile  - " + userName);

		try {
			Document document = DocumentHelper.parseText("<traderlyncprofile xmlns=\"http://xmpp.org/protocol/traderlync#user-profile-device\"></traderlyncprofile>");
			Element searchElement = document.getRootElement();
			Element foundElement = XMPPServer.getInstance().getPrivateStorage().get(userName, searchElement);

			if (foundElement != null)
			{
				if (foundElement.element("ipaddress") != null)
				{
					String ipAddress = foundElement.element("ipaddress").getText();
					String hostName = foundElement.element("host").getText();
					String macAddress = foundElement.element("mac").getText();
					String userAgent = foundElement.element("agent").getText();
					String expansionMod1 = foundElement.element("exten1").getText();
					String expansionMod2 = foundElement.element("exten2").getText();
					String expansionMod3 = foundElement.element("exten3").getText();

					Log.info("["+site.getName()+"] loadProfile  - " + userName + " " + macAddress + " " + hostName + " " + ipAddress + " " + userAgent + " " + expansionMod1 + " " + expansionMod2 + " " + expansionMod3);

					OpenlinkUser traderLyncUser = getOpenlinkProfile(userName);
				}
			}
		} catch (Exception e) {

			Log.error("["+site.getName()+"] loadProfile  - " + e);
		}
	}



	public void unloadProfile(String userName)
	{
		Log.info("["+site.getName()+"] unloadProfile  - " + userName);

	}
}

