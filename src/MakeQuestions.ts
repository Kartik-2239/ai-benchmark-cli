import { BASE_URL, QUESTION_SET_PATH, questionMaker } from "./constants/index.ts"
import { OpenAI } from "openai/client.js";
import { z } from "zod";
import fs from 'fs';
import { dirname } from 'path';
import { DOCS_PATH } from "./constants/index.ts";
import { PDFParse } from 'pdf-parse';



export async function MakeQuestions(topic?: string, numberOfQuestions?: number, description?: string){
    if (fs.existsSync(QUESTION_SET_PATH)){
        console.log("Question set already exists");
        return;
    }
    if (!numberOfQuestions){
        numberOfQuestions = 20;
    }
    if (!QUESTION_SET_PATH) {
        console.error("QUESTION_SET_PATH is not set");
        process.exit(1);
    }

    const client = new OpenAI({
        baseURL: BASE_URL,
        apiKey: process.env.NEBIUS_API_KEY //|| process.env.OPENROUTER_API_KEY,
    });

    const Question = z.object({
        questions: z.array(z.object({
            question: z.string(),
            answers: z.array(z.string().describe("The correct answer to the question.")),
            negative_answers: z.array(z.string().describe("A negative answer to the question.")),
        }))
    });
    const data = await readDocs();

    // console.log(`Generating ${numberOfQuestions} questions for the topic: ${topic}`);
    // console.log(`Using model: ${questionMaker.model}`);
    const response = await client.chat.completions.create({
    model: questionMaker.model,
    messages: [
        { 
        role: "system", 
        content: "You are a helpful assistant that generates questions and answers. Always respond with valid JSON only, no markdown formatting or code blocks." 
        },
        {
        role: "user",
        content: `Generate a list of ${numberOfQuestions} questions and answers for the topic: ${topic}
        . The questions should be based on the following context: ${data} 
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
    response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message.content ?? "{}";
    const parsed = JSON.parse(content);
    const validated = Question.parse(parsed);

    // console.log(validated);

    const outputPath = QUESTION_SET_PATH;
    const outputDir = dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    fs.writeFileSync(outputPath, JSON.stringify(validated.questions, null, 2));
    console.log(`\nSaved ${validated.questions.length} questions to ${outputPath}`);
}


async function parsePDF(pdf_docs: string[]) {
    var data = "";
    await Promise.all(pdf_docs.map(async (doc) => {
        const parser = new PDFParse({url: DOCS_PATH + "/" + doc});
        const pdf_text = await parser.getText();
        data += pdf_text.text;
    }));
    return data;
}

async function parseText(text_docs: string[]) {
    var data = "";
    await Promise.all(text_docs.map(async (doc) => {
        const text = await Bun.file(DOCS_PATH + "/" + doc).text();
        data += text;
    }));
    return data;
}

async function readDocs() {
    const docs = fs.readdirSync(DOCS_PATH);
    const text_docs = docs.filter(doc => doc.endsWith(".txt") );
    const pdf_docs = docs.filter(doc => doc.endsWith(".pdf"));

    const pdf_data = await parsePDF(pdf_docs);
    const text_data = await parseText(text_docs);
    // console.log("pdf_data.length", pdf_data.length);
    // console.log("text_data.length", text_data.length);
    return pdf_data + "\n\n\n" + text_data;
}

// const data = await readDocs();

