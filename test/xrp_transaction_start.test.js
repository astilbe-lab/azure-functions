
let chai = require("chai");
const httpFunction = require("../xrp_transaction_start");
const context = require("./default-context");
let expect = chai.expect;

describe("test xrp_transaction_start validations", () => {
    it("should throw error if body is empty", async () => {
        const request = {};
        await httpFunction(context, request);

        expect(context.res.status).equals(500, "status code should be 500")
    })
    it("should throw error if amount is non numeric", async ()=>{
        const request = {
            body: {
                "email": "zkinion@gmail.com",
                "amount": "200001s",
                "description": "An NFT from NuPay...",
            },
        };
        await httpFunction(context, request);
        expect(context.res.status).equal(500);
    })
    it("should throw error if amount is higher than $200,000", async () => {
        const request = {
            body: {
                "email": "zkinion@gmail.com",
                "amount": 200001,
                "description": "An NFT from NuPay...",
            },
        };
        await httpFunction(context, request);
        expect(context.res.status).equal(500);
       
        expect(context.res.body.error.detail).equal("\"amount\" must be less than or equal to 200000")
    })
    it("should throw error if email is not valid format",async () =>{
        const request = {
            body: {
                "email": "zkiniongmail.com",
                "amount": 20,
                "description": "An NFT from NuPay...",
            },
        };
        await httpFunction(context, request);
        expect(context.res.body.error.detail).equal("\"email\" must be a valid email")
    })
    it("should not throw error if all validation pass", async () => {
        const request = {
            body: {
                "email": "zkinion@gmail.com",
                "amount": 20,
                "description": "An NFT from NuPay...",
            },
        };
        await httpFunction(context, request);
        expect(context.res.body.err).equal(undefined)
    })

    
})