var azure = require('azure-storage');
var accessKey = 'qzkFDaotL9SPh8dkCiL+AXMoCdRUzEYuoZBYm6Pw8WzpZjtUfMqsPcX8XIjR3kRvkofyj3i+LnCbG18tiEXLIw==';
var storageAccount = 'airdev2';

exports.getBlobService = function () {
    return azure.createBlobService(storageAccount, accessKey);
}

