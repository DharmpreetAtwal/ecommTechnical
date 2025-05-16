# Shopping Cart GraphQL API

A simple GraphQL API for shopping cart management.

## Features

- Create a cart
- Add items to the cart
- List cart contents with total price
- Update item quantities
- Remove items
- Clear the cart

## Getting Started

1. Install dependencies:
   npm install express apollo-server-express graphql jest supertest nodemon cross-env

2. Start the server:
   npm start

3. Access the GraphQL Playground at: http://localhost:4000/graphql

## Authentication

All requests need an Authorization header with a Bearer token:

Authorization: Bearer <user-id>

For this exercise, any non-empty token is considered valid and identifies a unique user.

## Example API Calls

### 1. Create a Cart
mutation {
  createCart {
    userID
    items {
      id
    }
    totalPrice
  }
}

curl --request POST ^
  --header "Content-Type: application/json" ^
  --header "Authorization: Bearer 123" ^
  --url http://localhost:4000/graphql ^
  --data "{\"query\":\"mutation { createCart { userID } }\"}"

### 2. Add an Item
mutation {
  addItem(
    id: "1", 
    name: "Product Name", 
    quantity: 2, 
    unitPrice: 10.99
  ) {
    items {
      id
      name
      quantity
      unitPrice
    }
    totalPrice
  }
}

curl --request POST ^
  --header "Content-Type: application/json" ^
  --header "Authorization: Bearer 123" ^
  --url http://localhost:4000/graphql ^
  --data "{\"query\":\"mutation { addItem(id: \\\"1\\\", name: \\\"Product Name\\\", quantity: 2, unitPrice: 10.99) { items { id name quantity unitPrice } totalPrice } }\"}"


### 3. List Cart Contents
query {
  cart {
    userID
    items {
      id
      name
      quantity
      unitPrice
    }
    totalPrice
  }
}

### 4. Update Item Quantity
mutation {
  updateItemQuantity(id: "1", quantity: 5) {
    items {
      id
      name
      quantity
      unitPrice
    }
    totalPrice
  }
}

### 5. Remove an Item
mutation {
  removeItem(id: "1") {
    items {
      id
    }
    totalPrice
  }
}

### 6. Clear the Cart
mutation {
  clearCart {
    items {
      id
    }
    totalPrice
  }
}

curl --request POST ^
  --header "Content-Type: application/json" ^
  --header "Authorization: Bearer 123" ^
  --url http://localhost:4000/graphql ^
  --data "{\"query\":\"mutation { clearCart { items { id } totalPrice } }\"}"

## Running Tests
npm test