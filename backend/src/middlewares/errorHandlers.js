const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';

    // Prisma specific errors
    if (err.code === 'P2002') {
        statusCode = 400;
        message = 'A record with that unique field already exists.';
    } else if (err.code === 'P2025') {
        statusCode = 404;
        message = 'Record not found.';
    }

    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { error: err.message, stack: err.stack })
    });
};

const asyncWrapper = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
    errorHandler,
    asyncWrapper
};
