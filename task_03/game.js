var colors = require("@colors/colors");

const {
    sleep,
    getRandInt,
    parseArg,
    getUserInput,
    getNumberOfLosingPairs,
    getNumberOfWinningPairs,
    getProbabilityMatrix,
    logTable,
    printTable,
} = require("./utils");

let args = process.argv.length > 4 ? process.argv.slice(2) : null;

const text2 =
    "It's time for my throw.\nI selected a random value in the range 0..5";
const text3 =
    "Add your number modulo 6.\n0 - 0\n1 - 1\n2 - 2\n3 - 3\n4 - 4\n5 - 5\nX - exit\n? - help";
const text4 =
    "It's time for your throw.\nI selected a random value in the range 0..5";
const text1 =
    "Let's determine who makes the first move.\nI selected a random value in the range 0..1";
const text5 = "Program Terminated!";
const text6 = "Invalid input! Please choose a valid option.";
const text7 =
    "Choose a number between 0 and 5 (inclusive) that correspond to your die's indices.";

const terminateProgram = () => {
    console.log(text5);
    process.exit(1);
};
const printHelp = (numDice, allDice) => {
    console.log("Probability of the win for the user:");
    printTable(numDice, allDice);
};

const simulateThrow = async (args) => {
    let res = await getUserInput("Your selection: ");
    succeed = false;
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
                printHelp(args.length, args);
                console.log(text7);
                res = await getUserInput("Your selection: ");
                continue;
            default:
                console.log(text6);
                res = await getUserInput("Your selection: ");
                continue;
        }
    }
};

const main = async (args) => {
    if (!args) {
        console.error(
            "Invalid input: Args must have at least 3 dice!\nExample:\n\t> node game.js 2,2,4,4,9,9 6,8,1,1,8,6 7,5,3,7,5,3"
        );
        return;
    }

    args = args.map((x) => parseArg(x));

    if (
        args.map((x) => x.length).reduce((a, b) => a + b, 0) / args.length !==
        6
    ) {
        console.error(
            "Invalid die configuration... Each die must have exactly 6 indices with numeric characters only"
        );
        return;
    }

    const NUM_FACES = 6;
    let dieIdxComputer;
    let dieIdxPlayer;
    let numsComputer = [];
    let numsPlayer = [];

    let [randInt, secret, hmac] = getRandInt(2);
    // randInt = randInt % 2;

    sleep(500);
    console.log(text1);
    sleep(1000);
    console.log(
        `(HMAC=${hmac.toUpperCase()}).\nTry to guess my selection.\n0 - 0\n1 - 1\nX - exit\n? - help`
    );
    sleep(500);

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
                terminateProgram();
            case "?":
                console.log(
                    "Try and predict my number which is either 1 or 0..."
                );
                res = await getUserInput("Your selection: ");
                continue;
            default:
                console.log(text6);
                res = await getUserInput("Your selection: ");
                continue;
        }
    }
    sleep(1000);

    console.log(`My selection: ${randInt} (KEY=${secret.toUpperCase()})`);
    sleep(1000);

    if (randInt !== parseInt(res)) {
        [randInt, secret, hmac] = getRandInt(args.length);
        // randInt = randInt % args.length;
        dieIdxComputer = randInt;
        console.log(
            `I make the first move and choose the [${args[dieIdxComputer]}] die.`
        );
        sleep(1000);
        const filteredArgs = structuredClone(args);
        filteredArgs.splice(dieIdxComputer, 1);

        console.log("Choose your dice:");
        sleep(500);
        filteredArgs.forEach((val, idx) => console.log(`${idx} - ${val}`));
        console.log("X - exit\n? - help");
        res = await getUserInput("Your selection: ");
        succeed = false;
        while (!succeed) {
            if (
                !Number.isNaN(Number(res)) &&
                parseInt(res) < filteredArgs.length
            ) {
                console.log(
                    `You choose the [${filteredArgs[parseInt(res)]}] die.`
                );
                succeed = true;
                break;
            } else {
                switch (res) {
                    case "X":
                        terminateProgram();
                    case "?":
                        printHelp(args.length, args);
                        console.log(
                            "Choose a number that corresponds to your die above."
                        );
                        res = await getUserInput("Your selection: ");
                        continue;
                    default:
                        console.log(text6);
                        res = await getUserInput("Your selection: ");
                        continue;
                }
            }
        }
        dieIdxPlayer = res;

        console.log(text2);
        sleep(1000);
        [randInt, secret, hmac] = getRandInt(NUM_FACES);
        // randInt = randInt % 6;
        numsComputer.push(randInt);
        console.log(`(HMAC=${hmac.toUpperCase()})`);
        sleep(1000);
        console.log(text3);
        sleep(500);

        res = await simulateThrow(args);
        numsPlayer.push(parseInt(res));

        console.log(`My number is ${randInt}\n(KEY=${secret.toUpperCase()})`);
        sleep(1000);
        console.log(
            `The result is ${res} + ${randInt} = ${
                (parseInt(res) + randInt) % 6
            } (mod 6)`
        );
        sleep(1000);
        console.log(
            `My throw is ${
                args[dieIdxComputer][(parseInt(res) + randInt) % 6]
            }.`
        );
        sleep(1000);
        console.log(text4);
        [randInt, secret, hmac] = getRandInt(NUM_FACES);
        // randInt = randInt % 6;
        numsComputer.push(randInt);
        console.log(`(HMAC=${hmac.toUpperCase()})`);
        sleep(1000);
        console.log(text3);
        sleep(500);

        res = await simulateThrow(args);
        numsPlayer.push(parseInt(res));
        console.log(`My number is ${randInt}\n(KEY=${secret.toUpperCase()})`);
        sleep(1000);
        console.log(
            `The result is ${res} + ${randInt} = ${
                (parseInt(res) + randInt) % 6
            } (mod 6)`
        );
        sleep(1000);
        console.log(
            `Your throw is ${
                filteredArgs[dieIdxPlayer][(parseInt(res) + randInt) % 6]
            }.`
        );

        let computerScore =
            args[dieIdxComputer][(numsPlayer[0] + numsComputer[0]) % 6];
        let playerScore =
            filteredArgs[dieIdxPlayer][(numsPlayer[1] + numsComputer[1]) % 6];
        sleep(1000);
        if (computerScore === playerScore) {
            console.log(`It's a tie ${playerScore} == ${computerScore}`);
        } else if (computerScore < playerScore) {
            console.log(`You win ${playerScore} > ${computerScore}`);
        } else {
            console.log(`I win ${playerScore} < ${computerScore}`);
        }
    } else {
        console.log("You make the first move. Choose your dice:");
        sleep(1000);
        args.forEach((val, idx) => console.log(`${idx} - ${val}`));
        console.log("X - exit\n? - help");
        sleep(500);
        res = await getUserInput("Your selection: ");
        succeed = false;
        while (!succeed) {
            if (!Number.isNaN(Number(res)) && parseInt(res) < args.length) {
                console.log(`You choose the [${args[parseInt(res)]}] die.`);
                succeed = true;
                break;
            } else {
                switch (res) {
                    case "X":
                        terminateProgram();
                    case "?":
                        printHelp(args.length, args);
                        console.log(
                            "Choose a number that corresponds to a die above."
                        );
                        res = await getUserInput("Your selection: ");
                        continue;
                    default:
                        console.log(text6);
                        res = await getUserInput("Your selection: ");
                        continue;
                }
            }
        }
        dieIdxPlayer = res;

        const filteredArgs = structuredClone(args);
        filteredArgs.splice(dieIdxPlayer, 1);
        [randInt, secret, hmac] = getRandInt(filteredArgs.length);
        // randInt = randInt % filteredArgs.length;
        dieIdxComputer = randInt;
        console.log(`I choose the [${filteredArgs[dieIdxComputer]}] die.`);

        sleep(1000);

        console.log(text2);
        sleep(1000);
        [randInt, secret, hmac] = getRandInt(NUM_FACES);
        // randInt = randInt % 6;
        numsComputer.push(randInt);
        console.log(`(HMAC=${hmac.toUpperCase()})`);
        sleep(1000);
        console.log(text3);
        sleep(500);

        res = await simulateThrow(args);
        numsPlayer.push(parseInt(res));
        console.log(`My number is ${randInt}\n(KEY=${secret.toUpperCase()})`);
        sleep(1000);
        console.log(
            `The result is ${res} + ${randInt} = ${
                (parseInt(res) + randInt) % 6
            } (mod 6)`
        );
        sleep(1000);
        console.log(
            `My throw is ${
                filteredArgs[dieIdxComputer][(parseInt(res) + randInt) % 6]
            }.`
        );
        console.log(text4);
        [randInt, secret, hmac] = getRandInt(NUM_FACES);
        // randInt = randInt % 6;
        sleep(1000);
        numsComputer.push(randInt);
        console.log(`(HMAC=${hmac.toUpperCase()})`);
        sleep(500);
        console.log(text3);
        sleep(500);

        res = await simulateThrow(args);
        numsPlayer.push(parseInt(res));
        console.log(`My number is ${randInt}\n(KEY=${secret.toUpperCase()})`);
        sleep(1000);
        console.log(
            `The result is ${res} + ${randInt} = ${
                (parseInt(res) + randInt) % 6
            } (mod 6)`
        );
        sleep(1000);
        console.log(
            `Your throw is ${
                args[dieIdxPlayer][(parseInt(res) + randInt) % 6]
            }.`
        );

        sleep(1000);
        let computerScore =
            filteredArgs[dieIdxComputer][(numsPlayer[0] + numsComputer[0]) % 6];
        let playerScore =
            args[dieIdxPlayer][(numsPlayer[1] + numsComputer[1]) % 6];
        if (computerScore === playerScore) {
            console.log(`It's a tie ${playerScore} == ${computerScore}`);
        } else if (computerScore < playerScore) {
            console.log(`You win ${playerScore} > ${computerScore}`);
        } else {
            console.log(`I win ${playerScore} < ${computerScore}`);
        }
    }
};

main(args);
