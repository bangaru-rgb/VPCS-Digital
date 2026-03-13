// src/agent/useAgent.js
import { useState, useCallback } from 'react';
import { toolDefinitions, runTool } from './agentTools';

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-20250514';

const SYSTEM_PROMPT = `You are a helpful business assistant for VPCS (Vishnu Prasad Chemicals and Solvents).
You help users query their business data including cash flow, materials, and financial summaries.
Always use the available tools to fetch real data before answering.
Format currency values in Indian Rupees (₹) with proper formatting.
Keep responses concise and business-focused.`;

export function useAgent() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = useCallback(async (userText) => {
    const newUserMsg = { role: 'user', content: userText };
    const updatedMessages = [...messages, newUserMsg];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      let conversationMessages = updatedMessages;

      // Agent loop - keeps running until Claude stops using tools
      while (true) {
        const response = await fetch(CLAUDE_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.REACT_APP_ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: MODEL,
            max_tokens: 1024,
            system: SYSTEM_PROMPT,
            tools: toolDefinitions,
            messages: conversationMessages,
          }),
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();

        // Claude is done - just a text response
        if (data.stop_reason === 'end_turn') {
          const assistantText = data.content
            .filter(b => b.type === 'text')
            .map(b => b.text)
            .join('');

          const assistantMsg = { role: 'assistant', content: assistantText };
          setMessages(prev => [...prev, assistantMsg]);
          break;
        }

        // Claude wants to use tools
        if (data.stop_reason === 'tool_use') {
          // Add Claude's response (with tool_use blocks) to conversation
          conversationMessages = [
            ...conversationMessages,
            { role: 'assistant', content: data.content },
          ];

          // Run all requested tools
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

          // Add tool results back to conversation
          conversationMessages = [
            ...conversationMessages,
            { role: 'user', content: toolResults },
          ];

          // Loop continues - Claude will process results and respond
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
  }, [messages]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return { messages, loading, sendMessage, clearMessages };
}
