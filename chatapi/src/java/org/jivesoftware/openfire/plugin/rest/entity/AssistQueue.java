package org.jivesoftware.openfire.plugin.rest.entity;

import java.util.*;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlElementWrapper;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;

/**
 * The Class Agent Queue.
 */
@XmlRootElement(name = "queue")
public class AssistQueue {

    private String name;
    private String status;

    private int averageWaitTime = -1;
    private Date oldestEntry = null;
    private List<QueueItem> users = new ArrayList<QueueItem>();

    private int maxChats = 0;
    private int currentChats = 0;

	/**
	 * Instantiates a new agent queue  entity.
	 */
	public AssistQueue() {
	}

	public AssistQueue(String name, String status, int averageWaitTime, Date oldestEntry, int maxChats, int currentChats) {
		this.name = name;
		this.status = status;
		this.averageWaitTime = averageWaitTime;
		this.oldestEntry = oldestEntry;
		this.maxChats = maxChats;
		this.currentChats = currentChats;
		this.users = new ArrayList<QueueItem>();
	}


	@XmlElement
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    /**
     * Returns the status of the queue.
     *
     * @return the status of the queue.
     */
	@XmlElement
    public String getStatus() {
        return status;
    }

    void setStatus(String status) {
        this.status = status;
    }

    /**
     * Returns the average amount of time users wait in the queue before being
     * routed to an agent. If average wait time info isn't available, -1 will
     * be returned.
     *
     * @return the average wait time
     */
	@XmlElement
    public int getAverageWaitTime() {
        return averageWaitTime;
    }

    void setAverageWaitTime(int averageTime) {
        this.averageWaitTime = averageTime;
    }

    /**
     * Returns the date of the oldest request waiting in the queue. If there
     * are no requests waiting to be routed, this method will return <tt>null</tt>.
     *
     * @return the date of the oldest request in the queue.
     */
	@XmlElement
    public Date getOldestEntry() {
        return oldestEntry;
    }

    void setOldestEntry(Date oldestEntry) {
        this.oldestEntry = oldestEntry;
    }

	@XmlElement(name = "user")
	@XmlElementWrapper(name = "users")
	public List<QueueItem> getUsers() {
		return users;
	}

	public void setUsers(List<QueueItem> users) {
		this.users = users;
	}
    /**
     * Returns the maximum number of simultaneous chats the queue can handle.
     *
     * @return the max number of chats the queue can handle.
     */
	@XmlElement
    public int getMaxChats() {
        return maxChats;
    }

    void setMaxChats(int maxChats) {
        this.maxChats = maxChats;
    }

    /**
     * Returns the current number of active chat sessions in the queue.
     *
     * @return the current number of active chat sessions in the queue.
     */
	@XmlElement
    public int getCurrentChats() {
        return currentChats;
    }

    void setCurrentChats(int currentChats) {
        this.currentChats = currentChats;
    }


}
