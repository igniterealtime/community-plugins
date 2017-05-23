package org.jivesoftware.openfire.plugin.ofmeet;

import org.jivesoftware.openfire.XMPPServer;
import org.jivesoftware.openfire.group.Group;
import org.jivesoftware.openfire.group.GroupManager;
import org.jivesoftware.openfire.group.GroupNotFoundException;
import org.jivesoftware.openfire.plugin.spark.Bookmark;
import org.jivesoftware.openfire.plugin.spark.BookmarkManager;
import org.jivesoftware.openfire.security.SecurityAuditManager;
import org.jivesoftware.openfire.user.User;
import org.jivesoftware.openfire.user.UserManager;
import org.jivesoftware.util.EmailService;
import org.jivesoftware.util.JiveGlobals;
import org.json.JSONArray;
import org.json.JSONObject;
import org.quartz.*;
import org.quartz.impl.StdSchedulerFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.xmpp.packet.JID;

import java.util.*;
import java.util.regex.Pattern;

import static org.quartz.CronScheduleBuilder.cronSchedule;
import static org.quartz.JobBuilder.newJob;
import static org.quartz.TriggerBuilder.newTrigger;

/**
 * Meeting planner, which periodically evaluates planned meetings.
 *
 * @author Guus der Kinderen, guus.der.kinderen@gmail.com
 */
// TODO it seems odd to have both a Scheduler and a Timer, as their functionality is pretty similar. Can they be combined?
public class MeetingPlanner implements Job
{
    private static final Logger Log = LoggerFactory.getLogger( MeetingPlanner.class );

    public Scheduler scheduler = null;

    private Timer timer = null;

    /**
     * Initialize the planner,
     *
     * @throws Exception On any problem.
     */
    protected synchronized void initialize() throws Exception
    {
        Log.debug( "Initializing Meeting Planner..." );

        if ( timer != null || scheduler != null )
        {
            Log.warn( "Another Meeting planner appears to have been initialized earlier! Unexpected behavior might be the result of this new initialization!" );
        }

        timer = new Timer();
        timer.scheduleAtFixedRate(new TimerTask()
        {
            @Override public void run()
            {
                if (XMPPServer.getInstance().getPluginManager().getPlugin("bookmarks") == null)
                {
                    Log.debug( "Skipping the periodic execution, as the 'bookmarks' plugin is not loaded." );
                }
                processMeetingPlanner();
            }

        }, 0,  900000);

        try {
            scheduler = StdSchedulerFactory.getDefaultScheduler();
            scheduler.start();

        } catch (SchedulerException se) {
            Log.error("Quartz Scheduler", se);
        }
        Log.trace( "Successfully initialized Meeting Planner." );
    }

    /**
     * Destroying the wrapped component. After this call, the wrapped component can be re-initialized.
     *
     * @throws Exception On any problem.
     */
    protected synchronized void destroy() throws Exception
    {
        Log.debug( "Destroying Meeting Planner..." );

        if ( timer == null )
        {
            Log.warn( "Unable to destroy the Meeting Planner, as none appears to be running!" );
        }
        else
        {
            timer.cancel();
            timer = null;
            Log.trace( "Successfully destroyed Meeting Planner." );
        }

        if ( scheduler != null )
        {
            scheduler.shutdown();
            scheduler = null;
        }

        Log.trace( "Destroyed Meeting Planner." );
    }

    public static void processMeetingPlanner()
    {
        Log.debug("OfMeet Plugin - processMeetingPlanner");

        final Collection<Bookmark> bookmarks = BookmarkManager.getBookmarks();

        String hostname = XMPPServer.getInstance().getServerInfo().getHostname();

        for (Bookmark bookmark : bookmarks)
        {
            if (bookmark.getType() == Bookmark.Type.group_chat)
            {
                String url = bookmark.getProperty("url");

                if (url == null)
                {
                    String id = bookmark.getBookmarkID() + "" + System.currentTimeMillis();
                    String rootUrl = JiveGlobals.getProperty("ofmeet.root.url.secure", "https://" + hostname + ":" + JiveGlobals.getProperty("httpbind.port.secure", "7443"));
                    url = rootUrl + "/ofmeet/?b=" + id;
                    bookmark.setProperty("url", url);
                }
            }

            String json = bookmark.getProperty("calendar");

            if (json != null)
            {
                bookmark.setProperty("lock", "true");

                JSONArray calendar = new JSONArray( json );
                boolean done = false;

                for(int i = 0; i < calendar.length(); i++)
                {
                    try {
                        JSONObject meeting = calendar.getJSONObject( i );

                        boolean processed = meeting.getBoolean("processed");
                        long startLong = meeting.getLong("startTime");

                        Date rightNow = new Date(System.currentTimeMillis());
                        Date actionDate = new Date(startLong + 300000);
                        Date warnDate = new Date(startLong - 960000);

                        Log.debug("OfMeet Plugin - scanning meeting now " + rightNow + " action " + actionDate + " warn " + warnDate + "\n" + meeting );

                        if(rightNow.after(warnDate) && rightNow.before(actionDate))
                        {
                            for (String user : bookmark.getUsers())
                            {
                                processMeeting(meeting, user, bookmark.getProperty("url"));
                            }

                            for (String groupName : bookmark.getGroups())
                            {
                                try {
                                    Group group = GroupManager.getInstance().getGroup(groupName);

                                    for (JID memberJID : group.getMembers())
                                    {
                                        processMeeting(meeting, memberJID.getNode(), bookmark.getProperty("url"));
                                    }

                                } catch (GroupNotFoundException e) { }
                            }

                            meeting.put("processed", true);
                            done = true;
                        }
                    } catch (Exception e) {
                        Log.error("processMeetingPlanner", e);
                    }
                }

                if (done)
                {
                    json = calendar.toString();
                    bookmark.setProperty("calendar", json);

                    Log.debug("OfMeet Plugin - processed meeting\n" + json);
                }

                bookmark.setProperty("lock", "false");
            }
        }
    }

    public static void processMeeting(JSONObject meeting, String username, String videourl)
    {
        Log.info("OfMeet Plugin - processMeeting " + username + " " + meeting);

        try {
            UserManager userManager = XMPPServer.getInstance().getUserManager();
            User user = userManager.getUser(username);
            Date start = new Date(meeting.getLong("startTime"));
            Date end = new Date(meeting.getLong("endTime"));
            String name = user.getName();
            String email = user.getEmail();
            String description = meeting.getString("description");
            String title = meeting.getString("title");
            String room = meeting.getString("room");
            //String videourl = "https://" + XMPPServer.getInstance().getServerInfo().getHostname() + ":" + JiveGlobals.getProperty("httpbind.port.secure", "7443") + "/ofmeet/?r=" + room;
            String audiourl = videourl + "&novideo=true";
            String template = JiveGlobals.getProperty("ofmeet.email.template", "Dear [name],\n\nYou have an online meeting from [start] to [end]\n\n[description]\n\nTo join, please click\n[videourl]\nFor audio only with no webcan, please click\n[audiourl]\n\nAdministrator - [domain]");

            HashMap variables = new HashMap<String, String>();

            if (email != null)
            {
                variables.put("name", name);
                variables.put("email", email);
                variables.put("start", start.toString());
                variables.put("end", end.toString());
                variables.put("description", description);
                variables.put("title", title);
                variables.put("room", room);
                variables.put("videourl", videourl);
                variables.put("audiourl", audiourl);
                variables.put("domain", XMPPServer.getInstance().getServerInfo().getXMPPDomain());

                sendEmail(name, email, title, replaceTokens(template, variables), null);
                SecurityAuditManager.getInstance().logEvent(user.getUsername(), "sent email - " + title, description);
            }
        }
        catch (Exception e) {
            Log.error("processMeeting error", e);
        }
    }

    public static void sendEmail(String toName, String toAddress, String subject, String body, String htmlBody)
    {
        try {
            String fromAddress = "no_reply@" + JiveGlobals.getProperty("ofmeet.email.domain", XMPPServer.getInstance().getServerInfo().getXMPPDomain());
            String fromName = JiveGlobals.getProperty("ofmeet.email.fromname", "Openfire Meetings");

            Log.debug( "sendEmail " + toAddress + " " + subject + "\n " + body + "\n " + htmlBody);
            EmailService.getInstance().sendMessage(toName, toAddress, fromName, fromAddress, subject, body, htmlBody);
        }
        catch (Exception e) {
            Log.error(e.toString());
        }

    }

    public static String replaceTokens(String text, Map<String, String> replacements)
    {
        Pattern pattern = Pattern.compile("\\[(.+?)\\]");
        java.util.regex.Matcher matcher = pattern.matcher(text);
        StringBuffer buffer = new StringBuffer();

        while (matcher.find())
        {
            String replacement = replacements.get(matcher.group(1));

            if (replacement != null)
            {
                matcher.appendReplacement(buffer, "");
                buffer.append(replacement);
            }
        }
        matcher.appendTail(buffer);
        return buffer.toString();
    }

    @Override public void execute(JobExecutionContext jobExecutionContext) throws JobExecutionException
    {
        Log.info( "Quartz Execute Job....");
        try {

        }
        catch (Throwable e) {
            Log.error("Failed to execute quartz job...", e);
        }
    }

    public void scheduleMeeting(String job, String group, String trigger, String schedule)
    {
        Log.info( "scheduleMeeting " + job + " " + group + " " + trigger + " " + schedule);
        //String schedule = JiveGlobals.getProperty("ofmeet.schedule", "0 0 0/12 * * ?");

        if (scheduler != null)
        {
            try {
                JobDetail jobDetail = newJob(this.getClass()).withIdentity(job, group).build();
                CronTrigger conTrigger = newTrigger().withIdentity(trigger, group).withSchedule(cronSchedule(schedule)).build();
                scheduler.scheduleJob(jobDetail, conTrigger);
            }
            catch (Throwable e) {
                Log.error("Failed to execute quartz job...", e);
            }
        }
    }

    public void unScheduleMeeting(String job, String group)
    {
        Log.info( "unScheduleMeeting " + job + " " + group);

        if (scheduler != null)
        {
            try {
                scheduler.deleteJob(JobKey.jobKey(job, group));			}
            catch (Throwable e) {
                Log.error("Failed to execute quartz job...", e);
            }
        }
    }
}
