/**
 * DonorHub API Service
 * Handles all communication with Oracle APEX REST APIs
 */

class APIService {
    constructor() {
        this.baseUrl = CONFIG.API_URL;
        this.authToken = null;
        this.isConnected = false;
    }

    /**
     * Initialize the API service
     */
    async init() {
        if (CONFIG.APP.DEMO_MODE) {
            console.log('🔶 Running in DEMO MODE - using mock data');
            this.updateConnectionStatus('demo');
            return true;
        }

        try {
            await this.authenticate();
            await this.testConnection();
            this.updateConnectionStatus('connected');
            return true;
        } catch (error) {
            console.error('API initialization failed:', error);
            this.updateConnectionStatus('disconnected');
            return false;
        }
    }

    /**
     * Authenticate with Oracle APEX
     */
    async authenticate() {
        if (CONFIG.AUTH_TYPE === 'none') {
            return true;
        }

        if (CONFIG.AUTH_TYPE === 'oauth2') {
            try {
                const response = await fetch(CONFIG.OAUTH.TOKEN_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        grant_type: 'client_credentials',
                        client_id: CONFIG.OAUTH.CLIENT_ID,
                        client_secret: CONFIG.OAUTH.CLIENT_SECRET,
                    }),
                });

                if (!response.ok) {
                    throw new Error('Authentication failed');
                }

                const data = await response.json();
                this.authToken = data.access_token;
                return true;
            } catch (error) {
                console.error('OAuth2 authentication failed:', error);
                throw error;
            }
        }

        return true;
    }

    /**
     * Test API connection
     */
    async testConnection() {
        try {
            const response = await this.request('GET', CONFIG.ENDPOINTS.DASHBOARD);
            this.isConnected = true;
            return true;
        } catch (error) {
            this.isConnected = false;
            throw error;
        }
    }

    /**
     * Update connection status indicator
     */
    updateConnectionStatus(status) {
        const statusEl = document.getElementById('connectionStatus');
        if (!statusEl) return;

        statusEl.className = 'connection-status ' + status;
        
        const statusText = {
            connected: 'Connected to Oracle APEX',
            disconnected: 'Disconnected - Click to retry',
            demo: 'Demo Mode - Configure APEX connection'
        };

        statusEl.innerHTML = `
            <i class="fas fa-circle"></i>
            <span>${statusText[status]}</span>
        `;

        if (status === 'disconnected') {
            statusEl.style.cursor = 'pointer';
            statusEl.onclick = () => this.init();
        }
    }

    /**
     * Get request headers
     */
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json',
        };

        if (this.authToken) {
            headers['Authorization'] = `Bearer ${this.authToken}`;
        }

        return headers;
    }

    /**
     * Make API request
     */
    async request(method, endpoint, data = null, params = {}) {
        // Use mock data in demo mode
        if (CONFIG.APP.DEMO_MODE) {
            return this.getMockData(endpoint, params);
        }

        let url = this.baseUrl + endpoint;
        
        // Add query parameters
        if (Object.keys(params).length > 0) {
            const queryString = new URLSearchParams(params).toString();
            url += '?' + queryString;
        }

        const options = {
            method,
            headers: this.getHeaders(),
        };

        if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(url, options);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    /**
     * GET request
     */
    async get(endpoint, params = {}) {
        return this.request('GET', endpoint, null, params);
    }

    /**
     * POST request
     */
    async post(endpoint, data) {
        return this.request('POST', endpoint, data);
    }

    /**
     * PUT request
     */
    async put(endpoint, data) {
        return this.request('PUT', endpoint, data);
    }

    /**
     * DELETE request
     */
    async delete(endpoint) {
        return this.request('DELETE', endpoint);
    }

    // ========================================
    // API Methods - Donors
    // ========================================

    async getDonors(params = {}) {
        return this.get(CONFIG.ENDPOINTS.DONORS, params);
    }

    async getDonorById(id) {
        return this.get(CONFIG.ENDPOINTS.DONOR_BY_ID.replace(':id', id));
    }

    async createDonor(data) {
        return this.post(CONFIG.ENDPOINTS.DONORS, data);
    }

    async updateDonor(id, data) {
        return this.put(CONFIG.ENDPOINTS.DONOR_BY_ID.replace(':id', id), data);
    }

    async deleteDonor(id) {
        return this.delete(CONFIG.ENDPOINTS.DONOR_BY_ID.replace(':id', id));
    }

    async getTopDonors(limit = 5) {
        return this.get(CONFIG.ENDPOINTS.TOP_DONORS, { limit });
    }

    // ========================================
    // API Methods - Donations
    // ========================================

    async getDonations(params = {}) {
        return this.get(CONFIG.ENDPOINTS.DONATIONS, params);
    }

    async getDonationById(id) {
        return this.get(CONFIG.ENDPOINTS.DONATION_BY_ID.replace(':id', id));
    }

    async createDonation(data) {
        return this.post(CONFIG.ENDPOINTS.DONATIONS, data);
    }

    async getRecentDonations(limit = 10) {
        return this.get(CONFIG.ENDPOINTS.RECENT_DONATIONS, { limit });
    }

    async getDonationStatistics(months = 12) {
        return this.get(CONFIG.ENDPOINTS.DONATION_STATS, { months });
    }

    // ========================================
    // API Methods - Campaigns
    // ========================================

    async getCampaigns(params = {}) {
        return this.get(CONFIG.ENDPOINTS.CAMPAIGNS, params);
    }

    async getCampaignById(id) {
        return this.get(CONFIG.ENDPOINTS.CAMPAIGN_BY_ID.replace(':id', id));
    }

    async createCampaign(data) {
        return this.post(CONFIG.ENDPOINTS.CAMPAIGNS, data);
    }

    async getActiveCampaigns() {
        return this.get(CONFIG.ENDPOINTS.ACTIVE_CAMPAIGNS);
    }

    async getCampaignProgress() {
        return this.get(CONFIG.ENDPOINTS.CAMPAIGN_PROGRESS);
    }

    // ========================================
    // API Methods - Revenue & Expenses
    // ========================================

    async getRevenue(params = {}) {
        return this.get(CONFIG.ENDPOINTS.REVENUE, params);
    }

    async getExpenses(params = {}) {
        return this.get(CONFIG.ENDPOINTS.EXPENSES, params);
    }

    async getFinancialSummary(startDate, endDate) {
        return this.get(CONFIG.ENDPOINTS.FINANCIAL_SUMMARY, { startDate, endDate });
    }

    // ========================================
    // API Methods - Inventory
    // ========================================

    async getInventory(params = {}) {
        return this.get(CONFIG.ENDPOINTS.INVENTORY, params);
    }

    async getInventoryAlerts() {
        return this.get(CONFIG.ENDPOINTS.INVENTORY_ALERTS);
    }

    // ========================================
    // API Methods - Dashboard
    // ========================================

    async getDashboardData() {
        return this.get(CONFIG.ENDPOINTS.DASHBOARD);
    }

    // ========================================
    // Mock Data for Demo Mode
    // ========================================

    getMockData(endpoint, params = {}) {
        return new Promise((resolve) => {
            // Simulate network delay
            setTimeout(() => {
                resolve(this.generateMockData(endpoint, params));
            }, 300);
        });
    }

    generateMockData(endpoint, params) {
        // Dashboard data
        if (endpoint === CONFIG.ENDPOINTS.DASHBOARD) {
            return {
                ytd_donations: 2795500,
                active_donors: 13,
                active_campaigns: 3,
                ytd_revenue: 1844000,
                ytd_expenses: 1208000,
                net_revenue: 636000
            };
        }

        // Recent donations
        if (endpoint === CONFIG.ENDPOINTS.RECENT_DONATIONS) {
            return {
                items: [
                    { donation_id: 1, donor_name: 'Love Education Foundation', amount: 1000000, campaign_name: 'Hope School Project', donation_date: '2024-02-01', payment_status: 'COMPLETED' },
                    { donation_id: 2, donor_name: 'Sunshine Tech Co.', amount: 500000, campaign_name: 'Hope School Project', donation_date: '2024-04-01', payment_status: 'COMPLETED' },
                    { donation_id: 3, donor_name: 'Healthy China Foundation', amount: 500000, campaign_name: 'Medical Aid Fund', donation_date: '2024-01-10', payment_status: 'COMPLETED' },
                    { donation_id: 4, donor_name: 'Huaxia Bank', amount: 300000, campaign_name: 'Annual Fundraising 2024', donation_date: '2024-01-20', payment_status: 'COMPLETED' },
                    { donation_id: 5, donor_name: 'Ming Zhang', amount: 200000, campaign_name: 'Hope School Project', donation_date: '2024-04-20', payment_status: 'COMPLETED' },
                    { donation_id: 6, donor_name: 'Ming Zhang', amount: 100000, campaign_name: 'Annual Fundraising 2024', donation_date: '2024-01-15', payment_status: 'COMPLETED' },
                    { donation_id: 7, donor_name: 'Green Leaf Tech', amount: 50000, campaign_name: 'Annual Fundraising 2024', donation_date: '2024-03-01', payment_status: 'COMPLETED' },
                    { donation_id: 8, donor_name: 'Jun Sun', amount: 15000, campaign_name: 'Medical Aid Fund', donation_date: '2024-03-15', payment_status: 'COMPLETED' },
                ]
            };
        }

        // Campaign progress
        if (endpoint === CONFIG.ENDPOINTS.CAMPAIGN_PROGRESS || endpoint === CONFIG.ENDPOINTS.ACTIVE_CAMPAIGNS) {
            return {
                items: [
                    { campaign_id: 1, campaign_name: 'Annual Fundraising 2024', goal_amount: 5000000, raised_amount: 1206500, progress_percent: 24.1, donor_count: 8, status: 'ACTIVE' },
                    { campaign_id: 2, campaign_name: 'Hope School Project', goal_amount: 2000000, raised_amount: 1715000, progress_percent: 85.8, donor_count: 5, status: 'ACTIVE' },
                    { campaign_id: 3, campaign_name: 'Medical Aid Fund', goal_amount: 3000000, raised_amount: 518000, progress_percent: 17.3, donor_count: 4, status: 'ACTIVE' },
                ]
            };
        }

        // Top donors
        if (endpoint === CONFIG.ENDPOINTS.TOP_DONORS) {
            return {
                items: [
                    { donor_id: 12, display_name: 'Love Education Foundation', donor_type: 'FOUNDATION', total_donations: 1000000, donation_count: 1, donor_level: 'DIAMOND' },
                    { donor_id: 9, display_name: 'Sunshine Tech Co.', donor_type: 'CORPORATE', total_donations: 600000, donation_count: 1, donor_level: 'PLATINUM' },
                    { donor_id: 13, display_name: 'Healthy China Foundation', donor_type: 'FOUNDATION', total_donations: 500000, donation_count: 1, donor_level: 'PLATINUM' },
                    { donor_id: 10, display_name: 'Huaxia Bank', donor_type: 'CORPORATE', total_donations: 300000, donation_count: 1, donor_level: 'GOLD' },
                    { donor_id: 1, display_name: 'Ming Zhang', donor_type: 'INDIVIDUAL', total_donations: 300000, donation_count: 2, donor_level: 'GOLD' },
                ]
            };
        }

        // Donation statistics
        if (endpoint === CONFIG.ENDPOINTS.DONATION_STATS) {
            return {
                items: [
                    { month: '2024-01', total_amount: 905000, donation_count: 4 },
                    { month: '2024-02', total_amount: 1005000, donation_count: 4 },
                    { month: '2024-03', total_amount: 68000, donation_count: 5 },
                    { month: '2024-04', total_amount: 711000, donation_count: 4 },
                    { month: '2024-05', total_amount: 3000, donation_count: 1 },
                ]
            };
        }

        // Donors list
        if (endpoint === CONFIG.ENDPOINTS.DONORS) {
            return {
                items: [
                    { donor_id: 1, display_name: 'Ming Zhang', donor_type: 'INDIVIDUAL', email: 'zhangming@email.com', phone: '010-12345678', city: 'Beijing', donor_level: 'GOLD', total_donations: 300000, status: 'ACTIVE' },
                    { donor_id: 2, display_name: 'Li Wang', donor_type: 'INDIVIDUAL', email: 'wangli@email.com', phone: '021-87654321', city: 'Shanghai', donor_level: 'BRONZE', total_donations: 8000, status: 'ACTIVE' },
                    { donor_id: 3, display_name: 'Qiang Li', donor_type: 'INDIVIDUAL', email: 'liqiang@email.com', phone: '020-11112222', city: 'Guangzhou', donor_level: 'BRONZE', total_donations: 8000, status: 'ACTIVE' },
                    { donor_id: 9, display_name: 'Sunshine Tech Co.', donor_type: 'CORPORATE', email: 'csr@suntech.com', phone: '010-88889999', city: 'Beijing', donor_level: 'PLATINUM', total_donations: 600000, status: 'ACTIVE' },
                    { donor_id: 10, display_name: 'Huaxia Bank', donor_type: 'CORPORATE', email: 'charity@huaxiabank.com', phone: '010-66667777', city: 'Beijing', donor_level: 'GOLD', total_donations: 300000, status: 'ACTIVE' },
                    { donor_id: 12, display_name: 'Love Education Foundation', donor_type: 'FOUNDATION', email: 'grants@loveedu.org', phone: '010-22223333', city: 'Beijing', donor_level: 'DIAMOND', total_donations: 1000000, status: 'ACTIVE' },
                ],
                total_count: 13,
                page: 1,
                page_size: 20
            };
        }

        // Default empty response
        return { items: [], total_count: 0 };
    }
}

// Create global API instance
const api = new APIService();
