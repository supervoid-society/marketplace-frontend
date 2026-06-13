import { useState, useEffect, useRef, useCallback } from "react";
import { useTheme } from "../contexts/ThemeContext";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const AUTH_URL = import.meta.env.VITE_AUTH_SERVICE_URL || "http://localhost:8787";

function MiningPage({ token }) {
  const { isDark } = useTheme();
  const [challenge, setChallenge] = useState("");
  const [difficulty, setDifficulty] = useState(6);
  const [nonce, setNonce] = useState("");
  const [isMining, setIsMining] = useState(false);
  const [hashrate, setHashrate] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [message, setMessage] = useState("");
  const [solvedHistory, setSolvedHistory] = useState([]);
  const workerRef = useRef(null);
  const startTimeRef = useRef(null);
  const attemptsRef = useRef(0);
  const validityCheckRef = useRef(null);

  const formatRupiah = (angka) => {
    return "Rp " + angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const checkTaskValidity = async () => {
    if (!challenge) return true;
    try {
      const res = await fetch(`${AUTH_URL}/auth/task/${challenge}/valid`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      return data.valid;
    } catch {
      return false;
    }
  };

  const fetchSolvedHistory = useCallback(async () => {
    try {
      const res = await fetch(`${AUTH_URL}/auth/solved-history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setSolvedHistory(data);
    } catch (error) {
      console.error(error);
    }
  }, [token]);

  const getTask = useCallback(async () => {
    try {
      const res = await fetch(`${AUTH_URL}/auth/task`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setChallenge(data.challenge);
        setNonce("");
        setMessage("");
      } else {
        setMessage(data.error || "Task failure");
      }
    } catch (error) {
      setMessage("Task failure");
    }
  }, [token]);

  const submitTask = useCallback(
    async (foundNonce) => {
      try {
        const res = await fetch(`${AUTH_URL}/auth/submit-task`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ challenge, nonce: foundNonce, difficulty }),
        });
        const data = await res.json();
        if (res.ok) {
          setMessage("Task resolved / System balance updated.");
          window.dispatchEvent(new CustomEvent("balanceChanged"));
          setTimeout(getTask, 2000);
          fetchSolvedHistory();
        } else {
          setMessage(data.error === "Task already solved" ? "Collision detected / Fetching new task..." : data.error);
          if (data.error === "Task already solved") setTimeout(getTask, 2000);
        }
      } catch (error) {
        setMessage("Verification failure");
      }
    },
    [challenge, difficulty, token, getTask, fetchSolvedHistory]
  );

  const startWorker = useCallback(
    (challenge, difficulty) => {
      if (workerRef.current) workerRef.current.terminate();
      workerRef.current = new Worker(new URL("../workers/miner.js", import.meta.url), { type: "module" });
      workerRef.current.postMessage({ challenge, difficulty });
      workerRef.current.onmessage = (e) => {
        const { type, nonce: foundNonce, attempts: workerAttempts } = e.data;
        if (type === "found") {
          setNonce(foundNonce);
          submitTask(foundNonce);
        } else if (type === "progress") {
          attemptsRef.current = workerAttempts;
          setAttempts(workerAttempts);
          const elapsed = (Date.now() - startTimeRef.current) / 1000;
          setHashrate(Math.floor(workerAttempts / elapsed));
        }
      };
    },
    [submitTask]
  );

  const startMining = () => {
    if (!challenge) return;
    setIsMining(true);
    startTimeRef.current = Date.now();
    attemptsRef.current = 0;
    validityCheckRef.current = setInterval(async () => {
      const isValid = await checkTaskValidity();
      if (!isValid) getTask();
    }, 5000);
    startWorker(challenge, difficulty);
  };

  const stopMining = () => {
    setIsMining(false);
    if (workerRef.current) workerRef.current.terminate();
    if (validityCheckRef.current) clearInterval(validityCheckRef.current);
  };

  useEffect(() => {
    getTask();
    fetchSolvedHistory();
    return () => {
      if (workerRef.current) workerRef.current.terminate();
      if (validityCheckRef.current) clearInterval(validityCheckRef.current);
    };
  }, [getTask, fetchSolvedHistory]);

  useEffect(() => {
    if (isMining && challenge) startWorker(challenge, difficulty);
  }, [challenge, isMining, difficulty, startWorker]);

  return (
    <div className="py-8 px-4 md:px-6 max-w-4xl mx-auto">
      <div className="mb-20">
        <h1 className="text-6xl md:text-8xl font-serif font-medium tracking-tighter leading-none mb-4">Forge.</h1>
        <p className={`text-xl ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>Computational proof of work.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-7 space-y-12">
          <div className={`p-6 md:p-10 border ${isDark ? "bg-zinc-950 border-zinc-800" : "bg-zinc-50 border-zinc-100"}`}>
            <h2 className="text-xs uppercase tracking-[0.4em] font-black mb-10">System Parameters</h2>
            <div className="space-y-8">
              <div>
                <span className="block text-[10px] uppercase tracking-widest font-black opacity-40 mb-2">Challenge Hash</span>
                <p className="font-mono text-xs break-all opacity-80">{challenge || "awaiting_task..."}</p>
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <span className="block text-[10px] uppercase tracking-widest font-black opacity-40 mb-2">Complexity</span>
                  <p className="text-2xl font-black tracking-tighter">{difficulty * 4} bits</p>
                </div>
                <div>
                  <span className="block text-[10px] uppercase tracking-widest font-black opacity-40 mb-2">Allocation</span>
                  <p className="text-2xl font-black tracking-tighter">{formatRupiah(100000)}</p>
                </div>
              </div>
            </div>

            <button
              onClick={isMining ? stopMining : startMining}
              className={`w-full mt-12 py-6 rounded-none font-bold text-[10px] uppercase tracking-[0.3em] transition-all duration-500 border ${
                isMining
                  ? "bg-rose-500 text-white border-rose-500 hover:bg-transparent hover:text-rose-500"
                  : isDark
                    ? "bg-zinc-100 text-zinc-900 border-zinc-100 hover:bg-transparent hover:text-zinc-100"
                    : "bg-zinc-900 text-white border-zinc-900 hover:bg-transparent hover:text-zinc-900"
              }`}
            >
              {isMining ? "Interrupt Process" : "Initialize Forge"}
            </button>
          </div>

          <div className={`p-6 md:p-10 border ${isDark ? "border-zinc-900" : "border-zinc-100"}`}>
            <h2 className="text-xs uppercase tracking-[0.4em] font-black mb-8">Metrics</h2>
            <div className="grid grid-cols-2 gap-px bg-zinc-200 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800">
              <div className={`p-6 ${isDark ? "bg-zinc-950" : "bg-white"}`}>
                <span className="block text-[10px] uppercase tracking-widest font-bold opacity-40 mb-2">Hashrate</span>
                <p className="text-2xl font-black tracking-tighter">{hashrate.toLocaleString()} H/s</p>
              </div>
              <div className={`p-6 ${isDark ? "bg-zinc-950" : "bg-white"}`}>
                <span className="block text-[10px] uppercase tracking-widest font-bold opacity-40 mb-2">Iterations</span>
                <p className="text-2xl font-black tracking-tighter">{attempts.toLocaleString()}</p>
              </div>
            </div>
            {message && <p className="mt-8 text-[10px] uppercase tracking-widest font-black text-center">{message}</p>}
          </div>
        </div>

        <div className="lg:col-span-5 space-y-8">
          <div className={`p-8 border ${isDark ? "border-zinc-900" : "border-zinc-100"}`}>
            <h2 className="text-xs uppercase tracking-[0.4em] font-black mb-6">Archive</h2>
            <div className="max-h-[300px] overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {solvedHistory.length === 0 ? (
                <p className="text-xs italic opacity-40">No records found.</p>
              ) : (
                solvedHistory.map((item, index) => (
                  <div key={index} className="flex justify-between items-center gap-4 py-3 border-b border-zinc-100 dark:border-zinc-900">
                    <span className="text-[10px] font-bold opacity-40">{dayjs.utc(item.solved_at).format("HH:mm:ss")}</span>
                    <span className="text-[10px] uppercase tracking-widest font-black text-emerald-500">Resolved</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className={`p-8 border ${isDark ? "bg-zinc-900 border-zinc-800" : "bg-zinc-50 border-zinc-100"}`}>
            <h2 className="text-xs uppercase tracking-[0.4em] font-black mb-4">Direct Terminal</h2>
            <p className="text-[10px] leading-relaxed opacity-60 mb-6">Interface for off-site computational clients.</p>
            <pre className="text-[9px] font-mono p-4 bg-black text-zinc-500 overflow-x-auto border border-zinc-800">
              {`# Auth Terminal Configuration
TOKEN = "${token.slice(0, 12)}..."
AUTH_URL = "${AUTH_URL}"`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MiningPage;
