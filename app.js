const express = require("express");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");
const app = express();
const dbPath = path.join(__dirname, "todoApplication.db");
app.use(express.json());

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({ filename: dbPath, driver: sqlite3.Database });
    app.listen(3000, () => {
      console.log("Server running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB Error:${e.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

//API 1

const hasPriorityAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};

app.get("/todos/", async (request, response) => {
  let getTodoQuery = "";
  let data = null;
  const { search_q = "", priority, status } = request.query;
  switch (true) {
    //scenario 1
    case hasPriorityAndStatusProperties(request.query):
      getTodoQuery = `
       SELECT 
        * 
       FROM 
        todo 
       WHERE 
        todo LIKE '%${search_q}%' AND status = '${status} AND priority = '${priority};`;
      break;

    //scenario 2
    case hasPriorityProperty(request.query):
      getTodoQuery = `
       SELECT 
       * 
       FROM 
       todo
       WHERE
        todo LIKE '%${search_q}%' AND priority ='${priority};`;
      break;

    //scenario 3
    case hasStatusProperty(request.query):
      getTodoQuery = `
       SELECT
        *
       FROM 
        todo
       WHERE 
        todo LIKE '%${search_q}%' AND status = '${status};`;
      break;

    //scenario 4
    default:
      getTodoQuery = `
       SELECT
        *
       FROM 
        todo
       WHERE 
        todo LIKE '%${search_q}%';`;
  }

  data = await db.all(getTodoQuery);
  response.send(data);
});
