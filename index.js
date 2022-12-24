const express = require('express');
const cors = require('cors');
require('./src/db/mongoose');

const userRouter = require('./src/routers/user');
const mediaRouter = require('./src/routers/media');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());
app.use(userRouter);
app.use(mediaRouter);

app.get('*', (req, res) => {
    res.status(404).send();
})

app.listen(PORT, () => {
    console.log("Server started on port: " + PORT);
})