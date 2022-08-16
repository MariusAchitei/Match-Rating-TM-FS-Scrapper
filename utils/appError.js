class AppError extends Error {
    constructor(message, status) {
        super();
        this.message = message;
        this.statis = status;
    }
}

module.exports = { AppError }

