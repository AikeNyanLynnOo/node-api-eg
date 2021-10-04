const express = require("express");

const bodyParser = require("body-parser");
const app = express();

app.use(bodyParser.urlencoded({extended : false}));
app.use(bodyParser.json());

const PORT = 8000;
const routes = require("./routes");

app.use("/api",routes);

app.listen(PORT, () => {
  console.log(`Servers is runnng at port ${PORT}`);
});
