var dbhelper = require('../utilities/dbhelper');

exports.searchTags = async (name) => {
    function execute() {
        let connection = dbhelper.getConnection();
        return new Promise(resolve => {
            const query = 'SELECT * FROM house_tags ORDER BY tag_id;';

            connection.query(query, [], (error, results) => {
                resolve(results);
                connection.end();
            });
        });
    };

    return await execute();
};
