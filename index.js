const app = require("./src/app");
const http = require("http");
require("dotenv").config();

const server = http.createServer(app);

const port = process.env.PORT;

server.listen(port, () => {
  console.log(`Server is running on : ${port}`);
});
