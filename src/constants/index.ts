import type { model } from "../types"

export const QUESTION_SET_PATH = "./questions/one_piece.json";
export const BASE_URL = "https://api.tokenfactory.nebius.com/v1/";
// export const BASE_URL = "https://openrouter.ai/api/v1";
export const DOCS_PATH = "./docs";


export const evaluator : model = {
    id: 1,
    name: "Kimi-K2-Instruct",
    model: "moonshotai/Kimi-K2-Instruct",
    reasoning: true
}

// choose a model with high context window
export const questionMaker:model = {
    id: 1,
    name: "Kimi-K2-Thinking",
    model: "moonshotai/Kimi-K2-Thinking",
    reasoning: true
}


export var models : model[] = [
    {
        id: 1,
        name: "gpt-oss-120b",
        model: "openai/gpt-oss-120b",
        reasoning: true
    },
    {
        id: 2,
        name: "Kimi-K2-Instruct",
        model: "moonshotai/Kimi-K2-Instruct",
        reasoning: true
    },
    {
        id: 3,
        name: "Kimi-K2-Thinking",
        model: "moonshotai/Kimi-K2-Thinking",
        reasoning: true
    },
    {
        id: 4,
        name: "Hermes-4-405B",
        model: "NousResearch/Hermes-4-405B",
        reasoning: false
    },
    {
        id: 5,
        name: "GLM-4.5",
        model: "zai-org/GLM-4.5",
        reasoning: true
    },
    {
        id: 6,
        name: "DeepSeek-R1-0528",
        model: "deepseek-ai/DeepSeek-R1-0528",
        reasoning: true,
    },
    {
        id: 7,
        name: "Qwen3-235B-A22B-Thinking-2507",
        model: "Qwen/Qwen3-235B-A22B-Thinking-2507",
        reasoning: true,
    },
    {
        id: 8,
        name: "DeepSeek-V3-0324",
        model: "deepseek-ai/DeepSeek-V3-0324",
        reasoning: true,
    },
    {
        id: 9,
        name: "GLM-4.5-Air",
        model: "zai-org/GLM-4.5-Air",
        reasoning: true,
    },
]

export const pricings = [
  {
    name: "gpt-oss-120b",
    flavor: "base",
    inputPricePerM: 0.15,
    outputPricePerM: 0.60
  },
  {
    name: "gpt-oss-20b",
    flavor: "base",
    inputPricePerM: 0.05,
    outputPricePerM: 0.20
  },
  {
    name: "Kimi-K2-Instruct",
    flavor: "base",
    inputPricePerM: 0.50,
    outputPricePerM: 2.40
  },
  {
    name: "Kimi-K2-Thinking",
    flavor: "base",
    inputPricePerM: 0.60,
    outputPricePerM: 2.50
  },
  {
    name: "Qwen/Qwen3-Coder-480B-A35B-Instruct",
    flavor: "base",
    inputPricePerM: 0.40,
    outputPricePerM: 1.80
  },
  {
    name: "Qwen3-235B-A22B-Thinking-2507",
    flavor: "base",
    inputPricePerM: 0.20,
    outputPricePerM: 0.80
  },
  {
    name: "Qwen3-235B-A22B-Instruct-2507",
    flavor: "base",
    inputPricePerM: 0.20,
    outputPricePerM: 0.60
  },
  {
    name: "Qwen3-30B-A3B-Thinking-2507",
    flavor: "base",
    inputPricePerM: 0.10,
    outputPricePerM: 0.30
  },
  {
    name: "Qwen3-30B-A3B-Instruct-2507",
    flavor: "base",
    inputPricePerM: 0.10,
    outputPricePerM: 0.30
  },
  {
    name: "Qwen3-Coder-30B-A3B-Instruct",
    flavor: "base",
    inputPricePerM: 0.10,
    outputPricePerM: 0.30
  },
  {
    name: "Qwen3-30B-A3B",
    flavor: "base",
    inputPricePerM: 0.10,
    outputPricePerM: 0.30
  },
  {
    name: "Qwen3-32B",
    flavor: "fast",
    inputPricePerM: 0.20,
    outputPricePerM: 0.60
  },
  {
    name: "Qwen3-32B",
    flavor: "base",
    inputPricePerM: 0.10,
    outputPricePerM: 0.30
  },
  {
    name: "Qwen3-14B",
    flavor: "base",
    inputPricePerM: 0.08,
    outputPricePerM: 0.24
  },
  {
    name: "Qwen2.5-Coder-7B",
    flavor: "base",
    inputPricePerM: 0.03,
    outputPricePerM: 0.09
  },
  {
    name: "Qwen2.5-72B-Instruct",
    flavor: "base",
    inputPricePerM: 0.13,
    outputPricePerM: 0.40
  },
  {
    name: "QwQ-32B",
    flavor: "fast",
    inputPricePerM: 0.50,
    outputPricePerM: 1.50
  },
  {
    name: "QwQ-32B",
    flavor: "base",
    inputPricePerM: 0.15,
    outputPricePerM: 0.45
  },
  {
    name: "GLM-4.5",
    flavor: "base",
    inputPricePerM: 0.60,
    outputPricePerM: 2.20
  },
  {
    name: "GLM-4.5-Air",
    flavor: "base",
    inputPricePerM: 0.20,
    outputPricePerM: 1.20
  },
  {
    name: "DeepSeek-R1-0528",
    flavor: "fast",
    inputPricePerM: 2.00,
    outputPricePerM: 6.00
  },
  {
    name: "DeepSeek-R1-0528",
    flavor: "base",
    inputPricePerM: 0.80,
    outputPricePerM: 2.40
  },
  {
    name: "DeepSeek-V3-0324",
    flavor: "fast",
    inputPricePerM: 0.75,
    outputPricePerM: 2.25
  },
  {
    name: "DeepSeek-V3-0324",
    flavor: "base",
    inputPricePerM: 0.50,
    outputPricePerM: 1.50
  },
  {
    name: "DeepSeek-V3",
    flavor: "base",
    inputPricePerM: 0.50,
    outputPricePerM: 1.50
  },
  {
    name: "Meta/Llama-3.3-70B-Instruct",
    flavor: "fast",
    inputPricePerM: 0.25,
    outputPricePerM: 0.75
  },
  {
    name: "Meta/Llama-3.3-70B-Instruct",
    flavor: "base",
    inputPricePerM: 0.13,
    outputPricePerM: 0.40
  },
  {
    name: "Meta/Llama-3.1-8B-Instruct",
    flavor: "fast",
    inputPricePerM: 0.03,
    outputPricePerM: 0.09
  },
  {
    name: "Meta/Llama-3.1-8B-Instruct",
    flavor: "base",
    inputPricePerM: 0.02,
    outputPricePerM: 0.06
  },
  {
    name: "Meta/Llama-3.1-405B-Instruct",
    flavor: "base",
    inputPricePerM: 1.00,
    outputPricePerM: 3.00
  },
  {
    name: "Llama-3_1-Nemotron-Ultra-253B-v1",
    flavor: "base",
    inputPricePerM: 0.60,
    outputPricePerM: 1.80
  },
  {
    name: "Gemma-2-2b-it",
    flavor: "base",
    inputPricePerM: 0.02,
    outputPricePerM: 0.06
  },
  {
    name: "Gemma-2-9b-it",
    flavor: "base",
    inputPricePerM: 0.03,
    outputPricePerM: 0.09
  },
  {
    name: "Devstral-Small-2505",
    flavor: "base",
    inputPricePerM: 0.08,
    outputPricePerM: 0.24
  },
  {
    name: "Hermes-4-405B",
    flavor: "base",
    inputPricePerM: 1.00,
    outputPricePerM: 3.00
  },
  {
    name: "Hermes-4-70B",
    flavor: "base",
    inputPricePerM: 0.13,
    outputPricePerM: 0.40
  },
  {
    name: "Hermes-3-Llama-3.1-405B",
    flavor: "base",
    inputPricePerM: 1.00,
    outputPricePerM: 3.00
  }
];
