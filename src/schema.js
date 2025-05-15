const {gql} = require("apollo-server-express")

const typedefs = gql`
    type Item {
        id: ID!
        name: String!
        quantity: Int!
        unitPrice: Float!
    }

    type Cart {
        userID: ID!
        items: [Item!]!
        totalPrice: Float!
        createdAt: String!
        updatedAt: String!
    }

    type Query {
        cart: Cart
    }

    type Mutation {
        createCart: Cart!
        addItem(id: ID!, name: String! quantity: Int!, unitPrice: Float!): Cart!
        updateItemQuantity(id: ID!, quantity: Int!): Cart!
        removeItem(id: ID!): Cart!
        clearCart: Cart!
    }
`
module.exports = typedefs