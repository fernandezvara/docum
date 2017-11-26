import { makeExecutableSchema } from 'graphql-tools'
import resolvers from './resolvers'

const typeDefs = `
  type Query {
    users(limit: Int): [User!]!
    user(id: String): User!
    spaces(userId: String, limit: Int): [Space!]!
    space(id: String): Space!
  }

  type User {
    id: String!
    name: String!
    spaces: [Space!]!
    spacesCount: Int!
    docs: [Version]
    docsCount: Int!
  }

  type Space {
    id: String!
    name: String!
    description: String
    user: User
    tree: [Tree!]!
  }

  type Tree {
    id: Int!
    space: Space!
    title: String!
    parentId: Int!
    isRoot: Boolean!
    order: Int!
    doc: Doc!
    children: [Tree!]!
  }

  type Doc {
    id: String!
    space: Space!
    currentVersion: Int!,
    isBlocked: Boolean
    isBlockedBy: String
    versions: [Version!]!
    current: Version!
    linkedDocs: [Doc!]!
  }

  type Version {
    id: Int!
    doc: Doc!
    version: Int!
    user: User!
    title: String!
    text: String!
  }
`

module.exports = makeExecutableSchema({typeDefs, resolvers})
