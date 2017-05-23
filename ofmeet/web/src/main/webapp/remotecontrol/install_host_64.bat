@echo on
:: Copyright 2014 The Chromium Authors. All rights reserved.
:: Use of this source code is governed by a BSD-style license that can be
:: found in the LICENSE file.

REG ADD "HKLM\Software\Google\Chrome\NativeMessagingHosts\ofmeet.remote.control" /ve /t REG_SZ /d "%~dp0ofmeet.remote.control.win.64.json" /f
