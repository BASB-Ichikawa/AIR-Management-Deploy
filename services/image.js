var mysql = require('mysql');
var dbHelper = require('../utilities/dbhelper');

exports.findPlan = (houseId) => {

    const query = 'SELECT floor_plan_image FROM floor_plan_image WHERE house_id = ? ORDER BY display_order;';

    var params = [
        parseInt(houseId),
    ]
                
    var sql = mysql.format(query, params);

    return dbHelper.execute(sql);
};

exports.findHouse = (houseId) => {

    const query = 'SELECT house_image FROM house_image WHERE house_id = ? ORDER BY display_order;';

    var params = [
        parseInt(houseId),
    ]
                
    var sql = mysql.format(query, params);

    return dbHelper.execute(sql);
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
    let results = await dbHelper.execute(sql);

    return results[0].Count;
};
