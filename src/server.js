const express = require('express');
const cors = require('cors');
require('./db/mongoose');

const userRouter = require('./routers/user');
const mediaRouter = require('./routers/media');

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