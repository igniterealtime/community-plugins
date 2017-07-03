package org.jivesoftware.openfire.plugin.rest.entity;

import java.util.Collection;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;

@XmlRootElement(name = "workgroups")
public class WorkgroupEntities {
	Collection<String> workgroups;

	public WorkgroupEntities() {
	}

	public WorkgroupEntities(Collection<String> workgroups) {
		this.workgroups = workgroups;
	}

	@XmlElement(name = "workgroup")
	public Collection<String> getWorkgroups() {
		return workgroups;
	}

	public void setWorkgroups(Collection<String> workgroups) {
		this.workgroups = workgroups;
	}
}
