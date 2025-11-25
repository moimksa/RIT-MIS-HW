/**
 * DonorHub Dashboard JavaScript
 * Dashboard-specific functionality and charts
 */

// Charts instances
let donationChart = null;
let donorDistributionChart = null;

// ========================================
// Initialize Dashboard
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    loadDashboard();
    populateDonorSelect();
    populateCampaignSelect();

    // Chart filter
    const chartFilter = document.getElementById('donationChartFilter');
    if (chartFilter) {
        chartFilter.addEventListener('change', (e) => {
            loadDonationChart(parseInt(e.target.value));
        });
    }
});

async function loadDashboard() {
    try {
        await Promise.all([
            loadDashboardStats(),
            loadDonationChart(12),
            loadCampaignProgress(),
            loadRecentDonations(),
            loadDonorDistribution(),
            loadTopDonors()
        ]);
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showToast('Failed to load dashboard data', 'error');
    }
}

// ========================================
// Dashboard Stats
// ========================================

async function loadDashboardStats() {
    try {
        const data = await api.getDashboardData();

        // Animate numbers
        animateNumber('totalDonations', data.ytd_donations || 0, true);
        animateNumber('activeDonors', data.active_donors || 0, false);
        animateNumber('activeCampaigns', data.active_campaigns || 0, false);
        animateNumber('netRevenue', data.net_revenue || 0, true);
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

function animateNumber(elementId, target, isCurrency = false) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const duration = 1000;
    const start = 0;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = Math.floor(start + (target - start) * easeOutQuart);

        element.textContent = isCurrency ? formatCurrency(current) : current.toLocaleString();

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

// ========================================
// Donation Trends Chart
// ========================================

async function loadDonationChart(months = 12) {
    try {
        const response = await api.getDonationStatistics(months);
        const data = response.items || [];

        // Process data
        const labels = data.map(d => {
            const [year, month] = d.month.split('-');
            return new Date(year, month - 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        });
        const amounts = data.map(d => d.total_amount);
        const counts = data.map(d => d.donation_count);

        const ctx = document.getElementById('donationChart');
        if (!ctx) return;

        // Destroy existing chart
        if (donationChart) {
            donationChart.destroy();
        }

        donationChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Donation Amount',
                        data: amounts,
                        backgroundColor: 'rgba(13, 148, 136, 0.8)',
                        borderColor: 'rgba(13, 148, 136, 1)',
                        borderWidth: 0,
                        borderRadius: 6,
                        yAxisID: 'y',
                    },
                    {
                        label: 'Number of Donations',
                        data: counts,
                        type: 'line',
                        borderColor: CONFIG.CHART_COLORS.accent,
                        backgroundColor: 'transparent',
                        borderWidth: 3,
                        pointBackgroundColor: CONFIG.CHART_COLORS.accent,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        tension: 0.3,
                        yAxisID: 'y1',
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 20,
                            font: {
                                family: "'Outfit', sans-serif",
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'white',
                        titleColor: '#171717',
                        bodyColor: '#525252',
                        borderColor: '#e5e5e5',
                        borderWidth: 1,
                        padding: 12,
                        titleFont: {
                            family: "'Outfit', sans-serif",
                            size: 14,
                            weight: '600'
                        },
                        bodyFont: {
                            family: "'Outfit', sans-serif",
                            size: 13
                        },
                        callbacks: {
                            label: function(context) {
                                if (context.datasetIndex === 0) {
                                    return ' Amount: ' + formatCurrency(context.raw);
                                }
                                return ' Count: ' + context.raw + ' donations';
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            font: {
                                family: "'Outfit', sans-serif",
                                size: 11
                            }
                        }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        grid: {
                            color: '#f5f5f5'
                        },
                        ticks: {
                            font: {
                                family: "'Outfit', sans-serif",
                                size: 11
                            },
                            callback: function(value) {
                                return formatCurrency(value);
                            }
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        grid: {
                            drawOnChartArea: false
                        },
                        ticks: {
                            font: {
                                family: "'Outfit', sans-serif",
                                size: 11
                            }
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error loading donation chart:', error);
    }
}

// ========================================
// Campaign Progress
// ========================================

async function loadCampaignProgress() {
    try {
        const response = await api.getCampaignProgress();
        const campaigns = response.items || [];

        const container = document.getElementById('campaignsList');
        if (!container) return;

        if (campaigns.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-bullhorn" style="font-size: 2rem; color: var(--neutral-300);"></i>
                    <p style="margin-top: 0.5rem; color: var(--neutral-500);">No active campaigns</p>
                </div>
            `;
            return;
        }

        container.innerHTML = campaigns.map(campaign => `
            <div class="campaign-item">
                <div class="campaign-header">
                    <span class="campaign-name">${campaign.campaign_name}</span>
                    <span class="campaign-amount">
                        <strong>${formatCurrency(campaign.raised_amount)}</strong> / ${formatCurrency(campaign.goal_amount)}
                    </span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${Math.min(campaign.progress_percent, 100)}%"></div>
                </div>
                <div class="campaign-footer">
                    <span>${campaign.progress_percent.toFixed(1)}% complete</span>
                    <span>${campaign.donor_count} donors</span>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading campaigns:', error);
    }
}

// ========================================
// Recent Donations
// ========================================

async function loadRecentDonations() {
    try {
        const response = await api.getRecentDonations(8);
        const donations = response.items || [];

        const columns = [
            { 
                key: 'donor_name', 
                render: (val) => `<span class="text-primary" style="font-weight: 500;">${val}</span>` 
            },
            { 
                key: 'amount', 
                render: (val) => `<strong>${formatCurrency(val)}</strong>` 
            },
            { 
                key: 'campaign_name', 
                render: (val) => val || '<span class="text-muted">General</span>' 
            },
            { 
                key: 'donation_date', 
                render: (val) => formatDate(val) 
            },
            { 
                key: 'payment_status', 
                render: (val) => renderStatusBadge(val) 
            }
        ];

        renderTable('recentDonationsTable', columns, donations);
    } catch (error) {
        console.error('Error loading recent donations:', error);
    }
}

// ========================================
// Donor Distribution Chart
// ========================================

async function loadDonorDistribution() {
    try {
        const response = await api.getDonors();
        const donors = response.items || [];

        // Count by type
        const typeCounts = {};
        donors.forEach(d => {
            const type = d.donor_type || 'OTHER';
            typeCounts[type] = (typeCounts[type] || 0) + 1;
        });

        const labels = Object.keys(typeCounts).map(t => t.charAt(0) + t.slice(1).toLowerCase());
        const data = Object.values(typeCounts);
        const colors = Object.keys(typeCounts).map(t => CONFIG.CHART_COLORS.donorTypes[t] || '#6b7280');

        const ctx = document.getElementById('donorDistributionChart');
        if (!ctx) return;

        // Destroy existing chart
        if (donorDistributionChart) {
            donorDistributionChart.destroy();
        }

        donorDistributionChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderWidth: 0,
                    hoverOffset: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                cutout: '65%',
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'white',
                        titleColor: '#171717',
                        bodyColor: '#525252',
                        borderColor: '#e5e5e5',
                        borderWidth: 1,
                        padding: 12,
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.raw / total) * 100).toFixed(1);
                                return ` ${context.label}: ${context.raw} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });

        // Render custom legend
        const legendContainer = document.getElementById('donorLegend');
        if (legendContainer) {
            legendContainer.innerHTML = labels.map((label, i) => `
                <div class="legend-item">
                    <div class="legend-color" style="background: ${colors[i]}"></div>
                    <span>${label} (${data[i]})</span>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading donor distribution:', error);
    }
}

// ========================================
// Top Donors
// ========================================

async function loadTopDonors() {
    try {
        const response = await api.getTopDonors(5);
        const donors = response.items || [];

        const container = document.getElementById('topDonorsList');
        if (!container) return;

        if (donors.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-users" style="font-size: 2rem; color: var(--neutral-300);"></i>
                    <p style="margin-top: 0.5rem; color: var(--neutral-500);">No donors yet</p>
                </div>
            `;
            return;
        }

        container.innerHTML = donors.map((donor, index) => `
            <div class="top-donor-item">
                <div class="donor-rank">${index + 1}</div>
                <div class="donor-avatar">
                    <i class="fas ${donor.donor_type === 'INDIVIDUAL' ? 'fa-user' : 'fa-building'}"></i>
                </div>
                <div class="donor-info">
                    <div class="donor-name">${donor.display_name}</div>
                    <div class="donor-donations">${donor.donation_count} donation${donor.donation_count !== 1 ? 's' : ''}</div>
                </div>
                <div class="donor-total">${formatCurrency(donor.total_donations)}</div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading top donors:', error);
    }
}

// ========================================
// Auto Refresh (if enabled)
// ========================================

if (CONFIG.APP.AUTO_REFRESH_INTERVAL > 0) {
    setInterval(() => {
        loadDashboard();
    }, CONFIG.APP.AUTO_REFRESH_INTERVAL);
}
