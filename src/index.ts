import "reflect-metadata"
import { GraphQLServer } from 'graphql-yoga'
import { createConnection } from "typeorm"
import { ResolverMap } from "./types/ResolverTypes"
import { User } from "./entity/User"

const typeDefs = `
  type User {
    id: Int!
    firstName: String!
    lastName: String!
    age: Int!
    email: String!
  }

  type Query {
    hello(name: String): String!
    user(id: Int!): User!
    users: [User!]!
  }

  type Mutation {
    createUser(firstName: String!, lastName: String!, age: Int!, email: String!): User!
    updateUser(id: Int! firstName: String, lastName: String, age: Int, email: String): Boolean
    deleteUser(id: Int!): Boolean
  }
`

const resolvers: ResolverMap = {
  Query: {
    hello: (_: any, { name }: any) => `Hello ${name || 'World'}`,
    user: (_, { id }) => User.findOne(id),
    users: () => User.find()
  },
  Mutation: {
    createUser: (_, args) => User.create(args).save(),
    updateUser: async (_, { id, ...args }) => {
      try {
        await User.update(id, args);
      } catch (error) {
        console.log(error);
        return false
      }
      return true
    },
    deleteUser: async (_, { id }) => {
      try {
        await User.delete(id)
      } catch (error) {
        console.log(error);
        return false
      }
      return true
    }

  }
}

const server = new GraphQLServer({ typeDefs, resolvers })
createConnection().then(() => {
  server.start(() => console.log('Server is running on localhost:4000'))
})
