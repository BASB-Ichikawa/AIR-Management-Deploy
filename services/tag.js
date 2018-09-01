var mysql = require('mysql');
var dbHelper = require('../utilities/dbhelper');

exports.exist = async (tagId, houseId) => {

    const query = 'SELECT COUNT(*) AS Count FROM house_tag_map WHERE house_id = ? AND tag_id = ?;';

    var params = [
        parseInt(houseId),
        parseInt(tagId),
    ]
                
    var sql = mysql.format(query, params);
    let results = await dbHelper.execute(sql);

    return results[0].Count;
};

exports.findStar = (houseid) => {
    const query = 'SELECT * FROM house_tag_map JOIN house_tags on house_tag_map.tag_id = house_tags.tag_id WHERE house_id = ? AND house_tags.input_type = 1 ORDER BY house_tag_map.tag_id;'
    let sql = mysql.format(query, [houseid]);

    return dbHelper.execute(sql);
};

exports.findDDL = (houseid) => {
    const query = 'SELECT house_tag_map.tag_id, tag_score FROM house_tag_map JOIN house_tags on house_tag_map.tag_id = house_tags.tag_id WHERE house_id = ? AND house_tags.input_type = 2 ORDER BY house_tag_map.tag_id;'
    let sql = mysql.format(query, [houseid]);

    return dbHelper.execute(sql);
};

exports.findRadio = (houseid) => {
    const query = 'SELECT house_tag_map.tag_id, tag_score FROM house_tag_map JOIN house_tags on house_tag_map.tag_id = house_tags.tag_id WHERE house_id = ? AND house_tags.input_type = 3 ORDER BY house_tag_map.tag_id;'
    let sql = mysql.format(query, [houseid]);

    return dbHelper.execute(sql);
};

exports.insert = (tagScore, tagId, houseId) => {
    const query = 'INSERT INTO house_tag_map (house_id, tag_id, tag_score)VALUES(?,?,?);';

    var params = [
        parseInt(houseId),
        parseInt(tagId),
        parseInt(tagScore),
    ]
                
    var sql = mysql.format(query, params);

    return dbHelper.execute(sql);
};

exports.inserts = (insertTags) => {
    let query = 'INSERT INTO house_tag_map (house_id, tag_id, tag_score) VALUES ';
    let params = [];
    let paramStr = [];

    for(let i=0; i < insertTags.length; i++) {
        paramStr.push('(?)');
        params.push(
            [parseInt(insertTags[i].houseId), parseInt(insertTags[i].tagId), parseInt(insertTags[i].tagScore)]
        );
    }
               
    query += paramStr.join(',') + ';';
    var sql = mysql.format(query, params);
    
    return dbHelper.execute(sql);
};


exports.edit = (tagScore, tagId, houseId) => {
    const query = 'UPDATE house_tag_map SET tag_score = ? WHERE house_id = ? AND tag_id = ?';

    var params = [
        parseInt(tagScore),
        parseInt(houseId),
        parseInt(tagId),
    ]
                
    var sql = mysql.format(query, params);

    return dbHelper.execute(sql);
};

exports.edits = (updateTags) => {
    let query = '';
    let params = [];
    
    for(let i=0; i < updateTags.length; i++) {
        query += 'UPDATE house_tag_map SET tag_score = ? WHERE house_id = ? AND tag_id = ?;';
        params.push(parseInt(updateTags[i].tagScore));
        params.push(parseInt(updateTags[i].houseId));
        params.push(parseInt(updateTags[i].tagId));
    }
                
    var sql = mysql.format(query, params);

    return dbHelper.execute(sql);
};

exports.updates = (tagIds, tagScores, houseId) => {
    let query = 'INSERT INTO house_tag_map (house_id, tag_id, tag_score) VALUES ';
    let params = [];
    let paramStr = [];

    for(let i=0; i < tagIds.length; i++) {
        paramStr.push('(?)');
        params.push(
            [parseInt(houseId), parseInt(tagIds[i]), parseInt(tagScores[i])]
        );
    }
               
    query += paramStr.join(',') + ';';
    var sql = mysql.format(query, params);
    
    return dbHelper.execute(sql);
}

exports.delete = (houseId, tagIds) => {
    let query = 'DELETE FROM house_tag_map WHERE house_id = ? AND (';
    var params = [
        parseInt(houseId),
    ]

    let conditions = [];
    tagIds.map(tagId => {
        conditions.push('tag_id = ?');
        params.push(tagId);
    });

    query += conditions.join(' OR ');
    query += ');'
                
    var sql = mysql.format(query, params);
    
    return dbHelper.execute(sql);
};