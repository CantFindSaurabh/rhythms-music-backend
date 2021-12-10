const express = require('express');
const fetch = require('node-fetch');

const authMiddleware = require('../middleware/auth');

const router = new express.Router();

router.get('/landing-data', authMiddleware, async (req, res) => {
    try {
        const data = {
            newReleases: {}
        };

        let response = await fetch('https://saavn.me/search?song=hindi');
        data.newReleases.hindi = await response.json();

        response = await fetch('https://saavn.me/search?song=punjabi');
        data.newReleases.punjabi = await response.json();

        const artists = [
            {
                name: "Arijit Singh",
                imgSrc: "https://c.saavncdn.com/artists/Arijit_Singh_150x150.jpg"
            }, {
                name: "Papon",
                imgSrc: "https://upload.wikimedia.org/wikipedia/commons/9/93/Papon_at_the_launch_of_the_song_Chu_Liya.jpg"
            }, {
                name: "Atif Aslam",
                imgSrc: "https://c.saavncdn.com/artists/Atif_Aslam_500x500.jpg"
            }, {
                name: "Mohit Chauhan",
                imgSrc: "http://starsunfolded.com/wp-content/uploads/2017/01/Mohit-Chauhan.jpg"
            }, {
                name: "Anuv Jain",
                imgSrc: "https://c.saavncdn.com/122/JioSaavn-Live-Anywhere-By-Anuv-Jain-Hindi-2020-20200519172504-500x500.jpg"
            }, {
                name: "Honey Singh",
                imgSrc: "https://samblcdnems05.cdnsrv.jio.com/c.saavncdn.com/artists/Yo_Yo_Honey_Singh_150x150.jpg"
            }, {
                name: "Sonu Nigam",
                imgSrc: "https://c.saavncdn.com/artists/Sonu_Nigam_150x150.jpg"
            }, {
                name: "Badshah",
                imgSrc: "https://c.saavncdn.com/artists/Badshah_004_20191118143638_150x150.jpg",
            }, {
                name: "Neha Kakkar",
                imgSrc: "https://c.saavncdn.com/artists/Neha_Kakkar_006_20200822042626_500x500.jpg"
            }, {
                name: "Diljit Dosanjh",
                imgSrc: "https://c.saavncdn.com/artists/Diljit_Dosanjh_500x500.jpg"
            }, {
                name: "Sanam Puri",
                imgSrc: "https://c.saavncdn.com/artists/Sanam_Puri_500x500.jpg"
            }, {
                name: "Shreya Ghoshal",
                imgSrc: "https://c.saavncdn.com/artists/Shreya_Ghoshal_002_20200822043816_500x500.jpg"
            }, {
                name: "Lata Mangeshkar",
                imgSrc: "https://c.saavncdn.com/artists/Lata_Mangeshkar_002_20200212082631_500x500.jpg"
            }, {
                name: "Raftaar",
                imgSrc: "https://c.saavncdn.com/artists/Raftaar_007_20211109123034_500x500.jpg"
            }, {
                name: "Himesh Reshammiya",
                imgSrc: "https://c.saavncdn.com/artists/Himesh_Reshammiya_500x500.jpg"
            }, {
                name: "Armaan Malik",
                imgSrc: "https://c.saavncdn.com/artists/Armaan_Malik_500x500.jpg"
            }, {
                name: "Nucleya",
                imgSrc: "https://c.saavncdn.com/artists/Nucleya_500x500.jpg"
            }
        ];
        data.artists = artists;

        response = await fetch('https://saavn.me/search?album=album');
        data.albums = await response.json();

        response = await fetch('https://saavn.me/search?song=2015');
        data.top2015 = await response.json();

        response = await fetch('https://saavn.me/search?song=2010');
        data.top2010 = await response.json();

        response = await fetch('https://saavn.me/search?song=old');
        data.old = await response.json();

        res.send({ ...data });

    } catch (e) {
        console.log(e);
        res.status(500).send({});
    }
})

module.exports = router;