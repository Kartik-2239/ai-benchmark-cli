import { runTest } from "../src/ModelManager"
import { MakeQuestions } from "../src/MakeQuestions"
import readline from "readline"
import { argv } from "process"

if (argv[2] === "--help" || argv[2] === "-h" || argv.length === 2){
    console.log("Welcome to the benchmark-cli")
    console.log("-----------------------------------------------------------")
    console.log("Usage:                                                    |")
    console.log("  --run                      Run benchmark tests          |")
    console.log("  --create                   Interactive question creator |")
    // console.log("  --create -o                Use own question set         |")
    // console.log("  --create -t <topic>        Set topic                    |")
    // console.log("  --create -n <5-100>        Set number of questions      |")
    console.log("-----------------------------------------------------------")
}


if (argv[2] === "--run"){
    await runTest();
    process.exit(0);
}

if (argv[2] === "--create"){
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    })

    rl.question("Enter the topic (put some text files in docs/ for better quality): ", async (topic) => {
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
                console.log(`Creating ${num} questions about "${topic}"...`);
                await MakeQuestions(topic, num, description || undefined);
                console.log("\nQuestion set created! Run --run to start the benchmark.");
                rl.close();
            })
        })
    })
}



// async function main(){
//     await MakeQuestions("One Piece anime", 5);
//     await runTest();
// }

// main()
