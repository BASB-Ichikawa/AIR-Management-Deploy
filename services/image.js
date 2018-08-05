var mysql = require('mysql');
var dbHelper = require('../utilities/dbhelper');

exports.findPlan = async (houseId) => {

    const query = 'SELECT floor_plan_image FROM floor_plan_image WHERE house_id = ? ORDER BY house_id;';

    var params = [
        parseInt(houseId),
    ]
                
    var sql = mysql.format(query, params);

    return await dbHelper.execute(sql);
};

exports.findHouse = async (houseId) => {

    const query = 'SELECT house_image FROM house_image WHERE house_id = ? ORDER BY house_id;';

    var params = [
        parseInt(houseId),
    ]
                
    var sql = mysql.format(query, params);

    return await dbHelper.execute(sql);
};

exports.exist = async (houseId, oldData, type) => {
    let query = '';
    let params = [];

    switch (type) {
        case 'cgModel':
            query = 'SELECT COUNT(*) AS Count FROM houses WHERE house_id = ? AND house_3d_data = ?;';
            params = [houseId, oldData];
            break;
        case 'houseImage':
            query = 'SELECT COUNT(*) AS Count FROM house_image WHERE house_id = ? AND house_image = ?;';
            params = [houseId, oldData];
            break;
        case 'floorImage':
            query = 'SELECT COUNT(*) AS Count FROM floor_plan_image WHERE house_id = ? AND floor_plan_image = ?;';
            params = [houseId, oldData];
            break;
    }
                
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
