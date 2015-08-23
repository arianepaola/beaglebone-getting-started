var gui = require('nw.gui');

var appPath = process.cwd();

console.log("app path: " + appPath);

var win = gui.Window.get();
var menubar = new gui.Menu({
    type: 'menubar'
});

var start = new gui.Menu();
var connect = new gui.Menu();
var about = new gui.Menu();
var firmware = new gui.Menu();

start.append(new gui.MenuItem({
    label: 'Start',
    click: function() {
        window.location.replace(appPath + '/html/en/index.html');
    }
}));

connect.append(new gui.MenuItem({
    label: 'Open SSH Connection',
    click: function() {
        var cp = require('child_process');
        var child = cp.fork(appPath + '/js/ssh_server.js');

        child.on('message', function(message) {
            console.log('received: ' + message);
        });

        window.location.replace(appPath + '/html/en/terminal.html');
    }
}));

connect.append(new gui.MenuItem({
    label: 'SCP File Copy',
    click: function() {
        window.location.replace(appPath + '/html/en/copyfile.html');
    }
}));

connect.append(new gui.MenuItem({
    label: 'Cloud9 IDE',
    click: function() {
        window.location.replace("http://192.168.7.2:3000/");
    }
}));

firmware.append(new gui.MenuItem({
    label: 'Download Firmware Images',
    click: function() {
        window.location.replace(appPath + '/html/en/download_firmware.html');
    }
}));

firmware.append(new gui.MenuItem({
    label: 'Flash Firmware',
    click: function() {
        window.location.replace(appPath + '/html/en/flash_firmware.html');
    }
}));

firmware.append(new gui.MenuItem({
    label: 'Flash eMMC',
    click: function() {
        window.location.replace(appPath + '/html/en/flash_emmc.html');
    }
}));

about.append(new gui.MenuItem({
    label: 'Open Documentation',
    click: function() {
        gui.Window.open(appPath + '/README.htm');
    }
}));

about.append(new gui.MenuItem({
    label: 'BeagleBoard TV',
    click: function() {
        gui.Window.open('https://www.youtube.com/user/jadonk');
    }
}));

about.append(new gui.MenuItem({
    label: 'About',
    click: function() {
        alert('BeagleBoard Getting Started App\n(c) 2015 Ariane Paola Gomes.');
    }
}));

menubar.append(new gui.MenuItem({label: 'Start', submenu: start}));
menubar.append(new gui.MenuItem({label: 'Connect', submenu: connect}));
menubar.append(new gui.MenuItem({label: 'Firmware update', submenu: firmware}));
menubar.append(new gui.MenuItem({label: 'Help', submenu: about}));

win.menu = menubar;