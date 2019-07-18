import fs from 'fs';
import { spawn } from 'child_process';

import util from 'util';

const streamPipeline = util.promisify(require('stream').pipeline);

const fetch = require('node-fetch');

/**
 * Allows to save a image locally from external URL
 * returns locally saved img path
 * @param inputURL
 * @param tempPath
 */
async function downloadImageFromUrl(inputURL: string, tempPath: string) {
  const fileName = inputURL.split('/').pop();
  const tempFilePath = `${tempPath}/${fileName}`;
  const response = await fetch(inputURL);
  if (!response.ok)
    throw new Error(`unexpected response ${response.statusText}`);
  await streamPipeline(response.body, fs.createWriteStream(tempFilePath));
  return tempFilePath;
}

/**
 * returns file path to modified image
 */
async function pythonModifyFile(fileToModify: string): Promise<string> {
  return new Promise(async resolve => {
    const args = [`--input`, `${fileToModify}`];
    let returnData: string;
    const pythonFilePath = `${__dirname}/python/imgModifier.py`;
    args.unshift(pythonFilePath);
    const pyspawn = spawn('python', args);
    pyspawn.stdout.on('data', (data: string) => {
      console.log(`stdout: ${data}`);
      returnData = data;
    });

    pyspawn.stderr.on('data', (data: string) => {
      console.log(`stderr: ${data}`);
      returnData = data;
    });

    pyspawn.on('close', (code: number) => {
      // we need to convert to string and replace an stdout line break
      returnData = returnData
        .toString()
        .split('/')
        .pop();
      const relFilePath = `${__dirname}/tmp/${returnData}`.replace(
        /(\r\n|\n|\r)/gm,
        ''
      );
      console.log(
        `child process exited with code ${code} and returnData is \n\n\n ${relFilePath}`
      );
      resolve(relFilePath);
    });
  });
}

export async function filterImageWithPython(
  inputURL: string
): Promise<string[]> {
  return new Promise(async (resolve, reject) => {
    try {
      const fileToModify = await downloadImageFromUrl(
        inputURL,
        `${__dirname}/tmp/`
      );
      const filteredImage: string = await pythonModifyFile(fileToModify);
      resolve([filteredImage, fileToModify]);
    } catch (err) {
      console.log(err);
      reject(err);
    }
  });
}
// deleteLocalFiles
// helper function to delete files on the local disk
// useful to cleanup after tasks
// INPUTS
//    files: Array<string> an array of absolute paths to files
export async function deleteLocalFiles(files: Array<string>) {
  for (let file of files) {
    fs.unlinkSync(file);
  }
}
