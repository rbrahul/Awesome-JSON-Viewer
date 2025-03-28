const downloadFile = (fileContent, contentType, fileName) => {
    const downloadBtn = document.createElement('a');
    downloadBtn.id = 'rb-download-json';
    downloadBtn.download = fileName;
    downloadBtn.style = 'display:none;';
    downloadBtn.href =
        `data:${contentType};charset=utf-8,` +
        encodeURIComponent(fileContent);
    document.body.appendChild(downloadBtn);
    downloadBtn.click();
    setTimeout(() => {
        document.body.removeChild(downloadBtn);
    }, 500);
};

export default downloadFile;
