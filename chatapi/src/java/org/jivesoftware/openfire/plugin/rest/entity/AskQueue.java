package org.jivesoftware.openfire.plugin.rest.entity;

import java.util.*;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;

/**
 * The Class Agent Queue.
 */
@XmlRootElement(name = "queue")
public class AskQueue {

    private String workgroupJID;
    private boolean inQueue;
    private boolean available;
    private int queuePosition = -1;
    private int queueRemainingTime = -1;

	/**
	 * Instantiates a new agent queue  entity.
	 */
	public AskQueue() {
	}

    public AskQueue (String workgroupJID, boolean inQueue, boolean available, int queuePosition, int queueRemainingTime)
    {
        this.workgroupJID = workgroupJID;
        this.inQueue = inQueue;
        this.available = available;
        this.queuePosition = queuePosition;
        this.queueRemainingTime = queueRemainingTime;
    }

    /**
     * Returns the name of this workgroup (eg support@example.com).
     *
     * @return the name of the workgroup.
     */
	@XmlElement
    public String getWorkgroupJID() {
        return workgroupJID;
    }

    /**
     * Returns true if the user is currently waiting in the workgroup queue.
     *
     * @return true if currently waiting in the queue.
     */
	@XmlElement
    public boolean isInQueue() {
        return inQueue;
    }

    /**
     * Returns true if the workgroup is available for receiving new requests. The workgroup will be
     * available only when agents are available for this workgroup.
     *
     * @return true if the workgroup is available for receiving new requests.
     */
	@XmlElement
    public boolean isAvailable() {
		return available;
	}

    /**
     * Returns the users current position in the workgroup queue. A value of 0 means
     * the user is next in line to be routed; therefore, if the queue position
     * is being displayed to the end user it is usually a good idea to add 1 to
     * the value this method returns before display. If the user is not currently
     * waiting in the workgroup, or no queue position information is available, -1
     * will be returned.
     *
     * @return the user's current position in the workgroup queue, or -1 if the
     *         position isn't available or if the user isn't in the queue.
     */
	@XmlElement
    public int getQueuePosition() {
        return queuePosition;
    }

    /**
     * Returns the estimated time (in seconds) that the user has to left wait in
     * the workgroup queue before being routed. If the user is not currently waiting
     * int he workgroup, or no queue time information is available, -1 will be
     * returned.
     *
     * @return the estimated time remaining (in seconds) that the user has to
     *         wait inthe workgroupu queue, or -1 if time information isn't available
     *         or if the user isn't int the queue.
     */
	@XmlElement
    public int getQueueRemainingTime() {
        return queueRemainingTime;
    }
}
