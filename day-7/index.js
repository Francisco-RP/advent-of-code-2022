import assert from "node:assert/strict";
import fs from "node:fs";

/***********************************************************************
 * Input data
 */

const input = fs.readFileSync("./input.txt", { encoding: "utf-8" });
const testInput = `
$ cd /
$ ls
dir a
14848514 b.txt
8504156 c.dat
dir d
$ cd a
$ ls
dir e
29116 f
2557 g
62596 h.lst
$ cd e
$ ls
584 i
$ cd ..
$ cd ..
$ cd d
$ ls
4060174 j
8033020 d.log
5626152 d.ext
7214296 k`;

/***********************************************************************
 * Shared functions/classes
 */

class Node {
  constructor(name, parent) {
    /**
     * @type {string}
     */
    this.name = name;
    /**
     * @type {Node}
     */
    this.parent = parent;
    /**
     * @type {Node[]}
     */
    this.subDirs = [];
    this.total = 0;
  }

  /**
   * @param {Node} dirNode
   */
  addDir(dirNode) {
    this.subDirs.push(dirNode);
  }

  /**
   * @param {string} name
   * @returns {Node}
   */
  findDir(name) {
    return this.subDirs.find((d) => d.name === name);
  }

  /**
   * @param {number*} size
   */
  updateTotal(size) {
    this.total += size;

    // add size to the parent as well, this will continue up the tree to each parent node
    this.parent?.updateTotal(size);
  }
}

class Directory {
  /**
   * @param {Node} startingNode
   * @param {string} str the starting input string
   */
  constructor(startingNode, str) {
    this.topLevel = startingNode;
    this.currentNode = startingNode;
    str.trim().split("\n").splice(1).forEach(this.parseLine.bind(this));
  }

  /**
   * @param {string} cmdLine
   */
  handleCommand(cmdLine) {
    const [cmd, arg] = cmdLine.substring(2).split(" ");
    if (cmd !== "cd") return;

    // only 'cd' is important, 'ls' can be ignored
    if (arg === "..") {
      this.currentNode = this.currentNode.parent;
    } else {
      this.currentNode = this.currentNode.findDir(arg);
    }
  }

  /**
   * @param {string} line
   */
  handleList(line) {
    const [info, name] = line.split(" ");
    if (info === "dir") {
      this.currentNode.addDir(new Node(name, this.currentNode));
    } else {
      // tracking files is not important, we only really need their size
      this.currentNode.updateTotal(Number(info));
    }
  }

  /**
   * @param {string} line
   */
  parseLine(line) {
    if (line.startsWith("$")) {
      this.handleCommand(line);
    } else {
      this.handleList(line);
    }
  }
}

/***********************************************************************
 * Part 1
 */

/**
 * recursively sum totals of dirs that are <= 100000
 * travels from starting node down through all of its children
 * @param {Node} n
 * @returns {number}
 */
function getSum(n) {
  let total = 0;
  for (let i = 0; i < n.subDirs.length; i++) {
    const dir = n.subDirs[i];
    if (dir.total <= 100000) {
      total += dir.total;
    }
    if (dir.subDirs.length) {
      total += getSum(dir);
    }
  }

  return total;
}

/**
 *
 * @param {string} str the input string
 * @returns {number}
 */
function part1(str) {
  const directory = new Directory(new Node("/"), str);
  return getSum(directory.topLevel);
}

// test
assert.equal(part1(testInput), 95437);

console.time("Part 1");
const result1 = part1(input);
console.timeEnd("Part 1");

assert.equal(result1, 1886043);
console.log("Result 1:", result1);

/***********************************************************************
 * Part 2
 */

const DISK_SPACE = 70000000;
const NEEDED = 30000000;

/**
 * Find all directories that when added to the difference, is over the needed amount
 * recursively travels from starting node down through all of its children
 * @param {Node} n current Node
 * @param {number} diff how much is left in the disk space overall (total disk space - top level dir's '/' total)
 * @return {number}
 */
function getAllTotals(n, diff) {
  let options = [];
  for (let i = 0; i < n.subDirs.length; i++) {
    const dir = n.subDirs[i];
    if (diff + dir.total > NEEDED) {
      options.push(dir.total);
    }
    if (dir.subDirs.length) {
      options = options.concat(getAllTotals(dir, diff));
    }
  }
  return options;
}

/**
 * @param {string} str the input string
 * @returns {number}
 */
function part2(str) {
  const directory = new Directory(new Node("/"), str);

  // get array of possible dir totals that could be deleted, sort them and get the smallest one
  return getAllTotals(directory.topLevel, DISK_SPACE - directory.topLevel.total)
    .sort((a, b) => b - a)
    .pop();
}

// test
assert.equal(part2(testInput), 24933642);

console.time("Part 2");
const result2 = part2(input);
console.timeEnd("Part 2");

assert.equal(result2, 3842121);

console.log("Result 2:", result2);
