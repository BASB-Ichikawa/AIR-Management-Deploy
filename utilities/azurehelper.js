var azure = require('azure-storage');
var constants = require('./constants');

const getBlobService = exports.getBlobService = function () {
    return azure.createBlobService(constants.STORAGE_ACCOUNT, constants.ACCESS_KEY);
}

exports.getContentToFolder = (containerName, folderPath, blobName) => {
    return new Promise(resolve => {
        const service = getBlobService();
        service.getBlobToLocalFile(containerName, blobName, folderPath + blobName, error => {
            if(error) {
                throw error;
            } else {
                resolve();
            }
        });
    });
}

