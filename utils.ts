export function generateFileName(pattern: string, extension: string = 'webm'): string {
    const now = new Date();
    const date = now.toISOString().slice(0, 10); // YYYY-MM-DD
    const time = now.toTimeString().slice(0, 8).replace(/:/g, '-'); // HH-mm-ss
    
    let fileName = pattern
        .replace(/\[DATE\]/g, date)
        .replace(/\[TIME\]/g, time)
        .replace(/\[DATETIME\]/g, `${date}_${time}`);
    
    // Sanitize filename to remove invalid characters
    fileName = fileName.replace(/[<>:"/\\|?*]/g, '_');

    // Prevent empty filenames
    if (!fileName.trim()) {
        fileName = `KNOUX-REC-${date}_${time}`;
    }

    return `${fileName}.${extension}`;
}
