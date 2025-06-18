import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import userRouter from './routes/user.routes.js'
import clubRouter from './routes/club.routes.js'
import productRouter from './routes/product.routes.js'
import orderRouter from './routes/order.routes.js'
import clubScheduleRouter from './routes/clubSchedule.routes.js'
import { checkSubscriptionStatus } from './middlewares/auth.middleware.js'

dotenv.config()

const app = express()

const PORT = process.env.PORT

const opcionesCors = {
    origin: process.env.FRONTEND_URL_DEV,
    credentials: true 
};

// Configuración de límites para body-parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use(cors(opcionesCors))
app.use("/uploads", express.static("src/uploads"))

app.use((req, res, next) => {
    
    if (req.path === '/login') {
        return next();
    }
    
    if (req.user) {
        return checkSubscriptionStatus(req, res, next);
    }
    
    next();
});

//endpoint
app.use("/", userRouter)
app.use("/", clubRouter)
app.use("/", productRouter)
app.use("/", orderRouter)
app.use("/", clubScheduleRouter)

app.get("/", (req,res) => {
    res.json("Server CannaClub")

})

app.listen(PORT, () =>  { 
    console.log(`Servidor corriendo en http://localhost:${PORT}`)
})