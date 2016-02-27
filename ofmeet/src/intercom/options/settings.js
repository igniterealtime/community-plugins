window.addEvent("domready", function () {

    new FancySettings.initWithManifest(function (settings) 
    {
        var background = chrome.extension.getBackgroundPage();        

        settings.manifest.connect.addEvent("action", function () 
        {
            reloadApp()
        });

        function reloadApp(){
            background.ChromeUi.reloadApp();
        }

    });
    

});
