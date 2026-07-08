// ============================================
// DASHBOARD.JS - Toutes les actions du tableau de bord
// ============================================

// ============================================
// AUTHENTIFICATION
// ============================================
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || '{}');

function showPublic() {
    document.getElementById('publicSection').classList.remove('hidden');
    document.getElementById('dashboardSection').classList.add('hidden');
    document.getElementById('openLoginModal').classList.remove('hidden');
    document.getElementById('userInfo').classList.add('hidden');
}

function showDashboard() {
    document.getElementById('publicSection').classList.add('hidden');
    document.getElementById('dashboardSection').classList.remove('hidden');
    document.getElementById('openLoginModal').classList.add('hidden');
    document.getElementById('userInfo').classList.remove('hidden');
    document.getElementById('userFirstName').textContent = user.first_name || 'Client';
    document.getElementById('userBalance').textContent = (user.balance || 0).toFixed(2) + ' €';
    loadBeneficiaries();
    loadDepositAddresses();
    loadUserProfile();
}

if (token && user.email) {
    showDashboard();
} else {
    showPublic();
}

// ============================================
// MODAL LOGIN/REGISTER
// ============================================
const modal = document.getElementById('authModal');
document.getElementById('openLoginModal').addEventListener('click', () => modal.classList.remove('hidden'));
document.getElementById('heroOpenRegister').addEventListener('click', () => {
    modal.classList.remove('hidden');
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('registerForm').classList.remove('hidden');
});
document.getElementById('closeModal').addEventListener('click', () => modal.classList.add('hidden'));

document.getElementById('showRegister').addEventListener('click', () => {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('registerForm').classList.remove('hidden');
});
document.getElementById('showLogin').addEventListener('click', () => {
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('registerForm').classList.add('hidden');
});

// ============================================
// CONNEXION
// ============================================
document.getElementById('loginFormSubmit').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const errorEl = document.getElementById('loginError');
    errorEl.classList.add('hidden');

    fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    })
    .then(res => res.json())
    .then(data => {
        if (!data.success || !data.user) {
            errorEl.textContent = data.error || 'Email ou mot de passe incorrect';
            errorEl.classList.remove('hidden');
            return;
        }
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        if (data.user.role === 'ADMIN') {
            window.location.href = '/admin.html';
        } else if (data.user.status === 'PENDING') {
            window.location.href = '/pending.html';
        } else {
            window.location.reload();
        }
    })
    .catch(() => {
        errorEl.textContent = 'Erreur de connexion au serveur';
        errorEl.classList.remove('hidden');
    });
});

// ============================================
// INSCRIPTION
// ============================================
document.getElementById('registerFormSubmit').addEventListener('submit', function(e) {
    e.preventDefault();
    const firstName = document.getElementById('regFirstName').value;
    const lastName = document.getElementById('regLastName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const errorEl = document.getElementById('registerError');
    errorEl.classList.add('hidden');

    if (password.length < 8) {
        errorEl.textContent = 'Le mot de passe doit contenir au moins 8 caractères';
        errorEl.classList.remove('hidden');
        return;
    }

    fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ first_name: firstName, last_name: lastName, email, password, country: 'FR' })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            window.location.href = '/pending.html';
        } else {
            errorEl.textContent = data.error || 'Erreur';
            errorEl.classList.remove('hidden');
        }
    })
    .catch(() => {
        errorEl.textContent = 'Erreur de connexion au serveur';
        errorEl.classList.remove('hidden');
    });
});

// ============================================
// LOGOUT
// ============================================
function handleLogout() {
    if (confirm('Voulez-vous vous déconnecter ?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        document.getElementById('profileModal').classList.add('hidden');
        window.location.reload();
    }
}
document.getElementById('profileLogoutBtn').addEventListener('click', handleLogout);

// ============================================
// API CALL
// ============================================
function apiCall(url, options = {}) {
    const token = localStorage.getItem('token');
    return fetch(url, {
        ...options,
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json',
            ...(options.headers || {})
        }
    }).then(res => res.json());
}

// ============================================
// PROFIL UTILISATEUR
// ============================================
function loadUserProfile() {
    const u = user;
    document.getElementById('profileFullName').textContent = (u.first_name || '') + ' ' + (u.last_name || '');
    document.getElementById('profileEmail').textContent = u.email || '-';
    document.getElementById('profileAvatar').textContent = (u.first_name ? u.first_name.charAt(0) : 'U');
    document.getElementById('pEmail').textContent = u.email || '-';
    document.getElementById('pFirstName').textContent = u.first_name || '-';
    document.getElementById('pLastName').textContent = u.last_name || '-';
    document.getElementById('pPhone').textContent = u.phone || '-';
    document.getElementById('pCountry').textContent = u.country || '-';
    document.getElementById('pCity').textContent = u.city || '-';
    document.getElementById('pPostalCode').textContent = u.postal_code || '-';
    document.getElementById('pStreet').textContent = u.street_name || '-';
    document.getElementById('pStreetNumber').textContent = u.street_number || '-';
    document.getElementById('pProfession').textContent = u.profession || '-';
    document.getElementById('pGender').textContent = u.gender === 'M' ? 'Masculin' : u.gender === 'F' ? 'Féminin' : u.gender || '-';
    document.getElementById('pMaritalStatus').textContent = u.marital_status || '-';
    document.getElementById('pStatus').textContent = u.status || '-';
}

document.getElementById('openProfileBtn').addEventListener('click', function() {
    document.getElementById('profileModal').classList.remove('hidden');
    loadUserProfile();
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    document.querySelector('.nav-item[data-tab="info"]').classList.add('active');
    document.getElementById('profileInfo').classList.remove('hidden');
    document.getElementById('profileSupport').classList.add('hidden');
});

document.getElementById('closeProfileModal').addEventListener('click', function() {
    document.getElementById('profileModal').classList.add('hidden');
});

document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function() {
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
        this.classList.add('active');
        const tab = this.dataset.tab;
        if (tab === 'info') {
            document.getElementById('profileInfo').classList.remove('hidden');
            document.getElementById('profileSupport').classList.add('hidden');
        } else if (tab === 'support') {
            document.getElementById('profileInfo').classList.add('hidden');
            document.getElementById('profileSupport').classList.remove('hidden');
        } else if (tab === 'logout') {
            handleLogout();
        }
    });
});

// ============================================
// TABS DASHBOARD
// ============================================
document.querySelectorAll('.tab-btn').forEach(tab => {
    tab.addEventListener('click', function() {
        document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
        this.classList.add('active');
        const target = this.dataset.tab;
        document.getElementById('beneficiariesContent').classList.toggle('hidden', target !== 'beneficiaries');
        document.getElementById('transfersContent').classList.toggle('hidden', target !== 'transfers');
        if (target === 'beneficiaries') loadBeneficiaries();
        if (target === 'transfers') loadTransfers();
    });
});

// ============================================
// BÉNÉFICIAIRES
// ============================================
function loadBeneficiaries() {
    const list = document.getElementById('beneficiariesList');
    apiCall('/api/beneficiaries')
        .then(data => {
            if (!data.beneficiaries || data.beneficiaries.length === 0) {
                list.innerHTML = '<div class="empty-state"><i class="fas fa-user-plus"></i><p>Aucun bénéficiaire</p></div>';
                return;
            }
            list.innerHTML = data.beneficiaries.map(b => {
                const statusClass = b.status === 'ACTIVE' ? 'status-active' : b.status === 'REJECTED' ? 'status-rejected' : 'status-pending';
                const statusLabel = b.status === 'ACTIVE' ? 'Validé' : b.status === 'REJECTED' ? 'Rejeté' : 'En attente (24h)';
                return `
                    <div class="beneficiary-card flex justify-between items-center">
                        <div>
                            <p class="font-semibold text-dark">${b.name}</p>
                            <p class="text-xs text-gray-400 font-mono">${b.iban}</p>
                            <span class="${statusClass}">${statusLabel}</span>
                            ${b.rejection_reason ? `<p class="text-xs text-red-500">Motif: ${b.rejection_reason}</p>` : ''}
                        </div>
                        <div>
                            ${b.status === 'ACTIVE' ? `
                                <button onclick="openTransfer('${b.id}', '${b.name}')" class="btn-primary px-3 py-1 text-xs">
                                    <i class="fas fa-paper-plane mr-1"></i>Virement
                                </button>
                            ` : ''}
                        </div>
                    </div>
                `;
            }).join('');
        })
        .catch(() => {
            list.innerHTML = '<p class="text-red-500 text-sm">Erreur de chargement</p>';
        });
}

// ============================================
// AJOUT BÉNÉFICIAIRE
// ============================================
document.getElementById('btnAddBeneficiary').addEventListener('click', function() {
    document.getElementById('addBeneficiaryModal').classList.remove('hidden');
});
document.getElementById('btnAddBeneficiary2').addEventListener('click', function() {
    document.getElementById('addBeneficiaryModal').classList.remove('hidden');
});
document.getElementById('closeAddBeneficiary').addEventListener('click', function() {
    document.getElementById('addBeneficiaryModal').classList.add('hidden');
});

document.getElementById('addBeneficiaryForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const btn = document.getElementById('addBeneficiaryBtn');
    const msg = document.getElementById('beneficiaryMessage');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Envoi...';

    apiCall('/api/beneficiaries', {
        method: 'POST',
        body: JSON.stringify({
            name: document.getElementById('beneficiaryName').value,
            iban: document.getElementById('beneficiaryIban').value,
            bic: document.getElementById('beneficiaryBic').value
        })
    })
    .then(data => {
        if (data.success) {
            msg.innerHTML = '<span class="text-green-500">✅ Bénéficiaire ajouté, en attente de validation (24h).</span>';
            document.getElementById('addBeneficiaryForm').reset();
            loadBeneficiaries();
            setTimeout(() => document.getElementById('addBeneficiaryModal').classList.add('hidden'), 2000);
        } else {
            msg.innerHTML = '<span class="text-red-500">' + (data.error || 'Erreur') + '</span>';
        }
    })
    .catch(() => {
        msg.innerHTML = '<span class="text-red-500">Erreur de connexion</span>';
    })
    .finally(() => {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-save mr-2"></i>Enregistrer';
    });
});

// ============================================
// VIREMENT
// ============================================
function openTransfer(id, name) {
    document.getElementById('transferModal').classList.remove('hidden');
    const select = document.getElementById('transferBeneficiary');
    select.innerHTML = `<option value="${id}">${name}</option>`;
    document.getElementById('transferMessage').innerHTML = '';
    document.getElementById('transferAmount').value = '';
    document.getElementById('transferRef').value = '';
}

document.getElementById('openTransferModal').addEventListener('click', function() {
    document.getElementById('transferModal').classList.remove('hidden');
    apiCall('/api/beneficiaries')
        .then(data => {
            const select = document.getElementById('transferBeneficiary');
            const active = (data.beneficiaries || []).filter(b => b.status === 'ACTIVE');
            select.innerHTML = '<option value="">-- Sélectionnez --</option>' +
                active.map(b => `<option value="${b.id}">${b.name}</option>`).join('');
        });
});

document.getElementById('closeTransferModal').addEventListener('click', function() {
    document.getElementById('transferModal').classList.add('hidden');
});

document.getElementById('transferForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const btn = document.getElementById('transferBtn');
    const msg = document.getElementById('transferMessage');
    const beneficiaryId = document.getElementById('transferBeneficiary').value;
    const amount = document.getElementById('transferAmount').value;
    const reference = document.getElementById('transferRef').value;

    if (!beneficiaryId) {
        msg.innerHTML = '<span class="text-red-500">Sélectionnez un bénéficiaire</span>';
        return;
    }

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Envoi...';

    apiCall('/api/transfers', {
        method: 'POST',
        body: JSON.stringify({ beneficiary_id: beneficiaryId, amount, reference })
    })
    .then(data => {
        if (data.success) {
            msg.innerHTML = '<span class="text-green-500">✅ Virement soumis, en attente de validation.</span>';
            document.getElementById('transferForm').reset();
            loadTransfers();
            setTimeout(() => document.getElementById('transferModal').classList.add('hidden'), 2000);
        } else {
            msg.innerHTML = '<span class="text-red-500">' + (data.error || 'Erreur') + '</span>';
        }
    })
    .catch(() => {
        msg.innerHTML = '<span class="text-red-500">Erreur de connexion</span>';
    })
    .finally(() => {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-paper-plane mr-2"></i>Envoyer';
    });
});

// ============================================
// HISTORIQUE VIREMENTS
// ============================================
function loadTransfers() {
    const list = document.getElementById('transfersList');
    apiCall('/api/transfers')
        .then(data => {
            if (!data.transfers || data.transfers.length === 0) {
                list.innerHTML = '<div class="empty-state"><i class="fas fa-exchange-alt"></i><p>Aucun virement</p></div>';
                return;
            }
            list.innerHTML = data.transfers.map(t => {
                const statusClass = t.status === 'COMPLETED' ? 'status-active' : t.status === 'REJECTED' ? 'status-rejected' : 'status-pending';
                const statusLabel = t.status === 'COMPLETED' ? 'Validé' : t.status === 'REJECTED' ? 'Rejeté' : 'En attente';
                return `
                    <div class="flex justify-between items-center p-4 border border-gray-100 rounded-xl mb-2">
                        <div>
                            <p class="font-semibold text-dark">${t.amount} €</p>
                            <p class="text-xs text-gray-500">Bénéficiaire: ${t.beneficiary_name}</p>
                            <p class="text-xs text-gray-400">${new Date(t.created_at).toLocaleDateString('fr-FR')}</p>
                        </div>
                        <div class="text-right">
                            <span class="${statusClass}">${statusLabel}</span>
                            ${t.admin_comment ? `<p class="text-xs text-red-500">Motif: ${t.admin_comment}</p>` : ''}
                        </div>
                    </div>
                `;
            }).join('');
        })
        .catch(() => {
            list.innerHTML = '<p class="text-red-500 text-sm">Erreur de chargement</p>';
        });
}

// ============================================
// DÉPÔT
// ============================================
function loadDepositAddresses() {
    apiCall('/api/admin/deposit-addresses')
        .then(data => {
            if (!data.addresses) return;
            const btc = data.addresses.find(a => a.currency === 'BTC');
            const eth = data.addresses.find(a => a.currency === 'ETH');
            document.getElementById('btcAddress').textContent = btc ? btc.address : 'Non configurée';
            document.getElementById('ethAddress').textContent = eth ? eth.address : 'Non configurée';
        })
        .catch(() => {
            document.getElementById('btcAddress').textContent = 'Erreur';
            document.getElementById('ethAddress').textContent = 'Erreur';
        });
}

document.getElementById('btnDeposit').addEventListener('click', function() {
    document.getElementById('depositModal').classList.remove('hidden');
    loadDepositAddresses();
});

document.getElementById('closeDepositModal').addEventListener('click', function() {
    document.getElementById('depositModal').classList.add('hidden');
});

function copyAddress(type) {
    const el = type === 'btc' ? document.getElementById('btcAddress') : document.getElementById('ethAddress');
    if (el.textContent && el.textContent !== 'Non configurée' && el.textContent !== 'Erreur') {
        navigator.clipboard.writeText(el.textContent);
        alert('✅ Adresse copiée !');
    }
}

// ============================================
// ESC
// ============================================
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay').forEach(el => el.classList.add('hidden'));
    }
});

// ============================================
// INIT
// ============================================
if (token && user.email) {
    loadDepositAddresses();
}