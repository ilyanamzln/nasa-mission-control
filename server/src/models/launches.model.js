const axios = require("axios");

const launches = require("./launches.mongo");
const planets = require("./planets.mongo");

const DEFAULT_FLIGT_NUMBER = 100;
const SPACEX_API_URL = "https://api.spacexdata.com/v4/launches/query";

async function populateLaunches() {
  console.log("Dowloading launches data...");

  const response = await axios.post(SPACEX_API_URL, {
    query: {},
    options: {
      pagination: false,
      populate: [
        {
          path: "rocket",
          select: {
            name: 1,
          },
        },
        {
          path: "payloads",
          select: {
            customers: 1,
          },
        },
      ],
    },
  });

  if (response.status !== 200) {
    throw new Error("Failed to load launches");
  }

  const launchesDocs = response.data.docs;
  for (const launchDoc of launchesDocs) {
    const payloads = launchDoc["payloads"];
    const customers = payloads.flatMap((payload) => payload.customers);

    const launch = {
      flightNumber: launchDoc["flight_number"],
      mission: launchDoc["name"],
      rocket: launchDoc["rocket"]["name"],
      launchDate: launchDoc["date_local"],
      upcoming: launchDoc["upcoming"],
      success: launchDoc["success"],
      customer: customers,
    };

    // console.log(`${launch.flightNumber}: ${launch.mission}`);
    await saveLaunch(launch);
    console.log("Dowloading launches data complete!");
  }
}

async function loadLaunchesData() {
  const firstLaunch = await findLaunch({
    flightNumber: 1,
    mission: "FalconSat",
    rocket: "Falcon 1",
  });

  if (firstLaunch) {
    console.log("Launches data has been loaded");
  } else {
    await populateLaunches();
  }
}

async function saveLaunch(launch) {
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

async function findLaunch(filter) {
  return await launches.findOne(filter);
}

async function getLatestFlightNumber() {
  const latest = await launches.findOne().sort("-flightNumber");

  return latest ? latest.flightNumber : DEFAULT_FLIGT_NUMBER;
}

async function isExistLaunchById(id) {
  return await findLaunch({
    flightNumber: id,
  });
}

async function getAllLaunches(skip, limit) {
  return await launches
    .find(
      {},
      {
        _id: 0,
        __v: 0,
      }
    )
    .sort({
      flightNumber: 1,
    })
    .skip(skip)
    .limit(limit);
}

async function addNewLaunch(launch) {
  const destination = await planets.findOne({
    keplerName: launch.destination,
  });

  if (!destination) {
    throw new Error("No matching planet found");
  }

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
  loadLaunchesData,
  getAllLaunches,
  addNewLaunch,
  abortLaunchById,
};
