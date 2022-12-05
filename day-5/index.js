import assert from "node:assert/strict";
import { testInput, input } from "./input.js";

const movesRe = new RegExp("move (\\d+) from (\\d+) to (\\d+)");
const stacksRe = new RegExp("(\\[[A-Z]\\] ?|    ?)", "g");

/**
 * @param {string} moves
 * @returns {Array<{amount: number, from: number, to: number}>}
 */
function getMoves(moves) {
  return moves
    .trim()
    .split("\n")
    .map((line) => {
      const n = line.match(movesRe).slice(1, 4);
      return {
        amount: Number(n[0]),
        from: Number(n[1]),
        to: Number(n[2]),
      };
    });
}

/**
 * @param {string} stacks
 * @returns {string[][]} each array in the array represents a stack
 */
function makeStacks(stacks) {
  const lines = stacks
    .split("\n")
    .filter((e) => !!e) // cant use trim so this gets rid of completely empty lines
    .slice(0, -1) // remove the last row with the stack numbers
    .map((line) => line.match(stacksRe));

  // re-order everything to put items in their proper stacks
  // create array of arrays, where each array represents a stack
  // index 0 is the bottom of the stack
  const stacked = [];
  for (let i = 0; i < lines.length; i++) {
    const col = lines[i];
    for (let j = 0; j < col.length; j++) {
      if (!Array.isArray(stacked[j])) {
        stacked[j] = [];
      }
      const val = col[j].trim();
      if (val) {
        stacked[j].unshift(col[j]);
      }
    }
  }
  return stacked;
}

/**
 * @param {string} crates
 * @returns {string}
 */
function crateMover9000(crates) {
  const [s, m] = crates.split(/\n\s*\n/);

  const stacks = makeStacks(s);
  const moves = getMoves(m);

  for (let m = 0; m < moves.length; m++) {
    const mv = moves[m];
    for (let i = 0; i < mv.amount; i++) {
      stacks[mv.to - 1].push(stacks[mv.from - 1].pop());
    }
  }

  return stacks
    .map((s) => s.pop())
    .join("")
    .replace(/[\[\] ]/g, "");
}

// test
assert.equal(crateMover9000(testInput), "CMZ");

console.time("part 1");
const resultPart1 = crateMover9000(input);
console.timeEnd("part 1");

assert.equal(resultPart1, "QNNTGTPFN");
console.log("Result 1:", resultPart1);

/*********************************
 * Part 2
 */

/**
 * @param {string} crates
 * @returns {string}
 */
function crateMover9001(crates) {
  const [s, m] = crates.split(/\n\s*\n/);

  const stacks = makeStacks(s);
  const moves = getMoves(m);

  moves.forEach((mv) => {
    const len = stacks[mv.from - 1].length;
    const toMove = stacks[mv.from - 1].splice(len - mv.amount, len);
    stacks[mv.to - 1] = stacks[mv.to - 1].concat(toMove);
  });

  return stacks
    .map((s) => s.pop())
    .join("")
    .replace(/[\[\] ]/g, "");
}

// test
assert.equal(crateMover9001(testInput), "MCD");

console.time("part 2");
const resultPart2 = crateMover9001(input);
console.timeEnd("part 2");

assert.equal(resultPart2, "GGNPJBTTR");
console.log("Result 2:", resultPart2);
