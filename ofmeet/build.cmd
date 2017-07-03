call ant jar >build.txt

rd "C:\openfire_4_1_5\plugins\ofmeet" /q /s
del "C:\openfire_4_1_5\plugins\ofmeet.jar" 
copy C:\Projects\ignite\community-plugins\openfire_4_1_5\target\openfire\plugins\ofmeet.jar "C:\openfire_4_1_5\plugins"

del "C:\openfire_4_1_5\logs\*.*"
pause