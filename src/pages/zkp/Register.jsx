import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { buildPoseidon } from 'circomlibjs';

const CONTRACT_ADDRESS = "0x2Ee4C369817d0875A521E841971838593cc9425b";
const CONTRACT_ABI = [
  "function registerUser(string memory _username, string memory _fullName, uint256 _passwordHash) public",
  "function loginUser(string memory _username, uint256[2] calldata a, uint256[2][2] calldata b, uint256[2] calldata c, uint256[1] calldata input) public returns (bool)",
  "function getUserProfile(string memory _username) public view returns (string memory fullName, string memory username)"
];

const ZKP_FIELD_PRIME = 21888242871839275222246405745257275088548364400416034343698204186575808495617n;

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nama_lengkap: '',
    username: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [logs, setLogs] = useState([]);
  const terminalRef = useRef(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  const addLog = (message) => {
    setLogs((prevLogs) => [...prevLogs, message]);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    setLogs([]);
    addLog('Menghubungkan ke MetaMask...');
    setStatusMessage('Menghubungkan ke MetaMask...');

    try {
      // a. Hubungkan ke MetaMask pengguna dengan BrowserProvider ethers v6.
      if (!window.ethereum) {
        throw new Error('MetaMask tidak terdeteksi. Silakan pasang ekstensi MetaMask.');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // Request account access if needed
      await provider.send("eth_requestAccounts", []);
      
      const signer = await provider.getSigner();

      // b. Ubah password menjadi format BigInt yang kompatibel dengan ZKP (hash string ke sha256 lalu convert hasil hex-nya ke BigInt).
      addLog('Mengonversi password ke format BigInt...');
      addLog('Menghitung Poseidon hash untuk password...');
      setStatusMessage('Mengonversi password ke BigInt & menghitung ZK-Hash...');
      const sha256Hash = ethers.sha256(ethers.toUtf8Bytes(formData.password));
      const passwordBigInt = BigInt(sha256Hash) % ZKP_FIELD_PRIME;

      // Hitung Poseidon Hash dari passwordBigInt agar kompatibel dengan sirkuit ZKP
      const poseidon = await buildPoseidon();
      const poseidonHash = poseidon([passwordBigInt]);
      const passwordHashBigInt = BigInt(poseidon.F.toString(poseidonHash));

      // c. Instansiasi contract dengan signer dan panggil fungsi: registerUser
      addLog('Mengirim transaksi ke Smart Contract di Sepolia...');
      setStatusMessage('Mengirim transaksi ke blockchain Sepolia...');
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      
      const tx = await contract.registerUser(
        formData.username,
        formData.nama_lengkap,
        passwordHashBigInt
      );

      // d. Tunggu tx.wait(). Saat loading tampilkan indikator.
      addLog('Menunggu konfirmasi blok...');
      setStatusMessage('Menunggu konfirmasi transaksi di blockchain...');
      const receipt = await tx.wait();

      if (receipt.status === 1) {
        addLog('Registrasi ZKP Sukses! Mengarahkan ke Halaman Login...');
        setSuccess('Registrasi ZKP berhasil! Mengalihkan ke Halaman Login...');
        setFormData({ nama_lengkap: '', username: '', password: '' });
        setTimeout(() => {
          navigate('/zkp/login');
        }, 2000);
      } else {
        throw new Error('Transaksi gagal dikonfirmasi di blockchain.');
      }

    } catch (err) {
      console.error(err);
      const errMsg = err.code === 'ACTION_REJECTED'
        ? 'Transaksi ditolak oleh pengguna di MetaMask.'
        : err.message || 'Terjadi kesalahan saat pendaftaran. Silakan coba lagi.';
      addLog(`Error: ${errMsg}`);
      if (err.code === 'ACTION_REJECTED') {
        setError('Transaksi ditolak oleh pengguna di MetaMask.');
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Terjadi kesalahan saat pendaftaran. Silakan coba lagi.');
      }
    } finally {
      setLoading(false);
      setStatusMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-primary font-poppins text-secondary flex flex-col justify-center items-center px-4 overflow-hidden relative selection:bg-accent selection:text-secondary">

      {/* Background shapes */}
      <div className="absolute top-[-10%] left-[-10%] w-[35vw] h-[35vw] rounded-full bg-accent/30 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[35vw] h-[35vw] rounded-full bg-accent/40 blur-[80px] pointer-events-none" />

      {/* Main card */}
      <div className="w-full max-w-md bg-white/70 backdrop-blur-lg border border-secondary/10 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 relative z-10">

        {/* Logo / Header */}
        <div className="text-center mb-5">
          <Link to="/" className="inline-flex items-center space-x-2 mb-2 group">
            <div className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center text-primary font-bold">
              A
            </div>
            <span className="font-bold text-lg text-secondary">Alif Alfarizi</span>
          </Link>
          <div className="flex items-center justify-center space-x-2 mb-1">
            <h2 className="text-2xl font-extrabold tracking-tight">Daftar ZKP</h2>
            <span className="px-2 py-0.5 text-[10px] font-bold text-primary bg-secondary rounded-full uppercase tracking-wider">
              Web3
            </span>
          </div>
          <p className="text-xs text-secondary/60 mt-1 font-light">
            Daftarkan profil terdesentralisasi Anda menggunakan metode ZKP
          </p>
        </div>

        {/* Status Message */}
        {loading && statusMessage && (
          <div className="mb-4 p-3 bg-accent/20 border-l-4 border-secondary rounded-r-lg text-xs text-secondary flex items-center space-x-2">
            <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-secondary"></div>
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Notifications */}
        {error && (
          <div className="mb-4 p-3.5 bg-red-50 border-l-4 border-red-500 rounded-r-lg text-xs text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3.5 bg-green-50 border-l-4 border-green-500 rounded-r-lg text-xs text-green-700 animate-pulse">
            {success}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-secondary/80 mb-1.5 uppercase tracking-wide">
              Nama Lengkap
            </label>
            <input
              type="text"
              name="nama_lengkap"
              required
              disabled={loading}
              placeholder="Masukkan nama lengkap Anda"
              value={formData.nama_lengkap}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-secondary/20 bg-primary/45 focus:bg-white focus:border-secondary focus:outline-none text-sm transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-secondary/80 mb-2 uppercase tracking-wide">
              Username
            </label>
            <input
              type="text"
              name="username"
              required
              disabled={loading}
              placeholder="Pilih username unik"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-secondary/20 bg-primary/45 focus:bg-white focus:border-secondary focus:outline-none text-sm transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-secondary/80 mb-2 uppercase tracking-wide">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              disabled={loading}
              placeholder="Masukkan password Anda"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-secondary/20 bg-primary/45 focus:bg-white focus:border-secondary focus:outline-none text-sm transition-all duration-200"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 mt-1 rounded-xl text-primary bg-secondary hover:bg-secondary/95 font-semibold text-sm transition-all shadow-sm hover:shadow active:scale-[0.98] ${loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
          >
            {loading ? 'Memproses Transaksi...' : 'Hubungkan & Daftar'}
          </button>

          {/* Live Terminal Logs */}
          {logs.length > 0 && (
            <div
              ref={terminalRef}
              className="bg-slate-900 text-green-400 font-mono text-xs p-3 rounded-md h-32 overflow-y-auto mt-4 text-left border border-slate-800"
            >
              {logs.map((log, index) => (
                <div key={index} className="leading-relaxed">
                  <span className="text-green-500/50 mr-1.5">&gt;</span>
                  {log}
                </div>
              ))}
            </div>
          )}
        </form>

        {/* Footer info */}
        <div className="mt-5 text-center text-xs text-secondary/60 font-light">
          Sudah punya akun?{' '}
          <Link to="/zkp/login" className="font-semibold text-secondary hover:underline">
            Masuk dengan ZKP di sini
          </Link>
        </div>

      </div>

      {/* Back to Home */}
      <Link to="/" className="mt-4 text-xs text-secondary/60 hover:text-secondary flex items-center space-x-1.5 transition-colors relative z-10">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span>Kembali ke Halaman Utama</span>
      </Link>

    </div>
  );
};

export default Register;