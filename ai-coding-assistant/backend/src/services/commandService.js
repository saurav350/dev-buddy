import { exec } from 'child_process';
import path from 'path';

const targetRoot = process.env.TARGET_PROJECT_ROOT || process.cwd();

if (!targetRoot) {
  throw new Error('TARGET_PROJECT_ROOT must be set in the environment');
}

const runCommand = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, { cwd: path.resolve(targetRoot), windowsHide: true, maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
      if (error) {
        return reject(new Error(`Command failed: ${stderr || error.message}`));
      }
      resolve({ command, stdout: stdout.trim(), stderr: stderr.trim() });
    });
  });
};

export default { runCommand };
