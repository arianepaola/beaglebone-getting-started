var jsdom = require("jsdom");
var http = require('http');
var fs = require('fs');
var url = require("url");
var path = require("path");
var crypto = require('crypto');

var updatePercentage = function(value) {
    $("div[role='progressbar']").css("width", value + "%");
    $("div[role='progressbar']").text(value + "%");
};

var download = function(url, destination, callback) {
    var file = fs.createWriteStream(destination);
    var length = 0;

    var lastPercentage = 0;

    var request = http.get(url, function(response) {
        response.pipe(file);
        var contentLength = response.headers['content-length'];

        response.on('data', function(dataChunk) {
            file.write(dataChunk);

            length += dataChunk.length;

            var downloadPercentage = Math.round((length / contentLength) * 100);

            if(downloadPercentage != lastPercentage) {
                updatePercentage(downloadPercentage);
                lastPercentage = downloadPercentage;
            }
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

var verifyChecksum = function (fileName, md5) {
    var fileDescriptor = fs.createReadStream(fileName);
    var hash = crypto.createHash('md5');
    var md5sum = "";
    hash.setEncoding('hex');

    fileDescriptor.on('end', function() {
        hash.end();
        md5sum = hash.read();

        $("#md5_verification").text(md5sum);
        console.log("md5 for download: " + md5sum);
    });

    fileDescriptor.pipe(hash);
};

var saveAs = function (firmwareUrl) {
    var chooser = $('#fileDialog');
    var parsed = url.parse(firmwareUrl);
    var firmwareImageFile = path.basename(parsed.pathname);

    $('#fileDialog').attr('nwsaveas', firmwareImageFile);

    chooser.unbind('change');
    chooser.change(function(evt) {
        download(firmwareUrl, $(this).val());
        verifyChecksum((this).val(), '');
    });

    chooser.trigger('click');
};

var appendDownload = function(url, device, name, memory, date, md5) {
    $("#firmware_images_display").append('<a href="javascript: saveAs(\'' + url + '\');" data-url="' + url
        + '" data-md5="' + md5 + '" type="button" class="btn btn-primary btn-lg btn-block"><b>'
        + name + '(' + device + memory + ')' +
        '</b></a><br />');
 };

$(document).ready(function() {
    var fileName = "";

    jsdom.env({
        url: "http://beagleboard.org/latest-images",
        scripts: ["https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js"],
        done: function (errors, window) {
            var $ = window.$;
            $("a[itemprop='downloadURL']").each(function() {
                var link = $(this).attr("href");
                var parsed = url.parse(link);
                fileName = parsed;

                var device = $(this).children("span[itemprop='device']").text();
                var name = $(this).children("span[itemprop='name']").text();
                var memory = $(this).children("span[itemprop='memoryRequirements']").text();
                var date = $(this).children("span[itemprop='datePublished']").text();
                var md5 = $(this).parent().children("span[itemprop='md5sum']").text();

                appendDownload(link, device, name, memory, date, md5);
            });
        }
    });
});