var mysql = require('mysql');

exports.getConnection = function () {
    return mysql.createConnection({
        host: 'air-dev2.mysql.database.azure.com',
        user: 'Ichikawa@air-dev2',
        password: 'Password1!',
        database: 'air_db'
    });
}

exports.execute = function(sql) {
    let connection = mysql.createConnection({
        host: 'air-dev2.mysql.database.azure.com',
        user: 'Ichikawa@air-dev2',
        password: 'Password1!',
        database: 'air_db'
    });

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
                    
                    resolve(results);
                    connection.end();
                });
            }
        );

        connection.commit();
    });
};