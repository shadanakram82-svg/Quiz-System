// CSV Export Logic
const CSV = {
    exportToCSV: (headers, data, filename = 'export.csv') => {
        let csvContent = "data:text/csv;charset=utf-8,";
        
        // Add headers
        csvContent += headers.join(",") + "\r\n";
        
        // Add data rows
        data.forEach(row => {
            const rowString = row.map(item => {
                // Escape quotes and wrap in quotes if contains comma
                if (typeof item === 'string' && item.includes(',')) {
                    return `"${item.replace(/"/g, '""')}"`;
                }
                return item;
            }).join(",");
            csvContent += rowString + "\r\n";
        });

        // Create download link
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", filename);
        document.body.appendChild(link); // Required for FF
        
        link.click();
        
        document.body.removeChild(link);
    }
};
