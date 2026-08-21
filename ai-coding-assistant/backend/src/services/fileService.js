import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const targetRoot = process.env.TARGET_PROJECT_ROOT || process.cwd();

if (!targetRoot) {
  throw new Error('TARGET_PROJECT_ROOT must be set in the environment');
}

const resolvePath = (relativePath) => {
  const normalized = path.normalize(relativePath || '.');
  const fullPath = path.resolve(targetRoot, normalized);
  if (!fullPath.startsWith(path.resolve(targetRoot))) {
    throw new Error('Path is outside the target project root');
  }
  return fullPath;
};

const listFiles = async (relativePath) => {
  const dir = resolvePath(relativePath || '.');
  const entries = await fs.readdir(dir, { withFileTypes: true });
  return entries.map((entry) => ({
    name: entry.name,
    isDirectory: entry.isDirectory(),
    isFile: entry.isFile()
  }));
};

const readFile = async (relativePath) => {
  const filePath = resolvePath(relativePath);
  const content = await fs.readFile(filePath, 'utf-8');
  return { path: relativePath, content };
};

const writeFile = async (relativePath, content) => {
  const filePath = resolvePath(relativePath);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content, 'utf-8');
  return { path: relativePath, written: true };
};

export default { listFiles, readFile, writeFile };
