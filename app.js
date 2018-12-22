const express = require('express');
const bodyParser = require('body-parser');
const graphqlhttp = require('express-graphql');
const { buildSchema } = require('graphql');
const app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use('/graphql', graphqlhttp({
    schema : buildSchema(`
        type rootQuery {
            events: [String!]!
        }

        type rootMutation {
            createEvents(name: String): String
        }

        schema {
            query: rootQuery,
            mutation: rootMutation
        }
    `),
    // this acts as a resolver functions
    rootValue: {
        events: () => {
            return ['Hackathon', 'Speed Date', 'Cook it all']
        },
        createEvents: (args) => {
            const eventName = args.name;
            return eventName;
        }
    },
    graphiql: true
}))

app.get('/', (req, res, next) => {
    res.status(200).json({msg: 'hey it works'});
})

app.listen(process.env.PORT || 3000, () => {console.log("listening")});