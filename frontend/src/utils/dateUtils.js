// Date and time formatting utilities
export const formatDate = (dateString) => {
    if (!dateString) return '';
    
    try {
        // Handle ISO format (YYYY-MM-DD)
        if (dateString.includes('-')) {
            const [year, month, day] = dateString.split('-');
            // Ensure we're using American format MM/DD/YYYY
            return `${month.padStart(2, '0')}/${day.padStart(2, '0')}/${year}`;
        }
        
        // Handle date objects
        if (dateString instanceof Date) {
            // Use American format MM/DD/YYYY
            const month = (dateString.getMonth() + 1).toString().padStart(2, '0');
            const day = dateString.getDate().toString().padStart(2, '0');
            const year = dateString.getFullYear();
            return `${month}/${day}/${year}`;
        }
        
        // If already in a format with slashes, check format and convert to MM/DD/YYYY
        if (typeof dateString === 'string' && dateString.includes('/')) {
            const parts = dateString.split('/');
            
            // If it's already in MM/DD/YYYY format (parts[0] is month, parts[1] is day)
            if (parts.length === 3) {
                const month = parts[0].padStart(2, '0');
                const day = parts[1].padStart(2, '0');
                const year = parts[2];
                
                // Ensure we're using valid month/day (if month > 12, it might be in DD/MM/YYYY format)
                if (parseInt(month) <= 12) {
                    return `${month}/${day}/${year}`;
                } else {
                    // If month > 12, it's probably in DD/MM/YYYY format, so convert to MM/DD/YYYY
                    return `${parts[1].padStart(2, '0')}/${parts[0].padStart(2, '0')}/${year}`;
                }
            }
        }
        
        // Try parsing as date for any other format
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
            // Use American format MM/DD/YYYY
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            const year = date.getFullYear();
            return `${month}/${day}/${year}`;
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
    
    // Convert to CST
    const cstDate = new Date(date.toLocaleString('en-US', { timeZone: 'America/Chicago' }));
    
    const month = String(cstDate.getMonth() + 1).padStart(2, '0');
    const day = String(cstDate.getDate()).padStart(2, '0');
    const year = cstDate.getFullYear();
    
    const hours = cstDate.getHours();
    const minutes = String(cstDate.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    
    return `${month}/${day}/${year} ${formattedHours}:${minutes} ${ampm} CST`;
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
        let month, day, year;
        
        // If already in American format
        if (typeof dateString === 'string' && dateString.includes('/')) {
            const parts = dateString.split('/');
            
            // Validate if it's already in MM/DD/YYYY format
            if (parts.length === 3) {
                const potentialMonth = parseInt(parts[0]);
                
                // If the first part is a valid month (1-12)
                if (potentialMonth >= 1 && potentialMonth <= 12) {
                    return `${parts[0].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[2]}`;
                } 
                // If it's in DD/MM/YYYY format, swap day and month
                else {
                    return `${parts[1].padStart(2, '0')}/${parts[0].padStart(2, '0')}/${parts[2]}`;
                }
            }
        }
        
        // If in ISO format
        if (typeof dateString === 'string' && dateString.includes('-')) {
            [year, month, day] = dateString.split('-');
            return `${month}/${day}/${year}`;
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