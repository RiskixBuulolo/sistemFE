import { ref, onMounted, onUnmounted, computed } from 'vue';
import Api from '../../api';
import Swal from 'sweetalert2';

// 1. Import jsPDF dan autoTable
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // <-- Ubah baris ini

// 2. Import Auth Store untuk Role
import { useAuthStore } from '../../stores/authStore';

export function useLaporanMasuk() {
    // ==========================================
    // 1. STATE & CONSTANTS
    // ==========================================
    const isSidebarOpen = ref(true);
    const activeTab = ref('harian'); 
    const isLoading = ref(false);
    const BASE_URL = 'http://localhost:5000/public/uploads/dokumen/';
    
    // Role Access
    const authStore = useAuthStore();
    const isKepalaOrStaff = computed(() => {
        const role = authStore.userRole?.toLowerCase();
        return role === 'kepala_labor' || role === 'staff_labor';
    });
    
    // Data List Utama
    const laporanHarianList = ref([]);   
    const dokumenSemesterList = ref([]); 
    const optionList = ref([]); 

    // Pagination
    const itemsPerPage = 5;
    const currentPageHarian = ref(1);
    const currentPageSemester = ref(1);

    // --- STATE DROPDOWN HARIAN & SEMESTER ---
    const searchHarianInput = ref('');
    const selectedHarianId = ref(''); 
    const isHarianDropdownOpen = ref(false);
    const harianDropdownRef = ref(null);

    const searchSemesterInput = ref('');
    const selectedSemesterId = ref(''); 
    const isSemesterDropdownOpen = ref(false);
    const semesterDropdownRef = ref(null);

    // ==========================================
    // 2. COMPUTED PROPERTIES (LOGIC FILTER)
    // ==========================================
    const filteredHarianOptions = computed(() => {
        const query = searchHarianInput.value.toLowerCase();
        return optionList.value.filter(item => item.label.toLowerCase().includes(query));
    });

    const filteredSemesterOptions = computed(() => {
        const query = searchSemesterInput.value.toLowerCase();
        return optionList.value.filter(item => item.label.toLowerCase().includes(query));
    });

    const filteredHarianList = computed(() => {
        let data = laporanHarianList.value;
        if (selectedHarianId.value) return data.filter(item => item.id_jadwal === selectedHarianId.value);
        if (searchHarianInput.value) {
            const query = searchHarianInput.value.toLowerCase();
            return data.filter(item => {
                const mk = item.Jadwal?.Kelas?.nama_mk?.toLowerCase() || '';
                const kls = item.Jadwal?.Kelas?.nama_kelas?.toLowerCase() || '';
                return mk.includes(query) || kls.includes(query);
            });
        }
        return data;
    });

    const filteredSemesterList = computed(() => {
        let data = dokumenSemesterList.value;
        if (selectedSemesterId.value) return data.filter(item => item.id_jadwal === selectedSemesterId.value); 
        if (searchSemesterInput.value) {
            const query = searchSemesterInput.value.toLowerCase();
            return data.filter(item => {
                const mk = item.Kelas?.nama_mk?.toLowerCase() || '';
                return mk.includes(query);
            });
        }
        return data;
    });

    const paginatedHarian = computed(() => {
        const start = (currentPageHarian.value - 1) * itemsPerPage;
        return filteredHarianList.value.slice(start, start + itemsPerPage);
    });
    const totalPageHarian = computed(() => Math.ceil(filteredHarianList.value.length / itemsPerPage));

    const paginatedSemester = computed(() => {
        const start = (currentPageSemester.value - 1) * itemsPerPage;
        return filteredSemesterList.value.slice(start, start + itemsPerPage);
    });
    const totalPageSemester = computed(() => Math.ceil(filteredSemesterList.value.length / itemsPerPage));

    // ==========================================
    // 3. METHODS DROPDOWN ACTION
    // ==========================================
    const onSearchHarianInput = () => {
        selectedHarianId.value = ''; 
        isHarianDropdownOpen.value = true;
        currentPageHarian.value = 1;
    };
    const selectHarianItem = (item) => {
        searchHarianInput.value = item.label; 
        selectedHarianId.value = item.id;     
        isHarianDropdownOpen.value = false;   
        currentPageHarian.value = 1;
    };
    const onSearchSemesterInput = () => {
        selectedSemesterId.value = '';
        isSemesterDropdownOpen.value = true;
        currentPageSemester.value = 1;
    };
    const selectSemesterItem = (item) => {
        searchSemesterInput.value = item.label;
        selectedSemesterId.value = item.id;
        isSemesterDropdownOpen.value = false;
        currentPageSemester.value = 1;
    };
    const handleClickOutside = (event) => {
        if (isHarianDropdownOpen.value && harianDropdownRef.value && !harianDropdownRef.value.contains(event.target)) {
            isHarianDropdownOpen.value = false;
        }
        if (isSemesterDropdownOpen.value && semesterDropdownRef.value && !semesterDropdownRef.value.contains(event.target)) {
            isSemesterDropdownOpen.value = false;
        }
    };

    // ==========================================
    // 4. API METHODS & LOGIC LAINNYA
    // ==========================================
    const fetchOptions = async () => {
        try {
            const response = await Api.get('/jadwal'); 
            const data = response.data.data || [];
            optionList.value = data.map(item => ({ 
                id: item.id_jadwal, 
                label: item.Kelas ? `${item.Kelas.nama_mk} - ${item.Kelas.nama_kelas}` : 'Kelas Terhapus' 
            }));
        } catch (error) { console.error("Gagal load options", error); }
    };

    const fetchLaporanHarian = async () => {
        isLoading.value = true;
        try {
            const response = await Api.get(`/harian`); 
            const rawData = response.data || response.data.data || [];
            const uniqueReports = [];
            const seenIds = new Set();
            rawData.forEach(report => {
                if (!seenIds.has(report.id_laporan)) {
                    seenIds.add(report.id_laporan);
                    uniqueReports.push(report);
                }
            });
            laporanHarianList.value = uniqueReports.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
        } catch (error) { Swal.fire({ icon: 'error', title: 'Gagal', text: 'Gagal ambil data harian' }); } 
        finally { isLoading.value = false; }
    };

    const fetchDokumenSemester = async () => {
        isLoading.value = true;
        try {
            const response = await Api.get('/semester');
            const rawData = response.data || response.data.data || [];
            const groupedMap = {};
            rawData.forEach(item => {
                if (!item.Kelas) return;
                const classId = item.id_jadwal; 
                if (!groupedMap[classId]) groupedMap[classId] = { ...item };
                else {
                    if (!groupedMap[classId].LaporanRps && item.LaporanRps) groupedMap[classId].LaporanRps = item.LaporanRps;
                    if (!groupedMap[classId].LaporanKontrak && item.LaporanKontrak) groupedMap[classId].LaporanKontrak = item.LaporanKontrak;
                }
            });
            dokumenSemesterList.value = Object.values(groupedMap);
        } catch (error) { console.error(error); } 
        finally { isLoading.value = false; }
    };

    const downloadFile = (filename) => {
        if (!filename) { Swal.fire({ toast: true, position: 'top-end', icon: 'warning', title: 'File kosong', timer: 2000, showConfirmButton: false }); return; }
        window.open(`${BASE_URL}${filename}`, '_blank');
    };

    const switchTab = (tab) => {
        activeTab.value = tab;
        if (tab === 'harian' && laporanHarianList.value.length === 0) fetchLaporanHarian();
        if (tab === 'semester' && dokumenSemesterList.value.length === 0) fetchDokumenSemester();
    };

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';
    const nextHarian = () => { if(currentPageHarian.value < totalPageHarian.value) currentPageHarian.value++; }
    const prevHarian = () => { if(currentPageHarian.value > 1) currentPageHarian.value--; }
    const nextSemester = () => { if(currentPageSemester.value < totalPageSemester.value) currentPageSemester.value++; }
    const prevSemester = () => { if(currentPageSemester.value > 1) currentPageSemester.value--; }

// ==========================================
    // 5. PDF GENERATOR
    // ==========================================
    const getTahunAjaranDanSemester = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth() + 1; // getMonth() mulai dari 0

        // Aturan Universitas Kamu:
        // September (9) - Januari (1) = Semester Ganjil
        // Februari (2) - Agustus (8) = Semester Genap

        if (month >= 9 || month === 1) { 
            // SEMESTER GANJIL
            if (month === 1) {
                // Jika bulan Januari, tahun sudah berganti, tapi tahun ajaran masih yang mulai tahun lalu
                return { semester: 'GANJIL', tahunAjaran: `${year - 1}/${year}` };
            } else {
                // Jika bulan September - Desember, tahun ajaran baru dimulai di tahun ini
                return { semester: 'GANJIL', tahunAjaran: `${year}/${year + 1}` };
            }
        } else {
            // SEMESTER GENAP (Februari - Agustus)
            // Semester Genap selalu berada di tahun ajaran yang dimulai pada tahun sebelumnya
            return { semester: 'GENAP', tahunAjaran: `${year - 1}/${year}` };
        }
    };

    const downloadRekapitulasi = async () => {
        Swal.fire({
            title: 'Menyiapkan PDF...',
            text: 'Mohon tunggu sebentar',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        try {
            // Ambil semua data sekaligus agar lengkap
            const [resJadwal, resHarian, resSemester] = await Promise.all([
                Api.get('/jadwal'),
                Api.get('/harian'),
                Api.get('/semester')
            ]);

            const jadwalData = resJadwal.data?.data || [];
            const harianData = resHarian.data?.data || resHarian.data || [];
            const semesterData = resSemester.data?.data || resSemester.data || [];

            // Grouping data berdasarkan Mata Kuliah
// Grouping data berdasarkan Mata Kuliah
const groupedMK = {};

jadwalData.forEach(j => {
    if (!j.Kelas) return;
    
    const mkName = j.Kelas.nama_mk;
    const dosenName = j.Kelas.nama_dosen;
    const kelasName = j.Kelas.nama_kelas;
    const asistenName = j.DataAsisten?.User?.nama_lengkap || '-';

    // 1. Cari status dari Semester (Semester biasanya 1 per jadwal)
    const hasSemester = semesterData.find(s => s.id_jadwal === j.id_jadwal);
    
    // 2. Gunakan FILTER untuk mengambil SEMUA riwayat harian asisten ini, bukan cuma FIND (yang pertama)
    const harianForJadwal = harianData.filter(h => h.id_jadwal === j.id_jadwal);

    const isRPS = hasSemester?.LaporanRps ? 'V' : 'X';
    const isKontrak = hasSemester?.LaporanKontrak ? 'V' : 'X';
    
    // 3. Gunakan SOME untuk mengecek apakah ADA dari kumpulan harian tersebut yang punya modul/monitoring
    const isModul = harianForJadwal.some(h => h.pembuatan_modul === 'Ya' || h.LaporanModuls?.length > 0) ? 'V' : 'X';
    const isMonitoring = harianForJadwal.some(h => h.LaporanAbsensiMonitorings?.length > 0) ? 'V' : 'X';

    if (!groupedMK[mkName]) {
        groupedMK[mkName] = { dosen: dosenName, classes: {} };
    }

    // 4. Inisialisasi awal kelas dengan nilai default 'X'
    if (!groupedMK[mkName].classes[kelasName]) {
        groupedMK[mkName].classes[kelasName] = {
            asistens: [], rps: 'X', kontrak: 'X', modul: 'X', monitoring: 'X'
        };
    }

    // Push nama asisten ke dalam kelas
    groupedMK[mkName].classes[kelasName].asistens.push(asistenName);

    // 5. PERBAIKAN UTAMA: Timpa menjadi 'V' jika asisten saat ini sudah upload. 
    // Jadi jika asisten ke-2 upload, 'X' dari asisten pertama akan tertimpa jadi 'V'.
    if (isRPS === 'V') groupedMK[mkName].classes[kelasName].rps = 'V';
    if (isKontrak === 'V') groupedMK[mkName].classes[kelasName].kontrak = 'V';
    if (isModul === 'V') groupedMK[mkName].classes[kelasName].modul = 'V';
    if (isMonitoring === 'V') groupedMK[mkName].classes[kelasName].monitoring = 'V';
});

            // Format ke array untuk jsPDF AutoTable
            const tableBody = [];
            let no = 1;

            Object.keys(groupedMK).forEach((mk, mkIndex) => {
                const mkData = groupedMK[mk];
                const classes = Object.keys(mkData.classes);
                const rowSpanCount = classes.length; // Jumlah kelas untuk menentukan seberapa panjang merge ke bawah
                
                classes.forEach((kelas, classIndex) => {
                    const cData = mkData.classes[kelas];
                    const asistenStr = cData.asistens.map((a, i) => `${i + 1}. ${a}`).join('\n');

                    // Gunakan V dan X agar tidak error di PDF seperti yang kita bahas sebelumnya
                    const rpsMark = cData.rps;
                    const kontrakMark = cData.kontrak;
                    const modulMark = cData.modul;
                    const monitoringMark = cData.monitoring;

                    const row = [];

                    // Jika ini adalah baris pertama dari sebuah MK, tambahkan sel dengan rowSpan
                    if (classIndex === 0) {
                        row.push({ content: no++, rowSpan: rowSpanCount, styles: { halign: 'center', valign: 'middle' } });
                        row.push({ content: mk, rowSpan: rowSpanCount, styles: { valign: 'middle' } });
                        row.push({ content: mkData.dosen, rowSpan: rowSpanCount, styles: { valign: 'middle' } });
                    }
                    // Catatan: Untuk baris ke-2 dan seterusnya pada MK yang sama, kita TIDAK perlu mem-push kolom No, MK, dan Dosen.
                    // autotable akan otomatis melewati kolom tersebut karena sudah di-cover oleh rowSpan dari baris pertama.

                    // Push sisa kolom yang selalu muncul di setiap baris
                    row.push({ content: asistenStr, styles: { valign: 'middle' } });
                    row.push({ content: kelas, styles: { halign: 'center', valign: 'middle' } });
                    row.push({ content: rpsMark, styles: { halign: 'center', valign: 'middle' } });
                    row.push({ content: kontrakMark, styles: { halign: 'center', valign: 'middle' } });
                    row.push({ content: modulMark, styles: { halign: 'center', valign: 'middle' } });
                    row.push({ content: monitoringMark, styles: { halign: 'center', valign: 'middle' } });

                    tableBody.push(row);
                });
            });

            // Mulai buat PDF
            const doc = new jsPDF('landscape'); 
            const { semester, tahunAjaran } = getTahunAjaranDanSemester();

            // Header Teks
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text("LAPORAN KEGIATAN LABORATORIUM TEKNIK INFORMATIKA", doc.internal.pageSize.getWidth() / 2, 15, { align: "center" });
            doc.text("UNIVERSITAS ISLAM RIAU", doc.internal.pageSize.getWidth() / 2, 22, { align: "center" });
            
            doc.setFontSize(11);
            doc.setFont("helvetica", "normal");
            doc.text(`SEMESTER ${semester}`, doc.internal.pageSize.getWidth() / 2, 28, { align: "center" });
            doc.text(`TAHUN AJARAN ${tahunAjaran}`, doc.internal.pageSize.getWidth() / 2, 34, { align: "center" });

            // Generate Tabel
            autoTable(doc, {
                startY: 42,
                // Menggunakan array 2 dimensi untuk membuat header bertingkat
                head: [
                    [
                        { content: 'No', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
                        { content: 'Nama MK', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
                        { content: 'Nama Dosen', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
                        { content: 'Nama Asisten', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
                        { content: 'Kelas', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
                        { content: 'Laporan', colSpan: 4, styles: { halign: 'center', valign: 'middle' } } // Menyatukan 4 kolom
                    ],
                    [
                        { content: 'RPS', styles: { halign: 'center', valign: 'middle' } },
                        { content: 'Kontrak Kuliah', styles: { halign: 'center', valign: 'middle' } },
                        { content: 'Modul', styles: { halign: 'center', valign: 'middle' } },
                        { content: 'File Monitoring', styles: { halign: 'center', valign: 'middle' } }
                    ]
                ],
                body: tableBody,
                theme: 'grid',
                headStyles: { fillColor: [41, 128, 185], textColor: 255, lineWidth: 0.1, lineColor: [255, 255, 255] },
                styles: { fontSize: 9, cellPadding: 3, valign: 'middle', lineColor: [189, 195, 199], lineWidth: 0.1 },
                columnStyles: {
                    0: { cellWidth: 10 } // Membatasi lebar kolom No agar tidak terlalu besar
                }
            });

            // Simpan File
            const fileName = `Rekap_Lab_TI_${semester}_${tahunAjaran.replace('/', '-')}.pdf`;
            doc.save(fileName);

            Swal.close();
            
        } catch (error) {
            console.error(error);
            Swal.fire({ icon: 'error', title: 'Gagal', text: 'Terjadi kesalahan saat membuat file PDF.' });
        }
    };

    // ==========================================
    // 6. LIFECYCLE
    // ==========================================
    onMounted(() => {
        fetchOptions(); 
        fetchLaporanHarian(); 
        document.addEventListener('click', handleClickOutside);
    });

    onUnmounted(() => {
        document.removeEventListener('click', handleClickOutside);
    });

    return {
        // State & Auth
        isSidebarOpen, activeTab, isLoading, isKepalaOrStaff,
        
        // Dropdown Harian & Semester
        searchHarianInput, harianDropdownRef, isHarianDropdownOpen, filteredHarianOptions,
        searchSemesterInput, semesterDropdownRef, isSemesterDropdownOpen, filteredSemesterOptions,

        // Data & Pagination
        paginatedHarian, totalPageHarian, currentPageHarian,
        paginatedSemester, totalPageSemester, currentPageSemester,
        filteredHarianList,

        // Methods
        switchTab, downloadFile, formatDate, downloadRekapitulasi,
        nextHarian, prevHarian, nextSemester, prevSemester,
        onSearchHarianInput, selectHarianItem,
        onSearchSemesterInput, selectSemesterItem
    };
}