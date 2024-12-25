const {
  getAllLaunches,
  addNewLaunch,
  isExistLaunchById,
  abortLaunchById,
} = require("../../models/launches.model");
const { isPreviousDate } = require("../../utils/functions");

async function httpGetAllLaunches(req, res) {
  return res.status(200).json(await getAllLaunches());
}

async function httpAddNewLaunch(req, res) {
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

  try {
    await addNewLaunch(launch);
    return res.status(201).json({
      message: "Successfully added launch",
      obj: launch,
    });
  } catch (error) {
    return res.status(400).json({
      error: error.message,
    });
  }
}

async function httpAbortLaunch(req, res) {
  const id = +req.params.id;

  const existLaunch = await isExistLaunchById(id);

  if (!existLaunch) {
    return res.status(404).json({
      error: "Launch not found",
    });
  }

  const aborted = await abortLaunchById(id);

  if (!aborted) {
    return res.status(400).json({
      error: "Failed to abort launch",
    });
  }

  return res.status(200).json({
    message: "Successfully aborted launch",
  });
}

module.exports = {
  httpGetAllLaunches,
  httpAddNewLaunch,
  httpAbortLaunch,
};
