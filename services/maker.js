var mysql = require('mysql');
var dbHelper = require('../utilities/dbhelper');

exports.search = (name) => {
    const query = 'SELECT maker_id, maker_name FROM house_makers WHERE maker_name LIKE ? AND house_makers.is_deleted = 0';
    let sql = mysql.format(query, ['%' + name + '%']);

    return dbHelper.execute(sql);
};

exports.find = (makerid) => {
    const query = 'SELECT * FROM house_makers WHERE maker_id = ? AND is_deleted = 0';
    let sql = mysql.format(query, [makerid]);

    return dbHelper.execute(sql);
}

exports.houseList = (makerid) => {
    const query = 'SELECT house_id, house_code, created_at FROM houses WHERE maker_id = ? AND is_deleted = 0';
    let sql = mysql.format(query, [makerid]);

    return dbHelper.execute(sql);
}