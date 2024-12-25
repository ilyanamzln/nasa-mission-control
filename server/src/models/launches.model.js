const launches = require("./launches.mongo");
const planets = require("./planets.mongo");

const DEFAULT_FLIGT_NUMBER = 100;

const launch = {
  flightNumber: DEFAULT_FLIGT_NUMBER,
  mission: "Kepler Exploration X",
  rocket: "Explorer IS1",
  launchDate: new Date("December 27, 2030"),
  destination: "Kepler-442 b",
  customer: ["ZTM", "NASA"],
  upcoming: true,
  success: true,
};

saveLaunch(launch);

async function saveLaunch(launch) {
  const destination = await planets.findOne({
    keplerName: launch.destination,
  });

  if (!destination) {
    throw new Error("No matching planet found");
  }

  await launches.findOneAndUpdate(
    {
      flightNumber: launch.flightNumber,
    },
    launch,
    {
      upsert: true,
    }
  );
}

async function getLatestFlightNumber() {
  const latest = await launches.findOne().sort("-flightNumber");

  return latest ? latest.flightNumber : DEFAULT_FLIGT_NUMBER;
}

async function isExistLaunchById(id) {
  return await launches.findOne({
    flightNumber: id,
  });
}

async function getAllLaunches() {
  return await launches.find(
    {},
    {
      _id: 0,
      __v: 0,
    }
  );
}

async function addNewLaunch(launch) {
  const latestFlightNumber = (await getLatestFlightNumber()) + 1;

  const newLaunch = Object.assign(launch, {
    success: true,
    upcoming: true,
    customer: ["ZTM", "NASA"],
    flightNumber: latestFlightNumber,
  });

  try {
    await saveLaunch(newLaunch);
  } catch (error) {
    throw error;
  }
}

async function abortLaunchById(id) {
  const aborted = await launches.updateOne(
    {
      flightNumber: id,
    },
    {
      success: false,
      upcoming: false,
    }
  );

  return aborted.modifiedCount;
}

module.exports = {
  isExistLaunchById,
  getAllLaunches,
  addNewLaunch,
  abortLaunchById,
};
