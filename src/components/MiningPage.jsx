import { useState, useEffect, useRef, useCallback } from "react";
import { useTheme } from "../contexts/ThemeContext";
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

const AUTH_URL = import.meta.env.VITE_AUTH_SERVICE_URL || 'http://localhost:8787';

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
    return 'Rp ' + angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const checkTaskValidity = async () => {
    if (!challenge) return true;
    try {
      const res = await fetch(`${AUTH_URL}/auth/task/${challenge}/valid`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await res.json();
      return data.valid;
    } catch {
      return false;
    }
  };

  const getTask = useCallback(async () => {
    try {
      const res = await fetch(`${AUTH_URL}/auth/task`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setChallenge(data.challenge);
        setNonce("");
        setMessage("");
        attemptsRef.current = 0;
        setAttempts(0);
        setHashrate(0);
        startTimeRef.current = Date.now();
        // Update worker with new challenge
        if (workerRef.current) {
          workerRef.current.postMessage({ challenge: data.challenge, difficulty });
        }
      } else {
        setMessage(data.error || "Failed to get task");
      }
    } catch (error) {
      setMessage("Error fetching task");
    }
  }, [token]);

  const fetchSolvedHistory = async () => {
    try {
      const res = await fetch(`${AUTH_URL}/auth/solved-history`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setSolvedHistory(data);
      }
    } catch (error) {
      console.error("Error fetching solved history");
    }
  };

  const submitTask = async (foundNonce) => {
    try {
      const res = await fetch(`${AUTH_URL}/auth/submit-task`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ challenge, nonce: foundNonce, difficulty }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Task solved! Balance increased by Rp 100.000");
        // Refresh balance
        window.dispatchEvent(new CustomEvent('balanceChanged'));
        // Get new task
        setTimeout(getTask, 2000);
        // Refresh history
        fetchSolvedHistory();
      } else {
        if (data.error === "Task already solved") {
          setMessage("Task was already solved by another user. Getting new task...");
          setTimeout(getTask, 2000);
        } else {
          setMessage(data.error || "Failed to submit task");
        }
      }
    } catch (error) {
      setMessage("Error submitting task");
    }
  };

  const startMining = () => {
    if (!challenge) return;

    setIsMining(true);
    startTimeRef.current = Date.now();
    attemptsRef.current = 0;

    // Start validity check every 5 seconds to switch to new task if current is solved
    validityCheckRef.current = setInterval(async () => {
      const isValid = await checkTaskValidity();
      if (!isValid) {
        getTask(); // Get new task without stopping mining
      }
    }, 5000);

    // Use Web Worker for mining
    workerRef.current = new Worker(new URL('../workers/miner.js', import.meta.url), { type: 'module' });
    workerRef.current.postMessage({ challenge, difficulty });

    workerRef.current.onmessage = (e) => {
      const { type, nonce: foundNonce, attempts: workerAttempts } = e.data;
      if (type === 'found') {
        setNonce(foundNonce);
        submitTask(foundNonce);
      } else if (type === 'progress') {
        attemptsRef.current = workerAttempts;
        setAttempts(workerAttempts);
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        setHashrate(Math.floor(workerAttempts / elapsed));
      }
    };
  };

  const stopMining = () => {
    setIsMining(false);
    if (workerRef.current) {
      workerRef.current.terminate();
    }
    if (validityCheckRef.current) {
      clearInterval(validityCheckRef.current);
    }
  };

  useEffect(() => {
    getTask();
    fetchSolvedHistory();
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
      if (validityCheckRef.current) {
        clearInterval(validityCheckRef.current);
      }
    };
  }, [getTask]);

  return (
    <div className="min-h-screen pt-24 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Proof-of-Work Mining</h1>

        <div className={`p-6 rounded-lg shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Current Task</h2>
            <div className="space-y-2">
              <p><strong>Challenge:</strong> {challenge}</p>
              <p><strong>Difficulty:</strong> {difficulty * 4} leading zero bits ({difficulty} hex digits)</p>
              <p><strong>Reward:</strong> {formatRupiah(100000)}</p>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Mining Stats</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <p className="text-sm text-gray-600">Hashrate</p>
                <p className="text-2xl font-bold">{hashrate.toLocaleString()} H/s</p>
              </div>
              <div className={`p-4 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <p className="text-sm text-gray-600">Attempts</p>
                <p className="text-2xl font-bold">{attempts.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-center">
              <button
                onClick={isMining ? stopMining : startMining}
                className={`py-3 px-6 rounded-lg font-semibold transition duration-200 ${
                  isMining
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {isMining ? 'Stop Mining' : 'Start Mining'}
              </button>
            </div>
          </div>

          {nonce && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Found Nonce</h2>
              <p className="font-mono bg-gray-100 p-2 rounded">{nonce}</p>
            </div>
          )}

          {message && (
            <div className={`p-4 rounded ${message.includes('solved') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {message}
            </div>
          )}
        </div>

        <div className={`mt-8 p-6 rounded-lg shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className="text-xl font-semibold mb-4">Mining History</h2>
          <div className="max-h-64 overflow-y-auto">
            {solvedHistory.length === 0 ? (
              <p className="text-gray-500">No mining history yet.</p>
            ) : (
              solvedHistory.map((item, index) => (
                <div key={index} className="text-sm mb-1 bg-green-100 text-green-800 p-2 rounded">
                  [{dayjs.utc(item.solved_at).tz('Asia/Jakarta').format('DD/MM/YYYY HH:mm:ss')}]: Task solved! Balance increased by Rp 100.000
                </div>
              ))
            )}
          </div>
        </div>

        <div className={`mt-8 p-6 rounded-lg shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className="text-xl font-semibold mb-4">Python Mining Script</h2>
          <p className="mb-4 text-sm text-gray-600">Copy this script to Google Colab or your computer for more powerful mining:</p>
          <pre className={`p-4 rounded text-xs overflow-x-auto ${isDark ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900'}`}>
{`import hashlib
import requests
import time

# Your JWT Token
TOKEN = "${token}"
AUTH_URL = "${AUTH_URL}"

def get_task():
    headers = {"Authorization": f"Bearer {TOKEN}"}
    response = requests.get(f"{AUTH_URL}/auth/task", headers=headers)
    if response.status_code == 200:
        return response.json()
    else:
        print("Failed to get task:", response.json())
        return None

def submit_task(challenge, nonce, difficulty):
    headers = {"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"}
    data = {"challenge": challenge, "nonce": nonce, "difficulty": difficulty}
    response = requests.post(f"{AUTH_URL}/auth/submit-task", json=data, headers=headers)
    return response.json()

def mine(challenge, difficulty):
    target = '0' * difficulty
    challenge_bytes = bytes.fromhex(challenge)
    nonce = 0
    start_time = time.time()
    attempts = 0
    
    while True:
        nonce_hex = hex(nonce)[2:]
        if len(nonce_hex) % 2 != 0:
            nonce_hex = '0' + nonce_hex
        nonce_bytes = bytes.fromhex(nonce_hex)
        data = challenge_bytes + nonce_bytes
        hash_result = hashlib.sha256(data).hexdigest()
        attempts += 1
        
        if hash_result.startswith(target):
            return nonce_hex, attempts
        
        nonce += 1
        
        if attempts % 100000 == 0:
            elapsed = time.time() - start_time
            print(f"Attempts: {attempts}, Hashrate: {attempts / elapsed:.2f} H/s")

def main():
    while True:
        print("Getting task...")
        task = get_task()
        if not task:
            time.sleep(5)
            continue
            
        challenge = task['challenge']
        difficulty = task['difficulty']
        print(f"Mining challenge: {challenge}, difficulty: {difficulty}")
        
        nonce, attempts = mine(challenge, difficulty)
        print(f"Found nonce: {nonce} after {attempts} attempts")
        
        result = submit_task(challenge, nonce, difficulty)
        print("Submit result:", result)
        
        if "solved" in str(result):
            print("Task solved! Balance updated.")
        else:
            print("Failed to submit:", result)
        
        time.sleep(2)  # Wait before next task

if __name__ == "__main__":
    main()`}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default MiningPage;