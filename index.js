import config from 'config'
import Koa from 'koa'
import KoaRouter from 'koa-router'
import { DB, Doc, Space, Version, User, Tree } from './models/index'
import KoaBody from 'koa-bodyparser'
import { graphqlKoa, graphiqlKoa } from 'apollo-server-koa'
import schema from './graph/schema'

console.log(config.get('service.port'))

const app = new Koa()
const router = new KoaRouter()

// console.log(schema)

// KoaBody is needed just for POST.
router.post('/graphql', KoaBody(), graphqlKoa({ schema }))
router.get('/graphql', graphqlKoa({ schema }))

router.get('/graphiql', graphiqlKoa({ endpointURL: '/graphql' }))

app.use(router.routes())
app.use(router.allowedMethods())

app.use(async ctx => {
  ctx.body = 'Hello World'
})

DB.sync({ force: true })
  .then(function () {
    User.bulkCreate([
      { id: 'user1', name: 'User1' },
      { id: 'user2', name: 'User2' }
    ])
      .then(function () {
        Space.bulkCreate([
          { id: 'a', name: 'AAAA', description: 'AAAA DESC', userId: 'user1' }
        ])
          .then(function () {
            Tree.create({ spaceId: 'a', parentId: 0, isRoot: true, order: 0, title: 'root', docId: '' })
            Doc.bulkCreate([
              { currentVersion: 1, spaceId: 'a', isBlocked: false, isBlockedBy: '' },
              { currentVersion: 2, spaceId: 'a', isBlocked: false, isBlockedBy: '' }
            ])
              .then(function () {
                Doc.findAll()
                  .then(function (docs) {
                    // console.log(docs)
                    var doc1 = docs[0]
                    var doc2 = docs[1]
                    Tree.bulkCreate([
                      { spaceId: 'a', parentId: 1, isRoot: false, order: 1, title: 'doc1111', docId: doc1.id },
                      { spaceId: 'a', parentId: 1, isRoot: false, order: 2, title: 'doc2222', docId: doc2.id },
                      { spaceId: 'a', parentId: 2, isRoot: false, order: 1, title: 'doc11.11', docId: doc2.id },
                      { spaceId: 'a', parentId: 2, isRoot: false, order: 2, title: 'doc11.22', docId: doc2.id },
                      { spaceId: 'a', parentId: 2, isRoot: false, order: 3, title: 'doc11.33', docId: doc2.id },
                      { spaceId: 'a', parentId: 4, isRoot: false, order: 1, title: 'doc11.11.77', docId: doc2.id },
                      { spaceId: 'a', parentId: 4, isRoot: false, order: 2, title: 'doc11.22.88', docId: doc2.id },
                      { spaceId: 'a', parentId: 4, isRoot: false, order: 3, title: 'doc11.33.99', docId: doc2.id },
                    ])
                    Version.bulkCreate([
                      { docId: doc1.id, version: 1, title: 'Doc1-Version1', text: 'TEXT:Doc1-Version1', userId: 'user1' },
                      { docId: doc1.id, version: 2, title: 'Doc1-Version2', text: 'TEXT:Doc1-Version2', userId: 'user2' },
                      { docId: doc2.id, version: 1, title: 'Doc2-Version1', text: 'TEXT:Doc2-Version1', userId: 'user2' },
                      { docId: doc2.id, version: 2, title: 'Doc2-Version2', text: 'TEXT:Doc2-Version2', userId: 'user2' }
                    ])
                    doc1.addLink(doc2, { through: { userId: 'aaa' } })
                      .then(function () {
                        doc1.getLinks()
                          .then(function (links) {
                            console.log('---- doc1 ----')
                            console.log(links)
                            console.log('--------------')
                          })
                        doc2.getLinks()
                          .then(function (links) {
                            console.log('---- doc2 ----')
                            console.log(links)
                            console.log('--------------')
                          })
                      })
                      .then(function () {
                        doc1.hasLink(doc2)
                          .then(function (ans) {
                            console.log('has: ' + ans)
                          })
                      })
                  })
              })
          })
      })
  })

app.listen(config.get('service.port'))
