"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Send } from "lucide-react";

import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { PageHeader } from "@/components/PageHeader";
import { api } from "@/lib/api";
import type { DatasetDetail } from "@/types/api";

interface Message {
  role: "user" | "assistant";
  content: string;
  code?: string | null;
}

export default function DatasetChatPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [dataset, setDataset] = useState<DatasetDetail | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Ask a grounded question about this dataset. I will answer only from uploaded data context." }
  ]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(true);
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .dataset(id)
      .then(setDataset)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function ask(event: FormEvent) {
    event.preventDefault();
    const trimmed = question.trim();
    if (!trimmed) return;
    setMessages((current) => [...current, { role: "user", content: trimmed }]);
    setQuestion("");
    setAsking(true);
    setError(null);
    try {
      const response = await api.ask(id, trimmed);
      setMessages((current) => [...current, { role: "assistant", content: response.answer, code: response.generated_code }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI request failed.");
    } finally {
      setAsking(false);
    }
  }

  return (
    <div>
      <PageHeader
        title={`AI Analyst Chat${dataset ? `: ${dataset.name}` : ""}`}
        description="Ask natural-language questions and receive context-grounded answers with Pandas logic where useful."
        action={
          <Link className="inline-flex items-center gap-2 text-sm font-medium text-mint" href={`/datasets/${id}`}>
            <ArrowLeft size={16} />
            Dataset
          </Link>
        }
      />
      {loading ? <LoadingState /> : null}
      {error ? <ErrorState message={error} /> : null}
      <section className="enterprise-panel flex min-h-[620px] flex-col overflow-hidden">
        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {messages.map((message, index) => (
            <div key={index} className={`max-w-3xl rounded p-3 text-sm ${message.role === "user" ? "ml-auto bg-ink text-white" : "bg-slate-100 text-ink"}`}>
              <p className="whitespace-pre-wrap">{message.content}</p>
              {message.code ? (
                <pre className="mt-3 overflow-x-auto rounded bg-slate-950 p-3 text-xs text-slate-50"><code>{message.code}</code></pre>
              ) : null}
            </div>
          ))}
          {asking ? <p className="text-sm text-slate-500">Analyzing dataset context...</p> : null}
        </div>
        <form onSubmit={ask} className="flex gap-2 border-t border-slate-200 p-3">
          <input
            className="focus-ring min-w-0 flex-1 rounded border border-slate-300 px-3 py-2 text-sm"
            placeholder="Which project exceeded budget?"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
          />
          <button className="focus-ring inline-flex items-center gap-2 rounded bg-mint px-4 py-2 text-sm font-semibold text-white" disabled={asking}>
            <Send size={16} />
            Ask
          </button>
        </form>
      </section>
    </div>
  );
}
