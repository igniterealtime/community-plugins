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

package org.jivesoftware.openfire.plugin.ofswitch;

import java.net.*;
import java.io.*;
import java.util.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class FreeSwitchThread implements Runnable {

    private static final Logger Log = LoggerFactory.getLogger(FreeSwitchThread.class);

	private Thread thread = null;
	private Process nodeProcess = null;
	private BufferedReader input = null;
	private BufferedReader error = null;


	public FreeSwitchThread()
	{

	}


	public void start(String path, File dir) {

		stopThread();

		try {
			nodeProcess = Runtime.getRuntime().exec(path, null, dir);
			Log.info("Started FreeSwitch");

      		input = new BufferedReader (new InputStreamReader(nodeProcess.getInputStream()));
      		error = new BufferedReader (new InputStreamReader(nodeProcess.getErrorStream()));
			Log.info("Started FreeSwitch Console Reader");

		} catch (Exception e) {
			Log.info("Started FreeSwitch exception " + e);
		}


		// All ok: start a receiver thread
		thread = new Thread(this);
		thread.start();
	}

	public void run() {
		Log.info("Start run()");

		// Get events while we're alive.
		while (thread != null && thread.isAlive()) {

			try {

				String line = input.readLine();

			  	while (line != null) {
					Log.info(line);
					line = input.readLine();
			  	}

				line = error.readLine();

			  	while (line != null) {
					Log.error(line);
					line = error.readLine();
			  	}

     		  	Thread.sleep(500);

			} catch (Throwable t) {

			}

		}
	}

	public void stop() {

		Log.info("Stopped FreeSwitch");

		nodeProcess.destroy();
		stopThread();
	}

	public void stopThread() {
		Log.info("In stopThread()");

		// Keep a reference such that we can kill it from here.
		Thread targetThread = thread;

		thread = null;

		// This should stop the main loop for this thread.
		// Killing a thread on a blcing read is tricky.
		// See also http://gee.cs.oswego.edu/dl/cpj/cancel.html
		if ((targetThread != null) && targetThread.isAlive()) {

			targetThread.interrupt();

			try {

				// Wait for it to die
				targetThread.join(500);
			}
			catch (InterruptedException ignore) {
			}

			// If current thread refuses to die,
			// take more rigorous methods.
			if (targetThread.isAlive()) {

				// Not preferred but may be needed
				// to stop during a blocking read.
				targetThread.stop();

				// Wait for it to die
				try {
					targetThread.join(500);
				}
				catch (InterruptedException ignore) {
				}
			}

			Log.info("Stopped thread alive=" + targetThread.isAlive());

		}
	}

}
