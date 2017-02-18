#Chat API (Rest API + SSE)
Representational state transfer (REST) has now become the standard for abstracting request/response type web services into an API. When it is combined with Server Sent Events (otherwise known as Event Source), the result is a fresh new way of proving two-way real-time communication between web clients and a server using synchronous requests/responses (IQ) with REST and asynchronous evening (Message, Presence) with SSE.

The Rest API plugin by Redor is very cool . It allows you to administer Openfire via a RESTful API. Most of the common functions we do from the Openfire admin console web application can now be automated and integrated into server-side Java plugins or client-side web applications with ease. After spending hours inside the code and extending it for use at work to manage all the telephony entities we use with our Openlink XEP​ from the various commercial plugins we develop, it became clear that REST+SSE is the way forward for web-based real time messaging. Don't take my work for it. Read what the folks at erlang-solutions.com have to say about it.

I have built a Chat API plugin by extending the REST API plugin with SSE and Jetty web authentication taken from the Openfire meetings plugin.

In summary, the plugin now runs on the HTTP-BIND (7070/7443) port instead of the admin (9090/9091) port. It authenticates you as an Openfire user once and reuses the authentication for REST,  SSE and XMPP bosh/websockets. It supports everything you can do with the REST API plus Bookmarks and SIP Accounts as an admin user. It then enables you as a normal user to handle presence, chat, groupchat, contacts and users with just a handful of REST requests and SSE events.

#broadcast own presence
POST /chat/presence<br/>
#seach for domain users
GET /chat/users<br/>
#retrieve,add,remove contacts
GET /chat/contacts<br/>
POST /chat/contacts/{contactJID}<br/>
DELETE /chat/contacts/{contactJID}<br/>
#retrieve old messages and post new message
GET /chat/messages<br/>
POST /chat/messages/user@domain<br/>
#retrieve, join, post messages, invite and leave muc rooms
GET /chat/rooms<br/>
PUT /chat/rooms/{roomName}<br/>
POST /chat/rooms/{roomName}<br/>
POST /chat/rooms/{roomName}/{contactJID}<br/>
DELETE /chat/rooms/{roomName<br/>
#create/update own user profile properties
POST /chat/users/{propertyName}<br/>
#delete own user profile properties
DELETE /chat/users/{propertyName}<br/>
#send a raw XMPP message to openfire
POST /chat/xmpp<br/>
