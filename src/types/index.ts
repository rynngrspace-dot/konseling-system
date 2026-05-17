export interface Siswa {
  id: string;
  nis: string;
  nama: string;
  kelas: string | null;
  jenis_kelamin: string;
}

export interface NilaiAkademikRecord {
  id: string;
  siswaId: string;
  semester: number;
  mata_pelajaran: string;
  nilai: number;
}

export interface SiswaWithNilai extends Siswa {
  nilaiAkademik: NilaiAkademikRecord[];
}

export interface StudentClientProps {
  students: Siswa[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  initialQuery: string;
  initialKelas: string;
}

export interface NilaiClientProps {
  students: SiswaWithNilai[];
  allStudents: SiswaWithNilai[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  initialQuery: string;
  initialKelas: string;
  initialSemester: number;
}

export interface MinatBakatRecord {
  id: string;
  siswaId: string;
  minat: string;
  bakat: string;
  detailTes: any; // { dominan: string; mbti: string }
  createdAt: any;
  updatedAt: any;
}

export interface SiswaWithMinatBakat extends Siswa {
  minatBakat: MinatBakatRecord[];
}

export interface MinatBakatClientProps {
  students: SiswaWithMinatBakat[];
  allStudents: SiswaWithMinatBakat[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  initialQuery: string;
  initialKelas: string;
}

export interface RiwayatKasusRecord {
  id: string;
  siswaId: string;
  guruId: string;
  tanggal: Date;
  kategori: any; // KategoriKasus
  jenis_kasus: string;
  keterangan: string;
  status: any; // StatusKasus
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SiswaOption {
  id: string;
  nama: string;
  nis: string;
  kelas: string | null;
}

export interface GuruBkRecord {
  id: string;
  nama: string;
  nip: string;
}

export interface RiwayatKasusWithSiswa extends RiwayatKasusRecord {
  siswa: SiswaOption;
  guruBk: GuruBkRecord;
}

