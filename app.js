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
  const requestQuery = request.query;
  console.log(requestQuery);

  const { search_q = "", priority, status } = request.query;

  switch (true) {
    //scenario 1
    case hasPriorityAndStatusProperties(requestQuery):
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        if (
          status === "TO DO" ||
          status === "IN PROGRESS" ||
          status === "DONE"
        ) {
          getTodoQuery = `
       SELECT 
        * 
       FROM 
        todo 
       WHERE 
        status = '${status}' AND priority = '${priority}';`;
          data = await db.all(getTodoQuery);
          response.send(data);
        } else {
          response.status(400);
          response.text("Invalid Todo Status");
        }
      } else {
        response.status(400);
        response.text("Invalid Todo Priority");
      }

      break;

    //scenario 2
    case hasPriorityProperty(requestQuery):
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        getTodoQuery = `
       SELECT 
       * 
       FROM 
       todo
       WHERE
        priority ='${priority}';`;
        data = await db.all(getTodoQuery);
        response.send(data);
      } else {
        response.status(400);
        response.text("Invalid Todo Status");
      }

      break;

    //scenario 3
    case hasStatusProperty(requestQuery):
      if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
        getTodoQuery = `
       SELECT
        *
       FROM 
        todo
       WHERE 
        status = '${status}';`;
        data = await db.all(getTodoQuery);
        response.send(data);
      } else {
        response.status(400);
        response.text("Invalid Todo Status");
      }

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
      data = await db.all(getTodoQuery);
      response.send(data);
      console.log(requestQuery);
  }
});

//API 2

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodosQuery = `select * from todo where id ='${todoId}';`;

  const getTodo = await db.get(getTodosQuery);
  response.send(getTodo);
});

//API 3
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;

  const createTodoQuery = `insert into todo(id,todo,priority,status) 
  values ('${id}','${todo}','${priority}','${status}');`;
  const createTodo = await db.run(createTodoQuery);
  response.send("Todo Successfully Added");
});

//API 4

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const requestBody = request.body;

  const previousTodoQuery = `select * from todo where id = '${todoId}'`;
  const previousTodo = await db.get(previousTodoQuery);

  const {
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    status = previousTodo.status,
  } = request.body;

  let updateTodoQuery;
  switch (true) {
    case requestBody.status !== undefined:
      if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
        const updateStatusQuery = `update todo set 
        todo ='${todo}', status='${status}',priority='${priority}' where id = '${todoId}'`;
        await db.run(updateStatusQuery);
        response.send("Status Updated");
      } else {
        response.status(400);
        response.text("Invalid Todo Status");
      }
      break;

    case requestBody.priority !== undefined:
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        const updatePriorityQuery = `update todo set 
        todo ='${todo}', status='${status}',priority='${priority}' where id = '${todoId}'`;
        await db.run(updatePriorityQuery);
        response.send("Priority Updated");
      } else {
        response.status(400);
        response.text("Invalid Todo Priority");
      }
      break;

    default:
      const updateTodoQuery = `update todo set 
        todo ='${todo}', status='${status}',priority='${priority}' where id = '${todoId}'`;
      await db.run(updateTodoQuery);
      response.send("Todo Updated");
  }
});

//API 5

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteQuery = `delete from todo where id = ${todoId}`;
  await db.run(deleteQuery);
  response.send("Todo Deleted");
});

module.exports = app;
