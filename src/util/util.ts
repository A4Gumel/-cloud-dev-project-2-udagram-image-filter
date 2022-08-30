import fs from "fs";
import Jimp = require("jimp");
import multer from "multer";
import path from "path";
import axios from "axios";

// filterImageFromURL
// helper function to download, filter, and save the filtered image locally
// returns the absolute path to the local image
// INPUTS
//    inputURL: string - a publicly accessible url to an image file
// RETURNS
//    an absolute path to a filtered image locally saved file
export async function filterImageFromURL(inputURL: string): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      const photo = await Jimp.read(inputURL);
      const outpath =
        "/tmp/filtered." + Math.floor(Math.random() * 2000) + ".jpg";
      await photo
        .resize(256, 256) // resize
        .quality(60) // set JPEG quality
        .greyscale() // set greyscale
        .write(__dirname + outpath, (img) => {
          resolve(__dirname + outpath);
        });
    } catch (error) {
      reject(error);
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

export const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    let filetype = "";

    if (IMAGE_FORMATS.includes(file.mimetype)) {
      filetype = file.mimetype.split("/")[1];
    }

    cb(null, "my-image-" + Math.floor(Math.random() * 2000) + "." + filetype);
  },
});


export function fileFilter(req: any, file: any, cb: any) {
  if (!file || !isRealFileExt(path.extname(file.originalname))) {
    cb(null, false);
  } else {
    cb(null, true);
  }
}

// Image formats
export const IMAGE_FORMATS = [
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/tiff",
  "image/bmp",
];

// Image extensions
export const FILE_EXTENSIONS = [
  ".gif",
  ".jpeg",
  ".png",
  ".tiff",
  ".bmp",
];


export async function imageExists(imageUrl: string) {
  let exists;

  try {
    const response = await axios.head(imageUrl);
    exists =
      response.status === 200 &&
      isImageFormat(response.headers["content-type"]);
  } catch (e) {
    exists = false;
  }

  return exists;
}


//Validate Real File Extension
export function isRealFileExt(fileExt: string) {
  return FILE_EXTENSIONS.includes(fileExt);
}

// Validate image format
function isImageFormat(format: string) {
  return IMAGE_FORMATS.includes(format);
}


// temporary files
export function getTempFiles() {
  return getDirectoryContent(path.join(__dirname, "tmp")).map((file) => {
    return path.join(__dirname, "tmp", file);
  });
}


// directories arrays
function getDirectoryContent(directoryPath: string) {
  return fs.readdirSync(directoryPath);
}