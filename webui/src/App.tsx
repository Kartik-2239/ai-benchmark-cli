import "./index.css";
import IndexLineChart from "./charts/chart";
import { TableProvider } from "./tables/table.tsx";
import { useEffect, useState } from "react";

export type row = {
  id: number;
  model_name: string;
  accuracy: number;
  cost: number;
  input_tokens: number;
  output_tokens: number;
  time_taken: number;
};

export function App() {
  const [cacheFile, setCacheFile] = useState("");
  const [cacheFiles, setCacheFiles] = useState<string[]>([]);
  const [cached, setCached] = useState<any>(null);
  const [data, setData] = useState<row[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCacheFiles = async () => {
      try {
        const response = await fetch("/api/cache");
        const result = await response.json();
        if (result.files) {
          setCacheFiles(result.files);
        }
      } catch (err) {
        console.error("Failed to fetch cache files:", err);
      }
    };
    fetchCacheFiles();
  }, []);

  const fetchCache = async () => {
    if (!cacheFile) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/cache/${cacheFile}`);
      if (!response.ok) {
        throw new Error(`File not found: ${cacheFile}`);
      }
      const data = await response.json();
      setCached(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch cache file");
      setCached(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!cached?.entries) {
      setData([]);
      return;
    }
    
    const cacheEntries = cached.entries;
    const modelGroups = new Map<string, any[]>();
    
    Object.entries(cacheEntries).forEach(([key, entry]) => {
      const modelName = key.split("::")[0] || "unknown";
      if (!modelGroups.has(modelName)) {
        modelGroups.set(modelName, []);
      }
      modelGroups.get(modelName)!.push(entry);
    });
    
    const processedData: row[] = Array.from(modelGroups.entries()).map(([modelName, entries], index) => {
      const totalEntries = entries.length;
      return {
        id: index,
        model_name: modelName,
        accuracy: entries.reduce((sum, e) => sum + (e.evaluationScore || 0), 0) / totalEntries,
        cost: entries.reduce((sum, e) => sum + (e.cost || 0), 0),
        input_tokens: entries.reduce((sum, e) => sum + (e.input_tokens || 0), 0),
        output_tokens: entries.reduce((sum, e) => sum + (e.output_tokens || 0), 0),
        time_taken: entries.reduce((sum, e) => sum + (e.time_taken || 0), 0),
      };
    });
    setData(processedData);
  }, [cached]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCache();
  };

  const handleReset = () => {
    setCached(null);
    setCacheFile("");
    setData([]);
    setError(null);
  };
  
  return (
    <div className="flex flex-col items-center pt-10 h-screen bg-card">
      <div className="w-9/10 border-2 border-gray-400 rounded-xl flex flex-col px-5 sm:px-10 pt-5 gap-5">
        <h3 className="text-2xl font-bold text-gray-700">Benchmark CLI</h3>
        {cached ? (
          <>
            <div className="flex items-center justify-between">
              <p className="text-gray-500">Question Set: {cached.questionSetId || cacheFile}</p>
              <button 
                onClick={handleReset}
                className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded text-gray-700"
              >
                Load Different File
              </button>
            </div>
            <div className="w-full flex-1 flex items-center justify-center">
              <IndexLineChart data={data} />
            </div>
            <TableProvider models={data} />
          </>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-8">
            <label className="text-gray-600 font-medium">Select or enter a cache file:</label>
            <div className="flex flex-row gap-2">
              <select 
                value={cacheFile}
                onChange={(e) => {
                  setCacheFile(e.target.value)
                }}
                className="w-full p-2 border border-gray-300 rounded text-black"
              >
                <option value="">-- Select a file --</option>
                {cacheFiles.map(file => (
                  <option key={file} value={file}>{file}</option>
                ))}
              </select>
              <div className="flex gap-2">
                <button 
                  type="submit" 
                  disabled={!cacheFile || loading}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {loading ? "Loading..." : "Load"}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default App;
