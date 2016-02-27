
var channel = chrome.runtime.connect();

channel.onMessage.addListener(function (message) {
    console.log('intercom extension channel message', message);
    window.postMessage(message, '*');
});

window.addEventListener('message', function (event) {
    if (event.source != window)
        return;
        
    if (!event.data)
        return;
    channel.postMessage(event.data);
});

var div = document.createElement('div');
div.id = "intercom-extension-installed";
div.style = "display: none;";
document.body.appendChild(div);