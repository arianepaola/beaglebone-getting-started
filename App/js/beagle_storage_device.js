#!/usr/bin/env node
/*
 * BeagleBone Getting Started Application
 * https://github.com/arianepaola/beaglebone-getting-started/tree/nwjs
 *
 * Copyright (c) 2015 Ariane Paola Gomes
 * Licensed under the MIT license.
 */

var spawn = require('child_process').spawnSync;
var os = require('os');
var sudo = require('sudo');
var windosu = require('windosu');
var tempWrite = require('temp-write');

// runs a command and returns its output as string
var commandLine = function(command, arguments) {
    var commandOutput = spawn(command, arguments);

    return commandOutput.stdout.toString();
};

// detects BeagleBone Linux device entry
var detectDeviceLinux = function() {
    var dmesgOutput = commandLine('dmesg', ['-k']);
    var mountOutput = commandLine('mount', ['-l']);

    // regular expressions for dmesg and mount outputs
    var reDmesg = /[\s\S]*?(.*idVendor=1d6b, idProduct=0104\n.*\n.*Product: BeagleBoneBlack\n.*Manufacturer: Circuitco\n.*SerialNumber:*[\s\S]*?Direct-Access.*Linux.*File-CD Gadget[\s\S]*?\[(sd[a-z]{1})\] 196608 512-byte logical blocks:[\s\S]*?\[(sd[a-z]{1})\] Attached SCSI removable disk)/gm;
    var reMount = /[\s\S]*?(.*\/dev\/(sd[a-z]{1}) on \/media\/.*\/BEAGLEBONE type vfat \(.*\) \[BEAGLEBONE\])/gm;

    var resultDmesg = reDmesg.exec(dmesgOutput);
    var resultMount = reMount.exec(mountOutput);

    // check if dmesg and mount output match
    if((resultDmesg[2] == resultDmesg[3]) && (resultDmesg[2] == resultMount[2]) && (resultDmesg[2] != null)) {
        return '/dev/' + resultDmesg[2];
    }

    return null;
};

// detects BeagleBone MacOS device entry
var detectDeviceMacOS = function() {
    var systemProfilerOutput = commandLine('system_profiler', ['SPUSBDataType']);
    var diskutilListOutput = commandLine('diskutil', ['list']);

    // regular expressions for system_profiler and diskutil outputs
    var reSystemProfiler = /[\s\S]*?BeagleBoneBlack:\s+Product ID: (0[xX][0-9a-fA-F]{4})\s+Vendor ID: (0[xX][0-9a-fA-F]{4})/gm;
    var reDiskutilList = /[\s\S]*?\/dev\/(disk[0-9]{1})\s+.*TYPE NAME\s+SIZE\s+IDENTIFIER\s+0:\s+BEAGLEBONE\s+\*[0-9]+\.[0-9]+\s+MB\s+(disk[0-9]{1})/gm;
    var reDiskutilInfo = /[\s\S]*?.*Device Identifier:\s+(disk[0-9]{1})\s+Device Node:\s+(\/dev\/disk[0-9]{1})[\s\S]*?Linux File-CD Gadget Media\s+Volume Name:\s+BEAGLEBONE\s+Mounted:\s+(Yes|No)\s+Mount Point:\s+(\/Volumes\/.*)/gm;

    var resultSystemProfiler = reSystemProfiler.exec(systemProfilerOutput);
    var resultDiskutilList = reDiskutilList.exec(diskutilListOutput);

    // check if the USB device and vendor ids match, and compare with diskutil output
    if((resultSystemProfiler[1] == '0x0104' && resultSystemProfiler[2] == '0x1d6b') &&
        ((reDiskutilList[1] == reDiskutilList[2]) && (reDiskutilList[1] != null))) {

        // verify additional diskutil info for the device match
        var diskutilInfoOutput = commandLine('diskutil', ['info', resultSystemProfiler[1]]);
        var resultDiskutilInfo = reDiskutilInfo.exec(diskutilInfoOutput);

        // check for a matching diskutil info and diskutil list device
        if(resultDiskutilInfo[1] == resultDiskutilList[1]) {
            // return device node
            return resultDiskutilInfo[2];
        }
    }

    return null;
};

// detects BeagleBone Windows device entry
var detectDeviceWindows = function() {
    var wmicOutput = commandLine('wmic', ['diskdrive', 'list']);
    var ddOutput = commandLine('dd.exe', ['--list']);

    // regular expressions for wmic and dd for windows
    var reWmic = /[\s\S]*?Linux File-CD Gadget USB Device\s+(.*)\s+USBSTOR/gm;
    var reDd = /[\s\S]*?Volume\{(.*)\}\\\s+.*\s+removeable media\s+Mounted on\s+(\\.*)\s+/gm;

    var resultWmic = reWmic.exec(wmicOutput);
    var resultDd = reDd.exec(ddOutput);

    if(resultWmic[1] != null && resultDd[1] != null) {
        return resultWmic[1];
    }

    return null;

};

// remove / umount BeagleBone device Linux, Mac and Windows
var umount = function(device, password) {
    // Linux
    if(os.type().substring(0,4) == 'Linux') {
        umountLinux(device, password);
    }

    // MacOS
    else if(os.type().substring(0,5) == 'Darwin') {
        umountMacOS(device, password);
    }

    // Windows
    else if(os.type().substring(0,6) == 'Windows') {
        umountWindows(device, password);
    }

    else {
    }
};

// umount a specified device on Linux
var umountLinux = function(device, password) {
    var options = {cachePassword: false, password: password};

    // sudo umount /dev/sdX
    var child = sudo([ 'umount', device], options);
    child.stdout.on('data', function (data) {
        console.log(data.toString());
    });
};

// umount a specified device on MacOS
var umountMacOS = function(device, password) {
    var options = {cachePassword: false, password: password};

    // sudo diskutil unmount /dev/diskX
    var child = sudo([ 'diskutil', 'umount', device], options);
    child.stdout.on('data', function (data) {
        console.log(data.toString());
    });
};

// umount a specified device on Windows
var umountWindows = function(device, password) {
    // write diskpart command script
    var filepath = tempWrite.sync('diskpart_script.txt');

    tempWrite.sync('list volume');

    windosu.exec('diskpart /s ' + fs.readFileSync(filepath, 'utf8'));

    // write diskpart umount script
    var umountScript = tempWrite.sync('diskpart_umount.txt');
    tempWrite.sync('list volume\r\nselect volume 3\r\nremove all dismount\r\nexit');

    windosu.exec('diskpart /s ' + fs.readFileSync(umountScript, 'utf8'));
};

// export module functionality
module.exports.detectDeviceLinux = detectDeviceLinux;
module.exports.detectDeviceMacOS = detectDeviceMacOS;
module.exports.detectDeviceWindows = detectDeviceWindows;
module.exports.umount = umount;