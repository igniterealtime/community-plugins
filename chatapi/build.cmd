call ant jar >build.txt

rd "C:\openfire_4_1_1\plugins\chatapi" /q /s
del "C:\openfire_4_1_1\plugins\chatapi.jar"
copy "C:\Projects\ignite\community-plugins\openfire_4_1_1\target\openfire\plugins\chatapi.jar" "C:\openfire_4_1_1\plugins"

del "C:\openfire_4_1_1\logs\*.*"
pause