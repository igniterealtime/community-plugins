process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

var robot = require("./ofmeet.remote.control.js");
robot.start("osx");