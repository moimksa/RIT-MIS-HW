import React, { useState, useEffect, useCallback } from 'react';
import { AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const API_BASE = 'https://oracleapex.com/ords/nathan_mks/api/v1';

// ==================== API 工具函数 ====================

const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };
  
  const response = await fetch(url, config);
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `HTTP error! status: ${response.status}`);
  }
  
  // DELETE 请求通常不返回内容
  if (options.method === 'DELETE') {
    return { success: true };
  }
  
  const data = await response.json();
  return data.items || data;
};

const fetchData = (endpoint) => apiRequest(endpoint);

const createRecord = (endpoint, data) => 
  apiRequest(endpoint, { method: 'POST', body: JSON.stringify(data) });

const updateRecord = (endpoint, id, data) => 
  apiRequest(`${endpoint}/${id}`, { method: 'PUT', body: JSON.stringify(data) });

const deleteRecord = (endpoint, id) => 
  apiRequest(`${endpoint}/${id}`, { method: 'DELETE' });

const formatCurrency = (amount) => 
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount || 0);

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatDateForAPI = (dateStr) => {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  return date.toISOString().split('T')[0];
};

// ==================== 视觉效果组件 ====================

const AuroraBackground = () => (
  <div className="aurora-bg">
    <div className="aurora-blob aurora-blob-1" />
    <div className="aurora-blob aurora-blob-2" />
    <div className="aurora-blob aurora-blob-3" />
    <div className="aurora-noise" />
    <div className="aurora-grid" />
  </div>
);

const Spotlight = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div 
      className="spotlight"
      style={{
        background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(139, 92, 246, 0.06), transparent 40%)`
      }}
    />
  );
};

const FloatingNav = ({ activeSection, setActiveSection, counts }) => {
  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: '◈' },
    { id: 'donors', label: 'Donors', count: counts.donors },
    { id: 'donations', label: 'Donations', count: counts.donations },
    { id: 'personnel', label: 'Team', count: counts.personnel },
    { id: 'reports', label: 'Reports', icon: '◎' },
    { id: 'analytics', label: 'Analytics', icon: '◉' },
  ];

  return (
    <nav className="floating-nav">
      <div className="floating-nav-inner">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            className={`nav-pill ${activeSection === item.id ? 'active' : ''}`}
          >
            {item.icon && <span className="nav-icon">{item.icon}</span>}
            <span>{item.label}</span>
            {item.count !== undefined && (
              <span className="nav-count">{item.count}</span>
            )}
          </button>
        ))}
      </div>
    </nav>
  );
};

const GlowCard = ({ children, className = '', delay = 0, onClick, hoverable = false }) => (
  <div 
    className={`glow-card ${className} ${hoverable ? 'hoverable' : ''}`}
    style={{ animationDelay: `${delay}s` }}
    onClick={onClick}
  >
    <div className="glow-card-inner">
      {children}
    </div>
    <div className="glow-card-shine" />
  </div>
);

const StatCard = ({ label, value, sublabel, trend, icon, delay = 0 }) => (
  <GlowCard className="stat-card" delay={delay}>
    <div className="stat-icon">{icon}</div>
    <div className="stat-content">
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value}</p>
      {sublabel && (
        <div className="stat-footer">
          <span className="stat-sublabel">{sublabel}</span>
          {trend && (
            <span className={`stat-trend ${trend > 0 ? 'positive' : 'negative'}`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </span>
          )}
        </div>
      )}
    </div>
  </GlowCard>
);

const Badge = ({ children, variant = 'default' }) => (
  <span className={`badge badge-${variant}`}>{children}</span>
);

// 加载指示器
const LoadingSpinner = () => (
  <div className="loading-spinner">
    <div className="spinner" />
    <span>Loading...</span>
  </div>
);

// Toast 通知
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast toast-${type}`}>
      <span className="toast-icon">
        {type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}
      </span>
      <span>{message}</span>
      <button className="toast-close" onClick={onClose}>×</button>
    </div>
  );
};

const DataTable = ({ columns, data, onRowClick, onEdit, onDelete, loading }) => {
  if (loading) {
    return (
      <div className="data-table-wrapper">
        <LoadingSpinner />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="data-table-wrapper">
        <div className="empty-state">
          <span className="empty-icon">📭</span>
          <p>No records found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="data-table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col, i) => (
              <th key={i}>{col.label}</th>
            ))}
            {(onEdit || onDelete) && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={row.id || i} onClick={() => onRowClick?.(row)}>
              {columns.map((col, j) => (
                <td key={j} className={j === 0 ? 'primary-cell' : ''}>
                  {col.render ? col.render(row[col.key], row) : row[col.key] ?? '—'}
                </td>
              ))}
              {(onEdit || onDelete) && (
                <td className="actions-cell" onClick={(e) => e.stopPropagation()}>
                  {onEdit && (
                    <button className="action-btn edit" onClick={() => onEdit(row)}>
                      Edit
                    </button>
                  )}
                  {onDelete && (
                    <button className="action-btn delete" onClick={() => onDelete(row)}>
                      Delete
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// CRUD 模态框
const CrudModal = ({ isOpen, onClose, title, fields, data, onSave, mode = 'view', saving }) => {
  const [formData, setFormData] = useState(data || {});
  const [errors, setErrors] = useState({});
  
  useEffect(() => {
    setFormData(data || {});
    setErrors({});
  }, [data, isOpen]);

  if (!isOpen) return null;

  const handleChange = (key, value, type) => {
    let processedValue = value;
    if (type === 'number') {
      processedValue = value === '' ? '' : Number(value);
    }
    setFormData(prev => ({ ...prev, [key]: processedValue }));
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    fields.forEach(field => {
      if (field.required && !formData[field.key]) {
        newErrors[field.key] = `${field.label} is required`;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (mode === 'view') {
      onClose();
      return;
    }
    if (validateForm()) {
      onSave(formData);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>
            {mode === 'create' ? 'Create New ' : mode === 'edit' ? 'Edit ' : 'View '}
            {title}
          </h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {fields.map((field, i) => (
            <div key={i} className={`form-field ${errors[field.key] ? 'has-error' : ''}`}>
              <label>
                {field.label}
                {field.required && mode !== 'view' && <span className="required">*</span>}
              </label>
              {mode === 'view' ? (
                <p className="field-value">
                  {field.render ? field.render(formData[field.key], formData) : formData[field.key] ?? '—'}
                </p>
              ) : field.type === 'select' ? (
                <select 
                  value={formData[field.key] || ''} 
                  onChange={(e) => handleChange(field.key, e.target.value, field.type)}
                  disabled={saving}
                >
                  <option value="">Select...</option>
                  {field.options?.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              ) : field.type === 'textarea' ? (
                <textarea 
                  value={formData[field.key] || ''} 
                  onChange={(e) => handleChange(field.key, e.target.value, field.type)}
                  rows={3}
                  disabled={saving}
                />
              ) : field.type === 'checkbox' ? (
                <label className="checkbox-wrapper">
                  <input 
                    type="checkbox"
                    checked={formData[field.key] === 1 || formData[field.key] === true}
                    onChange={(e) => handleChange(field.key, e.target.checked ? 1 : 0)}
                    disabled={saving}
                  />
                  <span className="checkmark" />
                  <span className="checkbox-label">{field.checkboxLabel || 'Yes'}</span>
                </label>
              ) : (
                <input 
                  type={field.type || 'text'}
                  value={formData[field.key] || ''} 
                  onChange={(e) => handleChange(field.key, e.target.value, field.type)}
                  disabled={saving}
                  step={field.type === 'number' ? (field.step || 'any') : undefined}
                />
              )}
              {errors[field.key] && <span className="error-message">{errors[field.key]}</span>}
            </div>
          ))}
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose} disabled={saving}>
            {mode === 'view' ? 'Close' : 'Cancel'}
          </button>
          {mode !== 'view' && (
            <button className="btn-primary" onClick={handleSubmit} disabled={saving}>
              {saving ? (
                <>
                  <span className="btn-spinner" />
                  Saving...
                </>
              ) : (
                mode === 'create' ? 'Create' : 'Save Changes'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// 确认删除模态框
const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, itemName, deleting }) => {
  if (!isOpen) return null;
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container delete-modal" onClick={e => e.stopPropagation()}>
        <div className="delete-icon">⚠</div>
        <h3>Confirm Deletion</h3>
        <p>Are you sure you want to delete <strong>{itemName}</strong>? This action cannot be undone.</p>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose} disabled={deleting}>Cancel</button>
          <button className="btn-danger" onClick={onConfirm} disabled={deleting}>
            {deleting ? (
              <>
                <span className="btn-spinner" />
                Deleting...
              </>
            ) : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

const SectionHeader = ({ title, subtitle, action }) => (
  <div className="section-header">
    <div>
      <h2 className="section-title">{title}</h2>
      {subtitle && <p className="section-subtitle">{subtitle}</p>}
    </div>
    {action && (
      <button className="btn-primary" onClick={action.onClick}>
        <span>+</span> {action.label}
      </button>
    )}
  </div>
);

// ==================== 主应用 ====================

export default function CharityDashboard() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [donors, setDonors] = useState([]);
  const [donations, setDonations] = useState([]);
  const [personnel, setPersonnel] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [payments, setPayments] = useState([]);
  const [giftTypes, setGiftTypes] = useState([]);
  const [distributions, setDistributions] = useState([]);
  
  // 加载状态
  const [loading, setLoading] = useState({
    donors: true,
    donations: true,
    personnel: true,
    stats: true
  });
  
  // CRUD 状态
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('view');
  const [modalType, setModalType] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  // Toast 通知
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // 数据加载函数
  const loadDonors = useCallback(async () => {
    setLoading(prev => ({ ...prev, donors: true }));
    try {
      const data = await fetchData('/donors');
      setDonors(data);
    } catch (error) {
      showToast('Failed to load donors', 'error');
    } finally {
      setLoading(prev => ({ ...prev, donors: false }));
    }
  }, [showToast]);

  const loadDonations = useCallback(async () => {
    setLoading(prev => ({ ...prev, donations: true }));
    try {
      const data = await fetchData('/donations');
      setDonations(data);
    } catch (error) {
      showToast('Failed to load donations', 'error');
    } finally {
      setLoading(prev => ({ ...prev, donations: false }));
    }
  }, [showToast]);

  const loadPersonnel = useCallback(async () => {
    setLoading(prev => ({ ...prev, personnel: true }));
    try {
      const data = await fetchData('/personnel');
      setPersonnel(data);
    } catch (error) {
      showToast('Failed to load team members', 'error');
    } finally {
      setLoading(prev => ({ ...prev, personnel: false }));
    }
  }, [showToast]);

  const loadStats = useCallback(async () => {
    setLoading(prev => ({ ...prev, stats: true }));
    try {
      const [summaryData, monthlyData] = await Promise.all([
        fetchData('/stats/summary'),
        fetchData('/stats/donations/monthly')
      ]);
      setStats(summaryData);
      setMonthlyStats(monthlyData);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(prev => ({ ...prev, stats: false }));
    }
  }, []);

  useEffect(() => {
    loadStats();
    loadDonors();
    loadDonations();
    loadPersonnel();
    fetchData('/schedules').then(setSchedules).catch(console.error);
    fetchData('/payments').then(setPayments).catch(console.error);
    fetchData('/gift-types').then(setGiftTypes).catch(console.error);
    fetchData('/gift-distributions').then(setDistributions).catch(console.error);
  }, [loadStats, loadDonors, loadDonations, loadPersonnel]);

  // CRUD 操作
  const openCreate = (type) => {
    setModalType(type);
    setSelectedItem({});
    setModalMode('create');
    setModalOpen(true);
  };

  const openEdit = (item, type) => {
    setModalType(type);
    setSelectedItem({ ...item });
    setModalMode('edit');
    setModalOpen(true);
  };

  const openView = (item, type) => {
    setModalType(type);
    setSelectedItem(item);
    setModalMode('view');
    setModalOpen(true);
  };

  const confirmDelete = (item, type) => {
    setItemToDelete({ item, type });
    setDeleteModalOpen(true);
  };

  // API 端点映射
  const getEndpoint = (type) => {
    const endpoints = {
      donor: '/donors',
      donation: '/donations',
      personnel: '/personnel',
      schedule: '/schedules',
      payment: '/payments',
      giftType: '/gift-types',
      distribution: '/gift-distributions'
    };
    return endpoints[type];
  };

  // 获取ID字段名
  const getIdField = (type) => {
    const idFields = {
      donor: 'donor_id',
      donation: 'donation_id',
      personnel: 'personnel_id',
      schedule: 'schedule_id',
      payment: 'payment_id',
      giftType: 'gift_type_id',
      distribution: 'distribution_id'
    };
    return idFields[type] || 'id';
  };

  // 刷新数据
  const refreshData = (type) => {
    switch (type) {
      case 'donor':
        loadDonors();
        break;
      case 'donation':
        loadDonations();
        loadStats();
        break;
      case 'personnel':
        loadPersonnel();
        break;
      default:
        break;
    }
  };

  // 准备API数据
  const prepareDataForAPI = (data, type) => {
    const prepared = {};
    
    if (type === 'donor') {
      prepared.FIRSTNAME = data.firstname || data.FIRSTNAME;
      prepared.LASTNAME = data.lastname || data.LASTNAME;
      prepared.CONTACT_INFO = data.contact_info || data.CONTACT_INFO;
      prepared.AGE = data.age || data.AGE;
      prepared.LOCATION = data.location || data.LOCATION;
      prepared.DEMOGRAPHIC_SEGMENT = data.demographic_segment || data.DEMOGRAPHIC_SEGMENT;
      prepared.TAX_ID_NUMBER = data.tax_id_number || data.TAX_ID_NUMBER;
      prepared.TAX_JURISDICTION = data.tax_jurisdiction || data.TAX_JURISDICTION;
    } else if (type === 'donation') {
      prepared.DONOR_ID = data.donor_id || data.DONOR_ID;
      prepared.DONATION_DATE = formatDateForAPI(data.donation_date || data.DONATION_DATE);
      prepared.AMOUNT = Number(data.amount || data.AMOUNT) || 0;
      prepared.SOURCE = data.source || data.SOURCE;
      prepared.CATEGORY = data.category || data.CATEGORY;
      prepared.IS_IN_EXCHANGE_FOR_GIFT = data.is_in_exchange_for_gift || data.IS_IN_EXCHANGE_FOR_GIFT || 0;
      prepared.REQUIRES_TAX_RECEIPT = data.requires_tax_receipt || data.REQUIRES_TAX_RECEIPT || 0;
      prepared.DEDUCTIBLE_AMOUNT = Number(data.deductible_amount || data.DEDUCTIBLE_AMOUNT) || 0;
    } else if (type === 'personnel') {
      prepared.FIRSTNAME = data.firstname || data.FIRSTNAME;
      prepared.LASTNAME = data.lastname || data.LASTNAME;
      prepared.CONTACT_INFO = data.contact_info || data.CONTACT_INFO;
      prepared.ROLE = data.role || data.ROLE;
      prepared.IS_EMPLOYEE = data.is_employee || data.IS_EMPLOYEE || 0;
      prepared.IS_VOLUNTEER = data.is_volunteer || data.IS_VOLUNTEER || 0;
      prepared.ACCESS_LEVEL = data.access_level || data.ACCESS_LEVEL;
    }
    
    return prepared;
  };

  const handleDelete = async () => {
    const { item, type } = itemToDelete;
    const endpoint = getEndpoint(type);
    const idField = getIdField(type);
    const id = item[idField] || item.id;
    
    setDeleting(true);
    try {
      await deleteRecord(endpoint, id);
      showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully`, 'success');
      refreshData(type);
      setDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (error) {
      showToast(`Failed to delete: ${error.message}`, 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleSave = async (data) => {
    const endpoint = getEndpoint(modalType);
    const idField = getIdField(modalType);
    const preparedData = prepareDataForAPI(data, modalType);
    
    setSaving(true);
    try {
      if (modalMode === 'create') {
        await createRecord(endpoint, preparedData);
        showToast(`${modalType.charAt(0).toUpperCase() + modalType.slice(1)} created successfully`, 'success');
      } else {
        const id = data[idField] || data.id;
        await updateRecord(endpoint, id, preparedData);
        showToast(`${modalType.charAt(0).toUpperCase() + modalType.slice(1)} updated successfully`, 'success');
      }
      refreshData(modalType);
      setModalOpen(false);
    } catch (error) {
      showToast(`Failed to save: ${error.message}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  // 数据处理
  const donationsByCategory = donations.reduce((acc, d) => {
    const cat = d.category || 'Other';
    acc[cat] = (acc[cat] || 0) + (d.amount || 0);
    return acc;
  }, {});

  const pieData = Object.entries(donationsByCategory)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  const chartData = monthlyStats.map(m => ({
    month: m.month?.slice(5) || '',
    amount: m.total_amount || 0,
    count: m.donation_count || 0
  }));

  const CHART_COLORS = ['#8b5cf6', '#06b6d4', '#f59e0b', '#ec4899', '#10b981', '#6366f1'];

  // 字段配置 - 完善版
  const fieldConfigs = {
    donor: [
      { key: 'firstname', label: 'First Name', type: 'text', required: true },
      { key: 'lastname', label: 'Last Name', type: 'text', required: true },
      { key: 'contact_info', label: 'Email', type: 'email', required: true },
      { key: 'age', label: 'Age', type: 'number' },
      { key: 'location', label: 'Location', type: 'text' },
      { key: 'demographic_segment', label: 'Segment', type: 'select', options: [
        { value: 'Individual', label: 'Individual' },
        { value: 'High Income', label: 'High Income' },
        { value: 'Corporate', label: 'Corporate' },
        { value: 'Foundation', label: 'Foundation' },
        { value: 'Small Business', label: 'Small Business' }
      ]},
      { key: 'tax_id_number', label: 'Tax ID Number', type: 'text' },
      { key: 'tax_jurisdiction', label: 'Tax Jurisdiction', type: 'text' },
    ],
    donation: [
      { key: 'donor_id', label: 'Donor ID', type: 'number', required: true },
      { key: 'amount', label: 'Amount', type: 'number', required: true, step: '0.01', render: (v) => formatCurrency(v) },
      { key: 'donation_date', label: 'Date', type: 'date', required: true, render: (v) => formatDate(v) },
      { key: 'category', label: 'Category', type: 'select', required: true, options: [
        { value: 'General Fund', label: 'General Fund' },
        { value: 'Education', label: 'Education' },
        { value: 'Healthcare', label: 'Healthcare' },
        { value: 'Emergency Relief', label: 'Emergency Relief' },
        { value: 'Capital Campaign', label: 'Capital Campaign' },
        { value: 'Scholarship', label: 'Scholarship' },
        { value: 'Environment', label: 'Environment' },
        { value: 'Research', label: 'Research' },
        { value: 'Youth Programs', label: 'Youth Programs' },
        { value: 'Arts & Culture', label: 'Arts & Culture' },
        { value: 'Endowment', label: 'Endowment' }
      ]},
      { key: 'source', label: 'Source', type: 'select', options: [
        { value: 'Online', label: 'Online' },
        { value: 'Mail', label: 'Mail' },
        { value: 'Check', label: 'Check' },
        { value: 'Wire Transfer', label: 'Wire Transfer' }
      ]},
      { key: 'is_in_exchange_for_gift', label: 'In Exchange for Gift', type: 'checkbox', checkboxLabel: 'Yes' },
      { key: 'requires_tax_receipt', label: 'Requires Tax Receipt', type: 'checkbox', checkboxLabel: 'Yes' },
      { key: 'deductible_amount', label: 'Deductible Amount', type: 'number', step: '0.01', render: (v) => formatCurrency(v) },
    ],
    personnel: [
      { key: 'firstname', label: 'First Name', type: 'text', required: true },
      { key: 'lastname', label: 'Last Name', type: 'text', required: true },
      { key: 'contact_info', label: 'Contact', type: 'text', required: true },
      { key: 'role', label: 'Role', type: 'text', required: true },
      { key: 'is_employee', label: 'Employee', type: 'checkbox', checkboxLabel: 'Is an employee' },
      { key: 'is_volunteer', label: 'Volunteer', type: 'checkbox', checkboxLabel: 'Is a volunteer' },
      { key: 'access_level', label: 'Access Level', type: 'select', required: true, options: [
        { value: 'Admin', label: 'Admin' },
        { value: 'Manager', label: 'Manager' },
        { value: 'Staff', label: 'Staff' },
        { value: 'Volunteer', label: 'Volunteer' }
      ]},
    ]
  };

  // ==================== 渲染各区域 ====================

  const renderDashboard = () => (
    <>
      <SectionHeader 
        title="Dashboard Overview" 
        subtitle="Real-time insights into your charitable organization" 
      />
      
      <div className="stats-grid">
        <StatCard 
          label="Total Donors" 
          value={loading.stats ? '...' : (stats?.total_donors || stats?.TOTAL_DONORS || '0')} 
          sublabel="Active contributors" 
          trend={12}
          icon="♥" 
          delay={0} 
        />
        <StatCard 
          label="Donations" 
          value={loading.stats ? '...' : (stats?.total_donations || stats?.TOTAL_DONATIONS || '0')} 
          sublabel="This period" 
          trend={8}
          icon="★" 
          delay={0.1} 
        />
        <StatCard 
          label="Total Raised" 
          value={loading.stats ? '...' : formatCurrency(stats?.total_amount || stats?.TOTAL_DONATION_AMOUNT || 0)} 
          sublabel="Cumulative" 
          trend={23}
          icon="$" 
          delay={0.2} 
        />
        <StatCard 
          label="Team Members" 
          value={loading.stats ? '...' : ((stats?.total_employees || stats?.TOTAL_EMPLOYEES || 0) + (stats?.total_volunteers || stats?.TOTAL_VOLUNTEERS || 0))} 
          sublabel={`${stats?.total_employees || stats?.TOTAL_EMPLOYEES || 0} staff · ${stats?.total_volunteers || stats?.TOTAL_VOLUNTEERS || 0} volunteers`}
          icon="◆" 
          delay={0.3} 
        />
      </div>

      <div className="charts-row">
        <GlowCard className="chart-card large" delay={0.4}>
          <h3 className="chart-title">Revenue Trend</h3>
          <p className="chart-subtitle">Monthly donation patterns</p>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v/1000}k`} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'rgba(15, 15, 25, 0.95)', 
                    border: '1px solid rgba(139, 92, 246, 0.3)', 
                    borderRadius: '12px',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
                  }}
                  labelStyle={{ color: '#a78bfa' }}
                  itemStyle={{ color: '#e2e8f0' }}
                  formatter={(value) => [formatCurrency(value), 'Amount']}
                />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#8b5cf6" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorAmount)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlowCard>

        <GlowCard className="chart-card" delay={0.5}>
          <h3 className="chart-title">By Category</h3>
          <p className="chart-subtitle">Donation distribution</p>
          <div className="chart-container pie-container">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    background: 'rgba(15, 15, 25, 0.95)', 
                    border: '1px solid rgba(139, 92, 246, 0.3)', 
                    borderRadius: '12px' 
                  }}
                  formatter={(value) => formatCurrency(value)} 
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pie-legend">
              {pieData.slice(0, 4).map((item, i) => (
                <div key={i} className="legend-item">
                  <span className="legend-dot" style={{ background: CHART_COLORS[i] }} />
                  <span>{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </GlowCard>
      </div>

      <GlowCard className="recent-section" delay={0.6}>
        <h3 className="chart-title">Recent Activity</h3>
        <p className="chart-subtitle">Latest donations received</p>
        <div className="activity-list">
          {donations.slice(0, 5).map((d, i) => (
            <div 
              key={i} 
              className="activity-item"
              onClick={() => openView(d, 'donation')}
            >
              <div className="activity-avatar">
                {(d.donor_name || 'A')[0].toUpperCase()}
              </div>
              <div className="activity-info">
                <p className="activity-name">{d.donor_name || 'Anonymous'}</p>
                <p className="activity-meta">{formatDate(d.donation_date)} · {d.category}</p>
              </div>
              <p className="activity-amount">{formatCurrency(d.amount)}</p>
            </div>
          ))}
        </div>
      </GlowCard>
    </>
  );

  const renderDonors = () => (
    <>
      <SectionHeader 
        title="Donor Management" 
        subtitle={`${donors.length} registered donors in the system`}
        action={{ label: 'Add Donor', onClick: () => openCreate('donor') }}
      />
      <DataTable
        columns={[
          { key: 'name', label: 'Name', render: (_, row) => `${row.firstname || ''} ${row.lastname || ''}`.trim() || '—' },
          { key: 'contact_info', label: 'Contact' },
          { key: 'location', label: 'Location' },
          { key: 'demographic_segment', label: 'Segment', render: (v) => v ? <Badge variant="primary">{v}</Badge> : '—' },
          { key: 'age', label: 'Age' }
        ]}
        data={donors}
        loading={loading.donors}
        onRowClick={(row) => openView(row, 'donor')}
        onEdit={(row) => openEdit(row, 'donor')}
        onDelete={(row) => confirmDelete(row, 'donor')}
      />
    </>
  );

  const renderDonations = () => (
    <>
      <SectionHeader 
        title="Donations" 
        subtitle={`${donations.length} donation records`}
        action={{ label: 'Add Donation', onClick: () => openCreate('donation') }}
      />
      <DataTable
        columns={[
          { key: 'donor_name', label: 'Donor' },
          { key: 'amount', label: 'Amount', render: (v) => <span className="amount-highlight">{formatCurrency(v)}</span> },
          { key: 'donation_date', label: 'Date', render: (v) => formatDate(v) },
          { key: 'category', label: 'Category', render: (v) => <Badge variant="info">{v}</Badge> },
          { key: 'source', label: 'Source' },
        ]}
        data={donations}
        loading={loading.donations}
        onRowClick={(row) => openView(row, 'donation')}
        onEdit={(row) => openEdit(row, 'donation')}
        onDelete={(row) => confirmDelete(row, 'donation')}
      />
    </>
  );

  const renderPersonnel = () => (
    <>
      <SectionHeader 
        title="Team Members" 
        subtitle={`${personnel.length} team members`}
        action={{ label: 'Add Member', onClick: () => openCreate('personnel') }}
      />
      <DataTable
        columns={[
          { key: 'name', label: 'Name', render: (_, row) => `${row.firstname || ''} ${row.lastname || ''}`.trim() || '—' },
          { key: 'role', label: 'Role' },
          { key: 'type', label: 'Type', render: (_, row) => row.is_employee === 1 ? <Badge variant="accent">Employee</Badge> : <Badge variant="success">Volunteer</Badge> },
          { key: 'access_level', label: 'Access', render: (v) => <Badge>{v}</Badge> },
          { key: 'contact_info', label: 'Contact' }
        ]}
        data={personnel}
        loading={loading.personnel}
        onRowClick={(row) => openView(row, 'personnel')}
        onEdit={(row) => openEdit(row, 'personnel')}
        onDelete={(row) => confirmDelete(row, 'personnel')}
      />
    </>
  );

  const renderReports = () => {
    const monthlyGrowth = chartData.map((item, i, arr) => ({
      ...item,
      growth: i > 0 ? ((item.amount - arr[i-1].amount) / (arr[i-1].amount || 1) * 100).toFixed(1) : 0
    }));

    const donorRetention = [
      { name: 'New', value: 35, fill: '#8b5cf6' },
      { name: 'Returning', value: 45, fill: '#06b6d4' },
      { name: 'Lapsed', value: 20, fill: '#64748b' }
    ];

    return (
      <>
        <SectionHeader 
          title="Reports & Insights" 
          subtitle="Comprehensive analysis of your organization's performance"
        />
        
        <div className="reports-grid">
          <GlowCard className="report-card" delay={0}>
            <h3 className="chart-title">Monthly Growth Rate</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={monthlyGrowth}>
                  <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                  <Tooltip 
                    contentStyle={{ background: 'rgba(15, 15, 25, 0.95)', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '12px' }}
                    formatter={(value) => [`${value}%`, 'Growth']}
                  />
                  <Bar dataKey="growth" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlowCard>

          <GlowCard className="report-card" delay={0.1}>
            <h3 className="chart-title">Donor Retention</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={donorRetention}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {donorRetention.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ background: 'rgba(15, 15, 25, 0.95)', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '12px' }}
                    formatter={(value) => [`${value}%`, 'Donors']}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="pie-legend centered">
                {donorRetention.map((item, i) => (
                  <div key={i} className="legend-item">
                    <span className="legend-dot" style={{ background: item.fill }} />
                    <span>{item.name}: {item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </GlowCard>

          <GlowCard className="report-card wide" delay={0.2}>
            <h3 className="chart-title">Donation Volume Trend</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ background: 'rgba(15, 15, 25, 0.95)', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '12px' }}
                  />
                  <Line type="monotone" dataKey="count" stroke="#06b6d4" strokeWidth={3} dot={{ fill: '#06b6d4', strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </GlowCard>

          <GlowCard className="report-card summary" delay={0.3}>
            <h3 className="chart-title">Quick Summary</h3>
            <div className="summary-items">
              <div className="summary-item">
                <span className="summary-label">Avg Donation</span>
                <span className="summary-value">
                  {donations.length ? formatCurrency(donations.reduce((a, d) => a + (d.amount || 0), 0) / donations.length) : '—'}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Top Category</span>
                <span className="summary-value">{pieData[0]?.name || '—'}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Active Team</span>
                <span className="summary-value">{personnel.length}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Gift Types</span>
                <span className="summary-value">{giftTypes.length}</span>
              </div>
            </div>
          </GlowCard>
        </div>
      </>
    );
  };

  const renderAnalytics = () => {
    const sourceData = donations.reduce((acc, d) => {
      const src = d.source || 'Direct';
      acc[src] = (acc[src] || 0) + 1;
      return acc;
    }, {});

    const sourceChartData = Object.entries(sourceData).map(([name, value]) => ({ name, value }));

    const performanceData = [
      { subject: 'Retention', A: 85 },
      { subject: 'Growth', A: 72 },
      { subject: 'Engagement', A: 90 },
      { subject: 'Efficiency', A: 78 },
      { subject: 'Impact', A: 88 }
    ];

    return (
      <>
        <SectionHeader 
          title="Advanced Analytics" 
          subtitle="Deep dive into your organization's metrics"
        />
        
        <div className="analytics-grid">
          <GlowCard className="analytics-card" delay={0}>
            <h3 className="chart-title">Donation Sources</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={sourceChartData} layout="vertical">
                  <XAxis type="number" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} width={80} />
                  <Tooltip 
                    contentStyle={{ background: 'rgba(15, 15, 25, 0.95)', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '12px' }}
                  />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlowCard>

          <GlowCard className="analytics-card" delay={0.1}>
            <h3 className="chart-title">Performance Metrics</h3>
            <div className="metrics-grid">
              {performanceData.map((item, i) => (
                <div key={i} className="metric-item">
                  <div className="metric-header">
                    <span className="metric-label">{item.subject}</span>
                    <span className="metric-value">{item.A}%</span>
                  </div>
                  <div className="metric-bar">
                    <div className="metric-fill" style={{ width: `${item.A}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </GlowCard>

          <GlowCard className="analytics-card wide" delay={0.2}>
            <h3 className="chart-title">Schedule Overview</h3>
            <DataTable
              columns={[
                { key: 'personnel_name', label: 'Person' },
                { key: 'schedule_date', label: 'Date', render: (v) => formatDate(v) },
                { key: 'time', label: 'Time', render: (_, row) => `${row.start_time || '—'} - ${row.end_time || '—'}` },
                { key: 'type', label: 'Type', render: (v) => <Badge variant="info">{v}</Badge> },
                { key: 'availability_status', label: 'Status', render: (v) => (
                  <Badge variant={v === 'Available' ? 'success' : v === 'Busy' ? 'warning' : 'default'}>{v}</Badge>
                )}
              ]}
              data={schedules.slice(0, 6)}
            />
          </GlowCard>

          <GlowCard className="analytics-card" delay={0.3}>
            <h3 className="chart-title">Payment History</h3>
            <DataTable
              columns={[
                { key: 'personnel_name', label: 'Person' },
                { key: 'amount', label: 'Amount', render: (v) => <span className="amount-highlight">{formatCurrency(v)}</span> },
                { key: 'payment_date', label: 'Date', render: (v) => formatDate(v) },
                { key: 'payment_type', label: 'Type', render: (v) => <Badge>{v}</Badge> },
              ]}
              data={payments.slice(0, 5)}
            />
          </GlowCard>

          <GlowCard className="analytics-card" delay={0.4}>
            <h3 className="chart-title">Gift Inventory</h3>
            <div className="gift-grid">
              {giftTypes.slice(0, 6).map((gift, i) => (
                <div key={i} className="gift-item">
                  <p className="gift-name">{gift.name}</p>
                  <p className="gift-value">{formatCurrency(gift.value)}</p>
                  <Badge variant="info">{gift.category}</Badge>
                </div>
              ))}
            </div>
          </GlowCard>
        </div>
      </>
    );
  };

  const sections = {
    dashboard: renderDashboard,
    donors: renderDonors,
    donations: renderDonations,
    personnel: renderPersonnel,
    reports: renderReports,
    analytics: renderAnalytics
  };

  const counts = {
    donors: donors.length,
    donations: donations.length,
    personnel: personnel.length
  };

  const getItemName = () => {
    if (!itemToDelete?.item) return 'this item';
    const { item, type } = itemToDelete;
    if (type === 'donor' || type === 'personnel') {
      return `${item.firstname || ''} ${item.lastname || ''}`.trim() || 'this item';
    }
    if (type === 'donation') {
      return `${item.donor_name || 'Anonymous'}'s donation of ${formatCurrency(item.amount)}`;
    }
    return 'this item';
  };

  return (
    <div className="app-container">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap');
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        .app-container {
          min-height: 100vh;
          background: #0a0a0f;
          font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
          color: #e2e8f0;
          position: relative;
          overflow-x: hidden;
        }

        /* ========== Aurora Background ========== */
        .aurora-bg {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          overflow: hidden;
        }
        
        .aurora-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          mix-blend-mode: screen;
          animation: blob 12s infinite;
        }
        
        .aurora-blob-1 {
          top: -15%;
          left: -10%;
          width: 50vw;
          height: 50vw;
          background: rgba(139, 92, 246, 0.15);
        }
        
        .aurora-blob-2 {
          top: -10%;
          right: -15%;
          width: 45vw;
          height: 45vw;
          background: rgba(6, 182, 212, 0.12);
          animation-delay: 2s;
        }
        
        .aurora-blob-3 {
          bottom: -20%;
          left: 30%;
          width: 55vw;
          height: 55vw;
          background: rgba(236, 72, 153, 0.1);
          animation-delay: 4s;
        }
        
        .aurora-noise {
          position: absolute;
          inset: 0;
          background: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          opacity: 0.03;
          mix-blend-mode: overlay;
        }
        
        .aurora-grid {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(ellipse 80% 50% at 50% 0%, #000 70%, transparent 100%);
        }
        
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -40px) scale(1.05); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
        }

        /* ========== Spotlight ========== */
        .spotlight {
          position: fixed;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          transition: background 0.3s ease;
        }

        /* ========== Floating Navigation ========== */
        .floating-nav {
          position: fixed;
          top: 24px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 100;
          animation: slideDown 0.8s ease-out;
        }
        
        .floating-nav-inner {
          display: flex;
          gap: 6px;
          padding: 8px;
          background: rgba(15, 15, 25, 0.8);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 50px;
          box-shadow: 
            0 20px 50px rgba(0, 0, 0, 0.5),
            0 0 0 1px rgba(255, 255, 255, 0.05) inset;
        }
        
        .nav-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: transparent;
          border: none;
          border-radius: 30px;
          color: #94a3b8;
          font-size: 14px;
          font-weight: 500;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .nav-pill:hover {
          color: #e2e8f0;
          background: rgba(255, 255, 255, 0.05);
        }
        
        .nav-pill.active {
          color: #ffffff;
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(6, 182, 212, 0.2));
          box-shadow: 0 0 20px rgba(139, 92, 246, 0.3);
        }
        
        .nav-icon {
          font-size: 16px;
        }
        
        .nav-count {
          padding: 2px 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          font-size: 11px;
        }
        
        @keyframes slideDown {
          from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }

        /* ========== Main Content ========== */
        main {
          position: relative;
          z-index: 10;
          max-width: 1400px;
          margin: 0 auto;
          padding: 120px 48px 80px;
        }

        /* ========== Section Header ========== */
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 40px;
          animation: fadeUp 0.6s ease-out;
        }
        
        .section-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 42px;
          font-weight: 600;
          background: linear-gradient(135deg, #ffffff, #94a3b8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 8px;
        }
        
        .section-subtitle {
          color: #64748b;
          font-size: 16px;
        }

        /* ========== Buttons ========== */
        .btn-primary {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 14px 28px;
          background: linear-gradient(135deg, #8b5cf6, #6366f1);
          border: none;
          border-radius: 30px;
          color: white;
          font-size: 14px;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 10px 30px rgba(139, 92, 246, 0.3);
        }
        
        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 15px 40px rgba(139, 92, 246, 0.4);
        }
        
        .btn-primary:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .btn-secondary {
          padding: 12px 24px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: #e2e8f0;
          font-size: 14px;
          font-weight: 500;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .btn-secondary:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.1);
        }
        
        .btn-secondary:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .btn-danger {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: linear-gradient(135deg, #ef4444, #dc2626);
          border: none;
          border-radius: 12px;
          color: white;
          font-size: 14px;
          font-weight: 500;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .btn-danger:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .btn-spinner {
          display: inline-block;
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* ========== Glow Card ========== */
        .glow-card {
          position: relative;
          background: rgba(15, 15, 25, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 24px;
          overflow: hidden;
          animation: fadeUp 0.6s ease-out both;
          transition: all 0.4s ease;
        }
        
        .glow-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.5), transparent);
          opacity: 0;
          transition: opacity 0.4s ease;
        }
        
        .glow-card:hover::before {
          opacity: 1;
        }
        
        .glow-card.hoverable:hover {
          transform: translateY(-4px);
          border-color: rgba(139, 92, 246, 0.2);
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4);
        }
        
        .glow-card-inner {
          position: relative;
          z-index: 2;
          padding: 32px;
        }
        
        .glow-card-shine {
          position: absolute;
          top: -50%;
          right: -50%;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.08), transparent 60%);
          pointer-events: none;
        }
        
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* ========== Stats Grid ========== */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
          margin-bottom: 40px;
        }
        
        .stat-card .glow-card-inner {
          display: flex;
          gap: 20px;
        }
        
        .stat-icon {
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(6, 182, 212, 0.1));
          border-radius: 16px;
          font-size: 24px;
          flex-shrink: 0;
        }
        
        .stat-content {
          flex: 1;
        }
        
        .stat-label {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: #64748b;
          margin-bottom: 8px;
        }
        
        .stat-value {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 36px;
          font-weight: 600;
          color: #ffffff;
          line-height: 1;
          margin-bottom: 8px;
        }
        
        .stat-footer {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .stat-sublabel {
          font-size: 13px;
          color: #64748b;
        }
        
        .stat-trend {
          font-size: 12px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 6px;
        }
        
        .stat-trend.positive {
          color: #10b981;
          background: rgba(16, 185, 129, 0.1);
        }
        
        .stat-trend.negative {
          color: #ef4444;
          background: rgba(239, 68, 68, 0.1);
        }

        /* ========== Charts ========== */
        .charts-row {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 24px;
          margin-bottom: 40px;
        }
        
        .chart-card {
          min-height: 400px;
        }
        
        .chart-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 22px;
          font-weight: 600;
          color: #ffffff;
          margin-bottom: 4px;
        }
        
        .chart-subtitle {
          font-size: 14px;
          color: #64748b;
          margin-bottom: 24px;
        }
        
        .chart-container {
          height: 280px;
        }
        
        .pie-container {
          display: flex;
          flex-direction: column;
        }
        
        .pie-legend {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          margin-top: 16px;
        }
        
        .pie-legend.centered {
          justify-content: center;
        }
        
        .legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #94a3b8;
        }
        
        .legend-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        /* ========== Recent Activity ========== */
        .recent-section .glow-card-inner {
          padding: 32px;
        }
        
        .activity-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 24px;
        }
        
        .activity-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .activity-item:hover {
          background: rgba(139, 92, 246, 0.05);
          border-color: rgba(139, 92, 246, 0.2);
          transform: translateX(8px);
        }
        
        .activity-avatar {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #8b5cf6, #6366f1);
          border-radius: 12px;
          font-weight: 600;
          font-size: 18px;
          color: white;
        }
        
        .activity-info {
          flex: 1;
        }
        
        .activity-name {
          font-weight: 500;
          color: #ffffff;
          margin-bottom: 4px;
        }
        
        .activity-meta {
          font-size: 13px;
          color: #64748b;
        }
        
        .activity-amount {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 22px;
          font-weight: 600;
          color: #8b5cf6;
        }

        /* ========== Loading & Empty States ========== */
        .loading-spinner {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px;
          gap: 16px;
          color: #64748b;
        }
        
        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(139, 92, 246, 0.2);
          border-top-color: #8b5cf6;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px;
          gap: 12px;
        }
        
        .empty-icon {
          font-size: 48px;
        }
        
        .empty-state p {
          color: #64748b;
          font-size: 16px;
        }

        /* ========== Toast Notifications ========== */
        .toast {
          position: fixed;
          bottom: 24px;
          right: 24px;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          background: rgba(15, 15, 25, 0.95);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
          z-index: 1001;
          animation: slideIn 0.3s ease;
        }
        
        .toast-success {
          border-color: rgba(16, 185, 129, 0.3);
        }
        
        .toast-success .toast-icon {
          color: #10b981;
        }
        
        .toast-error {
          border-color: rgba(239, 68, 68, 0.3);
        }
        
        .toast-error .toast-icon {
          color: #ef4444;
        }
        
        .toast-icon {
          font-size: 18px;
          font-weight: bold;
        }
        
        .toast-close {
          background: none;
          border: none;
          color: #64748b;
          font-size: 18px;
          cursor: pointer;
          padding: 0;
          margin-left: 8px;
        }
        
        .toast-close:hover {
          color: #ffffff;
        }
        
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }

        /* ========== Data Table ========== */
        .data-table-wrapper {
          background: rgba(15, 15, 25, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 20px;
          overflow: hidden;
          animation: fadeUp 0.6s ease-out 0.2s both;
        }
        
        .data-table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .data-table thead tr {
          background: rgba(255, 255, 255, 0.03);
        }
        
        .data-table th {
          padding: 18px 24px;
          text-align: left;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: #64748b;
          font-weight: 600;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }
        
        .data-table tbody tr {
          cursor: pointer;
          transition: background 0.2s ease;
        }
        
        .data-table tbody tr:hover {
          background: rgba(139, 92, 246, 0.05);
        }
        
        .data-table td {
          padding: 20px 24px;
          font-size: 14px;
          color: #94a3b8;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
        }
        
        .data-table .primary-cell {
          color: #ffffff;
          font-weight: 500;
        }
        
        .amount-highlight {
          color: #8b5cf6;
          font-weight: 600;
        }
        
        .actions-cell {
          display: flex;
          gap: 8px;
        }
        
        .action-btn {
          padding: 6px 14px;
          border: none;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 500;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .action-btn.edit {
          background: rgba(139, 92, 246, 0.1);
          color: #a78bfa;
        }
        
        .action-btn.edit:hover {
          background: rgba(139, 92, 246, 0.2);
        }
        
        .action-btn.delete {
          background: rgba(239, 68, 68, 0.1);
          color: #f87171;
        }
        
        .action-btn.delete:hover {
          background: rgba(239, 68, 68, 0.2);
        }

        /* ========== Badge ========== */
        .badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
        }
        
        .badge-default {
          background: rgba(255, 255, 255, 0.08);
          color: #94a3b8;
        }
        
        .badge-primary {
          background: rgba(139, 92, 246, 0.15);
          color: #a78bfa;
        }
        
        .badge-success {
          background: rgba(16, 185, 129, 0.15);
          color: #34d399;
        }
        
        .badge-accent {
          background: rgba(236, 72, 153, 0.15);
          color: #f472b6;
        }
        
        .badge-info {
          background: rgba(6, 182, 212, 0.15);
          color: #22d3ee;
        }
        
        .badge-warning {
          background: rgba(245, 158, 11, 0.15);
          color: #fbbf24;
        }

        /* ========== Modal ========== */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.3s ease;
        }
        
        .modal-container {
          background: linear-gradient(180deg, rgba(20, 20, 35, 0.98), rgba(15, 15, 25, 0.98));
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 24px;
          width: 90%;
          max-width: 500px;
          max-height: 85vh;
          overflow: auto;
          animation: scaleIn 0.3s ease;
          box-shadow: 0 40px 80px rgba(0, 0, 0, 0.5);
        }
        
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 28px 32px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }
        
        .modal-header h3 {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 24px;
          color: #ffffff;
        }
        
        .modal-close {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.05);
          border: none;
          border-radius: 50%;
          color: #94a3b8;
          font-size: 20px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .modal-close:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #ffffff;
        }
        
        .modal-body {
          padding: 32px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        
        .form-field label {
          display: block;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: #64748b;
          margin-bottom: 8px;
        }
        
        .form-field .required {
          color: #ef4444;
          margin-left: 4px;
        }
        
        .form-field input,
        .form-field select,
        .form-field textarea {
          width: 100%;
          padding: 14px 16px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          color: #e2e8f0;
          font-size: 15px;
          font-family: inherit;
          transition: all 0.2s ease;
        }
        
        .form-field input:focus,
        .form-field select:focus,
        .form-field textarea:focus {
          outline: none;
          border-color: rgba(139, 92, 246, 0.5);
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
        }
        
        .form-field input:disabled,
        .form-field select:disabled,
        .form-field textarea:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .form-field.has-error input,
        .form-field.has-error select {
          border-color: rgba(239, 68, 68, 0.5);
        }
        
        .error-message {
          display: block;
          margin-top: 6px;
          color: #ef4444;
          font-size: 12px;
        }
        
        .checkbox-wrapper {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
        }
        
        .checkbox-wrapper input[type="checkbox"] {
          width: 20px;
          height: 20px;
          accent-color: #8b5cf6;
        }
        
        .checkbox-label {
          font-size: 14px;
          color: #e2e8f0;
        }
        
        .field-value {
          font-size: 16px;
          color: #ffffff;
          font-weight: 500;
        }
        
        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 24px 32px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }
        
        .delete-modal {
          text-align: center;
          padding: 40px;
        }
        
        .delete-icon {
          font-size: 48px;
          margin-bottom: 20px;
        }
        
        .delete-modal h3 {
          font-size: 22px;
          margin-bottom: 12px;
          color: #ffffff;
        }
        
        .delete-modal p {
          color: #94a3b8;
          margin-bottom: 28px;
        }
        
        .delete-modal .modal-footer {
          justify-content: center;
          border-top: none;
          padding: 0;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }

        /* ========== Reports Grid ========== */
        .reports-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
        }
        
        .report-card {
          min-height: 350px;
        }
        
        .report-card.wide {
          grid-column: span 2;
        }
        
        .report-card.summary {
          min-height: auto;
        }
        
        .summary-items {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          margin-top: 20px;
        }
        
        .summary-item {
          padding: 20px;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.04);
        }
        
        .summary-label {
          display: block;
          font-size: 12px;
          color: #64748b;
          margin-bottom: 8px;
        }
        
        .summary-value {
          display: block;
          font-size: 20px;
          font-weight: 600;
          color: #ffffff;
        }

        /* ========== Analytics Grid ========== */
        .analytics-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
        }
        
        .analytics-card {
          min-height: 350px;
        }
        
        .analytics-card.wide {
          grid-column: span 2;
        }
        
        .metrics-grid {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-top: 20px;
        }
        
        .metric-item {
          padding: 16px;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 12px;
        }
        
        .metric-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
        }
        
        .metric-label {
          font-size: 14px;
          color: #94a3b8;
        }
        
        .metric-value {
          font-weight: 600;
          color: #8b5cf6;
        }
        
        .metric-bar {
          height: 6px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 3px;
          overflow: hidden;
        }
        
        .metric-fill {
          height: 100%;
          background: linear-gradient(90deg, #8b5cf6, #06b6d4);
          border-radius: 3px;
          transition: width 0.5s ease;
        }
        
        .gift-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          margin-top: 20px;
        }
        
        .gift-item {
          padding: 20px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 16px;
        }
        
        .gift-name {
          font-weight: 500;
          color: #ffffff;
          margin-bottom: 8px;
        }
        
        .gift-value {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 20px;
          color: #8b5cf6;
          margin-bottom: 12px;
        }

        /* ========== Responsive ========== */
        @media (max-width: 1200px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .charts-row {
            grid-template-columns: 1fr;
          }
        }
        
        @media (max-width: 768px) {
          main {
            padding: 100px 20px 60px;
          }
          
          .floating-nav-inner {
            flex-wrap: wrap;
            justify-content: center;
            border-radius: 24px;
            max-width: calc(100vw - 40px);
          }
          
          .nav-pill {
            padding: 10px 16px;
            font-size: 13px;
          }
          
          .stats-grid {
            grid-template-columns: 1fr;
          }
          
          .section-title {
            font-size: 32px;
          }
          
          .reports-grid,
          .analytics-grid {
            grid-template-columns: 1fr;
          }
          
          .report-card.wide,
          .analytics-card.wide {
            grid-column: span 1;
          }
        }

        /* ========== Scrollbar ========== */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        
        ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>

      <AuroraBackground />
      <Spotlight />
      
      <FloatingNav 
        activeSection={activeSection} 
        setActiveSection={setActiveSection}
        counts={counts}
      />

      <main>
        {sections[activeSection]?.()}
      </main>

      {/* CRUD Modal */}
      <CrudModal
        isOpen={modalOpen}
        onClose={() => !saving && setModalOpen(false)}
        title={modalType === 'donor' ? 'Donor' : modalType === 'donation' ? 'Donation' : 'Team Member'}
        fields={fieldConfigs[modalType] || []}
        data={selectedItem}
        onSave={handleSave}
        mode={modalMode}
        saving={saving}
      />

      {/* Delete Confirmation */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => !deleting && setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        itemName={getItemName()}
        deleting={deleting}
      />

      {/* Toast Notifications */}
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}