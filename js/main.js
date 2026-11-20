// Key luu tru du lieu trong LocalStorage
const STORAGE_KEY = 'DANH_SACH_NHAN_VIEN';

// Du lieu mau ban dau
const defaultEmployees = [
    {
        manv: 'NV01',
        hoten: 'Nguyễn Thái Sang',
        ngaysinh: '2005-10-02',
        gioitinh: 'Nam',
        vitri: 'Thực Tập Sinh',
        phongban: 'Hành Chính Nhân Sự',
        dienthoai: '0902712130'
    },
    {
        manv: 'NV02',
        hoten: 'Trần Thị Mai',
        ngaysinh: '2001-04-15',
        gioitinh: 'Nữ',
        vitri: 'Chuyên viên',
        phongban: 'Kế Toán',
        dienthoai: '0912345678'
    },
    {
        manv: 'NV03',
        hoten: 'Lê Văn Hùng',
        ngaysinh: '1999-08-20',
        gioitinh: 'Nam',
        vitri: 'Kỹ sư phần mềm',
        phongban: 'Kỹ Thuật',
        dienthoai: '0987654321'
    }
];

// Lay danh sach nhan vien tu LocalStorage
function getEmployees() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : defaultEmployees;
}

// Luu danh sach vao LocalStorage
function saveEmployees(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

// Dinh dang ngay sang dang DD/MM/YYYY
function formatDate(dateString) {
    if (!dateString) return '';
    const parts = dateString.split('-');
    if (parts.length !== 3) return dateString;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

// Hien thi danh sach nhan vien len bang
function renderTable() {
    const list = getEmployees();
    const tbody = document.getElementById('employeeTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (list.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #888;">Chưa có dữ liệu nhân viên</td></tr>';
        return;
    }

    list.forEach((nv, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${nv.manv}</td>
            <td>${nv.hoten}</td>
            <td>${formatDate(nv.ngaysinh)}</td>
            <td>${nv.gioitinh}</td>
            <td>${nv.vitri}</td>
            <td>${nv.phongban}</td>
            <td>${nv.dienthoai}</td>
            <td style="text-align: center;">
                <button class="btn-delete" onclick="deleteEmployee(${index})">Xóa</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Xoa mot nhan vien khoi danh sach
function deleteEmployee(index) {
    const list = getEmployees();
    const emp = list[index];
    if (!emp) return;

    if (confirm(`Bạn có chắc chắn muốn xóa nhân viên "${emp.hoten}" (Mã: ${emp.manv}) không?`)) {
        list.splice(index, 1);
        saveEmployees(list);
        renderTable();
    }
}

// Xu ly su kien khi bam Luu thong tin tren form
function handleFormSubmit(event) {
    event.preventDefault();

    const manv = document.getElementById('manv').value.trim();
    const hoten = document.getElementById('hoten').value.trim();
    const ngaysinh = document.getElementById('ngaysinh').value;
    const gioitinh = document.getElementById('gioitinh').value;
    const vitri = document.getElementById('vitri').value.trim();
    const phongban = document.getElementById('phongban').value.trim();
    const dienthoai = document.getElementById('dienthoai').value.trim();

    if (!manv || !hoten || !dienthoai) {
        alert('Vui lòng nhập đầy đủ các thông tin bắt buộc!');
        return;
    }

    const list = getEmployees();

    // Kiem tra trung ma nhan vien
    const isDuplicate = list.some(item => item.manv.toLowerCase() === manv.toLowerCase());
    if (isDuplicate) {
        alert(`Mã nhân viên "${manv}" đã tồn tại! Vui lòng nhập mã khác.`);
        return;
    }

    // Them nhan vien moi
    const newEmp = { manv, hoten, ngaysinh, gioitinh, vitri, phongban, dienthoai };
    list.push(newEmp);
    saveEmployees(list);

    // Render lai bang va reset form
    renderTable();
    document.getElementById('employeeForm').reset();
    alert('Thêm nhân viên thành công!');
}

// Khoi chay khi trang tai xong
document.addEventListener('DOMContentLoaded', () => {
    renderTable();

    const form = document.getElementById('employeeForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
});
