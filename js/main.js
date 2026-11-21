// Key luu tru du lieu trong LocalStorage
const STORAGE_KEY = 'DANH_SACH_NHAN_VIEN';

// Cac hang so cau hinh gioi han file anh
const MAX_FILE_SIZE_MB = 2; // Gioi han dung luong toi da 2 MB
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

// Anh dai dien mac dinh chuan Base64 
const MALE_AVATAR = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA2NCI+PHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iMzIiIGZpbGw9IiNkYmVhZmUiLz48Y2lyY2xlIGN4PSIzMiIgY3k9IjI0IiByPSIxMSIgZmlsbD0iIzI1NjNlYiIvPjxwYXRoIGQ9Ik0xNiA1NGMwLTguODM3IDcuMTYzLTE2IDE2LTE2czE2IDcuMTYzIDE2IDE2IiBmaWxsPSIjMjU2M2ViIi8+PC9zdmc+';
const FEMALE_AVATAR = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA2NCI+PHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iMzIiIGZpbGw9IiNmY2U3ZjMiLz48Y2lyY2xlIGN4PSIzMiIgY3k9IjI0IiByPSIxMSIgZmlsbD0iI2RiMjc3NyIvPjxwYXRoIGQ9Ik0xNiA1NGMwLTguODM3IDcuMTYzLTE2IDE2LTE2czE2IDcuMTYzIDE2IDE2IiBmaWxsPSIjZGIyNzc3Ii8+PC9zdmc+';

function getDefaultAvatar(gioitinh) {
    return gioitinh === 'Nữ' ? FEMALE_AVATAR : MALE_AVATAR;
}

// Bien luu du lieu anh tam thoi (Base64)
let currentImageData = '';

// Du lieu mau ban dau
const defaultEmployees = [
    {
        manv: 'NV01',
        hoten: 'Nguyễn Thái Sang',
        ngaysinh: '2005-10-02',
        gioitinh: 'Nam',
        vitri: 'Thực Tập Sinh',
        phongban: 'Hành Chính Nhân Sự',
        dienthoai: '0902712130',
        hinhanh: ''
    },
    {
        manv: 'NV02',
        hoten: 'Trần Thị Mai',
        ngaysinh: '2001-04-15',
        gioitinh: 'Nữ',
        vitri: 'Chuyên viên',
        phongban: 'Kế Toán',
        dienthoai: '0912345678',
        hinhanh: ''
    },
    {
        manv: 'NV03',
        hoten: 'Lê Văn Hùng',
        ngaysinh: '1999-08-20',
        gioitinh: 'Nam',
        vitri: 'Kỹ sư phần mềm',
        phongban: 'Kỹ Thuật',
        dienthoai: '0987654321',
        hinhanh: ''
    }
];

// Lam sach du lieu tranh loi cache cu
function sanitizeEmployees(list) {
    if (!Array.isArray(list)) return [];
    return list.map(emp => {
        if (emp.hinhanh && emp.hinhanh.includes('utf8')) {
            emp.hinhanh = '';
        }
        return emp;
    });
}

// Lay danh sach nhan vien tu LocalStorage
function getEmployees() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultEmployees));
        return JSON.parse(JSON.stringify(defaultEmployees));
    }
    try {
        const parsed = JSON.parse(data);
        return sanitizeEmployees(parsed);
    } catch (e) {
        return defaultEmployees;
    }
}

// Luu danh sach vao LocalStorage
function saveEmployees(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

// Dinh dang dung luong tep sang KB/MB
function formatFileSize(bytes) {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Dinh dang ngay tu YYYY-MM-DD sang DD/MM/YYYY
function formatDate(dateString) {
    if (!dateString) return '';
    const parts = dateString.split('-');
    if (parts.length !== 3) return dateString;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

// Hien thi loi file anh
function showImageError(msg) {
    const errorEl = document.getElementById('imageError');
    if (errorEl) {
        errorEl.textContent = msg;
        errorEl.style.display = 'block';
    }
}

// Xoa loi file anh
function clearImageError() {
    const errorEl = document.getElementById('imageError');
    if (errorEl) {
        errorEl.textContent = '';
        errorEl.style.display = 'none';
    }
}

// Reset input file va an vung xem truoc anh
function resetFileInput() {
    const input = document.getElementById('hinhanh');
    if (input) input.value = '';
    currentImageData = '';
    const previewContainer = document.getElementById('previewContainer');
    if (previewContainer) previewContainer.style.display = 'none';
}

// Go bo anh dinh kem
function removeSelectedImage() {
    clearImageError();
    resetFileInput();
}

// Toi uu hoa kich thuoc anh qua Canvas de tiet kiem dung luong LocalStorage
function optimizeImage(dataUrl, maxWidth = 600, maxHeight = 600) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            let width = img.width;
            let height = img.height;

            if (width > maxWidth || height > maxHeight) {
                if (width > height) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                } else {
                    width = Math.round((width * maxHeight) / height);
                    height = maxHeight;
                }
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            const optimized = canvas.toDataURL('image/jpeg', 0.85);
            resolve(optimized);
        };
        img.onerror = () => resolve(dataUrl);
        img.src = dataUrl;
    });
}

// Xu ly khi chon file anh tren form.html
async function handleImageSelect(event) {
    clearImageError();
    const file = event.target.files && event.target.files[0];
    if (!file) {
        removeSelectedImage();
        return;
    }

    // 1. Kiem tra dinh dang hop le
    const fileType = (file.type || '').toLowerCase();
    const fileName = (file.name || '').toLowerCase();
    const isExtensionValid = ALLOWED_EXTENSIONS.some(ext => fileName.endsWith(ext));
    const isMimeValid = ALLOWED_TYPES.includes(fileType);

    if (!isMimeValid && !isExtensionValid) {
        showImageError('Lỗi định dạng: Chỉ chấp nhận các file ảnh có đuôi JPG, PNG, GIF, WEBP!');
        resetFileInput();
        return;
    }

    // 2. Kiem tra gioi han dung luong (2MB)
    if (file.size > MAX_FILE_SIZE_BYTES) {
        const currentSizeStr = formatFileSize(file.size);
        showImageError(`Lỗi dung lượng: File ảnh (${currentSizeStr}) vượt quá giới hạn tối đa cho phép là ${MAX_FILE_SIZE_MB} MB!`);
        resetFileInput();
        return;
    }

    // 3. Doc file va hien thi xem truoc
    const reader = new FileReader();
    reader.onload = async function(e) {
        const rawData = e.target.result;
        try {
            currentImageData = await optimizeImage(rawData, 600, 600);
        } catch (err) {
            currentImageData = rawData;
        }

        const previewContainer = document.getElementById('previewContainer');
        const previewImg = document.getElementById('imagePreview');
        const previewName = document.getElementById('previewFileName');
        const previewSize = document.getElementById('previewFileSize');

        if (previewImg) previewImg.src = currentImageData;
        if (previewName) previewName.textContent = file.name;
        if (previewSize) previewSize.textContent = `Dung lượng: ${formatFileSize(file.size)}`;
        if (previewContainer) previewContainer.style.display = 'flex';
    };

    reader.onerror = function() {
        showImageError('Có lỗi xảy ra khi đọc file ảnh, vui lòng thử lại!');
        resetFileInput();
    };

    reader.readAsDataURL(file);
}

// Modal xem anh lon
function openImageModal(imgSrc, caption) {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImg');
    const modalCaption = document.getElementById('modalCaption');

    if (!modal || !modalImg) return;

    modalImg.src = imgSrc;
    if (modalCaption) {
        modalCaption.textContent = caption || 'Ảnh nhân viên';
    }
    modal.style.display = 'flex';
}

function closeImageModal() {
    const modal = document.getElementById('imageModal');
    if (modal) modal.style.display = 'none';
}

// Xem anh dai dien cua nhan vien (truyen theo index hoac ma NV)
function viewEmployeeAvatar(id) {
    const list = getEmployees();
    let nv = null;
    if (typeof id === 'number') {
        nv = list[id];
    } else {
        nv = list.find(item => item.manv === id);
    }
    if (!nv) return;
    const avatarSrc = nv.hinhanh || getDefaultAvatar(nv.gioitinh);
    const captionText = `${nv.hoten} (${nv.manv})`;
    openImageModal(avatarSrc, captionText);
}

// ==========================================================================
// TRANG 1: HỒ SƠ NHÂN VIÊN (index.html - Trang Profile Cá Nhân)
// ==========================================================================
function renderProfileDetail() {
    const list = getEmployees();
    if (list.length === 0) return;

    // Lay nhan vien dau tien (NV01) hoac nhan vien theo param
    const urlParams = new URLSearchParams(window.location.search);
    const manv = urlParams.get('manv') || 'NV01';
    let emp = list.find(item => item.manv === manv);
    if (!emp) emp = list[0];

    const avatarSrc = emp.hinhanh || getDefaultAvatar(emp.gioitinh);

    // Gan thong tin Header Profile
    const detailAvatar = document.getElementById('detailAvatar');
    if (detailAvatar) {
        detailAvatar.src = avatarSrc;
        detailAvatar.onclick = () => openImageModal(avatarSrc, `${emp.hoten} (${emp.manv})`);
    }

    const detailHoTen = document.getElementById('detailHoTen');
    if (detailHoTen) detailHoTen.textContent = emp.hoten;

    const detailMaNV = document.getElementById('detailMaNV');
    if (detailMaNV) detailMaNV.textContent = emp.manv;

    const detailViTri = document.getElementById('detailViTri');
    if (detailViTri) detailViTri.textContent = emp.vitri || 'Chưa cập nhật vị trí';

    const detailPhongBan = document.getElementById('detailPhongBan');
    if (detailPhongBan) detailPhongBan.textContent = emp.phongban || 'Chưa cập nhật phòng ban';

    // Gan thong tin chi tiet vao cac khoi
    const infoMaNV = document.getElementById('infoMaNV');
    if (infoMaNV) infoMaNV.textContent = emp.manv;

    const infoHoTen = document.getElementById('infoHoTen');
    if (infoHoTen) infoHoTen.textContent = emp.hoten;

    const infoNgaySinh = document.getElementById('infoNgaySinh');
    if (infoNgaySinh) infoNgaySinh.textContent = formatDate(emp.ngaysinh) || 'Chưa cập nhật';

    const infoGioiTinh = document.getElementById('infoGioiTinh');
    if (infoGioiTinh) infoGioiTinh.textContent = emp.gioitinh || 'Chưa cập nhật';

    const infoViTri = document.getElementById('infoViTri');
    if (infoViTri) infoViTri.textContent = emp.vitri || 'Chưa cập nhật';

    const infoPhongBan = document.getElementById('infoPhongBan');
    if (infoPhongBan) infoPhongBan.textContent = emp.phongban || 'Chưa cập nhật';

    const infoDienThoai = document.getElementById('infoDienThoai');
    if (infoDienThoai) infoDienThoai.textContent = emp.dienthoai || 'Chưa cập nhật';

    // Nut Chinh sua ho so
    const editProfileBtn = document.getElementById('editProfileBtn');
    if (editProfileBtn) {
        editProfileBtn.href = `form.html?edit=${encodeURIComponent(emp.manv)}`;
    }

    // Tinh nang thay nhanh anh dai dien ngay tren trang profile
    const changeAvatarBtn = document.getElementById('changeAvatarBtn');
    const profileFileInput = document.getElementById('profileFileInput');
    const profileImageMsg = document.getElementById('profileImageMsg');

    if (changeAvatarBtn && profileFileInput) {
        changeAvatarBtn.onclick = (e) => {
            e.stopPropagation();
            profileFileInput.click();
        };

        profileFileInput.onchange = async (e) => {
            const file = e.target.files && e.target.files[0];
            if (!file) return;

            // Kiem tra dinh dang
            const fileType = (file.type || '').toLowerCase();
            const fileName = (file.name || '').toLowerCase();
            const isExtensionValid = ALLOWED_EXTENSIONS.some(ext => fileName.endsWith(ext));
            const isMimeValid = ALLOWED_TYPES.includes(fileType);

            if (!isMimeValid && !isExtensionValid) {
                alert('Lỗi: Chỉ chấp nhận các file ảnh có đuôi JPG, PNG, GIF, WEBP!');
                return;
            }

            // Kiem tra dung luong
            if (file.size > MAX_FILE_SIZE_BYTES) {
                alert(`Lỗi: File ảnh (${formatFileSize(file.size)}) vượt quá giới hạn tối đa ${MAX_FILE_SIZE_MB} MB!`);
                return;
            }

            const reader = new FileReader();
            reader.onload = async (ev) => {
                const optimized = await optimizeImage(ev.target.result, 600, 600);
                emp.hinhanh = optimized;
                saveEmployees(list);
                renderProfileDetail();

                if (profileImageMsg) {
                    profileImageMsg.textContent = '✓ Đã cập nhật ảnh đại diện thành công!';
                    profileImageMsg.style.color = '#16a34a';
                    profileImageMsg.style.display = 'block';
                    setTimeout(() => { profileImageMsg.style.display = 'none'; }, 3000);
                }
            };
            reader.readAsDataURL(file);
        };
    }
}

// ==========================================================================
// TRANG 2: BẢNG NHÂN VIÊN (table.html)
// ==========================================================================
function renderTable() {
    const tbody = document.getElementById('employeeTableBody');
    if (!tbody) return;

    const list = getEmployees();
    tbody.innerHTML = '';

    if (list.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; color: #888; padding: 20px;">Chưa có dữ liệu nhân viên</td></tr>';
        return;
    }

    list.forEach((nv, index) => {
        const tr = document.createElement('tr');
        const avatarSrc = nv.hinhanh || getDefaultAvatar(nv.gioitinh);

        tr.innerHTML = `
            <td class="table-avatar-cell">
                <img src="${avatarSrc}" alt="${nv.hoten}" class="emp-avatar" title="Nhấn để phóng to ảnh" onclick="viewEmployeeAvatar(${index})">
            </td>
            <td><strong>${nv.manv}</strong></td>
            <td>
                <a href="index.html?manv=${encodeURIComponent(nv.manv)}" style="color: #2563eb; text-decoration: none; font-weight: 600;" title="Bấm xem hồ sơ">${nv.hoten}</a>
            </td>
            <td>${formatDate(nv.ngaysinh) || '---'}</td>
            <td>${nv.gioitinh}</td>
            <td>${nv.vitri || '---'}</td>
            <td>${nv.phongban || '---'}</td>
            <td>${nv.dienthoai}</td>
            <td style="text-align: center; white-space: nowrap;">
                <button class="btn-action btn-edit" onclick="navigateToEdit('${nv.manv}')">Sửa</button>
                <button class="btn-action btn-delete" onclick="deleteEmployee('${nv.manv}')">Xóa</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Dieu huong sang trang form.html de sua nhan vien
function navigateToEdit(manv) {
    sessionStorage.setItem('EDIT_MANV', manv);
    window.location.href = `form.html?edit=${encodeURIComponent(manv)}`;
}

// Xoa nhan vien (ho tro truyen theo index hoac ma NV)
function deleteEmployee(identifier) {
    const list = getEmployees();
    let empIndex = -1;

    if (typeof identifier === 'number') {
        empIndex = identifier;
    } else {
        empIndex = list.findIndex(nv => nv.manv === identifier);
    }

    const emp = list[empIndex];
    if (!emp) return;

    if (confirm(`Bạn có chắc chắn muốn xóa nhân viên "${emp.hoten}" (Mã: ${emp.manv}) không?`)) {
        list.splice(empIndex, 1);
        saveEmployees(list);

        // Cap nhat lai giao dien trang hien tai
        if (document.getElementById('employeeTableBody')) {
            renderTable();
        }
        if (document.getElementById('detailHoTen')) {
            renderProfileDetail();
        }
    }
}

// ==========================================================================
// TRANG 3: FORM NHẬP THÔNG TIN (form.html)
// ==========================================================================
function initFormMode() {
    const form = document.getElementById('employeeForm');
    if (!form) return;

    const urlParams = new URLSearchParams(window.location.search);
    const editManv = urlParams.get('edit') || sessionStorage.getItem('EDIT_MANV');

    if (editManv) {
        sessionStorage.removeItem('EDIT_MANV');
        loadEmployeeForEdit(editManv);
    }
}

function loadEmployeeForEdit(manv) {
    const list = getEmployees();
    const empIndex = list.findIndex(item => item.manv === manv);
    const emp = list[empIndex];

    if (!emp) {
        alert('Không tìm thấy thông tin nhân viên cần sửa!');
        return;
    }

    const editIndexEl = document.getElementById('editIndex');
    if (editIndexEl) editIndexEl.value = empIndex;

    const manvInput = document.getElementById('manv');
    manvInput.value = emp.manv || '';
    manvInput.readOnly = true;
    manvInput.classList.add('input-readonly');

    const manvNote = document.getElementById('manvNote');
    if (manvNote) manvNote.textContent = '*(Mã nhân viên cố định khi chỉnh sửa)';

    document.getElementById('hoten').value = emp.hoten || '';
    document.getElementById('ngaysinh').value = emp.ngaysinh || '';
    document.getElementById('gioitinh').value = emp.gioitinh || 'Nam';
    document.getElementById('vitri').value = emp.vitri || '';
    document.getElementById('phongban').value = emp.phongban || '';
    document.getElementById('dienthoai').value = emp.dienthoai || '';

    // Xu ly anh dai dien
    clearImageError();
    const fileInput = document.getElementById('hinhanh');
    if (fileInput) fileInput.value = '';

    if (emp.hinhanh) {
        currentImageData = emp.hinhanh;
        const previewContainer = document.getElementById('previewContainer');
        const previewImg = document.getElementById('imagePreview');
        const previewName = document.getElementById('previewFileName');
        const previewSize = document.getElementById('previewFileSize');

        if (previewImg) previewImg.src = emp.hinhanh;
        if (previewName) previewName.textContent = 'Ảnh đại diện hiện tại';
        if (previewSize) previewSize.textContent = '(Đã lưu trong hồ sơ)';
        if (previewContainer) previewContainer.style.display = 'flex';
    } else {
        currentImageData = '';
        const previewContainer = document.getElementById('previewContainer');
        if (previewContainer) previewContainer.style.display = 'none';
    }

    // Cap nhat tieu de form va nut bam
    const formTitle = document.getElementById('formTitle');
    if (formTitle) {
        formTitle.innerHTML = `CHỈNH SỬA THÔNG TIN: <span style="color: #2563eb;">${emp.hoten} (${emp.manv})</span>`;
    }

    const btnSubmit = document.getElementById('btnSubmit');
    if (btnSubmit) {
        btnSubmit.textContent = 'Cập nhật thông tin';
    }

    const btnCancelEdit = document.getElementById('btnCancelEdit');
    if (btnCancelEdit) {
        btnCancelEdit.style.display = 'inline-block';
    }
}

function resetFormToAddMode() {
    const form = document.getElementById('employeeForm');
    if (form) form.reset();

    const editIndexEl = document.getElementById('editIndex');
    if (editIndexEl) editIndexEl.value = '-1';

    const manvInput = document.getElementById('manv');
    if (manvInput) {
        manvInput.readOnly = false;
        manvInput.classList.remove('input-readonly');
    }

    const manvNote = document.getElementById('manvNote');
    if (manvNote) manvNote.textContent = '';

    const formTitle = document.getElementById('formTitle');
    if (formTitle) formTitle.textContent = 'FORM NHẬP THÔNG TIN';

    const btnSubmit = document.getElementById('btnSubmit');
    if (btnSubmit) btnSubmit.textContent = 'Lưu thông tin';

    const btnCancelEdit = document.getElementById('btnCancelEdit');
    if (btnCancelEdit) {
        btnCancelEdit.style.display = 'none';
    }

    removeSelectedImage();
}

function handleFormSubmit(event) {
    event.preventDefault();

    const editIndex = parseInt(document.getElementById('editIndex').value, 10);
    const manv = document.getElementById('manv').value.trim().toUpperCase();
    const hoten = document.getElementById('hoten').value.trim();
    const ngaysinh = document.getElementById('ngaysinh').value;
    const gioitinh = document.getElementById('gioitinh').value;
    const vitri = document.getElementById('vitri').value.trim();
    const phongban = document.getElementById('phongban').value.trim();
    let dienthoai = document.getElementById('dienthoai').value.trim().replace(/\s+/g, '');
    const hinhanh = currentImageData || '';

    // 1. Kiem tra bat buoc
    if (!manv || !hoten || !dienthoai) {
        alert('Vui lòng nhập đầy đủ các thông tin bắt buộc (*)!');
        return;
    }

    // 2. Kiem tra so dien thoai
    const phoneRegex = /^0\d{9}$/;
    if (!phoneRegex.test(dienthoai)) {
        alert('Số điện thoại không hợp lệ! Vui lòng nhập 10 chữ số bắt đầu bằng số 0 (Ví dụ: 0902712130).');
        document.getElementById('dienthoai').focus();
        return;
    }

    // 3. Kiem tra ngay sinh
    if (ngaysinh) {
        const birthDate = new Date(ngaysinh);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (birthDate > today) {
            alert('Ngày sinh không hợp lệ! Không thể chọn ngày trong tương lai.');
            document.getElementById('ngaysinh').focus();
            return;
        }
    }

    const list = getEmployees();

    if (editIndex >= 0) {
        // --- SUA ---
        if (!list[editIndex]) {
            alert('Không tìm thấy nhân viên cần cập nhật!');
            resetFormToAddMode();
            return;
        }

        list[editIndex] = {
            manv,
            hoten,
            ngaysinh,
            gioitinh,
            vitri,
            phongban,
            dienthoai,
            hinhanh
        };

        saveEmployees(list);
        alert(`Cập nhật thông tin nhân viên "${hoten}" (${manv}) thành công!`);
        window.location.href = 'table.html';
    } else {
        // --- THEM MOI ---
        const isDuplicate = list.some(item => item.manv.toLowerCase() === manv.toLowerCase());
        if (isDuplicate) {
            alert(`Mã nhân viên "${manv}" đã tồn tại! Vui lòng nhập mã khác.`);
            document.getElementById('manv').focus();
            return;
        }

        const newEmp = { manv, hoten, ngaysinh, gioitinh, vitri, phongban, dienthoai, hinhanh };
        list.push(newEmp);
        saveEmployees(list);

        alert(`Thêm nhân viên "${hoten}" (${manv}) thành công!`);
        window.location.href = 'table.html';
    }
}

// ==========================================================================
// KHOI CHAY KHI TAI TRANG
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    // 1. Neu la Trang 1: Ho so nhan vien (index.html)
    if (document.getElementById('detailHoTen')) {
        renderProfileDetail();
    }

    // 2. Neu la Trang 2: Bang nhan vien (table.html)
    if (document.getElementById('employeeTableBody')) {
        renderTable();
    }

    // 3. Neu la Trang 3: Form nhap lieu (form.html)
    const form = document.getElementById('employeeForm');
    if (form) {
        initFormMode();
        form.addEventListener('submit', handleFormSubmit);
        form.addEventListener('reset', (e) => {
            e.preventDefault();
            resetFormToAddMode();
        });

        // Lang nghe chon file anh
        const fileInput = document.getElementById('hinhanh');
        if (fileInput) {
            fileInput.addEventListener('change', handleImageSelect);
        }

        // Lang nghe nut go bo anh
        const btnRemoveImage = document.getElementById('btnRemoveImage');
        if (btnRemoveImage) {
            btnRemoveImage.addEventListener('click', removeSelectedImage);
        }
    }

    // Modal popup xem anh
    const modalClose = document.getElementById('modalClose');
    if (modalClose) {
        modalClose.addEventListener('click', closeImageModal);
    }

    const modalOverlay = document.getElementById('modalOverlay');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', closeImageModal);
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeImageModal();
        }
    });
});
