const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");

const port = process.env.PORT || 3000;

const app = express();

// static folder /public
app.use(express.static(path.join(__dirname, "./public")));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

// handlebars settings
app.set("view engine", "hbs");
app.set("view options", { layout: "main" });

app.use("/", require("./routes/pages"));
app.use("/auth", require("./routes/auth"));

app.listen(port, () => console.log(`Server running on port ${port}`));
