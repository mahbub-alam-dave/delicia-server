const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
require("dotenv").config();
const app = express();

const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend server connected");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@mydatabase.sr7puaa.mongodb.net/?retryWrites=true&w=majority&appName=MyDatabase`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const recipeCollection = client.db("recipeBook").collection("recipes");


    app.get('/recipes', async(req, res) => {
      const cursor = await recipeCollection.find().toArray();
      res.send(cursor)
    })

    app.get('/top-recipes', async (req, res) => {
      const mostLikedRecipes = await recipeCollection.find()
      .sort({likeCount: -1})
      .limit(6)
      .toArray()
      res.send(mostLikedRecipes)
    })

    app.get('/recipes/:id', async (req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await recipeCollection.findOne(query);
      res.send(result)
    })

    app.post("/recipes", async (req, res) => {
      const newRecipe = req.body;
      const cursor = await recipeCollection.insertOne(newRecipe);
      res.send(cursor);
    });

    app.patch('/recipes/:id', async (req, res) => {
      const id = req.params.id;
      const updatedRecipeDetails = req.body;
      const filter = {_id: new ObjectId(id)}
      const updatedDoc = {
        $set: {
          recipeName: updatedRecipeDetails.recipeName,
          url: updatedRecipeDetails.url,
          category: updatedRecipeDetails.category,
          cuisineType: updatedRecipeDetails.cuisineType,
          allIngredients: updatedRecipeDetails.allIngredients,
          cookingTime: updatedRecipeDetails.cookingTime,
          instructions: updatedRecipeDetails.instructions
        }
      }
      const result = await recipeCollection.updateOne(filter, updatedDoc)
      res.send(result) 
      console.log(updatedRecipeDetails)
    })

    app.delete('/recipes/:id', async (req, res) => {
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)}
      const result = await recipeCollection.deleteOne(filter)
      res.send(result)
    })

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log("app is running on port", port);
});
