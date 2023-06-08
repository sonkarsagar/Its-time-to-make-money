const express = require("express");
const app = express();

const user = require("./models/user");
const expense = require("./models/expense");
const Orders = require("./models/orders");

const sequelize = require("./util/database");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const auth = require("./authorization/auth");
const Razorpay=require('razorpay');
const { where } = require("sequelize");


app.use(bodyParser.json());
app.use(cors());

app.get("/", (req, res, next) => {
  user
    .findAll()
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      res.send("<h1>Page Not Found</h1>");
    });
});

app.post("/login", (req, res, next) => {
  user
    .findOne({ where: { email: req.body.email } })
    .then((response) => {
      if (response) {
        bcrypt.compare(req.body.password, response.password, (err, result) => {
          if (result) {
            response.dataValues.token = generateToken(response.id);
            res.status(200).send(response);
          } else {
            return res.status(401).json({ error: "Password doesn't match" });
          }
        });
      } else {
        return res.status(404).json({ error: "User not found" });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: "Internal Server Error" });
    });
});

app.post("/user", (req, res, next) => {
  user
    .findOne({ where: { email: req.body.email } })
    .then((response) => {
      if (response) {
        return res.status(400).json({ error: "User Already Exists" });
      } else {
        bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
          user.create({
            name: req.body.name, 
            sur: req.body.sur, 
            email: req.body.email, 
            password: hashedPassword }).then((result) => {
              res.status(200).json(result);
            }).catch((err) => {
              res.status(500).json({ error: "Internal Server Error" });
            });
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: "Internal Server Error" });
    });
});

app.get('/user',auth.authorize, (req,res,next)=>{
  user.findAll({where: {id: req.user.id}}).then((result) => {
    if(result.premiumUser==true){
      return 1
    }else{
      return 0
    }
  }).catch((err) => {
    console.log(err);
  });
})

app.get("/expense", auth.authorize, (req, res, next) => {
  expense
    .findAll({ where: { userId: req.user.id } })
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get("/expense/premium", auth.authorize, (req, res, next) => {
  const rzp=new Razorpay({
    key_id: 'rzp_test_oAbPHQ6nKF9Gmn',
    key_secret: 'GCsER1T8qce7BUe5xgKDCH7M'
  })
  const amount=2500
  rzp.orders.create({amount, currency: 'INR'}, (err, order)=>{
    if (err) {
      res.status(400).json({error: err.message});
    } else {
      req.user.createOrder({orderId: order.id, status: 'PENDING'})
        .then((result) => {
          res.status(201).json({order, key_id: rzp.key_id})
        })
        .catch((err) => {
          console.log(err);
        });
    }
  });
  // .then((result) => {
  //   res.json(result)
  // }).catch((err) => {
  //   console.log(err);
  // });
});

app.post("/expense/successTransaction", auth.authorize, (req, res, next) => {
  Orders.findOne({where:{orderId: req.body.order_id}}).then((result) => {
    result.update({paymentId: req.body.payment_id, status: 'SUCCESS'})
    user.findOne({where:{id: result.userId}}).then((response) => {
      response.update({premiumUser: true})
    }).catch((err) => {
      console.log(err);
    });
  }).catch((err) => {
    console.log(err);
  });
});
app.post("/expense/failTransaction", auth.authorize, (req, res, next) => {
  Orders.findOne({where:{orderId: req.body.order_id}}).then((result) => {
    result.update({paymentId: 'failed', status: 'FAILED'})
  }).catch((err) => {
    console.log(err);
  });
});

app.post("/expense", auth.authorize, (req, res, next) => {
  expense
    .create({
      amount: req.body.amount,
      description: req.body.description,
      category: req.body.category,
      userId: req.user.id,
    })
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

function generateToken(id) {
  return jwt.sign({ userId: id }, "chaabi");
}

app.delete("/expense/:id", (req, res, next) => {
  expense
    .findByPk(req.params.id)
    .then((result) => {
      if (result) {
        return result.destroy();
      } else {
        res.send("No Product Found to DELETE.");
      }
    })
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((err) => {
      console.log(err);
    });
});

user.hasMany(expense);
expense.belongsTo(user);

user.hasMany(Orders);
Orders.belongsTo(user);

sequelize
  .sync()
  // .sync({force: true})
  .then((res) => {
    const hostname = "127.0.0.1";
    const port = 3000;
    app.listen(port, hostname, () => {
      console.log(`Server running at http://${hostname}:${port}/`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
