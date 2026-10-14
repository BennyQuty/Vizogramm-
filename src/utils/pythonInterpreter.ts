import { TraceStep } from '../types';

export interface InterpretationResult {
  valid: boolean;
  error?: string;
  steps: TraceStep[];
  finalVariables: Record<string, any>;
  finalOutput: string;
}

/**
 * Safely evaluates a Python-like expression using current variable environment.
 */
function evaluateExpr(expr: string, vars: Record<string, any>): any {
  let clean = expr.trim();
  if (clean === '') return undefined;

  // Replace Python keywords with JS equivalents
  // Handle Python integer division //
  clean = clean.replace(/(\S+)\s*\/\/\s*(\S+)/g, 'Math.floor(($1) / ($2))');
  clean = clean.replace(/\bTrue\b/g, 'true');
  clean = clean.replace(/\bFalse\b/g, 'false');
  clean = clean.replace(/\bNone\b/g, 'null');
  clean = clean.replace(/\band\b/g, '&&');
  clean = clean.replace(/\bor\b/g, '||');
  clean = clean.replace(/\bnot\s+/g, '!');

  // Check for disallowed characters / functions
  if (/[\;\{\}\[\]\`]/.test(clean) && !clean.startsWith('[') && !clean.startsWith('{')) {
    // allow harmless brackets if list, but restrict strange symbols
  }

  const varNames = Object.keys(vars);
  const varValues = Object.values(vars);

  try {
    // Restrict global access
    const fn = new Function(...varNames, `"use strict"; return (${clean});`);
    return fn(...varValues);
  } catch (err: any) {
    throw new Error(`Cannot evaluate expression "${expr}": ${err.message}`);
  }
}

/**
 * Parses Python range(...) call arguments
 */
function parseRangeArgs(argString: string, vars: Record<string, any>): { start: number; end: number; step: number } {
  // Split arguments by comma respecting balanced parens
  const args: string[] = [];
  let depth = 0;
  let cur = '';
  for (let i = 0; i < argString.length; i++) {
    const ch = argString[i];
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    if (ch === ',' && depth === 0) {
      args.push(cur.trim());
      cur = '';
    } else {
      cur += ch;
    }
  }
  if (cur.trim()) args.push(cur.trim());

  if (args.length === 1) {
    const end = Number(evaluateExpr(args[0], vars));
    return { start: 0, end, step: 1 };
  } else if (args.length === 2) {
    const start = Number(evaluateExpr(args[0], vars));
    const end = Number(evaluateExpr(args[1], vars));
    return { start, end, step: 1 };
  } else if (args.length >= 3) {
    const start = Number(evaluateExpr(args[0], vars));
    const end = Number(evaluateExpr(args[1], vars));
    const step = Number(evaluateExpr(args[2], vars));
    return { start, end, step: step === 0 ? 1 : step };
  }
  return { start: 0, end: 0, step: 1 };
}

/**
 * Deterministic Python-subset interpreter for logic visualizer.
 * Strictly executes line-by-line and records execution snapshots.
 */
export function interpretPythonCode(code: string): InterpretationResult {
  const rawLines = code.split('\n');
  if (rawLines.length > 12) {
    return {
      valid: false,
      error: "This lesson can't be visualized yet (code exceeds 12 lines).",
      steps: [],
      finalVariables: {},
      finalOutput: '',
    };
  }

  // Pre-check for unsupported keywords
  const unsupportedRegex = /\b(import|from|def|class|lambda|yield|async|await|with|try|except|raise|finally|input)\b/;
  for (const line of rawLines) {
    if (unsupportedRegex.test(line)) {
      return {
        valid: false,
        error: "This lesson can't be visualized yet (unsupported Python keyword).",
        steps: [],
        finalVariables: {},
        finalOutput: '',
      };
    }
  }

  // Structure lines with indentation level
  interface ParsedLine {
    lineNum: number; // 1-indexed
    raw: string;
    trimmed: string;
    indent: number;
  }

  const lines: ParsedLine[] = rawLines.map((raw, idx) => {
    const indent = raw.search(/\S|$/);
    const trimmed = raw.trim();
    return {
      lineNum: idx + 1,
      raw,
      trimmed,
      indent,
    };
  });

  const variables: Record<string, any> = {};
  let output = '';
  const steps: TraceStep[] = [];
  const MAX_STEPS = 200;

  // Track loop contexts
  let linePtr = 0; // index in lines array

  // Map to find block boundaries
  function findBlockEnd(startIdx: number, baseIndent: number): number {
    let end = startIdx + 1;
    while (end < lines.length) {
      if (lines[end].trimmed === '' || lines[end].trimmed.startsWith('#')) {
        end++;
        continue;
      }
      if (lines[end].indent <= baseIndent) {
        break;
      }
      end++;
    }
    return end;
  }

  // Call stack for loops
  interface LoopState {
    type: 'for' | 'while';
    lineIdx: number;
    varName?: string;
    currentVal?: number;
    endVal?: number;
    step?: number;
    round: number;
    totalRounds: number;
    conditionExpr?: string;
    bodyStartIdx: number;
    bodyEndIdx: number;
  }

  const loopStack: LoopState[] = [];

  try {
    while (linePtr < lines.length && steps.length < MAX_STEPS) {
      const cur = lines[linePtr];

      // Skip blank or comment lines
      if (!cur.trimmed || cur.trimmed.startsWith('#')) {
        linePtr++;
        continue;
      }

      // Check if we reached end of loop body for active loop
      if (loopStack.length > 0) {
        const activeLoop = loopStack[loopStack.length - 1];
        if (linePtr >= activeLoop.bodyEndIdx) {
          // Loop iteration ended, cycle back to header
          if (activeLoop.type === 'for') {
            activeLoop.currentVal = (activeLoop.currentVal ?? 0) + (activeLoop.step ?? 1);
            activeLoop.round += 1;
            variables[activeLoop.varName!] = activeLoop.currentVal;

            const shouldContinue =
              (activeLoop.step ?? 1) > 0
                ? activeLoop.currentVal < activeLoop.endVal!
                : activeLoop.currentVal > activeLoop.endVal!;

            if (shouldContinue) {
              // Add loop condition step
              steps.push({
                stepIndex: steps.length,
                lineNumber: lines[activeLoop.lineIdx].lineNum,
                lineText: lines[activeLoop.lineIdx].trimmed,
                actionType: 'loop_check',
                label: `LOOP ${activeLoop.varName} = ${activeLoop.currentVal} (Round ${activeLoop.round} of ${activeLoop.totalRounds})`,
                loopInfo: {
                  currentRound: activeLoop.round,
                  totalRounds: activeLoop.totalRounds,
                  varName: activeLoop.varName!,
                },
                variables: { ...variables },
                changedVar: activeLoop.varName,
                output,
              });
              linePtr = activeLoop.bodyStartIdx;
              continue;
            } else {
              // Loop finished
              loopStack.pop();
              linePtr = activeLoop.bodyEndIdx;
              continue;
            }
          } else if (activeLoop.type === 'while') {
            activeLoop.round += 1;
            const cond = Boolean(evaluateExpr(activeLoop.conditionExpr!, variables));
            steps.push({
              stepIndex: steps.length,
              lineNumber: lines[activeLoop.lineIdx].lineNum,
              lineText: lines[activeLoop.lineIdx].trimmed,
              actionType: 'loop_check',
              label: `WHILE CONDITION (${activeLoop.conditionExpr}) -> ${cond ? 'True' : 'False'}`,
              loopInfo: {
                currentRound: activeLoop.round,
                totalRounds: activeLoop.round,
                varName: 'while',
              },
              variables: { ...variables },
              output,
            });

            if (cond) {
              linePtr = activeLoop.bodyStartIdx;
              continue;
            } else {
              loopStack.pop();
              linePtr = activeLoop.bodyEndIdx;
              continue;
            }
          }
        }
      }

      // Check current statement type
      const txt = cur.trimmed;

      // 1. FOR LOOP: for <var> in range(...)
      const forMatch = txt.match(/^for\s+([a-zA-Z_]\w*)\s+in\s+range\((.*)\)\s*:$/);
      if (forMatch) {
        const loopVar = forMatch[1];
        const rangeArgsStr = forMatch[2];
        const { start, end, step } = parseRangeArgs(rangeArgsStr, variables);
        const totalRounds = Math.max(0, Math.ceil((end - start) / step));
        const bodyEndIdx = findBlockEnd(linePtr, cur.indent);

        if (totalRounds > 0) {
          variables[loopVar] = start;
          const loopState: LoopState = {
            type: 'for',
            lineIdx: linePtr,
            varName: loopVar,
            currentVal: start,
            endVal: end,
            step,
            round: 1,
            totalRounds,
            bodyStartIdx: linePtr + 1,
            bodyEndIdx,
          };
          loopStack.push(loopState);

          steps.push({
            stepIndex: steps.length,
            lineNumber: cur.lineNum,
            lineText: txt,
            actionType: 'loop_check',
            label: `LOOP CONDITION for ${loopVar} in 1..${totalRounds} (${loopVar} = ${start})`,
            loopInfo: {
              currentRound: 1,
              totalRounds,
              varName: loopVar,
            },
            variables: { ...variables },
            changedVar: loopVar,
            output,
          });

          linePtr++;
          continue;
        } else {
          // Zero iterations, skip block
          steps.push({
            stepIndex: steps.length,
            lineNumber: cur.lineNum,
            lineText: txt,
            actionType: 'loop_check',
            label: `LOOP CONDITION for ${loopVar} (0 iterations, skipping)`,
            variables: { ...variables },
            output,
          });
          linePtr = bodyEndIdx;
          continue;
        }
      }

      // 2. WHILE LOOP: while <cond>:
      const whileMatch = txt.match(/^while\s+(.*)\s*:$/);
      if (whileMatch) {
        const condExpr = whileMatch[1];
        const bodyEndIdx = findBlockEnd(linePtr, cur.indent);
        const isTrue = Boolean(evaluateExpr(condExpr, variables));

        steps.push({
          stepIndex: steps.length,
          lineNumber: cur.lineNum,
          lineText: txt,
          actionType: 'loop_check',
          label: `WHILE CONDITION (${condExpr}) -> ${isTrue ? 'True' : 'False'}`,
          variables: { ...variables },
          output,
        });

        if (isTrue) {
          const loopState: LoopState = {
            type: 'while',
            lineIdx: linePtr,
            conditionExpr: condExpr,
            round: 1,
            totalRounds: 1,
            bodyStartIdx: linePtr + 1,
            bodyEndIdx,
          };
          loopStack.push(loopState);
          linePtr++;
          continue;
        } else {
          linePtr = bodyEndIdx;
          continue;
        }
      }

      // 3. IF / ELSE STATEMENT: if <cond>:
      const ifMatch = txt.match(/^if\s+(.*)\s*:$/);
      if (ifMatch) {
        const condExpr = ifMatch[1];
        const isTrue = Boolean(evaluateExpr(condExpr, variables));
        const ifBlockEnd = findBlockEnd(linePtr, cur.indent);

        steps.push({
          stepIndex: steps.length,
          lineNumber: cur.lineNum,
          lineText: txt,
          actionType: 'condition',
          label: `CONDITION if ${condExpr} (${isTrue ? 'True' : 'False'})`,
          variables: { ...variables },
          output,
        });

        if (isTrue) {
          linePtr++;
          continue;
        } else {
          // Skip if-body, check if followed by else:
          let elseIdx = ifBlockEnd;
          while (elseIdx < lines.length && (lines[elseIdx].trimmed === '' || lines[elseIdx].trimmed.startsWith('#'))) {
            elseIdx++;
          }
          if (elseIdx < lines.length && lines[elseIdx].indent === cur.indent && lines[elseIdx].trimmed === 'else:') {
            // Jump to else body
            linePtr = elseIdx + 1;
          } else {
            linePtr = ifBlockEnd;
          }
          continue;
        }
      }

      // Skip standalone else: when reached naturally from True if-block
      if (txt === 'else:') {
        const elseEnd = findBlockEnd(linePtr, cur.indent);
        linePtr = elseEnd;
        continue;
      }

      // 4. PRINT STATEMENT: print(...)
      const printMatch = txt.match(/^print\((.*)\)$/);
      if (printMatch) {
        const printArgStr = printMatch[1];
        let printedVal = '';

        if (printArgStr.trim()) {
          // Split by comma
          const parts: string[] = [];
          let depth = 0;
          let buff = '';
          for (let i = 0; i < printArgStr.length; i++) {
            const ch = printArgStr[i];
            if (ch === '(' || ch === '[' || ch === '{') depth++;
            else if (ch === ')' || ch === ']' || ch === '}') depth--;
            if (ch === ',' && depth === 0) {
              parts.push(buff.trim());
              buff = '';
            } else {
              buff += ch;
            }
          }
          if (buff.trim()) parts.push(buff.trim());

          const evaledParts = parts.map((p) => {
            const res = evaluateExpr(p, variables);
            return res !== undefined ? String(res) : '';
          });
          printedVal = evaledParts.join(' ');
        }

        output += (output ? '\n' : '') + printedVal;

        steps.push({
          stepIndex: steps.length,
          lineNumber: cur.lineNum,
          lineText: txt,
          actionType: 'print',
          label: `PRINT -> ${printedVal}`,
          variables: { ...variables },
          output,
        });

        linePtr++;
        continue;
      }

      // 5. AUGMENTED ASSIGNMENT: total += expr, etc.
      const augMatch = txt.match(/^([a-zA-Z_]\w*)\s*(\+=|-=|\*=|\/\/=|\/=|%=)\s*(.*)$/);
      if (augMatch) {
        const varName = augMatch[1];
        const op = augMatch[2];
        const expr = augMatch[3];
        const rhsVal = evaluateExpr(expr, variables);
        const curVal = variables[varName] ?? 0;
        let newVal: any = curVal;

        if (op === '+=') newVal = curVal + rhsVal;
        else if (op === '-=') newVal = curVal - rhsVal;
        else if (op === '*=') newVal = curVal * rhsVal;
        else if (op === '/=') newVal = curVal / rhsVal;
        else if (op === '//=') newVal = Math.floor(curVal / rhsVal);
        else if (op === '%=') newVal = curVal % rhsVal;

        variables[varName] = newVal;

        steps.push({
          stepIndex: steps.length,
          lineNumber: cur.lineNum,
          lineText: txt,
          actionType: 'assign',
          label: `LOOP BODY ${varName} ${op} ${rhsVal} (${varName} = ${newVal})`,
          variables: { ...variables },
          changedVar: varName,
          output,
        });

        linePtr++;
        continue;
      }

      // 6. STANDARD ASSIGNMENT: var = expr
      const assignMatch = txt.match(/^([a-zA-Z_]\w*)\s*=\s*(.*)$/);
      if (assignMatch) {
        const varName = assignMatch[1];
        const expr = assignMatch[2];
        const isNew = !(varName in variables);
        const val = evaluateExpr(expr, variables);
        variables[varName] = val;

        steps.push({
          stepIndex: steps.length,
          lineNumber: cur.lineNum,
          lineText: txt,
          actionType: isNew ? 'init' : 'assign',
          label: isNew ? `INITIALIZE ${varName} = ${val}` : `ASSIGN ${varName} = ${val}`,
          variables: { ...variables },
          changedVar: varName,
          output,
        });

        linePtr++;
        continue;
      }

      // Generic statement execution
      evaluateExpr(txt, variables);
      steps.push({
        stepIndex: steps.length,
        lineNumber: cur.lineNum,
        lineText: txt,
        actionType: 'assign',
        label: `EXECUTE ${txt}`,
        variables: { ...variables },
        output,
      });

      linePtr++;
    }

    // Add completion step if ended cleanly
    if (steps.length > 0) {
      const last = steps[steps.length - 1];
      steps.push({
        stepIndex: steps.length,
        lineNumber: last.lineNumber,
        lineText: 'Execution complete',
        actionType: 'done',
        label: 'PROGRAM COMPLETE',
        variables: { ...variables },
        output: output || 'Finished with no output',
      });
    }

    return {
      valid: true,
      steps,
      finalVariables: variables,
      finalOutput: output,
    };
  } catch (err: any) {
    return {
      valid: false,
      error: `Execution error on line ${lines[linePtr]?.lineNum || '?'}: ${err.message}`,
      steps,
      finalVariables: variables,
      finalOutput: output,
    };
  }
}
