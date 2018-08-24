var mysql = require('mysql');
var constants = require('../utilities/constants');

const getConnection = () => {
    return mysql.createConnection({
        host: constants.DB_URL,
        user: constants.DB_USER,
        password: constants.DB_PASS,
        database: constants.DB_NAME,
        multipleStatements: true
    });
}

exports.execute = (sql) => {
    const connection = getConnection();

    return new Promise((resolve, rejected) => {
        connection.query(sql, (error, results) => {
            if (error) { 
                console.debug('エラー情報:' + error);
                console.debug('エラーSQL:' + sql);

                connection.end();
                rejected();
            }  
            
            connection.end();
            resolve(results);
        });
        
    });
};

