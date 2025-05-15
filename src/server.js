const express = require("express")
const {ApolloServer} = require("apollo-server-express")
const typedefs = require("./schema")
const resolvers = require("./resolvers")

const app = express()

// Auth middleware
app.use((req, res, next) => {
    const authHeader = req.headers.authorization || ''
    const match = authHeader.match(/^Bearer (.+)$/);

    if (match && match[1]) req.userID = match[1];
    next();
})

const server = new ApolloServer({
    typeDefs: typedefs, 
    resolvers: resolvers, 
    context: ({req}) => {
        return {userID: req.userID}
    },
    formatError: (err) => {
        console.error(err)

        if (err.message.includes("must be positive")) {
            err.extensions.code = "BAD_REQUEST"
            err.extensions.http = {status: 400}
        } else if (err.message === "Auth Needed") {
            err.extensions.code = 'UNAUTHORIZED';
            err.extensions.http = { status: 401 };
        } else if (err.message === 'No cart found for user' || err.message === 'Item not found') {
            err.extensions.code = 'NOT_FOUND';
            err.extensions.http = { status: 404 };
        }

        return err
    }
})

async function startServer() {
    await server.start()
    server.applyMiddleware({app})

    const PORT = 4000
    app.listen(PORT, () => {
        console.log(`Server running: http://localhost:${PORT}${server.graphqlPath}`)
    })
}

// if (process.env.NODE_ENV !== 'test') {
startServer();
// }

module.exports = {app, server}