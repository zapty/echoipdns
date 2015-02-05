/*
TODO
 - tests register/unregister local dns server
*/

var vows = require('vows');
var assert = require('assert');
var olodum = require('../lib/olodum');
var exec = require('child_process').exec;

var suite2 = vows.describe('DNS testing ');
suite2.addBatch({
	'Starting olodum server' : {
		topic: function() {
			var cb = this.callback;
			olodum.init(['mycust'], '192.168.0.1',function(){setTimeout(cb, 500);});//wait for echoipdns to start before triggering callback
		},
		'works': function() {
			assert.isTrue(olodum.started);
		}
	}
}).addBatch({
		'with default config' : {
			'a "www.mycustomer.org" request should return ': {
		    topic: function () { 
					var cb = this.callback;
					exec('host www.mycustomer.org', function (error,stdout) {
						cb(error,stdout);
					  });
		      },
		      'with no error': function (err, addresses) {
					//assert.isArray(addresses);
					assert.isNull(err);
		        },
		        'and with returned IP = 192.168.0.1': function (err, addresses) {
					assert.include(addresses, "192.168.0.1");
		        }
			},
			teardown : function(){
        var cb = this.callback;
				olodum.stop(cb);
			}
		}
}).export(module);


