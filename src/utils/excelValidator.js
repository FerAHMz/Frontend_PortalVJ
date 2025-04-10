export const validateExcelFile = (file) => {
    const errors = [];

    const validTypes = ['.xlsx', '.xls', '.csv'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!validTypes.includes(fileExtension)) {
        errors.push('El archivo debe ser de tipo .xlsx, .xls o .csv');
    }

    const maxSize = 5 * 1024 * 1024; // 5 MB
    if (file.size > maxSize) {
        errors.push('El archivo es demasiado grande. El tamaño máximo permitido es 5 MB.');
    }

    return {
        isValid: errors.length === 0,
        errors
    }
}