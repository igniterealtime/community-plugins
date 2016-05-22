call ant jar >build.txt

rd "C:\Program Files (x86)\Openfire\plugins\ofmeet" /q /s
del "C:\Program Files (x86)\Openfire\plugins\ofmeet.jar"
copy C:\Projects\ignite\community-plugins-dele\openfire_4_0_2\target\openfire\plugins\ofmeet.jar "C:\Program Files (x86)\Openfire\plugins"

del "C:\Program Files (x86)\Openfire\logs\*.*"
pause