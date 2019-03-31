const cred = require('./cred')
const express = require('express');
const bodyParser = require('body-parser');
const graphqlhttp = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Event = require('./models/event');
const User = require('./models/user');
const schema = require('./graphql/schema');
const resolver = require('./graphql/resolvers');
const app = express();

mongoose.connect(`mongodb://${cred.user}:${cred.pass}@ds243054.mlab.com:43054/eventgraphql`, {
  useNewUrlParser: true
})
  .then((data) => { console.log("database set up") })
  .catch(err => { console.log(err) })

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.use('/graphql', graphqlhttp({
  schema: schema,
  // this acts as a resolver functions
  rootValue: resolver,
  graphiql: true
}))

app.get('/', (req, res, next) => {
  res.status(200).json({ msg: 'hey it works' });
})

const port = process.env.PORT || 3000
app.listen(port, () => { console.log(`listening to ${port}`) });