export const calculateFileSize = (size) => {
    for (let unit of ['bytes', 'KB', 'MB', 'GB', 'TB']) {
        if (size < 1000.0) {
            if (unit !== 'bytes') {
                size = size.toFixed(1);
            }
            return `${size} ${unit}`;
        }
        size /= 1000.0;
    }
    return size;
};
