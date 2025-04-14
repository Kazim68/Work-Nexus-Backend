
const excelDateToJS = (serial) => {
    const utcDays = serial - 25569;
    const utcTime = utcDays * 86400 * 1000;
    return new Date(utcTime);
};


module.exports = excelDateToJS