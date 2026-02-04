const bcrypt = require('bcrypt');
const jwst = require('jsonwebtoken');

class AuthManager {

    constructor(db) {

        this.db = db;
    }

    async hashString(string) {

        return await bcrypt.hash(string, 10);
    }

    async verifyHash(string, hash) {

        return await bcrypt.compare(string, hash);
    }

    verifyToken(req, res, next) {
            
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) return res.status(401).json();

        jwst.verify(token, "jasonpasswordsecretkey", (err, user) => {
            if (err) return res.status(401).json();
            req.user = user;
            next();
        });
    }

    generateJWToken(user) {

        const token = jwst.sign({

            id: user.id,
            username: user.username
        }, "jasonpasswordsecretkey", { expiresIn: "1h" });

        return token;
    }
}

module.exports = AuthManager;