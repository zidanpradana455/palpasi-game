import { useState, useEffect } from 'react';

export const TypewriterBox = ({ speaker, text, onNext }: { speaker: string, text: string, onNext: () => void }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    setDisplayedText('');
    setIsFinished(false);
    let index = 0;
    const interval = window.setInterval(() => {
      index += 1;
      setDisplayedText(text.substring(0, index));
      if (index >= text.length) {
        window.clearInterval(interval);
        setIsFinished(true);
      }
    }, 24);

    return () => window.clearInterval(interval);
  }, [text]);

  const handleClick = () => {
    if (isFinished) {
      onNext();
    } else {
      setDisplayedText(text);
      setIsFinished(true);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="absolute bottom-8 left-1/2 -translate-x-1/2 w-11/12 max-w-4xl glass-panel p-8 text-left cursor-pointer transition-transform duration-200 hover:-translate-y-1 active:scale-[0.99] z-50"
      aria-label="Lanjutkan dialog"
    >
      <div className="absolute -top-6 left-12">
        <div className="bg-violet-600 text-white px-7 py-2 rounded-full font-bold shadow-2xl text-lg tracking-wide">
          {speaker}
        </div>
      </div>
      <div className="text-white/95 text-xl leading-relaxed mt-2 min-h-[6rem] whitespace-pre-wrap">
        {displayedText}
      </div>
      <div className="mt-6 flex items-center justify-between text-sm text-white/60">
        <span>{isFinished ? 'Klik untuk melanjutkan' : 'Sedang mengetik…'}</span>
        {isFinished && <span className="inline-flex h-2.5 w-2.5 rounded-full bg-white animate-pulse" />}
      </div>
    </button>
  );
}
