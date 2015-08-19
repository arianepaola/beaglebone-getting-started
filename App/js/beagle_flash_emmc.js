var spawn = require('child_process').spawnSync;
var os = require('os');
var tempWrite = require('tempwrite');


var writeFlashScript = function(origFile, dest) {
    var filepath = tempWrite.sync('boot');

    tempWrite.sync('cmdline=init=/opt/scripts/tools/eMMC/init-eMMC-flasher-v3.sh');
};