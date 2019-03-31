const mongoose = require('mongoose');
const Event = require('../../models/event');
const User = require('../../models/user');
const bcrypt = require('bcryptjs');


module.exports = {
    events: () => {
        return Event.find().populate('creator')
            .exec()
            .then(data => {
                return data.map(event => {
                    return { ...event._doc, _id: event._doc._id.toString(), creator: { ...event._doc.creator._doc, _uid: event._doc.creator._id.toString() } }
                })
            }).catch(err => {
                console.log(err)
                throw err;
            })
    },
    users: () => {
        return User.find().populate('createdEvents')
            .exec()
            .then(data => {
                return data.map(user => {
                    const events = user.createdEvents.map(item => {
                        return { ...item._doc, _id: item._id.toString() }
                    });
                    return { ...user._doc, _uid: user._doc._id.toString(), createdEvents: [...events] }
                })
            })
            .catch(err => {
                console.log(err)
                throw err;
            })
    },
    createEvents: (args) => {
        const event = new Event({
            title: args.eventInput.title,
            description: args.eventInput.description,
            price: +args.eventInput.price,
            date: new Date(args.eventInput.date),
            creator: { _uid: "5c2bad5446bff72b2805969b" }
        })
        let CreatedEvent
        return event.save()
            .then(data => {
                CreatedEvent = { ...data._doc, creator: data._doc.creator.toString(), _id: data._doc._id.toString() }
                return User.findById("5c2bad5446bff72b2805969b")
                console.log(data)
            })
            .then(user => {
                if (!user) {
                    console.log("No user of that ID")
                }
                user.createdEvents.push(event)
                return user.save()
            })
            .then(dataUser => {
                console.log(CreatedEvent)
                return CreatedEvent
            })
            .catch(err => {
                console.log(err)
                throw err
            });
    },
    createUser: (args) => {
        return bcrypt.hash(args.userInput.password, 12)
            .then(hashedPassword => {
                const user = new User({
                    email: args.userInput.email,
                    password: hashedPassword
                })
                return user.save()
                    .then(data => {
                        return { ...data._doc, _uid: data._doc._id.toString() }
                    })
                    .catch(err => {
                        console.log(err);
                        throw err;
                    })
            })
            .catch(err => {
                console.log(err)
            })
    }
}