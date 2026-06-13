import { Link } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";

function LandingPage() {
  const { isDark } = useTheme();

  return (
    <div>
      {/* Hero Section */}
      <div className="relative overflow-hidden pt-12 md:pt-20 pb-24 md:pb-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col items-start text-left">
            <h1 className="text-5xl sm:text-7xl md:text-[10rem] font-serif font-medium leading-[0.85] mb-12 tracking-tighter animate-fade-in">
              The Art of <br />
              <span className="italic">Curation.</span>
            </h1>
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between w-full gap-12">
              <p className={`text-xl md:text-2xl max-w-lg leading-relaxed animate-fade-in-delay ${isDark ? "text-zinc-300" : "text-zinc-800"}`}>
                Ahmeng Marketplace defines the new standard for digital commerce. Curated, refined, and effortlessly simple.
              </p>
              <div className="flex gap-4 animate-fade-in-delay-2">
                <Link
                  to="/catalog"
                  className={`px-8 md:px-10 py-4 md:py-5 rounded-sm font-sans text-[10px] md:text-xs tracking-[0.2em] uppercase font-bold transition-all duration-300 active:scale-95 border ${isDark ? "bg-zinc-100 text-zinc-900 border-zinc-100 hover:bg-transparent hover:text-zinc-100" : "bg-zinc-900 text-white border-zinc-900 hover:bg-transparent hover:text-zinc-900"}`}
                >
                  Explore Collection
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section (Editorial Bento) */}
      <div className={`py-24 md:py-32 px-6 border-t ${isDark ? "border-zinc-900" : "border-zinc-100"}`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-baseline mb-16 md:mb-20 gap-8">
            <h2 className="text-4xl font-serif italic">The Standards</h2>
            <p className={`text-[10px] uppercase tracking-[0.3em] font-bold ${isDark ? "text-zinc-600" : "text-zinc-300"}`}>Integrity / Quality / Speed</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-px bg-zinc-200 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800">
            {/* Box 1 */}
            <div className={`md:col-span-2 p-8 md:p-12 flex flex-col justify-between h-[350px] md:h-[450px] ${isDark ? "bg-zinc-950" : "bg-white"}`}>
              <span className="text-4xl md:text-5xl font-serif">01</span>
              <div>
                <h3 className="text-2xl font-serif mb-4">Precision</h3>
                <p className={`text-sm leading-relaxed ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>
                  Every transaction is handled with absolute precision and cryptographic security.
                </p>
              </div>
            </div>
            {/* Box 2 */}
            <div className={`p-8 md:p-12 flex flex-col justify-between h-[350px] md:h-[450px] ${isDark ? "bg-zinc-950" : "bg-white"}`}>
              <span className="text-4xl md:text-5xl font-serif italic text-zinc-400">02</span>
              <div>
                <h3 className="text-2xl font-serif mb-4">Trust</h3>
                <p className={`text-sm leading-relaxed ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>Verified sellers only. We maintain a high bar for our community.</p>
              </div>
            </div>
            {/* Box 3 */}
            <div className={`p-8 md:p-12 flex flex-col justify-between h-[350px] md:h-[450px] ${isDark ? "bg-zinc-950" : "bg-white"}`}>
              <span className="text-4xl md:text-5xl font-serif italic text-zinc-400">03</span>
              <div>
                <h3 className="text-2xl font-serif mb-4">Velocity</h3>
                <p className={`text-sm leading-relaxed ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>Zero-latency commerce. Fast delivery, faster payments.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className={`py-32 md:py-40 px-6 border-t ${isDark ? "border-zinc-900" : "border-zinc-100"}`}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-8xl font-serif mb-12 tracking-tight">
            Begin your <br />
            <span className="italic">journey.</span>
          </h2>
          <Link
            to="/catalog"
            className={`inline-block px-10 md:px-12 py-5 md:py-6 rounded-sm font-sans text-[10px] md:text-xs tracking-[0.2em] uppercase font-bold transition-all duration-300 active:scale-95 border ${isDark ? "bg-zinc-100 text-zinc-900 border-zinc-100 hover:bg-transparent hover:text-zinc-100" : "bg-zinc-900 text-white border-zinc-900 hover:bg-transparent hover:text-zinc-900"}`}
          >
            Open Catalog
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
