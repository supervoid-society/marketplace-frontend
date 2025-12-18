import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import jsPDF from "jspdf";

const CRUD_URL = import.meta.env.VITE_CRUD_SERVICE_URL || 'http://localhost:8788';

function Cart({ cart, setCart, images }) {
  const { isDark } = useTheme();
  const [cartImages, setCartImages] = useState({});

  const formatRupiah = (angka) => {
    return 'Rp ' + angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  useEffect(() => {
    const fetchCartImages = async () => {
      for (const item of cart) {
        if (item.image_id && !cartImages[item.image_id] && !images[item.image_id]) {
          try {
            const imgRes = await fetch(`${CRUD_URL}/images/${item.image_id}`);
            const imgData = await imgRes.json();
            setCartImages(prev => ({ ...prev, [item.image_id]: imgData }));
          } catch (error) {
            console.error("Error fetching cart image:", error);
          }
        }
      }
    };
    fetchCartImages();
  }, [cart, cartImages, images]);
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      setCart(prevCart => prevCart.filter(item => item.id !== id));
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.id === id ? { ...item, quantity } : item
        )
      );
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  const generateReceipt = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("STRUK BELANJA", 105, 20, { align: "center" });
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Ahmeng Marketplace.", 105, 30, { align: "center" });
    doc.text("Tanggal: " + new Date().toLocaleDateString("id-ID"), 105, 40, { align: "center" });
    
    let y = 60;
    doc.setFont("helvetica", "bold");
    doc.text("No", 20, y);
    doc.text("Item", 40, y);
    doc.text("Qty", 100, y);
    doc.text("Harga", 130, y);
    doc.text("Total", 160, y);
    
    doc.line(20, y + 2, 190, y + 2);
    
    doc.setFont("helvetica", "normal");
    y += 10;
    cart.forEach((item, index) => {
      const itemLines = doc.splitTextToSize(item.name, 50);
      const priceLines = doc.splitTextToSize(`${formatRupiah(item.price)}`, 25);
      const totalLines = doc.splitTextToSize(`${formatRupiah(item.price * item.quantity)}`, 25);
      const maxLines = Math.max(itemLines.length, priceLines.length, totalLines.length);
      
      doc.text((index + 1).toString(), 20, y);
      itemLines.forEach((line, idx) => doc.text(line, 40, y + idx * 5));
      doc.text(item.quantity.toString(), 100, y);
      priceLines.forEach((line, idx) => doc.text(line, 130, y + idx * 5));
      totalLines.forEach((line, idx) => doc.text(line, 160, y + idx * 5));
      
      y += maxLines * 5 + 5;
    });
    
    doc.line(20, y, 190, y);
    y += 10;
    
    doc.setFont("helvetica", "bold");
    doc.text("TOTAL:", 130, y);
    doc.text(`${formatRupiah(total)}`, 160, y);
    
    y += 20;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Terima kasih atas pembelian Anda!", 105, y, { align: "center" });
    doc.text("Simpan struk ini sebagai bukti pembelian.", 105, y + 10, { align: "center" });
    
    doc.save("struk-belanja.pdf");
  };

  return (
    <div className={`min-h-screen py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300 ${isDark ? 'bg-black text-white' : 'bg-white text-black'}`}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className={`text-4xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>Keranjang Belanja</h1>
          <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Kelola item belanja Anda</p>
        </div>
        {cart.length === 0 ? (
          <div className="text-center py-16">
            <div className={`backdrop-blur-sm rounded-2xl p-8 shadow-lg max-w-md mx-auto border ${isDark ? 'bg-gray-900/80 border-gray-800' : 'bg-white/80 border-gray-200'}`}>
              <svg className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <h2 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-700'}`}>Keranjang Kosong</h2>
              <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Belum ada item di keranjang Anda</p>
              <Link to="/catalog" className={`px-6 py-3 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg inline-block ${isDark ? 'bg-gray-600 text-white hover:bg-gray-500' : 'bg-gray-800 text-white hover:bg-gray-900'}`}>
                Mulai Belanja
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-6 mb-8">
              {cart.map(item => (
                <div key={item.id} className={`backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border ${isDark ? 'bg-gray-900/80 border-gray-800' : 'bg-white/80 border-gray-200'}`}>
                  <div className="flex items-center space-x-4">
                    {(images[item.image_id] || cartImages[item.image_id]) && (
                      <div className="relative">
                        <img
                          src={`data:${(images[item.image_id] || cartImages[item.image_id]).content_type};base64,${(images[item.image_id] || cartImages[item.image_id]).data}`}
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded-xl shadow-md"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h2 className={`text-lg font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>{item.name}</h2>
                      <p className={`font-bold text-lg transition-colors duration-300 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{formatRupiah(item.price)}</p>
                    </div>
                    <div className="flex flex-col items-end space-y-3">
                      <div className={`flex items-center space-x-3 rounded-full p-1 ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-sm ${isDark ? 'bg-gray-600 text-white hover:bg-gray-500' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'}`}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 0)}
                          className={`w-12 rounded-lg text-center font-medium border-0 focus:ring-2 ${isDark ? 'bg-gray-700 text-white focus:ring-gray-500' : 'bg-gray-200 text-black focus:ring-gray-500'}`}
                          min="0"
                        />
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-sm ${isDark ? 'bg-gray-600 text-white hover:bg-gray-500' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'}`}
                        >
                          +
                        </button>
                      </div>
                      <p className={`font-bold text-xl ${isDark ? 'text-white' : 'text-gray-800'}`}>{formatRupiah(item.price * item.quantity)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className={`backdrop-blur-sm rounded-2xl p-6 shadow-lg border ${isDark ? 'bg-gray-900/80 border-gray-800' : 'bg-white/80 border-gray-200'}`}>
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="text-center lg:text-left">
                  <p className={`mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Total Pembayaran</p>
                  <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{formatRupiah(total)}</p>
                </div>
                <div className="flex flex-col sm:flex-row justify-center lg:justify-end space-y-3 sm:space-y-0 sm:space-x-4">
                  <button
                    onClick={clearCart}
                    className={`px-6 py-3 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg font-medium ${isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-800 text-white hover:bg-gray-900'}`}
                  >
                    Kosongkan Keranjang
                  </button>
                  <button
                    onClick={generateReceipt}
                    className={`px-6 py-3 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg font-medium ${isDark ? 'bg-gray-600 text-white hover:bg-gray-500' : 'bg-gray-800 text-white hover:bg-gray-900'}`}
                  >
                    Cetak Struk (PDF)
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Cart;