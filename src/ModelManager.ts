import type { currentStatus, model, question, response } from "./types"
import { evaluator, models, pricings, BASE_URL } from "./constants/index"
import { OpenAI } from "openai/client.js";
import fs from 'fs';
import { dirname } from "path";
import { fileURLToPath } from "url";
import run from "./components/tables";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function clientCall(prompt:string, model: model):Promise<response>{
    const client = new OpenAI({
        baseURL: BASE_URL,
        apiKey: process.env.NEBIUS_API_KEY //|| process.env.OPENROUTER_API_KEY,
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
    questionSetPath: string;
    constructor(model: model, questions: question[], questionSetPath: string){
        this.model = model;
        this.questions = questions;
        this.questionSetPath = questionSetPath;
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
        const prompt = `Evaluate the question object using answers and negative answers and the answer provided, give a rating of 0-100.
                        negative answers reduce points and positive answers increase points.
                        the question is - [${question.question}],
                        the answers are - [${question.answers}],
                        the negative answers are - [${question.negative_answers}],
                        the answer to evaluate is - [${answer}],
                        give only and only the number no full stop at the end either`
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
        const logDir = `${__dirname}/../logs`;
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
        const cacheDir = `${__dirname}/../cache`;
        const cacheFile = `${cacheDir}/cache-${this.getQuestionSetHash()}.json`;
        
        if (!fs.existsSync(cacheFile)) return null;
        const cache = JSON.parse(fs.readFileSync(cacheFile, "utf8"));
        if (cache.questionSetId !== this.questionSetPath || cache.questionSetHash !== this.getQuestionSetHash()) {
            return null;
        }
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
    getQuestionSetHash(): string {
        const content = fs.readFileSync(this.questionSetPath, "utf8");
        const hasher = new Bun.CryptoHasher("sha1");
        hasher.update(content);
        return hasher.digest("hex");
    }

    writeCache(question: question, result: { answer: string; input_tokens: number; output_tokens: number; cost: number; time_taken: number }, evaluationScore: number) {
        const cacheDir = `${__dirname}/../cache`;
        if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

        const cacheFile = `${cacheDir}/cache-${this.getQuestionSetHash()}.json`;
        let cache = { cacheVersion: 1, questionSetId: this.questionSetPath, questionSetHash: this.getQuestionSetHash(), entries: {} as Record<string, any> };

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
    }
}

export async function runTest(questionSetPath: string){
    const listStatus: currentStatus[] = models.map((model: model) => ({
        id: model.id,
        model_name: model.name,
        progress: 0,
        accuracy: 0,
        input_tokens: 0,
        output_tokens: 0,
        cost: 0,
        time_taken: 0,
        pending: true
    }))
    
    run(listStatus)
    
    for (let i = 0; i < models.length; i++) {
        const model = models[i]!
        // if (!fs.existsSync(questionSetPath)){
        //     console.log("Question set already exists");
        //     return;
        // }
        const q = JSON.parse(fs.readFileSync(questionSetPath, "utf8"))
        const m = new ModelManager(model, q, questionSetPath)
        // const status = await m.runTest()
        var total_time = 0;
        for await (const status of m.runTest()) {
            total_time += status.time_taken;
            listStatus[i] = { ...status, pending: false, time_taken: total_time }
            run(listStatus)
        }
        // listStatus[i] = { ...status, pending: false }
        // run(listStatus)
    }
}