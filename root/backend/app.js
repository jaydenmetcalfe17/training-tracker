const express = require("express");
const { spawn } = require('child_process');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(bodyParser.json());






app.listen(port, () => {
    console.log("Server started on port", port);
});