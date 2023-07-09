const express = require('express');
const nodemailer = require('nodemailer'); // added nodemailer 7/3/23
// const connectDB = require('./config/db.js');
const mongoose = require('mongoose'); // changed import to require
const cors = require('cors');
const app = express();


app.use(cors());
app.use(express.json())
// connectDB();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = "mongodb+srv://movienetwork25:movienetwork6768@cluster0.ee3mlpi.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

app.get('/', (req, res) => {
    res.send('API is running....');
});


async function run() {
    try {
      const products = client.db("movienetwork").collection("products")
      const users = client.db("movienetwork").collection("user")
      const request = client.db("movienetwork").collection("request")
      const upcoming = client.db("movienetwork").collection("upcoming") // added upcoming 7/9/23

      app.get('/api/MovieDB', async (req, res) => {
        res.json (await products.find({}).toArray());
    });
    
    
    app.get('/api/MovieDB/:id', async (req, res) => {
        res.json(await products.findOne({ _id: new ObjectId(req.params.id) }));
    });

    app.post ('/api/users', async (req, res)=> {
      res.json(await users.insertOne(req.body));
    })

    app.get ('/api/users', async (req,res)=> {
      res.json(await users.find({}).toArray());
    })


    // 
    app.put ('/api/saveuser/:email', async (req, res) => {
      const email = req.params.email;
      const updatedUser = req.body;
      const result = await users.updateOne({ email: email }, { $set: updatedUser }, { upsert: true });
      res.json(result);
    });
    

    //delete user by id 7/3/23
    app.delete('/api/users/:id', async (req, res) => {
      const userId = req.params.id;
      await users.deleteOne({ _id: new mongoose.Types.ObjectId(userId) });
      res.json({ message: "User deleted" });
  });

  

  //delete movie by id 7/3/23
  app.delete('/api/MovieDB/:id', async (req, res) => {
    const movieId = req.params.id;
    try {
        const products = client.db("movienetwork").collection("products")
        const result = await products.deleteOne({ _id: new mongoose.Types.ObjectId(movieId) });
        if(result.deletedCount === 1) {
            res.json({ message: "Movie deleted successfully" });
        } else {
            res.status(404).json({ message: "Movie not found" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error deleting movie" });
    }
  });

  //update user by id 7/3/23
  app.get ('/api/users/:id', async (req, res) => {
    const userId = req.params.id;
    const user = await users.findOne({ _id: new mongoose.Types.ObjectId(userId) });
    res.json(user);
  });


  app.put('/api/users/:id', async (req, res) => {
    const userId = req.params.id;
    const updatedUser = req.body;
    await users.updateOne({ _id: new mongoose.Types.ObjectId(userId) }, { $set: updatedUser });
    res.json({ message: "User updated" });
});



   // to add films to homescreen 7/3/23
   app.post ('/api/MovieDB', async (req, res)=> {
    res.json(await products.insertOne(req.body));
  })
  
    // request films 7/6/23

    // app.get('/api/request', async (req, res) => {
    //   res.json(await request.find({}).toArray());
    // });
  
    // app.post('/api/request', async (req, res) => {
    //   res.json(await request.insertOne(req.body));
    // });

    app.get('/api/request', async (req, res) => {
      try {
        const requests = await request.find({}).toArray();
        res.json(requests);
      } catch(err) {
        res.status(500).json({ message: err.message });
      }
    });
    
    app.post('/api/request', async (req, res) => {
      try {
        const newRequest = await request.insertOne(req.body);
        res.status(201).json(newRequest);
      } catch(err) {
        res.status(500).json({ message: err.message });
      }
    });
    
    
  
    app.delete('/api/request/:id', async (req, res) => {
      const { id } = req.params;
      try {
        const result = await request.deleteOne({ _id: new ObjectId(id) }); // Assuming 'request' is a MongoDB collection
        if (result.deletedCount === 0) {
          res.status(404).json({ message: 'Not found' });
        } else {
          res.json({ message: 'Deleted successfully' });
        }
      } catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
      }
    });

    // <------------------------------------->
    
    // upcoming films 7/9/23
      // app.get ('/api/upcoming', async (req,res)=> {
      //   // res.json(await upcoming.find({}).toArray());
      //   try {
      //     const upcoming = await upcoming.find({}).toArray();
      //     res.json(upcoming);
      //   }
      //   catch(err) {
      //     res.status(500).json({ message: err.message });
      //   }
      // })

      app.get('/api/upcoming', async (req, res) => {
        try {
          const upcomingCollection = await upcoming.find({}).toArray();
          res.json(upcomingCollection);
        }
        catch(err) {
          res.status(500).json({ message: err.message });
        }
      })
      

      // app.post ('/api/upcoming', async (req, res)=> {
      //   res.json(await upcoming.insertOne(req.body));
      // })

      app.post('/api/upcoming', async (req, res) => {
        // console.log("Request received at /api/upcoming");
        res.json(await upcoming.insertOne(req.body));
      })
      

      // app.delete('/api/upcoming/:id', async (req, res) => {
      //   const { id } = req.params;
      //   try {
      //     const result = await upcoming.deleteOne({ _id: new ObjectId(id) }); // Assuming 'request' is a MongoDB collection
      //     if (result.deletedCount === 0) {
      //       res.status(404).json({ message: 'Not found' });
      //     } else {
      //       res.json({ message: 'Deleted successfully' });
      //     }
      //   } catch (error) {
      //     res.status(500).json({ message: 'Something went wrong' });
      //   }
      // });

      // <------------------------------------->

   // search api
    app.get('/api/search/:value', async (req, res) => {
      try {
        const { value } = req.params;
        const searchResult = await products.find({ name: { $regex: value, $options: 'i' } }).toArray();
        res.json(searchResult);
      } catch(err) {
        res.status(500).json({ message: err.message });
      }
    });


  // added forget-password 7/3/23
  app.post('/forget-password', async (req, res) => {
    let { email } = req.body;
    
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'moviezone030@gmail.com',
        pass: 'moviezone1322;' // Replace with your Gmail password
      }
    });
  
    let mailOptions = {
      from: 'moviezone030@gmail.com',
      to: email,
      subject: 'Reset Password',
      text: 'You are receiving this email because you (or someone else) has requested the reset of the password for your account. Please click on the following link, or paste this into your browser to complete the process within one hour of receiving it:'
      // You can put the password reset link here
    };
  
    try {
      let info = await transporter.sendMail(mailOptions)
      res.status(200).send('Email sent: ' + info.response);
    } catch (error) {
      console.log(error);
      res.status(500).send('Error in sending email');
    }
  });

  // admin
  // const isAdmin = async (req, res, next) => {
  //   try {
  //     const user = await users.findOne({ _id: new ObjectId(req.user._id) });
  //     if (user && user.role === 'admin') {
  //       next(); // user is an admin, so continue to next middleware or route handler
  //     } else {
  //       res.status(403).json({ message: 'Access denied. User is not an admin.' });
  //     }
  //   } catch (error) {
  //     res.status(500).json({ message: 'Something went wrong' });
  //   }
  // }

  // app.get('/api/dashboard', isAdmin, async (req, res) => {
  //   // Only admins will reach this point
  //   res.json({ message: 'Welcome to the admin dashboard.' });
  // });

  app.get('/api/checkuser/:email', async (req, res) => {
    const { email } = req.params;
    try {
      const user = await users.findOne({ email });
      if (user.isAdmin) {
        res.json({verified: true});
      } else {
        res.json({verified: false});
      }
    } catch (error) {
      res.status(500).json({verified: false});
    }
  });

  
// <-------------------------------------------------------------------------->  

        
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
      // Ensures that the client will close when you finish/error
      
    }
  }
 
app.listen(5000, () => {
    console.log('Server running on port 5000')
    run().catch(console.dir);
});
