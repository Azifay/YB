document.addEventListener("DOMContentLoaded", () => {
    // ==========================================
    // STATE
    // ==========================================
    let allUsers = [];
    let currentUser = null;
    let currentToken = localStorage.getItem("accessToken") || null;
    let activeModalUser = null;

    // ==========================================
    // DOM ELEMENTS
    // ==========================================
    const navTabs = document.querySelectorAll(".nav-tab");
    const tabContents = document.querySelectorAll(".tab-content");

    const mongoStatusPill = document.getElementById("mongo-status-pill");
    const mongoStatusText = document.getElementById("mongo-status-text");
    const userHeaderPill = document.getElementById("user-header-pill");
    const headerAvatar = document.getElementById("header-avatar");
    const headerUsername = document.getElementById("header-username");
    const headerLogoutBtn = document.getElementById("header-logout-btn");

    // Auth Switcher & Cards
    const tabBtnLogin = document.getElementById("tab-btn-login");
    const tabBtnRegister = document.getElementById("tab-btn-register");
    const authCardTitle = document.getElementById("auth-card-title");
    const authCardSubtitle = document.getElementById("auth-card-subtitle");
    const authIconCircle = document.getElementById("auth-icon-circle");
    const loginAlert = document.getElementById("login-alert");

    // Login Form Elements
    const loginForm = document.getElementById("login-form");
    const loginUsername = document.getElementById("login-username");
    const loginPassword = document.getElementById("login-password");
    const togglePasswordBtn = document.getElementById("toggle-password");
    const quickLoginSection = document.getElementById("quick-login-section");
    const quickChipsContainer = document.getElementById("quick-chips-container");

    // Register Form Elements
    const registerForm = document.getElementById("register-form");
    const regUsername = document.getElementById("reg-username");
    const regPassword = document.getElementById("reg-password");
    const regFirstname = document.getElementById("reg-firstname");
    const regLastname = document.getElementById("reg-lastname");
    const regPhone = document.getElementById("reg-phone");
    const regEmail = document.getElementById("reg-email");
    const regAge = document.getElementById("reg-age");
    const regGender = document.getElementById("reg-gender");
    const regRegion = document.getElementById("reg-region");
    const regPassport = document.getElementById("reg-passport");

    // Profile Card Elements
    const profileEmptyState = document.getElementById("profile-empty-state");
    const profileLoggedIn = document.getElementById("profile-logged-in");
    const profileLogoutBtn = document.getElementById("profile-logout-btn");
    const profAvatar = document.getElementById("prof-avatar");
    const profFullname = document.getElementById("prof-fullname");
    const profUsername = document.getElementById("prof-username");
    const profPassportNum = document.getElementById("prof-passport-num");
    const profMiddlename = document.getElementById("prof-middlename");
    const profBirthdate = document.getElementById("prof-birthdate");
    const profAge = document.getElementById("prof-age");
    const profGender = document.getElementById("prof-gender");
    const profIssuedby = document.getElementById("prof-issuedby");
    const profIssueddate = document.getElementById("prof-issueddate");
    const profPhone = document.getElementById("prof-phone");
    const profEmail = document.getElementById("prof-email");
    const profAddress = document.getElementById("prof-address");
    const profToken = document.getElementById("prof-token");
    const copyTokenBtn = document.getElementById("copy-token-btn");

    // Users Tab Elements
    const usersGridContainer = document.getElementById("users-grid-container");
    const usersSearchInput = document.getElementById("users-search-input");
    const usersFilterGender = document.getElementById("users-filter-gender");
    const badgeUsersCount = document.getElementById("badge-users-count");
    const btnOpenCreateUser = document.getElementById("btn-open-create-user");

    // Logs Tab Elements
    const logsTableBody = document.getElementById("logs-table-body");
    const badgeLogsCount = document.getElementById("badge-logs-count");
    const refreshLogsBtn = document.getElementById("refresh-logs-btn");

    // Details Modal Elements
    const userModal = document.getElementById("user-modal");
    const modalCloseBtn = document.getElementById("modal-close-btn");
    const mAvatar = document.getElementById("m-avatar");
    const mFullname = document.getElementById("m-fullname");
    const mUsername = document.getElementById("m-username");
    const mPassportFull = document.getElementById("m-passport-full");
    const mPassportDate = document.getElementById("m-passport-date");
    const mPassportBy = document.getElementById("m-passport-by");
    const mMiddle = document.getElementById("m-middle");
    const mBirth = document.getElementById("m-birth");
    const mAgeGender = document.getElementById("m-age-gender");
    const mPhone = document.getElementById("m-phone");
    const mEmail = document.getElementById("m-email");
    const mRegionDistrict = document.getElementById("m-region-district");
    const mAddress = document.getElementById("m-address");
    const mRegistered = document.getElementById("m-registered");
    const mId = document.getElementById("m-id");
    const modalQuickLoginBtn = document.getElementById("modal-quick-login-btn");
    const modalEditUserBtn = document.getElementById("modal-edit-user-btn");
    const modalDeleteUserBtn = document.getElementById("modal-delete-user-btn");

    // Edit / Create Modal Elements
    const editUserModal = document.getElementById("edit-user-modal");
    const editModalCloseBtn = document.getElementById("edit-modal-close-btn");
    const editModalCancelBtn = document.getElementById("edit-modal-cancel-btn");
    const editUserForm = document.getElementById("edit-user-form");
    const editModalTitle = document.getElementById("edit-modal-title");
    const editModalSubtitle = document.getElementById("edit-modal-subtitle");
    const editUserId = document.getElementById("edit-user-id");
    const editUsername = document.getElementById("edit-username");
    const editPassword = document.getElementById("edit-password");
    const editFirstname = document.getElementById("edit-firstname");
    const editLastname = document.getElementById("edit-lastname");
    const editMiddlename = document.getElementById("edit-middlename");
    const editPhone = document.getElementById("edit-phone");
    const editEmail = document.getElementById("edit-email");
    const editAge = document.getElementById("edit-age");
    const editGender = document.getElementById("edit-gender");
    const editRegion = document.getElementById("edit-region");
    const editDistrict = document.getElementById("edit-district");
    const editAddress = document.getElementById("edit-address");
    const editPassportSeries = document.getElementById("edit-passport-series");
    const editPassportNumber = document.getElementById("edit-passport-number");
    const editPassportBy = document.getElementById("edit-passport-by");
    const editPassportDate = document.getElementById("edit-passport-date");

    // ==========================================
    // TAB SWITCHING
    // ==========================================
    navTabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            const target = tab.getAttribute("data-tab");
            switchTab(target);
        });
    });

    function switchTab(tabId) {
        navTabs.forEach((t) => {
            if (t.getAttribute("data-tab") === tabId) {
                t.classList.add("active");
            } else {
                t.classList.remove("active");
            }
        });

        tabContents.forEach((c) => {
            if (c.id === tabId) {
                c.classList.add("active");
            } else {
                c.classList.remove("active");
            }
        });

        if (tabId === "users-tab") fetchUsers();
        if (tabId === "logs-tab") fetchLogs();
    }

    // ==========================================
    // AUTH MODE SWITCHER (LOGIN / REGISTER)
    // ==========================================
    function setAuthMode(mode) {
        if (mode === "login") {
            tabBtnLogin.classList.add("active");
            tabBtnRegister.classList.remove("active");
            loginForm.classList.remove("hidden");
            registerForm.classList.add("hidden");
            if (quickLoginSection) quickLoginSection.classList.remove("hidden");
            authCardTitle.textContent = "Tizimga Kirish";
            authCardSubtitle.textContent = "MongoDB Atlas bazasidagi hisobingiz orqali kiring. Har bir kirish MongoDB Compass'ga qayd etiladi.";
            authIconCircle.innerHTML = '<i class="fa-solid fa-user-lock"></i>';
        } else {
            tabBtnRegister.classList.add("active");
            tabBtnLogin.classList.remove("active");
            loginForm.classList.add("hidden");
            registerForm.classList.remove("hidden");
            if (quickLoginSection) quickLoginSection.classList.add("hidden");
            authCardTitle.textContent = "Yangi Ro‘yxatdan O‘tish";
            authCardSubtitle.textContent = "Kiritilgan ma'lumotlar to‘g‘ridan-to‘g‘ri MongoDB Atlas (`users`) bazasiga saqlanadi va Compass'da ko‘rinadi!";
            authIconCircle.innerHTML = '<i class="fa-solid fa-user-plus"></i>';
        }
        loginAlert.classList.add("hidden");
    }

    if (tabBtnLogin) tabBtnLogin.addEventListener("click", () => setAuthMode("login"));
    if (tabBtnRegister) tabBtnRegister.addEventListener("click", () => setAuthMode("register"));

    // ==========================================
    // STATUS CHECK
    // ==========================================
    async function checkStatus() {
        try {
            const res = await fetch("/api/status");
            const data = await res.json();

            if (data.mongoConnected) {
                mongoStatusPill.className = "status-pill status-online";
                mongoStatusText.textContent = "MongoDB Ulandi (Atlas)";
            } else if (!data.mongoUriConfigured) {
                mongoStatusPill.className = "status-pill status-warning";
                mongoStatusText.textContent = "In-Memory (Atlas .env kutilmoqda)";
            } else {
                mongoStatusPill.className = "status-pill status-warning";
                mongoStatusText.textContent = "In-Memory Rejim";
            }

            if (data.usersCount !== undefined) badgeUsersCount.textContent = data.usersCount;
            if (data.loginsCount !== undefined) badgeLogsCount.textContent = data.loginsCount;

        } catch (err) {
            mongoStatusPill.className = "status-pill status-warning";
            mongoStatusText.textContent = "Server Offline";
        }
    }

    // ==========================================
    // PASSWORD VISIBILITY TOGGLE
    // ==========================================
    if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener("click", () => {
            const isPwd = loginPassword.type === "password";
            loginPassword.type = isPwd ? "text" : "password";
            togglePasswordBtn.innerHTML = isPwd
                ? '<i class="fa-regular fa-eye-slash"></i>'
                : '<i class="fa-regular fa-eye"></i>';
        });
    }

    // ==========================================
    // QUICK LOGIN CHIPS POPULATION
    // ==========================================
    function renderQuickChips(users) {
        if (!quickChipsContainer) return;
        quickChipsContainer.innerHTML = "";
        users.slice(0, 10).forEach((u) => {
            const chip = document.createElement("button");
            chip.className = "quick-chip";
            chip.type = "button";
            chip.innerHTML = `<strong>${u.username}</strong> <small>(${u.firstName || u.fullName})</small>`;
            chip.addEventListener("click", () => {
                setAuthMode("login");
                loginUsername.value = u.username;
                loginPassword.value = u.password || "test1234";
                loginForm.dispatchEvent(new Event("submit"));
            });
            quickChipsContainer.appendChild(chip);
        });
    }

    // ==========================================
    // LOGIN FORM HANDLER
    // ==========================================
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const username = loginUsername.value.trim();
        const password = loginPassword.value.trim();

        showAlert("Kutilmoqda...", "info");

        try {
            const res = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();

            if (!res.ok) {
                showAlert(data.message || "Login xatosi", "error");
                fetchLogs(); // Muvaffaqiyatsiz urinish qaydini ko'rsatish
                return;
            }

            showAlert("Login muvaffaqiyatli! MongoDB Compass'ga qayd etildi ✅", "success");

            // Saqlash
            currentToken = data.accessToken;
            currentUser = data.user;
            localStorage.setItem("accessToken", currentToken);
            localStorage.setItem("currentUser", JSON.stringify(currentUser));

            renderUserProfile(currentUser, currentToken);
            fetchLogs();
            checkStatus();

        } catch (err) {
            showAlert("Serverga ulanishda xatolik yuz berdi: " + err.message, "error");
        }
    });

    // ==========================================
    // REGISTER FORM HANDLER (Yangi user MongoDB'ga)
    // ==========================================
    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const username = regUsername.value.trim();
            const password = regPassword.value.trim();
            const firstName = regFirstname.value.trim();
            const lastName = regLastname.value.trim();
            const phone = regPhone.value.trim();
            const email = regEmail.value.trim();
            const age = regAge.value.trim();
            const gender = regGender.value;
            const region = regRegion.value.trim();
            const passportRaw = regPassport.value.trim();

            let passportSeries = "AA";
            let passportNumber = "0000000";
            if (passportRaw) {
                const parts = passportRaw.split(/\s+/);
                if (parts.length >= 2) {
                    passportSeries = parts[0];
                    passportNumber = parts[1];
                } else if (passportRaw.length >= 7) {
                    passportSeries = passportRaw.substring(0, 2).toUpperCase();
                    passportNumber = passportRaw.substring(2);
                }
            }

            showAlert("Foydalanuvchi MongoDB Atlas bazasiga saqlanmoqda...", "info");

            try {
                const res = await fetch("/api/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        username,
                        password,
                        firstName,
                        lastName,
                        fullName: `${firstName} ${lastName}`.trim(),
                        phone,
                        email,
                        age: age ? Number(age) : 22,
                        gender,
                        region: region || "Toshkent shahri",
                        passportSeries,
                        passportNumber
                    })
                });

                const data = await res.json();

                if (!res.ok) {
                    showAlert(data.message || "Ro‘yxatdan o‘tishda xatolik", "error");
                    return;
                }

                showAlert("Tabriklaymiz! Foydalanuvchi MongoDB Atlas'ga saqlandi va avtomatik tizimga kirdi! Atlas Compass'da ko‘rishingiz mumkin ✅", "success");

                // Avtomatik kirish
                currentToken = data.accessToken;
                currentUser = data.user;
                localStorage.setItem("accessToken", currentToken);
                localStorage.setItem("currentUser", JSON.stringify(currentUser));

                renderUserProfile(currentUser, currentToken);
                registerForm.reset();
                fetchUsers();
                fetchLogs();
                checkStatus();

            } catch (err) {
                showAlert("Serverga ulanishda xatolik: " + err.message, "error");
            }
        });
    }

    function showAlert(msg, type) {
        loginAlert.className = `alert alert-${type === "success" ? "success" : type === "info" ? "warning" : "error"}`;
        loginAlert.innerHTML = `<i class="fa-solid ${type === "success" ? "fa-circle-check" : type === "info" ? "fa-spinner fa-spin" : "fa-triangle-exclamation"}"></i> <span>${msg}</span>`;
        loginAlert.classList.remove("hidden");
    }

    // ==========================================
    // PROFILE RENDER
    // ==========================================
    function renderUserProfile(user, token) {
        if (!user) {
            profileEmptyState.classList.remove("hidden");
            profileLoggedIn.classList.add("hidden");
            userHeaderPill.classList.add("hidden");
            return;
        }

        profileEmptyState.classList.add("hidden");
        profileLoggedIn.classList.remove("hidden");
        userHeaderPill.classList.remove("hidden");

        const initial = (user.firstName || user.fullName || "U").charAt(0).toUpperCase();
        headerAvatar.textContent = initial;
        headerUsername.textContent = user.username;

        profAvatar.textContent = initial;
        profFullname.textContent = user.fullName || `${user.firstName || ""} ${user.lastName || ""}`.trim();
        profUsername.textContent = `@${user.username}`;

        const p = user.passport || {};
        profPassportNum.textContent = `${p.series || "AA"} ${p.number || "0000000"}`;
        profMiddlename.textContent = user.middleName || "-";
        profBirthdate.textContent = user.birthDate || "-";
        profAge.textContent = user.age ? `${user.age} yosh` : "-";
        profGender.textContent = user.gender || "-";
        profIssuedby.textContent = p.issuedBy || "-";
        profIssueddate.textContent = p.issuedDate || "-";

        profPhone.textContent = user.phone || "-";
        profEmail.textContent = user.email || "-";
        profAddress.textContent = `${user.country || "O‘zbekiston"}, ${user.region || ""}, ${user.district || ""}, ${user.address || ""}`;

        profToken.textContent = token || "Noma'lum token";
    }

    // Copy Token
    if (copyTokenBtn) {
        copyTokenBtn.addEventListener("click", () => {
            if (currentToken) {
                navigator.clipboard.writeText(currentToken);
                copyTokenBtn.innerHTML = '<i class="fa-solid fa-check"></i> Nusxalandi!';
                setTimeout(() => {
                    copyTokenBtn.innerHTML = '<i class="fa-regular fa-copy"></i> Nusxalash';
                }, 2000);
            }
        });
    }

    // Logout
    function handleLogout() {
        currentToken = null;
        currentUser = null;
        localStorage.removeItem("accessToken");
        localStorage.removeItem("currentUser");
        loginAlert.classList.add("hidden");
        loginUsername.value = "";
        loginPassword.value = "";
        renderUserProfile(null, null);
    }

    headerLogoutBtn.addEventListener("click", handleLogout);
    profileLogoutBtn.addEventListener("click", handleLogout);

    // ==========================================
    // FETCH USERS (MongoDB Compass Bazasidan)
    // ==========================================
    async function fetchUsers() {
        try {
            const res = await fetch("/api/users");
            const data = await res.json();
            allUsers = data;
            badgeUsersCount.textContent = data.length;
            renderQuickChips(data);
            applyUsersFilter();
        } catch (err) {
            console.error("Userlarni yuklashda xato:", err);
        }
    }

    function applyUsersFilter() {
        const query = usersSearchInput.value.toLowerCase().trim();
        const gender = usersFilterGender.value;

        const filtered = allUsers.filter((u) => {
            const matchesQuery =
                (u.fullName && u.fullName.toLowerCase().includes(query)) ||
                (u.username && u.username.toLowerCase().includes(query)) ||
                (u.region && u.region.toLowerCase().includes(query)) ||
                (u.district && u.district.toLowerCase().includes(query)) ||
                (u.phone && u.phone.includes(query));

            const matchesGender = gender === "ALL" || u.gender === gender;

            return matchesQuery && matchesGender;
        });

        renderUsersGrid(filtered);
    }

    usersSearchInput.addEventListener("input", applyUsersFilter);
    usersFilterGender.addEventListener("change", applyUsersFilter);

    function renderUsersGrid(users) {
        usersGridContainer.innerHTML = "";

        if (users.length === 0) {
            usersGridContainer.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">
                    <i class="fa-solid fa-user-slash" style="font-size: 32px; margin-bottom: 12px; display:block;"></i>
                    Mos keladigan foydalanuvchi topilmadi
                </div>
            `;
            return;
        }

        users.forEach((u) => {
            const card = document.createElement("div");
            card.className = "user-card";
            const initial = (u.firstName || u.fullName || "U").charAt(0).toUpperCase();

            card.innerHTML = `
                <div class="user-card-header">
                    <div class="user-card-avatar">${initial}</div>
                    <div class="user-card-title">
                        <h3>${u.fullName || `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.username}</h3>
                        <span class="user-card-uname">@${u.username} • ${u.age || 20} yosh</span>
                    </div>
                </div>

                <div class="user-card-meta">
                    <div class="meta-row">
                        <i class="fa-solid fa-location-dot"></i>
                        <span>${u.region || "O‘zbekiston"} ${u.district ? "(" + u.district + ")" : ""}</span>
                    </div>
                    <div class="meta-row">
                        <i class="fa-solid fa-phone"></i>
                        <span>${u.phone || "-"}</span>
                    </div>
                    <div class="meta-row">
                        <i class="fa-solid fa-passport"></i>
                        <span>Pasport: ${(u.passport && u.passport.series) || "AA"} ${(u.passport && u.passport.number) || "•••••••"}</span>
                    </div>
                </div>

                <div class="user-card-footer">
                    <span>ID: #${u.id}</span>
                    <div class="card-actions">
                        <button class="btn-card-detail" data-id="${u.id}" title="Batafsil ma'lumot">
                            <i class="fa-solid fa-eye"></i> Batafsil
                        </button>
                        <button class="btn-card-edit" data-id="${u.id}" title="O‘zgartirish">
                            <i class="fa-solid fa-pen-to-square"></i> O‘zgartirish
                        </button>
                        <button class="btn-card-delete" data-id="${u.id}" title="O‘chirish">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                </div>
            `;

            // Batafsil
            card.querySelector(".btn-card-detail").addEventListener("click", (e) => {
                e.stopPropagation();
                openUserModal(u);
            });

            // Tahrirlash
            card.querySelector(".btn-card-edit").addEventListener("click", (e) => {
                e.stopPropagation();
                openEditUserModal(u);
            });

            // O'chirish
            card.querySelector(".btn-card-delete").addEventListener("click", (e) => {
                e.stopPropagation();
                deleteUser(u);
            });

            // Kartani bosganda batafsil ochiladi
            card.addEventListener("click", () => {
                openUserModal(u);
            });

            usersGridContainer.appendChild(card);
        });
    }

    // ==========================================
    // USER DETAILS MODAL
    // ==========================================
    function openUserModal(u) {
        activeModalUser = u;
        const initial = (u.firstName || u.fullName || "U").charAt(0).toUpperCase();
        mAvatar.textContent = initial;
        mFullname.textContent = u.fullName || `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.username;
        mUsername.textContent = `@${u.username}`;

        const p = u.passport || {};
        mPassportFull.textContent = `${p.series || "AA"} ${p.number || "0000000"}`;
        mPassportDate.textContent = p.issuedDate || "-";
        mPassportBy.textContent = p.issuedBy || "-";

        mMiddle.textContent = u.middleName || "-";
        mBirth.textContent = u.birthDate || "-";
        mAgeGender.textContent = `${u.age ? u.age + " yosh" : "-"} / ${u.gender || "-"}`;

        mPhone.textContent = u.phone || "-";
        mEmail.textContent = u.email || "-";
        mRegionDistrict.textContent = `${u.region || ""}, ${u.district || ""}`;
        mAddress.textContent = u.address || "-";

        mRegistered.textContent = u.registeredAt || "-";
        mId.textContent = `#${u.id}`;

        userModal.classList.remove("hidden");
    }

    modalCloseBtn.addEventListener("click", () => userModal.classList.add("hidden"));
    userModal.addEventListener("click", (e) => {
        if (e.target === userModal) userModal.classList.add("hidden");
    });

    modalQuickLoginBtn.addEventListener("click", () => {
        if (activeModalUser) {
            userModal.classList.add("hidden");
            switchTab("login-tab");
            setAuthMode("login");
            loginUsername.value = activeModalUser.username;
            loginPassword.value = activeModalUser.password || "test1234";
            loginForm.dispatchEvent(new Event("submit"));
        }
    });

    if (modalEditUserBtn) {
        modalEditUserBtn.addEventListener("click", () => {
            if (activeModalUser) {
                userModal.classList.add("hidden");
                openEditUserModal(activeModalUser);
            }
        });
    }

    if (modalDeleteUserBtn) {
        modalDeleteUserBtn.addEventListener("click", () => {
            if (activeModalUser) {
                deleteUser(activeModalUser);
            }
        });
    }

    // ==========================================
    // EDIT / CREATE USER MODAL
    // ==========================================
    if (btnOpenCreateUser) {
        btnOpenCreateUser.addEventListener("click", () => {
            openCreateUserModal();
        });
    }

    function openCreateUserModal() {
        editModalTitle.textContent = "Yangi Foydalanuvchi Qo‘shish";
        editModalSubtitle.textContent = "Yangi user to‘g‘ridan-to‘g‘ri MongoDB Atlas (`users`) bazasiga yoziladi";
        editUserForm.reset();
        editUserId.value = "";
        editUsername.disabled = false;
        editPassword.required = true;
        editUserModal.classList.remove("hidden");
    }

    function openEditUserModal(u) {
        editModalTitle.textContent = `Foydalanuvchini O‘zgartirish (@${u.username})`;
        editModalSubtitle.textContent = "O‘zgartirilgan ma'lumotlar MongoDB Atlas bazasida darhol yangilanadi";
        editUserForm.reset();
        editUserId.value = u.id;
        editUsername.value = u.username || "";
        editUsername.disabled = false;
        editPassword.value = "";
        editPassword.required = false;

        editFirstname.value = u.firstName || (u.fullName ? u.fullName.split(" ")[0] : "");
        editLastname.value = u.lastName || (u.fullName ? u.fullName.split(" ").slice(1).join(" ") : "");
        editMiddlename.value = u.middleName || "";
        editPhone.value = u.phone || "";
        editEmail.value = u.email || "";
        editAge.value = u.age || "";
        editGender.value = u.gender || "Erkak";
        editRegion.value = u.region || "";
        editDistrict.value = u.district || "";
        editAddress.value = u.address || "";

        const p = u.passport || {};
        editPassportSeries.value = p.series || "AA";
        editPassportNumber.value = p.number || "";
        editPassportBy.value = p.issuedBy || "";
        editPassportDate.value = p.issuedDate || "";

        editUserModal.classList.remove("hidden");
    }

    if (editModalCloseBtn) editModalCloseBtn.addEventListener("click", () => editUserModal.classList.add("hidden"));
    if (editModalCancelBtn) editModalCancelBtn.addEventListener("click", () => editUserModal.classList.add("hidden"));
    if (editUserModal) {
        editUserModal.addEventListener("click", (e) => {
            if (e.target === editUserModal) editUserModal.classList.add("hidden");
        });
    }

    // Save Edit / Create User Form
    if (editUserForm) {
        editUserForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const id = editUserId.value;
            const isNew = !id;

            const payload = {
                username: editUsername.value.trim(),
                firstName: editFirstname.value.trim(),
                lastName: editLastname.value.trim(),
                fullName: `${editFirstname.value.trim()} ${editLastname.value.trim()}`.trim() || editUsername.value.trim(),
                middleName: editMiddlename.value.trim(),
                phone: editPhone.value.trim(),
                email: editEmail.value.trim(),
                age: editAge.value ? Number(editAge.value) : 22,
                gender: editGender.value,
                region: editRegion.value.trim(),
                district: editDistrict.value.trim(),
                address: editAddress.value.trim(),
                passport: {
                    series: editPassportSeries.value.trim() || "AA",
                    number: editPassportNumber.value.trim() || "0000000",
                    issuedBy: editPassportBy.value.trim(),
                    issuedDate: editPassportDate.value
                }
            };

            if (editPassword.value.trim()) {
                payload.password = editPassword.value.trim();
            }

            const url = isNew ? "/api/register" : `/api/users/${id}`;
            const method = isNew ? "POST" : "PUT";

            // JWT token (edit uchun majburiy)
            const authHeaders = { "Content-Type": "application/json" };
            if (!isNew && currentToken) {
                authHeaders["Authorization"] = "Bearer " + currentToken;
            }

            try {
                const res = await fetch(url, {
                    method: method,
                    headers: authHeaders,
                    body: JSON.stringify(payload)
                });

                const data = await res.json();

                if (!res.ok) {
                    if (res.status === 401) {
                        alert("Tizimga kirmagansiz yoki token muddati tugagan. Iltimos, qaytadan login qiling!");
                    } else {
                        alert(data.message || "Saqlashda xatolik yuz berdi!");
                    }
                    return;
                }

                alert(data.message || "Muvaffaqiyatli saqlandi va MongoDB Atlas'da aks ettirildi! ✅");
                editUserModal.classList.add("hidden");

                // Agar hozir kiringan profil tahrirlangan bo'lsa, uni ham yangilash
                if (currentUser && currentUser.id === Number(id)) {
                    currentUser = { ...currentUser, ...data.user };
                    localStorage.setItem("currentUser", JSON.stringify(currentUser));
                    renderUserProfile(currentUser, currentToken);
                }

                fetchUsers();
                fetchLogs();
                checkStatus();

            } catch (err) {
                alert("Serverga ulanish xatosi: " + err.message);
            }
        });
    }

    // ==========================================
    // DELETE USER (MongoDB Atlas'dan o'chirish)
    // ==========================================
    async function deleteUser(u) {
        const confirmMsg = `Haqiqatan ham @${u.username} (${u.fullName || u.firstName || "Foydalanuvchi"}) foydalanuvchisini MongoDB Atlas bazasidan butunlay o‘chirmoqchimisiz?\n\nBu foydalanuvchi MongoDB Compass'dan ham o‘chib ketadi!`;
        if (!confirm(confirmMsg)) {
            return;
        }

        if (!currentToken) {
            alert("O'chirish uchun avval tizimga kirishingiz kerak! (JWT token yo'q)");
            return;
        }

        try {
            const res = await fetch(`/api/users/${u.id}`, {
                method: "DELETE",
                headers: { "Authorization": "Bearer " + currentToken }
            });

            const data = await res.json();

            if (!res.ok) {
                if (res.status === 401) {
                    alert("Token yaroqsiz yoki muddati tugagan. Iltimos, qaytadan login qiling!");
                } else {
                    alert(data.message || "O‘chirishda xatolik yuz berdi!");
                }
                return;
            }

            alert(data.message || "Foydalanuvchi muvaffaqiyatli o‘chirildi! ✅");

            // Agar ochiq modal bo'lsa yopish
            userModal.classList.add("hidden");

            // Agar o'chirilgan user joriy tizimga kirgan bo'lsa, tizimdan chiqarish
            if (currentUser && currentUser.id === u.id) {
                handleLogout();
            }

            fetchUsers();
            fetchLogs();
            checkStatus();

        } catch (err) {
            alert("O‘chirishda server xatosi: " + err.message);
        }
    }

    // ==========================================
    // FETCH LOGS (MongoDB Compass Qaydlari)
    // ==========================================
    async function fetchLogs() {
        try {
            const res = await fetch("/api/logins");
            const data = await res.json();
            badgeLogsCount.textContent = data.length;
            renderLogsTable(data);
        } catch (err) {
            console.error("Loginlarni olishda xato:", err);
        }
    }

    refreshLogsBtn.addEventListener("click", fetchLogs);

    function renderLogsTable(logs) {
        logsTableBody.innerHTML = "";

        if (logs.length === 0) {
            logsTableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-4" style="color: var(--text-muted);">
                        <i class="fa-solid fa-inbox" style="font-size: 24px; margin-bottom: 8px; display:block;"></i>
                        Hozircha hech qanday login amalga oshirilmadi. Login qiling va bu yerda hamda MongoDB Compass'da ko‘ring!
                    </td>
                </tr>
            `;
            return;
        }

        logs.forEach((log, index) => {
            const tr = document.createElement("tr");
            const isSuccess = log.status === "SUCCESS";
            const timeStr = log.formattedTime || new Date(log.timestamp).toLocaleString("uz-UZ");

            tr.innerHTML = `
                <td style="color: var(--text-subtle);">${index + 1}</td>
                <td><strong>${timeStr}</strong></td>
                <td><code style="color: #38bdf8;">@${log.username}</code></td>
                <td>${log.fullName || "Noma'lum"}</td>
                <td>
                    <span class="badge-status ${isSuccess ? "badge-status-success" : "badge-status-failed"}">
                        <i class="fa-solid ${isSuccess ? "fa-circle-check" : "fa-circle-xmark"}"></i>
                        ${isSuccess ? "Muvaffaqiyatli" : "Xato parol"}
                    </span>
                </td>
                <td style="font-family: monospace; font-size: 12px;">${log.ipAddress || "127.0.0.1"}</td>
                <td style="font-size: 11px; color: var(--text-muted); max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${log.userAgent}">
                    ${log.userAgent || "Browser"}
                </td>
            `;
            logsTableBody.appendChild(tr);
        });
    }

    // ==========================================
    // INITIALIZATION
    // ==========================================
    checkStatus();
    fetchUsers();
    fetchLogs();

    // Agar avvaldan login bo'lgan bo'lsa
    if (currentToken) {
        const savedUserStr = localStorage.getItem("currentUser");
        if (savedUserStr) {
            try {
                currentUser = JSON.parse(savedUserStr);
                renderUserProfile(currentUser, currentToken);
            } catch (e) {}
        }
    }

    // Har 10 soniyada MongoDB status va yangi loginlarni yangilab turish
    setInterval(() => {
        checkStatus();
    }, 10000);
});
