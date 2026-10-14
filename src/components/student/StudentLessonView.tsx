import React, { useState, useEffect, useRef } from 'react';
import { Lesson, TraceStep } from '../../types';
import { interpretPythonCode, InterpretationResult } from '../../utils/pythonInterpreter';
import { Storage } from '../../utils/storage';
import {
  ArrowLeft,
  Play,
  RotateCcw,
  SkipForward,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Repeat,
  Terminal,
} from 'lucide-react';

interface StudentLessonViewProps {
  lesson: Lesson;
  sectionId: string;
  onBack: () => void;
  onComplete: () => void;
}

export const StudentLessonView: React.FC<StudentLessonViewProps> = ({
  lesson,
  sectionId,
  onBack,
  onComplete,
}) => {
  // Current code (can be updated when bug block is fixed)
  const [currentCode, setCurrentCode] = useState(lesson.code);
  const [isBugFixed, setIsBugFixed] = useState(!lesson.bugLineNumber || !lesson.correctBlock);
  const [fixSuccessMessage, setFixSuccessMessage] = useState<string | null>(null);
  const [hintMessage, setHintMessage] = useState<string | null>(null);
  const [isLessonCompleteScreen, setIsLessonCompleteScreen] = useState(false);

  // Interpretation state
  const [interp, setInterp] = useState<InterpretationResult>(() =>
    interpretPythonCode(lesson.code)
  );

  // Stepping & execution state
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const runTimerRef = useRef<any>(null);

  // Blocks for challenge (shuffled once or combined)
  const [challengeBlocks, setChallengeBlocks] = useState<string[]>([]);

  useEffect(() => {
    if (lesson.correctBlock) {
      const all = [lesson.correctBlock, ...(lesson.wrongBlocks || [])];
      // Deterministic order or slight mix
      setChallengeBlocks(all.sort(() => 0.5 - Math.random()));
    }
  }, [lesson]);

  // Re-run interpreter whenever code changes
  useEffect(() => {
    const res = interpretPythonCode(currentCode);
    setInterp(res);
    setCurrentStepIndex(0);
  }, [currentCode]);

  // Mark lesson in progress in storage
  useEffect(() => {
    Storage.markLessonInProgress(sectionId, lesson.id);
  }, [sectionId, lesson.id]);

  const steps = interp.steps;
  const totalSteps = Math.max(1, steps.length);
  const currentStep: TraceStep | undefined = steps[currentStepIndex];

  // Auto-play / Run loop
  useEffect(() => {
    if (isRunning) {
      runTimerRef.current = setTimeout(() => {
        if (currentStepIndex < steps.length - 1) {
          setCurrentStepIndex((prev) => prev + 1);
        } else {
          setIsRunning(false);
          // Check if complete
          if (isBugFixed) {
            handleCheckCompletion();
          }
        }
      }, 600);
    }
    return () => clearTimeout(runTimerRef.current);
  }, [isRunning, currentStepIndex, steps.length, isBugFixed]);

  const handleStep = () => {
    setIsRunning(false);
    if (currentStepIndex < steps.length - 1) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      if (nextIdx === steps.length - 1 && isBugFixed) {
        handleCheckCompletion();
      }
    }
  };

  const handleRunToggle = () => {
    if (currentStepIndex >= steps.length - 1) {
      setCurrentStepIndex(0);
    }
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    clearTimeout(runTimerRef.current);
    setCurrentStepIndex(0);
  };

  const handleCheckCompletion = () => {
    Storage.markLessonComplete(sectionId, lesson.id);
    setIsLessonCompleteScreen(true);
  };

  // Handle block drop / tap selection
  const handleSelectBlock = (blockText: string) => {
    setHintMessage(null);
    setFixSuccessMessage(null);

    if (blockText.trim() === lesson.correctBlock?.trim()) {
      // Fix the code! Replace the bug line with the correct block
      const lines = currentCode.split('\n');
      if (lesson.bugLineNumber && lesson.bugLineNumber <= lines.length) {
        const bugIdx = lesson.bugLineNumber - 1;
        const indent = lines[bugIdx].match(/^\s*/)?.[0] || '';
        lines[bugIdx] = indent + blockText.trim();
        const updated = lines.join('\n');
        setCurrentCode(updated);
        setIsBugFixed(true);
        setFixSuccessMessage('Nice, that fixes it!');
        // Automatically restart execution to show the fixed trace
        setCurrentStepIndex(0);
      }
    } else {
      // Wrong block: show plain-language hint
      setHintMessage(
        lesson.hint ||
          'Not quite. Think about how this variable should accumulate on each loop iteration.'
      );
    }
  };

  // If code is unsupported by interpreter
  if (!interp.valid) {
    return (
      <div className="min-h-screen bg-[#0d0814] text-white flex flex-col p-6 items-center justify-center">
        <div className="p-8 rounded-3xl bg-[#170e26] border border-[#3b2060] text-center max-w-md space-y-4">
          <AlertCircle className="w-10 h-10 text-[#f59e0b] mx-auto" />
          <h2 className="text-lg font-bold text-white">Visualizer Notice</h2>
          <p className="text-xs text-[#a78bfa] leading-relaxed">
            {interp.error || "This lesson can't be visualized yet."}
          </p>
          <button
            type="button"
            onClick={onBack}
            className="px-5 py-2.5 rounded-2xl bg-[#2a1444] text-white font-bold text-xs"
          >
            ← Return to Roadmap
          </button>
        </div>
      </div>
    );
  }

  // LESSON COMPLETE SCREEN
  if (isLessonCompleteScreen) {
    return (
      <div className="min-h-screen bg-[#0d0814] text-white flex flex-col items-center justify-center p-6 relative">
        <div className="max-w-md w-full p-8 rounded-3xl bg-[#170e26] border border-[#3b2060] text-center space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-[#22c55e] border-4 border-[#22c55e] flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(34,197,94,0.3)]">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold text-white">Lesson complete</h1>
            <p className="text-xs text-[#a78bfa]">
              You verified the execution trace and resolved the computational logic challenge.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#221338] border border-[#371b5a] text-xs text-[#cbd5e1] leading-relaxed">
            {lesson.title} is now marked complete on your classroom roadmap. The next skill node is unlocked!
          </div>

          <div>
            <button
              type="button"
              onClick={onComplete}
              className="w-full py-4 rounded-2xl bg-[#9333ea] hover:bg-[#a855f7] text-white font-bold text-sm shadow-[0_4px_0_0_#6b21a8] cursor-pointer"
            >
              Continue on Roadmap
            </button>
          </div>
        </div>
      </div>
    );
  }

  const activeLineNumber = currentStep ? currentStep.lineNumber : 1;
  const codeLines = currentCode.split('\n');
  const executionStatus =
    currentStepIndex === 0
      ? 'READY'
      : currentStepIndex >= steps.length - 1
      ? 'DONE'
      : 'RUNNING';

  return (
    <div className="min-h-screen bg-[#0d0814] text-white flex flex-col font-sans">
      {/* Top Bar: back arrow, lesson title, small progress bar */}
      <header className="border-b border-[#26153d] bg-[#130b20]/90 backdrop-blur-md px-6 py-3.5 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="w-9 h-9 rounded-xl bg-[#22133a] hover:bg-[#301b50] text-[#c084fc] hover:text-white border border-[#3b2060] flex items-center justify-center transition-colors cursor-pointer"
              title="Back to Roadmap"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h1 className="text-sm md:text-base font-extrabold text-white truncate max-w-xs md:max-w-md">
              {lesson.title}
            </h1>
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-2.5">
            <span className="text-[11px] font-mono text-[#a78bfa] hidden sm:inline">
              Step {currentStepIndex + 1} / {totalSteps}
            </span>
            <div className="w-24 md:w-36 bg-[#271440] h-2.5 rounded-full overflow-hidden border border-[#3b2060]">
              <div
                className="bg-gradient-to-r from-[#9333ea] to-[#22c55e] h-full transition-all duration-200"
                style={{
                  width: `${Math.round(((currentStepIndex + 1) / totalSteps) * 100)}%`,
                }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Two-Panel Layout */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ========================================================= */}
        {/* LEFT PANEL: CODE & BLOCK CHALLENGE                        */}
        {/* ========================================================= */}
        <div className="flex flex-col space-y-4">
          {/* Code Window */}
          <div className="rounded-3xl bg-[#160c24] border border-[#2e1847] overflow-hidden flex flex-col shadow-xl">
            {/* Tab header */}
            <div className="bg-[#1f1033] px-4 py-2.5 border-b border-[#2e1847] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 mr-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" />
                </div>
                <span className="text-xs font-mono text-[#cbd5e1] font-semibold">
                  code_exercise.py
                </span>
              </div>

              {/* Status Badge */}
              <span
                className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-lg border ${
                  executionStatus === 'DONE'
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    : executionStatus === 'RUNNING'
                    ? 'bg-[#9333ea]/20 text-[#c084fc] border-[#a855f7]/40 animate-pulse'
                    : 'bg-[#26143d] text-[#a78bfa] border-[#3e1f66]'
                }`}
              >
                {executionStatus}
              </span>
            </div>

            {/* Code lines */}
            <div className="p-4 font-mono text-xs leading-relaxed overflow-x-auto space-y-1 bg-[#12081f]">
              {codeLines.map((line, idx) => {
                const lineNum = idx + 1;
                const isCurrent = lineNum === activeLineNumber;
                const isBugLine =
                  !isBugFixed && lesson.bugLineNumber === lineNum;

                return (
                  <div
                    key={idx}
                    className={`flex items-start rounded-lg px-2 py-1 transition-all ${
                      isCurrent
                        ? 'bg-[#a855f7]/25 text-white border-l-4 border-[#c084fc]'
                        : isBugLine
                        ? 'bg-rose-500/10 text-rose-200 border-l-4 border-[#ef4444]'
                        : 'text-[#d8b4fe]/80 border-l-4 border-transparent'
                    }`}
                  >
                    <span className="w-6 text-[11px] text-[#6b4c8f] select-none text-right mr-3 shrink-0">
                      {lineNum}
                    </span>
                    <span
                      className={`whitespace-pre ${
                        isBugLine
                          ? 'underline decoration-[#ef4444] decoration-2 font-bold text-rose-300'
                          : ''
                      }`}
                    >
                      {line || ' '}
                    </span>
                    {isBugLine && (
                      <span className="ml-auto text-[10px] font-bold text-[#ef4444] px-1.5 py-0.5 rounded bg-rose-500/20 border border-rose-500/30 shrink-0">
                        Bug
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* BLOCK CHALLENGE (Under the code) */}
          {lesson.correctBlock && (
            <div className="p-5 rounded-3xl bg-[#170e26] border border-[#2e1847] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#c084fc]" />
                  Block Challenge
                </span>
                {isBugFixed && (
                  <span className="text-[11px] font-bold text-[#22c55e] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Fixed
                  </span>
                )}
              </div>

              {!isBugFixed ? (
                <div className="space-y-3">
                  <p className="text-xs text-[#a78bfa]">
                    Tap or drag the correct block into the blank on line {lesson.bugLineNumber}:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {challengeBlocks.map((block, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectBlock(block)}
                        className="p-3 rounded-2xl bg-[#231238] hover:bg-[#321752] border border-[#3d1f60] hover:border-[#a855f7] text-left font-mono text-xs text-white hover:text-[#c084fc] transition-all shadow-[0_3px_0_0_#381c5a] active:translate-y-0.5 cursor-pointer"
                      >
                        {block}
                      </button>
                    ))}
                  </div>

                  {hintMessage && (
                    <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 shrink-0" />
                      <span>{hintMessage}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-[#22c55e] text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{fixSuccessMessage || 'Nice, that fixes it! Trace running with updated logic.'}</span>
                </div>
              )}
            </div>
          )}

          {/* Controls: Step, Run, Reset (Nothing else) */}
          <div className="grid grid-cols-3 gap-3 pt-1">
            <button
              type="button"
              onClick={handleStep}
              className="py-3.5 px-4 rounded-2xl bg-[#9333ea] hover:bg-[#a855f7] text-white font-bold text-xs md:text-sm flex items-center justify-center gap-2 shadow-[0_4px_0_0_#6b21a8] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
            >
              <SkipForward className="w-4 h-4 stroke-[2.5]" />
              <span>Step</span>
            </button>

            <button
              type="button"
              onClick={handleRunToggle}
              className="py-3.5 px-4 rounded-2xl bg-[#7e22ce] hover:bg-[#9333ea] text-white font-bold text-xs md:text-sm flex items-center justify-center gap-2 shadow-[0_4px_0_0_#581c87] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
            >
              <Play className={`w-4 h-4 fill-white ${isRunning ? 'animate-pulse' : ''}`} />
              <span>{isRunning ? 'Pause' : 'Run'}</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="py-3.5 px-4 rounded-2xl bg-[#231238] hover:bg-[#321752] text-[#c084fc] hover:text-white font-bold text-xs md:text-sm border border-[#3d1f60] flex items-center justify-center gap-2 shadow-[0_4px_0_0_#381c5a] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT PANEL: EXECUTION TRACE & OUTPUT                     */}
        {/* ========================================================= */}
        <div className="flex flex-col space-y-4">
          {/* Vertical Trace Flow */}
          <div className="flex-1 rounded-3xl bg-[#160c24] border border-[#2e1847] p-5 flex flex-col space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-[#2e1847]">
              <span className="text-xs font-bold uppercase tracking-wider text-[#c084fc]">
                Execution Trace
              </span>
              <span className="text-[11px] font-mono text-[#a78bfa]">
                Node {currentStepIndex + 1} of {totalSteps}
              </span>
            </div>

            {/* Trace nodes flow */}
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {steps.map((st, sIdx) => {
                const isCurrent = sIdx === currentStepIndex;
                const isCompleted = sIdx < currentStepIndex;

                return (
                  <div
                    key={sIdx}
                    className={`p-3 rounded-2xl text-xs font-mono transition-all flex items-center justify-between ${
                      isCurrent
                        ? 'bg-[#9333ea] text-white border-2 border-[#c084fc] shadow-[0_0_15px_rgba(168,85,247,0.5)] scale-[1.02]'
                        : isCompleted
                        ? 'bg-[#1b0e2b] text-[#8b6fa8] border border-[#2d1844] opacity-60'
                        : 'bg-[#12071d] text-[#553b6e] border border-[#241338] opacity-35'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {st.loopInfo && (
                        <Repeat className={`w-3.5 h-3.5 shrink-0 ${isCurrent ? 'text-amber-300' : ''}`} />
                      )}
                      <span className="truncate">{st.label}</span>
                    </div>

                    {st.loopInfo && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-lg shrink-0 ${
                          isCurrent
                            ? 'bg-amber-400 text-black font-bold'
                            : 'bg-[#29153f] text-[#a78bfa]'
                        }`}
                      >
                        Round {st.loopInfo.currentRound} of {st.loopInfo.totalRounds}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Variables strip under the flow */}
            <div className="pt-3 border-t border-[#26133f] space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-[#a78bfa] tracking-wider block">
                Variables
              </span>
              <div className="flex flex-wrap gap-2">
                {currentStep && Object.keys(currentStep.variables).length > 0 ? (
                  Object.entries(currentStep.variables).map(([name, val]) => {
                    const isChanged = currentStep.changedVar === name;
                    return (
                      <div
                        key={name}
                        className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all ${
                          isChanged
                            ? 'bg-[#c084fc] text-black border-white shadow-[0_0_12px_rgba(192,132,252,0.8)] scale-105'
                            : 'bg-[#221338] text-[#e9d5ff] border-[#3d1f60]'
                        }`}
                      >
                        <span>{name}:</span> <span className="ml-1 text-white">{String(val)}</span>
                      </div>
                    );
                  })
                ) : (
                  <span className="text-xs text-[#6b4c8f] italic">No variables declared yet</span>
                )}
              </div>
            </div>

            {/* Program Output Box */}
            <div className="pt-3 border-t border-[#26133f] space-y-1.5">
              <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-[#a78bfa] tracking-wider">
                <Terminal className="w-3 h-3 text-[#c084fc]" />
                <span>Program Output</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#0f0717] border border-[#241338] font-mono text-xs text-emerald-400 min-h-[50px] whitespace-pre-wrap">
                {currentStep && currentStep.output ? currentStep.output : 'Waiting...'}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
