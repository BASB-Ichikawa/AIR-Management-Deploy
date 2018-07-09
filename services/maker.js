var dbhelper = require('../utilities/dbhelper');

exports.search = async (name) => {
    function execute(name) {
        let connection = dbhelper.getConnection();
        return new Promise(resolve => {
            const query = 'SELECT maker_id, maker_name FROM house_makers WHERE maker_name LIKE ? AND house_makers.is_deleted <> 1';

            connection.query(query, ['%' + name + '%'], (error, results) => {
                resolve(results);
                connection.end();
            });
        });
    };

    return await execute(name);
};

exports.find = async (makerid) => {
    function execute(name, has) {
        let connection = dbhelper.getConnection();
        return new Promise(resolve => {
            const query = 'SELECT * FROM house_makers WHERE maker_id = ? AND is_deleted <> 1';

            connection.query(query, [makerid], (error, results) => {
                resolve(results);
                connection.end();
            });
        });
    };

    return await execute(makerid);
}

exports.houseList = async (makerid) => {
    function execute(name, has) {
        let connection = dbhelper.getConnection();
        return new Promise(resolve => {
            const query = 'SELECT house_id, house_title, created_at FROM houses WHERE maker_id = ? AND is_deleted <> 1';

            connection.query(query, [makerid], (error, results) => {
                resolve(results);
                connection.end();
            });
        });
    };

    return await execute(makerid);
}