import { Link } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";

function LandingPage() {
  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-black text-white' : 'bg-white text-black'}`}>
      {/* Hero Section */}
      <div className={`relative overflow-hidden ${isDark ? 'bg-black' : 'bg-white'}`}>
        <div className={`absolute inset-0 ${isDark ? 'bg-black opacity-30' : ''}`}></div>
        <div className={`relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center ${isDark ? 'text-white' : 'text-black'}`}>
          <h1 className={`text-5xl md:text-7xl font-bold mb-6 animate-fade-in ${isDark ? 'text-white' : 'text-black'}`}>
            Ahmeng Marketplace
          </h1>
          <p className={`text-xl md:text-2xl mb-8 max-w-2xl animate-fade-in-delay ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Temukan produk terbaik dengan harga terjangkau. Belanja mudah, cepat, dan aman.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-delay-2">
            <Link
              to="/catalog"
              className={`px-8 py-4 rounded-full font-semibold text-lg hover:scale-105 transition duration-300 shadow-lg ${isDark ? 'bg-white text-gray-900 hover:bg-gray-100' : 'bg-black text-white hover:bg-gray-800'}`}
            >
              Mulai Belanja
            </Link>
            <Link
              to="/cart"
              className={`border-2 px-8 py-4 rounded-full font-semibold text-lg hover:scale-105 transition duration-300 ${isDark ? 'border-white text-white hover:bg-white hover:text-gray-900' : 'border-black text-black hover:bg-black hover:text-white'}`}
            >
              Lihat Keranjang
            </Link>
          </div>
        </div>
        <div className={`absolute bottom-0 left-0 right-0 h-32 ${isDark ? 'bg-gradient-to-t from-black to-transparent' : 'bg-gradient-to-t from-white to-transparent'}`}></div>
      </div>

      {/* Features Section */}
      <div className={`py-16 px-4 transition-colors duration-300 ${isDark ? 'bg-black' : 'bg-white'}`}>
        <div className="max-w-6xl mx-auto">
          <h2 className={`text-4xl font-bold text-center mb-12 ${isDark ? 'text-white' : 'text-gray-800'}`}>
            Mengapa Memilih Kami?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className={`text-center p-6 rounded-lg hover:shadow-xl transition duration-300 transform hover:-translate-y-2 ${isDark ? 'bg-gray-900 hover:bg-gray-800' : 'bg-gray-50 hover:bg-gray-100'}`}>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}>
                <svg className={`w-8 h-8 ${isDark ? 'text-white' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>Cepat & Mudah</h3>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Proses belanja yang simpel dan cepat tanpa ribet.</p>
            </div>
            <div className={`text-center p-6 rounded-lg hover:shadow-xl transition duration-300 transform hover:-translate-y-2 ${isDark ? 'bg-gray-900 hover:bg-gray-800' : 'bg-gray-50 hover:bg-gray-100'}`}>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}>
                <svg className={`w-8 h-8 ${isDark ? 'text-white' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>Aman & Terpercaya</h3>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Transaksi yang aman dengan sistem keamanan terbaik.</p>
            </div>
            <div className={`text-center p-6 rounded-lg hover:shadow-xl transition duration-300 transform hover:-translate-y-2 ${isDark ? 'bg-gray-900 hover:bg-gray-800' : 'bg-gray-50 hover:bg-gray-100'}`}>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}>
                <svg className={`w-8 h-8 ${isDark ? 'text-white' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>Harga Terbaik</h3>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Produk berkualitas dengan harga yang kompetitif.</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className={`py-16 px-4 transition-colors duration-300 ${isDark ? 'bg-black' : 'bg-white'}`}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className={`text-4xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-800'}`}>
            Siap Mulai Belanja?
          </h2>
          <p className={`text-xl mb-8 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Jelajahi katalog produk kami dan temukan yang Anda butuhkan.
          </p>
          <Link
            to="/catalog"
            className={`px-10 py-4 rounded-full font-semibold text-lg hover:scale-105 transition duration-300 shadow-lg inline-block ${isDark ? 'bg-gray-600 text-white hover:bg-gray-500' : 'bg-gray-800 text-white hover:bg-gray-900'}`}
          >
            Lihat Katalog
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;