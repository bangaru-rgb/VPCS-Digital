// src/agent/useAgent.js
import { useState, useCallback } from 'react';
import { toolDefinitions, runTool } from './agentTools';

const EDGE_FUNCTION_URL = 'https://dgalxobdjjvxbrogghhk.supabase.co/functions/v1/VPCS-AI-smart-endpoint';
const MODEL = 'claude-sonnet-4-20250514';

const SYSTEM_PROMPT = `You are a helpful business assistant for VPCS (Vishnu Prasad Chemicals and Solvents).
You help users query their business data including cash flow, materials, invoices, shipments, transactions, parties, vendors, tankers, and more.
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

      while (true) {
        const response = await fetch(EDGE_FUNCTION_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json',  

             'Authorization': `Bearer ${process.env.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnYWx4b2Jkamp2eGJyb2dnaGhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5Njk3MDEsImV4cCI6MjA3NDU0NTcwMX0.JKr4k4wCUqxWxI6WRwJGj_65odBG8sBRxYchPILWjVs}`,
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
  }, [messages]);

  const clearMessages = useCallback(() => setMessages([]), []);

  return { messages, loading, sendMessage, clearMessages };
}