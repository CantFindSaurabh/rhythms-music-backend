const jwt = require('jsonwebtoken');

const User = require('../db/models/User')

const auth = async (req, res, next) => {
    try {

        let authToken = req.header('authorization');
        authToken = authToken.replace('Bearer ', '');

        const payload = jwt.verify(authToken, process.env.JWT_SECRET);

        const user = await User.findOne({
            _id: payload._id,
            'tokens.token': authToken
        })

        if (!user) {
            return res.status(401).send({});
        }

        req.user = user;
        req.token = authToken;

        next();

    } catch(e) {
        console.log(e);
        res.status(401).send({});
    }
}

module.exports = auth;