import React, { useState, useEffect, useMemo } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts';
import { Users, Heart, Gift, Calendar, DollarSign, UserCheck, ChevronRight, Search, Menu, X, TrendingUp, Clock, Package, Building2 } from 'lucide-react';

// ============================================================================
// CONFIGURATION
// ============================================================================

const API_BASE = 'https://oracleapex.com/ords/nathan_mks/api/v1';

const ROUTES = {
  DASHBOARD: '',
  DONORS: 'donors',
  DONATIONS: 'donations',
  PERSONNEL: 'personnel',
  SCHEDULES: 'schedules',
  PAYMENTS: 'payments',
  GIFTS: 'gifts',
  DISTRIBUTIONS: 'distributions',
};

const COLORS = {
  primary: '#1a5f4a',
  primaryLight: '#2d8a6e',
  primaryDark: '#0f3d30',
  accent: '#d4a853',
  accentLight: '#e8c97a',
  background: '#faf9f7',
  surface: '#ffffff',
  surfaceAlt: '#f5f3f0',
  text: '#1a1a1a',
  textMuted: '#6b6b6b',
  border: '#e5e2dd',
  success: '#2d8a6e',
  warning: '#d4a853',
  error: '#c45c4a',
};

const CHART_COLORS = ['#1a5f4a', '#2d8a6e', '#4aa88a', '#d4a853', '#e8c97a', '#8b7355', '#c45c4a', '#6b8e8a'];

// ============================================================================
// UTILITIES
// ============================================================================

async function fetchData(endpoint) {
  const response = await fetch(`${API_BASE}${endpoint}`);
  const data = await response.json();
  return data.items || data;
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
}

function formatDate(dateString) {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateShort(dateString) {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ============================================================================
// STYLES
// ============================================================================

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap');

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  :root {
    --primary: ${COLORS.primary};
    --primary-light: ${COLORS.primaryLight};
    --primary-dark: ${COLORS.primaryDark};
    --accent: ${COLORS.accent};
    --accent-light: ${COLORS.accentLight};
    --background: ${COLORS.background};
    --surface: ${COLORS.surface};
    --surface-alt: ${COLORS.surfaceAlt};
    --text: ${COLORS.text};
    --text-muted: ${COLORS.textMuted};
    --border: ${COLORS.border};
  }

  body {
    font-family: 'DM Sans', sans-serif;
    background: var(--background);
    color: var(--text);
    line-height: 1.6;
  }

  .app-container {
    display: flex;
    min-height: 100vh;
  }

  /* Sidebar */
  .sidebar {
    width: 280px;
    background: linear-gradient(180deg, var(--primary-dark) 0%, var(--primary) 100%);
    color: white;
    padding: 32px 0;
    position: fixed;
    height: 100vh;
    display: flex;
    flex-direction: column;
    z-index: 100;
    transition: transform 0.3s ease;
  }

  .sidebar-header {
    padding: 0 28px 32px;
    border-bottom: 1px solid rgba(255,255,255,0.1);
    margin-bottom: 24px;
  }

  .sidebar-logo {
    font-family: 'Cormorant Garamond', serif;
    font-size: 28px;
    font-weight: 600;
    letter-spacing: -0.5px;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .sidebar-logo-icon {
    width: 40px;
    height: 40px;
    background: var(--accent);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .sidebar-nav {
    flex: 1;
    padding: 0 16px;
  }

  .nav-section {
    margin-bottom: 24px;
  }

  .nav-section-title {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: rgba(255,255,255,0.4);
    padding: 0 12px;
    margin-bottom: 8px;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border-radius: 10px;
    color: rgba(255,255,255,0.7);
    text-decoration: none;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s ease;
    cursor: pointer;
    margin-bottom: 4px;
  }

  .nav-item:hover {
    background: rgba(255,255,255,0.1);
    color: white;
  }

  .nav-item.active {
    background: rgba(255,255,255,0.15);
    color: white;
  }

  .nav-item.active::before {
    content: '';
    position: absolute;
    left: 0;
    width: 3px;
    height: 24px;
    background: var(--accent);
    border-radius: 0 3px 3px 0;
  }

  .nav-icon {
    width: 20px;
    height: 20px;
    opacity: 0.8;
  }

  /* Main Content */
  .main-content {
    flex: 1;
    margin-left: 280px;
    padding: 32px 40px;
    min-height: 100vh;
  }

  .page-header {
    margin-bottom: 32px;
  }

  .page-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 36px;
    font-weight: 600;
    color: var(--text);
    letter-spacing: -0.5px;
    margin-bottom: 8px;
  }

  .page-subtitle {
    color: var(--text-muted);
    font-size: 15px;
  }

  /* Stats Grid */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 20px;
    margin-bottom: 32px;
  }

  .stat-card {
    background: var(--surface);
    border-radius: 16px;
    padding: 24px;
    border: 1px solid var(--border);
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
  }

  .stat-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--primary), var(--accent));
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.08);
  }

  .stat-card:hover::before {
    opacity: 1;
  }

  .stat-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
  }

  .stat-icon.green { background: rgba(26, 95, 74, 0.1); color: var(--primary); }
  .stat-icon.gold { background: rgba(212, 168, 83, 0.1); color: var(--accent); }
  .stat-icon.teal { background: rgba(45, 138, 110, 0.1); color: var(--primary-light); }

  .stat-value {
    font-size: 32px;
    font-weight: 700;
    color: var(--text);
    margin-bottom: 4px;
    font-family: 'DM Sans', sans-serif;
  }

  .stat-label {
    color: var(--text-muted);
    font-size: 14px;
    font-weight: 500;
  }

  /* Cards & Tables */
  .card {
    background: var(--surface);
    border-radius: 16px;
    border: 1px solid var(--border);
    overflow: hidden;
    margin-bottom: 24px;
  }

  .card-header {
    padding: 20px 24px;
    border-bottom: 1px solid var(--border);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .card-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 20px;
    font-weight: 600;
    color: var(--text);
  }

  .card-body {
    padding: 24px;
  }

  .data-table {
    width: 100%;
    border-collapse: collapse;
  }

  .data-table th {
    text-align: left;
    padding: 14px 16px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--text-muted);
    background: var(--surface-alt);
    border-bottom: 1px solid var(--border);
  }

  .data-table td {
    padding: 16px;
    border-bottom: 1px solid var(--border);
    font-size: 14px;
    vertical-align: middle;
  }

  .data-table tr:last-child td {
    border-bottom: none;
  }

  .data-table tr:hover td {
    background: var(--surface-alt);
  }

  /* Badges */
  .badge {
    display: inline-flex;
    align-items: center;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
  }

  .badge-primary { background: rgba(26, 95, 74, 0.1); color: var(--primary); }
  .badge-accent { background: rgba(212, 168, 83, 0.15); color: #9a7b30; }
  .badge-success { background: rgba(45, 138, 110, 0.1); color: var(--success); }
  .badge-warning { background: rgba(212, 168, 83, 0.15); color: #9a7b30; }
  .badge-muted { background: var(--surface-alt); color: var(--text-muted); }

  /* Grid Layouts */
  .grid-2 {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }

  .grid-3 {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }

  /* Search Bar */
  .search-bar {
    position: relative;
    margin-bottom: 24px;
  }

  .search-input {
    width: 100%;
    max-width: 400px;
    padding: 12px 16px 12px 44px;
    border: 1px solid var(--border);
    border-radius: 10px;
    font-size: 14px;
    background: var(--surface);
    transition: all 0.2s ease;
  }

  .search-input:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(26, 95, 74, 0.1);
  }

  .search-icon {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-muted);
    width: 18px;
    height: 18px;
  }

  /* Chart Container */
  .chart-container {
    height: 300px;
    margin-top: 16px;
  }

  /* List Items */
  .list-item {
    display: flex;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid var(--border);
    transition: background 0.2s ease;
  }

  .list-item:last-child {
    border-bottom: none;
  }

  .list-item:hover {
    background: var(--surface-alt);
  }

  .list-item-avatar {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: linear-gradient(135deg, var(--primary), var(--primary-light));
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 16px;
    margin-right: 16px;
  }

  .list-item-content {
    flex: 1;
  }

  .list-item-title {
    font-weight: 600;
    color: var(--text);
    margin-bottom: 2px;
  }

  .list-item-subtitle {
    font-size: 13px;
    color: var(--text-muted);
  }

  .list-item-value {
    font-weight: 600;
    color: var(--primary);
  }

  /* Mobile Menu Toggle */
  .mobile-menu-toggle {
    display: none;
    position: fixed;
    top: 16px;
    left: 16px;
    z-index: 200;
    width: 44px;
    height: 44px;
    border-radius: 10px;
    background: var(--primary);
    color: white;
    border: none;
    cursor: pointer;
    align-items: center;
    justify-content: center;
  }

  /* Animations */
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .animate-in {
    animation: fadeIn 0.4s ease forwards;
  }

  .delay-1 { animation-delay: 0.1s; }
  .delay-2 { animation-delay: 0.2s; }
  .delay-3 { animation-delay: 0.3s; }
  .delay-4 { animation-delay: 0.4s; }

  /* Responsive */
  @media (max-width: 1024px) {
    .grid-2, .grid-3 {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 768px) {
    .sidebar {
      transform: translateX(-100%);
    }

    .sidebar.open {
      transform: translateX(0);
    }

    .main-content {
      margin-left: 0;
      padding: 80px 20px 20px;
    }

    .mobile-menu-toggle {
      display: flex;
    }

    .stats-grid {
      grid-template-columns: 1fr;
    }

    .page-title {
      font-size: 28px;
    }
  }
`;

// ============================================================================
// COMPONENTS
// ============================================================================

function Sidebar({ currentRoute, onNavigate, isOpen, onClose }) {
  const navItems = [
    { route: ROUTES.DASHBOARD, label: 'Dashboard', icon: TrendingUp },
    { route: ROUTES.DONORS, label: 'Donors', icon: Users },
    { route: ROUTES.DONATIONS, label: 'Donations', icon: Heart },
    { route: ROUTES.PERSONNEL, label: 'Personnel', icon: UserCheck },
    { route: ROUTES.SCHEDULES, label: 'Schedules', icon: Calendar },
    { route: ROUTES.PAYMENTS, label: 'Payments', icon: DollarSign },
    { route: ROUTES.GIFTS, label: 'Gift Types', icon: Package },
    { route: ROUTES.DISTRIBUTIONS, label: 'Distributions', icon: Gift },
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <Heart size={20} />
          </div>
          GiveWell
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          <div className="nav-section-title">Overview</div>
          {navItems.slice(0, 1).map(item => (
            <div
              key={item.route}
              className={`nav-item ${currentRoute === item.route ? 'active' : ''}`}
              onClick={() => { onNavigate(item.route); onClose(); }}
            >
              <item.icon className="nav-icon" />
              {item.label}
            </div>
          ))}
        </div>

        <div className="nav-section">
          <div className="nav-section-title">Fundraising</div>
          {navItems.slice(1, 3).map(item => (
            <div
              key={item.route}
              className={`nav-item ${currentRoute === item.route ? 'active' : ''}`}
              onClick={() => { onNavigate(item.route); onClose(); }}
            >
              <item.icon className="nav-icon" />
              {item.label}
            </div>
          ))}
        </div>

        <div className="nav-section">
          <div className="nav-section-title">Operations</div>
          {navItems.slice(3, 6).map(item => (
            <div
              key={item.route}
              className={`nav-item ${currentRoute === item.route ? 'active' : ''}`}
              onClick={() => { onNavigate(item.route); onClose(); }}
            >
              <item.icon className="nav-icon" />
              {item.label}
            </div>
          ))}
        </div>

        <div className="nav-section">
          <div className="nav-section-title">Gifts</div>
          {navItems.slice(6).map(item => (
            <div
              key={item.route}
              className={`nav-item ${currentRoute === item.route ? 'active' : ''}`}
              onClick={() => { onNavigate(item.route); onClose(); }}
            >
              <item.icon className="nav-icon" />
              {item.label}
            </div>
          ))}
        </div>
      </nav>
    </aside>
  );
}

function StatCard({ icon: Icon, value, label, color = 'green', delay = 0 }) {
  return (
    <div className={`stat-card animate-in delay-${delay}`}>
      <div className={`stat-icon ${color}`}>
        <Icon size={24} />
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

function SearchBar({ value, onChange, placeholder = 'Search...' }) {
  return (
    <div className="search-bar">
      <Search className="search-icon" />
      <input
        type="text"
        className="search-input"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );
}

// ============================================================================
// PAGES
// ============================================================================

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [recentDonations, setRecentDonations] = useState([]);
  const [donations, setDonations] = useState([]);

  useEffect(() => {
    fetchData('/stats/summary').then(setStats);
    fetchData('/stats/monthly').then(data => setMonthlyData(data || []));
    fetchData('/donations').then(data => {
      setDonations(data || []);
      setRecentDonations((data || []).slice(0, 5));
    });
  }, []);

  const categoryData = useMemo(() => {
    const grouped = donations.reduce((acc, d) => {
      acc[d.CATEGORY] = (acc[d.CATEGORY] || 0) + (d.AMOUNT || 0);
      return acc;
    }, {});
    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }, [donations]);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Overview of your organization's activity</p>
      </div>

      <div className="stats-grid">
        <StatCard icon={Users} value={stats?.TOTAL_DONORS || 0} label="Total Donors" color="green" delay={1} />
        <StatCard icon={Heart} value={stats?.TOTAL_DONATIONS || 0} label="Donations" color="gold" delay={2} />
        <StatCard icon={DollarSign} value={formatCurrency(stats?.TOTAL_AMOUNT)} label="Total Raised" color="teal" delay={3} />
        <StatCard icon={UserCheck} value={(stats?.TOTAL_EMPLOYEES || 0) + (stats?.TOTAL_VOLUNTEERS || 0)} label="Team Members" color="green" delay={4} />
      </div>

      <div className="grid-2">
        <div className="card animate-in delay-2">
          <div className="card-header">
            <h3 className="card-title">Monthly Donations</h3>
          </div>
          <div className="card-body">
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="MONTH" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={v => `$${v/1000}k`} />
                  <Tooltip formatter={v => formatCurrency(v)} />
                  <Area type="monotone" dataKey="TOTAL_AMOUNT" stroke={COLORS.primary} strokeWidth={2} fill="url(#colorAmount)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="card animate-in delay-3">
          <div className="card-header">
            <h3 className="card-title">By Category</h3>
          </div>
          <div className="card-body">
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {categoryData.map((entry, i) => (
                      <Cell key={entry.name} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={v => formatCurrency(v)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="card animate-in delay-4">
        <div className="card-header">
          <h3 className="card-title">Recent Donations</h3>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {recentDonations.map(d => (
            <div key={d.DONATION_ID} className="list-item">
              <div className="list-item-avatar">
                {(d.DONOR_NAME || 'A')[0]}
              </div>
              <div className="list-item-content">
                <div className="list-item-title">{d.DONOR_NAME || 'Anonymous'}</div>
                <div className="list-item-subtitle">{d.CATEGORY} · {formatDateShort(d.DONATION_DATE)}</div>
              </div>
              <div className="list-item-value">{formatCurrency(d.AMOUNT)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DonorsPage() {
  const [donors, setDonors] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchData('/donors').then(setDonors); }, []);

  const filtered = useMemo(() => {
    if (!search) return donors;
    const s = search.toLowerCase();
    return donors.filter(d =>
      `${d.FIRSTNAME} ${d.LASTNAME}`.toLowerCase().includes(s) ||
      (d.CONTACT_INFO || '').toLowerCase().includes(s)
    );
  }, [donors, search]);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Donors</h1>
        <p className="page-subtitle">Manage your donor relationships</p>
      </div>

      <SearchBar value={search} onChange={setSearch} placeholder="Search donors..." />

      <div className="card animate-in">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Contact</th>
              <th>Location</th>
              <th>Segment</th>
              <th>Age</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(d => (
              <tr key={d.DONOR_ID}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className="list-item-avatar" style={{ width: 36, height: 36, fontSize: 14 }}>
                      {d.FIRSTNAME?.[0]}{d.LASTNAME?.[0]}
                    </div>
                    <strong>{d.FIRSTNAME} {d.LASTNAME}</strong>
                  </div>
                </td>
                <td>{d.CONTACT_INFO || '—'}</td>
                <td>{d.LOCATION || '—'}</td>
                <td><span className="badge badge-primary">{d.DEMOGRAPHIC_SEGMENT || '—'}</span></td>
                <td>{d.AGE || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DonationsPage() {
  const [donations, setDonations] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchData('/donations').then(setDonations); }, []);

  const filtered = useMemo(() => {
    if (!search) return donations;
    const s = search.toLowerCase();
    return donations.filter(d =>
      (d.DONOR_NAME || '').toLowerCase().includes(s) ||
      (d.CATEGORY || '').toLowerCase().includes(s)
    );
  }, [donations, search]);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Donations</h1>
        <p className="page-subtitle">Track all donation records</p>
      </div>

      <SearchBar value={search} onChange={setSearch} placeholder="Search donations..." />

      <div className="card animate-in">
        <table className="data-table">
          <thead>
            <tr>
              <th>Donor</th>
              <th>Amount</th>
              <th>Category</th>
              <th>Source</th>
              <th>Date</th>
              <th>Tax Receipt</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(d => (
              <tr key={d.DONATION_ID}>
                <td><strong>{d.DONOR_NAME || 'Anonymous'}</strong></td>
                <td style={{ color: COLORS.primary, fontWeight: 600 }}>{formatCurrency(d.AMOUNT)}</td>
                <td><span className="badge badge-accent">{d.CATEGORY}</span></td>
                <td>{d.SOURCE}</td>
                <td>{formatDate(d.DONATION_DATE)}</td>
                <td>{d.REQUIRES_TAX_RECEIPT === 1 ? <span className="badge badge-success">Yes</span> : <span className="badge badge-muted">No</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PersonnelPage() {
  const [personnel, setPersonnel] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchData('/personnel').then(setPersonnel); }, []);

  const filtered = useMemo(() => {
    if (!search) return personnel;
    const s = search.toLowerCase();
    return personnel.filter(p =>
      `${p.FIRSTNAME} ${p.LASTNAME}`.toLowerCase().includes(s) ||
      (p.ROLE || '').toLowerCase().includes(s)
    );
  }, [personnel, search]);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Personnel</h1>
        <p className="page-subtitle">Employees and volunteers</p>
      </div>

      <SearchBar value={search} onChange={setSearch} placeholder="Search personnel..." />

      <div className="card animate-in">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Type</th>
              <th>Access Level</th>
              <th>Contact</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.PERSONNEL_ID}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className="list-item-avatar" style={{ width: 36, height: 36, fontSize: 14, background: p.IS_EMPLOYEE === 1 ? `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryLight})` : `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentLight})` }}>
                      {p.FIRSTNAME?.[0]}{p.LASTNAME?.[0]}
                    </div>
                    <strong>{p.FIRSTNAME} {p.LASTNAME}</strong>
                  </div>
                </td>
                <td>{p.ROLE}</td>
                <td>
                  {p.IS_EMPLOYEE === 1 && <span className="badge badge-primary" style={{ marginRight: 6 }}>Employee</span>}
                  {p.IS_VOLUNTEER === 1 && <span className="badge badge-accent">Volunteer</span>}
                </td>
                <td><span className="badge badge-muted">{p.ACCESS_LEVEL}</span></td>
                <td>{p.CONTACT_INFO || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SchedulesPage() {
  const [schedules, setSchedules] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchData('/schedules').then(setSchedules); }, []);

  const filtered = useMemo(() => {
    if (!search) return schedules;
    const s = search.toLowerCase();
    return schedules.filter(sc =>
      (sc.PERSONNEL_NAME || '').toLowerCase().includes(s) ||
      (sc.TYPE || '').toLowerCase().includes(s)
    );
  }, [schedules, search]);

  const statusColor = status => {
    switch (status) {
      case 'Available': return 'badge-success';
      case 'Busy': return 'badge-warning';
      default: return 'badge-muted';
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Schedules</h1>
        <p className="page-subtitle">Staff and volunteer scheduling</p>
      </div>

      <SearchBar value={search} onChange={setSearch} placeholder="Search schedules..." />

      <div className="card animate-in">
        <table className="data-table">
          <thead>
            <tr>
              <th>Personnel</th>
              <th>Date</th>
              <th>Time</th>
              <th>Type</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(sc => (
              <tr key={sc.SCHEDULE_ID}>
                <td><strong>{sc.PERSONNEL_NAME}</strong></td>
                <td>{formatDate(sc.SCHEDULE_DATE)}</td>
                <td>{sc.START_TIME} – {sc.END_TIME}</td>
                <td><span className="badge badge-accent">{sc.TYPE}</span></td>
                <td><span className={`badge ${statusColor(sc.AVAILABILITY_STATUS)}`}>{sc.AVAILABILITY_STATUS}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchData('/payments').then(setPayments); }, []);

  const filtered = useMemo(() => {
    if (!search) return payments;
    const s = search.toLowerCase();
    return payments.filter(p =>
      (p.PERSONNEL_NAME || '').toLowerCase().includes(s) ||
      (p.PAYMENT_TYPE || '').toLowerCase().includes(s)
    );
  }, [payments, search]);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Payments</h1>
        <p className="page-subtitle">Payroll and reimbursements</p>
      </div>

      <SearchBar value={search} onChange={setSearch} placeholder="Search payments..." />

      <div className="card animate-in">
        <table className="data-table">
          <thead>
            <tr>
              <th>Personnel</th>
              <th>Amount</th>
              <th>Type</th>
              <th>Date</th>
              <th>Category</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.PAYMENT_ID}>
                <td><strong>{p.PERSONNEL_NAME}</strong></td>
                <td style={{ color: COLORS.primary, fontWeight: 600 }}>{formatCurrency(p.AMOUNT)}</td>
                <td><span className="badge badge-accent">{p.PAYMENT_TYPE}</span></td>
                <td>{formatDate(p.PAYMENT_DATE)}</td>
                <td>{p.IS_EMPLOYEE_PAY === 1 ? <span className="badge badge-primary">Employee Pay</span> : <span className="badge badge-muted">Other</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function GiftTypesPage() {
  const [gifts, setGifts] = useState([]);

  useEffect(() => { fetchData('/gift-types').then(setGifts); }, []);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Gift Types</h1>
        <p className="page-subtitle">Donor recognition gifts</p>
      </div>

      <div className="card animate-in">
        <table className="data-table">
          <thead>
            <tr>
              <th>Gift Name</th>
              <th>Category</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {gifts.map(g => (
              <tr key={g.GIFT_TYPE_ID}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className="list-item-avatar" style={{ width: 36, height: 36, fontSize: 14, background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentLight})` }}>
                      <Gift size={16} />
                    </div>
                    <strong>{g.NAME}</strong>
                  </div>
                </td>
                <td><span className="badge badge-primary">{g.CATEGORY}</span></td>
                <td style={{ fontWeight: 600 }}>{formatCurrency(g.VALUE)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DistributionsPage() {
  const [distributions, setDistributions] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchData('/gift-distributions').then(setDistributions); }, []);

  const filtered = useMemo(() => {
    if (!search) return distributions;
    const s = search.toLowerCase();
    return distributions.filter(d =>
      (d.GIFT_NAME || '').toLowerCase().includes(s) ||
      (d.PERSONNEL_NAME || '').toLowerCase().includes(s)
    );
  }, [distributions, search]);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Gift Distributions</h1>
        <p className="page-subtitle">Track gift deliveries</p>
      </div>

      <SearchBar value={search} onChange={setSearch} placeholder="Search distributions..." />

      <div className="card animate-in">
        <table className="data-table">
          <thead>
            <tr>
              <th>Gift</th>
              <th>Distributed By</th>
              <th>Quantity</th>
              <th>Date</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(d => (
              <tr key={d.DISTRIBUTION_ID}>
                <td><strong>{d.GIFT_NAME}</strong></td>
                <td>{d.PERSONNEL_NAME}</td>
                <td>{d.QUANTITY}</td>
                <td>{formatDate(d.DISTRIBUTION_DATE)}</td>
                <td>{d.IS_FREE === 1 ? <span className="badge badge-success">Free</span> : <span className="badge badge-accent">Exchange</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN APP
// ============================================================================

export default function App() {
  const [currentRoute, setCurrentRoute] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(2) || '';
      setCurrentRoute(hash);
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = route => {
    window.location.hash = `#/${route}`;
  };

  const renderPage = () => {
    switch (currentRoute) {
      case ROUTES.DONORS: return <DonorsPage />;
      case ROUTES.DONATIONS: return <DonationsPage />;
      case ROUTES.PERSONNEL: return <PersonnelPage />;
      case ROUTES.SCHEDULES: return <SchedulesPage />;
      case ROUTES.PAYMENTS: return <PaymentsPage />;
      case ROUTES.GIFTS: return <GiftTypesPage />;
      case ROUTES.DISTRIBUTIONS: return <DistributionsPage />;
      default: return <Dashboard />;
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="app-container">
        <button className="mobile-menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <Sidebar
          currentRoute={currentRoute}
          onNavigate={navigate}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="main-content">
          {renderPage()}
        </main>
      </div>
    </>
  );
}
