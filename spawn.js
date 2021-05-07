// Spawning child process

const { spawn } = require('child_process');

let options = {shell: true};
// const child = spawn('activate', ['quant'], options);
// const child = spawn('conda.bat', ['activate quant'], options);
const child = spawn('dir', options);

// ['python C:/Users/kl/Documents/Python_files/Systems/Scheduler/QM2_41autorun.bat']

child.stdout.on('data', (data) => {
    console.log(`child stdout:\n${data}`);
});

child.stderr.on('data', (data) => {
    console.log(`child stderr:\n${data}`);
});

child.on('exit', function (code, signal) {
    console.log(`child process exited with code ${code}, signal {signal}`);
});

// other events on child: disconnect, error, message, close
// stdio objects: child.stdin, child.stdout, child.stderr



