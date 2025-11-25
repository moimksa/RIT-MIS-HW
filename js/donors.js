/**
 * DonorHub Donors Page JavaScript
 */

let currentPage = 1;
let pageSize = CONFIG.APP.DEFAULT_PAGE_SIZE;
let totalDonors = 0;
let currentFilters = {};
let allDonors = [];

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadDonors();
    initFilters();
    initSearch();
    initDonorTypeToggle();
});

async function loadDonors() {
    try {
        const params = { page: currentPage, page_size: pageSize, ...currentFilters };
        const response = await api.getDonors(params);
        allDonors = response.items || [];
        totalDonors = response.total_count || allDonors.length;
        renderDonorsTable(allDonors);
        renderPagination();
    } catch (error) {
        console.error('Error loading donors:', error);
        showToast('Failed to load donors', 'error');
    }
}

function renderDonorsTable(donors) {
    const columns = [
        {
            key: 'display_name',
            render: (val, row) => `
                <div style="display:flex;align-items:center;gap:0.75rem;">
                    <div class="donor-avatar" style="width:36px;height:36px;font-size:0.9rem;">
                        <i class="fas ${row.donor_type === 'INDIVIDUAL' ? 'fa-user' : 'fa-building'}"></i>
                    </div>
                    <span style="font-weight:500;">${val}</span>
                </div>
            `
        },
        { key: 'donor_type', render: (val) => renderDonorTypeBadge(val) },
        {
            key: 'email',
            render: (val, row) => `<div style="font-size:0.85rem;">${val || '-'}<br><span style="color:var(--neutral-500);">${row.phone || ''}</span></div>`
        },
        { key: 'city', render: (val, row) => val ? `${val}${row.country ? ', ' + row.country : ''}` : '-' },
        { key: 'donor_level', render: (val) => renderDonorLevelBadge(val || 'BRONZE') },
        { key: 'total_donations', render: (val) => `<strong>${formatCurrency(val || 0)}</strong>` },
        { key: 'status', render: (val) => renderStatusBadge(val || 'ACTIVE') },
        {
            key: 'donor_id',
            render: (val) => `
                <div class="action-buttons">
                    <button class="action-btn view" onclick="viewDonor(${val})" title="View"><i class="fas fa-eye"></i></button>
                    <button class="action-btn edit" onclick="editDonor(${val})" title="Edit"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete" onclick="deleteDonor(${val})" title="Delete"><i class="fas fa-trash"></i></button>
                </div>
            `
        }
    ];
    renderTable('donorsTable', columns, donors);
}

function renderPagination() {
    const container = document.getElementById('pagination');
    if (!container) return;
    const totalPages = Math.ceil(totalDonors / pageSize);
    if (totalPages <= 1) { container.innerHTML = ''; return; }

    let html = `<button class="pagination-btn" onclick="goToPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}><i class="fas fa-chevron-left"></i></button>`;
    for (let i = 1; i <= Math.min(totalPages, 5); i++) {
        html += `<button class="pagination-btn ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
    }
    html += `<button class="pagination-btn" onclick="goToPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}><i class="fas fa-chevron-right"></i></button>`;
    html += `<span class="pagination-info">Showing ${(currentPage - 1) * pageSize + 1}-${Math.min(currentPage * pageSize, totalDonors)} of ${totalDonors}</span>`;
    container.innerHTML = html;
}

function goToPage(page) {
    const totalPages = Math.ceil(totalDonors / pageSize);
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    loadDonors();
}

function initFilters() {
    ['filterType', 'filterLevel', 'filterStatus'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', applyFilters);
    });
}

function applyFilters() {
    currentFilters = {};
    currentPage = 1;
    const type = document.getElementById('filterType').value;
    const level = document.getElementById('filterLevel').value;
    const status = document.getElementById('filterStatus').value;
    if (type) currentFilters.donor_type = type;
    if (level) currentFilters.donor_level = level;
    if (status) currentFilters.status = status;
    loadDonors();
}

function clearFilters() {
    document.getElementById('filterType').value = '';
    document.getElementById('filterLevel').value = '';
    document.getElementById('filterStatus').value = '';
    document.getElementById('donorSearch').value = '';
    currentFilters = {};
    currentPage = 1;
    loadDonors();
}

function initSearch() {
    const searchInput = document.getElementById('donorSearch');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(function() {
            const query = this.value.trim();
            if (query.length >= 2) currentFilters.search = query;
            else delete currentFilters.search;
            currentPage = 1;
            loadDonors();
        }, 300));
    }
}

function initDonorTypeToggle() {
    const donorTypeSelect = document.getElementById('donorType');
    if (donorTypeSelect) {
        donorTypeSelect.addEventListener('change', function() {
            const individualFields = document.getElementById('individualFields');
            const orgField = document.getElementById('orgField');
            const demographicsSection = document.getElementById('demographicsSection');
            if (this.value === 'INDIVIDUAL') {
                individualFields.style.display = 'flex';
                orgField.style.display = 'none';
                if (demographicsSection) demographicsSection.style.display = 'block';
            } else {
                individualFields.style.display = 'none';
                orgField.style.display = 'flex';
                if (demographicsSection) demographicsSection.style.display = 'none';
            }
        });
    }
}

async function viewDonor(donorId) {
    let donor = allDonors.find(d => d.donor_id === donorId);
    if (!donor) donor = await api.getDonorById(donorId);
    
    const container = document.getElementById('donorDetails');
    container.innerHTML = `
        <div class="donor-profile">
            <div class="donor-avatar-large"><i class="fas ${donor.donor_type === 'INDIVIDUAL' ? 'fa-user' : 'fa-building'}"></i></div>
            <div class="donor-header-info">
                <h2>${donor.display_name}</h2>
                <div style="display:flex;gap:0.5rem;margin:0.5rem 0;">${renderDonorTypeBadge(donor.donor_type)} ${renderDonorLevelBadge(donor.donor_level || 'BRONZE')}</div>
                <div class="donor-meta">
                    ${donor.email ? `<span class="donor-meta-item"><i class="fas fa-envelope"></i> ${donor.email}</span>` : ''}
                    ${donor.phone ? `<span class="donor-meta-item"><i class="fas fa-phone"></i> ${donor.phone}</span>` : ''}
                    ${donor.city ? `<span class="donor-meta-item"><i class="fas fa-location-dot"></i> ${donor.city}</span>` : ''}
                </div>
            </div>
        </div>
        <div class="stats-row">
            <div class="stat-box"><div class="stat-box-value">${formatCurrency(donor.total_donations || 0)}</div><div class="stat-box-label">Total Donations</div></div>
            <div class="stat-box"><div class="stat-box-value">${donor.donation_count || 0}</div><div class="stat-box-label">Donations</div></div>
            <div class="stat-box"><div class="stat-box-value">${formatCurrency(donor.average_donation || 0)}</div><div class="stat-box-label">Average</div></div>
            <div class="stat-box"><div class="stat-box-value">${formatCurrency(donor.largest_donation || 0)}</div><div class="stat-box-label">Largest</div></div>
        </div>
    `;
    container.dataset.donorId = donorId;
    openModal('viewDonorModal');
}

function editDonor(donorId) {
    showToast('Edit functionality - configure your APEX backend', 'info');
}

async function deleteDonor(donorId) {
    if (!confirm('Are you sure you want to delete this donor?')) return;
    try {
        await api.deleteDonor(donorId);
        showToast('Donor deleted successfully', 'success');
        loadDonors();
    } catch (error) {
        showToast('Failed to delete donor', 'error');
    }
}

function exportDonors() {
    if (allDonors.length === 0) { showToast('No donors to export', 'warning'); return; }
    const data = allDonors.map(d => ({
        Name: d.display_name, Type: d.donor_type, Email: d.email, Phone: d.phone,
        City: d.city, Level: d.donor_level, 'Total Donations': d.total_donations
    }));
    exportToCSV(data, 'donors');
}
