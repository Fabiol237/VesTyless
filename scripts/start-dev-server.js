import { spawn } from 'child_process';

const nodeDir = 'C:\\Program Files\\Microsoft Visual Studio\\2022\\Community\\MSBuild\\Microsoft\\VisualStudio\\NodeJs';
const nextBin = './node_modules/next/dist/bin/next';

console.log('Starting Next.js dev server on http://localhost:3000 ...');

const child = spawn(process.execPath, [nextBin, 'dev'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    PATH: `${nodeDir};${process.env.PATH || ''}`,
  },
});

child.on('error', (err) => console.error('DEV ERROR:', err));
child.on('exit', (code) => console.log('DEV EXIT:', code));
