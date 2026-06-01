import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router'; // [BARU] Import useRoute untuk menangkap URL
import jadwalService from '../../api/jadwalService';
import laporanService from '../../api/laporanService';
import Swal from 'sweetalert2';

export function useAsistenLaporan() {
    
    // === CONFIGURATION ===
    const route = useRoute(); // [BARU] Inisialisasi route
    const isSidebarOpen = ref(true);
    const activeTab = ref('harian'); // 'harian' atau 'semester'

    // === STATE ===
    const jadwalList = ref([]);
    const isLoading = ref(false);

    // Form State: Laporan Harian
    const formHarian = ref({
        id_jadwal: '',
        tanggal: new Date().toISOString().slice(0, 10),
        pembuatan_modul: 'Tidak',
        jumlah_modul: 0,
        no_modul: '',
        // jenis_file: 'Absensi' 
    });

    // File State (Data)
    const fileModul = ref(null);
    const fileAbsMon = ref(null);

    // HTML Refs (Untuk Reset Visual Input File)
    const fileInputAbsRef = ref(null);
    const fileInputModulRef = ref(null);
    const fileInputRpsRef = ref(null);
    const fileInputKontrakRef = ref(null);

    // Form State: Dokumen Semester
    const formSemester = ref({
        id_jadwal: '',
        file_rps: null,
        file_kontrak: null
    });

    // === TAMBAHAN LOGIC SEARCHABLE SELECT ===
    const searchQuery = ref(""); // Apa yang diketik user
    const isDropdownOpen = ref(false); // Status dropdown terbuka/tutup

    // === METHODS ===

    // 1. Fetch Data Jadwal
    const fetchJadwal = async () => {
        try {
            // Pastikan service ini mengarah ke endpoint GET /jadwal
            const res = await jadwalService.getJadwalSaya(); 
            // Sesuaikan struktur response dengan backend Anda (res.data.data atau res.data)
            jadwalList.value = res.data.data || res.data || [];

            // === [BARU] LOGIC AUTO-SELECT DARI URL ===
            // Cek apakah ada jadwal_id di URL (dikirim dari menu Jadwal Saya)
            const paramJadwalId = route.query.jadwal_id || route.params.id; 

            if (paramJadwalId) {
                // Cari data jadwal yang ID-nya cocok dengan URL
                const selected = jadwalList.value.find(j => j.id_jadwal == paramJadwalId);
                
                if (selected) {
                    selectJadwal(selected);         // Otomatis isi untuk Laporan Harian
                    selectJadwalSemester(selected); // Otomatis isi untuk Laporan Semester
                }
            }
            // ==========================================

        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'Gagal memuat daftar jadwal.', 'error');
        }
    };

    // 2. Handle File Change
    const handleFileChange = (event, type) => {
        const file = event.target.files[0];
        if (!file) return;

        if (type === 'modul') fileModul.value = file;
        else if (type === 'absmon') fileAbsMon.value = file;
        else if (type === 'rps') formSemester.value.file_rps = file;
        else if (type === 'kontrak') formSemester.value.file_kontrak = file;
    };

    // =========================================================
    // LOGIC A: SUBMIT LAPORAN HARIAN
    // =========================================================
    const submitLaporanHarian = async () => {
        // Validasi
        if (!formHarian.value.id_jadwal) return Swal.fire('Warning', 'Pilih Jadwal Praktikum dulu.', 'warning');
        if (!fileAbsMon.value) return Swal.fire('Warning', 'File Absensi/Monitoring wajib diupload.', 'warning');
        if (formHarian.value.pembuatan_modul !== 'Tidak' && !fileModul.value) {
            return Swal.fire('Warning', 'Anda memilih Buat Modul, wajib upload file modul.', 'warning');
        }

        try {
            isLoading.value = true;

            // STEP 1: Buat Header Laporan (JSON)
            const payloadHeader = {
                id_jadwal: formHarian.value.id_jadwal,
                tanggal: formHarian.value.tanggal,
                pembuatan_modul: formHarian.value.pembuatan_modul,
                jumlah_modul: parseInt(formHarian.value.jumlah_modul) || 0 // Pastikan Integer
            };

            // Panggil API createLaporanHarian
            const resHeader = await laporanService.createLaporanHarian(payloadHeader);
            
            // Ambil ID Laporan dari response backend
            // Pastikan backend mengembalikan { id_laporan: ... }
            const idLaporan = resHeader.data.id_laporan; 

            if (!idLaporan) throw new Error("Gagal mendapatkan ID Laporan dari server.");

            // STEP 2: Upload File (Paralel)
            const uploadPromises = [];

            // A. Upload Absensi/Monitoring
            const formDataAbs = new FormData();
            formDataAbs.append('id_laporan', idLaporan);
            formDataAbs.append('type', 'absmon'); 
            // formDataAbs.append('jenis_file', formHarian.value.jenis_file);
            // PENTING: Key harus 'file_bukti' sesuai backend route middleware
            formDataAbs.append('file_bukti', fileAbsMon.value); 
            
            uploadPromises.push(laporanService.uploadBuktiLaporan(formDataAbs));

            // B. Upload Modul (Jika Ada)
            if (formHarian.value.pembuatan_modul !== 'Tidak' && fileModul.value) {
                const formDataModul = new FormData();
                formDataModul.append('id_laporan', idLaporan);
                formDataModul.append('type', 'modul');
                formDataModul.append('no_modul', formHarian.value.no_modul);
                // PENTING: Key harus 'file_bukti' sesuai backend route middleware
                formDataModul.append('file_bukti', fileModul.value);
                
                uploadPromises.push(laporanService.uploadBuktiLaporan(formDataModul));
            }

            // Tunggu semua upload selesai
            await Promise.all(uploadPromises);

            Swal.fire('Sukses', 'Laporan Harian & File berhasil disimpan!', 'success');
            
            // Reset Form & Input Visual
            formHarian.value.jumlah_modul = 0;
            formHarian.value.no_modul = '';
            formHarian.value.pembuatan_modul = 'Tidak';
            fileModul.value = null;
            fileAbsMon.value = null;

            // Reset Element HTML Input via Ref
            if (fileInputAbsRef.value) fileInputAbsRef.value.value = '';
            if (fileInputModulRef.value) fileInputModulRef.value.value = '';

        } catch (error) {
            console.error("Gagal submit laporan harian:", error);
            Swal.fire('Gagal', error.response?.data?.message || error.message, 'error');
        } finally {
            isLoading.value = false;
        }
    };

    // =========================================================
    // LOGIC B: SUBMIT DOKUMEN SEMESTER
    // =========================================================
    const submitRps = async () => {
        if (!formSemester.value.id_jadwal || !formSemester.value.file_rps) {
            return Swal.fire('Isi Data', 'Jadwal dan File RPS wajib diisi', 'warning');
        }
        
        try {
            isLoading.value = true;
            const fd = new FormData();
            fd.append('id_jadwal', formSemester.value.id_jadwal);
            // PENTING: Key 'file_rps' sesuai backend middleware
            fd.append('file_rps', formSemester.value.file_rps); 

            await laporanService.uploadRps(fd);
            Swal.fire('Sukses', 'RPS Berhasil diupload', 'success');

            // Reset
            formSemester.value.file_rps = null;
            if (fileInputRpsRef.value) fileInputRpsRef.value.value = '';

        } catch (err) {
            Swal.fire('Gagal', err.response?.data?.message || err.message, 'error');
        } finally {
            isLoading.value = false;
        }
    };

    const submitKontrak = async () => {
        if (!formSemester.value.id_jadwal || !formSemester.value.file_kontrak) {
            return Swal.fire('Isi Data', 'Jadwal dan File Kontrak wajib diisi', 'warning');
        }

        try {
            isLoading.value = true;
            const fd = new FormData();
            fd.append('id_jadwal', formSemester.value.id_jadwal);
            // PENTING: Key 'file_kontrak' sesuai backend middleware
            fd.append('file_kontrak', formSemester.value.file_kontrak); 

            await laporanService.uploadKontrak(fd);
            Swal.fire('Sukses', 'Kontrak Kuliah Berhasil diupload', 'success');

            // Reset
            formSemester.value.file_kontrak = null;
            if (fileInputKontrakRef.value) fileInputKontrakRef.value.value = '';

        } catch (err) {
            Swal.fire('Gagal', err.response?.data?.message || err.message, 'error');
        } finally {
            isLoading.value = false;
        }
    };
    
    // Computed: Filter jadwal berdasarkan ketikan user
    const filteredJadwalList = computed(() => {
        if (!searchQuery.value) {
            return jadwalList.value; // Jika kosong, tampilkan semua
        }
        const lowerQuery = searchQuery.value.toLowerCase();
        return jadwalList.value.filter(j => {
            const namaMK = j.Kelas?.nama_mk?.toLowerCase() || '';
            const kelas = j.Kelas?.nama_kelas?.toLowerCase() || '';
            const hari = j.hari?.toLowerCase() || '';
            // Filter mencakup Nama MK, Kelas, atau Hari
            return namaMK.includes(lowerQuery) || kelas.includes(lowerQuery) || hari.includes(lowerQuery);
        });
    });
    
    // Action: Saat user memilih item dari list
    const selectJadwal = (jadwal) => {
        formHarian.value.id_jadwal = jadwal.id_jadwal;
        // Set text input agar terlihat user memilih apa
        searchQuery.value = `${jadwal.Kelas?.nama_mk} (${jadwal.Kelas?.nama_kelas})`; 
        isDropdownOpen.value = false; // Tutup dropdown
    };

    // Action: Toggle dropdown
    const toggleDropdown = () => {
        isDropdownOpen.value = !isDropdownOpen.value;
    };

    // === [BARU] LOGIC SEARCH TAB SEMESTER ===
    const searchQuerySemester = ref("");
    const isDropdownOpenSemester = ref(false);

    // Computed khusus Semester
    const filteredJadwalSemester = computed(() => {
        if (!searchQuerySemester.value) return jadwalList.value;
        const lower = searchQuerySemester.value.toLowerCase();
        return jadwalList.value.filter(j => {
            return (j.Kelas?.nama_mk?.toLowerCase() || '').includes(lower) || 
                   (j.Kelas?.nama_kelas?.toLowerCase() || '').includes(lower) || 
                   (j.hari?.toLowerCase() || '').includes(lower);
        });
    });

    // Action Select khusus Semester
    const selectJadwalSemester = (jadwal) => {
        formSemester.value.id_jadwal = jadwal.id_jadwal;
        // Format teks tampilan
        searchQuerySemester.value = `${jadwal.Kelas?.nama_mk} - ${jadwal.Kelas?.nama_kelas} (${jadwal.hari})`; 
        isDropdownOpenSemester.value = false;
    };

    const toggleDropdownSemester = () => isDropdownOpenSemester.value = !isDropdownOpenSemester.value;

    // === [BARU] LOGIC TAB STATUS UPLOAD ===
    const jadwalStatusList = computed(() => {
        return jadwalList.value.map(j => {
            
            // 1. Ambil Nama dan Role Asisten dari relasi j.DataAsisten
            // Mengambil nama_lengkap dari tabel User yang di-include di backend
            const namaAsisten = j.DataAsisten?.User?.nama_lengkap || 'Asisten Tidak Diketahui';
            
            // Ganti 'role' dengan nama kolom yang benar di tabel DataAsisten-mu (misal: 'peran', 'jabatan', atau 'status')
            const roleAsisten = j.DataAsisten?.role || 'Asisten'; 

            // 2. Cek apakah RPS & Kontrak ada
            const hasRps = !!(j.LaporanRps && j.LaporanRps.file_rps);
            const hasKontrak = !!(j.LaporanKontrak && j.LaporanKontrak.file_kontrak);
            
            // 3. Masukkan nama asisten pemegang jadwal ini
            const rpsUploaderNama = hasRps ? namaAsisten : null;
            const rpsUploaderRole = hasRps ? roleAsisten : null; 

            const kontrakUploaderNama = hasKontrak ? namaAsisten : null;
            const kontrakUploaderRole = hasKontrak ? roleAsisten : null;

            // 4. Hitung Laporan Kegiatan
            const laporanList = j.LaporanKegiatans || j.LaporanKegiatan || [];
            const lastLaporan = laporanList.length > 0 ? laporanList[laporanList.length - 1] : null;
            
            return {
                id_jadwal: j.id_jadwal,
                nama_mk: j.Kelas?.nama_mk || 'Tidak diketahui',
                nama_kelas: j.Kelas?.nama_kelas || '-',
                hari: j.hari_jam || j.hari || '-', 
                
                rps_uploaded: hasRps,
                rps_uploader_nama: rpsUploaderNama,
                rps_uploader_role: rpsUploaderRole,
                
                kontrak_uploaded: hasKontrak,
                kontrak_uploader_nama: kontrakUploaderNama,
                kontrak_uploader_role: kontrakUploaderRole,
                
                total_laporan: laporanList.length,
                // Jika ada laporan terakhir, tampilkan nama asisten penjaga jadwal ini
                last_laporan_nama: lastLaporan ? namaAsisten : '-',
                last_laporan_role: lastLaporan ? roleAsisten : '-'
            };
        });
    });

    // === LIFECYCLE ===
    onMounted(() => {
        fetchJadwal();
    });

    // === RETURN ===
    return {
        // Return semua state
        isSidebarOpen, activeTab, jadwalList, isLoading,
        formHarian, formSemester,
        fileInputAbsRef, fileInputModulRef, fileInputRpsRef, fileInputKontrakRef,
        handleFileChange, submitLaporanHarian, submitRps, submitKontrak,
        searchQuery, isDropdownOpen, filteredJadwalList, selectJadwal, toggleDropdown,
        searchQuerySemester, isDropdownOpenSemester, filteredJadwalSemester, selectJadwalSemester, toggleDropdownSemester,
        
        // Return tab status baru
        jadwalStatusList
    };
}