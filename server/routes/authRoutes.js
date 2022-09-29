const { register, login } = require("../controllers/authControllers");
const { checkUser } = require("../middlewares/authMiddleware");
const authController = require("../controllers/authControllers");

const router = require("express").Router();

router.post("/", checkUser);
router.route("/").get(authController.getAllUsers);
router.post("/register", register);
router.post("/login", login);
router.route("/uzunligi").get(authController.getDataLength);
router.route("/users").get(authController.getUsers);
router.route("/users/:id").get(authController.getUser);
router.delete("/users/:id", authController.deleteUser);
router.route("/users").delete(authController.deleteUsers);
router.route("/users").put(authController.updateUser);
router.route("/users").put(authController.updateChecked);

module.exports = router;
