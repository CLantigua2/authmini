const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs'); // adding bcrypt
const db = require('./database/dbConfig.js');

const server = express();

server.use(express.json());
server.use(cors());

server.get('/', (req, res) => {
	res.send('Its Alive!');
});

// implement the register feature
server.post('/register', (req, res) => {
	//grab credentials
	const creds = req.body;
	// hash the password || takes in credential password and hashed a number to the 2nd power
	const hash = bcrypt.hashSync(creds.password, 14);
	creds.password = hash;
	// then save the user
	db('users')
		.insert(creds)
		.then((ids) => {
			const id = ids[0];
			res.status(201).json({ newUserId: id });
		})
		.catch((err) => {
			res.status(500).json({ message: 'Incorrect credentials', err });
		});
	// find the user in the database by it's username then
	// if (!db.user || !bcrypt.compareSync(creds.password, db.user.password)) {
	// 	return res.status(401).json({ error: 'Incorrect credentials' });
	// }
});

// login
server.post('/login', (req, res) => {
	const creds = req.body;

	db('users')
		.where({ username: creds.username })
		.first()
		.then((user) => {
			// compare given username && given password with stored user password
			if (user && bcrypt.compareSync(creds.password, user.password)) {
				// found the user
				res.status(200).json({ welcome: user.username });
			} else {
				res.status(401).json({ message: 'You shall not pass!' });
			}
		})
		.catch((err) => res.status(500).json({ err }));
});

// protect this route, only authenticated users should see it
server.get('/users', (req, res) => {
	db('users')
		.select('id', 'username')
		.then((users) => {
			res.json(users);
		})
		.catch((err) => res.send(err));
});

server.listen(3300, () => console.log('\nrunning on port 3300\n'));
