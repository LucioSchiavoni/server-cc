import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Tipos de archivos permitidos
const MIME_TYPES = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp'
};

// Tamaño máximo permitido (2MB)
const MAX_FILE_SIZE = 2 * 1024 * 1024;

// Configuración del almacenamiento
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../uploads/'));
    },
    filename: function (req, file, cb) {
        const extension = MIME_TYPES[file.mimetype];
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + '.' + extension);
    }
});

// Filtro de archivos
const fileFilter = (req, file, cb) => {
    // Verificar tipo de archivo
    if (MIME_TYPES[file.mimetype]) {
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten archivos de imagen (JPG, PNG, WEBP)'), false);
    }
};

// Configuración de multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: MAX_FILE_SIZE
    }
});

// Middleware para manejar errores de multer
export const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                status: 400,
                message: 'El archivo es demasiado grande. Tamaño máximo: 2MB'
            });
        }
        return res.status(400).json({
            status: 400,
            message: 'Error al subir el archivo',
            error: err.message
        });
    } else if (err) {
        return res.status(400).json({
            status: 400,
            message: err.message
        });
    }
    next();
};

export default upload; 