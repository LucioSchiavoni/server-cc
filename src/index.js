import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import userRouter from './routes/user.routes.js'
import clubRouter from './routes/club.routes.js'


dotenv.config()


const app = express()

const PORT = process.env.PORT


const opcionesCors = {
    origin: process.env.FRONTEND_URL_DEV,
    credentials: true 
};

app.use(cors(opcionesCors))
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use("/upload", express.static("src/middlewares/upload"))
//endpoint
app.use("/", userRouter)
app.use("/", clubRouter)

app.get("/", (req,res) => {
    res.json("Server CannaClub")

})

app.listen(PORT, () =>  { 
    console.log(`Servidor corriendo en http://localhost:${PORT}`)
})