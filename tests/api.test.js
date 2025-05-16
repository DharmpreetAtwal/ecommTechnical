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

    // 2. Add an Item to the Cart
    test("Item should be added to cart", async() => {
        const addItemQuery = `
            mutation {
                addItem(id: "1", name: "Product", quantity: 2, unitPrice: 10.99) {
                    items {
                        id 
                        name
                        quantity
                        unitPrice
                    }
                    totalPrice
                }
            }
        `;

        const response =await executeQuery(addItemQuery)
        expect(response.status).toBe(200);
        expect(response.body.data.addItem.items).toHaveLength(1);
        expect(response.body.data.addItem.items[0].name).toBe('Product');
        expect(response.body.data.addItem.items[0].quantity).toBe(2);
        expect(response.body.data.addItem.totalPrice).toBe(21.98);
    })

    // 3. Update item Quantity
    test('Item quantity should be updated', async () => {
        await executeQuery(`mutation { createCart { userID } }`);
        await executeQuery(`
        mutation {
            addItem(id: "1", name: "Product", quantity: 2, unitPrice: 10.99) {
            userID
            }
        }
        `);
        
        const updateQuery = `
        mutation {
            updateItemQuantity(id: "1", quantity: 5) {
            items {
                id
                quantity
            }
            totalPrice
            }
        }
        `;
        
        const response = await executeQuery(updateQuery);
        
        expect(response.status).toBe(200);
        expect(response.body.data.updateItemQuantity.items[0].quantity).toBe(5);
        expect(response.body.data.updateItemQuantity.totalPrice).toBe(54.95);
    });

// 4. Remove an item
    test('Item should be removed from cart', async () => {
        await executeQuery(`mutation { createCart { userID } }`);
        await executeQuery(`
        mutation {
            addItem(id: "1", name: "Product", quantity: 2, unitPrice: 10.99) {
            userID
            }
        }
        `);
        
        const removeQuery = `
        mutation {
            removeItem(id: "1") {
                items {
                    id
                }
                totalPrice
            }
        }
        `;
        
        const response = await executeQuery(removeQuery);
        
        expect(response.status).toBe(200);
        expect(response.body.data.removeItem.items).toHaveLength(0);
        expect(response.body.data.removeItem.totalPrice).toBe(0);
    });

    // 5. Clear Cart
    test("Cart should be cleared", async () => {
        await executeQuery(`mutation { createCart { userID } }`);
        await executeQuery(`mutation { addItem(id: "1", name: "Item 1", quantity: 2, unitPrice: 10.99) { userID } }`);
        await executeQuery(`mutation { addItem(id: "2", name: "Item 2", quantity: 1, unitPrice: 5.99) { userID } }`);

        const clearQuery = `
        mutation {
            clearCart {
                items {
                    id
                }
                totalPrice
            }
        }`;

        const response = await executeQuery(clearQuery);
    
        expect(response.status).toBe(200);
        expect(response.body.data.clearCart.items).toHaveLength(0);
        expect(response.body.data.clearCart.totalPrice).toBe(0);
    })

    // 6. Negative Quantity Error
    test("Negative Quantities should be rejected", async () => {
        await executeQuery(`mutation { createCart { userID } }`);
        
        const invalidQuery = `
            mutation {
                addItem(id: "1", name: "Product", quantity: -1, unitPrice: 10.99) {
                    userID
                }
            }`;

        const response = await executeQuery(invalidQuery);
        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].extensions.http.status).toBe(400)
        expect(response.body.errors[0].message).toContain('must be positive');
    })

    // 7. Item not Found Error
    test("Should return error when trying to update non-existent item", async () => {
        await executeQuery("mutation { createCart { userID } }")
        const updateQuery = `
            mutation {
                updateItemQuantity(id: "1", quantity: 1) {
                    userID
                }
            }
        `

        const response = await executeQuery(updateQuery);
        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].extensions.http.status).toBe(404)
        expect(response.body.errors[0].message).toContain('Item not found');
    })
})