const router = require('express').Router();
const { User, Post, Comment, Vote } = require('../../models');

// GET /api/user
router.get('/', (req, res) => {
    //Acces our user model and run .findAll() method
    User.findAll({
            attributes: { exclude: ['password'] }
        })
        .then(dbUserData => res.json(dbUserData))
        .catch(err => {
            console.log(err);
            res.status(500).json(err);
        });
});

// GET /api/user/1
router.get('/:id', (req, res) => {
    User.findOne({
            attributes: { exclude: ['password'] },
            where: {
                id: req.params.id
            },
            include: [{
                    model: Post,
                    attributes: ['id', 'title', 'post_url', 'created_at']
                },
                // include the comment model here
                {
                    model: Comment,
                    attributes: ['id', 'comment_text', 'created_at'],
                    include: {
                        model: Post,
                        attributes: ['title']
                    }
                },
                {
                    model: Post,
                    attributes: ['title'],
                    through: Vote,
                    as: 'vote_posts'
                }
            ]
        })
        .then(dbUserData => {
            if (!dbUserData) {
                res.status(404).json({ message: 'No user found with this id' })
                return;
            }
            res.json(dbUserData);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json(err);
        })
});

// POST /api/users
router.post('/', (req, res) => {
    // expects {username: 'Lernantino', email: 'lernantino@gmail.com', password: 'password1234'}
    User.create({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password
        })
        .then(dbUserData => res.json(dbUserData))
        .catch(err => {
            console.log(err);
            res.status(500).json(err);
        });
});

// POST route that create a new user
router.post('/login', (req, res) => {
    // Query operation
    //expects {email: 'lernantino@gmail.com', password: 'password1234'}
    User.findOne({
            where: {
                email: req.body.email
            }
            // replace the existing `include` with this
            // we'll receive the title information of every post they've ever voted on
            // include: [{
            //         model: Post,
            //         attributes: ['id', 'title', 'post_url', 'created_at']
            //     },
            //     {
            //         model: Post,
            //         attributes: ['title'],
            //         through: Vote,
            //         as: 'voted_posts'
            //     }
            // ]
        })
        .then(dbUserData => {
            if (!dbUserData) {
                res.status(400).json({ message: 'No user with email address' });
                return;
            }
            // add comment syntax in front of this line in the .then()
            // res.json({ user: dbUserData });

            // Verify User
            const validPassword = dbUserData.checkPassword(req.body.password);

            if (!validPassword) {
                res.status(400).json({ message: 'Incorrect password' });
                return;
            }
            res.json({ user: dbUserData, message: 'You are now logged in' });
        });
});

// PUT /api/users/1
router.put('/:id', (req, res) => {
    //expects {username: 'Lernantino', email: 'lernantino', password: 'passwrod1234'}

    // pass in req.body instead to only update what's passed through
    User.update(req.body, {
            individualHooks: true,
            where: {
                id: req.params.id
            }
        })
        .then(dbUserData => {
            if (!dbUserData[0]) {
                res.status(404).json({ message: 'No user found with this id' })
                return;
            }
            res.json(dbUserData);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json(err);
        });
});

// DELETE /api/user/1
router.delete('/:id', (req, res) => {
    User.destroy({
            where: {
                id: req.params.id
            }
        })
        .then(dbUserData => {
            if (!dbUserData) {
                res.status(404).json({ message: 'No user found with this id' })
                return;
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json(err);
        });
});


module.exports = router;