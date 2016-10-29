// Copyright (c) 2014 The Chromium Embedded Framework Authors. All rights
// reserved. Use of this source code is governed by a BSD-style license that
// can be found in the LICENSE file.

package org.jivesoftware.spark.plugin.ofmeet;

import java.awt.BorderLayout;
import java.awt.Component;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.awt.event.WindowAdapter;
import java.awt.event.WindowEvent;

import javax.swing.JFrame;
import javax.swing.JTextField;
import javax.swing.SwingUtilities;

import org.cef.CefApp;
import org.cef.CefApp.CefAppState;
import org.cef.CefClient;
import org.cef.CefSettings;
import org.cef.OS;
import org.cef.browser.CefBrowser;
import org.cef.handler.CefAppHandlerAdapter;
import org.cef.handler.CefFocusHandlerAdapter;
import org.cef.callback.CefCommandLine;

import org.jitsi.util.OSUtils;

import java.io.*;;
import java.util.*;
import java.util.jar.*;
import java.lang.reflect.*;

import org.slf4j.*;
import org.slf4j.Logger;

import org.jivesoftware.Spark;

/**
 * This is a simple example application using JCEF.
 * It displays a JFrame with a JTextField at its top and a CefBrowser in its
 * center. The JTextField is used to enter and assign an URL to the browser UI.
 * No additional handlers or callbacks are used in this example.
 *
 * The number of used JCEF classes is reduced (nearly) to its minimum and should
 * assist you to get familiar with JCEF.
 *
 * For a more feature complete example have also a look onto the example code
 * within the package "example.detailed".
 */
public class SimpleFrameExample extends JFrame {
	private static final long serialVersionUID = -5570653778104813836L;
	private static final Logger Log = LoggerFactory.getLogger(SimpleFrameExample.class);

	private static boolean firstTime = true;

	private final CefApp     cefApp_;
	private final CefClient  client_;
	private final CefBrowser browser_;
	private final Component  browerUI_;

	/**
	 * To display a simple browser window, it suffices completely to create an
	 * instance of the class CefBrowser and to assign its UI component to your
	 * application (e.g. to your content pane).
	 * But to be more verbose, this CTOR keeps an instance of each object on the
	 * way to the browser UI.
	 */
	public SimpleFrameExample(String startURL, boolean useOSR, boolean isTransparent) {

		// (1) The entry point to JCEF is always the class CefApp. There is only one
		//     instance per application and therefore you have to call the method
		//     "getInstance()" instead of a CTOR.
		//
		//     CefApp is responsible for the global CEF context. It loads all
		//     required native libraries, initializes CEF accordingly, starts a
		//     background task to handle CEF's message loop and takes care of
		//     shutting down CEF after disposing it.

		CefApp.addAppHandler(new CefAppHandlerAdapter(null) {
			@Override
			public void stateHasChanged(org.cef.CefApp.CefAppState state) {
				// Shutdown the app if the native CEF part is terminated
				if (state == CefAppState.TERMINATED){
					// calling System.exit(0) appears to be causing assert errors,
					// as its firing before all of the CEF objects shutdown.
					//System.exit(0);
				}
			}

			@Override public void onBeforeCommandLineProcessing(String process_type, CefCommandLine command_line)
			{
				super.onBeforeCommandLineProcessing(process_type, command_line);

				if (process_type.isEmpty()) {
					command_line.appendSwitchWithValue("enable-media-stream","true");
				}
			}
		});


		CefSettings settings = new CefSettings();
		settings.windowless_rendering_enabled = useOSR;
		cefApp_ = CefApp.getInstance(settings);

		// (2) JCEF can handle one to many browser instances simultaneous. These
		//     browser instances are logically grouped together by an instance of
		//     the class CefClient. In your application you can create one to many
		//     instances of CefClient with one to many CefBrowser instances per
		//     client. To get an instance of CefClient you have to use the method
		//     "createClient()" of your CefApp instance. Calling an CTOR of
		//     CefClient is not supported.
		//
		//     CefClient is a connector to all possible events which come from the
		//     CefBrowser instances. Those events could be simple things like the
		//     change of the browser title or more complex ones like context menu
		//     events. By assigning handlers to CefClient you can control the
		//     behavior of the browser. See example.detailed.SimpleFrameExample for an example
		//     of how to use these handlers.
		client_ = cefApp_.createClient();

		client_.addFocusHandler(new CefFocusHandlerAdapter()
		{
			  @Override  public void onTakeFocus(CefBrowser browser, boolean next)
			  {
				return;
			  }

			  @Override public boolean onSetFocus(CefBrowser browser, FocusSource source)
			  {
				return false;
			  }

			  @Override public void onGotFocus(CefBrowser browser)
			  {
			  }
		});

		// (3) One CefBrowser instance is responsible to control what you'll see on
		//     the UI component of the instance. It can be displayed off-screen
		//     rendered or windowed rendered. To get an instance of CefBrowser you
		//     have to call the method "createBrowser()" of your CefClient
		//     instances.
		//
		//     CefBrowser has methods like "goBack()", "goForward()", "loadURL()",
		//     and many more which are used to control the behavior of the displayed
		//     content. The UI is held within a UI-Compontent which can be accessed
		//     by calling the method "getUIComponent()" on the instance of CefBrowser.
		//     The UI component is inherited from a java.awt.Component and therefore
		//     it can be embedded into any AWT UI.
		browser_ = client_.createBrowser(startURL, useOSR, isTransparent);
		browerUI_ = browser_.getUIComponent();

		// (5) All UI components are assigned to the default content pane of this
		//     JFrame and afterwards the frame is made visible to the user.

		getContentPane().add(browerUI_, BorderLayout.CENTER);
		pack();
		setSize(800,600);
		setVisible(true);

		// (6) To take care of shutting down CEF accordingly, it's important to call
		//     the method "dispose()" of the CefApp instance if the Java
		//     application will be closed. Otherwise you'll get asserts from CEF.
		addWindowListener(new WindowAdapter() {
			@Override
			public void windowClosing(WindowEvent e)
			{

			}
		});
	}

	public void setUrl(String url)
	{
		browser_.loadURL(url);
		setVisible(true);
	}

	public void closeBrowser()
	{
		Log.info("closeBrowser requested");

		setVisible(true);
		browser_.close();
		CefApp.getInstance().dispose();
		dispose();
	}

    public static void checkNatives()
    {
        // Find the root path of the class that will be our plugin lib folder.
        try
        {
			String nativeLibsJarPath = Spark.getSparkUserHome() + File.separator + "plugins" + File.separator + "sparkmeet" + File.separator + "lib";
            File nativeLibFolder = new File(nativeLibsJarPath, "native");
 			File cefPakFile = new File(nativeLibsJarPath + File.separator + "native", "cef.pak");

            if(!cefPakFile.exists())
            {
                // lets find the appropriate jar file to extract and
                // extract it

                String jarFileSuffix = null;

                if(OSUtils.IS_LINUX32)
                {
                    jarFileSuffix = "jecl-natives-linux-i586.jar";
                }
                else if(OSUtils.IS_LINUX64)
                {
                    jarFileSuffix = "jecl-natives-linux-amd64.jar";
                }
                else if(OSUtils.IS_WINDOWS32)
                {
                    jarFileSuffix = "jecf-natives-windows-i586.jar";
                }
                else if(OSUtils.IS_WINDOWS64)
                {
                    jarFileSuffix = "jecl-natives-windows-amd64.jar";
                }
                else if(OSUtils.IS_MAC)
                {
                    jarFileSuffix = "jecl-natives-macosx.jar";
                }

                JarFile jar = new JarFile(nativeLibsJarPath + File.separator + jarFileSuffix);
                Enumeration en = jar.entries();

                while (en.hasMoreElements())
                {
                    try
                    {
                        JarEntry file = (JarEntry) en.nextElement();
                        File f = new File(nativeLibFolder, file.getName());
                        byte[] byteArray = new byte[1024];
                        int i;

                        Log.info("Native lib folder processing " + file.getName());

                        if (file.isDirectory())
                        {
                            continue;
                        }

                        InputStream is = jar.getInputStream(file);
                        FileOutputStream fos = new FileOutputStream(f);

                        while ((i = is.read(byteArray)) > 0)
                        {
                            fos.write(byteArray, 0, i);
                        }
                        fos.close();
                        is.close();
                    }
                    catch(Exception e) {
                    	Log.error("Error", e);
                    }
                }

                Log.info("Native lib folder created and natives extracted");
            }
            else
                Log.info("Native lib folder already exist.");


            String newLibPath = nativeLibFolder.getCanonicalPath() + File.pathSeparator + System.getProperty("java.library.path");
            System.setProperty("java.library.path", newLibPath);

            // this will reload the new setting
            Field fieldSysPath = ClassLoader.class.getDeclaredField("sys_paths");
            fieldSysPath.setAccessible(true);
            fieldSysPath.set(System.class.getClassLoader(), null);
        }
        catch (Exception e)
        {
            Log.error(e.getMessage(), e);
        }
    }
}