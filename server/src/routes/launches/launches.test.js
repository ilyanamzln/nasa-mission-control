const request = require("supertest");

const app = require("../../app");
const { mongoConnect, mongoDisconnect } = require("../../services/mongo");

const API_URL = "/v1/launches";

describe("Launches API", () => {
  beforeAll(async () => {
    await mongoConnect();
  });

  afterAll(async () => {
    await mongoDisconnect();
  });

  describe("Test GET /launches", () => {
    test("It should respond with 200 success", async () => {
      const response = await request(app)
        .get(API_URL)
        .expect("Content-Type", /json/)
        .expect(200);
    });
  });

  describe("Test POST /launches", () => {
    const launchCompleteInput = {
      mission: "ZTM155",
      rocket: "ZTM Experimental IS1",
      destination: "Kepler-442 b",
      launchDate: "January 17, 2030",
    };

    const launchInexistPlanetInput = {
      mission: "ZTM155",
      rocket: "ZTM Experimental IS1",
      destination: "Kepler-kelp f",
      launchDate: "January 17, 2030",
    };

    const launchWithoutDateInput = {
      mission: "ZTM155",
      rocket: "ZTM Experimental IS1",
      destination: "Kepler-442 b",
    };

    const launchWithIncorrectDate = {
      mission: "ZTM155",
      rocket: "ZTM Experimental IS1",
      destination: "Kepler-442 b",
      launchDate: "Pepe",
    };

    const launchWithPastDate = {
      mission: "ZTM155",
      rocket: "ZTM Experimental IS1",
      destination: "Kepler-442 b",
      launchDate: "08 March, 1960",
    };

    test("It should respond with 201 created", async () => {
      const response = await request(app)
        .post(API_URL)
        .send(launchCompleteInput)
        .expect("Content-Type", /json/)
        .expect(201);

      const requestDate = new Date(launchCompleteInput.launchDate).valueOf();
      const responseDate = new Date(response.body.obj.launchDate).valueOf();
      expect(responseDate).toBe(requestDate);

      expect(response.body).toMatchObject({
        message: "Successfully added launch",
        obj: launchWithoutDateInput,
      });
    });

    test("It should catch no matching planet found", async () => {
      const response = await request(app)
        .post(API_URL)
        .send(launchInexistPlanetInput)
        .expect("Content-Type", /json/)
        .expect(400);

      expect(response.body).toStrictEqual({
        error: "No matching planet found",
      });
    });

    test("It should catch missing required property", async () => {
      const response = await request(app)
        .post(API_URL)
        .send(launchWithoutDateInput)
        .expect("Content-Type", /json/)
        .expect(400);

      expect(response.body).toStrictEqual({
        error: "Missing required launch property",
      });
    });

    test("It should catch invalid date", async () => {
      const response = await request(app)
        .post(API_URL)
        .send(launchWithIncorrectDate)
        .expect("Content-Type", /json/)
        .expect(400);

      expect(response.body).toStrictEqual({
        error: "Invalid launch date",
      });
    });

    test("It should catch past date", async () => {
      const response = await request(app)
        .post(API_URL)
        .send(launchWithPastDate)
        .expect("Content-Type", /json/)
        .expect(400);

      expect(response.body).toStrictEqual({
        error: "Launch date cannot be in the past",
      });
    });
  });
});
