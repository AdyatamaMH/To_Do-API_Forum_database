const mysql = require('mysql');

const db_config = {
    'host': '127.0.0.1',
    'user': 'root',
    'password': 'Labmda767',
    'database': 'todoschema'
};

let connection;

function handleDisconnect() {
    connection = mysql.createConnection(db_config);

    connection.connect(function(err) {
        if(err) {
            console.error('Error connecting to MySQL:', err);
            setTimeout(handleDisconnect, 2000);
        }
        console.log('Connected to MySQL database');
    });

    connection.on('error', function(err) {
        console.error('MySQL error:', err);
        if(err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.log('Reconnecting to MySQL...');
            handleDisconnect();
        } else {
            throw err;
        }
    });
}

handleDisconnect();

module.exports = connection;
