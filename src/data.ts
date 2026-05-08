import doorClosed from '../Gambar/Pintu Tutup.png';
import doorOpen from '../Gambar/Pintu Buka.png';
import scenarioRead from '../Gambar/Pembacaan Skenario.png';
import examRoom from '../Gambar/Opsi Pemeriksaan.png';
import nuchalRigidity from '../Gambar/Nuchal Rigidity.png';
import nuchalRigidity2 from '../Gambar/Nuchal Rigidity 2.png';
import brudzinskiI from '../Gambar/Brudzinski I.png';
import brudzinskiII from '../Gambar/Brudzinski II.png';
import kernigSign from '../Gambar/Kernig Sign.png';
import requestPenunjang from '../Gambar/Request Penunjang.png';

export interface DialogNode {
  speaker: string;
  text: string;
  bg?: string;
  sprite?: string;
}

export interface CheckOption {
  id: string;
  label: string;
  isCorrect: boolean;
}

export interface ActionOption {
  id: string;
  label: string;
  dialog: DialogNode;
  clipboardEntry: string;
  checkPrompt?: string;
  checkOptions?: CheckOption[];
  wrongFeedback?: string;
}

export const SCENARIO_DATA = {
  stageBg: {
    doorClosed,
    doorOpen,
    scenarioRead,
    examRoom,
  },
  introDialog: [
    {
      speaker: 'Skenario Klinis',
      text: 'Seorang laki-laki berusia 35 tahun, Tn. R, dibawa oleh keluarganya ke IGD dengan keluhan nyeri kepala hebat yang memberat sejak 3 hari yang lalu.',
      bg: doorOpen,
    },
    {
      speaker: 'Skenario Klinis',
      text: 'Keluarga pasien menyatakan bahwa Tn. R juga mengalami demam tinggi yang naik turun, mual, dan sempat muntah menyemprot satu kali pagi ini.',
      bg: scenarioRead,
    },
    {
      speaker: 'Skenario Klinis',
      text: 'Pasien tampak gelisah, lebih sering menutup mata karena silau saat terkena cahaya lampu IGD, dan kesadarannya tampak sedikit menurun. Riwayat trauma kepala atau kejang disangkal.',
      bg: scenarioRead,
    },
    {
      speaker: 'Dokter Penguji',
      text: 'Tugas Anda:\n1. Lakukan pemeriksaan yang sesuai dengan gejala pasien.\n2. Usulkan pemeriksaan penunjang.\n3. Tentukan diagnosis kerja dan banding.',
      bg: examRoom,
    }
  ],
  fisikOptions: [
    {
      id: 'kakuKuduk',
      label: 'Pemeriksaan Kaku Kuduk',
      dialog: {
        speaker: 'Dokter Penguji',
        text: 'Saat Anda melakukan fleksi leher pasien secara pasif, terasa tahanan yang sangat kuat. Dagu pasien tidak dapat menyentuh dada, tersisa jarak sekitar 3 jari, dan Anda merasakan adanya spasme pada otot servikal.',
        bg: nuchalRigidity2,
      },
      clipboardEntry: 'Kaku Kuduk: Positif (+)',
      checkPrompt: 'Status apa yang Anda cari dalam pemeriksaan kaku kuduk?',
      checkOptions: [
        { id: 'kekakuanLeher', label: 'Kekakuan otot leher', isCorrect: true },
        { id: 'sensasiKulit', label: 'Gangguan sensasi kulit leher', isCorrect: false },
        { id: 'kekuatanLengan', label: 'Kekuatan otot lengan', isCorrect: false }
      ],
      wrongFeedback: 'Fokus pada kekakuan otot leher saat fleksi pasif.'
    },
    {
      id: 'brudI',
      label: 'Pemeriksaan Brudzinski I',
      dialog: {
        speaker: 'Dokter Penguji',
        text: 'Bersamaan dengan fleksi leher yang Anda provokasi tadi, Anda mengamati bahwa kedua tungkai pasien secara involunter ikut mengalami fleksi pada sendi panggul dan lutut.',
        bg: brudzinskiI,
      },
      clipboardEntry: 'Brudzinski I: Positif (+)',
      checkPrompt: 'Status apa yang Anda cari dalam Brudzinski I?',
      checkOptions: [
        { id: 'fleksiTungkai', label: 'Fleksi involunter kedua tungkai', isCorrect: true },
        { id: 'refleksPlantar', label: 'Refleks plantar', isCorrect: false },
        { id: 'koordinasiGerak', label: 'Koordinasi gerak tungkai', isCorrect: false }
      ],
      wrongFeedback: 'Anda harus fokus mengamati fleksi involunter kedua tungkai selama fleksi leher.'
    },
    {
      id: 'brudII',
      label: 'Pemeriksaan Brudzinski II',
      dialog: {
        speaker: 'Dokter Penguji',
        text: 'Anda memfleksikan salah satu tungkai pasien pada sendi panggul dan lutut. Saat Anda melakukannya, terlihat jelas bahwa tungkai kontralateral yang sedang lurus ikut mengalami fleksi secara otomatis.',
        bg: brudzinskiII,
      },
      clipboardEntry: 'Brudzinski II: Positif (+)',
      checkPrompt: 'Status apa yang Anda cari dalam Brudzinski II?',
      checkOptions: [
        { id: 'fleksiKontralateral', label: 'Fleksi kontralateral tungkai yang lurus', isCorrect: true },
        { id: 'refleksAchilles', label: 'Refleks Achilles', isCorrect: false },
        { id: 'tonusOtot', label: 'Tonus otot umum', isCorrect: false }
      ],
      wrongFeedback: 'Perhatikan apakah tungkai kontralateral ikut fleksi saat satu tungkai difleksikan.'
    },
    {
      id: 'kernig',
      label: 'Pemeriksaan Tanda Kernig',
      dialog: {
        speaker: 'Dokter Penguji',
        text: 'Anda memfleksikan panggul dan lutut pasien hingga 90 derajat, lalu mencoba mengekstensikan tungkai bawahnya. Terdapat tahanan keras dan pasien mengeluh nyeri pada paha belakang sebelah hamstring, ekstensi terhenti pada sudut 110 derajat.',
        bg: kernigSign,
      },
      clipboardEntry: 'Kernig: Positif (+), tahanan < 135°',
      checkPrompt: 'Status apa yang Anda cari dalam Tanda Kernig?',
      checkOptions: [
        { id: 'nyeriHamstring', label: 'Nyeri pada hamstring saat ekstensi', isCorrect: true },
        { id: 'bengkakSendi', label: 'Pembengkakan sendi lutut', isCorrect: false },
        { id: 'pinggangKaku', label: 'Kekakuan pinggang', isCorrect: false }
      ],
      wrongFeedback: 'Pemeriksaan Kernig menguji nyeri hamstring dengan ekstensi tungkai bawah.'
    }
  ],
  penunjangOptions: [
    {
      id: 'lumbal',
      label: 'Pungsi Lumbal (Analisa LCS)',
      dialog: {
        speaker: 'Dokter Penguji',
        text: 'Hasil analisa cairan serebrospinal (LCS) menunjukkan warna keruh, opening pressure 250 mmH2O, pleositosis dominan PMN, protein tinggi, dan glukosa menurun ekstrim.',
        bg: requestPenunjang,
      },
      clipboardEntry: 'Pungsi Lumbal: Indikasi infeksi bakterial.',
      checkPrompt: 'Status apa yang ingin Anda konfirmasi dengan pungsi lumbal?',
      checkOptions: [
        { id: 'tekananTinggi', label: 'Peningkatan tekanan dan pleositosis', isCorrect: true },
        { id: 'kadarGulaDarah', label: 'Kadar glukosa darah sistemik', isCorrect: false },
        { id: 'fungsiGinjal', label: 'Fungsi ginjal', isCorrect: false }
      ],
      wrongFeedback: 'Pungsi lumbal digunakan untuk menilai tekanan LCS dan tanda infeksi pada cairan serebrospinal.'
    },
    {
      id: 'ctscan',
      label: 'CT Scan Kepala',
      dialog: {
        speaker: 'Dokter Penguji',
        text: 'CT Scan kepala non-kontras menunjukkan edema serebri ringan namun tidak ada tanda perdarahan (SAH) atau Space Occupying Lesion (SOL).',
        bg: requestPenunjang,
      },
      clipboardEntry: 'CT Scan: Edema serebri ringan.',
      checkPrompt: 'Status apa yang ingin Anda lihat dengan CT Scan kepala?',
      checkOptions: [
        { id: 'tandaPerdarahan', label: 'Tanda perdarahan atau SOL', isCorrect: true },
        { id: 'kadarElektrolit', label: 'Kadar elektrolit serum', isCorrect: false },
        { id: 'detakJantung', label: 'Detak jantung', isCorrect: false }
      ],
      wrongFeedback: 'CT Scan kepala utama digunakan untuk mencari perdarahan atau massa ruang dalam kepala.'
    }
  ],
  konklusi: {
    dk: {
      question: 'Diagnosis Kerja',
      options: [
        { id: 'dk1', label: 'Meningitis Bakterialis', isCorrect: true },
        { id: 'dk2', label: 'Perdarahan Subaraknoid', isCorrect: false },
        { id: 'dk3', label: 'Ensefalitis Viral', isCorrect: false }
      ]
    },
    dd: {
      question: 'Diagnosis Banding',
      options: [
        { id: 'dd1', label: 'Ensefalitis Viral', isCorrect: true },
        { id: 'dd2', label: 'Meningitis Tuberkulosis', isCorrect: true },
        { id: 'dd3', label: 'Stroke Iskemik', isCorrect: false },
        { id: 'dd4', label: 'Tumor Otak', isCorrect: false },
        { id: 'dd5', label: 'TIA (Transient Ischemic Attack)', isCorrect: false },
        { id: 'dd6', label: 'Migrain', isCorrect: false }
      ]
    },
    tatalaksana: {
      question: 'Tatalaksana Awal',
      options: [
        { id: 'tx1', label: 'Antibiotik empiris + Kortikosteroid + Suportif', isCorrect: true },
        { id: 'tx2', label: 'Antikoagulan + Antiplatelet', isCorrect: false },
        { id: 'tx3', label: 'Analgesik + Observasi rawat jalan', isCorrect: false }
      ]
    }
  }
};
