const path = require('path');
const APIBase = require('./APIBase');
const fs = require('fs');
const { url } = require('inspector');


class FilesystemAPI extends APIBase {

    constructor(app, db) {

        super(app, db, 'fs');
    }

    init() {

        this.onDelete = this.onDelete.bind(this);
        this.onRefresh = this.onRefresh.bind(this);
        this.onCreateDir = this.onCreateDir.bind(this);
        this.onRenameDir = this.onRenameDir.bind(this);
        this.onUploadAsset = this.onUploadAsset.bind(this);
        this.onFilePreview = this.onFilePreview.bind(this);
        this.onProjectFiles = this.onProjectFiles.bind(this);
        this.onGetFile = this.onGetFile.bind(this);

        this.addRoute(true, 'post', 'delete', this.onDelete);
        this.addRoute(true, 'post', 'refresh', this.onRefresh);
        this.addRoute(true, 'post', 'rename', this.onRenameDir);
        this.addRoute(true, 'post', 'create_dir', this.onCreateDir);
        this.addRoute(true, 'post', 'upload', this.onUploadAsset, true);
        this.addRoute(true, 'post', 'files', this.onProjectFiles);
        this.addRoute(true, 'get', 'view/:projectName/:filename', this.onGetFile);
    }

    async onGetFile(req, res) {

        const userID = req.user.id;
        const fileName = req.params.filename.replaceAll(':', '/');
        const projectName = req.params.projectName;
        const filePath = `./clients/${userID}/${projectName}/${fileName}`;
        console.log("Requested File: " + filePath);
        if(!fs.existsSync(filePath))
            return this.sendFail(res);

        return res.status(200).sendFile(path.resolve(filePath));
    } 

    async onFilePreview(req, res) {

        const userID = req.user.id;
        const fileName = req.params.filename;
        const projectID = req.params.projectID;
        const filePath = `./uploads/${userID}/${projectID}/${fileName}`;

        if(!fs.existsSync(filePath))
            return this.sendFail(res);

        return res.status(200).sendFile(path.resolve(filePath));
    } 

    async onProjectFiles(req, res) {

        const userID = req.user.id;
        const { projectID } = req.body;

        if(!userID || !projectID)
            return this.sendFail(res);

        console.log(userID);
        const dirPath = `./uploads/${userID}/${projectID}/`;

        if(!fs.existsSync(dirPath))
            return this.sendFail(res);

        let urls = fs.readdirSync(dirPath);
        return res.status(200).json({ data: urls});
    }

    async onUploadAsset(req, res) {

        const userID = req.user.id;
        const form = req.file;
        const { projectID, name } = req.body;

        console.log("Uploading New Asset: " + name);
        
        if(!userID || !projectID || !form)
            return this.sendFail(res);
        
        console.log("Invalid Data!");

        if(!this.db.isConnected())
            return this.sendFail(res);
        
        console.log("DB OK!");
        try {

            console.log("Connecting To DB ...");
            const sql = "SELECT * FROM projects WHERE id = ? AND userID = ?;";
            const dbData = await this.db.run(sql, [projectID, userID]);

            if(dbData.rows.length === 1) {

                const projectName = dbData.rows[0].name;
                const userPath = './clients/' + userID + "/";
                const projectPath = path.join(userPath,projectName);
                const targetPath = path.join(projectPath, name);
                const newPath = path.join(targetPath, form.originalname);
                const uploadsPath = `./uploads/${userID}/${projectID}`;

                if(!fs.existsSync(uploadsPath))
                    fs.mkdirSync(uploadsPath);

                if(fs.existsSync(targetPath)) {

                    fs.renameSync('./uploads/' + form.filename, newPath);
                    fs.copyFileSync(newPath, path.join(uploadsPath, form.originalname));
                }

                return res.status(200).json({ data: this.buildDirTree(projectPath, '|', projectName) });
            }
        }
        catch(err) { console.log("FS Delete Dir Error: " + err); }
        return this.sendFail(res);
    }

    async onDelete(req, res) {

        const userID = req.user.id;
        const { projectID, name } = req.body;

        if(!userID || !name || !projectID)
            return this.sendFail(res);

        if(!this.db.isConnected())
            return this.sendFail(res);
        
        try {

            const sql = "SELECT * FROM projects WHERE id = ? AND userID = ?;";
            const dbData = await this.db.run(sql, [projectID, userID]);

            if(dbData.rows.length === 1) {

                const projectName = dbData.rows[0].name;
                const userPath = './clients/' + userID + "/";
                const projectPath = path.join(userPath,projectName);
                const targetPath = path.join(projectPath, name);
               
                if(fs.existsSync(targetPath))
                    fs.rmSync(targetPath, { recursive: true, force: true });

                return res.status(200).json({ data: this.buildDirTree(projectPath, '|', projectName) });
            }
        }
        catch(err) { console.log("FS Delete Dir Error: " + err); }
        return this.sendFail(res);
    }

    async onRenameDir(req, res) {

        const userID = req.user.id;
        const { projectID, name, newName } = req.body;

        if(!userID || !name || !projectID)
            return this.sendFail(res);

        if(!this.db.isConnected())
            return this.sendFail(res);
        
        try {

            const sql = "SELECT * FROM projects WHERE id = ? AND userID = ?;";
            const dbData = await this.db.run(sql, [projectID, userID]);

            if(dbData.rows.length === 1) {

                const projectName = dbData.rows[0].name;
                const userPath = './clients/' + userID + "/";
                const projectPath = path.join(userPath,projectName);
                const currentPath = path.join(projectPath, name);
                const newPath = path.join(projectPath, newName);

                if(fs.existsSync(currentPath))
                    fs.renameSync(currentPath, newPath);

                return res.status(200).json({ data: this.buildDirTree(projectPath, '|', projectName) });
            }
        }
        catch(err) { console.log("FS Create Dir Error: " + err); }
        return this.sendFail(res);
    }

    async onCreateDir(req, res) {

        const userID = req.user.id;
        const { projectID, name } = req.body;

        if(!userID || !name || !projectID)
            return this.sendFail(res);

        if(!this.db.isConnected())
            return this.sendFail(res);
        
        try {

            const sql = "SELECT * FROM projects WHERE id = ? AND userID = ?;";
            const dbData = await this.db.run(sql, [projectID, userID]);

            if(dbData.rows.length === 1) {

                const projectName = dbData.rows[0].name;
                const userPath = './clients/' + userID + "/";
                const projectPath = path.join(userPath,projectName);
                const targetPath = path.join(projectPath, name);

                if(!fs.existsSync(targetPath))
                    fs.mkdirSync(targetPath);

                return res.status(200).json({ data: this.buildDirTree(projectPath, '|', projectName) });
            }
        }
        catch(err) { console.log("FS Create Dir Error: " + err); }
        return this.sendFail(res);
    }

    async onRefresh(req, res) {

        const userID = req.user.id;
        const { projectID } = req.body;
        
        if(!userID || !projectID)
            return this.sendFail(res);
        
        if(!this.db.isConnected())
            return this.sendFail(res);
        
        try {

            const sql = "SELECT * FROM projects WHERE id = ? AND userID = ?";
            const dbData = await this.db.run(sql, [projectID, userID]);
            
            if(dbData.rows.length === 1) {

                const projectName = dbData.rows[0].name;
                const userPath = './clients/' + userID + "/";
                const projectPath = path.join(userPath, projectName);

                if(!fs.existsSync(projectPath))
                    fs.mkdirSync(projectPath);

                if(!fs.existsSync(`./uploads/${userID}/${projectID}/`))
                    fs.mkdirSync(`./uploads/${userID}/${projectID}/`);

                console.log("User #" + userID + " Rereshing FS: " + projectPath);
                return res.status(200).json({ data: this.buildDirTree(projectPath, '|', projectName)});
            }
        }
        catch(err) { console.log("FS Refresh Error: " + err); }
        return this.sendFail(res);
    }

    buildDirTree(dirPath, indent = '|', projectName) {

        let index = 1;
        let result = '';
        const items = fs.readdirSync(dirPath, { withFileTypes: true });

        for(const item of items) {

            const fullPath = path.join(dirPath, item.name);
            const userID = fullPath.split('/')[1];
            const match = "clients/" + userID + "/" + projectName + "/";
            console.log(match) ;
            const index = fullPath.indexOf(match);
            const basePath = fullPath.substring(index + match.length);
            const extension = this.getExtension(fullPath);

            if(item.isDirectory()) {

                result += `${indent}[${extension}][${basePath}]\n`;
                result += this.buildDirTree(fullPath, indent, projectName);
            }
            else result += `${indent}[${extension}][${basePath}]\n`;
        }

        return result;
    }

    getExtension(path) {

        let ext = path.split('.').pop();
        if(ext.includes("/"))
            ext = "DIR";

        switch(ext) {

            case "txt": ext = "TEXT"; break;
            case "js": ext = "SCRIPT"; break;
            case "png": ext = "IMAGE"; break;
            case "ws": ext = "SCENE"; break;
        }

        return ext;
    }
}

module.exports = FilesystemAPI;
