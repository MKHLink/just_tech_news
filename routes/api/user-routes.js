const router = require('express').Router();
const {User, Post, Vote} = require('../../models');
const { beforeCreate } = require('../../models/User');

router.get('/',(req,res)=>{
    User.findAll({
        attributes: {exclude:['password']}
    })
        .then(dbUserData => res.json(dbUserData))
        .catch(err =>{
            console.log(err);
            res.status(500).json(err);
        });
});

router.get('/:id',(req,res)=>{
    User.findOne({
        attributes:{exclude:['password']},
        where:{id:req.params.id},
        include: [
            {
              model: Post,
              attributes: ['id', 'title', 'post_url', 'created_at']
            },
            {
              model: Post,
              attributes: ['title'],
              through: Vote,
              as: 'voted_posts'
            }
          ]
    })
        .then(dbUserData =>{
            if(!dbUserData)
            {
                res.status(404).res.json({message: "No user found"});
                return;
            }
            res.json(dbUserData);
        })
        .catch(err=>{
            console.log(err);
            res.status(500).json(err);
        });
});

router.post('/',(req,res)=>{
    User.create({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password
    })
        .then(dbUserData =>res.json(dbUserData))
        .catch(err => {
            console.log(err);
            res.status(500).json(err);
        });
});

router.post('/login',(req,res)=>{
    User.findOne({
        where: {
            email: req.body.email
        }
    }).then(dbUserData=>{
        if(!dbUserData)
        {
            res.status(400).json({message:"Invalid email"});
            return;
        }

        //res.json({user: dbUserData});
        const validPassword = dbUserData.checkPassword(req.body.password);

        if(!validPassword)
        {
            res.status(400).json({message: "Incorrect password"});
        }

        res.json({user: dbUserData, message:"Logged in!"})
    });
});


router.put('/:id',(req,res)=>{
    User.update(req.body, {
        individualHooks: true,
        where:{
            id:req.params.id
        }
    })
        .then(dbUserData =>{
            if(!dbUserData[0])
            {
                res.status(404).json({message: "User not found"});
                return;
            }
            res.json(dbUserData);
        })
        .catch(err =>{
            console.log(err);
            res.status(500).json(err);
        });
});

router.delete('/:id',(req,res)=>{
    User.destroy({
        where:{
            id:req.params.id
        }
    })
        .then(dbUserData =>{
           if(!dbUserData)
           {
            res.status(404).json({message: "User not found"});
            return;
           }
           res.json(dbUserData);
        })
        .catch(err =>{
            console.log(err);
            res.status(500).json(err);
        });
});

module.exports = router;