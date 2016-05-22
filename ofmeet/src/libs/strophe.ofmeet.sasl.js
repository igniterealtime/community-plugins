/**
 * OFMeet SASL Plugin
 *
 * Adds a SASL mechanism that is properietary to Openfire.
 */
Strophe.addConnectionPlugin('ofmeetsasl', {

    /**
     * Initializes the plugin by registering the new SASL mechanism as part of the Strophe SASL mechanisms.
     *
     * Invoked by the Strophe.Connection constructor.
     */
    init: function (connection) {
        // Implementation of the new SASLMechanism.
        Strophe.SASLOFMeet = function () {
        };
        Strophe.SASLOFMeet.prototype = new Strophe.SASLMechanism("OFMEET", true, 2000);
        Strophe.SASLOFMeet.test = function (connection) {
            return config.password !== null;
        };
        Strophe.SASLOFMeet.prototype.onChallenge = function (connection) {
            return config.password;
        };

        // Register the new SASL mechanism.
        connection.mechanisms[Strophe.SASLOFMeet.prototype.name] = Strophe.SASLOFMeet;
    }
});