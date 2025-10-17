const jwt = require('jsonwebtoken');
require("dotenv").config();
exports.auth = (req, res, next) => {
    try{
        console.log("reaching auth middleware");
        console.log("cookie", req.cookies);
        console.log("headers", req.headers);
        console.log("body", req.body);

        let token = req.cookies.token;

        // If token not found in cookies, check Authorization header
        if (!token && req.headers.authorization) {
            const authHeader = req.headers.authorization;
            if (authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7); // Remove 'Bearer ' prefix
            } else {
                token = authHeader; // Use the entire header if no Bearer prefix
            }
        }

        // If still no token, check for token in headers (non-standard but common)
        if (!token && req.headers.token) {
            token = req.headers.token;
        }

        console.log("extracted token:", token ? "present" : "missing");

        if(!token){
            return res.status(401).json({
                success: false, 
                message: "Token missing from cookies or headers"
            })
        }

        //verify the token 
        try{
            const decode = jwt.verify(token, process.env.JWT_SECRET);
            //printing the payload 
            console.log("decode", decode);

            req.user = decode;
            next();
        }catch(error){
            console.log("Token verification error:", error);
            return res.status(401).json({
                success: false,
                message: "Token is invalid",
            });
        }
    }
    catch(error){
        console.log("Auth middleware error:", error);
        return res.status(401).json({
            success: false, 
            message: "Something went wrong while verifying this token"
        })
    }
}

//these two check authorization
exports.isUser = (req, res, next) => {
    try{
        if(req.user.role != 'user'){
            res.status(401).json({
                success: false, 
                message: "This is a protected route for customers",
            })
            return;
        }
        next();
    }
    catch(error){
        return res.status(500).json({
            success: false, 
            message: "User Role is not matching",
        })
    }
}

exports.isAdmin = (req, res, next) => {
    try{
        if(req.user.role != 1){
            return res.status(401).json({
                success: false, 
                message: "This is a protected route for admins",
            })
        }
        next();
    }
    catch(error){
        return res.status(500).json({
            success: false, 
            message: "User Role is not matching",
        })
    }
}

// New middleware for blockchain roles
exports.isBank = (req, res, next) => {
    try {
        if (![2, 1].includes(req.user.role)) { // Bank or Admin
            return res.status(401).json({
                success: false,
                message: "This is a protected route for banks",
            });
        }
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "User Role is not matching",
        });
    }
};

exports.isBeneficiary = (req, res, next) => {
    try {
        if (req.user.role !== 5) { // Beneficiary
            return res.status(401).json({
                success: false,
                message: "This is a protected route for beneficiaries",
            });
        }
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "User Role is not matching",
        });
    }
};
