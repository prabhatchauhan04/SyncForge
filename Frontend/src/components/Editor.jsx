import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import socket from '../socket/socket.js'; // your existing socket instance
import Editor from '@monaco-editor/react';
import axios from 'axios';

const PISTON_RUNTIMES_URL = 'https://emkc.org/api/v2/piston/runtimes';
const PISTON_EXECUTE_URL = 'https://emkc.org/api/v2/piston/execute';

const EditorPage = () => {
  const { id: roomId } = useParams();
  const navigate = useNavigate();

  const [joined, setJoined] = useState(false);
  const [userName, setUserName] = useState('');
  const [language, setLanguage] = useState('');
  const [version, setVersion] = useState('');
  const [runtimes, setRuntimes] = useState([]); // list of { language, version, aliases }
  const [versionsForLang, setVersionsForLang] = useState([]); // versions for current language

  const [code, setCode] = useState('// Start coding here...');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  const [users, setUsers] = useState([]);
  const [typing, setTyping] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  const typingTimeout = useRef(null);

  // 1. On mount: auth check, fetch runtimes, connect socket, join room
  useEffect(() => {
    const storedUser = localStorage.getItem('userName');
    const storedRoom = localStorage.getItem('roomId');

    if (!storedUser || !storedRoom || storedRoom !== roomId) {
      navigate('/login');
      return;
    }
    setUserName(storedUser);

    // Fetch runtimes
    const fetchRuntimes = async () => {
      try {
        const resp = await axios.get(PISTON_RUNTIMES_URL);
        const data = resp.data; // array of { language, version, aliases, runtime? } :contentReference[oaicite:0]{index=0}
        setRuntimes(data);

        // If no language chosen yet, pick first distinct language
        if (data.length > 0) {
          // pick first language
          const firstLang = data[0].language;
          setLanguage(firstLang);
        }
      } catch (err) {
        console.error('Error fetching runtimes:', err);
      }
    };

    fetchRuntimes();

    // Socket connection & join logic
    if (!socket.connected) {
      socket.connect();
    }
    socket.once('connect', () => {
      socket.emit('join', { roomId, userName: storedUser });
      setJoined(true);
    });

    socket.on('userJoined', (currUsers) => {
      setUsers(currUsers);
    });
    socket.on('codeUpdate', (newCode) => {
      setCode(newCode);
    });
    socket.on('languageUpdate', (newLang) => {
      setLanguage(newLang);
    });
    socket.on('userTyping', (who) => {
      setTyping(`${who.slice(0, 8)}... is typing`);
      clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => {
        setTyping('');
      }, 2000);
    });

    return () => {
      socket.emit('leaveRoom');
      socket.off('userJoined');
      socket.off('codeUpdate');
      socket.off('languageUpdate');
      socket.off('userTyping');
      socket.disconnect();
    };
  }, [roomId, navigate]);

  // 2. Whenever `language` changes, update `versionsForLang` from `runtimes`
  useEffect(() => {
    if (!language) return;
    const vs = runtimes
      .filter(rt => rt.language === language || rt.aliases?.includes(language))
      .map(rt => rt.version);
    setVersionsForLang(vs);
    // If current version not in vs, pick the first
    if (vs.length > 0) {
      setVersion(vs[0]);
    } else {
      setVersion('');
    }
  }, [language, runtimes]);

  // Handlers
  const handleCodeChange = (newCode) => {
    setCode(newCode);
    socket.emit('codeChange', { roomId, code: newCode });
    socket.emit('typing', { roomId, userName });
  };

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    socket.emit('languageChange', { roomId, language: newLang });
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const leaveRoom = () => {
    socket.emit('leaveRoom');
    socket.disconnect();
    localStorage.removeItem('userName');
    localStorage.removeItem('roomId');
    navigate('/login');
  };

  // Execution via Piston
  const runCode = async () => {
    if (!language || !version) {
      setOutput('Select language & version first');
      return;
    }

    setIsRunning(true);
    setOutput('Running...');
    try {
      const payload = {
        language: language,
        version: version,
        files: [
          {
            name: `Main.${getExtension(language)}`,
            content: code,
          },
        ],
        stdin: input || '',
      };
      const res = await axios.post(PISTON_EXECUTE_URL, payload);
      // The response has `run` property normally with stdout, stderr, output fields :contentReference[oaicite:1]{index=1}
      const run = res.data.run;
      let out = '';
      if (run.stdout) out += run.stdout;
      if (run.stderr) out += run.stderr;
      if (!out) out = run.output || '';
      setOutput(out);
    } catch (err) {
      console.error('Run error:', err.response?.data || err.message);
      setOutput('Error running code: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsRunning(false);
    }
  };

  // Utility to choose extension for a language
  const getExtension = (lang) => {
    switch (lang) {
      case 'javascript':
        return 'js';
      case 'python':
        return 'py';
      case 'java':
        return 'java';
      case 'cpp':
        return 'cpp';
      default:
        return 'txt';
    }
  };

  if (!joined) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      {/* Top bar */}
      <div className="bg-white px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 shadow-sm">
        <div>
          <h2 className="text-xl font-semibold">
            Code Room: <span className="text-violet-600 font-mono">{roomId}</span>
          </h2>
          <button onClick={copyRoomId} className="mt-1 text-sm text-blue-600 hover:underline">
            Copy Room ID
          </button>
          {copySuccess && <span className="ml-3 text-green-600 text-sm">Copied!</span>}
        </div>
        <div className="flex items-center gap-4">
          <select
            value={language}
            onChange={handleLanguageChange}
            className="bg-white border border-gray-300 text-gray-700 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            {/** Show only distinct languages from runtimes */}
            {Array.from(new Set(runtimes.map(rt => rt.language))).map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
          <select
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            className="bg-white border border-gray-300 text-gray-700 p-2 rounded-md"
          >
            {versionsForLang.map((ver) => (
              <option key={ver} value={ver}>
                {ver}
              </option>
            ))}
          </select>
          <button
            onClick={runCode}
            disabled={isRunning}
            className={`bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-md shadow transition duration-200 ${
              isRunning ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isRunning ? 'Running…' : 'Run Code'}
          </button>
          <button
            onClick={leaveRoom}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-md shadow transition duration-200"
          >
            Leave Room
          </button>
        </div>
      </div>

      {/* Users + Typing + Editor */}
      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto shadow-inner">
          <h3 className="text-lg font-semibold mb-3">Users in Room:</h3>
          <ul className="space-y-2">
            {users.map((user, idx) => (
              <li key={idx} className="px-2 py-1 bg-gray-100 rounded-md text-gray-700 font-mono">
                {user.slice(0, 8)}...
              </li>
            ))}
          </ul>
          {typing && <p className="mt-4 text-sm text-violet-600 italic animate-pulse">{typing}</p>}
        </div>

        <div className="flex-1 relative">
          <div className="absolute inset-4 bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden">
            <Editor
              height="100%"
              language={language}
              value={code}
              onChange={(value) => handleCodeChange(value)}
              theme="light"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                scrollBeyondLastLine: false,
                automaticLayout: true,
              }}
            />
          </div>
        </div>
      </div>

      {/* Input & Output Section */}
      <div className="px-6 py-4">
        <div className="mb-4">
          <h4 className="font-semibold mb-2">Input (stdin):</h4>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Any input your code expects"
            className="w-full border border-gray-300 rounded p-2 font-mono text-gray-900"
            rows={3}
          />
        </div>
        <div className="bg-gray-100 border border-gray-300 rounded-md p-4 max-h-48 overflow-auto whitespace-pre-wrap font-mono text-gray-900">
          <strong>Output:</strong>
          <pre>{output}</pre>
        </div>
      </div>
    </div>
  );
};

export default EditorPage;
