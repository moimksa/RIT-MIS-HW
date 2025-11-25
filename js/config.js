/**
 * DonorHub Configuration
 * Configure your Oracle APEX connection settings here
 */

const CONFIG = {
    // ========================================
    // Oracle APEX REST API Configuration
    // ========================================
    
    // Your Oracle APEX workspace URL
    // Example: https://apex.oracle.com/pls/apex/your_workspace
    // Example: https://your-server.com/ords/your_schema
    APEX_BASE_URL: 'https://your-apex-instance.com/ords/your_schema',
    
    // REST API module path
    API_PATH: '/api/v1',
    
    // Get the full API URL
    get API_URL() {
        return this.APEX_BASE_URL + this.API_PATH;
    },
    
    // ========================================
    // Authentication Settings
    // ========================================
    
    // Authentication type: 'none', 'basic', 'oauth2', 'apex_session'
    AUTH_TYPE: 'oauth2',
    
    // OAuth2 settings (if using OAuth2)
    OAUTH: {
        CLIENT_ID: 'your_client_id',
        CLIENT_SECRET: 'your_client_secret',
        TOKEN_URL: 'https://your-apex-instance.com/ords/your_schema/oauth/token',
    },
    
    // ========================================
    // API Endpoints
    // ========================================
    
    ENDPOINTS: {
        // Dashboard
        DASHBOARD: '/dashboard',
        FINANCIAL_SUMMARY: '/financial-summary',
        
        // Donors
        DONORS: '/donors',
        DONOR_BY_ID: '/donors/:id',
        DONOR_SEARCH: '/donors/search',
        TOP_DONORS: '/donors/top',
        
        // Donations
        DONATIONS: '/donations',
        DONATION_BY_ID: '/donations/:id',
        RECENT_DONATIONS: '/donations/recent',
        DONATION_STATS: '/donations/statistics',
        
        // Campaigns
        CAMPAIGNS: '/campaigns',
        CAMPAIGN_BY_ID: '/campaigns/:id',
        ACTIVE_CAMPAIGNS: '/campaigns/active',
        CAMPAIGN_PROGRESS: '/campaigns/progress',
        
        // Revenue
        REVENUE: '/revenue',
        REVENUE_BY_ID: '/revenue/:id',
        REVENUE_SUMMARY: '/revenue/summary',
        
        // Expenses
        EXPENSES: '/expenses',
        EXPENSE_BY_ID: '/expenses/:id',
        EXPENSE_SUMMARY: '/expenses/summary',
        
        // Inventory
        INVENTORY: '/inventory',
        INVENTORY_BY_ID: '/inventory/:id',
        INVENTORY_ALERTS: '/inventory/alerts',
        
        // Reports
        REPORTS: '/reports',
        REPORT_GENERATE: '/reports/generate',
    },
    
    // ========================================
    // Application Settings
    // ========================================
    
    APP: {
        // Application name
        NAME: 'DonorHub',
        
        // Version
        VERSION: '1.0.0',
        
        // Default currency
        CURRENCY: 'USD',
        CURRENCY_SYMBOL: '$',
        
        // Date format
        DATE_FORMAT: 'MM/DD/YYYY',
        DATETIME_FORMAT: 'MM/DD/YYYY HH:mm',
        
        // Pagination
        DEFAULT_PAGE_SIZE: 20,
        PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
        
        // Auto-refresh interval (in milliseconds, 0 to disable)
        AUTO_REFRESH_INTERVAL: 0,
        
        // Demo mode (uses mock data instead of API)
        DEMO_MODE: true,
    },
    
    // ========================================
    // Donor Level Thresholds
    // ========================================
    
    DONOR_LEVELS: {
        BRONZE: { min: 0, max: 9999 },
        SILVER: { min: 10000, max: 99999 },
        GOLD: { min: 100000, max: 499999 },
        PLATINUM: { min: 500000, max: 999999 },
        DIAMOND: { min: 1000000, max: Infinity }
    },
    
    // ========================================
    // Chart Colors
    // ========================================
    
    CHART_COLORS: {
        primary: '#0d9488',
        accent: '#f56e3d',
        success: '#22c55e',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
        
        // Palette for multiple data series
        palette: [
            '#0d9488',
            '#f56e3d',
            '#3b82f6',
            '#22c55e',
            '#f59e0b',
            '#8b5cf6',
            '#ec4899',
            '#14b8a6'
        ],
        
        // Donor type colors
        donorTypes: {
            INDIVIDUAL: '#0d9488',
            CORPORATE: '#3b82f6',
            FOUNDATION: '#8b5cf6',
            GOVERNMENT: '#f59e0b',
            OTHER: '#6b7280'
        },
        
        // Donor level colors
        donorLevels: {
            BRONZE: '#cd7f32',
            SILVER: '#c0c0c0',
            GOLD: '#ffd700',
            PLATINUM: '#e5e4e2',
            DIAMOND: '#b9f2ff'
        }
    }
};

/**
 * Helper function to get endpoint URL with parameter substitution
 * @param {string} endpoint - The endpoint key from CONFIG.ENDPOINTS
 * @param {object} params - Object with parameter values
 * @returns {string} - The full URL with parameters replaced
 */
function getEndpointUrl(endpoint, params = {}) {
    let url = CONFIG.API_URL + CONFIG.ENDPOINTS[endpoint];
    
    // Replace path parameters
    Object.keys(params).forEach(key => {
        url = url.replace(`:${key}`, params[key]);
    });
    
    return url;
}

/**
 * Format currency value
 * @param {number} value - The numeric value
 * @returns {string} - Formatted currency string
 */
function formatCurrency(value) {
    if (value === null || value === undefined) return CONFIG.APP.CURRENCY_SYMBOL + '0';
    
    return CONFIG.APP.CURRENCY_SYMBOL + new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
}

/**
 * Format date
 * @param {string|Date} date - The date to format
 * @returns {string} - Formatted date string
 */
function formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

/**
 * Format number with abbreviation (e.g., 1.5K, 2.3M)
 * @param {number} value - The numeric value
 * @returns {string} - Abbreviated number string
 */
function formatNumber(value) {
    if (value >= 1000000) {
        return (value / 1000000).toFixed(1) + 'M';
    }
    if (value >= 1000) {
        return (value / 1000).toFixed(1) + 'K';
    }
    return value.toString();
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, getEndpointUrl, formatCurrency, formatDate, formatNumber };
}
