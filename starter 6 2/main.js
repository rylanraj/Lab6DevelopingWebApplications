const path = require("path");
/*
 * Project: Milestone 1
 * File Name: main.js
 * Description:
 *
 * Created Date:
 * Author:
 *
 */

const IOhandler = require("./IOhandler");
const zipFilePath = path.join(__dirname, "myfile.zip");
const pathUnzipped = path.join(__dirname, "unzipped");
const pathProcessedInverted = path.join(__dirname, "inverted");
const pathProcessedGrayscale = path.join(__dirname, "grayscaled");

async function main(){
    // await IOhandler.unzip(zipFilePath, pathUnzipped);
    const pngFiles = await IOhandler.readDir(pathUnzipped);
    console.log(pngFiles);

    for (const file of pngFiles){
        await IOhandler.grayScale(path.join(pathUnzipped, file), path.join(pathProcessedGrayscale, file));
    }
    // await IOhandler.invert("unzipped/in.png", "inverted/out.png");
}

main();