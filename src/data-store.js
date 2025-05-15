class DataStore {
    constructor() {
        this.carts = new Map()
    }

    getCart(userID) {
        return this.carts.get(userID) || null
    }

    createCart(userID) {
        const cart = {
            userID, 
            items: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
        this.carts.set(userID, cart)
        return cart
    }

    // Adds an item object to the cart corresonponding to userID
    // type Item { id: ID! name: String! quantity: Int! unitPrice: Float! }
    addItemToCart(userID, item) {
        const cart = this.getCart(userID)
        if (!cart) return null

        // If item already exists in cart, increment quantity
        // Else item doesn't exist, push new item
        const existingIndex = cart.items.findIndex(i => i.id === item.id)
        if (existingIndex >= 0) {
            cart.items[existingIndex].quantity += item.quantity
        } else {
            cart.items.push({ ...item })
        }

        cart.updatedAt = new Date().toISOString()
        return cart
    }

    updateItemQuantity(userID, itemID, quantity) {
        const cart = this.getCart(userID)
        if(!cart) return null

        const existingIndex = cart.items.findIndex(i => i.id === itemID)
        if (existingIndex < 0) return null

        cart.items[existingIndex].quantity = quantity
        cart.updatedAt = new Date().toISOString()
        return cart
    }

    removeItemFromCart(userID, itemID) {
        const cart = this.getCart(userID)
        if (!cart) return null

        const existingIndex = cart.items.findIndex(i => i.id === itemID)
        if (existingIndex < 0) return null

        cart.items.splice(existingIndex, 1)
        cart.updatedAt = new Date().toISOString()
        return cart
    }

    clearCart(userID) {
        const cart = this.getCart(userID)
        if (!cart) return null

        cart.items = []
        cart.updatedAt = new Date().toISOString()
        return cart
    }
}

module.exports = new DataStore();
