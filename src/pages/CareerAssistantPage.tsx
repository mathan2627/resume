import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useQuery, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  Bot,
  Send,
  Sparkles,
  User,
  ShieldCheck,
  Briefcase,
  Code2,
  HelpCircle,
} from "lucide-react";

export const CareerAssistantPage: React.FC = () => {
  const { token, user } = useAuth();

  const profileData = useQuery(api.profiles.getProfile, token ? { token } : "skip");
  const evidenceSummary = useQuery(api.skills.getUserEvidenceSummary, token ? { token } : "skip");
  const careerAssistantAction = useAction(api.ai.careerAssistantChat);

  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([
    {
      role: "assistant",
      content: `Hello ${user?.name || "there"}! I'm your ProofPath Career Assistant. I have context on your target role (${profileData?.profile?.preferredRole || "Software Engineering"}) and your verified skill proofs. How can I assist you with your resume, internship matches, or technical interview prep today?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const quickPrompts = [
    "How can I turn my resume claims into verified GitHub evidence?",
    "What technical gaps should I fix for Frontend Engineering roles?",
    "How do I prepare for technical interviews on React hook closures?",
    "Review my project bullet points for ATS impact.",
  ];

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || loading) return;

    const newMessages = [...messages, { role: "user" as const, content: textToSend.trim() }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const profileSummary = `Student Name: ${user?.name || "Candidate"}\nTarget Role: ${profileData?.profile?.preferredRole || "Software Engineer"}\nCollege: ${profileData?.profile?.college || "University"}\nVerified Skills: ${evidenceSummary?.evidenceList.map((e) => `${e.skillName} (${e.status}, ${e.evidenceScore}%)`).join(", ") || "None yet"}`;

      const reply = await careerAssistantAction({
        messages: newMessages,
        userProfileSummary: profileSummary,
      });

      setMessages([...newMessages, { role: "assistant" as const, content: reply }]);
    } catch (e: any) {
      setMessages([
        ...newMessages,
        {
          role: "assistant" as const,
          content: "I encountered a temporary service error. Please try asking your question again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
      {/* Top Banner */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-950 border border-cyan-800/80 flex items-center justify-center text-cyan-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white flex items-center gap-2">
              <span>ProofPath AI Career Assistant</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                Ground Truth Context
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Context-aware career advice grounded in your actual Skill Proof evidence.
            </p>
          </div>
        </div>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0">
        <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Suggested:</span>
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p)}
            className="px-3 py-1.5 rounded-lg text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 whitespace-nowrap transition-colors"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 overflow-y-auto space-y-4 shadow-xl">
        {messages.map((m, idx) => {
          const isUser = m.role === "user";
          return (
            <div
              key={idx}
              className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? "bg-indigo-600 text-white"
                    : "bg-cyan-950 border border-cyan-800 text-cyan-400"
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed max-w-xl ${
                  isUser
                    ? "bg-indigo-600 text-white rounded-tr-none shadow-md"
                    : "bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none whitespace-pre-wrap"
                }`}
              >
                {m.content}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400 flex items-center justify-center text-xs shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3.5 rounded-2xl rounded-tl-none bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>Analyzing profile context and generating response...</span>
            </div>
          </div>
        )}
      </div>

      {/* Message Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything about your resume, skill proof, or internship matches..."
          className="flex-1 px-4 py-3 text-xs sm:text-sm bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="inline-flex items-center justify-center p-3 sm:px-5 sm:py-3 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 shadow-md shadow-indigo-600/20 transition-all"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline ml-2">Send</span>
        </button>
      </form>
    </div>
  );
};
