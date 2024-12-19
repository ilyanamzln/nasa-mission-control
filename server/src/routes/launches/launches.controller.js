const {
  getAllLaunches,
  addNewLaunch,
  isExistLaunchById,
  abortLaunchById,
} = require("../../models/launches.model");
const { isPreviousDate } = require("../../utils/functions");

function httpGetAllLaunches(req, res) {
  return res.status(200).json(getAllLaunches());
}

function httpAddNewLaunch(req, res) {
  launch = req.body;

  if (
    !launch.mission ||
    !launch.rocket ||
    !launch.destination ||
    !launch.launchDate
  ) {
    return res.status(400).json({
      error: "Missing required launch property",
    });
  }

  launch.launchDate = new Date(launch.launchDate);
  if (isNaN(launch.launchDate)) {
    return res.status(400).json({
      error: "Invalid launch date",
    });
  }

  if (isPreviousDate(launch.launchDate)) {
    return res.status(400).json({
      error: "Launch date cannot be in the past",
    });
  }

  addNewLaunch(launch);
  return res.status(201).json(launch);
}

function httpAbortLaunch(req, res) {
  const id = +req.params.id;

  if (!isExistLaunchById(id)) {
    return res.status(404).json({
      error: "Launch not found",
    });
  }

  abortLaunchById(id);
  return res.status(200).json({
    message: "Successfully aborted launch",
  });
}

module.exports = {
  httpGetAllLaunches,
  httpAddNewLaunch,
  httpAbortLaunch,
};
