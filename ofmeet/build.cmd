call ..\buildtools\apache-ant-1.9.7\bin\ant -f build.xml -lib ..\buildtools\maven-ant-tasks-2.1.3 clean jar > build.txt

rd "C:\openfire_4_0_2\plugins\ofmeet" /q /s
del "C:\openfire_4_0_2\plugins\ofmeet.jar" 
copy C:\Projects\ignite\community-plugins-dele\openfire_4_0_2\target\openfire\plugins\ofmeet.jar "C:\openfire_4_0_2\plugins"

del "C:\openfire_4_0_2\logs\*.*"
pause