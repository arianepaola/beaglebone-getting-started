var os = require('os');
var sudo = require('sudo');
var windosu = require('windosu');

var flashImage = function(imageFile, device, password) {
    // Linux
    if(os.type().substring(0,4) == 'Linux') {
        flashImageLinux(imageFile, device, password);
    }

    // MacOS
    else if(os.type().substring(0,5) == 'Darwin') {
        flashImageMacOS(imageFile, device, password);
    }

    // Windows
    else if(os.type().substring(0,6) == 'Windows') {
        flashImageWindows(imageFile, device, password);
    }

    else {
    }
};

var flashImageLinux = function(imageFile, device, password) {
    var options = {cachePassword: false, password: password};

    // sudo dd if=bone.img of=/dev/sdX bs=1M
    var child = sudo([ 'dd', 'if=' + imageFile, 'of=' + device, 'bs=1M'], options);
    child.stdout.on('data', function (data) {
        console.log(data.toString());
    });

    // synchronize data
    var sync = sudo(['sync'], options);
    child.stdout.on('data', function (data) {
        console.log(data.toString());
    });
};

var flashImageMacOS = function(imageFile, device, password) {
    var options = {cachePassword: false, password: password};

    // use raw disk device for better speed
    // sudo dd bs=1m if=bone.img of=/dev/rdisk4
    var child = sudo([ 'dd', 'if=' + imageFile, 'of=' + device, 'bs=1M'], options);
    child.stdout.on('data', function (data) {
        console.log(data.toString());
    });
};

var flashImageWindows = function(imageFile, device, password) {
    // dd if=\\?\Device\Disk1 of=c:\temp\disc1.iso bs=1M
    windosu.exec('dd if=\\\\?\\' + device + ' of=' + imageFile + ' bs=1M');
};