import type { row } from '../App';

interface TableProviderProps {
  models: row[];
  questionCount?: number;
}

export const TableProvider = ({ models, questionCount = 0 }: TableProviderProps) => {
  const completedModels = models;
  const totalCost = completedModels.reduce((sum, m) => sum + m.cost, 0);
  const totalInputTokens = completedModels.reduce((sum, m) => sum + m.input_tokens, 0);
  const totalOutputTokens = completedModels.reduce((sum, m) => sum + m.output_tokens, 0);
  const totalTime = completedModels.reduce((sum, m) => sum + m.time_taken, 0);

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-full">
        {/* Table */}
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-600">
              <th className="text-left p-2 text-black" style={{ width: '20%' }}>Model</th>
              <th className="text-center p-2 text-black" style={{ width: '10%' }}>Accuracy</th>
              <th className="text-center p-2 text-black" style={{ width: '12%' }}>Cost</th>
              <th className="text-center p-2 text-black" style={{ width: '14%' }}>Input Tokens</th>
              <th className="text-center p-2 text-black" style={{ width: '14%' }}>Out Tokens</th>
              <th className="text-center p-2 text-black" style={{ width: '10%' }}>Time</th>
            </tr>
          </thead>
          <tbody>
            {models.map((m) => (
              <tr key={m.id} className="border-b border-gray-700">
                <td className="p-2 text-black">{m.model_name}</td>
                <td className="text-center p-2 text-black">{m.accuracy.toFixed(1)}%</td>
                <td className="text-center p-2 text-black">${m.cost.toFixed(4)}</td>
                <td className="text-center p-2 text-black">{m.input_tokens.toLocaleString()}</td>
                <td className="text-center p-2 text-black">{m.output_tokens.toLocaleString()}</td>
                <td className="text-center p-2 text-black">{(m.time_taken / 1000).toFixed(1)}s</td>
              </tr>
            ))}
          </tbody>
          {/* Footer with totals */}
          <tfoot>
            <tr className="border-t-2 border-gray-600">
              <td colSpan={2} className="p-2"></td>
              <td className="text-center p-2 text-black font-bold">
                ${totalCost.toFixed(4)}
              </td>
              <td className="text-center p-2 text-black font-bold">
                {totalInputTokens.toLocaleString()}
              </td>
              <td className="text-center p-2 text-black font-bold">
                {totalOutputTokens.toLocaleString()}
              </td>
              <td className="text-center p-2 text-black font-bold">
                {(totalTime / 1000).toFixed(1)}s
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};