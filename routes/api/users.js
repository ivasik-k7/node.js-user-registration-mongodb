const express = require("express");
const {check, validationResult} = require("express-validator/check");
const config = require("config");
const jwt = require("jsonwebtoken");
const router = express.Router();
const bcrypt = require("bcryptjs");
const gravatar = require("gravatar");

const User = require("../../models/User");

router.get("/", (req, res) => {
    res.send("Get Route for Users");
});

router.post(
    "/",
    [check("name", "Name is required").not().isEmpty(), check("email", "Please enter a unique/valid email").isEmail(), check("password", "Password must be more than six chars...").isLength({min: 6})],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }

        const {name, email, password} = req.body;

        try {
            let user = await User.findOne({email});

            if (user) {
                return res.status(400).json({errors: [{msg: "User already exists"}]});
            }

            const avatar = gravatar.url(email, {
                s: "200",
                r: "pg",
                d: "mm",
            });

            user = new User({
                email,
                name,
                password,
                avatar,
            });

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);

            const payload = {
                user: {
                    id: user.id,
                },
            };

            jwt.sign(payload, config.get("jwtToken"), {expiresIn: 36000}, (err, token) => {
                if (err) throw err;
                res.json({token});
            });

            await user.save();
        } catch (err) {
            console.error(err.message);
            res.status.send("Server error");
        }
    }
);

module.exports = router;
