import { BASE_URL, QUESTION_SET_PATH, questionMaker, TOPIC } from "./constants/index.ts"
import { OpenAI } from "openai/client.js";
import { z } from "zod";
import fs from 'fs';
import { dirname } from 'path';


export async function MakeQuestions(topic?: string, numberOfQuestions?: number){
    if (fs.existsSync(QUESTION_SET_PATH)){
        console.log("Question set already exists");
        return;
    }
    if (!topic){
        topic = TOPIC;
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
        apiKey: process.env.NEBIUS_API_KEY || process.env.OPENAI_API_KEY,
    });

    const Question = z.object({
        questions: z.array(z.object({
            question: z.string(),
            answers: z.array(z.string().describe("The correct answer to the question.")),
            negative_answers: z.array(z.string().describe("A negative answer to the question.")),
        }))
    });


    const response = await client.chat.completions.create({
    model: questionMaker.model,
    messages: [
        { 
        role: "system", 
        content: "You are a helpful assistant that generates questions and answers. Always respond with valid JSON only, no markdown formatting or code blocks." 
        },
        {
        role: "user",
        content: `Generate a list of ${numberOfQuestions} questions and answers for the topic: ${topic}. 

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