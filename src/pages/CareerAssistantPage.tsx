import React, { useState, useRef, useEffect } from "react";
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
  Loader2,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    "How can I turn my resume claims into verified GitHub evidence?",
    "What technical gaps should I fix for Frontend Engineering roles?",
    "How do I prepare for technical interviews on React hook closures?",
    "Review my project bullet points for ATS impact.",
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

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
    <div className="h-[calc(100vh-8.5rem)] flex flex-col space-y-4 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] light:border-slate-200 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-cyan-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white light:text-slate-900 flex items-center gap-2">
              <span>ProofPath AI Career Assistant</span>
              <Badge variant="verified" size="sm">Grounded Context</Badge>
            </h1>
            <p className="text-xs text-slate-400 light:text-slate-500">
              Personalized career guidance grounded in your actual Skill Proof evidence and target opportunities.
            </p>
          </div>
        </div>

        <div className="hidden sm:block">
          <Badge variant="outline" size="sm">
            Target: {profileData?.profile?.preferredRole || "Software Engineering"}
          </Badge>
        </div>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0 no-scrollbar">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
          Quick Prompts:
        </span>
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p)}
            className="px-3 py-1.5 rounded-xl text-xs bg-slate-900/90 hover:bg-slate-800 text-slate-300 light:bg-white light:text-slate-700 light:border-slate-200 border border-slate-800/80 whitespace-nowrap transition-colors cursor-pointer"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 rounded-2xl bg-slate-950/40 light:bg-slate-50 border border-white/[0.08] light:border-slate-200 shadow-inner">
        {messages.map((m, idx) => {
          const isAssistant = m.role === "assistant";
          return (
            <div
              key={idx}
              className={`flex items-start gap-3 ${
                isAssistant ? "" : "flex-row-reverse"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                  isAssistant
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-800 light:bg-slate-200 text-slate-300 light:text-slate-700"
                }`}
              >
                {isAssistant ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-2xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  isAssistant
                    ? "bg-slate-900/95 light:bg-white border border-slate-800 light:border-slate-200 text-slate-200 light:text-slate-800 shadow-sm whitespace-pre-wrap"
                    : "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                }`}
              >
                {m.content}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
              <span>Analyzing evidence and formulating advice...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form Bar */}
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
          placeholder="Ask anything about your resume, missing skills, or technical interview prep..."
          className="flex-1 bg-slate-900/90 light:bg-white border border-slate-800 light:border-slate-200 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-100 light:text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
        />
        <Button
          variant="glow"
          size="md"
          type="submit"
          disabled={!input.trim() || loading}
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
};
