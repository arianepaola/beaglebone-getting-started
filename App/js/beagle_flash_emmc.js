var sshClient = require('ssh2').Client;
var conn = new sshClient();

var flasheMMC = function(host, port, username, password) {
    conn.on('ready', function () {
        conn.exec("sed -i 's|#cmdline=init=/opt/scripts/tools/eMMC/init-eMMC-flasher-v3.sh|cmdline=init=/opt/scripts/tools/eMMC/init-eMMC-flasher-v3.sh|g' \/boot\/uEnv.txt && reboot", function (err, stream) {
            if (err) {
                console.log("error");
            }

            stream.on('close', function (code, signal) {
                conn.end();
            }).on('data', function (data) {
                console.log('output: ' + data);
            }).stderr.on('data', function (data) {
                    console.log('error: ' + data);
                });
        }).connect({
            host: host,
            port: port,
            username: username,
            password: password
        });
    });
};