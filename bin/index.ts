import { runTest } from "../src/ModelManager"
import { MakeQuestions } from "../src/MakeQuestions"
import fs from "fs"
import readline from "readline"
import { argv } from "process"
import { QuestionsSelector } from "../src/components/QuestionsSelector"
import { render } from "ink"
import React from "react"
import { QUESTION_SET_DIR } from "../src/constants"

if (argv[2] === "--help" || argv[2] === "-h" || argv.length === 2){
    console.log(`welcome to ai-benchmark-cli`)
    console.log(
  "\x1b[36m" + // cyan
  "       _        _                     _                          _               _ _ \n" +
  "      (_)      | |                   | |                        | |             | (_)\n" +
  "\x1b[34m" + // blue
  "  __ _ _ ______| |__   ___ _ __   ___| |__  _ __ ___   __ _ _ __| | ________ ___| |_ \n" +
  " / _` | |______| '_ \\ / _ \\ '_ \\ / __| '_ \\| '_ ` _ \\ / _` | '__| |/ /______/ __| | |\n" +
  "\x1b[36m" + // cyan
  "| (_| | |      | |_) |  __/ | | | (__| | | | | | | | | (_| | |  |   <      | (__| | |\n" +
  " \\__,_|_|      |_.__/ \\___|_| |_|\\___|_| |_|_| |_| |_|\\__,_|_|  |_|\\_\\      \\___|_|_|\n" +
  "\x1b[0m" // reset
);
   
    
    console.log(" ----------------------------------------------------------")
    console.log("| Usage:                                                   |")
    console.log("|  --run                      Run benchmark tests          |")
    console.log("|  --create                   Interactive question creator |")
    // console.log("  --create -o                Use own question set         |")
    // console.log("  --create -t <topic>        Set topic                    |")
    // console.log("  --create -n <5-100>        Set number of questions      |")
    console.log(" ----------------------------------------------------------")
}


if (argv[2] === "--run"){
    let curPath = "";
    const questionSetPaths = fs.readdirSync(QUESTION_SET_DIR);
    if (questionSetPaths.length === 0){
        console.log("No question sets found");
        process.exit(0);
    }
    const setPath = async (path: string) => {
        questionSelector.unmount();
        questionSelector.clear();
        curPath = QUESTION_SET_DIR + "/" + path;
        console.log("Current path: ", curPath);
        console.log("Running test on: ", path);
    }
    const questionSelector = render(React.createElement(QuestionsSelector, { questionPath: questionSetPaths, setPath: setPath }))
    await questionSelector.waitUntilExit()
    runTest(curPath);
    // process.exit(0);
}

if (argv[2] === "--create"){
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    })

    rl.question("Enter the name (put some text files in docs/ for better quality): ", async (topic) => {
        if (topic.trim().length < 3){
            console.log("Topic must be at least 3 characters long");
            rl.close();
            return;
        }
        rl.question("Enter the number of questions (5-100): ", async (numberOfQuestions) => {
            const num = parseInt(numberOfQuestions);
            if (isNaN(num)){
                console.log("Number of questions must be a number");
                rl.close();
                return;
            }
            if (num < 5 || num > 100){
                console.log("Number of questions must be between 5 and 100");
                rl.close();
                return;
            }
            rl.question("Enter a description for the questions (optional, press enter to skip): ", async (description) => {
                await MakeQuestions(topic, QUESTION_SET_DIR + "/" + topic + ".json", num, description || undefined);
                // console.log(`Select a question set to use:`)
                // const questionSetPaths = fs.readdirSync(QUESTION_SET_DIR);
                // const setPath = async (path: string) => {
                //     // await MakeQuestions(topic, num, description || undefined, path || undefined);
                //     questionSelector.unmount();
                //     questionSelector.clear();
                // }
                // const questionSelector = render(React.createElement(QuestionsSelector, { questionPath: questionSetPaths, setPath: setPath }))
            })
        })
    })
}



// async function main(){
//     await MakeQuestions("One Piece anime", 5);
//     await runTest();
// }

// main()
