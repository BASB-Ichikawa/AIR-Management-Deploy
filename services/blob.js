var fs = require("fs");
var unzip2 = require('unzip2');
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
            containerName = constants.FLOOR_IMAGE_CONTAINER_NAME;
            break;
    }

    azureHelper.getBlobService().deleteBlobIfExists(containerName, blobName, () => {});
}

exports.preUnZip = preUnZip = async (zipFolderPath) => {
    return new Promise(resolve => {
        fs.access(zipFolderPath, fs.constants.R_OK | fs.constants.W_OK, (error) => {
            if (error) {
                // フォルダが存在しない場合
                if (error.code === "ENOENT") {
                    fs.mkdirSync(zipFolderPath);
                } else {
                    return;
                }
            } else {
                // フォルダが存在する場合
    
                // 解凍先フォルダ配下のファイルを削除
                var targetRemoveFiles = fs.readdirSync(zipFolderPath);
                for (let file in targetRemoveFiles) {
                    fs.unlinkSync(zipFolderPath + targetRemoveFiles[file]);
                }
            }
            
            resolve();
        });
    });
}

exports.findZip = async (houseId, zipName) => {
    const zipFolderPath = './public/models/model' + houseId + '/';

    await preUnZip(zipFolderPath);

    await azureHelper.getContentToFolder(constants.CGMODEL_CONTAINER_NAME, zipFolderPath, zipName + '.zip');

    let objFile = '';
    let mtlFile = '';
    let textureFiles = [];

    return new Promise(resolve => {
        fs.createReadStream(zipFolderPath + zipName + '.zip')
            .pipe(unzip2.Parse())
            .on('entry', function (entry) {
                let fileName = entry.path;       

                if(!fileName.match('__MACOSX/')) {
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
                } 
                
            })
            .on('close', () => {
                resolve({ objFile: objFile, mtlFile: mtlFile, textureFiles: textureFiles });
            });
    });
        
};

exports.deleteZip = async (houseId) => {
    const zipFolderPath = './public/models/model' + houseId + '/';

    // 解凍先フォルダ配下のファイルを削除
    var targetRemoveFiles = fs.readdirSync(zipFolderPath);
    for (let file in targetRemoveFiles) {
        fs.unlinkSync(zipFolderPath + targetRemoveFiles[file]);
    }
}