const express = require("express");
const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    if (req.method === "OPTIONS") {
      res.header("Access-Control-Allow-Methods", "PUT, PATCH, DELETE, GET");
      return res.status(200).json({});
    }
     next();   
  });

  //Initialize DB
const { dbInit } = require("./AppDAO");
dbInit();

// Routes which should handle requests
const appointmentRoutes = require("./api/routes/booking");
app.use("/appointment", appointmentRoutes);

module.exports = app;
