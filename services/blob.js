var fs = require("fs");
var unzip = require( 'unzip' );
var azureHelper = require('../utilities/azurehelper');
var constants = require('../utilities/constants');
var dbHelper = require('../utilities/dbhelper');

exports.delete = (filename, type) => {
    let blobName = '';
    let containerName = '';

    switch (type) {
        case 'cgModel':
            blobName = filename + '.zip';
            containerName = constants.CGMODEL_CONTAINER_NAME;
            break;
        case 'houseImage':
            blobName = filename + '.jpg';
            containerName = constants.HOUSE_IMAGE_CONTAINER_NAME;
            break;
        case 'floorImage':
            blobName = filename + '.svg';
            containerName = constants.PLAN_IMAGE_CONTAINER_NAME;
            break;
    }

    azureHelper.getBlobService().deleteBlobIfExists(containerName, blobName, () => {});
}


exports.findZip = async (zipName) => {
    const zipFolderPath = '../server/public/model/';

    var targetRemoveFiles = fs.readdirSync(zipFolderPath);
    for (let file in targetRemoveFiles) {
        fs.unlinkSync(zipFolderPath + targetRemoveFiles[file]);
    }
    
    await azureHelper.getContentToFolder(constants.CGMODEL_CONTAINER_NAME, zipFolderPath, zipName + '.zip');

    let objFile = '';
    let mtlFile = '';
    let textureFiles = [];

    return new Promise(resolve => {
        fs.createReadStream(zipFolderPath + zipName + '.zip')
            .pipe(unzip.Parse())
            .on('entry', function (entry) {
                let fileName = entry.path;

                if(fileName.toLowerCase().endsWith("obj") ) {
                    objFile = fileName.replace(zipName + '/', '');
                    entry.pipe(fs.createWriteStream(zipFolderPath + objFile));
                } else if(fileName.toLowerCase().endsWith("mtl") ) {
                    mtlFile = fileName.replace(zipName + '/', '');
                    entry.pipe(fs.createWriteStream(zipFolderPath + mtlFile));
                } else if(fileName.toLowerCase().endsWith("jpg") ) {
                    let texture = fileName.replace(zipName + '/', '');
                    textureFiles.push(texture);
                    entry.pipe(fs.createWriteStream(zipFolderPath + texture));
                } else {
                    entry.autodrain();
                }
                
            })
            .on('close', () => {
                resolve({ objFile: objFile, mtlFile: mtlFile, textureFiles: textureFiles });
            });
    });
        
};
