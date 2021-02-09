const db = require("../db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { promisify } = require("util");

const makeCookieParams = (expires) => ({
  expires,
  httpOnly: true
});

exports.register = async (req, res) => {
  const { name, email, password, passwordConfirm } = req.body;

  const hasRequiredFields = name && email && password && passwordConfirm;

  if (!hasRequiredFields) {
    return res.render("register", {
      message: "All fields must are required"
    });
  }

  if (password !== passwordConfirm) {
    return res.render("register", {
      message: "Passwords don't match"
    });
  }

  try {
    const checkEmailResult = await db.query(
      "SELECT email FROM users WHERE email = ?",
      [email]
    );

    if (checkEmailResult.length) {
      return res.render("register", {
        message: "This email is already registered"
      });
    }

    const hashedPwd = await bcrypt.hash(password, 8);

    await db.query("INSERT INTO users SET ?", {
      name,
      email,
      password: hashedPwd
    });

    res.render("register", {
      message: "User created successfully"
    });
  } catch (error) {
    console.log({ error });
    res.json({ error });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const hasRequiredFields = email && password;

  if (!hasRequiredFields) {
    return res.status(400).render("login", {
      message: "Email and password are required"
    });
  }

  try {
    const selectUserResult = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (
      !selectUserResult ||
      !(await bcrypt.compare(password, selectUserResult[0].password))
    ) {
      return res.status(401).render("login", {
        message: "Email or password is incorrect"
      });
    }

    const token = jwt.sign(
      { id: selectUserResult[0].id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.cookie(
      "jwt",
      token,
      makeCookieParams(
        new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 3600 * 1000)
      )
    );
    res.status(200).redirect("/");
  } catch (error) {
    console.log({ error });
    res.json({ error });
  }
};

exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      const selectUserResult = await db.query(
        "SELECT * FROM users WHERE id = ?",
        [decoded.id]
      );

      if (!selectUserResult) {
        return next();
      }

      req.user = selectUserResult[0];

      return next();
    } catch (error) {
      console.log({ error });
      return next();
    }
  } else {
    next();
  }
};

exports.logout = async (req, res) => {
  console.log("logoutd");
  res.cookie(
    "jwt",
    "logout",
    makeCookieParams(new Date(Date.now() + 2 * 1000))
  );

  res.status(200).redirect("/");
};
