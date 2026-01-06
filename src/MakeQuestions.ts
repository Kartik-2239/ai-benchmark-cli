import { BASE_URL, QUESTION_SET_PATH, questionMaker } from "./constants/index.ts"
import { OpenAI } from "openai/client.js";
import { z } from "zod";
import fs from 'fs';
import { dirname } from 'path';
import { DOCS_PATH } from "./constants/index.ts";
import { PDFParse } from 'pdf-parse';
import { zodTextFormat } from "openai/helpers/zod.js";
import type { question } from "./types/index.ts";
import { xdescribe } from "bun:test";



export async function MakeQuestions(topic: string, questionSetPath: string, numberOfQuestions?: number, description?: string){
    // if (fs.existsSync(questionSetPath)){
    //     console.log("Question set already exists");
    //     return;
    // }
    if (!numberOfQuestions){
        numberOfQuestions = 20;
    }

    const client = new OpenAI({
        baseURL: BASE_URL,
        apiKey: process.env.NEBIUS_API_KEY
    });

    const Question = z.object({
        questions: z.array(z.object({
            question: z.string(),
            answers: z.array(z.string().describe("The correct answer to the question.")),
            negative_answers: z.array(z.string().describe("A negative answer to the question.")),
        }))
    });
    const data = await readDocs(description || "");
    const validated: question[] = [];
    let i = 0;
    const outputPath = questionSetPath;
    const outputDir = dirname(outputPath);
    const batchSize = 5;

    for (let j = 0; j < numberOfQuestions; j++) {
        if (j%batchSize !== 0) continue;
        console.log("j: ", j);
        const currentQuestionIndex = Math.floor(Math.random() * data.length);
        data.splice(currentQuestionIndex, 1);
        const response = await client.chat.completions.create({
            model: questionMaker.model,
            messages: [
                { 
                    role: "system", 
                    content:`You are a helpful assistant that generates questions and answers. 
                            Always respond with valid JSON only, no markdown formatting or code blocks.
                            You are an expert at curating questions which are relevant to the topic and context.
                            The questions you make have specific answers and specific negative answers instead of being vague and subjective.`
                },
                {
                    role: "user",
                    content: `Generate a **list** of **${batchSize}** question and answers for the topic: ${topic}
                    . The questions should be based on the following context: ${data[currentQuestionIndex]} 
                    Description of the questions should be like: ${description},
                    
                    Respond with a JSON object matching this schema:
                    {
                        "questions": [
                            {
                            "question": "string",
                            "answers": ["string"],
                            "negative_answers": ["string"]
                            }
                        ]
                    }`,
                },
            ],
            response_format: { type: "json_schema", json_schema: zodTextFormat(Question, "question") },
        });
        const content = response.choices[0]?.message.content ?? "{}";
        const parsed = JSON.parse(content);
        const validated_questions = Question.parse(parsed);
        validated.push(...validated_questions.questions.map(question => ({
            question: question.question,
            answers: question.answers,
            negative_answers: question.negative_answers
        })));
        i++;
        console.log("validated.length: ", validated.length);
        console.log("validated: ", validated);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        fs.writeFileSync(outputPath, JSON.stringify(validated, null, 2));
    }
    fs.writeFileSync(outputPath, JSON.stringify(validated, null, 2));
    console.log(`\nSaved ${validated.length} questions to ${outputPath}`);
}


async function parsePDF(pdf_docs: string[]) {
    const data: string[] = [];
    await Promise.all(pdf_docs.map(async (doc) => {
        const parser = new PDFParse({url: DOCS_PATH + "/" + doc});
        const pdf_text = await parser.getText();
        data.push(pdf_text.text);
    }));
    return data;
}

async function parseText(text_docs: string[]) {
    const data: string[] = [];
    await Promise.all(text_docs.map(async (doc) => {
        const text = await Bun.file(DOCS_PATH + "/" + doc).text();
        data.push(text);
    }));
    return data;
}

async function readDocs(description: string) {
    const docs = fs.readdirSync(DOCS_PATH);
    const text_docs = docs.filter(doc => doc.endsWith(".txt") );
    const pdf_docs = docs.filter(doc => doc.endsWith(".pdf"));

    const pdf_data = await parsePDF(pdf_docs);
    const text_data = await parseText(text_docs);

    // we need to return an array of strings and batch them, each batch should make 1 question
    // taking  the limit of 30,000 tokens or around 1,280,000 characters.

    const batch_size = 1280000;
    // const batch_size = 100;
    const new_pdf_data: string[] = [];
    pdf_data.forEach((batch) => {
        if (batch.length > batch_size) {
            const slices = Math.floor(batch.length / batch_size);
            for (let i = 0; i < slices; i++) {
                description.split(" ").forEach(word => {
                    batch.slice(i*batch_size, (i+1)*batch_size).includes(word) ? new_pdf_data.push(batch.slice(i*batch_size, (i+1)*batch_size)) : null;
                })
            }
        } else {
            description.split(" ").forEach(word => {
                batch.includes(word) ? new_pdf_data.push(batch) : null;
            })
        }
    });
    const new_text_data: string[] = [];
    text_data.forEach((batch) => {
        if (batch.length > batch_size) {
            const slices = Math.floor(batch.length / batch_size);
            for (let i = 0; i < slices; i++) {
                description.split(" ").forEach(word => {
                    batch.slice(i*batch_size, (i+1)*batch_size).includes(word) ? new_text_data.push(batch.slice(i*batch_size, (i+1)*batch_size)) : null;
                })
            }
        } else {
            description.split(" ").forEach(word => {
                batch.includes(word) ? new_text_data.push(batch) : null;
            })
        }
    });
    if (new_pdf_data.length === 0 && new_text_data.length === 0){
        return [...pdf_data, ...text_data];
    }
    return [...new_pdf_data, ...new_text_data];
}

