const fs = require('fs');
const os = require('os');
const filePath = 'os_info.txt';

// Get OS information
const osInfo = `OS: ${os.type()}\nPlatform: ${os.platform()}\nArchitecture: ${os.arch()}\nCPUs: ${os.cpus().length}\nTotal Memory: ${os.totalmem()} bytes\nFree Memory: ${os.freemem()} bytes\nUptime: ${os.uptime()} seconds`;

// Write OS information to a file
fs.writeFile(filePath, osInfo, 'utf8', (err) => {
    if (err) {
        console.error('Error writing file:', err);
        return;
    }
    console.log('OS information written successfully.');
});
