var colors = require("@colors/colors");

const {
    getRandInt,
    parseArg,
    getUserInput,
    getNumberOfLosingPairs,
    getNumberOfWinningPairs,
    getProbabilityMatrix,
    logTable,
    printTable,
} = require("./utils");

class Player {
    constructor(d, idx) {
        this.die = d;
        this.dieIdx = idx;
        this.score = 0;
        this.inputs = [];
    }
}

class Computer {
    constructor(d, idx) {
        this.die = d;
        this.dieIdx = idx;
        this.score = 0;
        this.inputs = [];
    }
}

class Game {
    constructor(args) {
        let ad = args.length > 4 ? args.slice(2) : null;

        this.allDice = ad ? ad.map((x) => parseArg(x)) : null;
        this.numOfDice = ad ? this.allDice.length : 0;
    }
    static numberOfFaces = 6;
    //textBlocks
    static get texts() {
        return {
            text1: "Let's determine who makes the first move.\nI selected a random value in the range 0..1",
            text2: `It's time for my throw.\nI selected a random value in the range 0..${
                Game.numberOfFaces - 1
            }`,
            text3: `Add your number modulo ${Game.numberOfFaces}.\n${[
                ...Array(Game.numberOfFaces)
                    .keys()
                    .map((x) => `${x} - ${x}`),
            ].join("\n")}\nX - exit\n? - help`,
            text4: `It's time for your throw.\nI selected a random value in the range 0..${
                Game.numberOfFaces - 1
            }`,
            text5: "Program Terminated!",
            text6: "Invalid input! Please choose a valid option.",
            text7: `Choose a number between 0 and ${
                Game.numberOfFaces - 1
            } (inclusive) that correspond to your die's indices.`,
        };
    }

    static terminateProgram() {
        console.log(Game.texts.text5);
        process.exit(1);
    }
    printHelp() {
        console.log("Probability of the win for the user:");
        printTable(this.numOfDice, this.allDice);
    }
    async simulateThrow() {
        let res = await getUserInput("Your selection: ");
        let succeed = false;
        while (!succeed) {
            switch (res) {
                case "0":
                case "1":
                case "2":
                case "3":
                case "4":
                case "5":
                    succeed = true;
                    return res;
                case "X":
                    terminateProgram();
                case "?":
                    printHelp(this.numOfDice, this.allDice);
                    console.log(Game.texts.text7);
                    res = await getUserInput("Your selection: ");
                    continue;
                default:
                    console.log(Game.texts.text6);
                    res = await getUserInput("Your selection: ");
                    continue;
            }
        }
    }
    static printResult(playerScore, computerScore) {
        if (computerScore === playerScore) {
            console.log(`It's a tie ${playerScore} == ${computerScore}`);
        } else if (computerScore < playerScore) {
            console.log(`You win ${playerScore} > ${computerScore}`);
        } else {
            console.log(`I win ${playerScore} < ${computerScore}`);
        }
    }

    computeScore(player, computer) {
        let computerScore =
            computer.die[
                (player.inputs[0] + computer.inputs[0]) % Game.numberOfFaces
            ];
        let playerScore =
            player.die[
                (player.inputs[1] + computer.inputs[1]) % Game.numberOfFaces
            ];

        return [playerScore, computerScore];
    }

    async run() {
        // Check for error
        if (!this.allDice) {
            console.error(
                "Invalid input: Args must have at least 3 dice!\nExample:\n\t> node game.js 2,2,4,4,9,9 6,8,1,1,8,6 7,5,3,7,5,3"
            );
            return;
        }

        if (
            !this.allDice
                .map((x) => x.length)
                .every((x) => x === Game.numberOfFaces)
        ) {
            console.error(
                `Invalid die configuration... Each die must have exactly ${Game.numberOfFaces} indices with numeric characters only`
            );
            return;
        }

        let [randInt, secret, hmac] = getRandInt(2);
        console.log(Game.texts.text1);
        console.log(
            `(HMAC=${hmac.toUpperCase()}).\nTry to guess my selection.\n0 - 0\n1 - 1\nX - exit\n? - help`
        );
        let res = await getUserInput("Your selection: ");
        let succeed = false;
        while (!succeed) {
            switch (res) {
                case "0":
                    succeed = true;
                    break;
                case "1":
                    succeed = true;
                    break;
                case "X":
                    Game.terminateProgram();
                case "?":
                    console.log(
                        "Try and predict my number which is either 1 or 0..."
                    );
                    res = await getUserInput("Your selection: ");
                    continue;
                default:
                    console.log(Game.texts.text6);
                    res = await getUserInput("Your selection: ");
                    continue;
            }
        }
        console.log(`My selection: ${randInt} (KEY=${secret.toUpperCase()})`);
        if (randInt !== parseInt(res)) {
            [randInt, secret, hmac] = getRandInt(this.numOfDice);
            let computer = new Computer(this.allDice[randInt], randInt);
            // randInt = randInt % args.length;
            // dieIdxComputer = randInt;
            console.log(
                `I make the first move and choose the [${computer.die}] die.`
            );

            const filteredArgs = structuredClone(this.allDice);
            filteredArgs.splice(computer.dieIdx, 1);

            console.log("Choose your dice:");

            filteredArgs.forEach((val, idx) => console.log(`${idx} - ${val}`));
            console.log("X - exit\n? - help");
            res = await getUserInput("Your selection: ");
            succeed = false;
            while (!succeed) {
                if (
                    !Number.isNaN(Number(res)) &&
                    parseInt(res) < this.numOfDice - 1
                ) {
                    console.log(
                        `You choose the [${filteredArgs[parseInt(res)]}] die.`
                    );
                    succeed = true;
                    break;
                } else {
                    switch (res) {
                        case "X":
                            Game.terminateProgram();
                        case "?":
                            this.printHelp();
                            console.log(
                                "Choose a number that corresponds to your die above."
                            );
                            res = await getUserInput("Your selection: ");
                            continue;
                        default:
                            console.log(Game.texts.text6);
                            res = await getUserInput("Your selection: ");
                            continue;
                    }
                }
            }
            let player = new Player(filteredArgs[parseInt(res)], parseInt(res));
            // dieIdxPlayer = res;

            console.log(Game.texts.text2);

            [randInt, secret, hmac] = getRandInt(Game.numberOfFaces);

            computer.inputs.push(randInt);
            console.log(`(HMAC=${hmac.toUpperCase()})`);

            console.log(Game.texts.text3);

            res = await this.simulateThrow();
            player.inputs.push(parseInt(res));

            console.log(
                `My number is ${randInt}\n(KEY=${secret.toUpperCase()})`
            );

            console.log(
                `The result is ${res} + ${randInt} = ${
                    (parseInt(res) + randInt) % Game.numberOfFaces
                } (mod 6)`
            );

            console.log(
                `My throw is ${
                    computer.die[(parseInt(res) + randInt) % Game.numberOfFaces]
                }.`
            );

            console.log(Game.texts.text4);
            [randInt, secret, hmac] = getRandInt(Game.numberOfFaces);
            // randInt = randInt % 6;
            computer.inputs.push(randInt);
            console.log(`(HMAC=${hmac.toUpperCase()})`);

            console.log(Game.texts.text3);

            res = await this.simulateThrow();
            player.inputs.push(parseInt(res));
            console.log(
                `My number is ${randInt}\n(KEY=${secret.toUpperCase()})`
            );

            console.log(
                `The result is ${res} + ${randInt} = ${
                    (parseInt(res) + randInt) % Game.numberOfFaces
                } (mod 6)`
            );

            console.log(
                `Your throw is ${
                    player.die[(parseInt(res) + randInt) % Game.numberOfFaces]
                }.`
            );

            const [playerScore, computerScore] = this.computeScore(
                player,
                computer
            );

            Game.printResult(playerScore, computerScore);
        } else {
            console.log("You make the first move. Choose your dice:");

            this.allDice.forEach((val, idx) => console.log(`${idx} - ${val}`));
            console.log("X - exit\n? - help");

            res = await getUserInput("Your selection: ");
            succeed = false;
            while (!succeed) {
                if (
                    !Number.isNaN(Number(res)) &&
                    parseInt(res) < this.numOfDice
                ) {
                    console.log(
                        `You choose the [${this.allDice[parseInt(res)]}] die.`
                    );
                    succeed = true;
                    break;
                } else {
                    switch (res) {
                        case "X":
                            Game.terminateProgram();
                        case "?":
                            this.printHelp();
                            console.log(
                                "Choose a number that corresponds to a die above."
                            );
                            res = await getUserInput("Your selection: ");
                            continue;
                        default:
                            console.log(Game.texts.text6);
                            res = await getUserInput("Your selection: ");
                            continue;
                    }
                }
            }
            // dieIdxPlayer = res;
            let player = new Player(this.allDice[parseInt(res)], parseInt(res));

            const filteredArgs = structuredClone(this.allDice);
            filteredArgs.splice(player.dieIdx, 1);
            [randInt, secret, hmac] = getRandInt(this.numOfDice - 1);
            // randInt = randInt % filteredArgs.length;
            let computer = new Computer(filteredArgs[randInt], randInt);
            // dieIdxComputer = randInt;
            console.log(`I choose the [${computer.die}] die.`);

            console.log(Game.texts.text2);

            [randInt, secret, hmac] = getRandInt(Game.numberOfFaces);
            // randInt = randInt % 6;
            computer.inputs.push(randInt);
            console.log(`(HMAC=${hmac.toUpperCase()})`);

            console.log(Game.texts.text3);

            res = await this.simulateThrow();
            player.inputs.push(parseInt(res));
            console.log(
                `My number is ${randInt}\n(KEY=${secret.toUpperCase()})`
            );

            console.log(
                `The result is ${res} + ${randInt} = ${
                    (parseInt(res) + randInt) % Game.numberOfFaces
                } (mod 6)`
            );

            console.log(
                `My throw is ${
                    computer.die[(parseInt(res) + randInt) % Game.numberOfFaces]
                }.`
            );
            console.log(Game.texts.text4);
            [randInt, secret, hmac] = getRandInt(Game.numberOfFaces);
            // randInt = randInt % 6;

            computer.inputs.push(randInt);
            console.log(`(HMAC=${hmac.toUpperCase()})`);

            console.log(Game.texts.text3);

            res = await this.simulateThrow();
            player.inputs.push(parseInt(res));
            console.log(
                `My number is ${randInt}\n(KEY=${secret.toUpperCase()})`
            );

            console.log(
                `The result is ${res} + ${randInt} = ${
                    (parseInt(res) + randInt) % Game.numberOfFaces
                } (mod 6)`
            );

            console.log(
                `Your throw is ${
                    player.die[(parseInt(res) + randInt) % Game.numberOfFaces]
                }.`
            );

            const [playerScore, computerScore] = this.computeScore(
                player,
                computer
            );
            Game.printResult(playerScore, computerScore);
        }
    }
}

module.exports = { Player, Computer, Game };
