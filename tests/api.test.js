const request = require("supertest")
const {app, server} = require("../src/server")
const dataStore = require("../src/data-store")
const Test = require("supertest/lib/test")

// Helper to execute queries
const executeQuery = async (query, variables = {}, userID = "test-user") => {
    const req = request(app)
        .post("/graphql")
        .send({
            query, 
            variables
        })

    if (userID) req.set('Authorization', `Bearer ${userID}`)
    return req
}

beforeEach(() => {
    dataStore.carts = new Map()
})

afterAll(async () => {
    await server.stop()
})

describe("Shopping Cart API", () => {
    // 1. Create a Cart
    test("Cart should be created", async () => {
        const createCartQuery = `
            mutation {
                createCart {
                    userID
                    items {
                        id
                    }
                    totalPrice
                }
            }`;

            const response = await executeQuery(createCartQuery)

            expect(response.status).toBe(200);
            expect(response.body.data.createCart.userID).toBe('test-user');
            expect(response.body.data.createCart.items).toEqual([]);
            expect(response.body.data.createCart.totalPrice).toBe(0);
    })
})