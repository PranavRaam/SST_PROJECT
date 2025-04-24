// Date and time formatting utilities
export const formatDate = (dateString) => {
    if (!dateString) return '';
    
    try {
        // Handle ISO format (YYYY-MM-DD)
        if (dateString.includes('-')) {
            const [year, month, day] = dateString.split('-');
            return `${month}/${day}/${year}`;
        }
        
        // Handle date objects
        if (dateString instanceof Date) {
            const month = (dateString.getMonth() + 1).toString().padStart(2, '0');
            const day = dateString.getDate().toString().padStart(2, '0');
            const year = dateString.getFullYear();
            return `${month}/${day}/${year}`;
        }
        
        // If already in MM/DD/YYYY format
        if (typeof dateString === 'string' && dateString.includes('/')) {
            const [month, day, year] = dateString.split('/');
            // Validate and pad the components
            if (month && day && year) {
                return `${month.padStart(2, '0')}/${day.padStart(2, '0')}/${year}`;
            }
        }
        
        // Try parsing as date for any other format
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
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
        let date;
        
        // If already in ISO format (YYYY-MM-DD)
        if (dateString.includes('-')) {
            return dateString;
        }
        
        // If in American format (MM/DD/YYYY)
        if (dateString.includes('/')) {
            const [month, day, year] = dateString.split('/');
            date = new Date(year, parseInt(month) - 1, day);
        } else {
            date = new Date(dateString);
        }
        
        if (isNaN(date.getTime())) {
            return dateString;
        }
        
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        return `${year}-${month}-${day}`;
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
        // If already in American format
        if (typeof dateString === 'string' && dateString.includes('/')) {
            const [month, day, year] = dateString.split('/');
            if (month && day && year) {
                return `${month.padStart(2, '0')}/${day.padStart(2, '0')}/${year}`;
            }
        }
        
        // If in ISO format
        if (typeof dateString === 'string' && dateString.includes('-')) {
            const [year, month, day] = dateString.split('-');
            return `${month}/${day}/${year}`;
        }
        
        // Try parsing as date
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            const year = date.getFullYear();
            return `${month}/${day}/${year}`;
        }
        
        return dateString;
    } catch (error) {
        console.error('Error converting to American format:', error);
        return dateString;
    }
}; 