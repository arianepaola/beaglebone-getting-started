#!/usr/bin/env node
/*
 * BeagleBone Getting Started Application
 * https://github.com/arianepaola/beaglebone-getting-started/tree/nwjs
 *
 * Copyright (c) 2015 Ariane Paola Gomes
 * Licensed under the MIT license.
 */

var http = require('http');
var fs = require('fs');
var os = require('os');
var sudo = require('sudo');
var windosu = require('windosu');
var tempWrite = require('temp-write');
var beagleStorageDevice = require('./beagle_storage_device');

var download = function(downloadURL, destination, callback) {
    var file = fs.createWriteStream(destination);

    var request = http.get(downloadURL, function(response) {
        response.pipe(file);

        response.on('data', function(dataChunk) {
            file.write(dataChunk);
        });

        file.on('finish', function() {
            file.close(callback);
        });
    }).on('error', function(error) {
        fs.unlink(destination);

        if (callback) {
            callback(error.message);
        }
    });
};

var installBeagleDriver = function() {
    if (/linux/.test(process.platform)) {
        /*
        linux
        http://beagleboard.org/static/Drivers/Linux/FTDI/mkudevrule.sh
        */
    }
    else if(/darwin/.test(process.platform)) {
        /*
         macos
         network:
         http://beagleboard.org/static/Drivers/MacOSX/RNDIS/HoRNDIS.pkg
         serial:
         http://beagleboard.org/static/Drivers/MacOSX/FTDI/EnergiaFTDIDrivers2.2.18.pkg

         */
    }
    else if(/windows/.test(process.platform) && /x32/.test(os.arch())) {
        /*
         win32
         http://beagleboard.org/static/Drivers/Windows/BONE_DRV.exe

         */
    }

    else if(/windows/.test(process.platform) && /x64/.test(os.arch())) {
        /*
         win64
         http://beagleboard.org/static/Drivers/Windows/BONE_D64.exe
         */
    }

    else {
    }
};