#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const electron = require('electron');

// Start the Electron app
console.log('Starting Sup...');

const proc = spawn(electron, [path.join(__dirname, 'main.js')], {
  stdio: 'inherit'
});

proc.on('close', (code) => {
  if (code !== 0) {
    console.error(`Sup exited with code ${code}`);
    process.exit(code);
  }
});

proc.on('error', (err) => {
  console.error('Failed to start Sup:', err);
  process.exit(1);
});

// Handle termination signals
process.on('SIGINT', () => {
  proc.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  proc.kill('SIGTERM');
  process.exit(0);
}); 