const express = require("express");
const bodyParser = require("body-parser");
const schedule = require("node-schedule");
const app = express();
const db = require("./queries");
const config = require("./config");
const cfenv = require("cfenv");
// @ts-ignore
const appEnv = cfenv.getAppEnv();
const port = appEnv.port || 3000;
const basicAuth = require("express-basic-auth");

app.use(
  basicAuth({
    users: { Administrator: "Welcome@1" },
    challenge: true
  })
);

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

var j = schedule.scheduleJob("42 * * * *", async function() {
  // * * */1 * * *
  // console.log('The answer to life, the universe, and everything!');
  var options = {
    url:
      "https://ans-postgresql-api.cfapps.eu10.hana.ondemand.com/createBulkAlerts",
    method: "GET"
  };
  var req = await config.apicall(options);
  console.log(req);
});
// console.log(j);

app.get("/", (request, response) => {
  /*var j = schedule.scheduleJob('0 * * * * *', function(){
  console.log('The answer to life, the universe, and everything!');
});*/
  console.log(j);
  response.json({ info: "Alert Notification Service" });
});

app.get("/createTable", db.createTable);
app.delete("/deleteTable", db.deleteTable);
app.post("/createAlert", db.createAlert);
app.delete("/deleteAlert/:id", db.deleteAlert);
app.get("/getAllAlerts", db.getAllAlerts);
app.get("/getAlert/:id", db.getAlert);
app.post("/pushAlerts", db.pushAlerts);
app.get("/alter", db.alter);
app.post("/query", db.query);
app.get("/createBulkAlerts", db.createBulkAlerts);

app.listen(port, () => {
  console.log(`App running on port ${port}.`);
});
