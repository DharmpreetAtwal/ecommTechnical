const {UserInputError, AuthenticationError} = require("apollo-server-express")
const dataStore = require("./data-store")

const resolvers = {
    Cart: {
        totalPrice: (cart) => {
            const total = cart.items.reduce((sum, item) => {
                return sum + (item.quantity * item.unitPrice)
            }, 0);

            // Round to 2 decimal places
            return parseFloat(total.toFixed(2))
        }
    },

    Query: {
        cart: (_, __, {userID}) => {
            if (!userID) throw new AuthenticationError("Auth Needed")

            const cart = dataStore.getCart(userID)
            if (!cart) throw new Error("No cart found for user")

            return cart
        }
    },

    Mutation: {
        createCart: (_, __, {userID}) => {
            if (!userID) throw new AuthenticationError("Auth Needed")

            const existCart = dataStore.getCart(userID)
            if (existCart) return existCart

            return dataStore.createCart(userID)
        },

        addItem: (_, {id, name, quantity, unitPrice}, {userID}) => {
            if (!userID) throw new AuthenticationError("Auth Needed")
            if (quantity <= 0) throw new UserInputError("Quantity must be positive")
            if (unitPrice <= 0) throw new UserInputError("Unit Price must be positive")

            let cart = dataStore.getCart(userID)
            if(!cart) cart = dataStore.createCart(userID)
            
            return dataStore.addItemToCart(userID, {id, name, quantity, unitPrice})
        },

        updateItemQuantity: (_, {id, quantity}, {userID}) => {
            if (!userID) throw new AuthenticationError("Auth Needed")
            if (quantity <= 0) throw new UserInputError("Quantity must be positive")
            
            const cart = dataStore.getCart(userID)
            if (!cart) throw new Error("No cart found for user")
            
            const updatedCart = dataStore.updateItemQuantity(userID, id, quantity)
            if (!updatedCart) throw new Error("Item not found")

            return updatedCart
        },

        removeItem: (_, {itemID}, {userID}) => {
            if (!userID) throw new AuthenticationError("Auth Needed")
            
            const cart = dataStore.getCart(userID)
            if (!cart) throw new Error("No cart found for user")

            const updatedCart = dataStore.removeItemFromCart(userID, itemID)
            if (!updatedCart) throw new Error("Item not found")        

            return updatedCart
        },

        clearCart: (_, __, {userID}) => {
            if (!userID) throw new AuthenticationError("Auth Needed")

            const cart = dataStore.getCart(userID)
            if (!cart) throw new Error("No cart found for user")

            return dataStore.clearCart(userID)
        }
    }
}

module.exports = resolvers
