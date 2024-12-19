const request = require("supertest");
const app = require("../../app");

describe("Test GET /launches", () => {
  test("It should respond with 200 success", async () => {
    const response = await request(app)
      .get("/launches")
      .expect("Content-Type", /json/)
      .expect(200);
  });
});

describe("Test POST /launches", () => {
  const launchCompleteInput = {
    mission: "ZTM155",
    rocket: "ZTM Experimental IS1",
    destination: "Kepler-186 f",
    launchDate: "January 17, 2030",
  };

  const launchWithoutDateInput = {
    mission: "ZTM155",
    rocket: "ZTM Experimental IS1",
    destination: "Kepler-186 f",
  };

  const launchWithIncorrectDate = {
    mission: "ZTM155",
    rocket: "ZTM Experimental IS1",
    destination: "Kepler-186 f",
    launchDate: "Pepe",
  };

  const launchWithPastDate = {
    mission: "ZTM155",
    rocket: "ZTM Experimental IS1",
    destination: "Kepler-186 f",
    launchDate: "08 March, 1960",
  };

  test("It should respond with 201 created", async () => {
    const response = await request(app)
      .post("/launches")
      .send(launchCompleteInput)
      .expect("Content-Type", /json/)
      .expect(201);

    const requestDate = new Date(launchCompleteInput.launchDate).valueOf();
    const responseDate = new Date(response.body.launchDate).valueOf();
    expect(responseDate).toBe(requestDate);

    expect(response.body).toMatchObject(launchWithoutDateInput);
  });

  test("It should catch missing required property", async () => {
    const response = await request(app)
      .post("/launches")
      .send(launchWithoutDateInput)
      .expect("Content-Type", /json/)
      .expect(400);

    expect(response.body).toStrictEqual({
      error: "Missing required launch property",
    });
  });

  test("It should catch invalid date", async () => {
    const response = await request(app)
      .post("/launches")
      .send(launchWithIncorrectDate)
      .expect("Content-Type", /json/)
      .expect(400);

    expect(response.body).toStrictEqual({
      error: "Invalid launch date",
    });
  });

  test("It should catch past date", async () => {
    const response = await request(app)
      .post("/launches")
      .send(launchWithPastDate)
      .expect("Content-Type", /json/)
      .expect(400);

    expect(response.body).toStrictEqual({
      error: "Launch date cannot be in the past",
    });
  });
});
