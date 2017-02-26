call ant jar >build.txt

rd "C:\openfire_4_0_2\Openfire\plugins\ofsocial" /q /s
del "C:\openfire_4_0_2\Openfire\plugins\ofsocial.jar"
copy C:\Projects\ignite\community-plugins\openfire_4_0_2\target\openfire\plugins\ofsocial.jar "C:\openfire_4_0_2\Openfire\plugins"

del "C:\openfire_4_0_2\Openfire\logs\*.*"
pause