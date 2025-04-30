// Date and time formatting utilities
export const formatDate = (dateString) => {
    if (!dateString) return '';
    
    try {
        // First try to parse with explicit American format
        const americanFormatRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/(\d{4})$/;
        if (americanFormatRegex.test(dateString)) {
            return dateString; // Already in correct format
        }

        // Handle ISO format (YYYY-MM-DD)
        if (typeof dateString === 'string' && dateString.includes('-')) {
            const [year, month, day] = dateString.split('-');
            if (year && month && day) {
                return `${month.padStart(2, '0')}/${day.padStart(2, '0')}/${year}`;
            }
        }
        
        // Handle date objects
        if (dateString instanceof Date) {
            const month = (dateString.getMonth() + 1).toString().padStart(2, '0');
            const day = dateString.getDate().toString().padStart(2, '0');
            const year = dateString.getFullYear();
            return `${month}/${day}/${year}`;
        }
        
        // If in format with slashes, ensure MM/DD/YYYY
        if (typeof dateString === 'string' && dateString.includes('/')) {
            const parts = dateString.split('/');
            if (parts.length === 3) {
                const [first, second, third] = parts;
                const firstNum = parseInt(first);
                const secondNum = parseInt(second);
                
                // If first number is clearly a month (1-12)
                if (firstNum >= 1 && firstNum <= 12) {
                    return `${first.padStart(2, '0')}/${second.padStart(2, '0')}/${third}`;
                }
                // If first number is clearly a day (13-31)
                else if (firstNum > 12 && firstNum <= 31 && secondNum >= 1 && secondNum <= 12) {
                    return `${second.padStart(2, '0')}/${first.padStart(2, '0')}/${third}`;
                }
            }
        }
        
        // Try parsing as date with explicit US locale
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
            return date.toLocaleDateString('en-US', {
                month: '2-digit',
                day: '2-digit',
                year: 'numeric',
            }).replace(/(\d+)\/(\d+)\/(\d+)/, (_, m, d, y) => {
                return `${m.padStart(2, '0')}/${d.padStart(2, '0')}/${y}`;
            });
        }
        
        return dateString; // Return original if all parsing fails
    } catch (error) {
        console.error('Error formatting date:', error);
        return dateString;
    }
};

export const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '';
    const date = new Date(dateTimeString);
    if (isNaN(date.getTime())) return dateTimeString;
    
    // Convert to CST and format with explicit US locale
    return date.toLocaleString('en-US', {
        timeZone: 'America/Chicago',
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZoneName: 'short'
    }).replace(/(\d+)\/(\d+)\/(\d+)/, (_, m, d, y) => {
        return `${m.padStart(2, '0')}/${d.padStart(2, '0')}/${y}`;
    });
};

export const parseDateInput = (dateString) => {
    if (!dateString) return '';
    
    try {
        let month, day, year;
        
        // If in ISO format (YYYY-MM-DD)
        if (dateString.includes('-')) {
            [year, month, day] = dateString.split('-');
            // Convert to MM/DD/YYYY American format
            return `${month.padStart(2, '0')}/${day.padStart(2, '0')}/${year}`;
        }
        
        // If already in American format (MM/DD/YYYY)
        if (dateString.includes('/')) {
            [month, day, year] = dateString.split('/');
            // Just ensure proper padding
            return `${month.padStart(2, '0')}/${day.padStart(2, '0')}/${year}`;
        }
        
        // Try parsing as date
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
            month = (date.getMonth() + 1).toString().padStart(2, '0');
            day = date.getDate().toString().padStart(2, '0');
            year = date.getFullYear();
            return `${month}/${day}/${year}`;
        }
        
        return dateString;
    } catch (error) {
        console.error('Error parsing date:', error);
        return dateString;
    }
};

export const getCurrentDateTime = () => {
    const now = new Date();
    const cstDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/Chicago' }));
    
    const month = String(cstDate.getMonth() + 1).padStart(2, '0');
    const day = String(cstDate.getDate()).padStart(2, '0');
    const year = cstDate.getFullYear();
    
    const hours = cstDate.getHours();
    const minutes = String(cstDate.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    
    return {
        date: `${month}/${day}/${year}`,
        time: `${formattedHours}:${minutes} ${ampm} CST`,
        isoString: cstDate.toISOString()
    };
};

// Helper function to convert any date format to American format (MM/DD/YYYY)
export const toAmericanFormat = (dateString) => {
    if (!dateString) return '';
    
    try {
        // First check if already in American format
        const americanFormatRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/(\d{4})$/;
        if (americanFormatRegex.test(dateString)) {
            return dateString;
        }

        // Try parsing with explicit US locale
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
            return date.toLocaleDateString('en-US', {
                month: '2-digit',
                day: '2-digit',
                year: 'numeric'
            }).replace(/(\d+)\/(\d+)\/(\d+)/, (_, m, d, y) => {
                return `${m.padStart(2, '0')}/${d.padStart(2, '0')}/${y}`;
            });
        }
        
        return dateString;
    } catch (error) {
        console.error('Error converting to American format:', error);
        return dateString;
    }
};

// Helper function to convert MM/DD/YYYY to YYYY-MM-DD (for HTML date inputs)
export const toHTMLDateFormat = (dateString) => {
    if (!dateString) return '';
    
    try {
        let month, day, year;
        
        // If in American format (MM/DD/YYYY)
        if (dateString.includes('/')) {
            [month, day, year] = dateString.split('/');
            // Make sure each component is valid
            if (!month || !day || !year || isNaN(parseInt(month)) || isNaN(parseInt(day)) || isNaN(parseInt(year))) {
                throw new Error('Invalid date components');
            }
            // Pad with zeros if needed
            month = month.padStart(2, '0');
            day = day.padStart(2, '0');
            return `${year}-${month}-${day}`;
        }
        
        // If using dashes already (MM-DD-YYYY)
        if (dateString.includes('-')) {
            // Check if it's already in YYYY-MM-DD format
            if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
                return dateString;
            }
            
            // Otherwise, assume it's MM-DD-YYYY
            [month, day, year] = dateString.split('-');
            // Make sure each component is valid
            if (!month || !day || !year || isNaN(parseInt(month)) || isNaN(parseInt(day)) || isNaN(parseInt(year))) {
                throw new Error('Invalid date components');
            }
            // Pad with zeros if needed
            month = month.padStart(2, '0');
            day = day.padStart(2, '0');
            return `${year}-${month}-${day}`;
        }
        
        // Try parsing as date
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
            year = date.getFullYear();
            month = (date.getMonth() + 1).toString().padStart(2, '0');
            day = date.getDate().toString().padStart(2, '0');
            return `${year}-${month}-${day}`;
        }
        
        return ''; // Return empty string for invalid dates
    } catch (error) {
        console.error('Error converting to HTML date format:', error);
        return '';
    }
}; 