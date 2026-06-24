import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-primary font-poppins text-secondary flex flex-col justify-between selection:bg-accent selection:text-secondary overflow-hidden relative">

      {/* Subtle background circles for depth */}
      <div className="absolute top-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-accent/40 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[35vw] h-[35vw] rounded-full bg-accent/30 blur-[80px] pointer-events-none" />

      {/* Header */}
      <header className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between border-b border-secondary/10 relative z-10">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center shadow-md">
            <span className="font-extrabold text-primary text-xl">A</span>
          </div>
          <span className="font-bold text-xl tracking-tight text-secondary">
            Alif Alfarizi
          </span>
        </div>
        <div className="px-4 py-1.5 rounded-full bg-accent text-xs font-semibold text-secondary tracking-wide uppercase">
          Tugas 9 PBP
        </div>
      </header>

      {/* Hero / Portal Selection */}
      <main className="grow max-w-6xl mx-auto px-6 py-12 flex flex-col items-center justify-center text-center relative z-10 w-full">

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 max-w-3xl leading-tight">
          Pilih Metode Autentikasi
        </h1>

        {/* Subtitle */}
        <p className="text-secondary/70 text-base md:text-lg max-w-xl mb-12 font-light">
          Silakan pilih gerbang autentikasi di bawah ini untuk memulai proses pendaftaran akun baru Anda.
        </p>

        {/* Choice Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">

          {/* Card 1: Konvensional */}
          <div className="p-8 rounded-2xl bg-white/70 border border-secondary/10 shadow-sm backdrop-blur-md hover:shadow-md hover:border-accent transition-all group duration-300 flex flex-col justify-between text-left">
            <div>
              {/* Card Icon */}
              <div className="h-12 w-12 rounded-xl bg-accent/40 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300">
                <svg className="h-6 w-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>

              {/* Heading & Paragraph */}
              <h3 className="text-xl font-bold text-secondary mb-3">Metode Konvensional</h3>
              <p className="text-sm text-secondary/70 font-light leading-relaxed mb-6">
                Sistem pendaftaran dan login standar menggunakan password yang dienkripsi dan diverifikasi langsung melalui database backend RESTful API.
              </p>
            </div>

            {/* CTA Button */}
            <Link
              to="/konvensional/register"
              className="mt-4 px-6 py-3 font-semibold text-center text-primary bg-secondary hover:bg-secondary/95 rounded-xl shadow-sm hover:shadow transition-all duration-200 active:scale-[0.98]"
            >
              Pilih Konvensional
            </Link>
          </div>

          {/* Card 2: Zero Knowledge Proof */}
          <div className="p-8 rounded-2xl bg-accent/30 border border-secondary/15 shadow-sm backdrop-blur-md hover:shadow-md hover:border-accent transition-all group duration-300 flex flex-col justify-between text-left relative overflow-hidden">
            {/* Visual Highlight Badge */}
            <div className="absolute top-0 right-0 bg-secondary text-primary text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-bl-xl">
              Advanced
            </div>

            <div>
              {/* Card Icon */}
              <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300">
                <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>

              {/* Heading & Paragraph */}
              <h3 className="text-xl font-bold text-secondary mb-3">Zero Knowledge Proof</h3>
              <p className="text-sm text-secondary/70 font-light leading-relaxed mb-6">
                Metode kriptografi modern yang memungkinkankan pembuktian kata sandi tanpa perlu mengirimkan kata sandi asli tersebut ke server.
              </p>
            </div>

            {/* CTA Button */}
            <Link
              to="/zkp/register"
              className="mt-4 px-6 py-3 font-semibold text-center text-primary bg-secondary hover:bg-secondary/95 rounded-xl shadow-sm hover:shadow transition-all duration-200 active:scale-[0.98]"
            >
              Pilih ZKP
            </Link>
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl mx-auto px-6 py-6 border-t border-secondary/10 flex flex-col sm:flex-row justify-between items-center text-xs text-secondary/60 relative z-10">
        <p>&copy; {new Date().getFullYear()} Alif Alfarizi - PBP Tugas 9. All rights reserved.</p>
        <div className="flex space-x-6 mt-3 sm:mt-0">
          <span className="font-medium">International Women University</span>
        </div>
      </footer>

    </div>
  );
};

export default Home;
