import React, { useState } from 'react'
import { Box, render, Text, useInput } from 'ink';

export const QuestionsSelector = ({questionPath, setPath}: {questionPath: string[], setPath: (path: string) => void}) => {
    const [selected, setSelected] = useState<number>(0);
    const [changeRender, setChangeRender] = useState<boolean>(false);
    useInput((input, key) => {
        if (key.upArrow) {
            setSelected(Math.max(0, selected - 1));
        }
        if (key.downArrow) {
            setSelected(Math.min(questionPath.length - 1, selected + 1));
        }
        if (key.return && questionPath[selected]) {
            setPath(questionPath[selected]);
            setChangeRender(true);
        }
    })

    if (questionPath.length === 0) {
        return (
            <Box>
                <Text>No question sets found</Text>
            </Box>
        )
    }
    return (
        <Box flexDirection="column" width='20%'>
            {questionPath.map((path, index) => (
                <Box key={index} backgroundColor={selected === index ? "cyan" : "transparent"}>
                    <Text color={selected === index ? "white" : "cyan"}>{path}</Text>
                </Box>
            ))}
        </Box>
    )
}