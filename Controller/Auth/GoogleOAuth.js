const axios = require('axios');
const { oauth2Client } = require('../../utils/GoogleClient.js');
const Employee = require('../../models/Employee');

/* GET Google Authentication API. */
exports.googleAuth = async (req, res, next) => {
    const code = req.query.code;
    try {
        const googleRes = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(googleRes.tokens);
        const userRes = await axios.get(
            `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`
        );
        const { email, name, picture, given_name, family_name } = userRes.data;
        //console.log(userRes);
        let user = await Employee.findOne({ email });

        if (!user) {
            user = await Employee.create({
                firstName: given_name,
                lastName: family_name,
                name,
                email,
                profilePic: picture,
                userRole: 'admin'
            });
        }
        
        const token = user.createJWT();
        console.log(user);

        res.status(200).json({
            message: 'success',
            token,
            user,
        });
    } catch (err) {
        res.status(500).json({
            error: "Internal Server Error"
        })
    }
};