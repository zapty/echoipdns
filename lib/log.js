var growl = require('growl'),
    path = require('path');

exports.logMsg = function (msg, isDev) {
  var d = new Date();
  d = d.toDateString() + ' ' + d.toLocaleTimeString();
  if (isDev === undefined) isDev = true ;
	if (isDev) {
		growl(msg, { title: 'Fasterize Local DNS Server', image: path.resolve(__dirname,'../olodum.png')})
		if (typeof msg ==='string') {
			console.log(d+ '\t' + msg);
		}
		else {
			console.log(d);
			console.log(msg)
		}
	}
	else {
		console.log(d + '\t' + msg)
	}
};


