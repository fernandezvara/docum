import {User, Space, Version, Doc, Tree} from '../models'

const resolvers = {
  Query: {
    user: (root, {id}) => {
      return User.findById(id)
    },
    users: (_, {limit}) => {
      return User.findAll({limit})
    },
    space: (root, {id}) => {
      return Space.findById(id)
    },
    spaces: (_, {userId, limit}) => {
      if (userId) {
        return Space.findAll({ where: { userId }, limit })
      } else {
        return Space.findAll({ limit })
      }
    }
  },
  User: {
    spaces (user) {
      return user.getSpaces({ order: [['id', 'ASC']] })
    },
    spacesCount (user) {
      return user.countSpaces()
    },
    docs (user) {
      return user.getVersions({ order: [['id', 'ASC']] })
    },
    docsCount (user) {
      return user.countVersions()
    }
  },
  Space: {
    user (space) {
      return space.getUser()
    },
    tree (space) {
      return Tree.findOne({
        where: {
          isRoot: true,
          spaceId: space.id
        }
      })
        .then(function (root) {
          return Tree.findAll({ where: { parentId: root.id }, order: [['order', 'ASC']] })
        })
    }
  },
  Tree: {
    doc (tree) {
      return Doc.findById(tree.docId)
    },
    space (tree) {
      return tree.getSpace()
    },
    children (tree) {
      return Tree.findAll({ where: { parentId: tree.id }, order: [ ['order', 'ASC'] ] })
    }
  },
  Doc: {
    versions (doc) {
      return doc.getVersions()
    },
    current (doc) {
      return Version.findOne({ where: { docId: doc.id, version: doc.currentVersion } })
    },
    space (doc) {
      return Space.findById(doc.spaceId)
    },
    linkedDocs (doc) {
      return doc.getLinks()
    }
  },
  Version: {
    doc (version) {
      return Doc.findById(version.docId)
    },
    user (version) {
      return User.findById(version.userId)
    }
  }
}

export default resolvers

// var userTodos = []
// return Todo.findAll({where: {userId: id}})
//   .then(function (todos) {
//     userTodos = todos
//   })
//   .then(function () {
//     return User.findById(id)
//       .then(function (u) {
//         return {
//           id: u.id,
//           firstName: u.firstName,
//           lastName: u.lastName,
//           todos: userTodos
//         }
//       })
//   })
