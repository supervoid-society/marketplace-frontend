import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { useCart } from "../contexts/CartContext";
import jsPDF from "jspdf";
import Swal from 'sweetalert2';

const CRUD_URL = import.meta.env.VITE_CRUD_SERVICE_URL || 'http://localhost:8788';
const AUTH_URL = import.meta.env.VITE_AUTH_SERVICE_URL || 'http://localhost:8787';

function Checkout() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { cart, clearCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);

  const formatRupiah = (angka) => {
    return 'Rp ' + angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const getUserFromToken = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const fetchBalance = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      
      try {
        const res = await fetch(`${AUTH_URL}/transactions/balance`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setBalance(data.balance);
        }
      } catch (error) {
        console.error("Failed to fetch balance:", error);
      }
    };

    fetchBalance();

    if (cart.length > 0) {
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [cart]);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const canCheckout = cart.length > 0 && total <= balance;

  const handlePayment = async () => {
    const user = getUserFromToken();
    if (!user || user.role !== 'buyer') {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'User tidak valid',
      });
      return;
    }

    const token = localStorage.getItem("token");

    // Fetch balance with signature
    let balanceData;
    try {
      const balanceRes = await fetch(`${AUTH_URL}/transactions/balance`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!balanceRes.ok) {
        throw new Error('Failed to fetch balance');
      }
      balanceData = await balanceRes.json();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Gagal mengambil saldo',
      });
      return;
    }

    // Process each item in cart
    try {
      for (const item of cart) {
        // Checkout item
        const checkoutRes = await fetch(`${CRUD_URL}/transactions/checkout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ 
            itemId: item.id, 
            quantity: item.quantity, 
            balance: balanceData.balance, 
            signature: balanceData.signature 
          })
        });

        if (!checkoutRes.ok) {
          const errorData = await checkoutRes.json();
          Swal.fire({
            icon: 'error',
            title: 'Checkout Gagal',
            text: `Checkout item ${item.name} gagal: ${errorData.error}`,
          });
          return;
        }

        const checkoutData = await checkoutRes.json();
        const { transactionId, sellerId, amount, signature } = checkoutData;

        // Transfer money
        const transferRes = await fetch(`${AUTH_URL}/transactions/transfer`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ transactionId, sellerId, amount, signature })
        });

        if (!transferRes.ok) {
          const errorData = await transferRes.json();
          Swal.fire({
            icon: 'error',
            title: 'Transfer Gagal',
            text: `Transfer untuk ${item.name} gagal: ${errorData.error}`,
          });
          return;
        }
      }
    } catch (error) {
      console.error("Payment error:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Terjadi kesalahan saat pembayaran',
      });
      return;
    }

    // Generate PDF receipt first
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("STRUK BELANJA", 105, 20, { align: "center" });
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Ahmeng Marketplace", 105, 30, { align: "center" });
    doc.text("Tanggal: " + new Date().toLocaleDateString("id-ID"), 105, 40, { align: "center" });
    
    let y = 60;
    doc.setFont("helvetica", "bold");
    doc.text("No", 20, y);
    doc.text("Item", 40, y);
    doc.text("Total", 160, y);
    
    doc.line(20, y + 2, 190, y + 2);
    
    doc.setFont("helvetica", "normal");
    y += 10;
    cart.forEach((item, index) => {
      const itemText = `${item.name}\nQty: ${item.quantity} x ${formatRupiah(item.price)}`;
      const itemLines = doc.splitTextToSize(itemText, 100);
      const totalLines = doc.splitTextToSize(`${formatRupiah(item.price * item.quantity)}`, 25);
      const maxLines = Math.max(itemLines.length, totalLines.length);
      
      doc.text((index + 1).toString(), 20, y);
      itemLines.forEach((line, idx) => doc.text(line, 40, y + idx * 5));
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
    
    // Clear cart after successful checkout
    await clearCart();
    // Dispatch event to refresh balance
    window.dispatchEvent(new CustomEvent('balanceChanged'));
    Swal.fire({
      icon: 'success',
      title: 'Checkout Berhasil',
      text: 'Pembelian berhasil! Struk telah didownload.',
    });
    navigate("/catalog");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${isDark ? 'border-white' : 'border-gray-900'}`}></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300 ${isDark ? 'bg-black text-white' : 'bg-white text-black'}`}>
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className={`text-4xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>Struk Pembelian</h1>
          <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Ahmeng Marketplace</p>
        </div>
        
        {cart.length === 0 ? (
          <div className="text-center py-16">
            <div className={`backdrop-blur-sm rounded-2xl p-8 shadow-lg max-w-md mx-auto border ${isDark ? 'bg-gray-900/80 border-gray-800' : 'bg-white/80 border-gray-200'}`}>
              <h2 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-700'}`}>Keranjang Kosong</h2>
              <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Tidak ada item untuk checkout</p>
              <Link to="/catalog" className={`px-6 py-3 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg inline-block ${isDark ? 'bg-gray-600 text-white hover:bg-gray-500' : 'bg-gray-800 text-white hover:bg-gray-900'}`}>
                Kembali ke Katalog
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Struk Preview */}
            <div className={`backdrop-blur-sm rounded-2xl p-8 shadow-lg border ${isDark ? 'bg-gray-900/80 border-gray-800' : 'bg-white/80 border-gray-200'} font-mono text-sm`}>
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold">STRUK BELANJA</h2>
                <p>Ahmeng Marketplace</p>
                <p>Tanggal: {new Date().toLocaleDateString("id-ID")}</p>
              </div>
              
              <div className="border-t border-b border-gray-400 py-2 mb-4">
                <div className="grid grid-cols-4 gap-2 font-bold">
                  <span>No</span>
                  <span className="col-span-2">Item</span>
                  <span className="text-right">Total</span>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                {cart.map((item, index) => (
                  <div key={item.id} className="grid grid-cols-4 gap-2">
                    <span>{index + 1}</span>
                    <div className="col-span-2">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity} x {formatRupiah(item.price)}</p>
                    </div>
                    <span className="text-right">{formatRupiah(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-gray-400 pt-2">
                <div className="flex justify-between font-bold text-lg">
                  <span>TOTAL:</span>
                  <span>{formatRupiah(total)}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span>Saldo Anda:</span>
                  <span>{formatRupiah(balance)}</span>
                </div>
                {total > balance && (
                  <div className="text-red-500 text-sm mt-1">
                    Saldo tidak cukup untuk pembelian ini.
                  </div>
                )}
              </div>
              
              <div className="text-center mt-6 text-xs">
                <p>Terima kasih atas pembelian Anda!</p>
                <p>Simpan struk ini sebagai bukti pembelian.</p>
              </div>
            </div>
            
            <div className="flex justify-center mt-8 space-x-4">
              <Link
                to="/cart"
                className={`px-6 py-3 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg font-medium ${isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-800 text-white hover:bg-gray-900'}`}
              >
                Kembali ke Keranjang
              </Link>
              <button
                onClick={handlePayment}
                disabled={!canCheckout}
                className={`px-6 py-3 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg font-medium ${
                  canCheckout
                    ? (isDark ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-blue-600 text-white hover:bg-blue-700')
                    : 'bg-gray-400 text-white cursor-not-allowed'
                }`}
              >
                {canCheckout ? 'Bayar Sekarang' : (cart.length === 0 ? 'Keranjang Kosong' : 'Saldo Tidak Cukup')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Checkout;