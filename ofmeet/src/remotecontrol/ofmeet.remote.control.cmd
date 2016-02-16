@echo on
:: Copyright 2014 The Chromium Authors. All rights reserved.
:: Use of this source code is governed by a BSD-style license that can be
:: found in the LICENSE file.

time /t > "%~dp0/ofmeet.remote.control.stdout.log"
time /t > "%~dp0/ofmeet.remote.control.stderr.log"

"%~dp0/win32/node.exe" "%~dp0/ofmeet.remote.control.js" %* >> "%~dp0/ofmeet.remote.control.stdout.log" 2>> "%~dp0/ofmeet.remote.control.stderr.log"
