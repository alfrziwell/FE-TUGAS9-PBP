import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../../api/auth';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nama_lengkap: '',
    username: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

    try {
      const data = await register(
        formData.nama_lengkap,
        formData.username,
        formData.password
      );

      if (data.success) {
        setSuccess('Registrasi berhasil! Mengalihkan ke halaman Login...');
        setTimeout(() => {
          navigate('/konvensional/login');
        }, 1500);
      } else {
        setError(data.message || 'Registrasi gagal.');
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.errors) {
        // Collect validation errors
        const validationErrors = Object.values(err.response.data.errors).flat().join(' ');
        setError(validationErrors);
      } else if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Terjadi kesalahan. Silakan coba lagi nanti.');
      }
    } finally {
      setLoading(false);
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
          <h2 className="text-2xl font-extrabold tracking-tight">Daftar Konvensional</h2>
          <p className="text-xs text-secondary/60 mt-1 font-light">
            Buat akun baru menggunakan metode konvensional
          </p>
        </div>

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
              placeholder="Masukkan password minimal 6 karakter"
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
            {loading ? 'Mendaftarkan Akun...' : 'Daftar Sekarang'}
          </button>
        </form>

        {/* Footer info */}
        <div className="mt-5 text-center text-xs text-secondary/60 font-light">
          Sudah punya akun?{' '}
          <Link to="/konvensional/login" className="font-semibold text-secondary hover:underline">
            Masuk di sini
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