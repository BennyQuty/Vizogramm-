import React from 'react';
import { BookOpen, Info, CheckCircle2, Layers } from 'lucide-react';
import { OFFICIAL_72_BANDS, PROVISIONAL_BANDS } from '../../utils/scoring';

export const ScoreInterpretationGuide: React.FC = () => {
  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#9d62ff]" />
          Score Interpretation Guide & Reference Norms
        </h2>
        <p className="text-xs text-[#94a3b8] mt-1">
          Standardization references, provisional scoring cutoffs, and cognitive transfer hypotheses for computing educators.
        </p>
      </div>

      {/* Provisional vs Official Comparison Banner */}
      <div className="p-4 rounded-xl bg-[#14141e] border border-[#2e2e42] flex items-start gap-3">
        <Info className="w-5 h-5 text-[#456dff] shrink-0 mt-0.5" />
        <div className="text-xs text-[#cbd5e1] leading-relaxed space-y-1">
          <strong className="text-white block">Adaptive Short Form Norming Notice:</strong>
          <span>
            Vizogramm employs a 24-item short-form adaptation of the Otis-Lennon School Ability Test (OLSAT) taxonomy. The cutoffs utilized for automated cohort classification represent mathematical scalings (one-third scaling, rounded down) derived from the official Level G Form 5 standardization tables.
          </span>
          <div className="text-amber-400 font-semibold pt-1">
            "Provisional bands, for demonstration; not official norms."
          </div>
        </div>
      </div>

      {/* Grid: 24-item Provisional Bands Table */}
      <div className="brilliant-card rounded-2xl overflow-hidden border border-[#2b2b3a]">
        <div className="p-4 bg-[#101018] border-b border-[#232330] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">24-Item Adapted Form Provisional Cutoffs</h3>
            <span className="text-[11px] text-[#94a3b8]">Used by Vizogramm live diagnostics</span>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
            Provisional Bands
          </span>
        </div>

        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-[#0e0e13] border-b border-[#21212c] text-[#94a3b8] uppercase text-[10px] tracking-wider">
            <tr>
              <th className="py-3 px-5">Cluster / Component</th>
              <th className="py-3 px-4 text-center">Items</th>
              <th className="py-3 px-4 text-center text-rose-300">Below Average</th>
              <th className="py-3 px-4 text-center text-blue-300">Average</th>
              <th className="py-3 px-4 text-center text-emerald-300">Above Average</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1c1c28]">
            <tr className="bg-[#121218] font-bold text-white">
              <td className="py-3 px-5">Total Composite</td>
              <td className="py-3 px-4 text-center">24</td>
              <td className="py-3 px-4 text-center font-mono">0 – 8</td>
              <td className="py-3 px-4 text-center font-mono">9 – 15</td>
              <td className="py-3 px-4 text-center font-mono">16 – 24</td>
            </tr>
            <tr className="font-semibold text-[#e2e8f0]">
              <td className="py-2.5 px-5 pl-8">Verbal Composite (VC + VR)</td>
              <td className="py-2.5 px-4 text-center">12</td>
              <td className="py-2.5 px-4 text-center font-mono">0 – 4</td>
              <td className="py-2.5 px-4 text-center font-mono">5 – 7</td>
              <td className="py-2.5 px-4 text-center font-mono">8 – 12</td>
            </tr>
            <tr className="text-[#cbd5e1]">
              <td className="py-2.5 px-5 pl-12">• Verbal Comprehension</td>
              <td className="py-2.5 px-4 text-center">4</td>
              <td className="py-2.5 px-4 text-center font-mono">0 – 1</td>
              <td className="py-2.5 px-4 text-center font-mono">2</td>
              <td className="py-2.5 px-4 text-center font-mono">3 – 4</td>
            </tr>
            <tr className="text-[#cbd5e1]">
              <td className="py-2.5 px-5 pl-12">• Verbal Reasoning</td>
              <td className="py-2.5 px-4 text-center">8</td>
              <td className="py-2.5 px-4 text-center font-mono">0 – 2</td>
              <td className="py-2.5 px-4 text-center font-mono">3 – 4</td>
              <td className="py-2.5 px-4 text-center font-mono">5 – 8</td>
            </tr>
            <tr className="font-semibold text-[#e2e8f0]">
              <td className="py-2.5 px-5 pl-8">Nonverbal Composite (FR + QR)</td>
              <td className="py-2.5 px-4 text-center">12</td>
              <td className="py-2.5 px-4 text-center font-mono">0 – 4</td>
              <td className="py-2.5 px-4 text-center font-mono">5 – 8</td>
              <td className="py-2.5 px-4 text-center font-mono">9 – 12</td>
            </tr>
            <tr className="text-[#cbd5e1]">
              <td className="py-2.5 px-5 pl-12">• Figural Reasoning</td>
              <td className="py-2.5 px-4 text-center">6</td>
              <td className="py-2.5 px-4 text-center font-mono">0 – 1</td>
              <td className="py-2.5 px-4 text-center font-mono">2 – 3</td>
              <td className="py-2.5 px-4 text-center font-mono">4 – 6</td>
            </tr>
            <tr className="text-[#cbd5e1]">
              <td className="py-2.5 px-5 pl-12">• Quantitative Reasoning</td>
              <td className="py-2.5 px-4 text-center">6</td>
              <td className="py-2.5 px-4 text-center font-mono">0 – 2</td>
              <td className="py-2.5 px-4 text-center font-mono">3 – 4</td>
              <td className="py-2.5 px-4 text-center font-mono">5 – 6</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Official 72-Item Reference Table (OLSAT Level G Form 5) */}
      <div className="brilliant-card rounded-2xl overflow-hidden border border-[#2b2b3a]">
        <div className="p-4 bg-[#101018] border-b border-[#232330]">
          <h3 className="text-sm font-bold text-white">
            Official Standardization Norms (OLSAT Level G Form 5, Table 45)
          </h3>
          <span className="text-[11px] text-[#94a3b8]">
            First-year college students, Spring administration (72 total items)
          </span>
        </div>

        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-[#0e0e13] border-b border-[#21212c] text-[#94a3b8] uppercase text-[10px] tracking-wider">
            <tr>
              <th className="py-3 px-5">Standard Cluster</th>
              <th className="py-3 px-4 text-center">Full Length</th>
              <th className="py-3 px-4 text-center">Below Average</th>
              <th className="py-3 px-4 text-center">Average</th>
              <th className="py-3 px-4 text-center">Above Average</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1c1c28]">
            <tr className="bg-[#121218] font-bold text-white">
              <td className="py-3 px-5">Total Score</td>
              <td className="py-3 px-4 text-center">72</td>
              <td className="py-3 px-4 text-center font-mono">{OFFICIAL_72_BANDS.total.below}</td>
              <td className="py-3 px-4 text-center font-mono">{OFFICIAL_72_BANDS.total.average}</td>
              <td className="py-3 px-4 text-center font-mono">{OFFICIAL_72_BANDS.total.above}</td>
            </tr>
            <tr className="font-semibold text-[#e2e8f0]">
              <td className="py-2.5 px-5 pl-8">Verbal Total</td>
              <td className="py-2.5 px-4 text-center">36</td>
              <td className="py-2.5 px-4 text-center font-mono">{OFFICIAL_72_BANDS.verbal.below}</td>
              <td className="py-2.5 px-4 text-center font-mono">{OFFICIAL_72_BANDS.verbal.average}</td>
              <td className="py-2.5 px-4 text-center font-mono">{OFFICIAL_72_BANDS.verbal.above}</td>
            </tr>
            <tr className="text-[#cbd5e1]">
              <td className="py-2.5 px-5 pl-12">• Verbal Comprehension</td>
              <td className="py-2.5 px-4 text-center">12</td>
              <td className="py-2.5 px-4 text-center font-mono">{OFFICIAL_72_BANDS.verbalComprehension.below}</td>
              <td className="py-2.5 px-4 text-center font-mono">{OFFICIAL_72_BANDS.verbalComprehension.average}</td>
              <td className="py-2.5 px-4 text-center font-mono">{OFFICIAL_72_BANDS.verbalComprehension.above}</td>
            </tr>
            <tr className="text-[#cbd5e1]">
              <td className="py-2.5 px-5 pl-12">• Verbal Reasoning</td>
              <td className="py-2.5 px-4 text-center">24</td>
              <td className="py-2.5 px-4 text-center font-mono">{OFFICIAL_72_BANDS.verbalReasoning.below}</td>
              <td className="py-2.5 px-4 text-center font-mono">{OFFICIAL_72_BANDS.verbalReasoning.average}</td>
              <td className="py-2.5 px-4 text-center font-mono">{OFFICIAL_72_BANDS.verbalReasoning.above}</td>
            </tr>
            <tr className="font-semibold text-[#e2e8f0]">
              <td className="py-2.5 px-5 pl-8">Nonverbal Total</td>
              <td className="py-2.5 px-4 text-center">36</td>
              <td className="py-2.5 px-4 text-center font-mono">{OFFICIAL_72_BANDS.nonverbal.below}</td>
              <td className="py-2.5 px-4 text-center font-mono">{OFFICIAL_72_BANDS.nonverbal.average}</td>
              <td className="py-2.5 px-4 text-center font-mono">{OFFICIAL_72_BANDS.nonverbal.above}</td>
            </tr>
            <tr className="text-[#cbd5e1]">
              <td className="py-2.5 px-5 pl-12">• Figural Reasoning</td>
              <td className="py-2.5 px-4 text-center">18</td>
              <td className="py-2.5 px-4 text-center font-mono">{OFFICIAL_72_BANDS.figuralReasoning.below}</td>
              <td className="py-2.5 px-4 text-center font-mono">{OFFICIAL_72_BANDS.figuralReasoning.average}</td>
              <td className="py-2.5 px-4 text-center font-mono">{OFFICIAL_72_BANDS.figuralReasoning.above}</td>
            </tr>
            <tr className="text-[#cbd5e1]">
              <td className="py-2.5 px-5 pl-12">• Quantitative Reasoning</td>
              <td className="py-2.5 px-4 text-center">18</td>
              <td className="py-2.5 px-4 text-center font-mono">{OFFICIAL_72_BANDS.quantitativeReasoning.below}</td>
              <td className="py-2.5 px-4 text-center font-mono">{OFFICIAL_72_BANDS.quantitativeReasoning.average}</td>
              <td className="py-2.5 px-4 text-center font-mono">{OFFICIAL_72_BANDS.quantitativeReasoning.above}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Cognitive Transfer Hypotheses to Programming */}
      <div className="brilliant-card rounded-2xl p-6 border border-[#2b2b3a] space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#ff8d23]" />
          Hypothesized Cognitive Transfer to Introductory Computer Science
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-[#121218] border border-[#232330] space-y-1">
            <strong className="text-white block font-semibold">Verbal Comprehension → Syntax & Specification</strong>
            <p className="text-[#94a3b8]">
              Ability to parse multi-step instructions and nuanced language predicts comprehension of formal problem specifications, variable scoping rules, and API documentation.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#121218] border border-[#232330] space-y-1">
            <strong className="text-white block font-semibold">Verbal Reasoning → Boolean Deductions & Logic Chains</strong>
            <p className="text-[#94a3b8]">
              Modus tollens, categorical classifications, and relational analogies transfer directly to nested conditionals, compound boolean operators, and function contracts.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#121218] border border-[#232330] space-y-1">
            <strong className="text-white block font-semibold">Figural Reasoning → Memory Layouts & Data Structures</strong>
            <p className="text-[#94a3b8]">
              Spatial transformation, matrix superposition, and symmetry recognition correlate with mental models of arrays, tree traversals, call-stack visualization, and pointer manipulations.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#121218] border border-[#232330] space-y-1">
            <strong className="text-white block font-semibold">Quantitative Reasoning → Loops, Invariants & Complexity</strong>
            <p className="text-[#94a3b8]">
              Series recognition and constraint-satisfaction problems transfer to iterative loop bound calculation, recursion bases, off-by-one prevention, and asymptotic reasoning.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
