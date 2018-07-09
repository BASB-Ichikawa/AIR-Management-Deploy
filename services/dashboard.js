var dbhelper = require('../utilities/dbhelper');

exports.getCreatedHouseNumByWeek = async () => {
    function execute() {
        let connection = dbhelper.getConnection();
        return new Promise(resolve => {
            const query = 'SELECT DATE_FORMAT(created_at, "%w") as date, COUNT(*) as count FROM houses GROUP BY DATE_FORMAT(created_at, "%w");';

            connection.query(query, [], (error, results) => {
                resolve(results);
                connection.end();
            });
        });
    };

    return await execute();
};

exports.getCreatedHouseNumByMonth = async () => {
    function execute() {
        let connection = dbhelper.getConnection();
        return new Promise(resolve => {
            const query = 'SELECT DATE_FORMAT(created_at, "%w") as date, COUNT(*) as count FROM houses GROUP BY DATE_FORMAT(created_at, "%w");';

            connection.query(query, [], (error, results) => {
                resolve(results);
                connection.end();
            });
        });
    };

    return await execute();
};
