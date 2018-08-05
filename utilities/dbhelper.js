var mysql = require('mysql');
var constants = require('../utilities/constants');

const getConnection = exports.getConnection = function () {
    return mysql.createConnection({
        host: constants.DB_URL,
        user: constants.DB_USER,
        password: constants.DB_PASS,
        database: constants.DB_NAME
    });
}

exports.execute = function(sql) {
    return new Promise(resolve => {
        const connection = getConnection();
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