// requires
var log = require('./log').logMsg,
    env = require('./env'),
    dns = require('native-dns'),
    async = require('async');

var dnsServer;

// Const
var TTL = 5; // default TTL

//mini conf
var domains = [''];
var target = '127.0.0.1';
var originalDNS = "8.8.8.8" //Google DNS
var debug = false;
var eipregex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)-(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)-(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)-(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/g;


exports.init = function (filteringDomains, targetIP, debugFlag, originalServer, callback) {
    var that = this;

    for (var i = 0; i < filteringDomains.length; i++) {
        filteringDomains[i] = filteringDomains[i].toLowerCase();
    }

    if (debugFlag) {
        debug = debugFlag;
    }
    env.originalServer = originalServer;

    //get originalDNS
    env.getOriginalDNS(function (res) {
        originalDNS = res;

        if (filteringDomains) {
            domains = filteringDomains;
        }
        if (targetIP) {
            if (/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(targetIP)) {
                target = targetIP;
                that.start(callback);
            }
            else { //need to resolve first if target is a domain
                require('dns').resolve(targetIP, 'A', function (err, addresses) {
                    if (err) {
                        log(err.toString() + ' => echoipdns exiting');
                        process.exit(1);
                    }
                    target = addresses[0];
                    that.start(callback);
                });
            }
        }
        else {//no target defined, then default target
            that.start(callback);
        }
    });
};

exports.start = function (callback) {
    var that = this;
    //dnsServer = dnsd.createServer(mainListener);
    dnsServer = dns.createServer();
    dnsServer.on('request', nativeDnsRequest);
    dnsServer.on('error', nativeDnsError);

    log('Starting process ' + process.pid);
    var lip = '127.0.0.1';
    if (env.originalServer) lip = '0.0.0.0';

    dnsServer.serve(53);
    log('echoipdns listening on port 53, forwards to '+originalDNS);
    log('echoipdns forwarding domains containing words ' + domains.join(', ') + ' to ' + target+' or embedded ip separated by - in the domain name');
    that.started = true;

    process.stdin.resume();

    process.on('SIGINT', this.stop);
    process.on('SIGTERM', this.stop);
    process.on('uncaughtException', function (err) {
        log(err.toString());
        if (/EACCES/.test(err.toString())) {log(' => echoipdns must be run with sudo');}
        that.stop()
    });

    //change local entries for DNS servers
    env.setLocal();
    if (typeof callback === 'function') callback();
};

exports.stop = function (callback) {
    log('Stopping echoipdns Server ...');
    try {
        var cb = callback ? callback : function () {
            process.exit(0);
        };
        env.unsetLocal(cb);
        dnsServer.close();
    }
    catch (e) {
        process.exit(0)
    }
};

function nativeDnsError(err, buff, req, res) {
    log('Error nativeDNS');
    log(err);
}


function nativeDnsRequest(req, res) {
    var questions = [];

    //process all subqueries
    for (var i = 0; i < req.question.length; i++) {
        var question = req.question[i];

        // domain name queried
        var name = (question.name === '.' ? '' : question.name);

        // only respond to A query containing 'domain'
        if (domains.some(function (domainFilter) {
                return name.indexOf(domainFilter) !== -1
            })) {
            if (debug) {
                log('filtered domain name : ' + name)
            }
            var rip = target;

            var d = name.split('.');
            // Check if ip is embedded in domain name e.g. 10-0-0-1.dev (where dev is filtered domain name)
            // if ip is present use it otherwise send to localhost
            if (d.length >= 2) {
                var possibleIp = d[d.length - 2];
                if (possibleIp.match(eipregex)) {
                    rip = possibleIp.replace(/-/g, '.'); //extract the ip
                }
            }

            if (question.type === 1) {
                res.answer.push(dns.A({name: name, address: rip, ttl: TTL}));
            }
        }
        else {
            //otherwise proxy dns request (collect all questions and then forward together)
            questions.push(question);
        }
    }
    if (questions && questions.length) {
        forwardRequest(questions, function (err, results) {
            if (!err) {
                if (results) {
                    if(debug){
                        log('results '+results.length);
                    }
                    results.forEach(function (requests) {
                        requests.forEach(function (a) {
                            res.answer.push(a);
                            if(debug) log(JSON.stringify(a));
                        });
                    });
                }
            }
            res.send();
        });
    } else {
        res.send();
    }
}

function forwardRequest(questions, callback) {
    async.map(
        questions,
        forwardQuestion,
        callback
    );
}

function forwardQuestion(question, callback) {
    var answers = [];

    var req = dns.Request({
        question: question,
        server: {address: originalDNS, port: 53, type: 'udp'},
        timeout: 5000
    });

    req.on('timeout', function () {
        if(debug) log('Timeout - ' + this.question.name);
    });

    req.on('message', function (err, answer) {
        if(debug) log('message - ' + this.question.name);
        answer.answer.forEach(function (a) {
            answers.push(a);
        });
    });

    req.on('end', function () {
        if(debug) log('end - ' + this.question.name);
        callback(null, answers);
    });

    req.send();
}