import React from 'react'
import { Box, render, Text } from 'ink';
import type { currentStatus } from '../types';
import { QUESTION_SET_PATH } from '../constants/index';
import fs from 'fs';

const Col = ({ children, width, align, color }: { children: React.ReactNode; width?: number; align?: 'flex-start' | 'center' | 'flex-end'; color?: 'cyan' | 'green' | 'red' | 'yellow' | 'blue' | 'magenta' | 'white' | 'black' | 'gray' | 'grey' | 'purple' | 'pink' | 'brown' | 'orange' | 'teal' | 'lime' | 'indigo' | 'violet' | 'maroon' | 'navy' | 'olive' | 'coral' | 'salmon' | 'turquoise' | 'gold' | 'silver' | 'bronze' | 'indigo' | 'purple' | 'pink' | 'brown' | 'orange' | 'teal' | 'lime' | 'indigo' | 'violet' | 'maroon' | 'navy' | 'olive' | 'coral' | 'salmon' | 'turquoise' | 'gold' | 'silver' | 'bronze' }) => (
  <Box width={width} flexGrow={width ? 0 : 1} paddingRight={2} justifyContent={align ? align : 'center'}>
    <Text wrap="truncate-end" color={color ? color : 'white'}>{children}</Text>
  </Box>
);

export const TableProvider = ({ models }: { models: currentStatus[] }) => {
  const q = JSON.parse(fs.readFileSync(QUESTION_SET_PATH, "utf8"))
  return (
    <Box flexDirection="column" padding={1}>
      <Box width={90} paddingX={1} marginBottom={1} borderStyle="round" flexDirection="column" gap={0} borderColor="cyan">
        <Text color="cyan">BenchMark CLI</Text>
        <Text color="yellow">Progress: {models.filter(m=>!m.pending).length}/{models.length}</Text>
      </Box>
      <Box>
        <Col align="flex-start" width={20}>Model</Col>
        <Col width={10}>Progress</Col>
        <Col width={10}>Accuracy</Col>
        <Col width={12}>Cost</Col>
        <Col width={14}>Input Tokens</Col>
        <Col width={14}>Out Tokens</Col>
        <Col width={10}>Time</Col>
      </Box>
      <Text dimColor>{'─'.repeat(90)}</Text>
      {models.map((m) => (
        <Box key={m.id}>
          <Col align="flex-start" width={20} color={m.pending ? 'gray' : 'white'}>{m.model_name}</Col>
          {m.pending ? (
            <>
              <Col width={10} color="gray">—</Col>
              <Col width={10} color="gray">—</Col>
              <Col width={12} color="gray">—</Col>
              <Col width={14} color="gray">—</Col>
              <Col width={14} color="gray">—</Col>
              <Col width={10} color="gray">—</Col>
            </>
          ) : (
            <>
              <Col width={10}>{Math.round(m.progress*q.length/100)}/{q.length}</Col>
              <Col width={10}>{m.accuracy.toFixed(1)}%</Col>
              <Col color="cyan" width={12}>${m.cost.toFixed(4)}</Col>
              <Col width={14}>{m.input_tokens.toLocaleString()}</Col>
              <Col width={14}>{m.output_tokens.toLocaleString()}</Col>
              <Col width={10}>{(m.time_taken/1000).toFixed(1)}s</Col>
            </>
          )}
        </Box>
      ))}
      <Text dimColor>{'─'.repeat(90)}</Text>
      <Box>
        <Box width={20}></Box>
        <Box width={10}></Box>
        <Box width={10}></Box>
        <Col color="cyan" width={12}>${models.filter(m=>!m.pending).reduce((va,m)=>va+m.cost,0).toFixed(4)}</Col>
        <Col width={14}>{models.filter(m=>!m.pending).reduce((va,m)=>va+m.input_tokens,0).toLocaleString()}</Col>
        <Col width={14}>{models.filter(m=>!m.pending).reduce((va,m)=>va+m.output_tokens,0).toLocaleString()}</Col>
        <Col width={10}>{(models.filter(m=>!m.pending).reduce((va,m)=>va+m.time_taken,0)/1000).toFixed(1)}s</Col>
      </Box>
    </Box>
  );
};



function run(models: currentStatus[]){
  render(<TableProvider models={models}/>)
}
export default run;

// render(<TableProvider models={fakeData}/>)
