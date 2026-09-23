import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Check, Copy } from "lucide-react";

function CodeBlock({ className, children }) {
  const [copied, setCopied] = useState(false);

  const language = (className || "").replace("language-", "");
  const code = String(children).replace(/\n$/, "");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch (error) {
      console.error("Failed to copy code:", error);
    }
  };

  return (
    <div className="my-3 overflow-hidden rounded-xl border border-white/10 bg-[#1a1a1a]">
      <div className="flex items-center justify-between bg-white/5 px-4 py-1.5 text-xs text-slate-400">
        <span>{language || "text"}</span>

        <button
          type="button"
          onClick={handleCopy}
          className="flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-slate-400 transition hover:bg-white/10 hover:text-white"
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <pre className="overflow-x-auto px-4 py-3 font-mono text-[13px] leading-6">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function MarkdownRenderer({ content }) {
  const text =
    typeof content === "string"
      ? content
      : content == null
      ? ""
      : JSON.stringify(content, null, 2);

  return (
    <div className="text-[15px] leading-7 text-slate-100">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ inline, className, children }) {
            if (inline) {
              return (
                <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[13px] text-rose-300">
                  {children}
                </code>
              );
            }

            return (
              <CodeBlock className={className}>
                {children}
              </CodeBlock>
            );
          },

          table({ children }) {
            return (
              <div className="my-3 overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  {children}
                </table>
              </div>
            );
          },

          th({ children }) {
            return (
              <th className="border border-white/10 bg-white/5 px-3 py-2 text-left font-semibold">
                {children}
              </th>
            );
          },

          td({ children }) {
            return (
              <td className="border border-white/10 px-3 py-2 align-top">
                {children}
              </td>
            );
          },

          a({ children, href }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className="text-indigo-300 underline underline-offset-2 hover:text-indigo-200"
              >
                {children}
              </a>
            );
          },

          ul({ children }) {
            return (
              <ul className="my-2 list-disc space-y-1 pl-6">
                {children}
              </ul>
            );
          },

          ol({ children }) {
            return (
              <ol className="my-2 list-decimal space-y-1 pl-6">
                {children}
              </ol>
            );
          },

          h1({ children }) {
            return (
              <h1 className="mb-3 mt-5 text-xl font-semibold text-white">
                {children}
              </h1>
            );
          },

          h2({ children }) {
            return (
              <h2 className="mb-2 mt-4 text-lg font-semibold text-white">
                {children}
              </h2>
            );
          },

          h3({ children }) {
            return (
              <h3 className="mb-2 mt-3 text-base font-semibold text-white">
                {children}
              </h3>
            );
          },

          p({ children }) {
            return <p className="my-2">{children}</p>;
          },

          blockquote({ children }) {
            return (
              <blockquote className="my-2 border-l-2 border-white/20 pl-3 text-slate-400">
                {children}
              </blockquote>
            );
          },
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}

export default MarkdownRenderer;