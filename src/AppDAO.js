const sqlite3 = require('sqlite3')

const getDBConnection = () => new sqlite3.Database('appointment.db');
const appointmentTable = "APPOINTMENTS";

const dbInit = () =>{
   const db = getDBConnection();
   // Creates appointment table
   db.run(`CREATE TABLE IF NOT EXISTS ${appointmentTable} (id INTEGER PRIMARY KEY, PID INTEGER, DID INTEGER, DATE INTEGER, MONTH INTEGER, YEAR INTEGER, START TEXT, END TEXT, ISVISITED INTEGER)`);
   db.close();
}

module.exports= {dbInit, getDBConnection, appointmentTable};