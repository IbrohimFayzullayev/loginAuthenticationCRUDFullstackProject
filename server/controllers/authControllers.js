const jwt = require("jsonwebtoken");
const User = require("../model/authModel");

exports.getDataLength = async (req, res) => {
  try {
    const dataLength = await User.find();
    res.status(200).json({
      status: "succes",
      number: dataLength.length,
    });
  } catch (error) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();

    res.status(200).json({
      status: "succes",
      results: users.length,
      data: {
        users,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};
exports.getUsers = async (req, res) => {
  try {
    const data = await User.find();
    res.status(200).json(data);
  } catch (error) {
    res.status(404).json({
      status: "fail",
      message: error,
    });
  }
};
exports.getUser = async (req, res) => {
  try {
    const user = await User.findOne({ id: req.params.id });
    res.status(200).json(user);
  } catch (error) {
    res.status(404).json({
      status: "fail",
      message: error,
    });
  }
};
exports.deleteUser = async (req, res) => {
  try {
    const deleteUser = await User.deleteOne({ id: req.params.id });
    res.status(200).json(deleteUser);
  } catch (error) {
    res.status(404).json({
      status: "fail",
      message: error,
    });
  }
};
exports.deleteUsers = async (req, res) => {
  try {
    req.body.deleteUsers.map(async (id) => {
      await User.deleteOne({ id: id });
    });
    res.status(200).json({
      status: "success",
      deleteCount: req.body.deleteUsers.length,
    });
  } catch (error) {
    res.status(404).json({
      status: "fail",
      message: error,
    });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { id, active, loginDate, changeId } = req.body;
    const doc = await User.findOne({ id: id });
    if (active) {
      doc.active = active;
    }
    if (loginDate) {
      doc.loginDate = loginDate;
    }
    if (changeId) {
      doc.id = changeId;
    }
    let result = await doc.save();
    res.status(200).json(result);
  } catch (error) {
    res.status(404).json({
      status: "fail",
      message: error,
    });
  }
};

// User register and login
const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
  return jwt.sign({ id }, "ibrohim super secret key", {
    expiresIn: maxAge,
  });
};

const handleErrors = (err) => {
  let errors = { email: "", password: "", active: "" };

  if (err.message === "block") {
    errors.active = "That user is blocked";
  }

  if (err.message === "incorrect email") {
    errors.email = "That email is not registered";
  }

  if (err.message === "incorrect password") {
    errors.password = "That password is incorrect";
  }

  if (err.code === 11000) {
    errors.email = "Email is already registered";
    return errors;
  }

  if (err.message.includes("Users validation failed")) {
    Object.values(err.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message;
    });
  }

  return errors;
};

module.exports.register = async (req, res, next) => {
  try {
    const { username, email, password, active, id } = req.body;
    const date = new Date();
    const registerDate = `${date.toLocaleTimeString()} - ${date.toLocaleDateString()}`;
    const loginDate = registerDate;
    const user = await User.create({
      username,
      email,
      password,
      active,
      id,
      registerDate,
      loginDate,
    });
    const token = createToken(user._id);

    res.cookie("jwt", token, {
      withCredentials: true,
      httpOnly: false,
      maxAge: maxAge * 1000,
    });

    res.status(201).json({ user: user._id, created: true });
  } catch (err) {
    const errors = handleErrors(err);
    res.json({ errors, created: false });
  }
};

module.exports.login = async (req, res) => {
  const { email, password } = req.body;
  console.log(email);
  try {
    const user = await User.login(email, password);
    const token = createToken(user._id);
    res.cookie("jwt", token, { httpOnly: false, maxAge: maxAge * 1000 });
    if (user.active === "block") {
      throw new Error("block");
    }
    res.status(200).json({ user: user._id, status: true });
  } catch (err) {
    const errors = handleErrors(err);
    res.json({ errors, status: false });
  }
};
