package org.ifsoft.websockets;

import org.jivesoftware.util.JiveGlobals;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.*;
import java.security.*;
import java.util.*;
import java.text.*;
import java.net.*;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.eclipse.jetty.websocket.servlet.WebSocketServlet;
import org.eclipse.jetty.websocket.servlet.WebSocketServletFactory;
import org.eclipse.jetty.websocket.servlet.ServletUpgradeRequest;
import org.eclipse.jetty.websocket.servlet.ServletUpgradeResponse;
import org.eclipse.jetty.websocket.servlet.WebSocketCreator;
import org.eclipse.jetty.websocket.api.annotations.*;
import org.eclipse.jetty.websocket.api.Session;
import org.eclipse.jetty.websocket.api.RemoteEndpoint;

import org.jivesoftware.util.ParamUtils;


public final class XMPPServlet extends WebSocketServlet
{
    private static Logger Log = LoggerFactory.getLogger( "XMPPServlet" );

    public XMPPServlet()
    {

    }

	@Override public void configure(WebSocketServletFactory factory)
	{
		factory.getPolicy().setMaxTextMessageSize(64000000);
		factory.setCreator(new WSocketCreator());
	}

	public class WSocketCreator implements WebSocketCreator
	{
		@Override public Object createWebSocket(ServletUpgradeRequest req, ServletUpgradeResponse resp)
		{
			Log.info("WSocketCreator ");

			for (String subprotocol : req.getSubProtocols())
			{
				Log.info("WSocketCreator found protocol " + subprotocol);

				if ("sip".equals(subprotocol))
				{
					return getSIPSocket(subprotocol, req, resp);
				}
			}
			return getSIPSocket("sip", req, resp);
		}


		private SIPWebSocket getSIPSocket(String subprotocol, ServletUpgradeRequest req, ServletUpgradeResponse resp)
		{
			try {
				Log.info("WSocketCreator accepted protocol " + subprotocol);

				HttpServletRequest request = req.getHttpServletRequest();
				String url = URLDecoder.decode( ParamUtils.getParameter(request, "url"), "UTF-8");

				SIPWebSocket socket = null;
				HashMap<String,String> httpHeaders = new HashMap<String,String>();
				httpHeaders.put("Sec-WebSocket-Protocol", "sip");
				SipConnection sipConnection = new SipConnection(URI.create(url), httpHeaders, 10000);

				if (sipConnection != null)
				{
					socket = new SIPWebSocket();
					socket.setSipConnection(sipConnection);
					resp.setAcceptedSubProtocol(subprotocol);
				}
				return socket;

			} catch (Exception e) {
				return null;
			}
		}
	}


	@WebSocket public class SIPWebSocket {

		private Session wsSession;
		private SipConnection sipConnection;

		public void setSipConnection(SipConnection sipConnection) {
			this.sipConnection = sipConnection;

			sipConnection.setSocket(this);
			Log.info("setSipConnection");
		}

		public boolean isOpen() {
			return wsSession.isOpen();
		}

		@OnWebSocketConnect public void onConnect(Session wsSession)
		{
			this.wsSession = wsSession;
			//sipConnection.setSecure(wsSession.isSecure());
			Log.info("onConnect");
		}

		@OnWebSocketClose public void onClose(int statusCode, String reason)
		{
			try {
				sipConnection.disconnect();

			} catch ( Exception e ) {
				Log.error( "An error occurred while attempting to remove the socket", e );
			}

			Log.info(" : onClose : " + statusCode + " " + reason);
		}

		@OnWebSocketError public void onError(Throwable error)
		{
			Log.error("SIPWebSocket onError", error);
		}

		@OnWebSocketMessage public void onTextMethod(String data)
		{
			if ( !"".equals( data.trim()))
			{
				try {
					Log.info(" : onMessage : Received : \n" + data );
					sipConnection.deliver(data);

				} catch ( Exception e ) {
					Log.error( "An error occurred while attempting to route the packet : ", e );
				}
			}
		}

		@OnWebSocketMessage public void onBinaryMethod(byte data[], int offset, int length)
		{
		 // simple BINARY message received
		}

		public void deliver(String message)
        {
            if (wsSession != null && wsSession.isOpen() && !"".equals( message.trim() ) )
            {
                try {
                	Log.info(" : Delivered : \n" + message );
                	wsSession.getRemote().sendStringByFuture(message);
                } catch (Exception e) {
                    Log.error("SIPWebSocket deliver " + e);
					Log.warn("Could not deliver : \n" + message );
                }
            }
        }

		public void disconnect()
        {
            Log.info("disconnect : SIPWebSocket disconnect");

            try {
            	if (wsSession != null && wsSession.isOpen())
	            {
	                wsSession.close();
	            }
            } catch ( Exception e ) {

            	try {
            		wsSession.disconnect();
            	} catch ( Exception e1 ) {

				}
            }
        }
	}
}
