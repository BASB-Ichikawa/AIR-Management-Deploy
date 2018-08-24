var mysql = require('mysql');
var dbHelper = require('../utilities/dbhelper');

exports.searchTags = (name) => {
    const query = 'SELECT * FROM house_tags WHERE input_type = 1 ORDER BY tag_id;';
    var sql = mysql.format(query, []);

    return dbHelper.execute(sql);
};

exports.searchDDLs = (name) => {
    const query = 'SELECT * FROM house_tags WHERE input_type = 2 ORDER BY tag_id;';
    var sql = mysql.format(query, []);

    return dbHelper.execute(sql);
};

exports.searchRadios = (name) => {
    const query = 'SELECT * FROM house_tags WHERE input_type = 3 ORDER BY tag_id;';
    var sql = mysql.format(query, []);

    return dbHelper.execute(sql);
};
