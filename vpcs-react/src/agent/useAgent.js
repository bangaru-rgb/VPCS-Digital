// src/agent/useAgent.js
import { useState, useCallback } from 'react';
import { toolDefinitions, runTool } from './agentTools';
import { buildSystemPrompt } from './prompts';

const EDGE_FUNCTION_URL = 'https://dgalxobdjjvxbrogghhk.supabase.co/functions/v1/VPCS-AI-smart-endpoint';
const MODEL = 'claude-sonnet-4-20250514';

export function useAgent(currentModule = 'default') {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = useCallback(async (userText) => {
    const today = new Date().toISOString().slice(0, 7);

    const SYSTEM_PROMPT = buildSystemPrompt(today, currentModule);
    const newUserMsg = { role: 'user', content: userText };
    const updatedMessages = [...messages, newUserMsg];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      let conversationMessages = updatedMessages;

      while (true) {
        const response = await fetch(EDGE_FUNCTION_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            provider: 'claude',
            payload: {
              model: MODEL,
              max_tokens: 1024,
              system: SYSTEM_PROMPT,
              tools: toolDefinitions,
              messages: conversationMessages,
            },
          }),
        });

        if (!response.ok) throw new Error(`API error: ${response.status}`);

        const data = await response.json();

        if (data.stop_reason === 'end_turn') {
          const assistantText = data.content
            .filter(b => b.type === 'text')
            .map(b => b.text)
            .join('');
          setMessages(prev => [...prev, { role: 'assistant', content: assistantText }]);
          break;
        }

        if (data.stop_reason === 'tool_use') {
          conversationMessages = [
            ...conversationMessages,
            { role: 'assistant', content: data.content },
          ];

          const toolResults = [];
          for (const block of data.content) {
            if (block.type === 'tool_use') {
              const result = await runTool(block.name, block.input);
              toolResults.push({
                type: 'tool_result',
                tool_use_id: block.id,
                content: JSON.stringify(result),
              });
            }
          }

          conversationMessages = [
            ...conversationMessages,
            { role: 'user', content: toolResults },
          ];
        }
      }
    } catch (err) {
      console.error('Agent error:', err);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: `Sorry, something went wrong: ${err.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  }, [messages, currentModule]);

  const clearMessages = useCallback(() => setMessages([]), []);

  return { messages, loading, sendMessage, clearMessages };
}