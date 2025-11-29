
import React, { useState, useEffect, useCallback, useRef } from 'react';
import BlocklyComponent from './components/BlocklyComponent';
import Stage from './components/Stage';
import { LEVELS } from './constants';
import { GameState, Direction, Command, Position, CommandType } from './types';
import { 
  Play, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  Volume2, 
  Home,
  Bot,
  Music,
  Music4,
  SkipForward,
  Code,
  Layout,
  Puzzle,
  Award,
  RefreshCcw
} from 'lucide-react';

const App: React.FC = () => {
  // Navigation State
  const [showLanding, setShowLanding] = useState(true);
  const [showCertificate, setShowCertificate] = useState(false);
  
  // Game State
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [code, setCode] = useState("");
  const [blockCount, setBlockCount] = useState(0);
  const [gameState, setGameState] = useState<GameState>({
    characterPos: { x: 0, y: 0 },
    characterDir: Direction.EAST,
    isCompleted: false,
    message: null,
    isRunning: false,
    visited: [],
    hasFuel: false,
    fuelCollected: false
  });
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  // Stepping State
  const [stepIndex, setStepIndex] = useState(0);

  const currentLevel = LEVELS[currentLevelIndex];
  const commandQueueRef = useRef<Command[]>([]);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const bgmRef = useRef<HTMLAudioElement | null>(null);

  // Initialize Music
  useEffect(() => {
    // New Upbeat Track
    bgmRef.current = new Audio("https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=music-for-children-113684.mp3"); 
    bgmRef.current.loop = true;
    bgmRef.current.volume = 0.25; // Requested 25% volume
    
    return () => {
        if (bgmRef.current) {
            bgmRef.current.pause();
            bgmRef.current = null;
        }
    };
  }, []);

  const handleStart = () => {
    setShowLanding(false);
    // Attempt to play music immediately on user interaction
    if (bgmRef.current) {
        bgmRef.current.play().then(() => {
            setIsMusicPlaying(true);
        }).catch(e => {
            console.log("Auto-play prevented, waiting for manual toggle");
            setIsMusicPlaying(false);
        });
    }
  };

  const toggleMusic = () => {
    if (bgmRef.current) {
        if (isMusicPlaying) {
            bgmRef.current.pause();
        } else {
            bgmRef.current.play().catch(e => console.log("Audio play failed interaction needed"));
        }
        setIsMusicPlaying(!isMusicPlaying);
    }
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any currently speaking audio to prevent overlap
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      const voices = window.speechSynthesis.getVoices();
      
      // Improved Voice Selection Logic: Prioritize Google Thai or Microsoft Thai voices
      const thVoice = voices.find(v => v.lang.includes('th') && (v.name.includes('Google') || v.name.includes('Microsoft'))) || 
                      voices.find(v => v.lang.includes('th'));

      if (thVoice) {
          utterance.voice = thVoice;
      }
      
      utterance.lang = 'th-TH';
      // Tune for more natural, less robotic sound
      utterance.rate = 0.85; // Slightly slower
      utterance.pitch = 1.0; // Normal pitch
      utterance.volume = 1.0; // Max Volume
      
      window.speechSynthesis.speak(utterance);
    }
  };

  // Auto-speak Level on enter (triggers whenever currentLevelIndex changes)
  useEffect(() => {
    if (!showLanding) {
       // Small delay to ensure UI is rendered and transition feels natural
       const timer = setTimeout(() => {
           speak(currentLevel.title + ". " + currentLevel.description);
       }, 800);
       return () => clearTimeout(timer);
    }
  }, [showLanding, currentLevelIndex, currentLevel.title, currentLevel.description]);

  // Initialize Level State
  useEffect(() => {
    resetLevel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLevelIndex]);

  const resetLevel = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];

    setGameState({
      characterPos: { ...currentLevel.startPos },
      characterDir: currentLevel.startDir,
      isCompleted: false,
      message: null,
      isRunning: false,
      visited: [],
      hasFuel: !!currentLevel.fuelPos,
      fuelCollected: false
    });
    setStepIndex(0);
    commandQueueRef.current = [];
  };

  const parseCode = (generatedCode: string): Command[] => {
    const commands: Command[] = [];
    const cmd = (type: CommandType, payload?: string) => {
      commands.push({ type, payload });
    };
    try {
      // eslint-disable-next-line no-new-func
      const runner = new Function('cmd', generatedCode);
      runner(cmd);
    } catch (e) {
      console.error("Code parsing error", e);
    }
    return commands;
  };

  // Step 1: Parse and Prepare
  const prepareExecution = () => {
    const commands = parseCode(code);
    if (commands.length === 0) {
        const msg = "ยังไม่ได้วางคำสั่งเลยครับ ลองลากบล็อกมาวางดูนะ";
        setGameState(prev => ({ ...prev, message: msg }));
        speak(msg);
        return false;
    }
    commandQueueRef.current = commands;
    setStepIndex(0);
    return true;
  };

  // Full Run
  const handleRun = async () => {
    if (gameState.isRunning) return;
    
    resetLevel();
    if (!prepareExecution()) return;

    setGameState(prev => ({ ...prev, isRunning: true, message: null }));
    executeQueue();
  };

  // Step Run
  const handleStep = async () => {
    // If not running, start fresh
    if (!gameState.isRunning && commandQueueRef.current.length === 0) {
        resetLevel();
        if (!prepareExecution()) return;
        setGameState(prev => ({ ...prev, isRunning: true, message: null }));
        // Execute first step immediately
        setTimeout(() => executeNextStep(), 100);
    } else {
        // Already running or paused, execute next
        executeNextStep();
    }
  };

  const executeNextStep = () => {
      const queue = commandQueueRef.current;
      const index = stepIndex;

      if (index >= queue.length) {
          checkWinCondition(gameState.characterPos, gameState.fuelCollected);
          return;
      }

      const cmd = queue[index];
      
      setGameState(prev => {
        let newPos = { ...prev.characterPos };
        let newDir = prev.characterDir;
        let msg = null;
        let newFuelCollected = prev.fuelCollected;
        const newVisited = [...prev.visited];

        if (!newVisited.some(v => v.x === newPos.x && v.y === newPos.y)) {
            newVisited.push(newPos);
        }

        if (cmd.type === 'MOVE') {
           const moveVector = getDirVector(newDir);
           const nextX = newPos.x + moveVector.x;
           const nextY = newPos.y + moveVector.y;

           const isBlocked = 
              nextX < 0 || nextX >= currentLevel.gridSize ||
              nextY < 0 || nextY >= currentLevel.gridSize ||
              currentLevel.obstacles.some(o => o.x === nextX && o.y === nextY);

           if (!isBlocked) {
              newPos = { x: nextX, y: nextY };
           } else {
              msg = "อุ๊ย! ชนกำแพง";
           }
        } else if (cmd.type === 'TURN_LEFT') {
            newDir = (newDir + 3) % 4;
        } else if (cmd.type === 'TURN_RIGHT') {
            newDir = (newDir + 1) % 4;
        } else if (cmd.type === 'COLLECT') {
            // Logic: Check if current position matches fuel pos
            if (currentLevel.fuelPos && newPos.x === currentLevel.fuelPos.x && newPos.y === currentLevel.fuelPos.y) {
                newFuelCollected = true;
                msg = "เติมน้ำมันเรียบร้อย! ⛽";
            } else {
                msg = "ไม่มีอะไรให้เติมตรงนี้นะ";
            }
        }

        return {
            ...prev,
            characterPos: newPos,
            characterDir: newDir,
            fuelCollected: newFuelCollected,
            message: msg,
            visited: newVisited
        };
      });

      setStepIndex(index + 1);

      if (index + 1 >= queue.length) {
          setTimeout(() => {
             // Defer check slightly to ensure state update
          }, 500);
      }
  };

  const executeQueue = async () => {
      const queue = commandQueueRef.current;
      
      // Use local vars to track state through the async loop
      let currentPos = { ...currentLevel.startPos };
      let currentDir = currentLevel.startDir;
      let currentFuelCollected = false;

      for (let i = 0; i < queue.length; i++) {
        const cmd = queue[i];
        
        await new Promise<void>((resolve) => {
          const id = setTimeout(() => {
            setGameState(prev => {
                let newPos = { ...prev.characterPos };
                let newDir = prev.characterDir;
                let msg = null;
                let newFuelCollected = prev.fuelCollected;
                
                newFuelCollected = currentFuelCollected; 
                newPos = currentPos;
                newDir = currentDir;
                const newVisited = [...prev.visited];

                if (!newVisited.some(v => v.x === newPos.x && v.y === newPos.y)) {
                    newVisited.push(newPos);
                }

                if (cmd.type === 'MOVE') {
                   const moveVector = getDirVector(newDir);
                   const nextX = newPos.x + moveVector.x;
                   const nextY = newPos.y + moveVector.y;

                   const isBlocked = 
                      nextX < 0 || nextX >= currentLevel.gridSize ||
                      nextY < 0 || nextY >= currentLevel.gridSize ||
                      currentLevel.obstacles.some(o => o.x === nextX && o.y === nextY);

                   if (!isBlocked) {
                      newPos = { x: nextX, y: nextY };
                   } else {
                      msg = "อุ๊ย! ชนกำแพง";
                   }
                } else if (cmd.type === 'TURN_LEFT') {
                    newDir = (newDir + 3) % 4;
                } else if (cmd.type === 'TURN_RIGHT') {
                    newDir = (newDir + 1) % 4;
                } else if (cmd.type === 'COLLECT') {
                    if (currentLevel.fuelPos && newPos.x === currentLevel.fuelPos.x && newPos.y === currentLevel.fuelPos.y) {
                        newFuelCollected = true;
                        msg = "เติมน้ำมันเรียบร้อย! ⛽";
                    } else {
                        msg = "ไม่มีอะไรให้เติมตรงนี้นะ";
                    }
                }

                // Update local vars
                currentPos = newPos;
                currentDir = newDir;
                currentFuelCollected = newFuelCollected;

                return {
                    ...prev,
                    characterPos: newPos,
                    characterDir: newDir,
                    fuelCollected: newFuelCollected,
                    message: msg,
                    visited: newVisited
                };
            });
            setStepIndex(i + 1);
            resolve();
          }, 800);
          timeoutsRef.current.push(id);
        });
      }

      const checkId = setTimeout(() => {
          checkWinCondition(currentPos, currentFuelCollected);
      }, 500);
      timeoutsRef.current.push(checkId);
  };

  const getDirVector = (dir: Direction): Position => {
    switch (dir) {
        case Direction.NORTH: return { x: 0, y: -1 };
        case Direction.EAST: return { x: 1, y: 0 };
        case Direction.SOUTH: return { x: 0, y: 1 };
        case Direction.WEST: return { x: -1, y: 0 };
    }
  };

  const checkWinCondition = (finalPos: Position, hasCollectedFuel: boolean) => {
     const isAtGoal = finalPos.x === currentLevel.goalPos.x && finalPos.y === currentLevel.goalPos.y;
     const needsFuel = !!currentLevel.fuelPos;

     if (isAtGoal) {
         if (needsFuel && !hasCollectedFuel) {
             setGameState(prev => ({ ...prev, isRunning: false, message: "ถึงดาวแล้ว แต่ลืมเติมน้ำมันครับ! ⛽" }));
             speak("ถึงดาวแล้ว แต่ลืมเติมน้ำมันนะครับ");
         } else {
             setGameState(prev => ({ ...prev, isCompleted: true, isRunning: false, message: "เย้! เก่งมากๆ เลยครับ" }));
             speak("เก่งมากๆ เลยครับ ผ่านด่านแล้ว");
             if (!completedLevels.includes(currentLevel.id)) {
                 setCompletedLevels(prev => [...prev, currentLevel.id]);
             }
             
             // Check if this was the last level
             if (currentLevel.id === LEVELS.length) {
                 setTimeout(() => {
                     setShowCertificate(true);
                     speak("ยินดีด้วยครับ คุณได้เรียนจบหลักสูตร Block Coding เบื้องต้นแล้ว เก่งที่สุดเลย!");
                 }, 1500);
             }
         }
     } else {
         if (stepIndex >= commandQueueRef.current.length) {
            setGameState(prev => ({ ...prev, isRunning: false, message: "ยังไม่ถึงดาว ลองพยายามอีกนิดนะ" }));
            speak("ยังไม่ถึงดาว ลองพยายามอีกนิดนะครับ");
         }
     }
  };

  // --- LANDING PAGE ---
  if (showLanding) {
      return (
          <div className="h-screen w-full bg-gradient-to-b from-blue-100 to-indigo-200 flex flex-col items-center justify-center p-4 relative overflow-hidden">
              <div className="absolute top-10 left-10 w-32 h-32 bg-yellow-300 rounded-full blur-3xl opacity-50"></div>
              <div className="absolute bottom-20 right-20 w-64 h-64 bg-pink-300 rounded-full blur-3xl opacity-50"></div>

              <div className="bg-white/80 backdrop-blur-md p-10 rounded-3xl shadow-2xl flex flex-col items-center max-w-2xl w-full text-center border-4 border-white animate-in zoom-in duration-500">
                  <div className="bg-indigo-600 p-6 rounded-full mb-6 shadow-lg animate-bounce">
                      <Bot size={80} className="text-white" />
                  </div>
                  
                  <h1 className="text-6xl font-black text-indigo-700 mb-2 font-display tracking-wide">
                      Code Craft
                  </h1>
                  <h2 className="text-2xl font-bold text-gray-600 mb-8 font-display">
                      บทเรียน Block Coding เบื้องต้น
                  </h2>

                  <button 
                    onClick={handleStart}
                    className="group relative px-10 py-5 bg-green-500 rounded-full shadow-xl hover:bg-green-400 hover:scale-105 transition-all duration-300"
                  >
                      <span className="text-3xl font-bold text-white flex items-center gap-3">
                          <Play fill="currentColor" /> เริ่มเรียนรู้
                      </span>
                      <div className="absolute inset-0 rounded-full ring-4 ring-green-300 animate-ping opacity-50"></div>
                  </button>

                  <div className="mt-12 pt-8 border-t-2 border-dashed border-gray-300 w-full">
                      <p className="text-gray-500 text-sm font-semibold">ผู้พัฒนา</p>
                      <p className="text-indigo-800 text-lg font-bold">นายธนิท ธนพัตนิรัชกุล</p>
                      <p className="text-gray-600">ครูโรงเรียนกาฬนสินธุ์ปัญญานุกูล จังหวัดกาฬสินธุ์</p>
                  </div>
              </div>
          </div>
      );
  }

  // --- CERTIFICATE MODAL ---
  if (showCertificate) {
      return (
          <div className="h-screen w-full bg-indigo-900/90 backdrop-blur-sm flex items-center justify-center p-4 z-50 fixed inset-0">
             <div className="bg-white rounded-3xl p-10 max-w-3xl w-full text-center border-8 border-yellow-400 shadow-2xl animate-in zoom-in duration-700 relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500"></div>
                 
                 <div className="flex justify-center mb-6">
                     <Award className="w-32 h-32 text-yellow-400 drop-shadow-lg animate-bounce" fill="currentColor" />
                 </div>
                 
                 <h1 className="text-4xl md:text-5xl font-black text-indigo-800 mb-6 font-display">
                     ยินดีด้วย!
                 </h1>
                 <p className="text-2xl md:text-3xl text-gray-700 font-bold mb-8 leading-relaxed">
                     คุณได้เรียนจบหลักสูตร<br/>
                     <span className="text-indigo-600">Block Coding เบื้องต้น</span> แล้ว
                 </p>
                 
                 <div className="flex justify-center gap-4">
                     <button 
                        onClick={() => {
                            setShowCertificate(false);
                            setShowLanding(true);
                            setCurrentLevelIndex(0);
                            setCompletedLevels([]);
                            if (bgmRef.current) bgmRef.current.pause();
                        }}
                        className="px-8 py-4 bg-green-500 text-white rounded-full text-xl font-bold shadow-lg hover:bg-green-400 hover:scale-105 transition-all flex items-center gap-2"
                     >
                        <Home /> กลับหน้าแรก
                     </button>
                 </div>
             </div>
          </div>
      );
  }

  // --- MAIN APP ---
  return (
    <div className="h-screen flex flex-col bg-slate-50 overflow-hidden font-sans">
      
      {/* Top Bar */}
      <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8 shadow-sm z-20 relative">
          <button onClick={() => setShowLanding(true)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-indigo-600 absolute left-4">
               <Home size={28} />
          </button>
          
          <div className="flex-1 flex justify-center items-center gap-3">
             <Bot className="text-indigo-600 w-8 h-8 md:w-10 md:h-10" />
             <span className="text-3xl font-black text-indigo-800 tracking-tight drop-shadow-sm font-display">Code Craft</span>
          </div>

          <div className="absolute right-4 flex items-center gap-2">
               <button 
                  onClick={toggleMusic}
                  className={`p-3 rounded-full transition-all ${isMusicPlaying ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'}`}
                  title="เปิด/ปิด เพลง"
               >
                   {isMusicPlaying ? <Music size={24} className="animate-pulse" /> : <Music4 size={24} />}
               </button>
          </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Panel */}
        <div className="w-full md:w-3/12 flex flex-col border-r border-gray-200 bg-white shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10">
            <div className="bg-indigo-500 text-white text-center py-1 font-bold text-sm uppercase tracking-widest shadow-inner">
               ส่วนคำสั่ง
            </div>

            <div className="p-4 bg-indigo-50 border-b border-indigo-100 flex items-center justify-between">
               <button 
                  onClick={() => setCurrentLevelIndex(Math.max(0, currentLevelIndex - 1))}
                  disabled={currentLevelIndex === 0}
                  className="p-2 bg-white rounded-lg hover:bg-indigo-100 disabled:opacity-30 disabled:hover:bg-white shadow-sm transition-all text-indigo-700"
               >
                  <ChevronLeft size={32} />
               </button>
               <div className="text-center">
                   <span className="text-sm text-indigo-400 font-bold uppercase tracking-wider">บทเรียน</span>
                   <div className="text-2xl font-black text-indigo-800 leading-none">{currentLevel.id} / {LEVELS.length}</div>
               </div>
               <button 
                  onClick={() => setCurrentLevelIndex(Math.min(LEVELS.length - 1, currentLevelIndex + 1))}
                  disabled={currentLevelIndex === LEVELS.length - 1}
                  className="p-2 bg-white rounded-lg hover:bg-indigo-100 disabled:opacity-30 disabled:hover:bg-white shadow-sm transition-all text-indigo-700"
               >
                  <ChevronRight size={32} />
               </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="bg-yellow-50 p-6 rounded-3xl border-2 border-yellow-200 shadow-sm relative group">
                    <button 
                        onClick={() => speak(currentLevel.title + ". " + currentLevel.description)}
                        className="absolute top-3 right-3 p-3 bg-white rounded-full shadow-sm hover:scale-110 text-yellow-500 transition-all"
                    >
                        <Volume2 size={24} />
                    </button>
                    <h2 className="text-2xl font-black text-indigo-900 mb-3">{currentLevel.title}</h2>
                    <p className="text-xl text-gray-700 leading-relaxed font-medium">
                        {currentLevel.description}
                    </p>
                </div>
                
                <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100">
                    <h3 className="text-lg font-bold text-blue-800 mb-2 flex items-center gap-2">
                        💡 คำใบ้:
                    </h3>
                    <p className="text-lg text-blue-700">{currentLevel.hint}</p>
                </div>

                <div className="pt-4 border-t border-gray-100">
                    <p className="text-gray-400 font-bold text-sm mb-3 text-center">ความคืบหน้าของคุณ</p>
                    <div className="grid grid-cols-5 gap-2 px-2 pb-10">
                        {LEVELS.map((l, idx) => (
                            <button 
                            key={l.id}
                            onClick={() => setCurrentLevelIndex(idx)}
                            className={`
                                aspect-square rounded-xl flex items-center justify-center font-bold text-lg transition-all
                                ${currentLevelIndex === idx ? 'ring-2 ring-indigo-400 ring-offset-2 scale-105 z-10' : ''}
                                ${completedLevels.includes(l.id) 
                                    ? 'bg-green-400 text-white shadow-green-200' 
                                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}
                            `}
                            >
                            {l.id}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        {/* Middle Panel: Workspace */}
        <div className="w-full md:w-5/12 flex flex-col relative bg-slate-100 border-r border-gray-200">
            <div className="bg-indigo-500 text-white text-center py-1 font-bold text-sm uppercase tracking-widest shadow-inner flex justify-center items-center gap-2">
                <Code size={14} /> พื้นที่เขียนโค้ด
            </div>

            <div className="flex-1 relative">
                <BlocklyComponent 
                    initialXml={`<xml><block type="kru_start" x="40" y="40"></block></xml>`}
                    toolbox={currentLevel.allowedBlocks}
                    onCodeChange={setCode}
                    onBlockCountChange={setBlockCount}
                />
                
                <div className={`
                    absolute top-4 right-4 px-4 py-2 rounded-full font-bold shadow-md text-sm border-2
                    ${blockCount > currentLevel.idealBlockCount ? 'bg-orange-100 border-orange-200 text-orange-600' : 'bg-white border-indigo-100 text-indigo-600'}
                `}>
                    <span className="flex items-center gap-2">
                        <Puzzle size={16} /> 
                        แนะนำ: {blockCount} / {currentLevel.idealBlockCount}
                    </span>
                </div>
            </div>
            
            <div className="p-4 bg-white border-t border-gray-200 flex items-center justify-between shadow-xl z-20">
                <button 
                    onClick={resetLevel}
                    className="flex flex-col items-center gap-1 text-gray-400 hover:text-red-500 transition-colors px-4 py-2 rounded-xl hover:bg-red-50"
                >
                    <RotateCcw size={24} />
                    <span className="text-xs font-bold">เริ่มใหม่</span>
                </button>

                <div className="flex gap-2">
                    <button 
                        onClick={handleStep}
                        className="flex flex-col items-center justify-center gap-1 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-xl hover:bg-yellow-200 transition-colors border-2 border-yellow-200"
                    >
                         <SkipForward size={24} />
                         <span className="text-xs font-bold">ทีละก้าว</span>
                    </button>

                    <button 
                        onClick={handleRun}
                        disabled={gameState.isRunning}
                        className={`
                            flex items-center gap-3 px-8 py-3 rounded-full shadow-lg transform transition-all
                            ${gameState.isRunning 
                                ? 'bg-gray-200 text-gray-400 cursor-wait scale-95' 
                                : 'bg-green-500 hover:bg-green-400 text-white hover:scale-105 shadow-green-200'}
                        `}
                    >
                        <Play size={28} fill="currentColor" />
                        <span className="text-xl font-black tracking-wide">รันคำสั่ง</span>
                    </button>
                </div>
            </div>
        </div>

        {/* Right Panel: Stage */}
        <div className="w-full md:w-4/12 bg-white flex flex-col p-6 border-l border-gray-100 relative shadow-[-4px_0_24px_rgba(0,0,0,0.02)] z-0">
            <Stage level={currentLevel} gameState={gameState} />
            
            {gameState.isCompleted && currentLevelIndex < LEVELS.length - 1 && (
                <div className="mt-6 animate-in slide-in-from-bottom duration-500 fade-in fill-mode-forwards">
                    <button 
                        onClick={() => setCurrentLevelIndex(currentLevelIndex + 1)}
                        className="w-full py-5 bg-indigo-600 text-white text-2xl font-black rounded-2xl shadow-xl shadow-indigo-200 hover:bg-indigo-500 hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
                    >
                        ไปบทถัดไป <ChevronRight strokeWidth={4} />
                    </button>
                </div>
            )}
        </div>
      </div>

    </div>
  );
};

export default App;
