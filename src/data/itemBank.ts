import { AssessmentItem } from '../types';

export const ITEM_BANK: AssessmentItem[] = [
  // ==========================================
  // CLUSTER 1: VERBAL COMPREHENSION (4 ITEMS)
  // ==========================================
  {
    id: 'VC-01',
    cluster: 'Verbal Comprehension',
    broadCluster: 'Verbal',
    type: 'Following Directions',
    difficulty: 'easy',
    stem: 'Read the instructions carefully: "If the first word has more letters than the second, write the last letter of the first word. Otherwise, write the first letter of the second word." Given words: [BINARY, CODE], which letter is obtained?',
    options: [
      { key: 'A', text: 'Y' },
      { key: 'B', text: 'B' },
      { key: 'C', text: 'C' },
      { key: 'D', text: 'E' },
      { key: 'E', text: 'N' },
    ],
    key: 'A',
    wrongTags: {
      A: null,
      B: 'slip', // took first letter of first word
      C: 'misconception', // took first letter of second word regardless of condition
      D: 'surface_match', // took last letter of second word
      E: 'random',
    },
    rationale: '"BINARY" has 6 letters; "CODE" has 4 letters. 6 > 4 is true. Following the rule: take the last letter of the first word, which is "Y".',
  },
  {
    id: 'VC-02',
    cluster: 'Verbal Comprehension',
    broadCluster: 'Verbal',
    type: 'Antonyms',
    difficulty: 'easy',
    stem: 'Select the word that is most nearly OPPOSITE in meaning to DETERMINISTIC.',
    options: [
      { key: 'A', text: 'Predictable' },
      { key: 'B', text: 'Random' },
      { key: 'C', text: 'Definite' },
      { key: 'D', text: 'Sequential' },
      { key: 'E', text: 'Constant' },
    ],
    key: 'B',
    wrongTags: {
      A: 'misconception', // picked a synonym
      B: null,
      C: 'surface_match', // picked sound-alike synonym
      D: 'random',
      E: 'slip',
    },
    rationale: '"Deterministic" denotes an outcome strictly dictated by initial conditions (predictable). Its direct antonym is "Random" (stochastic/unpredictable).',
  },
  {
    id: 'VC-03',
    cluster: 'Verbal Comprehension',
    broadCluster: 'Verbal',
    type: 'Sentence Completion',
    difficulty: 'medium',
    stem: 'Complete the sentence with the most logically coherent phrase: "Although the experimental algorithm was praised for its ________ latency, its ________ memory footprint made deployment on low-power devices impossible."',
    options: [
      { key: 'A', text: 'excessive ... negligible' },
      { key: 'B', text: 'minimal ... exorbitant' },
      { key: 'C', text: 'modest ... reduced' },
      { key: 'D', text: 'variable ... optimized' },
      { key: 'E', text: 'prolonged ... massive' },
    ],
    key: 'B',
    wrongTags: {
      A: 'misconception', // inverted contrast logic
      B: null,
      C: 'slip', // positive-positive lacks "Although" contrast
      D: 'surface_match', // buzzwords without semantic fit
      E: 'random',
    },
    rationale: '"Although" signals a contrast: praise for a desirable property (minimal latency) balanced against an insurmountable flaw (exorbitant memory).',
  },
  {
    id: 'VC-04',
    cluster: 'Verbal Comprehension',
    broadCluster: 'Verbal',
    type: 'Sentence Arrangement',
    difficulty: 'hard',
    stem: 'Arrange the four segments into the most coherent logical sequence:\n[1] Consequently, the buffer overflow caused the system to stall.\n[2] As input packets arrived faster than the parser could consume them.\n[3] The memory allocation threshold was abruptly exceeded.\n[4] The network adapter received an unthrottled burst of telemetry.',
    options: [
      { key: 'A', text: '4 → 2 → 3 → 1' },
      { key: 'B', text: '2 → 4 → 1 → 3' },
      { key: 'C', text: '1 → 3 → 2 → 4' },
      { key: 'D', text: '4 → 1 → 2 → 3' },
      { key: 'E', text: '3 → 2 → 4 → 1' },
    ],
    key: 'A',
    wrongTags: {
      A: null,
      B: 'slip', // inverted initial cause and subordinate clause
      C: 'misconception', // reverse chronological effect-first order
      D: 'surface_match', // placed conclusion prematurely
      E: 'random',
    },
    rationale: 'Chronological causality: Burst received [4] → packets arrived too quickly [2] → threshold exceeded [3] → buffer overflow stalled system [1].',
  },

  // ==========================================
  // CLUSTER 2: VERBAL REASONING (8 ITEMS)
  // ==========================================
  {
    id: 'VR-01',
    cluster: 'Verbal Reasoning',
    broadCluster: 'Verbal',
    type: 'Verbal Analogies',
    difficulty: 'easy',
    stem: 'COMPILER is to TRANSLATION as SIEVE is to ________.',
    options: [
      { key: 'A', text: 'Filtration' },
      { key: 'B', text: 'Storage' },
      { key: 'C', text: 'Compression' },
      { key: 'D', text: 'Transmission' },
      { key: 'E', text: 'Measurement' },
    ],
    key: 'A',
    wrongTags: {
      A: null,
      B: 'surface_match', // vessel holds things
      C: 'misconception', // reducing size vs separating elements
      D: 'random',
      E: 'slip',
    },
    rationale: 'Functional relationship: A compiler performs translation of source code; a sieve performs filtration of particles.',
  },
  {
    id: 'VR-02',
    cluster: 'Verbal Reasoning',
    broadCluster: 'Verbal',
    type: 'Verbal Analogies',
    difficulty: 'medium',
    stem: 'INDEX is to RETRIEVAL as BLUEPRINT is to ________.',
    options: [
      { key: 'A', text: 'Inspection' },
      { key: 'B', text: 'Fabrication' },
      { key: 'C', text: 'Demolition' },
      { key: 'D', text: 'Archival' },
      { key: 'E', text: 'Decoration' },
    ],
    key: 'B',
    wrongTags: {
      A: 'misconception', // blueprint can be inspected, but its primary purpose is fabrication
      B: null,
      C: 'random',
      D: 'surface_match', // blueprints are stored in archives
      E: 'slip',
    },
    rationale: 'Instrumental relationship: An index enables swift retrieval; a blueprint enables structured fabrication/construction.',
  },
  {
    id: 'VR-03',
    cluster: 'Verbal Reasoning',
    broadCluster: 'Verbal',
    type: 'Inference',
    difficulty: 'easy',
    stem: 'Given: "All recursive functions require a base case. Some algorithms with base cases do not terminate on cyclic graphs." Which conclusion MUST be true?',
    options: [
      { key: 'A', text: 'All algorithms with base cases are recursive.' },
      { key: 'B', text: 'Some algorithms that do not terminate on cyclic graphs have base cases.' },
      { key: 'C', text: 'No recursive function can process a cyclic graph.' },
      { key: 'D', text: 'Recursive functions never terminate on cyclic graphs.' },
      { key: 'E', text: 'Every algorithm without a base case terminates.' },
    ],
    key: 'B',
    wrongTags: {
      A: 'misconception', // affirming the consequent
      B: null,
      C: 'surface_match', // overgeneralized negative
      D: 'slip', // conflating "some" with "all"
      E: 'random',
    },
    rationale: 'If "Some X are Y", then by formal conversion "Some Y are X" is necessarily true. "Some algorithms with base cases do not terminate" ↔ "Some non-terminating algorithms have base cases".',
  },
  {
    id: 'VR-04',
    cluster: 'Verbal Reasoning',
    broadCluster: 'Verbal',
    type: 'Inference',
    difficulty: 'hard',
    stem: 'Consider three conditions for a transaction: (1) If Server A is offline, Server B handles all requests. (2) Server B handles requests ONLY IF the database cache is valid. (3) The database cache is currently INVALID. What must be true about Server A?',
    options: [
      { key: 'A', text: 'Server A must be offline.' },
      { key: 'B', text: 'Server A must be online.' },
      { key: 'C', text: 'Server A is experiencing high latency.' },
      { key: 'D', text: 'Server A will reboot within 60 seconds.' },
      { key: 'E', text: 'Nothing can be deduced about Server A.' },
    ],
    key: 'B',
    wrongTags: {
      A: 'misconception', // failed contrapositive chain
      B: null,
      C: 'random',
      D: 'surface_match', // speculative extrapolation
      E: 'slip', // missed modus tollens connection
    },
    rationale: 'By (2) and (3), Server B cannot handle requests. By (1), Server A offline → Server B handles requests. By Modus Tollens, since Server B cannot handle requests, Server A CANNOT be offline; hence Server A must be online.',
  },
  {
    id: 'VR-05',
    cluster: 'Verbal Reasoning',
    broadCluster: 'Verbal',
    type: 'Verbal Classification',
    difficulty: 'medium',
    stem: 'Four of the following five concepts share a common categorical rule of relational topology. Which one does NOT belong?',
    options: [
      { key: 'A', text: 'Hierarchy' },
      { key: 'B', text: 'Ring' },
      { key: 'C', text: 'Lattice' },
      { key: 'D', text: 'Throughput' },
      { key: 'E', text: 'Mesh' },
    ],
    key: 'D',
    wrongTags: {
      A: 'surface_match',
      B: 'slip',
      C: 'misconception', // thought lattice was unrelated to graphs
      D: null,
      E: 'random',
    },
    rationale: 'Hierarchy (tree), Ring, Lattice, and Mesh are structural network/graph topologies. "Throughput" is a metric of rate/performance, not a topological structure.',
  },
  {
    id: 'VR-06',
    cluster: 'Verbal Reasoning',
    broadCluster: 'Verbal',
    type: 'Logical Selection',
    difficulty: 'medium',
    stem: 'Which property is ESSENTIAL to the concept of an ALGORITHM (without which an entity cannot be considered an algorithm)?',
    options: [
      { key: 'A', text: 'Execution in silicon hardware' },
      { key: 'B', text: 'Finite, unambiguous sequence of steps' },
      { key: 'C', text: 'Written in a high-level programming language' },
      { key: 'D', text: 'Constant time complexity' },
      { key: 'E', text: 'Parallel multithreading capability' },
    ],
    key: 'B',
    wrongTags: {
      A: 'surface_match', // hardware is incidental
      B: null,
      C: 'misconception', // language is incidental
      D: 'slip', // O(1) is a performance extreme, not definition
      E: 'random',
    },
    rationale: 'By definition, an algorithm is a finite, well-defined sequence of rigorous instructions. Hardware, syntax, and threads are incidental implementation details.',
  },
  {
    id: 'VR-07',
    cluster: 'Verbal Reasoning',
    broadCluster: 'Verbal',
    type: 'Arithmetic Reasoning',
    difficulty: 'hard',
    stem: 'A backup worker drains a queue of 240 tasks. Worker Alpha processes 6 tasks/minute. Worker Beta starts 10 minutes later and processes 9 tasks/minute. How many minutes after Worker Beta starts will the queue be completely empty?',
    options: [
      { key: 'A', text: '12 minutes' },
      { key: 'B', text: '14 minutes' },
      { key: 'C', text: '16 minutes' },
      { key: 'D', text: '18 minutes' },
      { key: 'E', text: '20 minutes' },
    ],
    key: 'A',
    wrongTags: {
      A: null,
      B: 'slip', // forgot to subtract Alpha's head start correctly
      C: 'misconception', // divided 240 by (6+9) directly without offset
      D: 'surface_match', // took 240 / 15 + 2
      E: 'random',
    },
    rationale: 'In the first 10 minutes, Alpha finishes 6 × 10 = 60 tasks. Remaining tasks = 240 - 60 = 180 tasks. Combined rate = 6 + 9 = 15 tasks/minute. Time required = 180 / 15 = 12 minutes.',
  },
  {
    id: 'VR-08',
    cluster: 'Verbal Reasoning',
    broadCluster: 'Verbal',
    type: 'Word/Letter Matrix',
    difficulty: 'hard',
    stem: 'Discover the transformation rule in the letter matrix and identify the missing entry (?):\n[ A  D  G ]\n[ C  F  I ]\n[ F  I  ? ]',
    options: [
      { key: 'A', text: 'K' },
      { key: 'B', text: 'L' },
      { key: 'C', text: 'M' },
      { key: 'D', text: 'N' },
      { key: 'E', text: 'J' },
    ],
    key: 'B',
    wrongTags: {
      A: 'slip', // +2 instead of +3
      B: null,
      C: 'misconception', // confused vertical increment with horizontal
      D: 'surface_match',
      E: 'random',
    },
    rationale: 'Horizontal rule across every row: +3 letter positions. Row 1: A(+3)=D, D(+3)=G. Row 2: C(+3)=F, F(+3)=I. Row 3: F(+3)=I, I(+3) = L (9 + 3 = 12th letter).',
  },

  // ==========================================
  // CLUSTER 3: FIGURAL REASONING (6 ITEMS - INLINE SVG)
  // ==========================================
  {
    id: 'FR-01',
    cluster: 'Figural Reasoning',
    broadCluster: 'Nonverbal',
    type: 'Figural Analogies',
    difficulty: 'easy',
    stem: 'Examine the relationship between Figure 1 and Figure 2. Apply the identical transformation to Figure 3 to determine Figure 4.',
    stemSvg: `<svg viewBox="0 0 420 120" class="w-full max-w-md mx-auto" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="10" width="80" height="80" rx="10" fill="#181820" stroke="#4c4c5e" stroke-width="2"/>
      <circle cx="45" cy="50" r="28" fill="#456dff"/>
      <rect x="33" y="38" width="24" height="24" fill="#ffffff"/>
      <text x="105" y="55" fill="#9d62ff" font-size="20" font-weight="bold">→</text>
      <rect x="135" y="10" width="80" height="80" rx="10" fill="#181820" stroke="#4c4c5e" stroke-width="2"/>
      <rect x="151" y="26" width="48" height="48" fill="#ffffff"/>
      <circle cx="175" cy="50" r="14" fill="#456dff"/>
      <text x="235" y="55" fill="#ffffff" font-size="20" font-weight="bold">::</text>
      <rect x="270" y="10" width="80" height="80" rx="10" fill="#181820" stroke="#4c4c5e" stroke-width="2"/>
      <polygon points="310,24 338,76 282,76" fill="#ff8d23"/>
      <circle cx="310" cy="58" r="10" fill="#ffffff"/>
      <text x="370" y="55" fill="#9d62ff" font-size="20" font-weight="bold">→</text>
      <rect x="390" y="35" width="25" height="30" fill="none" stroke="#9d62ff" stroke-dasharray="3,3" stroke-width="2"/>
      <text x="397" y="56" fill="#9d62ff" font-size="16" font-weight="bold">?</text>
    </svg>`,
    options: [
      {
        key: 'A',
        svg: `<svg viewBox="0 0 80 80" class="w-16 h-16 mx-auto"><rect width="80" height="80" rx="10" fill="#181820"/><circle cx="40" cy="40" r="28" fill="#ffffff"/><polygon points="40,28 54,54 26,54" fill="#ff8d23"/></svg>`,
      },
      {
        key: 'B',
        svg: `<svg viewBox="0 0 80 80" class="w-16 h-16 mx-auto"><rect width="80" height="80" rx="10" fill="#181820"/><polygon points="40,16 68,68 12,68" fill="#ffffff"/><circle cx="40" cy="50" r="12" fill="#ff8d23"/></svg>`,
      },
      {
        key: 'C',
        svg: `<svg viewBox="0 0 80 80" class="w-16 h-16 mx-auto"><rect width="80" height="80" rx="10" fill="#181820"/><circle cx="40" cy="40" r="28" fill="#ff8d23"/><polygon points="40,28 54,54 26,54" fill="#ffffff"/></svg>`,
      },
      {
        key: 'D',
        svg: `<svg viewBox="0 0 80 80" class="w-16 h-16 mx-auto"><rect width="80" height="80" rx="10" fill="#181820"/><rect x="20" y="20" width="40" height="40" fill="#ffffff"/><circle cx="40" cy="40" r="12" fill="#ff8d23"/></svg>`,
      },
      {
        key: 'E',
        svg: `<svg viewBox="0 0 80 80" class="w-16 h-16 mx-auto"><rect width="80" height="80" rx="10" fill="#181820"/><polygon points="40,64 12,20 68,20" fill="#ff8d23"/><circle cx="40" cy="30" r="10" fill="#ffffff"/></svg>`,
      },
    ],
    key: 'A',
    wrongTags: {
      A: null,
      B: 'misconception', // kept triangle on outside instead of inverting outer/inner roles
      C: 'slip', // inverted shapes correctly but colors remained tied to shapes rather than depth
      D: 'surface_match', // introduced square from first analogy
      E: 'random',
    },
    rationale: 'Transformation: Inner shape expands to become outer shape and adopts outer color; outer shape shrinks to become inner shape and retains inner color. Circle (white inside) becomes white outer circle; orange triangle becomes inner orange triangle.',
  },
  {
    id: 'FR-02',
    cluster: 'Figural Reasoning',
    broadCluster: 'Nonverbal',
    type: 'Figural Analogies',
    difficulty: 'medium',
    stem: 'Examine the rotating dial and pip counts. What replaces the question mark?',
    stemSvg: `<svg viewBox="0 0 420 120" class="w-full max-w-md mx-auto" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="10" width="80" height="80" rx="12" fill="#181820" stroke="#4c4c5e" stroke-width="2"/>
      <line x1="50" y1="50" x2="50" y2="22" stroke="#456dff" stroke-width="4" stroke-linecap="round"/>
      <circle cx="28" cy="70" r="5" fill="#ff8d23"/>
      <text x="105" y="55" fill="#9d62ff" font-size="20" font-weight="bold">→</text>
      <rect x="135" y="10" width="80" height="80" rx="12" fill="#181820" stroke="#4c4c5e" stroke-width="2"/>
      <line x1="175" y1="50" x2="203" y2="50" stroke="#456dff" stroke-width="4" stroke-linecap="round"/>
      <circle cx="155" cy="70" r="5" fill="#ff8d23"/><circle cx="170" cy="70" r="5" fill="#ff8d23"/>
      <text x="235" y="55" fill="#ffffff" font-size="20" font-weight="bold">::</text>
      <rect x="270" y="10" width="80" height="80" rx="12" fill="#181820" stroke="#4c4c5e" stroke-width="2"/>
      <line x1="310" y1="50" x2="310" y2="78" stroke="#9d62ff" stroke-width="4" stroke-linecap="round"/>
      <circle cx="290" cy="28" r="5" fill="#ff8d23"/><circle cx="304" cy="28" r="5" fill="#ff8d23"/>
      <text x="370" y="55" fill="#9d62ff" font-size="20" font-weight="bold">→</text>
      <rect x="390" y="35" width="25" height="30" fill="none" stroke="#9d62ff" stroke-dasharray="3,3" stroke-width="2"/>
      <text x="397" y="56" fill="#9d62ff" font-size="16" font-weight="bold">?</text>
    </svg>`,
    options: [
      {
        key: 'A',
        svg: `<svg viewBox="0 0 80 80" class="w-16 h-16 mx-auto"><rect width="80" height="80" rx="12" fill="#181820"/><line x1="40" y1="40" x2="12" y2="40" stroke="#9d62ff" stroke-width="4" stroke-linecap="round"/><circle cx="25" cy="22" r="4" fill="#ff8d23"/><circle cx="40" cy="22" r="4" fill="#ff8d23"/><circle cx="55" cy="22" r="4" fill="#ff8d23"/></svg>`,
      },
      {
        key: 'B',
        svg: `<svg viewBox="0 0 80 80" class="w-16 h-16 mx-auto"><rect width="80" height="80" rx="12" fill="#181820"/><line x1="40" y1="40" x2="68" y2="40" stroke="#9d62ff" stroke-width="4" stroke-linecap="round"/><circle cx="30" cy="22" r="4" fill="#ff8d23"/><circle cx="50" cy="22" r="4" fill="#ff8d23"/></svg>`,
      },
      {
        key: 'C',
        svg: `<svg viewBox="0 0 80 80" class="w-16 h-16 mx-auto"><rect width="80" height="80" rx="12" fill="#181820"/><line x1="40" y1="40" x2="12" y2="40" stroke="#9d62ff" stroke-width="4" stroke-linecap="round"/><circle cx="40" cy="22" r="4" fill="#ff8d23"/></svg>`,
      },
      {
        key: 'D',
        svg: `<svg viewBox="0 0 80 80" class="w-16 h-16 mx-auto"><rect width="80" height="80" rx="12" fill="#181820"/><line x1="40" y1="40" x2="40" y2="12" stroke="#9d62ff" stroke-width="4" stroke-linecap="round"/><circle cx="25" cy="65" r="4" fill="#ff8d23"/><circle cx="40" cy="65" r="4" fill="#ff8d23"/><circle cx="55" cy="65" r="4" fill="#ff8d23"/></svg>`,
      },
      {
        key: 'E',
        svg: `<svg viewBox="0 0 80 80" class="w-16 h-16 mx-auto"><rect width="80" height="80" rx="12" fill="#181820"/><line x1="40" y1="40" x2="60" y2="60" stroke="#9d62ff" stroke-width="4" stroke-linecap="round"/><circle cx="40" cy="22" r="4" fill="#ff8d23"/></svg>`,
      },
    ],
    key: 'A',
    wrongTags: {
      A: null,
      B: 'slip', // rotated counter-clockwise or missed +1 pip
      C: 'misconception', // subtracted pip instead of adding
      D: 'surface_match', // rotated 180 degrees instead of 90 degrees clockwise
      E: 'random',
    },
    rationale: 'Two rules simultaneously: (1) The pointer rotates 90° clockwise (from 6 o\'clock to 9 o\'clock, pointing left). (2) The number of orange pips increases by exactly 1 (2 + 1 = 3 pips).',
  },
  {
    id: 'FR-03',
    cluster: 'Figural Reasoning',
    broadCluster: 'Nonverbal',
    type: 'Pattern Matrix',
    difficulty: 'medium',
    stem: 'Complete the 2x2 pattern matrix by selecting the figure that belongs in the lower-right cell (?).',
    stemSvg: `<svg viewBox="0 0 240 240" class="w-56 h-56 mx-auto" xmlns="http://www.w3.org/2000/svg">
      <!-- Grid -->
      <line x1="120" y1="10" x2="120" y2="230" stroke="#4c4c5e" stroke-width="2"/>
      <line x1="10" y1="120" x2="230" y2="120" stroke="#4c4c5e" stroke-width="2"/>
      <!-- Top Left: Single Square with vertical stripe -->
      <rect x="25" y="25" width="70" height="70" fill="#1e1e28" stroke="#9d62ff" stroke-width="2"/>
      <line x1="60" y1="25" x2="60" y2="95" stroke="#ffffff" stroke-width="3"/>
      <!-- Top Right: Double concentric Square with vertical stripe -->
      <rect x="145" y="25" width="70" height="70" fill="#1e1e28" stroke="#9d62ff" stroke-width="2"/>
      <rect x="157" y="37" width="46" height="46" fill="none" stroke="#456dff" stroke-width="2"/>
      <line x1="180" y1="25" x2="180" y2="95" stroke="#ffffff" stroke-width="3"/>
      <!-- Bottom Left: Single Circle with horizontal stripe -->
      <circle cx="60" cy="175" r="35" fill="#1e1e28" stroke="#ff8d23" stroke-width="2"/>
      <line x1="25" y1="175" x2="95" y2="175" stroke="#ffffff" stroke-width="3"/>
      <!-- Bottom Right: Question -->
      <rect x="145" y="140" width="70" height="70" fill="#14141c" stroke="#9d62ff" stroke-dasharray="4,4" stroke-width="2"/>
      <text x="172" y="182" fill="#9d62ff" font-size="28" font-weight="bold">?</text>
    </svg>`,
    options: [
      {
        key: 'A',
        svg: `<svg viewBox="0 0 80 80" class="w-16 h-16 mx-auto"><rect width="80" height="80" rx="8" fill="#181820"/><circle cx="40" cy="40" r="32" fill="#1e1e28" stroke="#ff8d23" stroke-width="2"/><circle cx="40" cy="40" r="20" fill="none" stroke="#456dff" stroke-width="2"/><line x1="8" y1="40" x2="72" y2="40" stroke="#ffffff" stroke-width="3"/></svg>`,
      },
      {
        key: 'B',
        svg: `<svg viewBox="0 0 80 80" class="w-16 h-16 mx-auto"><rect width="80" height="80" rx="8" fill="#181820"/><circle cx="40" cy="40" r="32" fill="#1e1e28" stroke="#ff8d23" stroke-width="2"/><line x1="40" y1="8" x2="40" y2="72" stroke="#ffffff" stroke-width="3"/></svg>`,
      },
      {
        key: 'C',
        svg: `<svg viewBox="0 0 80 80" class="w-16 h-16 mx-auto"><rect width="80" height="80" rx="8" fill="#181820"/><rect x="12" y="12" width="56" height="56" fill="#1e1e28" stroke="#ff8d23" stroke-width="2"/><circle cx="40" cy="40" r="16" fill="none" stroke="#456dff" stroke-width="2"/></svg>`,
      },
      {
        key: 'D',
        svg: `<svg viewBox="0 0 80 80" class="w-16 h-16 mx-auto"><rect width="80" height="80" rx="8" fill="#181820"/><circle cx="40" cy="40" r="32" fill="#1e1e28" stroke="#ff8d23" stroke-width="2"/><line x1="8" y1="40" x2="72" y2="40" stroke="#ffffff" stroke-width="3"/><line x1="40" y1="8" x2="40" y2="72" stroke="#ffffff" stroke-width="3"/></svg>`,
      },
      {
        key: 'E',
        svg: `<svg viewBox="0 0 80 80" class="w-16 h-16 mx-auto"><rect width="80" height="80" rx="8" fill="#181820"/><circle cx="40" cy="40" r="22" fill="#1e1e28" stroke="#456dff" stroke-width="2"/></svg>`,
      },
    ],
    key: 'A',
    wrongTags: {
      A: null,
      B: 'slip', // changed stripe to vertical instead of keeping row property
      C: 'misconception', // changed shape back to square
      D: 'surface_match', // added cross stripe
      E: 'random',
    },
    rationale: 'Matrix rules: Across rows (left → right), add a concentric inner shape with a blue border. Down columns (top → bottom), shape changes from square to circle and orientation of white line changes from vertical to horizontal.',
  },
  {
    id: 'FR-04',
    cluster: 'Figural Reasoning',
    broadCluster: 'Nonverbal',
    type: 'Pattern Matrix',
    difficulty: 'hard',
    stem: 'Apply the boolean superposition rule across row 3 to find the missing figure (?):',
    stemSvg: `<svg viewBox="0 0 360 120" class="w-full max-w-lg mx-auto" xmlns="http://www.w3.org/2000/svg">
      <!-- Col 1 -->
      <rect x="15" y="15" width="80" height="80" rx="10" fill="#181820" stroke="#4c4c5e" stroke-width="2"/>
      <line x1="55" y1="25" x2="55" y2="85" stroke="#456dff" stroke-width="4"/>
      <line x1="25" y1="55" x2="85" y2="55" stroke="#456dff" stroke-width="4"/>
      <text x="110" y="60" fill="#9d62ff" font-size="20" font-weight="bold">⊕</text>
      <!-- Col 2 -->
      <rect x="140" y="15" width="80" height="80" rx="10" fill="#181820" stroke="#4c4c5e" stroke-width="2"/>
      <line x1="180" y1="25" x2="180" y2="85" stroke="#456dff" stroke-width="4"/>
      <line x1="150" y1="30" x2="210" y2="80" stroke="#ff8d23" stroke-width="4"/>
      <text x="235" y="60" fill="#ffffff" font-size="20" font-weight="bold">=</text>
      <!-- Col 3: Question -->
      <rect x="265" y="15" width="80" height="80" rx="10" fill="#14141c" stroke="#9d62ff" stroke-dasharray="4,4" stroke-width="2"/>
      <text x="298" y="62" fill="#9d62ff" font-size="28" font-weight="bold">?</text>
    </svg>`,
    options: [
      {
        key: 'A',
        svg: `<svg viewBox="0 0 80 80" class="w-16 h-16 mx-auto"><rect width="80" height="80" rx="10" fill="#181820"/><line x1="10" y1="40" x2="70" y2="40" stroke="#456dff" stroke-width="4"/><line x1="15" y1="18" x2="65" y2="62" stroke="#ff8d23" stroke-width="4"/></svg>`,
      },
      {
        key: 'B',
        svg: `<svg viewBox="0 0 80 80" class="w-16 h-16 mx-auto"><rect width="80" height="80" rx="10" fill="#181820"/><line x1="40" y1="15" x2="40" y2="65" stroke="#456dff" stroke-width="4"/></svg>`,
      },
      {
        key: 'C',
        svg: `<svg viewBox="0 0 80 80" class="w-16 h-16 mx-auto"><rect width="80" height="80" rx="10" fill="#181820"/><line x1="40" y1="15" x2="40" y2="65" stroke="#456dff" stroke-width="4"/><line x1="10" y1="40" x2="70" y2="40" stroke="#456dff" stroke-width="4"/><line x1="15" y1="18" x2="65" y2="62" stroke="#ff8d23" stroke-width="4"/></svg>`,
      },
      {
        key: 'D',
        svg: `<svg viewBox="0 0 80 80" class="w-16 h-16 mx-auto"><rect width="80" height="80" rx="10" fill="#181820"/><line x1="15" y1="18" x2="65" y2="62" stroke="#ff8d23" stroke-width="4"/></svg>`,
      },
      {
        key: 'E',
        svg: `<svg viewBox="0 0 80 80" class="w-16 h-16 mx-auto"><rect width="80" height="80" rx="10" fill="#181820"/><circle cx="40" cy="40" r="16" fill="#456dff"/></svg>`,
      },
    ],
    key: 'A',
    wrongTags: {
      A: null,
      B: 'slip', // kept common vertical line instead of eliminating it
      C: 'misconception', // OR combination (union) instead of XOR
      D: 'surface_match', // only took the new diagonal line, dropped the horizontal line
      E: 'random',
    },
    rationale: 'XOR Superposition Rule: Overlapping segments in identical positions cancel each other out; non-overlapping segments are preserved. The vertical blue line exists in both Figure 1 and Figure 2, so it cancels. The horizontal blue line and the diagonal orange line are retained.',
  },
  {
    id: 'FR-05',
    cluster: 'Figural Reasoning',
    broadCluster: 'Nonverbal',
    type: 'Figural Classification',
    difficulty: 'medium',
    stem: 'Four of these five figures share a strict topological invariance rule regarding vertices and perimeter intersections. Which figure does NOT belong?',
    stemSvg: `<svg viewBox="0 0 420 90" class="w-full max-w-lg mx-auto" xmlns="http://www.w3.org/2000/svg">
      <text x="10" y="50" fill="#94a3b8" font-size="14">Inspect options A through E below to find the exception.</text>
    </svg>`,
    options: [
      {
        key: 'A',
        svg: `<svg viewBox="0 0 80 80" class="w-16 h-16 mx-auto"><rect width="80" height="80" rx="8" fill="#181820"/><polygon points="40,15 65,65 15,65" fill="none" stroke="#456dff" stroke-width="2"/><line x1="15" y1="35" x2="65" y2="35" stroke="#ff8d23" stroke-width="2"/></svg>`,
      },
      {
        key: 'B',
        svg: `<svg viewBox="0 0 80 80" class="w-16 h-16 mx-auto"><rect width="80" height="80" rx="8" fill="#181820"/><rect x="20" y="20" width="40" height="40" fill="none" stroke="#456dff" stroke-width="2"/><line x1="10" y1="40" x2="70" y2="40" stroke="#ff8d23" stroke-width="2"/></svg>`,
      },
      {
        key: 'C',
        svg: `<svg viewBox="0 0 80 80" class="w-16 h-16 mx-auto"><rect width="80" height="80" rx="8" fill="#181820"/><circle cx="40" cy="40" r="24" fill="none" stroke="#456dff" stroke-width="2"/><line x1="10" y1="40" x2="70" y2="40" stroke="#ff8d23" stroke-width="2"/></svg>`,
      },
      {
        key: 'D',
        svg: `<svg viewBox="0 0 80 80" class="w-16 h-16 mx-auto"><rect width="80" height="80" rx="8" fill="#181820"/><polygon points="40,15 65,35 65,65 40,75 15,65 15,35" fill="none" stroke="#456dff" stroke-width="2"/><line x1="10" y1="50" x2="70" y2="50" stroke="#ff8d23" stroke-width="2"/></svg>`,
      },
      {
        key: 'E',
        svg: `<svg viewBox="0 0 80 80" class="w-16 h-16 mx-auto"><rect width="80" height="80" rx="8" fill="#181820"/><circle cx="40" cy="40" r="24" fill="none" stroke="#456dff" stroke-width="2"/><line x1="40" y1="16" x2="68" y2="60" stroke="#ff8d23" stroke-width="2"/></svg>`,
      },
    ],
    key: 'E',
    wrongTags: {
      A: 'surface_match', // has 3 sides
      B: 'slip', // has 4 sides
      C: 'misconception', // thought circle was the odd one out due to no vertices
      D: 'random',
      E: null,
    },
    rationale: 'Symmetry rule: In Figures A, B, C, and D, the orange line forms a line of reflectional symmetry dividing the outer blue shape into two equal halves. In Figure E, the chord is asymmetrical and does not pass through the center.',
  },
  {
    id: 'FR-06',
    cluster: 'Figural Reasoning',
    broadCluster: 'Nonverbal',
    type: 'Figural Series',
    difficulty: 'hard',
    stem: 'Identify the next logical figure in the progression (Step 4 → Step 5):',
    stemSvg: `<svg viewBox="0 0 420 100" class="w-full max-w-lg mx-auto" xmlns="http://www.w3.org/2000/svg">
      <!-- Step 1 -->
      <rect x="5" y="10" width="70" height="70" rx="8" fill="#181820" stroke="#4c4c5e"/>
      <circle cx="40" cy="45" r="22" fill="none" stroke="#456dff" stroke-width="2"/>
      <circle cx="40" cy="23" r="4" fill="#ff8d23"/>
      <!-- Step 2 -->
      <rect x="85" y="10" width="70" height="70" rx="8" fill="#181820" stroke="#4c4c5e"/>
      <circle cx="120" cy="45" r="22" fill="none" stroke="#456dff" stroke-width="2"/>
      <circle cx="136" cy="30" r="4" fill="#ff8d23"/>
      <!-- Step 3 -->
      <rect x="165" y="10" width="70" height="70" rx="8" fill="#181820" stroke="#4c4c5e"/>
      <circle cx="200" cy="45" r="22" fill="none" stroke="#456dff" stroke-width="2"/>
      <circle cx="222" cy="45" r="4" fill="#ff8d23"/>
      <!-- Step 4 -->
      <rect x="245" y="10" width="70" height="70" rx="8" fill="#181820" stroke="#4c4c5e"/>
      <circle cx="280" cy="45" r="22" fill="none" stroke="#456dff" stroke-width="2"/>
      <circle cx="296" cy="61" r="4" fill="#ff8d23"/>
      <!-- Step 5: ? -->
      <rect x="335" y="10" width="70" height="70" rx="8" fill="#14141c" stroke="#9d62ff" stroke-dasharray="3,3"/>
      <text x="363" y="52" fill="#9d62ff" font-size="24" font-weight="bold">?</text>
    </svg>`,
    options: [
      {
        key: 'A',
        svg: `<svg viewBox="0 0 80 80" class="w-16 h-16 mx-auto"><rect width="80" height="80" rx="8" fill="#181820"/><circle cx="40" cy="40" r="22" fill="none" stroke="#456dff" stroke-width="2"/><circle cx="40" cy="62" r="4" fill="#ff8d23"/></svg>`,
      },
      {
        key: 'B',
        svg: `<svg viewBox="0 0 80 80" class="w-16 h-16 mx-auto"><rect width="80" height="80" rx="8" fill="#181820"/><circle cx="40" cy="40" r="22" fill="none" stroke="#456dff" stroke-width="2"/><circle cx="18" cy="40" r="4" fill="#ff8d23"/></svg>`,
      },
      {
        key: 'C',
        svg: `<svg viewBox="0 0 80 80" class="w-16 h-16 mx-auto"><rect width="80" height="80" rx="8" fill="#181820"/><circle cx="40" cy="40" r="22" fill="none" stroke="#456dff" stroke-width="2"/><circle cx="24" cy="56" r="4" fill="#ff8d23"/></svg>`,
      },
      {
        key: 'D',
        svg: `<svg viewBox="0 0 80 80" class="w-16 h-16 mx-auto"><rect width="80" height="80" rx="8" fill="#181820"/><circle cx="40" cy="40" r="22" fill="none" stroke="#456dff" stroke-width="2"/><circle cx="40" cy="18" r="4" fill="#ff8d23"/></svg>`,
      },
      {
        key: 'E',
        svg: `<svg viewBox="0 0 80 80" class="w-16 h-16 mx-auto"><rect width="80" height="80" rx="8" fill="#181820"/><circle cx="40" cy="40" r="22" fill="none" stroke="#456dff" stroke-width="2"/><circle cx="40" cy="40" r="4" fill="#ff8d23"/></svg>`,
      },
    ],
    key: 'A',
    wrongTags: {
      A: null,
      B: 'slip', // jumped 90 degrees instead of 45 degrees
      C: 'misconception', // overshoot
      D: 'surface_match', // reset to initial 12 o\'clock position
      E: 'random',
    },
    rationale: 'Angular velocity progression: The orange satellite rotates clockwise by 45° in each step. Step 1 = 0° (12 o\'clock), Step 2 = 45°, Step 3 = 90° (3 o\'clock), Step 4 = 135°. Step 5 = 135° + 45° = 180° (6 o\'clock, bottom center).',
  },

  // ==========================================
  // CLUSTER 4: QUANTITATIVE REASONING (6 ITEMS)
  // ==========================================
  {
    id: 'QR-01',
    cluster: 'Quantitative Reasoning',
    broadCluster: 'Nonverbal',
    type: 'Number Series',
    difficulty: 'easy',
    stem: 'Determine the missing number in the sequence:\n3,  7,  15,  31,  63,  ( ? )',
    options: [
      { key: 'A', text: '127' },
      { key: 'B', text: '126' },
      { key: 'C', text: '125' },
      { key: 'D', text: '119' },
      { key: 'E', text: '131' },
    ],
    key: 'A',
    wrongTags: {
      A: null,
      B: 'slip', // multiplied by 2 and forgot to add 1
      C: 'misconception', // guessed 2^n - something incorrect
      D: 'surface_match',
      E: 'random',
    },
    rationale: 'Recurrence: $x_{n+1} = 2x_n + 1$ (or $2^{n+2} - 1$). $2(63) + 1 = 126 + 1 = 127$.',
  },
  {
    id: 'QR-02',
    cluster: 'Quantitative Reasoning',
    broadCluster: 'Nonverbal',
    type: 'Number Series',
    difficulty: 'medium',
    stem: 'Identify the next term in the alternating pattern:\n2,  6,  4,  12,  8,  24,  ( ? )',
    options: [
      { key: 'A', text: '16' },
      { key: 'B', text: '48' },
      { key: 'C', text: '20' },
      { key: 'D', text: '12' },
      { key: 'E', text: '72' },
    ],
    key: 'A',
    wrongTags: {
      A: null,
      B: 'misconception', // continued ×3 instead of -2 / sub-series
      C: 'slip', // added 4 instead of alternating powers of 2
      D: 'surface_match',
      E: 'random',
    },
    rationale: 'Interleaved sub-series: Series 1 at odd positions: 2, 4, 8, [16] (doubling). Series 2 at even positions: 6, 12, 24 (doubling). Next term is at position 7, which belongs to Series 1: 8 × 2 = 16.',
  },
  {
    id: 'QR-03',
    cluster: 'Quantitative Reasoning',
    broadCluster: 'Nonverbal',
    type: 'Numeric Inference',
    difficulty: 'easy',
    stem: 'A microservice cluster has 3 nodes. The sum of requests handled is 180. Node 1 handled twice as many requests as Node 2. Node 3 handled 20 more requests than Node 2. How many requests were handled by Node 2?',
    options: [
      { key: 'A', text: '40' },
      { key: 'B', text: '50' },
      { key: 'C', text: '35' },
      { key: 'D', text: '60' },
      { key: 'E', text: '30' },
    ],
    key: 'A',
    wrongTags: {
      A: null,
      B: 'slip', // computed Node 3 instead of Node 2
      C: 'misconception', // arithmetic error in 4x = 160
      D: 'surface_match', // divided 180 by 3 directly
      E: 'random',
    },
    rationale: 'Let Node 2 = $x$. Node 1 = $2x$. Node 3 = $x + 20$. Sum: $2x + x + (x + 20) = 180 \implies 4x + 20 = 180 \implies 4x = 160 \implies x = 40$.',
  },
  {
    id: 'QR-04',
    cluster: 'Quantitative Reasoning',
    broadCluster: 'Nonverbal',
    type: 'Numeric Inference',
    difficulty: 'hard',
    stem: 'A cloud container runs three background worker processes with memory allocations X, Y, and Z (in GB, whole numbers). Worker X requires at least 4 GB (X ≥ 4). Worker Y requires 3 GB more than Worker X (Y = X + 3). The combined memory of all three workers (X + Y + Z) cannot exceed 24 GB. What is the MAXIMUM possible memory allocation for Worker Z?',
    options: [
      { key: 'A', text: '13 GB' },
      { key: 'B', text: '14 GB' },
      { key: 'C', text: '12 GB' },
      { key: 'D', text: '17 GB' },
      { key: 'E', text: '15 GB' },
    ],
    key: 'A',
    wrongTags: {
      A: null,
      B: 'slip', // computed 24 - 10 instead of 24 - 11
      C: 'misconception', // over-constrained X to 5 GB
      D: 'surface_match', // subtracted only X=4, ignored Y=7
      E: 'random',
    },
    rationale: 'Express total allocation in terms of X: X + (X + 3) + Z ≤ 24 → 2X + 3 + Z ≤ 24 → Z ≤ 21 - 2X. To maximize Z, minimize X. Since X ≥ 4, set X = 4. Then Z ≤ 21 - 2(4) = 21 - 8 = 13 GB.',
  },
  {
    id: 'QR-05',
    cluster: 'Quantitative Reasoning',
    broadCluster: 'Nonverbal',
    type: 'Number Matrix',
    difficulty: 'medium',
    stem: 'Find the value of $X$ that satisfies the operational pattern of the matrix:\n[ 4    7    29 ]\n[ 5    8    41 ]\n[ 6    9     X ]',
    options: [
      { key: 'A', text: '55' },
      { key: 'B', text: '54' },
      { key: 'C', text: '63' },
      { key: 'D', text: '51' },
      { key: 'E', text: '48' },
    ],
    key: 'A',
    wrongTags: {
      A: null,
      B: 'slip', // multiplied 6 × 9 without offset
      C: 'misconception', // 6 × 9 + 9
      D: 'surface_match',
      E: 'random',
    },
    rationale: 'Row operation rule: $Col_3 = (Col_1 \times Col_2) + 1$. Row 1: $(4 \times 7) + 1 = 28 + 1 = 29$. Row 2: $(5 \times 8) + 1 = 40 + 1 = 41$. Row 3: $(6 \times 9) + 1 = 54 + 1 = 55$.',
  },
  {
    id: 'QR-06',
    cluster: 'Quantitative Reasoning',
    broadCluster: 'Nonverbal',
    type: 'Number Matrix',
    difficulty: 'hard',
    stem: 'Determine the missing number ($Y$) in the dual-axis number matrix:\n[  2    4    16 ]\n[  3    5    32 ]\n[  4    6     Y ]',
    options: [
      { key: 'A', text: '64' },
      { key: 'B', text: '48' },
      { key: 'C', text: '56' },
      { key: 'D', text: '80' },
      { key: 'E', text: '128' },
    ],
    key: 'A',
    wrongTags: {
      A: null,
      B: 'slip', // 4 × 12
      C: 'misconception',
      D: 'surface_match',
      E: 'random',
    },
    rationale: 'Row function rule: $Col_3 = 2^{(Col_2)} = 2^4 = 16$. Wait, Row 2: $2^5 = 32$. Row 3: $Col_2 = 6$, so $Col_3 = 2^6 = 64$. (Also notice Col 1 provides the power base index $Col_1 = 4 \implies 2^{Col_1+2}$). Thus $Y = 64$.',
  },
];

// Quick lookup helper
export const ITEM_MAP: Record<string, AssessmentItem> = ITEM_BANK.reduce((acc, item) => {
  acc[item.id] = item;
  return acc;
}, {} as Record<string, AssessmentItem>);
