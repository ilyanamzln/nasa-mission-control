const http = require("http");

const app = require("./app");
const { loadPlanetsData } = require("./models/planets.model");

const PORT = process.env.PORT || 8000;

const server = http.createServer(app);

async function main() {
  try {
    await loadPlanetsData();
  } catch (error) {
    console.log(error);
  }

  server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}...`);
  });
}

main();
