// Clase personalizada para errores de la aplicación
export class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

// Función para manejar respuestas exitosas
export const successResponse = (data, message, statusCode = 200) => {
    return {
        success: true,
        statusCode,
        message,
        data
    };
};

// Función para manejar respuestas de error
export const errorResponse = (message, statusCode = 400) => {
    return {
        success: false,
        statusCode,
        message
    };
};
