const cors = require('cors');
const express = require('express');
const APIManager = require('./APIManager');
const AuthManager = require('./AuthManager');
const DatabaseManager = require('./DatabaseManager');

class ServerManager {

    constructor() {
    
        this.app = express();  
        this.db = new DatabaseManager({
            
            host: '127.0.0.1',
            user: 'engine',
            password: 'engine',
            database: 'squared2d'
        });

        this.auth = new AuthManager(this.db);
    }

    async initialize() {

        this.app.use(cors());
        this.app.use(express.json());
        this.apiManager = new APIManager(this.app, this.db);

        await this.db.connect();
        this.app.listen(3000, () => {

            console.log("Server Listening: ");
        });
    }
}

module.exports = ServerManager;