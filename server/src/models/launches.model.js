const launches = new Map();

var latestFlightNumber = 100;

const launch = {
  flightNumber: 100,
  mission: "Kepler Exploration X",
  rocket: "Explorer IS1",
  launchDate: new Date("December 27, 2030"),
  destination: "Kepler-442 b",
  customer: ["ZTM", "NASA"],
  upcoming: true,
  success: true,
};

launches.set(launch.flightNumber, launch);

function isExistLaunchById(id) {
  return launches.has(id);
}

function getAllLaunches() {
  return Array.from(launches.values());
}

function addNewLaunch(launch) {
  latestFlightNumber++;
  launches.set(
    latestFlightNumber,
    Object.assign(launch, {
      success: true,
      upcoming: true,
      customer: ["ZTM", "NASA"],
      flightNumber: latestFlightNumber,
    })
  );
}

function abortLaunchById(id) {
  const aborted = launches.get(id);
  if (aborted) {
    aborted.success = false;
    aborted.upcoming = false;
  }
}

module.exports = {
  isExistLaunchById,
  getAllLaunches,
  addNewLaunch,
  abortLaunchById,
};
