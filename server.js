const express = require("express");
const connectDB = require("./config/db");

const app = express();

connectDB();

app.use(express.json({extended: false}));

app.get("/", (req, res) => res.send("Started"));

app.use("/api/users", require("./routes/api/users"));

const PORT = 4500 || process.env.PORT;

app.listen(PORT, () => console.log(`Started on: ${PORT}`));
z;
