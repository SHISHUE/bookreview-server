const express = require('express')
const app = express()
const dotenv = require('dotenv');
const userRoutes = require('./routes/user')
const reviewRoutes = require('./routes/review')
const commentRoutes = require('./routes/comment')
const cookieParser = require('cookie-parser');
const cors = require('cors'); 
dotenv.config();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
      origin: "http://localhost:5173",
      credentials: true,
      methods: 'GET, POST, PUT, DELETE',
      allowedHeaders: ['Content-Type', 'Authorization']
  })
);



const {dbConnect} = require('./config/database')


const PORT = process.env.PORT || 4000
dbConnect();

app.use('/api/v1/auth', userRoutes);
app.use('/api/v1/review', reviewRoutes);
app.use('/api/v1/comment', commentRoutes);
app.get('/', function (req, res) {
  res.send('Hello World')
})

app.listen(PORT,() => {
    console.log(`Server is online on ${PORT}`)
})