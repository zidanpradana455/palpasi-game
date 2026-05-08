import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ClipboardList, Clock, Activity, ShieldCheck, Stethoscope, Beaker, FileCheck2, ScrollText, SkipForward, UserCheck } from 'lucide-react';
import { TypewriterBox } from './components/TypewriterBox';
import { SCENARIO_DATA, DialogNode, ActionOption } from './data';

type GamePhase = 'PINTU' | 'SKENARIO' | 'FISIK' | 'PENUNJANG' | 'KONKLUSI' | 'SCORING';

export default function App() {
  const [phase, setPhase] = useState<GamePhase>('PINTU');
  
  // Game State
  const [timeRemaining, setTimeRemaining] = useState(15 * 60); // 15 mins
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [clipboard, setClipboard] = useState<string[]>([]);
  const [showClipboard, setShowClipboard] = useState(false);
  const [scoreLog, setScoreLog] = useState<Record<string, boolean>>({});
  
  // Dialog State
  const [dialogQueue, setDialogQueue] = useState<DialogNode[]>([]);
  const [currentDialogIndex, setCurrentDialogIndex] = useState(0);
  
  // Action State
  const [completedFisik, setCompletedFisik] = useState<string[]>([]);
  const [completedPenunjang, setCompletedPenunjang] = useState<string[]>([]);
  const [pendingAction, setPendingAction] = useState<{ option: ActionOption; category: 'FISIK' | 'PENUNJANG' } | null>(null);
  const [shuffledFisikOptions, setShuffledFisikOptions] = useState<ActionOption[]>([]);
  const [shuffledPenunjangOptions, setShuffledPenunjangOptions] = useState<ActionOption[]>([]);
  const [shuffledDkOptions, setShuffledDkOptions] = useState<Array<{ id: string; label: string; isCorrect: boolean }>>([]);
  const [shuffledDdOptions, setShuffledDdOptions] = useState<Array<{ id: string; label: string; isCorrect: boolean }>>([]);
  const [shuffledTxOptions, setShuffledTxOptions] = useState<Array<{ id: string; label: string; isCorrect: boolean }>>([]);
  const [fisikOrder, setFisikOrder] = useState<string[]>([]);
  
  // Final Form State
  const [konklusiAnswers, setKonklusiAnswers] = useState({
    dk: '',
    dd: [] as string[],
    tatalaksana: ''
  });

  // Background & Sprite
  const [currentBg, setCurrentBg] = useState(SCENARIO_DATA.stageBg.doorClosed);
  const [currentSprite, setCurrentSprite] = useState('');

  const shuffleArray = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);
  const shuffleActionOption = (option: ActionOption) => {
    if (!option.checkOptions) return option;
    return {
      ...option,
      checkOptions: shuffleArray(option.checkOptions)
    };
  };

  const randomizeGameOptions = () => {
    setShuffledFisikOptions(shuffleArray(SCENARIO_DATA.fisikOptions).map(shuffleActionOption));
    setShuffledPenunjangOptions(shuffleArray(SCENARIO_DATA.penunjangOptions).map(shuffleActionOption));
    setShuffledDkOptions(shuffleArray(SCENARIO_DATA.konklusi.dk.options));
    setShuffledDdOptions(shuffleArray(SCENARIO_DATA.konklusi.dd.options));
    setShuffledTxOptions(shuffleArray(SCENARIO_DATA.konklusi.tatalaksana.options));
  };

  const resetGame = () => {
    setPhase('PINTU');
    setTimeRemaining(15 * 60);
    setIsTimerActive(false);
    setClipboard([]);
    setShowClipboard(false);
    setScoreLog({});
    setDialogQueue([]);
    setCurrentDialogIndex(0);
    setCompletedFisik([]);
    setCompletedPenunjang([]);
    setPendingAction(null);
    setFisikOrder([]);
    setKonklusiAnswers({
      dk: '',
      dd: [],
      tatalaksana: ''
    });
    setCurrentBg(SCENARIO_DATA.stageBg.doorClosed);
    setCurrentSprite('');
    randomizeGameOptions();
  };

  useEffect(() => {
    randomizeGameOptions();
  }, []);

  // Start Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timeRemaining]);

  const formatTime = (secs: number) => {
    const min = Math.floor(secs / 60);
    const sec = secs % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const handleEnterRoom = () => {
    setCurrentBg(SCENARIO_DATA.stageBg.doorOpen);
    setTimeout(() => {
      setPhase('SKENARIO');
      setIsTimerActive(true);
      setDialogQueue(SCENARIO_DATA.introDialog);
      setCurrentDialogIndex(0);
      setCurrentBg(SCENARIO_DATA.introDialog[0].bg || SCENARIO_DATA.stageBg.examRoom);
      setCurrentSprite(SCENARIO_DATA.introDialog[0].sprite || '');
    }, 600);
  };

  const advanceDialog = () => {
    if (currentDialogIndex < dialogQueue.length - 1) {
      const nextIndex = currentDialogIndex + 1;
      setCurrentDialogIndex(nextIndex);
      if (dialogQueue[nextIndex].bg) setCurrentBg(dialogQueue[nextIndex].bg!);
      setCurrentSprite(dialogQueue[nextIndex].sprite || '');
    } else {
      setDialogQueue([]);
      setCurrentDialogIndex(0);

      if (phase === 'SKENARIO') {
        setPhase('FISIK');
        setCurrentBg(SCENARIO_DATA.stageBg.examRoom);
        setCurrentSprite('');
      } else if (phase === 'FISIK') {
        setCurrentBg(SCENARIO_DATA.stageBg.examRoom);
        setCurrentSprite('');
      } else if (phase === 'PENUNJANG') {
        setCurrentBg(SCENARIO_DATA.stageBg.examRoom);
        setCurrentSprite('');
      }
    }
  };

  const correctFisikOrder = ['kakuKuduk', 'brudI', 'brudII', 'kernig'];
  
  const isFisikOrderCorrect = () => {
    return fisikOrder.length === correctFisikOrder.length && 
           fisikOrder.every((id, index) => id === correctFisikOrder[index]);
  };

  const completeAction = (option: ActionOption, actionCategory: 'FISIK' | 'PENUNJANG') => {
    if (actionCategory === 'FISIK') {
      if (!completedFisik.includes(option.id)) {
        setCompletedFisik([...completedFisik, option.id]);
        setFisikOrder([...fisikOrder, option.id]);
        setClipboard(prev => [...prev, option.clipboardEntry]);
        setScoreLog(prev => ({ ...prev, [option.id]: true }));
      }
    } else {
      if (!completedPenunjang.includes(option.id)) {
        setCompletedPenunjang([...completedPenunjang, option.id]);
        setClipboard(prev => [...prev, option.clipboardEntry]);
        setScoreLog(prev => ({ ...prev, [option.id]: true }));
      }
    }

    setDialogQueue([option.dialog]);
    setCurrentDialogIndex(0);
    setCurrentBg(option.dialog.bg || SCENARIO_DATA.stageBg.examRoom);
    setCurrentSprite(option.dialog.sprite || '');
  };

  const handleActionSelect = (option: ActionOption, actionCategory: 'FISIK' | 'PENUNJANG') => {
    if (actionCategory === 'FISIK') {
      // Check if this is the correct next examination in sequence
      const expectedNextId = correctFisikOrder[fisikOrder.length];
      if (option.id !== expectedNextId) {
        setDialogQueue([{
          speaker: 'Dokter Penguji',
          text: `Urutan pemeriksaan tidak tepat. Pemeriksaan selanjutnya yang seharusnya dilakukan adalah: ${SCENARIO_DATA.fisikOptions.find(opt => opt.id === expectedNextId)?.label || 'pemeriksaan yang sesuai urutan'}.`
        }]);
        setCurrentDialogIndex(0);
        setCurrentBg(SCENARIO_DATA.stageBg.examRoom);
        setCurrentSprite('');
        return;
      }
    }
    
    setPendingAction({ option, category: actionCategory });
  };

  const handleActionCheck = (choiceId: string) => {
    if (!pendingAction) return;

    const selectedChoice = pendingAction.option.checkOptions?.find(choice => choice.id === choiceId);
    if (!selectedChoice) return;

    if (selectedChoice.isCorrect) {
      completeAction(pendingAction.option, pendingAction.category);
    } else {
      setDialogQueue([{
        speaker: 'Dokter Penguji',
        text: pendingAction.option.wrongFeedback || 'Jawaban belum tepat. Kembali fokus pada pemeriksaan yang sesuai.'
      }]);
      setCurrentDialogIndex(0);
      setCurrentBg(pendingAction.option.dialog.bg || SCENARIO_DATA.stageBg.examRoom);
      setCurrentSprite(pendingAction.option.dialog.sprite || '');
    }

    setPendingAction(null);
  };

  const handleKonklusiSubmit = () => {
    if (!konklusiAnswers.dk || konklusiAnswers.dd.length < 3 || !konklusiAnswers.tatalaksana) {
      alert('Mohon lengkapi semua isian kesimpulan. Diagnosis banding minimal 3 pilihan.');
      return;
    }
    
    // Check correctness
    const isDcCorrect = SCENARIO_DATA.konklusi.dk.options.find(o => o.id === konklusiAnswers.dk)?.isCorrect;
    const correctDdIds = SCENARIO_DATA.konklusi.dd.options.filter(o => o.isCorrect).map(o => o.id);
    const isDdCorrect = konklusiAnswers.dd.every(id => correctDdIds.includes(id)) && 
                       correctDdIds.every(id => konklusiAnswers.dd.includes(id));
    const isTxCorrect = SCENARIO_DATA.konklusi.tatalaksana.options.find(o => o.id === konklusiAnswers.tatalaksana)?.isCorrect;
    
    setScoreLog(prev => ({ ...prev, dkCorrect: !!isDcCorrect, ddCorrect: !!isDdCorrect, txCorrect: !!isTxCorrect }));
    
    setIsTimerActive(false);
    setPhase('SCORING');
  };

  const calculateScore = () => {
    let score = 0;
    if (scoreLog['kakuKuduk']) score += 15;
    if (scoreLog['brudI']) score += 10;
    if (scoreLog['brudII']) score += 10;
    if (scoreLog['kernig']) score += 15;
    if (scoreLog['lumbal']) score += 20;
    if (scoreLog['dkCorrect']) score += 15;
    if (scoreLog['ddCorrect']) score += 5;
    if (scoreLog['txCorrect']) score += 10;
    return score;
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black font-sans text-gray-800">
      
      {/* Background Layer */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentBg}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 bg-cover bg-center grayscale-0"
          style={{ backgroundImage: `url(${currentBg})`, backgroundColor: '#0F172A' }}
        >
          {/* Overlay layers */}
          <div className="absolute inset-0 atmosphere z-0" />
          <div className="absolute inset-0 vignette z-10" />
          <svg className="absolute inset-0 w-full h-full opacity-20 z-0" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </motion.div>
      </AnimatePresence>

      {/* Sprite Layer */}
      {currentSprite && dialogQueue.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.5 }}
          className="absolute bottom-32 left-1/2 -translate-x-1/2 h-[70vh] pointer-events-none z-20 character-glow"
        >
          <img src={currentSprite} alt="Character" className="h-full object-contain drop-shadow-2xl" />
        </motion.div>
      )}

      {/* Scene: PINTU */}
      {phase === 'PINTU' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 z-40">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-0" />
          <motion.div 
            initial={{ y: -50, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }}
            className="glass-panel p-12 max-w-2xl text-center relative z-10"
          >
            <Activity className="w-16 h-16 mx-auto mb-6 text-violet-400" />
            <h1 className="text-5xl font-bold mb-4 tracking-tight text-white drop-shadow-lg">PALPASI</h1>
            <div className="inline-block px-6 py-2 rounded-full glass-panel-sm mb-10">
              <span className="text-white/80 font-medium tracking-widest uppercase text-sm">Stase 5 Neurologi</span>
            </div>
            
            <button 
              onClick={handleEnterRoom}
              className="w-full sm:w-auto mx-auto border border-violet-400/50 bg-violet-500/20 hover:bg-violet-500/40 text-white font-semibold py-4 px-12 rounded-full transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(139,92,246,0.3)] text-xl tracking-wide"
            >
              Masuk Ruangan
            </button>
            <p className="text-white/50 text-sm mt-6 font-mono">Waktu Ujian: 15 Menit</p>
          </motion.div>
        </div>
      )}

      {/* HUD (Heads Up Display) - Shown during gameplay */}
      {phase !== 'PINTU' && phase !== 'SCORING' && (
        <div className="absolute top-0 left-0 right-0 p-8 flex justify-between items-start pointer-events-none z-30">
          <div className="flex gap-4 pointer-events-auto">
            <button 
              onClick={() => setShowClipboard(!showClipboard)}
              className="glass-panel-sm rounded-full px-6 py-2 flex items-center gap-3 text-white/80 font-medium tracking-wide hover:bg-white/10 transition-colors"
            >
              <ClipboardList className="w-5 h-5 text-emerald-400" />
              Papan Klip ({clipboard.length})
            </button>
            
          </div>

          <div className="glass-panel-sm rounded-full px-6 py-2 flex items-center gap-3 font-mono text-lg tracking-wider text-white/80 pointer-events-auto">
            <Clock className={`w-5 h-5 ${timeRemaining < 300 ? 'text-red-400 animate-pulse' : 'text-violet-400'}`} />
            <span className={timeRemaining < 300 ? 'text-red-400' : ''}>
              {formatTime(timeRemaining)}
            </span>
          </div>
        </div>
      )}

      {/* Clipboard Sidebar */}
      <AnimatePresence>
        {showClipboard && (
          <motion.div 
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            className="absolute top-28 left-8 bottom-32 w-80 glass-panel-sm flex flex-col pointer-events-auto z-40 rounded-2xl overflow-hidden"
          >
            <div className="bg-white/10 text-white px-6 py-4 font-semibold flex justify-between items-center border-b border-white/10">
              <span className="tracking-wide">Catatan Rekam Medis</span>
              <button onClick={() => setShowClipboard(false)} className="text-white/50 hover:text-white transition-colors">✕</button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              {clipboard.length === 0 ? (
                <div className="text-white/40 text-center italic mt-10">Belum ada temuan dicatat.</div>
              ) : (
                <ul className="space-y-3">
                  {clipboard.map((item, i) => (
                    <li key={i} className="bg-white/5 p-4 rounded-xl shadow-sm border border-white/10 text-sm font-medium text-white/90">
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Gameplay Area (Menus) */}
      {dialogQueue.length === 0 && !pendingAction && (
        <div className="absolute inset-y-0 left-12 flex items-center z-30 pointer-events-none">
          {phase === 'FISIK' && (
             <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-3 w-80 pointer-events-auto glass-panel p-6">
               <div className="text-white/90 font-bold px-2 py-2 mb-2 border-b border-white/10 flex items-center gap-2">
                 <Stethoscope className="w-5 h-5 text-emerald-400" /> Tindakan Fisik
               </div>
               <div className="flex flex-col gap-3">
                 {shuffledFisikOptions.map((opt, index) => {
                   const isCompleted = completedFisik.includes(opt.id);
                   
                   return (
                     <button 
                       key={opt.id} 
                       onClick={() => handleActionSelect(opt, 'FISIK')}
                       className={`text-left px-5 py-4 rounded-xl text-sm font-medium transition ${
                         isCompleted 
                           ? 'bg-white/5 text-white/50 border border-white/10 cursor-default' 
                           : 'choice-button text-white'
                       }`}
                       disabled={isCompleted}
                     >
                       <div className="flex items-center gap-3">
                         <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                           isCompleted 
                             ? 'bg-green-500/20 text-green-400'
                             : 'bg-gray-600/50 text-gray-400'
                         }`}>
                           {isCompleted ? '✓' : ''}
                         </span>
                         <span>{opt.label}</span>
                       </div>
                     </button>
                   );
                 })}
               </div>
               <button 
                 onClick={() => {
                   if (completedFisik.length === SCENARIO_DATA.fisikOptions.length && isFisikOrderCorrect()) {
                     setPhase('PENUNJANG');
                   } else {
                     setDialogQueue([{
                       speaker: 'Dokter Penguji',
                       text: 'Anda belum menyelesaikan semua pemeriksaan fisik dalam urutan yang benar. Pastikan semua pemeriksaan fisik telah dilakukan secara sistematis.'
                     }]);
                     setCurrentDialogIndex(0);
                     setCurrentBg(SCENARIO_DATA.stageBg.examRoom);
                     setCurrentSprite('');
                   }
                 }}
                 className={`mt-4 px-4 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition ${
                   completedFisik.length === SCENARIO_DATA.fisikOptions.length && isFisikOrderCorrect()
                     ? 'choice-button text-white'
                     : 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                 }`}
                 disabled={!(completedFisik.length === SCENARIO_DATA.fisikOptions.length && isFisikOrderCorrect())}
               >
                 Lanjut ke Lab <SkipForward className="w-4 h-4" />
               </button>
             </motion.div>
          )}

          {phase === 'PENUNJANG' && (
             <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-3 w-80 pointer-events-auto glass-panel p-6">
               <div className="text-white/90 font-bold px-2 py-2 mb-2 border-b border-white/10 flex items-center gap-2">
                 <Beaker className="w-5 h-5 text-violet-400" /> Pemeriksaan Penunjang
               </div>
               <div className="flex flex-col gap-3">
                 {shuffledPenunjangOptions.map(opt => (
                   <button 
                     key={opt.id} 
                     onClick={() => handleActionSelect(opt, 'PENUNJANG')}
                     className={`text-left px-5 py-4 rounded-xl text-sm font-medium transition ${
                       completedPenunjang.includes(opt.id) 
                        ? 'bg-white/5 text-white/50 border border-white/10 cursor-default' 
                        : 'choice-button text-white'
                     }`}
                   >
                     {opt.label} {completedPenunjang.includes(opt.id) && '✓'}
                   </button>
                 ))}
               </div>
               <button 
                 onClick={() => setPhase('FISIK')}
                 className="mt-2 text-white/50 hover:text-white transition-colors text-sm py-2"
               >
                 Kembali ke Fisik
               </button>

               <button 
                 onClick={() => setPhase('KONKLUSI')}
                 className="mt-2 text-emerald-400 border border-emerald-400/30 bg-emerald-400/10 hover:bg-emerald-400/20 px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition"
               >
                 Rumuskan Konklusi <FileCheck2 className="w-5 h-5" />
               </button>
             </motion.div>
          )}
        </div>
      )}

      {dialogQueue.length === 0 && pendingAction && (
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="absolute inset-y-0 left-12 flex items-center z-30 pointer-events-auto">
          <div className="flex flex-col gap-4 w-96 glass-panel p-6">
            <div className="text-white/90 font-bold px-2 py-2 mb-2 border-b border-white/10">
              Konfirmasi Pemeriksaan
            </div>
            <p className="text-white/80 text-sm leading-6">{pendingAction.option.checkPrompt || 'Pilih status pemeriksaan yang ingin Anda verifikasi.'}</p>
            <div className="flex flex-col gap-3">
              {pendingAction.option.checkOptions?.map(choice => (
                <button
                  key={choice.id}
                  onClick={() => handleActionCheck(choice.id)}
                  className="text-left px-5 py-4 rounded-xl choice-button text-white text-sm font-medium"
                >
                  {choice.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setPendingAction(null)}
              className="mt-4 text-white/60 hover:text-white text-sm"
            >
              Batalkan dan pilih pemeriksaan lain
            </button>
          </div>
        </motion.div>
      )}

      {/* Dialog Box Layer */}
      <AnimatePresence>
        {dialogQueue.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
          >
            <TypewriterBox 
              speaker={dialogQueue[currentDialogIndex].speaker}
              text={dialogQueue[currentDialogIndex].text}
              onNext={advanceDialog}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Konklusi Form Layer */}
      {phase === 'KONKLUSI' && (
        <div className="absolute inset-0 flex items-center justify-center p-6 z-40">
          {/* Overlay to dim background even more */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-0" />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            className="glass-panel p-10 max-w-2xl w-full relative z-10 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
              <ScrollText className="w-8 h-8 text-violet-400" />
              <h2 className="text-2xl font-bold text-white tracking-wide">Lembar Jawaban Akhir</h2>
            </div>

            <div className="space-y-6">
              {/* Diagnosis Kerja */}
              <div>
                <label className="block text-sm font-bold text-white/80 mb-3 ml-1 tracking-wide">
                  1. {SCENARIO_DATA.konklusi.dk.question}
                </label>
                <div className="space-y-3">
                  {shuffledDkOptions.map(opt => (
                    <label key={opt.id} className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition ${konklusiAnswers.dk === opt.id ? 'active-choice-button' : 'choice-button'}`}>
                      <input 
                        type="radio" 
                        name="dk" 
                        value={opt.id} 
                        onChange={(e) => setKonklusiAnswers({...konklusiAnswers, dk: e.target.value})}
                        className="w-5 h-5 accent-violet-500"
                      />
                      <span className="text-white/90 font-medium">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Diagnosis Banding */}
              <div>
                <label className="block text-sm font-bold text-white/80 mb-3 ml-1 tracking-wide">
                  2. {SCENARIO_DATA.konklusi.dd.question} (minimal 3 pilihan)
                </label>
                <div className="space-y-3">
                  {shuffledDdOptions.map(opt => (
                    <label key={opt.id} className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition ${konklusiAnswers.dd.includes(opt.id) ? 'active-choice-button' : 'choice-button'}`}>
                      <input 
                        type="checkbox" 
                        checked={konklusiAnswers.dd.includes(opt.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setKonklusiAnswers({...konklusiAnswers, dd: [...konklusiAnswers.dd, opt.id]});
                          } else {
                            setKonklusiAnswers({...konklusiAnswers, dd: konklusiAnswers.dd.filter(id => id !== opt.id)});
                          }
                        }}
                        className="w-5 h-5 accent-violet-500"
                      />
                      <span className="text-white/90 font-medium">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Tatalaksana */}
              <div>
                <label className="block text-sm font-bold text-white/80 mb-3 ml-1 tracking-wide">
                  3. {SCENARIO_DATA.konklusi.tatalaksana.question}
                </label>
                <div className="space-y-3">
                  {shuffledTxOptions.map(opt => (
                    <label key={opt.id} className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition ${konklusiAnswers.tatalaksana === opt.id ? 'active-choice-button' : 'choice-button'}`}>
                      <input 
                        type="radio" 
                        name="tx" 
                        value={opt.id} 
                        onChange={(e) => setKonklusiAnswers({...konklusiAnswers, tatalaksana: e.target.value})}
                        className="w-5 h-5 accent-violet-500"
                      />
                      <span className="text-white/90 font-medium">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <button 
              onClick={handleKonklusiSubmit}
              className="mt-8 w-full text-emerald-400 border border-emerald-400/30 bg-emerald-400/10 hover:bg-emerald-400/20 font-bold py-4 rounded-xl transition shadow-lg text-lg flex justify-center items-center gap-2"
            >
              Kumpulkan & Lihat Hasil <ShieldCheck className="w-6 h-6" />
            </button>
          </motion.div>
        </div>
      )}

      {/* Scoring Layer */}
      {phase === 'SCORING' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 z-50">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md z-0" />
           <motion.div 
            initial={{ scale: 0.8, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 200 } }} 
            className="glass-panel p-10 max-w-xl w-full text-center relative z-10 border-t-4 border-t-emerald-400"
          >
            <UserCheck className="w-20 h-20 mx-auto text-emerald-400 mb-4" />
            <h1 className="text-3xl font-bold mb-2 text-white">Ujian Selesai!</h1>
            <p className="text-white/60 mb-6 font-mono">Waktu tersisa: {formatTime(timeRemaining)}</p>
            
            <div className="bg-white/5 rounded-2xl p-6 mb-6 border border-white/10">
              <div className="text-sm text-white/50 uppercase tracking-widest mb-2 font-medium">Global Rating Score</div>
              <div className="text-7xl font-black text-white tracking-tighter">
                {calculateScore()} <span className="text-3xl text-white/30 tracking-normal font-medium">/ 100</span>
              </div>
            </div>

            <div className="text-left bg-black/20 p-6 rounded-xl space-y-3 text-white/80 border border-white/10 shadow-inner">
              <h3 className="font-bold text-white border-b border-white/20 pb-3 mb-4 tracking-wide">Rubrik Evaluasi</h3>
              <div className="flex justify-between items-center"><span className="text-sm">Pemeriksaan Meningeal</span> <span className="font-mono bg-white/10 px-2 py-0.5 rounded text-xs">{completedFisik.length} / 4 dilakukan</span></div>
              <div className="flex justify-between items-center"><span className="text-sm">Pemeriksaan Penunjang (Lumbal)</span> <span className={scoreLog['lumbal'] ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>{scoreLog['lumbal'] ? '✓ TEPAT' : '✗ TERLEWAT'}</span></div>
              <div className="flex justify-between items-center"><span className="text-sm">Diagnosis Kerja Sesuai</span> <span className={scoreLog['dkCorrect'] ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>{scoreLog['dkCorrect'] ? '✓ BENAR' : '✗ SALAH'}</span></div>
              <div className="flex justify-between items-center"><span className="text-sm">Tatalaksana Tepat</span> <span className={scoreLog['txCorrect'] ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>{scoreLog['txCorrect'] ? '✓ BENAR' : '✗ SALAH'}</span></div>
            </div>

            <button 
              onClick={resetGame}
              className="mt-8 bg-white text-[#0F172A] hover:bg-slate-200 font-bold py-4 px-8 rounded-full transition shadow-lg w-full text-lg"
            >
              Ulangi Simulasi
            </button>
          </motion.div>
        </div>
      )}

    </div>
  );
}
