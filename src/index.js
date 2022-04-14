const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")

dotenv.config()

const PORT = process.env.PORT

const { sequelize } = require("./lib/sequelize")
sequelize.sync({ alter: true })

const app = express()

app.use(cors())
app.use(express.json())

app.get("/", (req, res) => {
    res.send("<h1>Welcome to my API </h1>")
})

const { userRoutes, postRoutes, commentRoutes } = require("./routers")
app.use("/post_images", express.static(`${__dirname}/public/posts`))
app.use("/avatar", express.static(`${__dirname}/public/avatar`))
app.use("/user", userRoutes)
app.use("/posts", postRoutes)
app.use("/comments", commentRoutes)


app.listen(PORT, () => {
    console.log("listening in port", PORT)
})
