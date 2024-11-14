const crypto = require("node:crypto");
const readline = require("node:readline");
const Table = require("cli-table3");
var colors = require("@colors/colors");


const getRandInt = (max) => {
    const secret = crypto.randomBytes(32);
    

    let randInt = crypto.randomInt(max);
    var hmac = crypto.createHmac("sha256", crypto.randomBytes(32));
    hmac = hmac.update(randInt.toString()).digest("hex");
    

    return [randInt, secret.toString("hex"), hmac];
};

const parseArg = (arg) => {
    return arg
        .trim()
        .split(",")
        .filter((x) => x !== "")
        .map((x) => Number(x))
        .filter((x) => !Number.isNaN(x));
};


const getUserInput = (query) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    
    return new Promise((resolve) => {
        rl.question(query.green, (value) => {
            rl.close();
            resolve(value.toUpperCase()); 
        });
    });
};

const getNumberOfLosingPairs = (userDie, computerDie) => {
    let losingPairs = 0;
    computerDie.forEach((x) => {
        userDie.forEach((y) => {
            x > y ? losingPairs++ : "";
        });
    });

    return losingPairs;
};

const getNumberOfWinningPairs = (userDie, computerDie) => {
    let winningPairs = 0;
    userDie.forEach((x) => {
        computerDie.forEach((y) => {
            x > y ? winningPairs++ : "";
        });
    });

    return winningPairs;
};

const getProbabilityMatrix = (numDice, allDice) => {
    const matrix = new Array(numDice);
    for (let i = 0; i < numDice; i++) {
        matrix[i] = new Array(numDice).fill(0);
    }

    allDice.forEach((val1, idx1) => {
        allDice.forEach((val2, idx2) => {
            let probability = getNumberOfWinningPairs(val1, val2) / 36;
            matrix[idx1][idx2] = probability.toPrecision(3);
        });
    });
    return matrix;
};

const logTable = (matrix, allDice) => {
    const rowHeaders = ["placeholder", ...allDice.map((x) => x.toString())];
    let arr = [allDice.map((x) => x.toString().red.bold), ...matrix];
    arr.forEach((val, idx) => {
        val.unshift(rowHeaders[idx].brightBlue.bold);
    });

    arr[0][0] = "User Dice".yellow.bold.underline + " ↓".brightBlue.bold;

    let table = new Table({
        chars: {
            top: "═",
            "top-mid": "╤",
            "top-left": "╔",
            "top-right": "╗",
            bottom: "═",
            "bottom-mid": "╧",
            "bottom-left": "╚",
            "bottom-right": "╝",
            left: "║",
            "left-mid": "╟",
            right: "║",
            "right-mid": "╢",
        },
        style: {
            head: [],
            border: [],
        },
    });
    table.push(...arr);
    console.log(table.toString());
};

const printTable = (numDice, allDice) => {
    const matrix = getProbabilityMatrix(numDice, allDice);
    logTable(matrix, allDice);
};

module.exports = {
    getRandInt,
    parseArg,
    getUserInput,
    getNumberOfLosingPairs,
    getNumberOfWinningPairs,
    getProbabilityMatrix,
    logTable,
    printTable,
};
