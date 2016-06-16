/**
 * $Revision $
 * $Date $
 *
 * Copyright (C) 2005-2010 Jive Software. All rights reserved.
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

package org.jivesoftware.community.http.impl;

import org.jivesoftware.util.JiveGlobals;
import org.jivesoftware.community.http.BasicAuthCredentials;
import org.jivesoftware.community.http.HttpClientManager;
import org.jivesoftware.community.util.ssl.DummySSLSocketFactory;
import com.sun.syndication.fetcher.impl.HttpClientFeedFetcher;
import java.net.URL;
import org.apache.commons.httpclient.*;
import org.apache.commons.httpclient.auth.AuthScope;
import org.apache.commons.httpclient.params.HttpClientParams;
import org.apache.commons.httpclient.params.HttpConnectionManagerParams;
import org.apache.commons.httpclient.protocol.Protocol;

public class HttpClientManagerImpl implements HttpClientManager
{
    public HttpClient getClient(URL url)
    {
        return getClient(url, null, -1);
    }

    public HttpClient getClient(URL url, com.sun.syndication.fetcher.impl.HttpClientFeedFetcher.CredentialSupplier credentialSupplier, int timeout)
    {
        HttpClient client = new HttpClient();
        HttpConnectionManager conManager = client.getHttpConnectionManager();

        if(JiveGlobals.getProperty("http.proxyHost") != null && JiveGlobals.getProperty("http.proxyPort") != null)
        {
            client.getHostConfiguration().setProxy(JiveGlobals.getProperty("http.proxyHost"), Integer.parseInt(JiveGlobals.getProperty("http.proxyPort")));
            if(JiveGlobals.getProperty("http.proxyUsername") != null && JiveGlobals.getProperty("http.proxyPassword") != null)
            {
                HttpState state = new HttpState();
                state.setProxyCredentials(AuthScope.ANY, new UsernamePasswordCredentials(JiveGlobals.getProperty("http.proxyUserName"), JiveGlobals.getProperty("http.proxyPassword")));
                client.setState(state);
            }
        }
        if(timeout > 0)
        {
            conManager.getParams().setParameter("http.connection.timeout", Integer.valueOf(timeout));
            conManager.getParams().setParameter("http.socket.timeout", Integer.valueOf(timeout));
        }
        if(isHTTPS(url))
        {
            int port = url.getPort() <= -1 ? 443 : url.getPort();
            Protocol myhttps = new Protocol("https", new DummySSLSocketFactory(), port);
            Protocol.registerProtocol("https", myhttps);
            client.getHostConfiguration().setHost(url.getHost(), port, myhttps);
        } else
        {
            int port = url.getPort() <= -1 ? 80 : url.getPort();
            client.getHostConfiguration().setHost(url.getHost(), port);
        }
        if(url.getUserInfo() != null && credentialSupplier == null)
            credentialSupplier = new BasicAuthCredentials(url.getUserInfo());

        if(credentialSupplier != null)
        {
            client.getParams().setAuthenticationPreemptive(true);
            client.getState().setCredentials(new AuthScope(url.getHost(), -1, AuthScope.ANY_REALM), credentialSupplier.getCredentials(null, url.getHost()));
        }
        return client;
    }

    private boolean isHTTPS(URL feedUrl)
    {
        return feedUrl.getProtocol().equalsIgnoreCase("HTTPS");
    }
}
