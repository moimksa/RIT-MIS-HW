# DonorHub - Donor Management System

A modern, responsive frontend for nonprofit donor management, designed to connect with Oracle APEX backend.

![Dashboard Preview](https://via.placeholder.com/800x400?text=DonorHub+Dashboard)

## Features

- **Dashboard** - Overview with KPIs, charts, and recent activity
- **Donor Management** - Full CRUD with demographics and segmentation
- **Donation Tracking** - Record and track all donation types
- **Campaign Management** - Track fundraising campaigns and progress
- **Financial Reports** - Revenue and expense tracking
- **Inventory Management** - Track products and supplies
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Demo Mode** - Works without backend for testing

## Quick Start

### Option 1: GitHub Pages Deployment

1. **Fork or clone this repository**
   ```bash
   git clone https://github.com/yourusername/donor-management-frontend.git
   ```

2. **Enable GitHub Pages**
   - Go to repository Settings → Pages
   - Source: Deploy from a branch
   - Branch: `main` (or `master`), folder: `/ (root)`
   - Click Save

3. **Access your site**
   - URL: `https://yourusername.github.io/donor-management-frontend/`

### Option 2: Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/donor-management-frontend.git
   cd donor-management-frontend
   ```

2. **Start a local server**
   ```bash
   # Using Python
   python -m http.server 8080
   
   # Using Node.js
   npx serve
   
   # Using PHP
   php -S localhost:8080
   ```

3. **Open in browser**
   - Navigate to `http://localhost:8080`

## Oracle APEX Configuration

### Step 1: Create REST Module in APEX

1. Go to **SQL Workshop** → **RESTful Services**
2. Create a new module:
   - Module Name: `donor_api`
   - Base Path: `/api/v1/`
   - Is Published: Yes

### Step 2: Create REST Templates

Create these templates in your module:

#### Dashboard Endpoint
```sql
-- Template: dashboard/
-- Method: GET
-- Source Type: Query
SELECT 
    (SELECT SUM(amount) FROM donations WHERE EXTRACT(YEAR FROM donation_date) = EXTRACT(YEAR FROM SYSDATE)) as ytd_donations,
    (SELECT COUNT(*) FROM donors WHERE status = 'ACTIVE') as active_donors,
    (SELECT COUNT(*) FROM campaigns WHERE status = 'ACTIVE') as active_campaigns,
    (SELECT SUM(amount) FROM revenue WHERE fiscal_year = EXTRACT(YEAR FROM SYSDATE)) as ytd_revenue,
    (SELECT SUM(amount) FROM expenses WHERE fiscal_year = EXTRACT(YEAR FROM SYSDATE)) as ytd_expenses
FROM dual
```

#### Donors Endpoint
```sql
-- Template: donors/
-- Method: GET
-- Source Type: Query
SELECT donor_id,
       COALESCE(first_name || ' ' || last_name, organization_name) as display_name,
       donor_type, email, phone, city, country,
       donor_level, total_donations, status
FROM donors
WHERE (:donor_type IS NULL OR donor_type = :donor_type)
  AND (:status IS NULL OR status = :status)
ORDER BY display_name
```

#### Recent Donations Endpoint
```sql
-- Template: donations/recent
-- Method: GET
-- Source Type: Query
SELECT d.donation_id,
       COALESCE(dn.first_name || ' ' || dn.last_name, dn.organization_name) as donor_name,
       d.amount, d.donation_date, d.payment_status,
       c.campaign_name
FROM donations d
JOIN donors dn ON d.donor_id = dn.donor_id
LEFT JOIN campaigns c ON d.campaign_id = c.campaign_id
ORDER BY d.donation_date DESC
FETCH FIRST 10 ROWS ONLY
```

#### Campaign Progress Endpoint
```sql
-- Template: campaigns/progress
-- Method: GET  
-- Source Type: Query
SELECT campaign_id, campaign_name, goal_amount, raised_amount,
       ROUND((raised_amount / NULLIF(goal_amount, 0)) * 100, 1) as progress_percent,
       donor_count, status
FROM campaigns
WHERE status IN ('ACTIVE', 'PLANNED')
ORDER BY status, end_date
```

### Step 3: Enable CORS

In APEX, add CORS headers to allow cross-origin requests:

1. Go to **Shared Components** → **Application Definition** → **Security**
2. Or add in your REST module's PL/SQL handler:

```sql
owa_util.mime_header('application/json', FALSE);
htp.p('Access-Control-Allow-Origin: *');
htp.p('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
htp.p('Access-Control-Allow-Headers: Content-Type, Authorization');
owa_util.http_header_close;
```

### Step 4: Configure Frontend

1. Open the application in your browser
2. Go to **Settings** page
3. Enter your APEX URL: `https://your-apex-instance.com/ords/your_schema`
4. Configure authentication if needed
5. Click **Test Connection**
6. Save and refresh

## Project Structure

```
donor-management-frontend/
├── index.html              # Dashboard page
├── css/
│   ├── main.css           # Global styles
│   ├── dashboard.css      # Dashboard-specific styles
│   └── pages.css          # Inner pages styles
├── js/
│   ├── config.js          # Configuration & constants
│   ├── api.js             # API service layer
│   ├── main.js            # Common functionality
│   ├── dashboard.js       # Dashboard logic
│   └── donors.js          # Donors page logic
├── pages/
│   ├── donors.html        # Donor management
│   ├── donations.html     # Donation tracking
│   ├── campaigns.html     # Campaign management
│   └── settings.html      # Configuration
└── README.md
```

## Configuration Options

Edit `js/config.js` to customize:

```javascript
const CONFIG = {
    // Oracle APEX Connection
    APEX_BASE_URL: 'https://your-apex.com/ords/schema',
    API_PATH: '/api/v1',
    
    // Authentication
    AUTH_TYPE: 'oauth2', // 'none', 'basic', 'oauth2'
    
    // Application Settings
    APP: {
        CURRENCY: 'USD',
        CURRENCY_SYMBOL: '$',
        DATE_FORMAT: 'MM/DD/YYYY',
        DEMO_MODE: true,  // Set to false for live data
    }
};
```

## Demo Mode

The application includes a demo mode with sample data for testing:

- 13 sample donors (individuals, corporations, foundations)
- 23 donation records
- 4 active campaigns
- Financial data (revenue/expenses)

To use demo mode, ensure `CONFIG.APP.DEMO_MODE = true` in config.js.

## Customization

### Changing Colors

Edit CSS variables in `css/main.css`:

```css
:root {
    --primary-500: #0d9488;  /* Main brand color */
    --accent-500: #f56e3d;   /* Accent color */
}
```

### Adding New Pages

1. Copy an existing page as template
2. Update navigation in sidebar
3. Create corresponding JS file
4. Add API endpoints as needed

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## License

MIT License - feel free to use for your nonprofit organization.

## Support

For issues or questions:
1. Check the Settings page for connection diagnostics
2. Review browser console for errors
3. Verify APEX REST endpoints are accessible

---

Built with ❤️ for nonprofit organizations
