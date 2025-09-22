
        // DOM Elements
        const navbar = document.querySelector('.navbar');
        const navLinks = document.querySelector('.nav-links');
        const hamburger = document.querySelector('.hamburger');
        const roomGrid = document.getElementById("roomGrid");
        const modal = document.getElementById("kamarModal");
        const closeButton = document.querySelector(".close-button");
        const cancelButton = document.getElementById("cancelModalBtn");
        const saveButton = document.getElementById("saveModalBtn");
        const modalTitle = document.getElementById("modalTitle");
        const modalKamarId = document.getElementById("modalKamarId");

        // New elements for adding/editing rooms
        const addRoomBtn = document.getElementById("addRoomBtn");
        const editNamaKamarInput = document.getElementById("editNamaKamar");

        const statusSelection = document.getElementById("statusSelection");
        const statusTersewaRadio = document.getElementById("statusTersewa");
        const statusBelumTersewaRadio = document.getElementById("statusBelumTersewa");

        const inputPenyewaSection = document.getElementById("inputPenyewaSection");
        const namaPenyewaInput = document.getElementById("namaPenyewa");
        const ktpPenyewaInput = document.getElementById("ktpPenyewa");
        const noTeleponPenyewaInput = document.getElementById("noTeleponPenyewa");
        const tglMasukInput = document.getElementById("tglMasuk");
        const hargaSewaInput = document.getElementById("hargaSewa");

        const detailPenyewaSection = document.getElementById("detailPenyewa");
        const displayNamaPenyewa = document.getElementById("displayNamaPenyewa");
        const displayKtpPenyewa = document.getElementById("displayKtpPenyewa");
        const displayNoTeleponPenyewa = document.getElementById("displayNoTeleponPenyewa");
        const displayTglMasuk = document.getElementById("displayTglMasuk");
        const displayHargaSewa = document.getElementById("displayHargaSewa");

        const pembayaranBulananSection = document.getElementById("pembayaranBulanan");
        const addPaymentForm = document.getElementById("addPaymentForm");
        const paymentMonthInput = document.getElementById("paymentMonth");
        const paymentAmountInput = document.getElementById("paymentAmount");
        const addPaymentBtnPayment = document.getElementById("addPaymentBtnPayment"); // Renamed for clarity
        const infoPembayaran = document.getElementById("infoPembayaran");
        const daftarPembayaran = document.getElementById("daftarPembayaran");

        // --- Data Storage (simulating database with localStorage) ---
        let roomsData = JSON.parse(localStorage.getItem('roomsData')) || [];
        let tenantsData = JSON.parse(localStorage.getItem('tenantsData')) || [];
        let paymentsData = JSON.parse(localStorage.getItem('paymentsData')) || [];

        // Initialize data if not present (first run) or if room count needs adjustment
        if (roomsData.length === 0 || roomsData.length !== 10 || !roomsData.every((room, i) => room.name === `Kamar ${i + 1}`)) {
            roomsData = [];
            for (let i = 1; i <= 10; i++) {
                roomsData.push({ id: i, name: `Kamar ${i}`, status: 'kosong', tenantId: null });
            }
            // Clear associated data if re-initializing rooms
            tenantsData = [];
            paymentsData = [];
            saveDataToLocalStorage();
        }

        function saveDataToLocalStorage() {
            localStorage.setItem('roomsData', JSON.stringify(roomsData));
            localStorage.setItem('tenantsData', JSON.stringify(tenantsData));
            localStorage.setItem('paymentsData', JSON.stringify(paymentsData));
            renderRoomCards(); // Re-render cards after data changes
        }

        function generateUniqueId(dataArray) {
            const maxId = dataArray.length > 0 ? Math.max(...dataArray.map(item => item.id)) : 0;
            return maxId + 1;
        }

        // --- Helper function to format currency ---
        function formatCurrency(amount) {
            if (amount === null || amount === undefined || isNaN(amount)) {
                return 'Rp 0';
            }
            return new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0
            }).format(amount);
        }

        // --- Render Room Cards ---
        function renderRoomCards() {
            roomGrid.innerHTML = ''; // Clear existing cards
            roomsData.sort((a, b) => a.id - b.id); // Ensure consistent order
            roomsData.forEach(room => {
                const roomCard = document.createElement('div');
                roomCard.classList.add('room-card');

                const statusClass = room.status === 'kosong' ? 'kosong' : 'terisi';
                const actionText = room.status === 'kosong' ? 'Isi Penyewa' : 'Lihat Detail';

                roomCard.innerHTML = `
                    <h3>${room.name}</h3>
                    <span class="status ${statusClass}">${room.status}</span>
                    <button class="action-button" data-kamar-id="${room.id}" data-kamar-status="${room.status}">${actionText}</button>
                `;
                roomGrid.appendChild(roomCard);
            });
            addModalListeners();
        }

        // --- Add Event Listeners for Modals ---
        function addModalListeners() {
            document.querySelectorAll('.action-button').forEach(button => {
                const newButton = button.cloneNode(true); // Clone to remove old listeners
                button.parentNode.replaceChild(newButton, button);
                newButton.addEventListener('click', openModalHandler);
            });
        }

        function openModalHandler(event) {
            event.preventDefault();
            const kamarId = parseInt(this.dataset.kamarId);
            const kamarStatus = this.dataset.kamarStatus;

            modalKamarId.value = kamarId;
            modal.classList.add('active'); // Add active class to show modal with transition

            resetModalDisplay();
            loadKamarDetails(kamarId, kamarStatus);
        }

        function resetModalDisplay() {
            editNamaKamarInput.value = '';
            namaPenyewaInput.value = '';
            ktpPenyewaInput.value = '';
            noTeleponPenyewaInput.value = '';
            tglMasukInput.value = '';
            hargaSewaInput.value = '';

            inputPenyewaSection.style.display = 'none';
            detailPenyewaSection.style.display = 'none';
            pembayaranBulananSection.style.display = 'none';
            saveButton.style.display = 'inline-block';
            
            daftarPembayaran.innerHTML = '';
            infoPembayaran.textContent = 'Memuat data pembayaran...';

            paymentMonthInput.value = '';
            paymentAmountInput.value = '';

            statusBelumTersewaRadio.checked = true; // Default to 'kosong'
            statusTersewaRadio.checked = false;
        }

        // --- Load Kamar Details ---
        function loadKamarDetails(kamarId, kamarStatus) {
            const room = roomsData.find(r => r.id === kamarId);
            if (!room) {
                alert('Kamar tidak ditemukan!');
                modal.classList.remove('active');
                return;
            }

            modalTitle.textContent = `Detail Kamar ${room.name}`;
            editNamaKamarInput.value = room.name; // Populate room name input
            
            if (room.status === 'terisi') {
                statusTersewaRadio.checked = true;
                statusBelumTersewaRadio.checked = false;
            } else {
                statusBelumTersewaRadio.checked = true;
                statusTersewaRadio.checked = false;
            }
            togglePenyewaSections(room.status);

            if (room.status === 'terisi' && room.tenantId) {
                const tenant = tenantsData.find(t => t.id === room.tenantId);
                if (tenant) {
                    displayNamaPenyewa.textContent = tenant.name;
                    displayKtpPenyewa.textContent = tenant.ktp;
                    displayNoTeleponPenyewa.textContent = tenant.phone;
                    displayTglMasuk.textContent = tenant.entryDate;
                    displayHargaSewa.textContent = formatCurrency(tenant.rentPrice);
                    detailPenyewaSection.style.display = 'block';

                    loadPembayaran(tenant.id, tenant.rentPrice, tenant.entryDate);
                    pembayaranBulananSection.style.display = 'block';

                    // Also populate input fields for editing current tenant
                    namaPenyewaInput.value = tenant.name;
                    ktpPenyewaInput.value = tenant.ktp;
                    noTeleponPenyewaInput.value = tenant.phone;
                    tglMasukInput.value = tenant.entryDate;
                    hargaSewaInput.value = tenant.rentPrice;

                    addPaymentBtnPayment.dataset.tenantId = tenant.id;

                } else {
                    console.error("Tenant not found for occupied room:", room.id);
                    detailPenyewaSection.innerHTML = '<p style="color:red;">Data penyewa tidak ditemukan, mohon perbaiki status kamar atau isi ulang.</p>';
                    pembayaranBulananSection.style.display = 'none';
                    inputPenyewaSection.style.display = 'block'; // Allow user to re-enter tenant data
                }
            } else if (room.status === 'kosong') {
                detailPenyewaSection.style.display = 'none';
                pembayaranBulananSection.style.display = 'none';
                inputPenyewaSection.style.display = 'block'; // Allow user to enter new tenant data
            }
        }

        // --- Toggle Penyewa Input/Display Sections ---
        function togglePenyewaSections(status) {
            if (status === 'terisi') {
                inputPenyewaSection.style.display = 'block';
                // detailPenyewaSection.style.display = 'block'; // Displayed only if tenant exists in loadKamarDetails
                pembayaranBulananSection.style.display = 'block';
            } else { // 'kosong'
                inputPenyewaSection.style.display = 'block'; // Always show input for 'kosong' to allow new tenant entry
                detailPenyewaSection.style.display = 'none';
                pembayaranBulananSection.style.display = 'none';
            }
        }

        document.querySelectorAll('input[name="kamar_status_modal"]').forEach(radio => {
            radio.addEventListener('change', function() {
                togglePenyewaSections(this.value);
            });
        });

        // --- Add Room Button Listener ---
        addRoomBtn.addEventListener('click', function() {
            modalKamarId.value = ''; // Indicate new room mode
            modal.classList.add('active');
            resetModalDisplay();
            
            modalTitle.textContent = 'Tambah Kamar Baru';
            editNamaKamarInput.value = 'Kamar Baru'; // Default name for new room
            statusBelumTersewaRadio.checked = true; // Default: kamar baru belum tersewa
            togglePenyewaSections('kosong'); // Ensure input section is visible for new tenant if needed
            detailPenyewaSection.style.display = 'none'; // Explicitly hide detail section
            pembayaranBulananSection.style.display = 'none'; // Explicitly hide payment section
        });

        // --- Save Kamar Data ---
        saveButton.addEventListener('click', function() {
            const kamarId = modalKamarId.value ? parseInt(modalKamarId.value) : null; // Get ID, or null for new room
            const selectedStatus = document.querySelector('input[name="kamar_status_modal"]:checked').value;
            
            const editedRoomName = editNamaKamarInput.value.trim();
            if (!editedRoomName) {
                alert('Nama kamar tidak boleh kosong.');
                return;
            }

            let currentRoom;
            let roomIndex = -1;

            if (kamarId) { // Mode edit existing room
                roomIndex = roomsData.findIndex(r => r.id === kamarId);
                if (roomIndex === -1) {
                    alert('Kamar tidak ditemukan!');
                    return;
                }
                currentRoom = roomsData[roomIndex];
                currentRoom.name = editedRoomName; // Update room name
            } else { // Mode add new room
                const newRoomId = generateUniqueId(roomsData);
                currentRoom = {
                    id: newRoomId,
                    name: editedRoomName,
                    status: 'kosong', // Default status for newly added room
                    tenantId: null
                };
                roomsData.push(currentRoom); // Add new room to array
                roomIndex = roomsData.length - 1; // Get index of the new room
            }
            
            let success = false;
            let message = '';

            try {
                if (selectedStatus === 'terisi') {
                    const namaPenyewa = namaPenyewaInput.value.trim();
                    const ktpPenyewa = ktpPenyewaInput.value.trim();
                    const noTeleponPenyewa = noTeleponPenyewaInput.value.trim();
                    const tglMasuk = tglMasukInput.value.trim();
                    const hargaSewa = parseFloat(hargaSewaInput.value);

                    if (!namaPenyewa || !ktpPenyewa || !noTeleponPenyewa || !tglMasuk || isNaN(hargaSewa) || hargaSewa < 0) {
                        throw new Error('Semua data penyewa harus diisi dengan benar.');
                    }

                    currentRoom.status = 'terisi';

                    let tenant = tenantsData.find(t => t.roomId === currentRoom.id); // Find tenant by room ID
                    if (tenant) {
                        tenant.name = namaPenyewa;
                        tenant.ktp = ktpPenyewa;
                        tenant.phone = noTeleponPenyewa;
                        tenant.entryDate = tglMasuk;
                        tenant.rentPrice = hargaSewa;
                    } else {
                        const newTenantId = generateUniqueId(tenantsData);
                        tenant = {
                            id: newTenantId,
                            roomId: currentRoom.id, // Link to currentRoom.id
                            name: namaPenyewa,
                            ktp: ktpPenyewa,
                            phone: noTeleponPenyewa,
                            entryDate: tglMasuk,
                            rentPrice: hargaSewa
                        };
                        tenantsData.push(tenant);
                        currentRoom.tenantId = newTenantId;
                    }

                    // Generate payments for the tenant
                    generatePaymentsForTenant(tenant.id, tenant.entryDate, tenant.rentPrice);
                    
                    success = true;
                    message = 'Data kamar dan penyewa berhasil disimpan.';

                } else if (selectedStatus === 'kosong') {
                    currentRoom.status = 'kosong';
                    const tenant = tenantsData.find(t => t.roomId === currentRoom.id); // Find tenant by room ID
                    if (tenant) {
                        paymentsData = paymentsData.filter(p => p.tenantId !== tenant.id);
                        tenantsData = tenantsData.filter(t => t.id !== tenant.id);
                        currentRoom.tenantId = null;
                    }
                    success = true;
                    message = 'Kamar berhasil dikosongkan.';
                }

                if (success) {
                    // Update roomsData array (already done for new room in `roomsData.push`)
                    roomsData[roomIndex] = currentRoom; // Ensure any changes to currentRoom are reflected

                    saveDataToLocalStorage();
                    modal.classList.remove('active');
                    // Refresh data after save
                    const currentRoomInRoomsData = roomsData.find(r => r.id === currentRoom.id);
                    if (currentRoomInRoomsData) {
                        renderRoomCards(); // Re-render to show updated status
                    }
                } else {
                    alert(message);
                }
            } catch (error) {
                alert('Error: ' + error.message);
            }
        });

       // --- Generate Payments Function ---
    function generatePaymentsForTenant(tenantId, entryDateStr, rentPrice) {
        const entryDate = new Date(entryDateStr);
        const today = new Date();
        today.setDate(1); 
        today.setHours(0,0,0,0);

        let currentMonth = new Date(entryDate.getFullYear(), entryDate.getMonth(), 1);
        currentMonth.setHours(0,0,0,0);

        while (currentMonth <= today) {
            const monthYear = `${currentMonth.getFullYear()}-${(currentMonth.getMonth() + 1).toString().padStart(2, '0')}`;

            const existingPayment = paymentsData.find(
                p => p.tenantId === tenantId && p.monthYear === monthYear
            );

            if (!existingPayment) {
                // Jatuh tempo mengikuti tanggal masuk penyewa
                const dueDate = new Date(
                    currentMonth.getFullYear(),
                    currentMonth.getMonth(),
                    entryDate.getDate()
                );

                const newPaymentId = generateUniqueId(paymentsData);
                paymentsData.push({
                    id: newPaymentId,
                    tenantId: tenantId,
                    monthYear: monthYear,
                    jumlah_bayar_expected: rentPrice,
                    amountPaid: 0,
                    paymentDate: null,
                    dueDate: dueDate.toISOString().split('T')[0],
                    status: 'belum_lunas'
                });
            }
            currentMonth.setMonth(currentMonth.getMonth() + 1);
        }
        // Data akan disimpan lewat saveDataToLocalStorage setelah dipanggil
    }

    // --- Add Custom Payment ---
    addPaymentBtnPayment.addEventListener('click', function() {
        const tenantId = parseInt(addPaymentBtnPayment.dataset.tenantId);
        const monthYear = paymentMonthInput.value;
        const amount = parseFloat(paymentAmountInput.value);

        if (!tenantId || isNaN(tenantId)) {
            alert('Tenant ID tidak ditemukan. Mohon ulangi proses atau simpan data penyewa terlebih dahulu.');
            return;
        }
        if (!monthYear) {
            alert('Pilih bulan pembayaran.');
            return;
        }
        if (isNaN(amount) || amount <= 0) {
            alert('Masukkan jumlah pembayaran yang valid.');
            return;
        }

        const existingPayment = paymentsData.find(p => p.tenantId === tenantId && p.monthYear === monthYear);

        if (existingPayment) {
            alert(`Pembayaran untuk bulan ${new Date(monthYear + '-01').toLocaleString('id-ID', { month: 'long', year: 'numeric' })} sudah ada.`);
            return;
        }

        const tenant = tenantsData.find(t => t.id === tenantId);
        if (!tenant) {
            alert("Data penyewa tidak ditemukan.");
            return;
        }

        // Jatuh tempo sesuai tanggal masuk penyewa
        const dueDate = new Date(
            new Date(monthYear + '-01').getFullYear(),
            new Date(monthYear + '-01').getMonth(),
            new Date(tenant.entryDate).getDate()
        );

        const newPaymentId = generateUniqueId(paymentsData);
        paymentsData.push({
            id: newPaymentId,
            tenantId: tenantId,
            monthYear: monthYear,
            jumlah_bayar_expected: amount,
            amountPaid: 0,
            paymentDate: null,
            dueDate: dueDate.toISOString().split('T')[0],
            status: 'belum_lunas'
        });

        saveDataToLocalStorage();
        alert('Pembayaran baru berhasil ditambahkan.');
        
        const room = roomsData.find(r => r.tenantId === tenantId);
        if (room) {
             loadKamarDetails(room.id, room.status); 
        }
        paymentMonthInput.value = '';
        paymentAmountInput.value = '';
    });

        // --- Load Pembayaran ---
        function loadPembayaran(tenantId, rentPrice, entryDate) {
            daftarPembayaran.innerHTML = '';
            infoPembayaran.style.display = 'block'; // Ensure info is visible initially

            const tenantPayments = paymentsData.filter(p => p.tenantId === tenantId)
                                                .sort((a, b) => new Date(a.monthYear) - new Date(b.monthYear));

            if (tenantPayments.length === 0) {
                infoPembayaran.textContent = 'Belum ada data pembayaran.';
                addPaymentForm.style.display = 'flex'; // Show form even if no payments
                return;
            } else {
                infoPembayaran.style.display = 'none'; // Hide info if payments exist
                addPaymentForm.style.display = 'flex';
            }

            tenantPayments.forEach(payment => {
                const listItem = document.createElement('li');
                const dueDate = new Date(payment.dueDate);
                const today = new Date();
                today.setHours(0,0,0,0);

                let statusText = '';
                let statusClass = '';
                let icon = '';

                if (payment.status === 'lunas') {
                    statusText = 'Lunas';
                    statusClass = 'lunas';
                    icon = '<i class="fas fa-check-circle"></i>';
                } else if (payment.status === 'belum_lunas' && dueDate < today) {
                    statusText = 'Jatuh Tempo!';
                    statusClass = 'jatuh-tempo';
                    icon = '<i class="fas fa-exclamation-triangle"></i>';
                } else {
                    statusText = 'Belum Lunas';
                    statusClass = 'belum-lunas';
                    icon = '<i class="fas fa-hourglass-half"></i>';
                }

                const paymentMonthYear = new Date(payment.monthYear + '-01').toLocaleString('id-ID', { month: 'long', year: 'numeric' });
                
                listItem.innerHTML = `
                    <span><strong>${paymentMonthYear}</strong></span>
                    <span>Diharapkan: ${formatCurrency(payment.jumlah_bayar_expected)}</span>
                    <span>Jatuh Tempo: ${new Date(payment.dueDate).toLocaleDateString('id-ID')}</span>
                    <div class="payment-item-controls">
                `;

                if (payment.status === 'belum_lunas') {
                    const confirmInputId = `confirmAmount_${payment.id}`;
                    listItem.querySelector('.payment-item-controls').innerHTML += `
                        <input type="number" id="${confirmInputId}" value="${payment.jumlah_bayar_expected || rentPrice}" min="0" placeholder="Jumlah Bayar">
                        <button onclick="confirmPayment(${payment.id}, document.getElementById('${confirmInputId}').value)" class="btn-save"><i class="fas fa-money-bill-wave"></i> Bayar</button>
                        <span class="payment-status-tag ${statusClass}">${icon} ${statusText}</span>
                    `;
                } else {
                     listItem.querySelector('.payment-item-controls').innerHTML += `
                        <span>Dibayar: ${formatCurrency(payment.amountPaid)}</span>
                        <span>Tgl Bayar: ${payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString('id-ID') : '-'}</span>
                        <span class="payment-status-tag ${statusClass}">${icon} ${statusText}</span>
                    `;
                }

                daftarPembayaran.appendChild(listItem);
            });
        }

        // --- Confirm Payment Function ---
        function confirmPayment(paymentId, amount) {
            const paymentIndex = paymentsData.findIndex(p => p.id === paymentId);

            if (paymentIndex === -1) {
                alert('Pembayaran tidak ditemukan!');
                return;
            }

            let currentPayment = paymentsData[paymentIndex];

            if (currentPayment.status === 'lunas') {
                alert('Pembayaran ini sudah lunas.');
                return;
            }

            const parsedAmount = parseFloat(amount);
            if (isNaN(parsedAmount) || parsedAmount < 0) {
                alert('Jumlah bayar tidak valid. Masukkan angka positif.');
                return;
            }

            currentPayment.amountPaid = parsedAmount;
            currentPayment.paymentDate = new Date().toISOString().split('T')[0];
            currentPayment.status = 'lunas';

            saveDataToLocalStorage();
            alert('Pembayaran berhasil dikonfirmasi!');
            
            const room = roomsData.find(r => r.tenantId === currentPayment.tenantId);
            if (room) {
                 loadKamarDetails(room.id, room.status); 
            }
        }

        // --- Close Modal Event Listeners ---
        closeButton.addEventListener('click', () => {
            modal.classList.remove('active');
        });

        cancelButton.addEventListener('click', () => {
            modal.classList.remove('active');
        });

        window.addEventListener('click', (event) => {
            if (event.target == modal) {
                modal.classList.remove('active');
            }
        });

        // Hamburger menu toggle
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            hamburger.classList.toggle('open'); 
        });

        // Close nav menu when a link is clicked (for mobile)
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    hamburger.classList.remove('open');
                }
            });
        });

        // Initial render and date initialization
        document.addEventListener('DOMContentLoaded', () => {
            renderRoomCards();
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            
            if (!tglMasukInput.value) {
                tglMasukInput.value = `${year}-${month}-${day}`;
            }

            const currentMonthYear = `${year}-${month}`;
            paymentMonthInput.value = currentMonthYear;
        });

