const Logger = (err,req,res,next) =>{
    const status = err.statusCode || 500;
    const error = err.message || "Internal Server Error";

    return res.status(status).json({
        success:false,
        status,
        error
    })
}

module.exports = Logger