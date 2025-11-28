import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Heart, 
  Gift, 
  Calendar, 
  DollarSign, 
  Menu, 
  X, 
  Search,
  ArrowUpRight,
  UserCheck,
  Briefcase,
  AlertCircle,
  RefreshCw,
  TrendingUp
} from 'lucide-react';

// --- Configuration ---
const API_BASE_URL = 'https://oracleapex.com/ords/nathan_mks/api/v1';

// --- Utils ---

const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
};

// --- Components ---

const Card = ({ title, value, icon: Icon, subValue, trend }) => (
  <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 hover:shadow-lg transition-all duration-300 group">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors">
          {value}
        </h3>
        {subValue && (
          <div className="flex items-center mt-2 gap-2">
            {trend && <span className="bg-green-50 text-green-700 text-xs px-1.5 py-0.5 rounded font-medium flex items-center">+{trend}%</span>}
            <p className="text-xs text-slate-400 font-medium">{subValue}</p>
          </div>
        )}
      </div>
      <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm">
        <Icon className="w-6 h-6" />
      </div>
    </div>
  </div>
);

const ModernBarChart = ({ data }) => {
  if (!data || data.length === 0) return (
    <div className="h-72 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50">
      <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
      <span className="text-sm">No data available</span>
    </div>
  );
  
  const maxVal = Math.max(...data.map(d => d.TOTAL_AMOUNT));
  
  return (
    <div className="h-72 w-full pt-12 pb-2">
      <div className="h-full flex items-end justify-between gap-4">
        {data.map((item, idx) => {
          const heightPercent = maxVal > 0 ? (item.TOTAL_AMOUNT / maxVal) * 100 : 0;
          return (
            <div key={idx} className="flex flex-col items-center flex-1 h-full group cursor-default">
               <div className="relative flex-1 w-full flex items-end justify-center">
                  {/* Tooltip */}
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 pointer-events-none">
                    <div className="bg-slate-800 text-white text-xs font-semibold py-1.5 px-3 rounded-lg shadow-xl mb-2 whitespace-nowrap">
                      {formatCurrency(item.TOTAL_AMOUNT)}
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
                    </div>
                  </div>
                  
                  {/* Bar */}
                  <div 
                    className="w-full max-w-[48px] bg-gradient-to-t from-indigo-500 to-blue-400 rounded-t-lg opacity-80 group-hover:opacity-100 transition-all duration-300 relative overflow-hidden shadow-sm group-hover:shadow-indigo-200"
                    style={{ height: `${heightPercent}%` }}
                  >
                    <div className="absolute top-0 left-0 w-full h-1 bg-white/20"></div>
                  </div>
               </div>
              <p className="text-[10px] sm:text-xs font-medium text-slate-400 mt-3 uppercase tracking-wide">{item.MONTH}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Table = ({ columns, data, loading, keyField = 'ID' }) => {
  if (loading) return (
    <div className="w-full p-12 space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-16 bg-slate-50 rounded-lg animate-pulse"></div>
      ))}
    </div>
  );
  
  if (!data || data.length === 0) return (
    <div className="p-12 text-center flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-xl border border-slate-100">
      <Search className="w-10 h-10 mb-3 opacity-20" />
      <p>No records found</p>
    </div>
  );

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 border-b border-slate-200">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className="px-6 py-4 font-semibold tracking-wider text-slate-600">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((item, rowIdx) => (
              <tr key={item[keyField] || rowIdx} className="hover:bg-slate-50/80 transition-colors group">
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className="px-6 py-4 whitespace-nowrap text-slate-600">
                    {col.render ? col.render(item) : item[col.accessor]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Badge = ({ children, type = 'default', dot = false }) => {
  const styles = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    warning: 'bg-amber-50 text-amber-700 border-amber-100',
    info: 'bg-blue-50 text-blue-700 border-blue-100',
    purple: 'bg-purple-50 text-purple-700 border-purple-100',
    danger: 'bg-rose-50 text-rose-700 border-rose-100',
    default: 'bg-slate-100 text-slate-600 border-slate-200'
  };

  const dotStyles = {
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    info: 'bg-blue-500',
    purple: 'bg-purple-500',
    danger: 'bg-rose-500',
    default: 'bg-slate-400'
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[type] || styles.default} inline-flex items-center gap-1.5`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotStyles[type] || dotStyles.default}`}></span>}
      {children}
    </span>
  );
};

const ErrorState = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-rose-100 shadow-sm">
    <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-4">
      <AlertCircle className="w-6 h-6" />
    </div>
    <h3 className="text-lg font-bold text-slate-800 mb-2">Connection Error</h3>
    <p className="text-slate-500 max-w-sm mb-6">{message}</p>
    <button 
      onClick={onRetry}
      className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium"
    >
      <RefreshCw className="w-4 h-4" />
      Retry Connection
    </button>
  </div>
);

// --- Main App ---
export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dataCache, setDataCache] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Core Data Fetching Logic - NO MOCK FALLBACK
  const fetchData = async (endpoint, cacheKey) => {
    // Return cached data if available to reduce API calls
    if (dataCache[cacheKey]) return; 

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Status ${response.status}: Failed to fetch data`);
      }
      
      const data = await response.json();
      
      // Store in cache
      setDataCache(prev => ({ ...prev, [cacheKey]: data.items || data }));
    } catch (err) {
      console.error(`API Error for ${endpoint}:`, err);
      setError(`Could not retrieve data from the server. Ensure the Oracle APEX API is accessible and supports CORS.`);
    } finally {
      setLoading(false);
    }
  };

  // View-based Data Loading
  useEffect(() => {
    const loadViewData = async () => {
      switch(currentView) {
        case 'dashboard':
          await Promise.all([
            fetchData('/stats/summary', 'summary'),
            fetchData('/stats/monthly', 'monthly')
          ]);
          break;
        case 'donors':
          await fetchData('/donors', 'donors');
          break;
        case 'donations':
          await fetchData('/donations', 'donations');
          break;
        case 'personnel':
          await fetchData('/personnel', 'personnel');
          break;
        case 'gifts':
          await Promise.all([
            fetchData('/gift-types', 'giftTypes'),
            fetchData('/gift-distributions', 'giftDistributions')
          ]);
          break;
        default:
          break;
      }
    };
    
    loadViewData();
  }, [currentView]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'donors', label: 'Donors', icon: Users },
    { id: 'donations', label: 'Donations', icon: Heart },
    { id: 'personnel', label: 'Personnel', icon: Calendar },
    { id: 'gifts', label: 'Gifts & Inventory', icon: Gift },
  ];

  const renderContent = () => {
    if (error && !loading) {
      return (
        <div className="h-full flex items-center justify-center">
          <ErrorState 
            message={error} 
            onRetry={() => {
              setDataCache({}); // Clear cache to force retry
              const view = currentView;
              setCurrentView('dashboard'); // Toggle view to trigger effect
              setTimeout(() => setCurrentView(view), 10);
            }} 
          />
        </div>
      );
    }

    // Global loading state for initial load (optional, can be per-component)
    // if (loading && !Object.keys(dataCache).length) return <div className="...">Loading...</div>;

    switch (currentView) {
      case 'dashboard':
        const summary = dataCache['summary'] || {};
        const monthly = dataCache['monthly'] || [];
        
        return (
          <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
            <div className="flex flex-col gap-2 mb-8">
              <h2 className="text-2xl font-bold text-slate-800">Overview</h2>
              <p className="text-slate-500">Key metrics and performance indicators for your organization.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              <Card 
                title="Total Revenue" 
                value={formatCurrency(summary.TOTAL_AMOUNT || 0)} 
                subValue={`${summary.TOTAL_DONATIONS || 0} Donations recorded`} 
                icon={DollarSign} 
                trend="12.5"
              />
              <Card 
                title="Active Donors" 
                value={summary.TOTAL_DONORS || 0} 
                subValue="Last 30 days" 
                icon={Users} 
                trend="4.2"
              />
              <Card 
                title="Gifts Distributed" 
                value={summary.TOTAL_DISTRIBUTIONS || 0} 
                subValue="Items sent out" 
                icon={Gift} 
              />
              <Card 
                title="Team Members" 
                value={(summary.TOTAL_EMPLOYEES || 0) + (summary.TOTAL_VOLUNTEERS || 0)} 
                subValue="Employees & Volunteers" 
                icon={Briefcase} 
              />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">Donation Trends</h3>
                    <p className="text-sm text-slate-400">Monthly breakdown of received funds</p>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                    <TrendingUp size={20} />
                  </div>
                </div>
                <ModernBarChart data={monthly} />
              </div>

              <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 rounded-2xl shadow-xl text-white flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 bg-white opacity-5 rounded-full transform translate-x-10 -translate-y-10"></div>
                <div className="absolute bottom-0 left-0 p-16 bg-black opacity-10 rounded-full transform -translate-x-10 translate-y-10"></div>
                
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-6">
                    <Heart className="w-6 h-6 text-white" fill="currentColor" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Our Mission Impact</h3>
                  <p className="text-indigo-100 leading-relaxed mb-8">
                    Your team has facilitated <span className="font-bold text-white">{summary.TOTAL_DONATIONS || 0}</span> donations this year, helping us reach our annual goal.
                  </p>
                </div>
                
                <button className="relative z-10 w-full py-3 bg-white text-indigo-700 rounded-xl font-semibold hover:bg-indigo-50 transition-colors shadow-lg">
                  View Detailed Report
                </button>
              </div>
            </div>
          </div>
        );

      case 'donors':
        return (
          <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Donor Directory</h2>
                <p className="text-slate-500 text-sm mt-1">Manage donor profiles and contact information.</p>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Search donors..." 
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                />
              </div>
            </div>
            
            <Table 
              keyField="DONOR_ID"
              data={dataCache['donors']} 
              loading={loading && !dataCache['donors']}
              columns={[
                { header: 'ID', accessor: 'DONOR_ID' },
                { header: 'Name', render: (item) => (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                      {item.FIRSTNAME?.[0]}{item.LASTNAME?.[0]}
                    </div>
                    <span className="font-medium text-slate-900">{item.FIRSTNAME} {item.LASTNAME}</span>
                  </div>
                )},
                { header: 'Contact', accessor: 'CONTACT_INFO' },
                { header: 'Segment', render: (item) => <Badge type="info" dot>{item.DEMOGRAPHIC_SEGMENT}</Badge> },
                { header: 'Location', accessor: 'LOCATION' },
                { header: 'Actions', render: () => (
                  <button className="text-indigo-600 hover:text-indigo-800 font-medium text-xs flex items-center gap-1">
                    View <ArrowUpRight size={14} />
                  </button>
                )}
              ]} 
            />
          </div>
        );

      case 'donations':
        return (
          <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-800">Donation History</h2>
            </div>
            <Table 
              keyField="DONATION_ID"
              data={dataCache['donations']} 
              loading={loading && !dataCache['donations']}
              columns={[
                { header: 'Date', render: (item) => (
                  <span className="text-slate-500 tabular-nums">{formatDate(item.DONATION_DATE)}</span>
                )},
                { header: 'Donor', render: (item) => (
                   <span className="font-medium text-slate-900">{item.DONOR_NAME}</span>
                )},
                { header: 'Amount', render: (item) => (
                  <span className="font-bold text-slate-800 tabular-nums">{formatCurrency(item.AMOUNT)}</span>
                )},
                { header: 'Category', render: (item) => <Badge type="purple">{item.CATEGORY}</Badge> },
                { header: 'Source', render: (item) => <span className="text-slate-500 text-xs uppercase tracking-wide font-medium">{item.SOURCE}</span> },
              ]} 
            />
          </div>
        );

      case 'personnel':
        return (
          <div className="space-y-6 max-w-7xl mx-auto">
             <h2 className="text-2xl font-bold text-slate-800">Personnel & Staffing</h2>
             <Table 
                keyField="PERSONNEL_ID"
                data={dataCache['personnel']} 
                loading={loading && !dataCache['personnel']}
                columns={[
                  { header: 'Name', render: (item) => (
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${item.IS_EMPLOYEE === 1 ? 'bg-indigo-100 text-indigo-600' : 'bg-amber-100 text-amber-600'}`}>
                        {item.FIRSTNAME?.[0]}{item.LASTNAME?.[0]}
                      </div>
                      <div className="font-medium text-slate-900">{item.FIRSTNAME} {item.LASTNAME}</div>
                    </div>
                  )},
                  { header: 'Role', accessor: 'ROLE' },
                  { header: 'Status', render: (item) => (
                    <div className="flex gap-2">
                      {item.IS_EMPLOYEE === 1 && <Badge type="success" dot>Employee</Badge>}
                      {item.IS_VOLUNTEER === 1 && <Badge type="warning" dot>Volunteer</Badge>}
                    </div>
                  )},
                  { header: 'Contact', accessor: 'CONTACT_INFO' },
                ]} 
              />
          </div>
        );

      case 'gifts':
        return (
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800">Gift Catalog</h2>
                <button className="text-sm text-indigo-600 font-medium hover:underline">Add New Type</button>
              </div>
              <Table 
                keyField="GIFT_TYPE_ID"
                data={dataCache['giftTypes']} 
                loading={loading && !dataCache['giftTypes']}
                columns={[
                  { header: 'Item Name', render: (item) => <span className="font-medium text-slate-700">{item.NAME}</span> },
                  { header: 'Category', accessor: 'CATEGORY' },
                  { header: 'Value', render: (item) => <span className="text-slate-500 tabular-nums">{formatCurrency(item.VALUE)}</span> },
                ]} 
              />
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800">Recent Distributions</h2>
                <button className="text-sm text-indigo-600 font-medium hover:underline">View All</button>
              </div>
              <Table 
                keyField="DISTRIBUTION_ID"
                data={dataCache['giftDistributions']} 
                loading={loading && !dataCache['giftDistributions']}
                columns={[
                  { header: 'Gift', accessor: 'GIFT_NAME' },
                  { header: 'Date', render: (item) => <span className="text-xs text-slate-500">{formatDate(item.DISTRIBUTION_DATE)}</span> },
                  { header: 'Type', render: (item) => item.IS_FREE === 1 ? <Badge type="success">Complimentary</Badge> : <Badge type="default">Exchange</Badge> },
                ]} 
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-600 selection:bg-indigo-100 selection:text-indigo-800">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-slate-300 transform transition-transform duration-300 ease-in-out flex flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0 shadow-2xl lg:shadow-none
      `}>
        <div className="p-8 border-b border-slate-800/50">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-tr from-indigo-500 to-violet-500 p-2.5 rounded-xl shadow-lg shadow-indigo-500/30">
              <Heart className="w-6 h-6 text-white fill-current" />
            </div>
            <div>
              <span className="block text-lg font-bold text-white tracking-tight">CharityOS</span>
              <span className="block text-xs text-slate-500 font-medium tracking-wide">MANAGEMENT PLATFORM</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          <p className="px-4 py-2 text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 mt-2">Main Menu</p>
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id);
                  setSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center space-x-3.5 px-4 py-3.5 rounded-xl transition-all duration-200 group
                  ${isActive 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' 
                    : 'hover:bg-slate-800 hover:text-white text-slate-400'}
                `}
              >
                <item.icon size={20} className={`transition-colors ${isActive ? 'text-indigo-200' : 'group-hover:text-white'}`} />
                <span className="font-medium text-sm">{item.label}</span>
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-300 shadow-[0_0_8px_rgba(165,180,252,0.8)]" />}
              </button>
            )
          })}
        </nav>
        
        <div className="p-4 bg-slate-800/50 m-4 rounded-2xl border border-slate-700/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
              AD
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-white truncate">Administrator</p>
              <p className="text-xs text-slate-400 truncate">admin@charity.org</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 h-20 flex items-center justify-between px-6 lg:px-10 z-30 sticky top-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-slate-500 hover:text-slate-800 p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Menu size={24} />
            </button>
            
            <div>
              <h1 className="text-xl font-bold text-slate-800">
                {navItems.find(n => n.id === currentView)?.label}
              </h1>
              <p className="text-xs text-slate-400 hidden sm:block">Welcome back, here is what's happening today.</p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
            <div className="hidden md:block text-right">
              <p className="text-xs font-semibold text-slate-500">System Status</p>
              <div className="flex items-center justify-end gap-1.5">
                <div className={`w-2 h-2 rounded-full ${error ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse'}`}></div>
                <span className={`text-xs font-bold ${error ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {error ? 'Connection Issues' : 'Online'}
                </span>
              </div>
            </div>
            
            <div className="h-8 w-[1px] bg-slate-200 hidden md:block"></div>

            <button className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all relative">
              <AlertCircle size={20} />
              {error && <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>}
            </button>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-10 pb-20 scroll-smooth">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}