const mariadb = require('mysql2/promise');

class DatabaseManager {

    constructor(config) {

        this.config = config;
        this.connection = null;
    }

    async connect() {

        this.connection = await mariadb.createConnection(this.config);
        console.log("DB Connected!");
    }

    isConnected() {

        return this.connection != null;
    }

    async run(sql, params = []) {

        let result = { rows: [], columns:[] };
        if(!this.connection) 
            throw new Error('DB Not Connected!');

        const [rows,columns] = await this.connection.execute(sql, params);
        result.rows = rows;
        result.columns = columns;
        return result;
    }

    async close() {
        
        await this.connection.end();
    }   
}

module.exports = DatabaseManager;