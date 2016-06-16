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

package org.jivesoftware.community.util.ssl;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.net.*;
import java.security.*;
import java.security.cert.*;
import javax.net.SocketFactory;
import javax.net.ssl.*;

import org.apache.commons.httpclient.ConnectTimeoutException;
import org.apache.commons.httpclient.params.HttpConnectionParams;
import org.apache.commons.httpclient.protocol.SecureProtocolSocketFactory;

public class DummySSLSocketFactory extends SSLSocketFactory  implements SecureProtocolSocketFactory
{
    private static final Logger Log = LoggerFactory.getLogger(DummySSLSocketFactory.class);
    private SSLSocketFactory factory;

    private static class DummyTrustManager
        implements X509TrustManager
    {

        public boolean isClientTrusted(X509Certificate cert[])
        {
            return true;
        }

        public boolean isServerTrusted(X509Certificate cert[])
        {
            try
            {
                return true;
            }

            catch(Exception e)
            {
                return false;
            }
        }

        public void checkClientTrusted(X509Certificate ax509certificate[], String s1)
            throws CertificateException
        {
        }

        public void checkServerTrusted(X509Certificate ax509certificate[], String s1)
            throws CertificateException
        {
        }

        public X509Certificate[] getAcceptedIssuers()
        {
            return new X509Certificate[0];
        }

        private DummyTrustManager()
        {
        }

    }


    public DummySSLSocketFactory()
    {
        try
        {
            SSLContext sslcontent = SSLContext.getInstance("SSL");
            sslcontent.init(null, new TrustManager[] {
                new DummyTrustManager()
            }, new SecureRandom());
            factory = sslcontent.getSocketFactory();
        }
        catch(NoSuchAlgorithmException e)
        {
            Log.error(e.toString());
        }
        catch(KeyManagementException e)
        {
            Log.error(e.toString());
        }
    }

    public static SocketFactory getDefault()
    {
        return new DummySSLSocketFactory();
    }

    public Socket createSocket(Socket socket, String s, int i, boolean flag)
        throws IOException
    {
        return factory.createSocket(socket, s, i, flag);
    }

    public Socket createSocket(InetAddress inaddr, int i, InetAddress inaddr2, int j)
        throws IOException
    {
        return factory.createSocket(inaddr, i, inaddr2, j);
    }

    public Socket createSocket(InetAddress inaddr, int i)
        throws IOException
    {
        return factory.createSocket(inaddr, i);
    }

    public Socket createSocket(String s, int i, InetAddress inaddr, int j)
        throws IOException
    {
        return factory.createSocket(s, i, inaddr, j);
    }

    public Socket createSocket(String s, int i, InetAddress inaddr, int j, HttpConnectionParams httpConnectionParams)
        throws IOException, UnknownHostException, ConnectTimeoutException
    {
        return factory.createSocket(s, i, inaddr, j);
    }

    public Socket createSocket(String s, int i)
        throws IOException
    {
        return factory.createSocket(s, i);
    }

    public Socket createSocket()
        throws IOException
    {
        return factory.createSocket();
    }

    public String[] getDefaultCipherSuites()
    {
        return factory.getSupportedCipherSuites();
    }

    public String[] getSupportedCipherSuites()
    {
        return factory.getSupportedCipherSuites();
    }

}
