/*
 * Project: Milestone 1
 * File Name: IOhandler.js
 * Description: Collection of functions for files input/output related operations
 *
 * Created Date:
 * Author:
 *
 */

const yauzl = require("yauzl-promise"),
  fs = require("fs"),
  PNG = require("pngjs").PNG,
  path = require("path"),
    {pipeline} = require("stream/promises");

/**
 * Description: decompress file from given pathIn, write to given pathOut
 *
 * @param {string} pathIn
 * @param {string} pathOut
 * @return {promise}
 */
const unzip =  async (pathIn, pathOut) => {

  const zip = await yauzl.open(pathIn);
  try {
    for await (const entry of zip) {
      if (entry.filename.endsWith('/')) {
        await fs.promises.mkdir(path.join(pathOut,entry.filename), { recursive: true });
      } else {
        const readStream = await entry.openReadStream();
        const writeStream = fs.createWriteStream(
            path.join(pathOut, entry.filename)
        );
        await pipeline(readStream, writeStream);
      }
    }
  } finally {
    console.log("Extraction operation complete")
    await zip.close();
  }
};

/**
 * Description: read all the png files from given directory and return Promise containing array of each png file path
 *
 * @return {promise}
 * @param dir
 */
const readDir = (dir) => {
  console.log("Testing");
  return new Promise((resolve, reject) => {
    fs.readdir(dir, (err, files) => {
      if (err) {
        reject(err);
      } else {
        const pngFiles = files.filter((file) => file.endsWith(".png"));
        resolve(pngFiles);
      }
    });
  });
};

/**
 * Description: Read in png file by given pathIn,
 * convert to grayscale and write to given pathOut
 *
 * @return {promise}
 * @param pathIn
 * @param pathOut
 */
const grayScale = async(pathIn, pathOut) => {
  await fs.createReadStream(pathIn)
      .pipe(
          new PNG({
            filterType: 4,
          })
      )
      .on("parsed", function () {
        for (let y = 0; y < this.height; y++) {
          for (let x = 0; x < this.width; x++) {
            const idx = (this.width * y + x) << 2;
            const avg = (this.data[idx] + this.data[idx + 1] + this.data[idx + 2]) / 3;
            this.data[idx] = avg;
            this.data[idx + 1] = avg;
            this.data[idx + 2] = avg;
          }
        }

        this.pack().pipe(fs.createWriteStream(pathOut));
      });
};
const invert = (pathIn, pathOut) => {
  fs.createReadStream(pathIn)
      .pipe(
          new PNG({
            filterType: 4,
          })
      )
      .on("parsed", function () {
        for (let y = 0; y < this.height; y++) {
          for (let x = 0; x < this.width; x++) {
            const idx = (this.width * y + x) << 2;

            // invert color
            this.data[idx] = 255 - this.data[idx];
            this.data[idx + 1] = 255 - this.data[idx + 1];
            this.data[idx + 2] = 255 - this.data[idx + 2];

            // and reduce opacity
            this.data[idx + 3] = this.data[idx + 3] >> 1;
          }
        }

        this.pack().pipe(fs.createWriteStream(pathOut));
      });
};

module.exports = {
  unzip,
  readDir,
  grayScale,
  invert,
};
