//TODO : windows

var exec = require('child_process').exec,
    log = require('./log').logMsg,
    osType = require('os').type();
var utilsPath = require('path').resolve(__dirname,'../utils');
if(osType.match(/^win/i)) osType='Win';

exports.originalServer=null;

var cmdGet = 'grep "nameserver" /etc/resolv.conf | grep -o -m 1 "[0-9]*\\.[0-9]*\\.[0-9]*\\.[0-9]*"';

var cmdUnset = {
    Darwin: 'networksetup -setdnsservers "`' + utilsPath + '/getPrimaryService.sh`" `' + utilsPath + '/getOriginalDNS.sh`',
    Linux: 'mv -f /etc/resolv.conf.orig /etc/resolv.conf'
};

var cmdSet = {
    Darwin: 'cp /etc/resolv.conf /etc/resolv.conf.orig && networksetup -setdnsservers "`' + utilsPath + '/getPrimaryService.sh`" "127.0.0.1"',
    Linux: 'mv /etc/resolv.conf /etc/resolv.conf.orig && echo "nameserver 127.0.0.1" >> /etc/resolv.conf'
};

exports.getOriginalDNS = function (cb) {
    if(exports.originalServer) return cb(exports.originalServer);
    if(osType==='Win') return cb('8.8.8.8');
    exec(cmdGet, function (err, stdout) {
        cb(stdout.trim());
    });
};

exports.setLocal = function () {
    //register as a local DNS
    if(osType==='Win' || exports.originalServer) {
        return;
    }
    var cmd = cmdSet[osType];
    exec(cmd, function (error) {
        if (error !== null) {
            log('exec error: ' + error);
            log("DNS rules can't be modified" );
            if (/Permission denied/.test(error.toString())) {log(' => echoipdns must be run with sudo');}
            process.exit(0);
        }
        log('Local Nameserver rules has been added');
    });
};

exports.unsetLocal = function (callback) {
    if(osType==='Win' || exports.originalServer) {
        if(callback)
            return callback();
        else
            return;
    }
    var cmd = cmdUnset[osType];
    exec(cmd, function (error) {
        if (error !== null) {
            log('exec error: '.red + error);
        }
        log('Local nameserver has been removed. Now exit');
        if (callback) {callback()};
    });
};
