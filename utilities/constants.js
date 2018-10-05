
if(process.env.NODE_ENV === 'production') {
    /*******************************************
    * BLOB情報
    *******************************************/
    exports.ACCESS_KEY = 'Xt7F0O2oAUTFjVWhntX4h1Bx7mgt0/O0JzCQsN3BywClyVzv52bMo2mLjOOV5LYIPgl5y9exCa2OK14ds6coUw==';
    exports.STORAGE_ACCOUNT = 'airblob';
    exports.CGMODEL_CONTAINER_NAME = 'test-house3dmodel';
    exports.HOUSE_IMAGE_CONTAINER_NAME = 'test-houseimage';
    exports.FLOOR_IMAGE_CONTAINER_NAME = 'test-floorimage';

    /*******************************************
     * 認証情報
    *******************************************/
    exports.AUTH_API_URL = 'https://air-api-jb.azurewebsites.net/air/api/v1/tool/auth/login';

    /*******************************************
    * DB情報
    *******************************************/
    exports.DB_URL = 'air-mysql-server.mysql.database.azure.com';
    exports.DB_USER = 'air-db-admin@air-mysql-server'
    exports.DB_PASS = 'jibunhouse-Project-2018'
    exports.DB_NAME = 'air_db';
    
} else {
    /*******************************************
    * BLOB情報
    *******************************************/
    exports.ACCESS_KEY = 'qzkFDaotL9SPh8dkCiL+AXMoCdRUzEYuoZBYm6Pw8WzpZjtUfMqsPcX8XIjR3kRvkofyj3i+LnCbG18tiEXLIw==';
    exports.STORAGE_ACCOUNT = 'airdev2';
    exports.CGMODEL_CONTAINER_NAME = 'house3dmodel';
    exports.HOUSE_IMAGE_CONTAINER_NAME = 'houseimage';
    exports.FLOOR_IMAGE_CONTAINER_NAME = 'floorimage';

    /*******************************************
     * 認証情報
    *******************************************/
    exports.AUTH_API_URL = 'https://air-api-test-jb.azurewebsites.net/air/api/v1/tool/auth/login';

    /*******************************************
    * DB情報
    *******************************************/
    exports.DB_URL = 'air-mysql-test-server.mysql.database.azure.com';
    exports.DB_USER = 'air-db-admin@air-mysql-test-server'
    exports.DB_PASS = 'jibunnhouse-Project-2018'
    exports.DB_NAME = 'air_db';

    // Hacoya開発用
    // exports.DB_URL = 'air-dev2.mysql.database.azure.com';
    // exports.DB_USER = 'Ichikawa@air-dev2';
    // exports.DB_PASS = 'Password1!';
    // exports.DB_NAME = 'air_db'; 
}

