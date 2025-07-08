// start-server.js - Simple script to start the backend server
const { spawn } = require('child_process');
const path = require('path');

console.log('Starting BugSense Backend Server...');
console.log('Server will be available at: http://localhost:3000');

const serverProcess = spawn('node', ['server.js'], {
    cwd: path.join(__dirname, 'backend'),
    stdio: 'inherit'
});

serverProcess.on('error', (error) => {
    console.error('Failed to start server:', error);
});

serverProcess.on('close', (code) => {
    console.log(`Server process exited with code ${code}`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down server...');
    serverProcess.kill('SIGINT');
    process.exit(0);
}); 