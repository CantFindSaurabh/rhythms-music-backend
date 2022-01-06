const express = require('express');
const bcrypt = require('bcryptjs')

const User = require('../db/models/User');
const Otp = require('../db/models/Otp');

const authMiddleware = require('../middleware/auth');
const emailer = require('../email/email');

const router = new express.Router();

router.post('/users/signup/send-otp', async (req, res) => {
    try {
        //checking if user already exists
        const user = await User.findUser(req.body.email);

        if (user) {
            return res.status(401).send({
                error: {
                    signup: {
                        email: "User already exists"
                    }
                }
            });
        }

        const otp = await emailer.sendSignUpOtp(req.body.email);

        let otpDocument = await Otp.findOne({
            email: req.body.email
        });

        // If the otp already exists then changing the otp else generating a new otp
        if (otpDocument) {
            otpDocument.otp = otp;
            await otpDocument.save();
        }
        else {
            otpDocument = new Otp({
                email: req.body.email,
                otp
            })
        }

        await otpDocument.save();
        res.send({});

    } catch (e) {
        console.log(e);
        res.status(400).send({ error: e.message });
    }
})

router.post('/users/signup/verify-otp', async (req, res) => {
    try {
        // Finding the otp that was sent for verification
        const otpDocument = await Otp.findOne({
            email: req.body.email
        });

        if (!otpDocument) {
            return res.status(404).send({
                error: {
                    signup: {
                        otp: "OTP was not sent"
                    }
                }
            });
        }
        if (otpDocument.otp != req.body.otp) {
            return res.status(401).send({
                error: {
                    signup: {
                        otp: "OTP is incorrect"
                    }
                }
            });
        }

        const user = new User({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
        });

        await user.save();

        const token = await user.createToken();

        otpDocument.deleteOne(); // deleting the otp after verification
        emailer.welcome(user.name, user.email);

        res.status(201).send({ user, token });

    } catch (e) {
        console.log(e);
        res.status(400).send({ error: e.message });
    }
})

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            return res.status(404).send({
                error: {
                    login: {
                        email: "User not found"
                    }
                }
            });
        }

        const isAuthorized = await bcrypt.compare(req.body.password, user.password);

        if (!isAuthorized) {
            return res.status(401).send({
                error: {
                    login: {
                        password: "Password is incorrect"
                    }
                }
            });
        }

        const token = await user.createToken();

        res.send({ user, token });
    } catch (e) {
        console.log(e);
        res.status(400).send({ error: e.message });
    }
})

router.post('/users/forgot-pass/send-otp', async (req, res) => {

    try {
        // Checking if the user exists
        const user = await User.findOne({
            email: req.body.email
        });

        if (!user) {
            return res.status(404).send({
                error: {
                    forgotPass: {
                        email: "User not found"
                    }
                }
            });
        }

        const otp = await emailer.sendForgotPassOtp(req.body.email);

        let otpDocument = await Otp.findOne({
            email: req.body.email
        });

        // If the otp already exists then changing the otp else generating a new otp
        if (otpDocument) {
            otpDocument.otp = otp;
            await otpDocument.save();
        }
        else {
            otpDocument = new Otp({
                email: req.body.email,
                otp
            })
        }

        await otpDocument.save();
        res.send({});

    } catch (e) {
        console.log(e);
        res.status(400).send({ error: e.message });
    }
})

router.post('/users/forgot-pass/verify-otp', async (req, res) => {
    try {
        const otpDocument = await Otp.findOne({
            email: req.body.email
        });

        if (!otpDocument) {
            return res.status(404).send({
                error: {
                    forgotPass: {
                        otp: "OTP was not sent"
                    }
                }
            });
        }
        if (otpDocument.otp != req.body.otp) {
            return res.status(401).send({
                error: {
                    forgotPass: {
                        otp: "OTP is incorrect"
                    }
                }
            });
        }

        const user = await User.findOne({ email: req.body.email });
        user.password = req.body.password;
        user.tokens = []; // removing all auth tokens
        const token = await user.createToken();

        otpDocument.deleteOne();

        await user.save();
        res.send({ user, token });

    } catch (e) {
        console.log(e);
        res.status(400).send({ error: e.message });
    }
})


router.post('/users/logout', authMiddleware, async (req, res) => {
    try {
        const user = req.user;
        user.tokens.splice(user.tokens.indexOf(req.token), 1);

        await user.save();
        res.send({});
    } catch (e) {
        console.log(e);
        res.status(400).send({ error: e.message });
    }
});

router.post('/users/logout-all', authMiddleware, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();

        res.send({});

    } catch (e) {
        console.log(e);
        res.status(400).send({ error: e.message });
    }
})

router.get('/users/me', authMiddleware, (req, res) => {
    try {
        res.send({
            user: req.user
        })

    } catch (e) {
        console.log(e);
        res.status(400).send({ error: e.message });
    }
})

router.patch('/users/me', authMiddleware, async (req, res) => {
    try {
        // Only name and password update is allowed
        if (req.body.name) {
            req.user.name = req.body.name;
        }
        if (req.body.password) {
            req.user.password = req.body.password;
            req.user.tokens = [];
            req.user.tokens.push({ token: req.token }); // Removing all auth tokens except current
        }

        await req.user.save();
        res.send({});

    } catch (e) {
        console.log(e);
        res.status(400).send({ error: e.message });
    }
})

router.delete('/users/me', authMiddleware, async (req, res) => {
    try {
        await req.user.deleteOne();
        res.send({});

    } catch (e) {
        console.log(e);
        res.status(400).send({ error: e.message });
    }
})

router.post('/users/favorites', authMiddleware, async (req, res) => {
    try {

        req.user.favorites.push(req.body.song);

        await req.user.save();

        res.status(201).send({});
    } catch (e) {
        console.log(e);
        res.status(500).send({ error: e.message })
    }
})

router.delete('/users/favorites', authMiddleware, async (req, res) => {
    try {

        for (let i = 0; i < req.user.favorites.length; i++) {
            if (req.user.favorites[i].song_id === req.body.song.song_id) {
                req.user.favorites.splice(i, 1);
                break;
            }
        }

        await req.user.save();

        res.status(201).send({});
    } catch (e) {
        console.log(e);
        res.status(500).send({ error: e.message })
    }
})

router.post('/users/playlist', authMiddleware, async (req, res) => {
    try {

        req.body.title = req.body.title.toLowerCase();

        let playlist = req.user.playlists.find(element => {
            return element.title == req.body.title
        })

        // If playlist with same name already exists
        if (playlist != null) {
            return res.send({ error: "playlist already exists" });
        }

        req.user.playlists.push({
            title: req.body.title,
            songs: []
        })

        await req.user.save();

        res.status(201).send({ playlists: req.user.playlists });

    } catch (e) {
        console.log(e);
        res.status(500).send({ error: e.message })
    }
})

router.delete('/users/playlist', authMiddleware, async (req, res) => {
    try {

        let playlistIndex = req.user.playlists.findIndex(element => {
            return req.body.playlistId == element._id
        })

        if (playlistIndex === -1) {
            return res.send({ error: "playlist not found" });
        }
        req.user.playlists.splice(playlistIndex, 1);

        await req.user.save();

        res.send({ playlists: req.user.playlists });

    } catch (e) {
        console.log(e);
        res.status(500).send({ error: e.message });
    }
})

router.post('/users/playlist/song', authMiddleware, async (req, res) => {
    try {

        let playlistIndex = req.user.playlists.findIndex(element => {
            return element._id == req.body.playlistId;
        })

        if (playlistIndex == -1) {
            return res.send({ error: "playlist not found" });
        }

        let songIndex = req.user.playlists[playlistIndex].songs.findIndex(element => {
            return element.song_id == req.body.song.song_id;
        })

        if (songIndex != -1) {
            return res.send({ error: "song already in this playlist" });
        }

        req.user.playlists[playlistIndex].songs.push(req.body.song);
        await req.user.save();

        res.send({ playlists: req.user.playlists });

    } catch (e) {
        console.log(e);
        res.status(500).send({ error: e.message });
    }
})

router.delete('/users/playlist/song', authMiddleware, async (req, res) => {
    try {

        let playlistIndex = req.user.playlists.findIndex(element => {
            return req.body.playlistId == element._id
        })

        if (playlistIndex == -1) {
            return res.send({ error: "playlist not found" });
        }

        let songIndex = req.user.playlists[playlistIndex].songs.findIndex(element => {
            return element.song_id == req.body.songId;
        })

        if (songIndex == -1) {
            return res.send({ error: "song not in playlist" });
        }

        req.user.playlists[playlistIndex].songs.splice(songIndex, 1);
        await req.user.save();

        res.send({ playlists: req.user.playlists });

    } catch (e) {
        console.log(e);
        res.status(500).send({ error: e.message })
    }
})

module.exports = router;