var mysql = require('mysql');
var dbhelper = require('../utilities/dbhelper');

exports.exist = async (tagId, houseId) => {

    const query = 'SELECT COUNT(*) AS Count FROM house_tags_map WHERE house_id = ? AND tag_id = ?;';

    var params = [
        parseInt(houseId),
        parseInt(tagId),
    ]
                
    var sql = mysql.format(query, params);
    //console.log(sql);

    function execute() {
        let connection = dbhelper.getConnection();

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

exports.find = async (houseid) => {
    function execute() {
        let connection = dbhelper.getConnection();

        return new Promise(resolve => {
            const query = 'SELECT * FROM house_tags_map WHERE house_id = ? ORDER BY tag_id;';

            connection.query(query, [houseid], (error, results) => {
                resolve(results);
                connection.end();
            });
        });
    };

    return await execute();
};

exports.insert = async (star, tagId, houseId) => {

    const query = 'INSERT INTO house_tags_map (house_id, tag_id, tag_score)VALUES(?,?,?);';

    var params = [
        parseInt(houseId),
        parseInt(tagId),
        parseInt(star),
    ]
                
    var sql = mysql.format(query, params);
    //console.log(sql);

    function execute() {
        let connection = dbhelper.getConnection();

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

                resolve(results);
                connection.end();
            });

            connection.commit();
        });
    };

    return await execute();
};


exports.edit = async (star, tagId, houseId) => {

    const query = 'UPDATE house_tags_map SET tag_score = ? WHERE house_id = ? AND tag_id = ?';

    var params = [
        parseInt(star),
        parseInt(houseId),
        parseInt(tagId),
    ]
                
    var sql = mysql.format(query, params);
    //console.log(sql);

    function execute() {
        let connection = dbhelper.getConnection();

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

                resolve(results);
                connection.end();
            });

            connection.commit();
        });
    };

    return await execute();
};

