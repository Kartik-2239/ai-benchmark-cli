import type { currentStatus } from "./types"
import run from "./components/tables"
import q from "./questions/test.json" assert { type: "json" }
import { models } from "./constants"
import { ModelManager } from "./ModelManager"

async function runTest(){
    const listStatus: currentStatus[] = models.map(model => ({
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
        const m = new ModelManager(model, q)
        // const status = await m.runTest()
        for await (const status of m.runTest()) {
            listStatus[i] = { ...status, pending: false }
            run(listStatus)
        }
        // listStatus[i] = { ...status, pending: false }
        // run(listStatus)
    }
}
runTest()