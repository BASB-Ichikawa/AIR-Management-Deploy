var azure = require('azure-storage');
var accessKey = 'qzkFDaotL9SPh8dkCiL+AXMoCdRUzEYuoZBYm6Pw8WzpZjtUfMqsPcX8XIjR3kRvkofyj3i+LnCbG18tiEXLIw==';
var storageAccount = 'airdev2';

const getBlobService = exports.getBlobService = function () {
    return azure.createBlobService(storageAccount, accessKey);
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

