window.addEventListener('load', function() {
  var socket = io.connect();
  var command = '';
  socket.on('connect', function() {
    var term = new Terminal({
      cols: 120,
      rows: 30,
      convertEol: true,
      useStyle: true,
      cursorBlink: true,
      screenKeys: true
    });

    term.on('data', function(data) {
      if(data != '\r') {
        command += data;
        term.write(data);
      }
      else {
        socket.emit('data', command);
        term.writeln('');
        command = '';
      }
      console.log("typing: " + data);

    });

    term.open(document.body);

    term.write('\x1b[31mConnected to beaglebone root@192.168.7.1\x1b[m\r\n');

    socket.on('data', function(data) {
      term.write(data);
    });

    socket.on('disconnect', function() {
      term.destroy();
    });
  });
}, false);
