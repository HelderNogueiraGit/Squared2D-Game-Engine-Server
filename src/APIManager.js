const AuthAPI = require('./AuthAPI');
const FilesystemAPI = require('./FilesystemAPI');
const ProjectsAPI = require('./ProjectsAPI');
const ScenesAPI = require('./ScenesAPI');

class APIManager {

    constructor(app, db) {

        this.db = db;
        this.app = app;
        this.authAPI = new AuthAPI(this.app, this.db);
        this.projectsAPI = new ProjectsAPI(this.app, this.db);
        this.filesystemAPI = new FilesystemAPI(this.app, this.db);
        this.scenesAPI = new ScenesAPI(this.app, this.db, this.filesystemAPI);
    }
}

module.exports = APIManager;