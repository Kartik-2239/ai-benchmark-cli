import type { currentStatus, model, question, response } from "./types"
import { evaluator } from "./constants"
import { OpenAI } from "openai/client.js";
import fs from 'fs';
import { pricings } from './constants'
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": prompt
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
        output_tokens: (res.usage?.total_tokens ?? 0) - (res.usage?.prompt_tokens ?? 0),
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
            output_tokens: 0,
            pending: true
        };
    } 

    async callEvaluator(question:question, answer: string){
        const prompt = `Evaluate the question object using answers and negative answers and the answer provided, give a rating of 0-100
                    object - [${JSON.stringify(question)}] and the Answer to evaluate is - [${answer}], give only and only the number no full stop at the end either`
        const response = await clientCall(prompt, evaluator)
        const number = Number(response.answer)
        if (Number.isNaN(number)){
            console.log("the evaluator gave" + number)
            return 0;
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
        const logDir = `${__dirname}/logs`;
        if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

        const logFile = `${logDir}/${this.model.name}.log`;

        const log = `
Time - ${new Date().toISOString()}
Q - ${question.question}
Answers - ${JSON.stringify(question.answers)}
Negative Answers - ${JSON.stringify(question.negative_answers)}
Actual Answer - ${answer}
Token Usage - input(${this.status.input_tokens}), output(${this.status.output_tokens})
Score - ${correctness}
`;
        fs.appendFileSync(logFile, log + "\n");
    }

    checkCache(question: question) {
        const cacheDir = `${__dirname}/cache`;
        const cacheFile = `${cacheDir}/cache.json`;
        
        if (!fs.existsSync(cacheFile)) return null;
        const cache = JSON.parse(fs.readFileSync(cacheFile, "utf8"));
        const key = `${this.model.name}::${this.hashQuestion(question)}`;
        return cache.entries[key] ?? null;
    }

    hashQuestion(question: question): string {
        const normalized = JSON.stringify({
            question: question.question.trim().toLowerCase(),
            answers: [...question.answers].map(a => a.trim().toLowerCase()).sort(),
            negative_answers: (question.negative_answers ?? []).map(a => a.trim().toLowerCase()).sort()
        });
        const hasher = new Bun.CryptoHasher("md5");
        hasher.update(normalized);
        return hasher.digest("hex").slice(0, 16);
    }

    writeCache(question: question, result: { answer: string; input_tokens: number; output_tokens: number; cost: number; time_taken: number }, evaluationScore: number) {
        const cacheDir = "/Users/kartikkannan/Desktop/benchmark/benchmark-cli/cache";
        if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

        const cacheFile = `${cacheDir}/cache.json`;
        let cache = { cacheVersion: 1, entries: {} as Record<string, any> };

        if (fs.existsSync(cacheFile)) {
            cache = JSON.parse(fs.readFileSync(cacheFile, "utf8"));
        }

        const key = `${this.model.name}::${this.hashQuestion(question)}`;
        cache.entries[key] = {
            question: question.question,
            answers: question.answers,
            negative_answers: question.negative_answers,
            answer: result.answer,
            input_tokens: result.input_tokens,
            output_tokens: result.output_tokens,
            cost: result.cost,
            time_taken: result.time_taken,
            evaluationScore,
            timestamp: new Date().toISOString()
        };

        fs.writeFileSync(cacheFile, JSON.stringify(cache, null, 2), "utf8");
    }

    async *runTest(): AsyncGenerator<currentStatus> {
        for (const q of this.questions){
            //check
            const cached = this.checkCache(q);
            
            let res: { answer: string; input_tokens: number; output_tokens: number; cost: number; time_taken: number };
            let correctness: number;

            if (cached) {
                res = {
                    answer: cached.answer,
                    input_tokens: cached.input_tokens,
                    output_tokens: cached.output_tokens,
                    cost: cached.cost,
                    time_taken: cached.time_taken
                };
                correctness = cached.evaluationScore;
            } else {
                res = await this.apiCall(q);
                correctness = await this.callEvaluator(q, res.answer);
                
                this.writeCache(q, res, correctness);
            }

            this.status = {
                ...this.status,
                progress: (this.questions.indexOf(q) + 1) * 100 / this.questions.length,
                accuracy: this.status.accuracy + correctness / this.questions.length,
                cost: Number(this.status.cost + (res.cost ?? 0)),
                input_tokens: this.status.input_tokens + (res.input_tokens ?? 0),
                output_tokens: this.status.output_tokens + (res.output_tokens ?? 0),
                time_taken: res.time_taken,
                pending: false
            };
            this.logger(q, res.answer ?? "", correctness);
            yield {...this.status};
        }

        // return this.status;
    }
}


// if (models[0]){
//     const model = new ModelManager(models[0],qusetionSet)
//     model.runTest()
// }
