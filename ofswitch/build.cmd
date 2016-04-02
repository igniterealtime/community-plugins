call ant jar >build.txt

rd "C:\Program Files (x86)\Openfire\plugins\ofswitch" /q /s
del "C:\Program Files (x86)\Openfire\plugins\ofswitch.jar"
copy C:\Projects\ignite\community-plugins\openfire_4_0_2\target\openfire\plugins\ofswitch.jar "C:\Program Files (x86)\Openfire\plugins"

del "C:\Program Files (x86)\Openfire\logs\*.*"

pause