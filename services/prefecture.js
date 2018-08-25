var mysql = require('mysql');
var dbHelper = require('../utilities/dbhelper');

exports.find = (houseId) => {
    const query = 'SELECT prefecture_id FROM purchasable_area WHERE house_id = ? ORDER BY prefecture_id;';

    let params = [
        parseInt(houseId),
    ]
                
    let sql = mysql.format(query, params);

    return dbHelper.execute(sql);
};

exports.update = (prefectureId, houseId) => {
    const query = 'INSERT INTO purchasable_area (house_id, prefecture_id, created_at) VALUES (?,?,?);';

    let params = [
        parseInt(houseId),
        parseInt(prefectureId),
        new Date(),
    ]
                
    let sql = mysql.format(query, params);

    return dbHelper.execute(sql);
};

exports.updates = (prefectures, houseId) => {
    let query = 'INSERT INTO purchasable_area (house_id, prefecture_id, created_at) VALUES ';
    let params = [];
    let paramStr = [];

    for(let i=0; i < prefectures.length; i++) {
        if(prefectures[i].toLowerCase() === "true") {
            paramStr.push('(?)');
            params.push(
                [parseInt(houseId), parseInt(i+1), new Date()]
            );
        }
    }

    if(!paramStr.length) {
        // 1都道府県も選択されていない場合
        return;
    }

    query += paramStr.join(',') + ';';
    let sql = mysql.format(query, params);
    
    return dbHelper.execute(sql);
};

exports.delete = (houseId) => {
    const query = 'DELETE FROM purchasable_area WHERE house_id = ? AND id <> 0;';

    var params = [
        parseInt(houseId),
    ]
                
    var sql = mysql.format(query, params);
    
    return dbHelper.execute(sql);
};