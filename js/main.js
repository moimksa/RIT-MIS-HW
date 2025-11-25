/**
 * DonorHub Main JavaScript
 * Common functionality used across all pages
 */

// ========================================
// DOM Ready
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    initSidebar();
    initModals();
    initForms();
    api.init();
});

// ========================================
// Sidebar
// ========================================

function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');

    // Desktop toggle
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
        });

        // Restore state
        if (localStorage.getItem('sidebarCollapsed') === 'true') {
            sidebar.classList.add('collapsed');
        }
    }

    // Mobile menu
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 992 && 
                !sidebar.contains(e.target) && 
                !mobileMenuBtn.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        });
    }

    // Set active nav item based on current page
    setActiveNavItem();
}

function setActiveNavItem() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
        item.classList.remove('active');
        const link = item.querySelector('a');
        if (link) {
            const href = link.getAttribute('href');
            if (href && (href.endsWith(currentPage) || (currentPage === 'index.html' && href === 'index.html'))) {
                item.classList.add('active');
            }
        }
    });
}

// ========================================
// Modals
// ========================================

function initModals() {
    // Close modal on overlay click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeModal(overlay.id);
            }
        });
    });

    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const openModal = document.querySelector('.modal-overlay.active');
            if (openModal) {
                closeModal(openModal.id);
            }
        }
    });
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        
        // Reset form if exists
        const form = modal.querySelector('form');
        if (form) {
            form.reset();
        }
    }
}

// ========================================
// Forms
// ========================================

function initForms() {
    // Donor type toggle
    const donorTypeSelect = document.getElementById('donorType');
    if (donorTypeSelect) {
        donorTypeSelect.addEventListener('change', function() {
            const individualFields = document.getElementById('individualFields');
            const orgField = document.getElementById('orgField');
            
            if (this.value === 'INDIVIDUAL') {
                individualFields.style.display = 'flex';
                orgField.style.display = 'none';
            } else {
                individualFields.style.display = 'none';
                orgField.style.display = 'flex';
            }
        });
    }

    // New Donor Form
    const newDonorForm = document.getElementById('newDonorForm');
    if (newDonorForm) {
        newDonorForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleNewDonor(newDonorForm);
        });
    }

    // New Donation Form
    const newDonationForm = document.getElementById('newDonationForm');
    if (newDonationForm) {
        newDonationForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleNewDonation(newDonationForm);
        });
    }
}

async function handleNewDonor(form) {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    try {
        showLoading('Saving donor...');
        await api.createDonor(data);
        showToast('Donor created successfully!', 'success');
        closeModal('newDonorModal');
        
        // Refresh data if on relevant page
        if (typeof loadDonors === 'function') {
            loadDonors();
        }
    } catch (error) {
        showToast('Failed to create donor. Please try again.', 'error');
        console.error('Error creating donor:', error);
    } finally {
        hideLoading();
    }
}

async function handleNewDonation(form) {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    try {
        showLoading('Saving donation...');
        await api.createDonation(data);
        showToast('Donation recorded successfully!', 'success');
        closeModal('newDonationModal');
        
        // Refresh data if on relevant page
        if (typeof loadDashboard === 'function') {
            loadDashboard();
        }
    } catch (error) {
        showToast('Failed to record donation. Please try again.', 'error');
        console.error('Error creating donation:', error);
    } finally {
        hideLoading();
    }
}

// ========================================
// Toast Notifications
// ========================================

function showToast(message, type = 'info') {
    // Remove existing toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };

    toast.innerHTML = `
        <i class="fas ${icons[type]}"></i>
        <span>${message}</span>
        <button class="toast-close"><i class="fas fa-times"></i></button>
    `;

    // Add styles if not already present
    if (!document.getElementById('toast-styles')) {
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.textContent = `
            .toast {
                position: fixed;
                top: 1.5rem;
                right: 1.5rem;
                padding: 1rem 1.5rem;
                border-radius: var(--radius-md);
                background: white;
                box-shadow: var(--shadow-lg);
                display: flex;
                align-items: center;
                gap: 0.75rem;
                z-index: 3000;
                animation: slideInRight 0.3s ease;
            }
            .toast-success { border-left: 4px solid var(--success-500); }
            .toast-error { border-left: 4px solid var(--error-500); }
            .toast-warning { border-left: 4px solid var(--warning-500); }
            .toast-info { border-left: 4px solid var(--info-500); }
            .toast-success i { color: var(--success-500); }
            .toast-error i { color: var(--error-500); }
            .toast-warning i { color: var(--warning-500); }
            .toast-info i { color: var(--info-500); }
            .toast-close {
                background: none;
                border: none;
                color: var(--neutral-400);
                cursor: pointer;
                padding: 0.25rem;
                margin-left: 0.5rem;
            }
            .toast-close:hover { color: var(--neutral-600); }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(toast);

    // Close button
    toast.querySelector('.toast-close').addEventListener('click', () => toast.remove());

    // Auto remove after 5 seconds
    setTimeout(() => toast.remove(), 5000);
}

// ========================================
// Loading States
// ========================================

function showLoading(message = 'Loading...') {
    let overlay = document.getElementById('loadingOverlay');
    
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'loadingOverlay';
        overlay.innerHTML = `
            <div class="loading-content">
                <div class="spinner"></div>
                <p class="loading-message">${message}</p>
            </div>
        `;
        
        // Add styles if not already present
        if (!document.getElementById('loading-styles')) {
            const style = document.createElement('style');
            style.id = 'loading-styles';
            style.textContent = `
                #loadingOverlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(255, 255, 255, 0.9);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 4000;
                }
                .loading-content {
                    text-align: center;
                }
                .loading-message {
                    margin-top: 1rem;
                    color: var(--neutral-600);
                    font-weight: 500;
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(overlay);
    } else {
        overlay.querySelector('.loading-message').textContent = message;
        overlay.style.display = 'flex';
    }
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

// ========================================
// Data Table Utilities
// ========================================

function renderTable(tableId, columns, data) {
    const tbody = document.getElementById(tableId);
    if (!tbody) return;

    if (!data || data.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="${columns.length}" class="text-center" style="padding: 2rem;">
                    <div class="empty-state">
                        <i class="fas fa-inbox" style="font-size: 2rem; color: var(--neutral-300);"></i>
                        <p style="margin-top: 0.5rem; color: var(--neutral-500);">No data available</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = data.map(row => `
        <tr>
            ${columns.map(col => `<td>${col.render ? col.render(row[col.key], row) : (row[col.key] || '-')}</td>`).join('')}
        </tr>
    `).join('');
}

// ========================================
// Badge Renderers
// ========================================

function renderStatusBadge(status) {
    const statusMap = {
        'COMPLETED': { class: 'badge-success', label: 'Completed' },
        'PENDING': { class: 'badge-warning', label: 'Pending' },
        'FAILED': { class: 'badge-error', label: 'Failed' },
        'CANCELLED': { class: 'badge-neutral', label: 'Cancelled' },
        'ACTIVE': { class: 'badge-success', label: 'Active' },
        'INACTIVE': { class: 'badge-neutral', label: 'Inactive' },
        'PLANNED': { class: 'badge-info', label: 'Planned' },
        'PAUSED': { class: 'badge-warning', label: 'Paused' },
    };

    const config = statusMap[status] || { class: 'badge-neutral', label: status };
    return `<span class="badge ${config.class}">${config.label}</span>`;
}

function renderDonorLevelBadge(level) {
    const levelLower = (level || 'bronze').toLowerCase();
    return `<span class="badge badge-${levelLower}">${level}</span>`;
}

function renderDonorTypeBadge(type) {
    const typeMap = {
        'INDIVIDUAL': { class: 'badge-info', label: 'Individual' },
        'CORPORATE': { class: 'badge-success', label: 'Corporate' },
        'FOUNDATION': { class: 'badge-neutral', label: 'Foundation' },
        'GOVERNMENT': { class: 'badge-warning', label: 'Government' },
    };

    const config = typeMap[type] || { class: 'badge-neutral', label: type };
    return `<span class="badge ${config.class}">${config.label}</span>`;
}

// ========================================
// Utility Functions
// ========================================

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ========================================
// Populate Form Dropdowns
// ========================================

async function populateDonorSelect() {
    const select = document.getElementById('donorSelect');
    if (!select) return;

    try {
        const response = await api.getDonors();
        const donors = response.items || [];

        select.innerHTML = '<option value="">Select a donor...</option>' +
            donors.map(d => `<option value="${d.donor_id}">${d.display_name}</option>`).join('');
    } catch (error) {
        console.error('Error loading donors:', error);
    }
}

async function populateCampaignSelect() {
    const select = document.getElementById('campaignSelect');
    if (!select) return;

    try {
        const response = await api.getActiveCampaigns();
        const campaigns = response.items || [];

        select.innerHTML = '<option value="">No specific campaign</option>' +
            campaigns.map(c => `<option value="${c.campaign_id}">${c.campaign_name}</option>`).join('');
    } catch (error) {
        console.error('Error loading campaigns:', error);
    }
}

// ========================================
// Export Data
// ========================================

function exportToCSV(data, filename) {
    if (!data || data.length === 0) {
        showToast('No data to export', 'warning');
        return;
    }

    const headers = Object.keys(data[0]);
    const csv = [
        headers.join(','),
        ...data.map(row => headers.map(h => `"${row[h] || ''}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    showToast('Export completed!', 'success');
}
