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

export const iconFillColor = (isDarkMode) => {
    return {
        fillColor: isDarkMode ? '#FFFFFF' : '#000000',
    };
};

export const getURL = (assetPath) => {
    const optionUrl = window.extensionOptions?.optionPageURL ?? '';
    try {
        const url = new URL(optionUrl);
        return `${url.origin}/${assetPath}`;
    } catch (error) {
        return assetPath;
    }
};

const bigIntToStrTransformer = (key, value, context) => {
    if (typeof value === 'number' && value > Number.MAX_SAFE_INTEGER) {
        return String(context.source);
    }
    return value;
};

export const parseJson = (jsonStr) => {
    return JSON.parse(jsonStr, bigIntToStrTransformer);
};
