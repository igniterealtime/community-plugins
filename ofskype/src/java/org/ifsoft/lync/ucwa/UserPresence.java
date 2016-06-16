package org.ifsoft.lync.ucwa;

import java.io.Serializable;
import java.util.Date;

public class UserPresence implements Serializable
{
    private String userId;
    private Integer status;
    private String show;
    private String statusMessage;
    private Date subscriptionDate;
    private Date lastCheckedDate;


    public UserPresence(String userId)
    {
        status = null;
        show = null;
        statusMessage = null;
        subscriptionDate = new Date();
        lastCheckedDate = new Date();
        this.userId = userId;
    }

    public String getUserId()
    {
        return userId;
    }

    public Integer getStatus()
    {
        return status;
    }

    public void setStatus(int status)
    {
        this.status = Integer.valueOf(status);
    }

    public String getStatusMessage()
    {
        return statusMessage;
    }

    public void setStatusMessage(String statusMessage)
    {
        this.statusMessage = statusMessage;
    }

    public String getShow()
    {
        return show;
    }

    public void setShow(String show)
    {
        this.show = show;
    }

    public Date getSubscriptionDate()
    {
        return subscriptionDate;
    }

    public void setSubscriptionDate(Date date)
    {
        subscriptionDate = date;
    }

    public Date getLastCheckedDate()
    {
        return lastCheckedDate;
    }

    public void setLastCheckedDate(Date lastCheckedDate)
    {
        this.lastCheckedDate = lastCheckedDate;
    }

    public String toString()
    {
        return (new StringBuilder("User Presence [userId='")).append(userId).append('\'').append(", status=").append(status).append(", statusMessage='").append(statusMessage).append('\'').append(", subscriptionDate=").append(subscriptionDate).append(", lastCheckedDate=").append(lastCheckedDate).append(']').toString();
    }
}
