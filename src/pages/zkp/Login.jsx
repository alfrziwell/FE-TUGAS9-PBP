import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import * as snarkjs from 'snarkjs';
import { buildPoseidon } from 'circomlibjs';

const CONTRACT_ADDRESS = "0x2Ee4C369817d0875A521E841971838593cc9425b";
const CONTRACT_ABI = [
  "function registerUser(string memory _username, string memory _fullName, uint256 _passwordHash) public",
  "function loginUser(string memory _username, uint256[2] calldata a, uint256[2][2] calldata b, uint256[2] calldata c, uint256[1] calldata input) public returns (bool)",
  "function getUserProfile(string memory _username) public view returns (string memory fullName, string memory username)"
];

const ZKP_FIELD_PRIME = 21888242871839275222246405745257275088548364400416034343698204186575808495617n;

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
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
      // a. Hubungkan ke MetaMask (untuk instansiasi contract dengan signer)
      if (!window.ethereum) {
        throw new Error('MetaMask tidak terdeteksi. Silakan pasang ekstensi MetaMask.');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();

      // b. Ubah password ke BigInt menggunakan metode yang SAMA PERSIS dengan di halaman Register.
      addLog('Mengonversi password ke format BigInt...');
      setStatusMessage('Mengonversi password & menghitung ZK-Hash...');
      const sha256Hash = ethers.sha256(ethers.toUtf8Bytes(formData.password));
      const passwordBigInt = BigInt(sha256Hash) % ZKP_FIELD_PRIME;

      // Hitung Poseidon hash untuk masukan sirkuit
      const poseidon = await buildPoseidon();
      const poseidonHash = poseidon([passwordBigInt]);
      const passwordHashBigInt = BigInt(poseidon.F.toString(poseidonHash));

      // c. Buat ZK-Proof secara asynchronous menggunakan file di public folder
      addLog('Mengambil file circuit.wasm & circuit_final.zkey...');
      addLog('Men-generate Zero-Knowledge Proof secara lokal (SnarkJS)...');
      setStatusMessage('Membuat ZK-Proof secara asinkron di browser Anda (memerlukan waktu)...');

      const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        { password: passwordBigInt.toString(), passwordHash: passwordHashBigInt.toString() },
        "/circuit.wasm",
        "/circuit_final.zkey"
      );

      // d. Ekstrak calldata Solidity
      addLog('Proof berhasil dibuat! Mengekstrak calldata...');
      setStatusMessage('Mengekstrak calldata Solidity untuk blockchain...');
      const callData = await snarkjs.groth16.exportSolidityCallData(proof, publicSignals);

      // e. Parse calldata dengan benar menjadi array untuk ethers
      // Format callData adalah string: "a[0], a[1], [[b[0][0], b[0][1]], [b[1][0], b[1][1]]], c[0], c[1], [input[0]]"
      // Kita membungkus string ini dalam array [] lalu mem-parse sebagai JSON
      const jsonCalldata = JSON.parse("[" + callData + "]");
      const a = jsonCalldata[0];
      const b = jsonCalldata[1];
      const c = jsonCalldata[2];
      const input = jsonCalldata[3];

      // f. Panggil fungsi contract: loginUser. Tunggu tx.wait().
      addLog('Mengirim transaksi ke Smart Contract di Sepolia...');
      setStatusMessage('Mengirim transaksi verifikasi ZKP ke blockchain...');
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const tx = await contract.loginUser(formData.username, a, b, c, input);

      addLog('Menunggu konfirmasi blok...');
      setStatusMessage('Menunggu verifikasi ZKP oleh Smart Contract...');
      const receipt = await tx.wait();

      if (receipt.status === 1) {
        addLog('Verifikasi ZKP Sukses! Mengarahkan ke Dashboard...');
        setSuccess('Verifikasi ZK-Proof Berhasil! Mengalihkan ke Dashboard...');

        // g. Simpan username ke localStorage sebagai penanda sesi login
        localStorage.setItem('zkp_username', formData.username);

        setTimeout(() => {
          navigate('/zkp/dashboard');
        }, 1500);
      } else {
        throw new Error('Transaksi verifikasi ZKP gagal di blockchain.');
      }

    } catch (err) {
      console.error(err);
      const errMsg = err.code === 'ACTION_REJECTED'
        ? 'Transaksi ditolak oleh pengguna di MetaMask.'
        : err.message && err.message.includes('Assert Failed')
          ? 'Gagal membuktikan kepemilikan kata sandi. Password Anda salah.'
          : err.message || 'Gagal melakukan autentikasi ZKP. Silakan periksa kembali username/password Anda.';
      addLog(`Error: ${errMsg}`);
      if (err.code === 'ACTION_REJECTED') {
        setError('Transaksi ditolak oleh pengguna di MetaMask.');
      } else if (err.message && err.message.includes('Assert Failed')) {
        setError('Gagal membuktikan kepemilikan kata sandi. Password Anda salah.');
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Gagal melakukan autentikasi ZKP. Silakan periksa kembali username/password Anda.');
      }
    } finally {
      setLoading(false);
      setStatusMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-primary font-poppins text-secondary flex flex-col justify-center items-center px-4 overflow-hidden relative selection:bg-accent selection:text-secondary">

      {/* Background shapes */}
      <div className="absolute top-[-10%] right-[-10%] w-[35vw] h-[35vw] rounded-full bg-accent/30 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[35vw] h-[35vw] rounded-full bg-accent/40 blur-[80px] pointer-events-none" />

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
            <h2 className="text-2xl font-extrabold tracking-tight">Masuk ZKP</h2>
            <span className="px-2 py-0.5 text-[10px] font-bold text-primary bg-secondary rounded-full uppercase tracking-wider">
              Web3
            </span>
          </div>
          <p className="text-xs text-secondary/60 mt-1 font-light">
            Masuk secara aman tanpa mengungkapkan password asli Anda ke server
          </p>
        </div>

        {/* Status Message */}
        {loading && statusMessage && (
          <div className="mb-4 p-3 bg-accent/20 border-l-4 border-secondary rounded-r-lg text-xs text-secondary flex items-center space-x-2">
            <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-secondary shrink-0"></div>
            <span className="leading-snug">{statusMessage}</span>
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
              Username
            </label>
            <input
              type="text"
              name="username"
              required
              disabled={loading}
              placeholder="Masukkan username Anda"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-secondary/20 bg-primary/45 focus:bg-white focus:border-secondary focus:outline-none text-sm transition-all duration-200"
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
            {loading ? 'Memproses Proof & Transaksi...' : 'Hubungkan & Masuk (ZKP)'}
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
          Belum punya akun?{' '}
          <Link to="/zkp/register" className="font-semibold text-secondary hover:underline">
            Daftar dengan ZKP di sini
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

export default Login;