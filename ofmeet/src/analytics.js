(function (ctx) {
  function Analytics() {

  }

  Analytics.prototype.sendEvent = function (action, data) {
    console.log('Analytics send', 'event', 'jitsi-videobridge', action);
  };

  ctx.Analytics = Analytics;
}(window));