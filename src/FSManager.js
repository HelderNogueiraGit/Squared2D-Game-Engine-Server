const fs = require('fs');

class FSManager {

    constructor(app, auth) {

        this.app = app;
        this.auth = auth;
    }

    onNewDir(path) {

        if(!fs.existsSync(path))
            fs.mkdirSync(path);
    }

    onDeleteDir(path) {

        if(fs.existsSync(path))
            fs.rmSync(path, { recursive: true, force: true });
    }

    onRenameDir(path) {

        if(fs.existsSync(path))
            fs.renameSync(path);
    }

    

    readDir(dirPath, indent = '|') {

        
    }

    async enableRoutes() {

        this.app.get('/fsapi', this.auth.verifyToken, (req, res) => {
        
            const userID = req.user.id;
            const userPath = './clients/' + userID + "/";

            if(!fs.existsSync('./clients/' + userID + "/"))
                fs.mkdirSync('./clients/' + userID + "/");

            res.json({ data: this.readDir(userPath) });
        }); 
        
        this.app.post('/fsapi/dir', this.auth.verifyToken, (req, res) => {

            const userID = req.user.id;
            const action = req.body.action;
            const name = req.body.name;
            const userPath = './clients/' + userID + "/";

            if(!name || !action || !fs.existsSync(userPath)) {

                res.json({ data: "" });
                return;
            }

            switch(action) {

                case "create": this.onNewDir(path.join(userPath, name)); break;
                case "delete": this.onDeleteDir(path.join(userPath, name)); break;
                case "rename": this.onRenameDir(path.join(userPath, name)); break;
            }

            res.json({ data: this.readDir(userPath) });
        }); 
    }
}

module.exports = FSManager;
