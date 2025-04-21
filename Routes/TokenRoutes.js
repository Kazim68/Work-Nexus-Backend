const express = require('express');
const router = express.Router();
const { createToken, getEmployeeTokens, getAllTokens } = require('../Controller/Token/Token');
const {auth, authorizeRoles} = require('../middleware/authMiddleware');
const { UserRoles } = require('../utils/Enums');
const { handleClockOutMissingToken, handleTokenReject } = require('../Controller/Token/TokenResolve');


router.post('/create/:EmployeeID', auth ,  createToken);

router.get('/getTokens/:EmployeeID', auth , getEmployeeTokens);


router.get('/getAllTokens' ,auth , authorizeRoles(UserRoles.HR) , getAllTokens);


router.put('/resolve/missingClockOut/:tokenId' ,auth, authorizeRoles(UserRoles.HR) , handleClockOutMissingToken);

router.put('/reject/:tokenId',auth, authorizeRoles(UserRoles.HR) , handleTokenReject);




module.exports = router;
