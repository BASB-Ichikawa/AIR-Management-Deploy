var mysql = require('mysql');
var dbHelper = require('../utilities/dbhelper');

exports.find = async (houseId) => {

    const query = 'SELECT prefecture_id FROM purchasable_area WHERE house_id = ? ORDER BY prefecture_id;';

    let params = [
        parseInt(houseId),
    ]
                
    let sql = mysql.format(query, params);

    return await dbHelper.execute(sql);
};

exports.update = async (prefectureId, houseId) => {

    const query = 'INSERT INTO purchasable_area (house_id, prefecture_id, created_at) VALUES (?,?,?);';

    let params = [
        parseInt(houseId),
        parseInt(prefectureId),
        new Date(),
    ]
                
    let sql = mysql.format(query, params);

    return await dbHelper.execute(sql);
};

exports.delete = async (houseId) => {

    const query = 'DELETE FROM purchasable_area WHERE house_id = ? AND id <> 0;';

    var params = [
        parseInt(houseId),
    ]
                
    var sql = mysql.format(query, params);

    return await dbHelper.execute(sql);
};