package org.ifsoft.lync.ucwa;

import java.util.List;

public class UserPresenceChangedEvent
{

    public UserPresenceChangedEvent(List usersPresence)
    {
        this.usersPresence = usersPresence;
    }

    public List getUsersPresence()
    {
        return usersPresence;
    }

    private List usersPresence;
}
