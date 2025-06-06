const express = require('express');
const { spawn } = require('child_process');
const bodyParser = require('body-parser');
const routes = require('./routes');
const cors = require('cors');


const app = express();
const port = 3000;

app.use(bodyParser.json());

app.use(cors({
  origin: 'http://localhost:5173'
}));

app.use("/api", routes);




app.listen(port, () => {
    console.log("Server started on port", port);
});