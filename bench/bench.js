var dns = require('dns');
var MAX = 100000 || argv[0];
var startTime = new Date().getTime();
var count = 1;
var count_err = 0;
for (var i = 0; i < MAX; i++) {
		var my_name = 'www.google.com';
		dns.resolve(my_name, 'A',function (err,addr) {
			if (err) {count_err++}
			count++;
			if (count === MAX) {
				endTime = new Date().getTime();
				console.log ('end : ' + (endTime - startTime));
				console.log ('req/s: ' + ( MAX / ((endTime - startTime)/1000));
				console.log ('err :' + count_err);
			}
		});
};

