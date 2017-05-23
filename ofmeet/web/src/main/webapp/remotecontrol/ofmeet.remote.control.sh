#!/bin/sh
# Copyright (c) 2012 The Chromium Authors. All rights reserved.
# Use of this source code is governed by a BSD-style license that can be
# found in the LICENSE file.

OSTYPE=`uname -s`

if [ $OSTYPE == "Darwin" ]; then
	osx/node ofmeet.remote.control.osx.js
fi

if [ $OSTYPE == "Linux" ]; then
	BITS=`uname -p`
	
	if [ $BITS == "x86_64" ]; then
		linux64/node ofmeet.remote.control.linux64.js
	else
		linux32/node ofmeet.remote.control.linux32.js
	fi
fi
