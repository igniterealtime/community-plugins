call ant jar >build.txt

rd "C:\openfire_4_0_2\plugins\ofswitch" /q /s
del "C:\openfire_4_0_2\plugins\ofswitch.jar"
copy C:\Projects\ignite\community-plugins\openfire_4_0_2\target\openfire\plugins\ofswitch.jar "C:\openfire_4_0_2\plugins"

del "C:\openfire_4_0_2\logs\*.*"

pause