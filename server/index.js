const express = require('express');
const app = express();

module.exports = (req, res) => {
  res.send("Server is running");
};