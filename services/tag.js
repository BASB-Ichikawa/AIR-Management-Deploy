var mysql = require('mysql');
var dbHelper = require('../utilities/dbhelper');

exports.exist = async (tagId, houseId) => {

    const query = 'SELECT COUNT(*) AS Count FROM house_tags_map WHERE house_id = ? AND tag_id = ?;';

    var params = [
        parseInt(houseId),
        parseInt(tagId),
    ]
                
    var sql = mysql.format(query, params);

    function execute() {
        let connection = dbHelper.getConnection();

        return new Promise(resolve => {
            connection.query(sql, 
                (error, results) => {
                    if (error) { 
                        connection.rollback(() => {
                            throw error;
                        });
                    }  
                    
                    connection.commit((error2) => {
                        if (error2) { 
                            connection.rollback(() => {
                            throw error2;
                        });
                    }
                });

                resolve(results[0].Count);
                connection.end();
            });

            connection.commit();
        });
    };

    return await execute();
};

exports.findStar = async (houseid) => {
    const query = 'SELECT * FROM house_tags_map JOIN house_tags on house_tags_map.tag_id = house_tags.tag_id WHERE house_id = ? AND house_tags.input_type = 1 ORDER BY house_tags_map.tag_id;'
    let sql = mysql.format(query, [houseid]);

    return await dbHelper.execute(sql);
};

exports.findDDL = async (houseid) => {
    const query = 'SELECT house_tags_map.tag_id, tag_score FROM house_tags_map JOIN house_tags on house_tags_map.tag_id = house_tags.tag_id WHERE house_id = ? AND house_tags.input_type = 2 ORDER BY house_tags_map.tag_id;'
    let sql = mysql.format(query, [houseid]);

    return await dbHelper.execute(sql);
};

exports.findRadio = async (houseid) => {
    const query = 'SELECT house_tags_map.tag_id, tag_score FROM house_tags_map JOIN house_tags on house_tags_map.tag_id = house_tags.tag_id WHERE house_id = ? AND house_tags.input_type = 3 ORDER BY house_tags_map.tag_id;'
    let sql = mysql.format(query, [houseid]);

    return await dbHelper.execute(sql);
};

exports.insert = async (star, tagId, houseId) => {

    const query = 'INSERT INTO house_tags_map (house_id, tag_id, tag_score)VALUES(?,?,?);';

    var params = [
        parseInt(houseId),
        parseInt(tagId),
        parseInt(star),
    ]
                
    var sql = mysql.format(query, params);

    return await dbHelper.execute(sql);
};


exports.edit = async (star, tagId, houseId) => {

    const query = 'UPDATE house_tags_map SET tag_score = ? WHERE house_id = ? AND tag_id = ?';

    var params = [
        parseInt(star),
        parseInt(houseId),
        parseInt(tagId),
    ]
                
    var sql = mysql.format(query, params);

    return await dbHelper.execute(sql);
};

