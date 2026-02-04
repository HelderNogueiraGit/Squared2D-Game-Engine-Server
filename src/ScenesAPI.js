const APIBase = require("./APIBase");
const path = require('path');
const fs = require('fs');

class ScenesAPI extends APIBase {

    constructor(app, db, fsAPI) {

        super(app, db, 'scenes');
        this.fsAPI = fsAPI;
    }

    init() {

        this.saveScene = this.saveScene.bind(this);
        this.fetchScene = this.fetchScene.bind(this);
        this.createScene = this.createScene.bind(this);

        this.addRoute(true, 'post', 'save', this.saveScene);
        this.addRoute(true, 'post', 'fetch', this.fetchScene);
        this.addRoute(true, 'post', 'create', this.createScene);
    }

    async saveScene(req, res) {

        const userID = req.user.id;
        const { projectName, scene } = req.body;

        if(!userID || !projectName || !scene)
            return this.sendFail(res);

        const sceneConfig = JSON.parse(scene);
        console.log(sceneConfig);
        let userPath = path.join('./clients/', String(userID));
        userPath = path.join(userPath, projectName);

        if(!fs.existsSync(userPath))
            return this.sendFail(res);

        const scenePath = path.join(userPath, sceneConfig.name);
        fs.writeFileSync(scenePath, JSON.stringify(sceneConfig));

        return res.status(200).json({ data: this.fsAPI.buildDirTree(userPath, '|', projectName)});
    }

    async createScene(req, res) {

        const userID = req.user.id;
        const { projectName, sceneName } = req.body;

        if(!userID || !projectName || !sceneName) 
            return this.sendFail(res);

        let userPath = path.join('./clients/', String(userID));
        userPath = path.join(userPath, projectName);

        if(!fs.existsSync(userPath))
            return this.sendFail(res);

        const scenePath = path.join(userPath, sceneName + ".ws");
        const sceneConfig = {

            name: sceneName + ".ws",
            objects: []
        };
        if(!fs.existsSync(scenePath))
            fs.writeFileSync(scenePath, JSON.stringify(sceneConfig));

        return res.status(200).json({ data: this.fsAPI.buildDirTree(userPath, '|', projectName)});
    }

    async fetchScene(req, res) {

        const userID = req.user.id;
        const { projectName, sceneName } = req.body;

        if(!userID || !projectName || !sceneName) 
            return this.sendFail(res);

        console.log("OK SCENE");
        let userPath = path.join('./clients/', String(userID));
        userPath = path.join(userPath, projectName);

        if(!fs.existsSync(userPath))
            return this.sendFail(res);

        const scenePath = path.join(userPath, sceneName);
        if(!fs.existsSync(scenePath))
            this.sendFail(res);

        return res.status(200).json({data: fs.readFileSync(scenePath, 'utf8')});
    }
}

module.exports = ScenesAPI;