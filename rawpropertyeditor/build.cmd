call ant jar >build.txt

rd "C:\openfire_4_0_2\plugins\rawpropertyeditor" /q /s
del "C:\openfire_4_0_2\plugins\rawpropertyeditor.jar" 
copy C:\Projects\ignite\community-plugins-dele\openfire_4_0_2\target\openfire\plugins\rawpropertyeditor.jar "C:\openfire_4_0_2\plugins"

del "C:\openfire_4_0_2\logs\*.*"
pause