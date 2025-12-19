import type { currentStatus } from ".";
import  { type model, evaluator } from "./constants"
import qusetionSet from "./questions/test.json" assert { type: "json" }
import { models } from "./constants";
import { OpenAI } from "openai/client.js";
import run from "./components/tables";
import fs from 'fs';
import { pricings } from './constants'

type question =  {
    question: string,
    answers: string[],
    negative_answers?: string[]
}

type response = {
    answer : string,
    cost : number,
    input_tokens: number,
    output_tokens: number,
    time_taken: number
}

async function clientCall(prompt:string, model: model):Promise<response>{
    const client = new OpenAI({
        baseURL: 'https://api.tokenfactory.nebius.com/v1/',
        apiKey: process.env.NEBIUS_API_KEY,
    });
    const c1 = performance.now()
    const res = await client.chat.completions.create({
        "model": model.model,
        "messages": [
            {
                "role": "system",
                "content": prompt
            },
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "hello"
                    }
                ]
            }
        ],
    })
    const c2 = performance.now()
    return {
        answer : res.choices[0]?.message.content ?? "",
        cost : res.usage?.total_tokens ?? 0,
        input_tokens: res.usage?.prompt_tokens ?? 0,
        output_tokens: res.usage?.completion_tokens ?? 0,
        time_taken: c2-c1
    }
}

export class ModelManager {
    model: model;
    questions: question[];
    status: currentStatus;
    constructor(model: model, questions: question[]){
        this.model = model;
        this.questions = questions;
        this.status = {
            id: this.model.id,
            model_name: model.name,
            accuracy: 0,
            progress: 0,
            cost: 0,
            time_taken: 0,
            input_tokens: 0,
            output_tokens: 0
        };
    } 

    async callEvaluator(question:question, answer: string){
        const prompt = `Evaluate the question object using answers and negative answers and the answer provided, give a rating of 0-100
                    object - [${question}] and the Answer to evaluate is - [${answer}], give only and only the number no full stop at the end either`
        const response = await clientCall(prompt, evaluator)
        const number = Number(response.answer)
        if (Number.isNaN(number)){
            console.log("the evaluator gave" + number)
            return 90;
        } 
        return number
    }

    async apiCall(question: question){
        const response = await clientCall(question.question + " **answer in one sentence**", this.model)
        const inputPricePerM = pricings.find(val => val.name === this.model.name)?.inputPricePerM ?? 0;
        const outputPricePerM = pricings.find(val => val.name === this.model.name)?.outputPricePerM ?? 0;
        return {
            answer: response.answer ?? "",
            cost: response.input_tokens*inputPricePerM/1000000 + response.output_tokens*outputPricePerM/1000000,
            input_tokens: response.input_tokens,
            output_tokens: response.output_tokens,
            time_taken:response.time_taken
        }
    }

    logger(question: question, answer: string, correctness: number) {
        const logDir = "/Users/kartikkannan/Desktop/benchmark/benchmark-cli/logs";
        if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

        const logFile = `${logDir}/${this.model.name}.log`;

        const log = `
Q - ${question.question}
Answers - ${JSON.stringify(question.answers)}
Negative Answers - ${JSON.stringify(question.negative_answers)}
Actual Answer - ${answer}
Token Usage - input(${this.status.input_tokens}), output(${this.status.output_tokens})
Score - ${correctness}
`;
        fs.appendFileSync(logFile, log + "\n");
    }


    async runTest(){
        for (const q of this.questions){
            const res = await this.apiCall(q)
            // const correctness = this.correctness(q, res.answer)
            const correctness:number = await this.callEvaluator(q,res.answer)
            this.status = {
                ...this.status,
                progress : (this.questions.indexOf(q)+1)*100/this.questions.length,
                accuracy : this.status.accuracy + correctness/this.questions.length,
                cost: Number(this.status.cost + (res.cost ?? 0)),
                input_tokens: this.status.input_tokens + (res.input_tokens ?? 0),
                output_tokens: this.status.output_tokens + (res.output_tokens ?? 0),
                time_taken: res.time_taken
            }
            this.logger(q,res.answer ?? "", correctness)
            
        }
        return this.status
        // console.log(this.status)
    }
}


if (models[0]){
    const model = new ModelManager(models[0],qusetionSet)
    model.runTest()
}
