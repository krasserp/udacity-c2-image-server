import fs from 'fs';
import Jimp = require('jimp');
import { spawn } from 'child_process';

import util from 'util';

const streamPipeline = util.promisify(require('stream').pipeline);

const fetch = require('node-fetch');

async function download(inputURL: string, tempPath: string) {
  const fileName = inputURL.split('/').pop();
  const tempFilePath = `${tempPath}/${fileName}`;
  const response = await fetch(inputURL);
  if (!response.ok)
    throw new Error(`unexpected response ${response.statusText}`);
  await streamPipeline(response.body, fs.createWriteStream(tempFilePath));
  return tempFilePath;
}

//Node.js Function to save image from External URL.

// filterImageFromURL
// helper function to download, filter, and save the filtered image locally
// returns the absolute path to the local image
// INPUTS
//    inputURL: string - a publicly accessible url to an image file
// RETURNS
//    an absolute path to a filtered image locally saved file
export async function filterImageFromURL(inputURL: string): Promise<string> {
  return new Promise(async resolve => {
    const photo = await Jimp.read(inputURL);
    const outpath =
      '/tmp/filtered.' + Math.floor(Math.random() * 2000) + '.jpg';
    await photo
      .resize(256, 256) // resize
      .quality(60) // set JPEG quality
      .greyscale() // set greyscale
      .write(__dirname + outpath, img => {
        resolve(__dirname + outpath);
      });
  });
}

async function pythonReturnedFilePath(inputUrl: string): Promise<string> {
  return new Promise(async resolve => {
    // python imgModifier.py --input /home/phil/projects/udacity/cloudDev/projects/002/cloud-developer/src/util/tmp//kitten-report.jpg
    const args = [`--input`, `${inputUrl}`];
    let returnData: string;
    const pythonFilePath = `${__dirname}/../python/imgModifier.py`;
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

export async function filterImageWithPython(inputURL: string): Promise<string> {
  return new Promise(async resolve => {
    const fileToModify = await download(inputURL, `${__dirname}/tmp/`);
    console.log(fileToModify, 'temp saved here');
    const photoPath: string = await pythonReturnedFilePath(fileToModify);
    resolve(photoPath);
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
