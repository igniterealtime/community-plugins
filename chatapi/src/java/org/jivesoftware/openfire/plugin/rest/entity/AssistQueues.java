package org.jivesoftware.openfire.plugin.rest.entity;

import java.util.List;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;

@XmlRootElement(name = "queues")
public class AssistQueues {
	List<AssistQueue> queues;

	public AssistQueues() {
	}

	public AssistQueues(List<AssistQueue> queues) {
		this.queues = queues;
	}

	@XmlElement(name = "queue")
	public List<AssistQueue> getQueues() {
		return queues;
	}

	public void setQueues(List<AssistQueue> queues) {
		this.queues = queues;
	}
}
