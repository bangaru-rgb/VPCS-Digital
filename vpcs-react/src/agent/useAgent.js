// src/agent/useAgent.js
import { useState, useCallback } from 'react';
import { toolDefinitions, runTool } from './agentTools';

const EDGE_FUNCTION_URL = 'https://dgalxobdjjvxbrogghhk.supabase.co/functions/v1/VPCS-AI-smart-endpoint';
const MODEL = 'claude-sonnet-4-20250514';

export function useAgent() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = useCallback(async (userText) => {
    const today = new Date().toISOString().slice(0, 7);

    const SYSTEM_PROMPT = `You are a helpful business assistant for VPCS (Vishnu Prasad Chemicals and Solvents).
Today's date is ${today}. Current month is ${today}.
You help users query their business data including cash flow, materials, invoices, shipments, transactions, parties, vendors, tankers, and more.
Always use the available tools to fetch real data before answering.
Format currency values in Indian Rupees (₹) with proper formatting.
Keep responses concise and business-focused.

If the user asks for specific data (e.g. inflows) but only the opposite exists (e.g. outflows), do NOT silently show the opposite. Instead clearly say the requested data was not found and ask the user if they want to see the alternative.
If the user provides a vendor name (or partial name like "balaji", "godavari", "genetique", "vishakha"), a material name (etp, stripper), and a number, treat it as a calculate_material_cost request. Map partial/lowercase names to the correct vendor key (Balaji, Godavari, Genetique, Vishakha) and material key (ETP, Stripper, Other Material).

For material cost calculations, respond ONLY in this exact format:
{material} weight: {weight} kg
{toHetero label}: {amount}
{toVendor label}: {amount}
Nothing else unless the user asks for breakdown details.

IMPORTANT: If the user does not specify a time period or month, call get_cashflow or get_cashflow_summary without passing a month parameter to get all-time data. If the user says "this month" or "current month", use ${today} as the month parameter.
RESPONSE STYLE: Give direct, short answers. Only answer what was asked. Do not volunteer extra details like party breakdowns or transaction counts unless the user asks. End with one short follow-up question offering more detail if needed.`;

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
  }, [messages]);

  const clearMessages = useCallback(() => setMessages([]), []);

  return { messages, loading, sendMessage, clearMessages };
}