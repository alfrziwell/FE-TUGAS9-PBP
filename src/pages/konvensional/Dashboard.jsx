import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, logout } from '../../api/auth';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getProfile();
        if (response.success) {
          setUser(response.data);
        } else {
          navigate('/konvensional/login');
        }
      } catch (err) {
        navigate('/konvensional/login');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/konvensional/login');
    } catch (err) {
      // In case api logout fails, the helper still removes the local storage token, so we can redirect safely
      navigate('/konvensional/login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-primary font-poppins text-secondary flex flex-col justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mb-4"></div>
        <p className="text-sm text-secondary/60">Memuat profil Anda...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary font-poppins text-secondary flex flex-col justify-between selection:bg-accent selection:text-secondary overflow-hidden relative">

      {/* Background shape */}
      <div className="absolute top-[-10%] left-[-10%] w-[35vw] h-[35vw] rounded-full bg-accent/25 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[35vw] h-[35vw] rounded-full bg-accent/30 blur-[100px] pointer-events-none" />

      {/* Navigation */}
      <header className="w-full max-w-6xl mx-auto px-6 py-4 flex items-center justify-between border-b border-secondary/10 relative z-10">
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center text-primary font-bold shadow-sm">
            A
          </div>
          <span className="font-bold text-lg text-secondary">Alif Alfarizi</span>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-xs font-semibold text-primary bg-secondary hover:bg-secondary/90 rounded-lg shadow-sm hover:shadow transition-all duration-200 active:scale-[0.98]"
        >
          Keluar (Logout)
        </button>
      </header>

      {/* Main Panel */}
      <main className="grow max-w-6xl mx-auto px-6 py-8 flex flex-col justify-center items-center relative z-10 w-full">

        {/* Welcome Banner */}
        <div className="w-full max-w-2xl bg-white/70 border border-secondary/10 backdrop-blur-md p-6 rounded-2xl shadow-sm mb-6 text-center sm:text-left flex flex-col sm:flex-row items-center sm:space-x-5">
          <div className="h-14 w-14 rounded-2xl bg-accent flex items-center justify-center mb-3 sm:mb-0">
            <svg className="h-8 w-8 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-secondary mb-1">
              Selamat Datang, {user?.nama_lengkap}!
            </h1>
            <p className="text-sm text-secondary/60 font-light">
              Anda berhasil masuk ke dashboard dengan otentikasi JWT secara konvensional.
            </p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="w-full max-w-2xl grid grid-cols-1 gap-6">

          {/* Profile Details */}
          <div className="p-6 rounded-2xl bg-white/70 border border-secondary/10 backdrop-blur-md shadow-sm">
            <h3 className="text-lg font-bold text-secondary mb-4 flex items-center space-x-2">
              <svg className="h-5 w-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
              </svg>
              <span>Detail Akun Anda</span>
            </h3>

            <div className="divide-y divide-secondary/10 text-sm">
              <div className="py-2.5 flex justify-between">
                <span className="text-secondary/60 font-light">Nama Lengkap</span>
                <span className="font-semibold">{user?.nama_lengkap}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-secondary/60 font-light">Username</span>
                <span className="font-semibold text-secondary">{user?.username}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-secondary/60 font-light">Metode Registrasi</span>
                <span className="font-semibold px-2 py-0.5 rounded-full bg-accent text-xs">
                  Konvensional
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-secondary/60 font-light">Waktu Mendaftar</span>
                <span className="font-semibold">
                  {user?.created_at ? new Date(user.created_at).toLocaleString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  }) : '-'}
                </span>
              </div>
            </div>
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl mx-auto px-6 py-4 border-t border-secondary/10 flex flex-col sm:flex-row justify-between items-center text-xs text-secondary/60 relative z-10">
        <p>&copy; {new Date().getFullYear()} Alif Alfarizi - PBP Tugas 9. All rights reserved.</p>
        <div className="flex space-x-6 mt-3 sm:mt-0">
          <span className="font-medium">International Women University</span>
        </div>
      </footer>

    </div>
  );
};

export default Dashboard;