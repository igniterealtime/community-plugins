package org.jivesoftware.openfire.plugin.rest.entity;

import java.util.*;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;

/**
 * The Class Agent Queue.User
 */
@XmlRootElement(name = "user")
public class QueueItem {

    private String userID;
    private int queuePosition;
    private int estimatedTime;
    private Date joinDate;

	public QueueItem() {
	}

    /**
     * @param uid the user jid of the customer in the queue
     * @param position the position customer sits in the queue
     * @param time the estimate of how much longer the customer will be in the queue in seconds
     * @param joinedAt the timestamp of when the customer entered the queue
     */
    public QueueItem (String uid, int position, int time, Date joinedAt) {

        this.userID = uid;
        this.queuePosition = position;
        this.estimatedTime = time;
        this.joinDate = joinedAt;
    }

    /**
     * @return the user jid of the customer in the queue
     */
	@XmlElement
    public String getUserID () {
        return this.userID;
    }

    /**
     * @return the position in the queue at which the customer sits, or -1 if the update which
     *          this instance embodies is only a time update instead
     */
	@XmlElement
    public int getQueuePosition () {
        return this.queuePosition;
    }

    /**
     * @return the estimated time remaining of the customer in the queue in seconds, or -1 if
     *          if the update which this instance embodies is only a position update instead
     */
	@XmlElement
    public int getEstimatedTime () {
        return this.estimatedTime;
    }

    /**
     * @return the timestamp of when this customer entered the queue, or null if the server did not
     *          provide this information
     */
	@XmlElement
    public Date getJoinDate () {
        return this.joinDate;
    }

}
