var exec = require('child_process').exec,
    osType = require('os').type();
if(osType.match(/^win/i)) osType='Win';


if(osType !== 'Win') {

    exec('chmod +x utils/getOriginalDNS.sh utils/getPrimaryService.sh', function (err, stdout) {
        if(err) console.error(err);
        if(stdout) console.log(stdout.trim());
    });

}

