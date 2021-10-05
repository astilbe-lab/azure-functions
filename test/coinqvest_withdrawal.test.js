let chai = require("chai");
const httpFunction = require("../coinqvest_withdrawal");
const context = require("./default-context");
let expect = chai.expect;

describe("test coinqvest_withdrawal validations", () => {
  it("should throw error if body is empty", async () => {
    const request = {};
    await httpFunction(context, request);

    expect(context.res.status).equals(500, "status code should be 500");
    expect(context.res.body.err.detail).equal("request body is missing.");
  });

  it("should throw error if targetNetwork is not set", async () => {
    const request = {
      body: {
        amount: 100,
      },
    };

    await httpFunction(context, request);

    expect(context.res.status).equal(500);
    expect(context.res.body.err.detail).equal('"targetNetwork" is required');
  });

  it("should throw error if amount non numeric value", async () => {
    const request = {
      body: {
        targetNetwork: "BTC",
        sourceAsset:
          "USD:GDUKMGUGDZQK6YHYA5Z6AY2G4XDSZPSZ3SW5UN3ARVMO6QSRDWP5YLEX",
        amount: "100s",
        accountDetail: {
          address: "0xaerw8923er",
        },
      },
    };

    await httpFunction(context, request);

    expect(context.res.status).equal(500);
    expect(context.res.body.err.detail).equal('"amount" must be a number');
  });

  it("should not have error detail if all validations pass", async () => {
    const request = {
      body: {
        amount: 100,
        targetNetwork: "BTC",
        sourceAsset:
          "USD:GDUKMGUGDZQK6YHYA5Z6AY2G4XDSZPSZ3SW5UN3ARVMO6QSRDWP5YLEX",
        accountDetail: {
          address: "0xaerw8923er",
        },
      },
    };

    await httpFunction(context, request);

    expect(context.res.body.err.detail).equal(undefined);
  });
});
