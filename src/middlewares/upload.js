import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Tipos de archivos permitidos
const MIME_TYPES = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp'
};

// Tamaño máximo permitido (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Verificar y crear directorio de uploads si no existe
const uploadsDir = path.join(__dirname, '../uploads/');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuración del almacenamiento
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const extension = MIME_TYPES[file.mimetype];
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + '.' + extension);
    }
});

// Filtro de archivos mejorado
const fileFilter = (req, file, cb) => {
    // Verificar tipo MIME
    if (!MIME_TYPES[file.mimetype]) {
        return cb(new Error('INVALID_FILE_TYPE'), false);
    }
    
    // Verificar extensión del archivo (doble validación)
    const fileExtension = path.extname(file.originalname).toLowerCase();
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    
    if (!allowedExtensions.includes(fileExtension)) {
        return cb(new Error('INVALID_FILE_EXTENSION'), false);
    }
    
    cb(null, true);
};

// Configuración base de multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: MAX_FILE_SIZE,
        files: 1, // Solo un archivo
        fields: 10, // Límite de campos adicionales
        fieldNameSize: 50, // Límite del nombre del campo
        fieldSize: 1024 * 1024 // Límite del tamaño de campos de texto (1MB)
    }
});

// Middleware principal para manejo seguro de uploads
export const secureImageUpload = (fieldName = 'image') => {
    return (req, res, next) => {
        upload.single(fieldName)(req, res, (err) => {
            // Manejo específico de errores de Multer
            if (err instanceof multer.MulterError) {
                // Limpiar archivo temporal si existe
                if (req.file && req.file.path) {
                    fs.unlink(req.file.path, () => {});
                }
                
                switch (err.code) {
                    case 'LIMIT_FILE_SIZE':
                        return res.status(400).json({
                            success: false,
                            statusCode: 400,
                            message: 'El archivo es demasiado grande. Tamaño máximo: 10MB',
                            error: 'FILE_TOO_LARGE'
                        });
                    
                    case 'LIMIT_FILE_COUNT':
                        return res.status(400).json({
                            success: false,
                            statusCode: 400,
                            message: 'Solo se permite un archivo',
                            error: 'TOO_MANY_FILES'
                        });
                    
                    case 'LIMIT_UNEXPECTED_FILE':
                        return res.status(400).json({
                            success: false,
                            statusCode: 400,
                            message: 'Campo de archivo no esperado',
                            error: 'UNEXPECTED_FIELD'
                        });
                    
                    case 'LIMIT_PART_COUNT':
                        return res.status(400).json({
                            success: false,
                            statusCode: 400,
                            message: 'Demasiadas partes en el formulario',
                            error: 'TOO_MANY_PARTS'
                        });
                    
                    case 'LIMIT_FIELD_KEY':
                        return res.status(400).json({
                            success: false,
                            statusCode: 400,
                            message: 'Nombre de campo demasiado largo',
                            error: 'FIELD_NAME_TOO_LONG'
                        });
                    
                    case 'LIMIT_FIELD_VALUE':
                        return res.status(400).json({
                            success: false,
                            statusCode: 400,
                            message: 'Valor de campo demasiado largo',
                            error: 'FIELD_VALUE_TOO_LONG'
                        });
                    
                    default:
                        return res.status(400).json({
                            success: false,
                            statusCode: 400,
                            message: 'Error al procesar el archivo',
                            error: 'UPLOAD_ERROR'
                        });
                }
            }
            
            // Manejo de errores personalizados (fileFilter)
            else if (err) {
                if (err.message === 'INVALID_FILE_TYPE') {
                    return res.status(400).json({
                        success: false,
                        statusCode: 400,
                        message: 'Tipo de archivo no válido. Solo se permiten: JPG, PNG, WEBP',
                        error: 'INVALID_FILE_TYPE'
                    });
                }
                
                if (err.message === 'INVALID_FILE_EXTENSION') {
                    return res.status(400).json({
                        success: false,
                        statusCode: 400,
                        message: 'Extensión de archivo no válida',
                        error: 'INVALID_FILE_EXTENSION'
                    });
                }
                
                return res.status(400).json({
                    success: false,
                    statusCode: 400,
                    message: err.message || 'Error al procesar el archivo',
                    error: 'PROCESSING_ERROR'
                });
            }
            
            // Validación adicional del archivo subido
            if (req.file) {
                // Verificar que el archivo realmente existe
                if (!fs.existsSync(req.file.path)) {
                    return res.status(500).json({
                        success: false,
                        statusCode: 500,
                        message: 'Error interno: archivo no guardado correctamente',
                        error: 'FILE_NOT_SAVED'
                    });
                }
                
                
            }
            
            next();
        });
    };
};

// Middleware para validar que se subió un archivo (cuando es requerido)
export const requireImage = (req, res, next) => {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            statusCode: 400,
            message: 'Se requiere una imagen',
            error: 'MISSING_FILE'
        });
    }
    next();
};

// Middleware para limpiar archivos temporales en caso de error
export const cleanupOnError = (err, req, res, next) => {
    if (req.file && req.file.path) {
        fs.unlink(req.file.path, (unlinkErr) => {
            if (unlinkErr) {
                console.error('Error al eliminar archivo temporal:', unlinkErr);
            }
        });
    }
    next(err);
};

// Función utilitaria para eliminar archivo
export const deleteFile = (filePath) => {
    return new Promise((resolve) => {
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error('Error al eliminar archivo:', err);
            }
            resolve();
        });
    });
};

export default { secureImageUpload, requireImage, cleanupOnError, deleteFile };