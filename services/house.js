var mysql = require('mysql');
var fs = require("fs");

var dbHelper = require('../utilities/dbhelper');
var azureHelper = require('../utilities/azurehelper');
var constants = require('../utilities/constants');

const folderPath = './uploads/'

exports.search = (name, has) => {
    const query = 'SELECT house_id, house_code, house_makers.maker_id, maker_name FROM houses ' + 
                  'JOIN house_makers ON houses.maker_id = house_makers.maker_id ' + 
                  'WHERE house_code LIKE ? AND houses.is_deleted = 0';

    let sql = mysql.format(query, ['%' + name + '%']);

    return dbHelper.execute(sql);
};

exports.find = (houseId) => {
    const query = 'SELECT * FROM houses WHERE house_id = ? AND houses.is_deleted = 0';

    let sql = mysql.format(query, [houseId]);

    return dbHelper.execute(sql);
};

exports.findPath = (houseId) => {
    const query = 'SELECT house_3d_data FROM houses WHERE house_id = ? AND houses.is_deleted = 0';
    let sql = mysql.format(query, [houseId]);

    return dbHelper.execute(sql);
};

exports.checkDuplecate = (houseCode) => {
    const query = 'SELECT COUNT(house_code) AS count FROM houses WHERE house_code = ?';
    let sql = mysql.format(query, [houseCode]);

    return dbHelper.execute(sql);
}

exports.edit = (house) => {

    const query = 
        'UPDATE houses SET ' + 
            'house_code = ?,' +
            'maker_id = ?,' +
            'house_title = ?,' + 
            'house_name = ?,' +
            'basic_info = ?,' + 
            'feature = ?,' + 
            'floor_size = ?,' + 
            'total_floa_size = ?,' + 
            'construction = ?,' + 
            'amount = ?,' + 
            'front_door_direction = ?,' + 
            'house_direction = ?,' + 
            'foundation = ?,' + 
            'roof = ?,' + 
            'outer_wall = ?,' + 
            'front_door = ?,' + 
            'external_fitting = ?,' + 
            'material = ?,' + 
            'heat_insulation = ?,' + 
            'kitchen = ?,' + 
            'wash_stand = ?,' + 
            'unit_bath = ?,' + 
            'toilet = ?,' + 
            'interior_door = ?,' + 
            'floor_material = ?,' + 
            'water_heater = ?,' +
            'entrance_strage = ?,' +
            'cup_board = ?,' +
            'vr_page_url = ?,' +
            'house_page_url = ?,' +
            'staff = ?, ' +
            'updated_at = ? ' +
        'WHERE house_id = ?';

    var params = [
        house.houseCode,
        parseInt(house.makerId),
        house.houseTitle,
        house.houseName,
        house.basicInfo,
        house.feature,
        parseFloat(house.floorSize),
        parseFloat(house.totalFloaSize),
        house.construction,
        parseFloat(house.amount),
        parseInt(house.doorDirection),
        parseInt(house.houseDirection),
        house.foundation,
        house.roof,
        house.outerWall,
        house.frontDoor,
        house.externalFitting,
        house.material,
        house.heatInsulation,
        house.kitchen,
        house.washStand,
        house.unitBath,
        house.toilet,
        house.interiorDoor,
        house.floorMaterial,
        house.waterHeater,
        house.entranceStrage,
        house.cupBoard,
        house.vrPageUrl,
        house.housePageUrl,
        house.staff,
        new Date(),
        parseInt(house.houseId),
    ]
                
    var sql = mysql.format(query, params);

    return dbHelper.execute(sql);
};

exports.create = (house) => {
    
    var params = [
        house.houseCode,
        parseInt(house.makerId),
        house.houseTitle,
        house.houseName,
        house.basicInfo,
        house.feature,
        parseFloat(house.floorSize),
        parseFloat(house.totalFloaSize),
        house.construction,
        parseFloat(house.amount),
        parseInt(house.doorDirection),
        parseInt(house.houseDirection),
        house.foundation,
        house.roof,
        house.outerWall,
        house.frontDoor,
        house.externalFitting,
        house.material,
        house.heatInsulation,
        house.kitchen,
        house.washStand,
        house.unitBath,
        house.toilet,
        house.interiorDoor,
        house.floorMaterial,
        house.waterHeater,
        house.entranceStrage,
        house.cupBoard,
        house.vrPageUrl,
        house.housePageUrl,
        house.staff,
        0,
        new Date(),
    ]

    let query = 
        'INSERT INTO houses ' + 
        '(house_code, maker_id, house_title, house_name, basic_info, feature, floor_size, total_floa_size, ' + 
        'construction, amount, front_door_direction, house_direction, foundation, roof, ' + 
        'outer_wall, front_door, external_fitting, material, heat_insulation, ' + 
        'kitchen, wash_stand, unit_bath, toilet, interior_door, floor_material, water_heater, ' + 
        'entrance_strage, cup_board, vr_page_url, house_page_url, staff, is_deleted, created_at) ' + 
        'VALUES(';
        
    let questions = [];
    for(let i=0; i < params.length; i++) {
        questions.push('?');
    }
    query += questions.join(',') + ');';

    var sql = mysql.format(query, params);

    return dbHelper.execute(sql);
};

exports.uploadByEdit = (file, oldData, type) => {
    let physicalName = '';
    let containerName = '';
    let option = {};
    const fullPath = folderPath + file.filename;

    switch (type) {
        case 'cgModel':
            physicalName = file.filename + '.zip';
            containerName = constants.CGMODEL_CONTAINER_NAME;
            oldData += '.zip';
            option = { contentSettings: {contentType: 'application/octet-stream'} };
            break;
        case 'houseImage':
            physicalName = file.filename + '.jpg';
            containerName = constants.HOUSE_IMAGE_CONTAINER_NAME;
            oldData += '.jpg';
            option = { contentSettings: {contentType: 'image/jpeg'} };
            break;
        case 'floorImage':
            physicalName = file.filename + '.svg';
            containerName = constants.PLAN_IMAGE_CONTAINER_NAME;
            oldData += '.svg';
            option = { contentSettings: {contentType: 'image/svg+xml'} };
            break;
    }

    const execute = () => {
        return new Promise(resolve => {
            // クラウド内の既存データファイルを削除
            azureHelper.getBlobService().deleteBlobIfExists(containerName, oldData, (error, result, response) => {
                if(error) {
                    throw error;
                }
            });

            azureHelper.getBlobService().createBlockBlobFromLocalFile(containerName, physicalName, fullPath, option, (error, result, response) => {

                // 一時ファイルを削除
                fs.unlink(fullPath, (error) => {
                    if(error) {
                        throw error;
                    }
                });

                resolve();
            });

        });
    };

    return execute();
};

exports.uploadedByEdit = (houseId, oldData, newImage, type, orderNo) => {

    let query = '';
    let params = [];

    switch (type) {
        case 'cgModel':
            query = 'UPDATE houses SET house_3d_data = ?, updated_at = ? WHERE house_id = ?;';
            params = [newImage, new Date(), houseId];
            break;
        case 'houseImage':
            query = 'UPDATE house_image SET house_image = ?, display_order = ?, updated_at = ? WHERE house_id = ? AND house_image = ?;';
            params = [newImage, orderNo, new Date(), houseId, oldData];
            break;
        case 'floorImage':
            query = 'UPDATE floor_plan_image SET floor_plan_image = ?, display_order = ?, updated_at = ? WHERE house_id = ? AND floor_plan_image = ?;';
            params = [newImage, orderNo, new Date(), houseId, oldData];
            break;
    }
                
    let sql = mysql.format(query, params);

    return dbHelper.execute(sql);
};

exports.uploadByCreate = (file, type) => {
    let physicalName = '';
    let containerName = '';
    let option = {};
    const fullPath = folderPath + file.filename;

    switch (type) {
        case 'cgModel':
            physicalName = file.filename + '.zip';
            containerName = constants.CGMODEL_CONTAINER_NAME;
            option = { contentSettings: {contentType: 'application/octet-stream'} };
            break;
        case 'houseImage':
            physicalName = file.filename + '.jpg';
            containerName = constants.HOUSE_IMAGE_CONTAINER_NAME;
            option = { contentSettings: {contentType: 'image/jpeg'} };
            break;
        case 'floorImage':
            physicalName = file.filename + '.svg';
            containerName = constants.PLAN_IMAGE_CONTAINER_NAME;
            option = { contentSettings: {contentType: 'image/svg+xml'} };
            break;
    }

    const execute = () => {
        return new Promise(resolve => {
            azureHelper.getBlobService().createBlockBlobFromLocalFile(containerName, physicalName, fullPath, option, (error, result, response) => {
                // 一時ファイルを削除
                fs.unlink(fullPath, (error) => {
                    if(error) {
                        throw error;
                    }
                });

                resolve(file.filename);
            });

        });
    };

    return execute();
};

exports.uploadedByCreate = (houseId, newImage, type, orderNo) => {
    let query = '';
    let params = [];

    switch (type) {
        case 'cgModel':
            query = 'UPDATE houses SET house_3d_data = ?, updated_at = ? WHERE house_id = ?';
            params = [newImage, new Date(), houseId];
            break;
        case 'houseImage':
            query = 'INSERT INTO house_image(house_image, house_id, display_order, created_at) VALUES (?,?,?,?) ';
            params = [newImage, houseId, orderNo, new Date()];
            break;
        case 'floorImage':
            query = 'INSERT INTO floor_plan_image(floor_plan_image, house_id, display_order, created_at) VALUES (?,?,?,?) ';
            params = [newImage, houseId, orderNo, new Date()];
            break;
    }
            
    let sql = mysql.format(query, params);

    return dbHelper.execute(sql);
};

exports.delete = (houseId) => {
    const query1 = 'UPDATE houses SET is_deleted = 1 WHERE house_id = ?;';
    let sql1 = mysql.format(query1, [houseId]);
    dbHelper.execute(sql1);

    const query2 = 'DELETE FROM house_tag_map WHERE house_id = ?;';
    let sql2 = mysql.format(query2, [houseId]);
    dbHelper.execute(sql2);

    const query3 = 'DELETE FROM house_image WHERE house_id = ?;';
    let sql3 = mysql.format(query3, [houseId]);
    dbHelper.execute(sql3);

    const query4 = 'DELETE FROM floor_plan_image WHERE house_id = ?;';
    let sql4 = mysql.format(query4, [houseId]);
    dbHelper.execute(sql4);

    const query5 = 'DELETE FROM purchasable_area WHERE house_id = ?;';
    let sql5 = mysql.format(query5, [houseId]);
    dbHelper.execute(sql5);
    
}

exports.deleteBlob = (filename, type) => {
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