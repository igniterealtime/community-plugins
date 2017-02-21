/**
 * $RCSfile$
 * $Revision: $
 * $Date: $
 *
 * Copyright (C) 2005-2008 Jive Software. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.ifsoft.websockets;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.net.ssl.*;

import java.util.concurrent.*;

import java.io.*;
import java.net.*;
import java.security.*;
import java.security.cert.X509Certificate;
import java.util.*;
import javax.net.*;
import javax.net.ssl.*;
import javax.security.auth.callback.*;

import org.eclipse.jetty.util.ssl.SslContextFactory;
import org.eclipse.jetty.websocket.client.ClientUpgradeRequest;
import org.eclipse.jetty.websocket.client.WebSocketClient;
import org.eclipse.jetty.websocket.api.Session;
import org.eclipse.jetty.websocket.api.StatusCode;
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketClose;
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketConnect;
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketMessage;
import org.eclipse.jetty.websocket.api.annotations.WebSocket;

public class SipConnection
{
	private static Logger Log = LoggerFactory.getLogger( "SipConnection" );
	private boolean isSecure = false;
	private XMPPServlet.SIPWebSocket socket;
	private boolean connected = false;
	private WebSocketClient client = null;
	private SIPSocket sipSocket = null;
	private String subprotocol = "sip";

	public SipConnection(URI uri, String subprotocol, int connectTimeout)
	{
		Log.info("SipConnection " + uri + " " + subprotocol);

		this.subprotocol = subprotocol;

		SslContextFactory sec = new SslContextFactory();

		if("wss".equals(uri.getScheme()))
		{
			sec.setValidateCerts(false);

			Log.info("SipConnection - SSL");
			getSSLContext();
			isSecure = true;
		}

		client = new WebSocketClient(sec);
		sipSocket = new SIPSocket(this);

        try
        {
            client.start();
            ClientUpgradeRequest request = new ClientUpgradeRequest();

            if ("sip".equals(subprotocol))
            {
				request.setSubProtocols(subprotocol);
			}

            client.connect(sipSocket, uri, request);

            Log.info("Connecting to : " + uri);
        }
        catch (Exception e)
        {
            Log.error("SipConnection", e);
        }
        finally
        {
            try
            {
                //client.stop();
            }
            catch (Exception e1)
            {
                Log.error("SipConnection", e1);
            }
        }

		connected = true;
	}

	public void setSocket( XMPPServlet.SIPWebSocket socket ) {
		this.socket = socket;
	}

	public void deliver(String text)
	{
		Log.info("SipConnection - deliver " + text);

		String sendText = text;

		if (sipSocket != null)
		{
			if ("sip".equals(subprotocol)) sendText = text.replaceAll("SIP/2.0/WSS", "SIP/2.0/WS");

			sipSocket.deliver(sendText);
		}
	}

	public void disconnect()
	{
		Log.info("SipConnection - disconnect");
		if (sipSocket != null) sipSocket.disconnect();
	}

	public void onClose(int code, String reason)
	{
		Log.info("SipConnection - onClose " + reason + " " + code);
		connected = false;

		if (this.socket != null) this.socket.disconnect();
	}

	public void onMessage(String text) {
		Log.info("SipConnection - onMessage " + text);

		try {
			this.socket.deliver(text);
		}

		catch (Exception e) {
			Log.error("deliverRawText error", e);
		}
	}

	public boolean isSecure() {
		return isSecure;
	}

	public boolean isConnected() {
		return connected;
	}

	public void setSecure(boolean isSecure) {
		this.isSecure = isSecure;
	}

	private SSLContext getSSLContext()
	{
		SSLContext sc = null;

		try {
			Log.info("SipConnection SSL truster");

			TrustManager[] trustAllCerts = new TrustManager[]
			{
			   new X509TrustManager() {
				  public java.security.cert.X509Certificate[] getAcceptedIssuers() {
					return null;
				  }

				  public void checkClientTrusted(X509Certificate[] certs, String authType) {  }

				  public void checkServerTrusted(X509Certificate[] certs, String authType) {  }

			   }
			};

			sc = SSLContext.getInstance("SSL");
			sc.init(null, trustAllCerts, new java.security.SecureRandom());
			HttpsURLConnection.setDefaultSSLSocketFactory(sc.getSocketFactory());

			// Create all-trusting host name verifier
			HostnameVerifier allHostsValid = new HostnameVerifier()
			{
				public boolean verify(String hostname, SSLSession session) {
				  return true;
				}
			};
			// Install the all-trusting host verifier
			HttpsURLConnection.setDefaultHostnameVerifier(allHostsValid);

		} catch (Exception e) 	{
			Log.error("WireLynkComponent - getSSLContext SSL truster", e);
		}

		return sc;
	}

	@WebSocket(maxTextMessageSize = 64 * 1024) public class SIPSocket
	{
		private Session session;
		private SipConnection sipConnection;
		private String lastMessage = null;

		public SIPSocket(SipConnection sipConnection)
		{
			this.sipConnection = sipConnection;
		}

		@OnWebSocketClose public void onClose(int statusCode, String reason)
		{
			Log.info("SIPSocket onClose " + statusCode + " " + reason);
			this.session = null;
			if (sipConnection != null) sipConnection.onClose(statusCode, reason);
		}

		@OnWebSocketConnect public void onConnect(Session session)
		{
			Log.info("SIPSocket onConnect: " + session);
			this.session = session;

			if (lastMessage != null) deliver(lastMessage);
		}

		@OnWebSocketMessage public void onMessage(String msg)
		{
			Log.info("SIPSocket onMessage \n" + msg);
			if (sipConnection != null) sipConnection.onMessage(msg);
		}

		public void deliver(String text)
		{
			if (session != null)
			{
				try {
					Log.info("SIPSocket deliver: \n" + text);
					session.getRemote().sendStringByFuture(text);
					lastMessage = null;
				} catch (Exception e) {
					Log.error("SIPSocket deliver", e);
				}
			} else lastMessage = text;
		}

		public void disconnect()
		{
			if (session != null) session.close(StatusCode.NORMAL,"I'm done");
		}
	}
}
