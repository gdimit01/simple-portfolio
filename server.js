const express = require("express");
const path = require("path");

const app = express();

app.use(express.static("public"));

const PORT = process.env.PORT || 3001;
const HOST = "127.0.0.1";

app.listen(PORT, HOST, () => {
  console.log(`Server started on http://${HOST}:${PORT}`);
});
