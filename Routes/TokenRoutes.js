const express = require('express');
const router = express.Router();
const { createToken, getEmployeeTokens, getAllTokens } = require('../Controller/Token/Token');
const {auth, authorizeRoles} = require('../middleware/authMiddleware');
const { UserRoles } = require('../utils/Enums');
const { handleClockOutMissingToken, handleTokenReject, handleTokenResolve } = require('../Controller/Token/TokenResolve');

router.post('/create/:EmployeeID', auth ,  createToken);

router.get('/getTokens/:EmployeeID', auth , getEmployeeTokens);


router.get('/getAllTokens/:companyId' ,auth , authorizeRoles(UserRoles.HR) , getAllTokens);


router.put('/resolve/missingClockOut/:tokenId' ,auth, authorizeRoles(UserRoles.HR) , handleClockOutMissingToken);

router.put('/reject/:tokenId',auth, authorizeRoles(UserRoles.HR) , handleTokenReject);

router.put('/resolve/:tokenId',auth, authorizeRoles(UserRoles.HR) , handleTokenResolve);








module.exports = router;
