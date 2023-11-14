const express = require("express");
const router = express.Router();
const { getDBConnection, appointmentTable } = require("../../AppDAO");
require("dotenv").config();
const API_GATEWAY = process.env.GATEWAY_SERVICE || "http://localhost:3001"

const send500ErrorResponse = (res) => {
  res.status(500).json({
    message: "Unable to process request. Please try after sometime",
  });
};

const send400ErrorResponse = (res, text) => {
  res.status(400).json({
    message: text ? text : "Invalid request",
  });
};

const getTodaysDate = new Date().getUTCDate();
const getMonth = new Date().getUTCMonth();
const getYear = new Date().getUTCFullYear();

//returns today's bookings
router.get("/", async (req, res, next) => {
 console.log("appointments list api")
  try {
    const db = getDBConnection();
    
    await db.all(
      `SELECT * FROM ${appointmentTable} WHERE DATE = ? and MONTH=? and YEAR=? `,
      [getTodaysDate, getMonth+1, getYear],
      
      (error, rows) => {
        console.log("error",error, rows)
        if (error) {
          send500ErrorResponse(res);
        } else {
          const response = {
            count: rows.length,
            appointments: rows.map((row) => {
              return {
                id: row.id,
                pid: row.PID,
                did: row.DID,
                on: row.DATE,
                month: row.MONTH,
                year: row.YEAR,
                start: row.START,
                END: row.END,
                request: {
                  type: "PUT",
                  endpoint: `${API_GATEWAY}/appointment/` + row.id,
                },
              };
            }),
          };

          res.status(200).json(response);
        }
      }
    ).close;
  } catch (error) {
    console.log(error);
    send500ErrorResponse(res);
  }
});

router.get("/:appId", (req, res, next) => {
  const appointmentId = req.params.appId;
  console.log(appointmentId);
  if (!appointmentId) {
    send400ErrorResponse(res);
    return;
  }
  try {
    const db = getDBConnection();
    db.all(
      `SELECT * FROM ${appointmentTable} WHERE ID = ?`,
      appointmentId,
      function (error, rows) {
        console.log("select", error, rows);
        if (error) {
          console.log(error);
          send500ErrorResponse(res);
        } else {
          console.log(rows);
          const response = {
            count: rows.length,
            appointments: rows.map((row) => {
              return {
                id: row.id,
                pid: row.PID,
                did: row.DID,
                on: row.DATE,
                month: row.MONTH,
                year: row.YEAR,
                start: row.START,
                END: row.END,
                request: {
                  type: "PUT",
                  endpoint: `${API_GATEWAY}/appointment/` + row.id,
                },
              };
            }),
          };
          res.status(200).json(response);
        }
      }
    ).close;
  } catch (error) {
    console.log(error);
    send500ErrorResponse(res);
  }
});

//returns all appointments booked by patient (Pid)
router.get("/patient/:pid", (req, res, next) => {
  const patientId = req.params.pid;
  console.log(patientId);
  if (!patientId) {
    send400ErrorResponse(res);
    return;
  }
  try {
    const db = getDBConnection();
    db.all(
      `SELECT * FROM ${appointmentTable} WHERE PID = ?`,
      [patientId],
      function (error, rows) {
        console.log("select patient info", error, rows);
        if (error) {
          console.log(error);
          send500ErrorResponse(res);
        } else {
          console.log(rows);
          const response = {
            count: rows.length,
            appointments: rows.map((row) => {
              return {
                id: row.id,
                pid: row.PID,
                did: row.DID,
                on: row.DATE,
                month: row.MONTH,
                year: row.YEAR,
                start: row.START,
                END: row.END,
                request: {
                  type: "PUT",
                  endpoint: `${API_GATEWAY}/appointment/` + row.id,
                },
              };
            }),
          };
          res.status(200).json(response);
        }
      }
    ).close;
  } catch (error) {
    console.log(error);
    send500ErrorResponse(res);
  }
});

//returns all doctor's appointments (DID)
//when pastMonthsCnt = 0 => returns today's appointment
// pastMonthsCnt>0 => returns appointments scheduled from past months to current month in this year
router.get("/doctor/:did", (req, res, next) => {
  const docId = req.params.did;
  const pastMonths = req.query?.pastMonths || 0;
  console.log(docId);
  if (!docId) {
    send400ErrorResponse(res);
    return;
  }
  try {
    const db = getDBConnection();
    const querySt = pastMonths && pastMonths > 0 ? 
    `SELECT * FROM ${appointmentTable} WHERE DID =${docId} and MONTH>${getMonth-pastMonths+1} and MONTH<=${getMonth+1} and YEAR=${getYear}` : 
    `SELECT * FROM ${appointmentTable} WHERE DID =${docId} and DATE =${getTodaysDate} and MONTH=${getMonth+1} and YEAR=${getYear}`;
    db.all(
      querySt,
      function (error, rows) {
        console.log("select doctors info", pastMonths, error, rows);
        if (error) {
          console.log(error);
          send500ErrorResponse(res);
        } else {
          console.log(rows);
          const response = {
            count: rows.length,
            appointments: rows.map((row) => {
              return {
                id: row.id,
                pid: row.PID,
                did: row.DID,
                on: row.DATE,
                month: row.MONTH,
                year: row.YEAR,
                start: row.START,
                END: row.END,
                request: {
                  type: "PUT",
                  endpoint: `${API_GATEWAY}/appointment/` + row.id,
                },
              };
            }),
          };
          res.status(200).json(response);
        }
      }
    ).close;
  } catch (error) {
    console.log(error);
    send500ErrorResponse(res);
  }
});

//creates new appointment
router.post("/", (req, res) => {
  try {
    const appointmentDetails = req.body;
    if (
      !appointmentDetails ||
      !(
        appointmentDetails.pid &&
        appointmentDetails.did &&
        appointmentDetails.on &&
        appointmentDetails.month &&
        appointmentDetails.year
      )
    ) {
      send400ErrorResponse(res);
      return;
    }

    console.log("appointment info ", appointmentDetails)
    const db = getDBConnection();
    //TODO: check for presense of pid & did
    db.run(
      `INSERT INTO ${appointmentTable} (PID , DID , DATE , MONTH , YEAR , START , END ) VALUES (?,?,?,?,?,?,?)`,
      [
        appointmentDetails.pid,
        appointmentDetails.did,
        appointmentDetails.on,
        appointmentDetails.month,
        appointmentDetails.year,
        appointmentDetails?.start,
        appointmentDetails?.end,
      ],
      function (error) {
        if (error) {
          res.status(500).json({
            message: "invalid data",
          });
        } else {
          res.status(201).json({
            message: "Created appointment successfully",
            createdAppointment: {
              ...appointmentDetails,
              id: this.lastID,
              request: {
                type: "GET",
                url: `${API_GATEWAY}/appointment/` + this.lastID,
              },
            },
          });
        }
      }
    ).close;
  } catch (error) {
    console.log("error", error);
    send500ErrorResponse(res);
  }
});

//update patient info
router.put("/", (req, res, next) => {
  try {
    const appointmentDetails = req.body;
    if (
      !appointmentDetails ||
      !(
        appointmentDetails.id &&
        appointmentDetails.pid &&
        appointmentDetails.did &&
        appointmentDetails.on &&
        appointmentDetails.month &&
        appointmentDetails.year
      )
    ) {
      send400ErrorResponse(res);
      return;
    }

    const db = getDBConnection();
    //TODO: check for presense of patient, doctor & their availability
    db.run(
      `UPDATE ${appointmentTable} SET PID=? , DID=? , DATE=? , MONTH=? , YEAR=? , START=? , END=? ) WHERE ID=?`,
      [
        appointmentDetails.pid,
        appointmentDetails.did,
        appointmentDetails.on,
        appointmentDetails.month,
        appointmentDetails.year,
        appointmentDetails?.stTime,
        appointmentDetails?.endTime,
        appointmentDetails.id
      ],
      function (error) {
        if (error) {
          res.status(500).json({
            message: "invalid data",
          });
        } else {
          res.status(201).json({
            message: "updated appointment details successfully",
            updatedAppointment: {
              ...appointmentDetails,
              id: this.changes,
              request: {
                type: "GET",
                url: `${API_GATEWAY}/appointment/` + this.lastID,
              },
            },
          });
        }
      }
    ).close;
  } catch (error) {
    console.log("error", error);
    send500ErrorResponse(res);
  }
});

//update appointment visit status
router.patch("/:appId", (req, res) => {
  try {
    const appointmentId = req.params?.appId;
    const isVisited = req.query?.isVisited || false;

    const db = getDBConnection();
    //TODO: check for presense of patient, doctor & their availability
    db.run(
      `UPDATE ${appointmentTable} SET ISVISITED = ? ) WHERE ID=?`,
      [
        isVisited,
        appointmentId
      ],
      function (error) {
        if (error) {
          res.status(500).json({
            message: "unable to update status",
          });
        } else {
          res.status(201).json({
            message: "updated appointment details successfully",
            updatedAppointment: {
              ...appointmentDetails,
              id: this.changes,
              request: {
                type: "GET",
                url: `${API_GATEWAY}/appointment/` + this.lastID,
              },
            },
          });
        }
      }
    ).close;
  } catch (error) {
    console.log("error", error);
    send500ErrorResponse(res);
  }
});

router.delete("/:appId", (req, res, next) => {
  const appointmentId = req.params.appId;
  if (!appointmentId) {
    send400ErrorResponse(res);
    return;
  }
  try {
    const db = getDBConnection();
    db.run(`DELETE FROM ${appointmentTable} WHERE ID = ?`, appointmentId, function (error) {
      if (error) {
        console.log(error);
        send500ErrorResponse(res);
      } else {
        console.log(this.changes);
        if (this.changes > 0) {
          res.status(200).json({
            message: "appointment deleted",
            request: {
              type: "POST",
              url: "http://localhost:3000/appointment",
              body: {pid: "number",
                did: "number",
                on: "number",
                month: "number",
                year: "number",
                stTime: "string",
                endTime: "string"},
            },
          });
        } else {
          send400ErrorResponse(res);
        }
      }
    }).close;
  } catch (error) {
    console.log(error);
    send500ErrorResponse(res);
  }
});

module.exports = router;
