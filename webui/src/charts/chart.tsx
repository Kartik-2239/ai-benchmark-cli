import type { row } from '@/App';
import { Bar, BarChart, CartesianGrid, Line, LineChart, Legend, Tooltip, XAxis, YAxis, Label } from 'recharts';



export default function IndexLineChart({data}: {data: row[]}) {
  return (
    <div className='w-full h-full flex items-center justify-center'>
        <BarChart style={{ width: '100%', aspectRatio: 1.618,height: '100%', maxWidth: 800 }} responsive data={data} margin={{ bottom: 60 }}>
        <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
        <XAxis dataKey="model_name" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
        <YAxis width="auto" label={{ value: 'Accuracy', angle: -90, position: 'insideLeft' }} />
        <Bar type="monotone" dataKey="accuracy" barSize={30} fill="#8884d8" label={{ position: 'top', formatter: (value) => `${(value as number)?.toFixed(1)}%`}} />
        <Bar type="monotone" dataKey="cost" barSize={0} fill="#8884d8" />
        <Tooltip formatter={(value) => `$${(value as number)?.toFixed(2)}`} contentStyle={{ backgroundColor: '#222', color: '#fff' }} />
        </BarChart>
    </div>
    
  );
}