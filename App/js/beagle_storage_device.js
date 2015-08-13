var spawn = require('child_process').spawnSync;

var command_line = function(command, arguments) {
    var command_output = spawn(command, arguments);

    return command_output.stdout.toString();
};


var detectDeviceLinux = function() {
    var dmesg_output = command_line('dmesg', ['-k']);
    var mount_output = command_line('mount', ['-l']);

    var reDmesg = /[\s\S]*?(.*idVendor=1d6b, idProduct=0104\n.*\n.*Product: BeagleBoneBlack\n.*Manufacturer: Circuitco\n.*SerialNumber:*[\s\S]*?Direct-Access.*Linux.*File-CD Gadget[\s\S]*?\[(sd[a-z]{1})\] 196608 512-byte logical blocks:[\s\S]*?\[(sd[a-z]{1})\] Attached SCSI removable disk)/gm;
    var reMount = /[\s\S]*?(.*\/dev\/(sd[a-z]{1}) on \/media\/.*\/BEAGLEBONE type vfat \(.*\) \[BEAGLEBONE\])/gm;

    var resultDmesg = reDmesg.exec(dmesg_output);
    var resultMount = reMount.exec(mount_output);


    if((resultDmesg[2] == resultDmesg[3]) && (resultDmesg[2] == resultMount[2]) && (resultDmesg[2] != null)) {
        return '/dev/' + resultDmesg[2];
    }

    return null;
};

var detectDeviceMacOS = function() {
    var system_profiler_output = command_line('system_profiler', ['SPUSBDataType']);
    var diskutil_list_output = command_line('diskutil', ['list']);

    var reSystemProfiler = /[\s\S]*?BeagleBoneBlack:\s+Product ID: (0[xX][0-9a-fA-F]{4})\s+Vendor ID: (0[xX][0-9a-fA-F]{4})/gm;
    var reDiskutilList = /[\s\S]*?\/dev\/(disk[0-9]{1})\s+.*TYPE NAME\s+SIZE\s+IDENTIFIER\s+0:\s+BEAGLEBONE\s+\*[0-9]+\.[0-9]+\s+MB\s+(disk[0-9]{1})/gm;
    var reDiskutilInfo = /[\s\S]*?.*Device Identifier:\s+(disk[0-9]{1})\s+Device Node:\s+(\/dev\/disk[0-9]{1})[\s\S]*?Linux File-CD Gadget Media\s+Volume Name:\s+BEAGLEBONE\s+Mounted:\s+(Yes|No)\s+Mount Point:\s+(\/Volumes\/.*)/gm;

    var resultSystemProfiler = reSystemProfiler.exec(system_profiler_output);
    var resultDiskutilList = reDiskutilList.exec(diskutil_list_output);

    if((resultSystemProfiler[1] == '0x0104' && resultSystemProfiler[2] == '0x1d6b') &&
        ((reDiskutilList[1] == reDiskutilList[2]) && (reDiskutilList[1] != null))) {

        var diskutil_list_output = command_line('diskutil', ['info', resultSystemProfiler[1]]);
        var resultDiskutilInfo = reDiskutilInfo.exec(diskutil_list_output);

        if(resultDiskutilInfo[1] == resultDiskutilList[1]) {
            // return device node
            return resultDiskutilInfo[2];
        }
    }

    return null;
};

var detectDeviceWindows = function() {

};