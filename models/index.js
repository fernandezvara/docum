import Sequelize from 'sequelize'
import config from 'config'

var DB = new Sequelize(config.get('db.name'), config.get('db.user'), process.env.NODE_ENV === 'production' ? config.get('db.password') : '', {
  dialect: 'postgres',
  host: config.get('db.host'),
  port: config.get('db.port'),
  logging: process.env.NODE_ENV !== 'production'
})

var User = DB.define('users', {
  id: { type: Sequelize.STRING, primaryKey: true },
  name: { type: Sequelize.STRING, allowNull: false }
})

var Space = DB.define('spaces', {
  id: { type: Sequelize.STRING, primaryKey: true },
  name: { type: Sequelize.STRING, allowNull: false },
  description: { type: Sequelize.STRING },
  userId: { type: Sequelize.STRING, allowNull: false }
})

var Tree = DB.define('trees', {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  spaceId: { type: Sequelize.STRING, allowNull: false },
  title: { type: Sequelize.STRING, allowNull: false },
  parentId: { type: Sequelize.INTEGER, allowNull: false },
  isRoot: { type: Sequelize.BOOLEAN, defaultValue: false },
  order: { type: Sequelize.INTEGER, allowNull: false },
  docId: { type: Sequelize.STRING, allowNull: false }
})

var Doc = DB.define('docs', {
  id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
  spaceId: { type: Sequelize.STRING, allowNull: false },
  currentVersion: { type: Sequelize.INTEGER, allowNull: false },
  isBlocked: { type: Sequelize.BOOLEAN, defaultValue: false },
  isBlockedBy: { type: Sequelize.STRING }
})

var LinkedDocs = DB.define('doclinks', {
  userId: { type: Sequelize.STRING, allowNull: false }
})

var Version = DB.define('versions', {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  docId: { type: Sequelize.UUID, allowNull: false },
  version: { type: Sequelize.INTEGER, allowNull: false },
  userId: { type: Sequelize.STRING, allowNull: false },
  title: { type: Sequelize.STRING, allowNull: false },
  text: { type: Sequelize.STRING, allowNull: false }
},
{
  indexes: [
    {
      fields: ['docId', 'version'],
      unique: true
    }
  ]
})

// Associations
Doc.belongsToMany(Doc, {
  as: 'Links',
  through: {
    model: LinkedDocs,
    unique: false
  },
  // foreignKey: 'sourceId',
  // otherKey: 'destinationId',
  constraints: false
})

Space.hasMany(Tree)
Tree.belongsTo(Space)

Space.hasMany(Doc)
Doc.belongsTo(Space)

User.hasMany(Space)
Space.belongsTo(User)

Version.belongsTo(Doc)
Doc.hasMany(Version)

Version.belongsTo(User)
User.hasMany(Version)

module.exports = {
  DB,
  User,
  Space,
  Tree,
  Doc,
  Version
}
