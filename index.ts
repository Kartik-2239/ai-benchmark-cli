

export type currentStatus = {
    id: number
    model_name: string
    progress: number
    accuracy: number
    input_tokens: number,
    output_tokens:number,
    cost: number,
    time_taken: number
}

import run from "./components/tables"
import q from "./questions/test.json" assert { type: "json" }
import { models } from "./constants"
import { ModelManager } from "./ModelManager"

async function runTest(){
    const listStatus:currentStatus[] = []
    for (const model of models){
        const m = new ModelManager(model,q)
        const status = await m.runTest()
        listStatus.push(status)
        // run(listStatus)
    }
}
// runTest()