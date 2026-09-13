"use client";

import { useState, useMemo, type FormEvent, type ChangeEvent } from "react";
import { scopingBookPackages, getScopingPackage } from "@/lib/data/scoping-book";

export type BriefAnswer = { group: string; question: string; checked: boolean; comment: string };

const categories = Array.from(new Set(scopingBookPackages.map((p) => p.category)));

function buildAnswers(packageKey: string): BriefAnswer[] {
  const pkg = getScopingPackage(packageKey);
  if (!pkg) return [];
  return pkg.groups.flatMap((g) =>
    g.questions.map((question) => ({ group: g.title, question, checked: false, comment: "" }))
  );
}

// Grows with what's typed instead of scrolling inside a fixed box — "no
// space barrier" on the comment field, per how this was asked for.
function autoGrow(e: ChangeEvent<HTMLTextAreaElement>) {
  e.target.style.height = "auto";
  e.target.style.height = `${e.target.scrollHeight}px`;
}

export function BriefForm({
  clientId,
  briefId,
  initialPackageKey,
  initialAnswers,
  action,
}: {
  clientId: string;
  briefId?: string;
  initialPackageKey?: string;
  initialAnswers?: BriefAnswer[];
  action: (formData: FormData) => void | Promise<void>;
}) {
  const [packageKey, setPackageKey] = useState(initialPackageKey ?? "");
  const [answers, setAnswers] = useState<BriefAnswer[]>(initialAnswers ?? []);
  const locked = Boolean(briefId); // package can't change once a brief exists — its answers are tied to it

  const pkg = packageKey ? getScopingPackage(packageKey) : undefined;

  function selectPackage(key: string) {
    setPackageKey(key);
    setAnswers(buildAnswers(key));
  }

  function toggle(index: number) {
    setAnswers((prev) => prev.map((a, i) => (i === index ? { ...a, checked: !a.checked } : a)));
  }

  function setComment(index: number, value: string) {
    setAnswers((prev) => prev.map((a, i) => (i === index ? { ...a, comment: value } : a)));
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    if (!packageKey) {
      e.preventDefault();
      window.alert("Pick a package first.");
    }
  }

  const grouped = useMemo(() => {
    const map = new Map<string, { question: string; index: number }[]>();
    answers.forEach((a, i) => {
      const arr = map.get(a.group) ?? [];
      arr.push({ question: a.question, index: i });
      map.set(a.group, arr);
    });
    return Array.from(map.entries());
  }, [answers]);

  const answeredCount = answers.filter((a) => a.checked).length;

  return (
    <form action={action} onSubmit={handleSubmit} className="space-y-6">
      <input type="hidden" name="clientId" value={clientId} />
      {briefId && <input type="hidden" name="briefId" value={briefId} />}
      <input type="hidden" name="packageKey" value={packageKey} />
      <input type="hidden" name="packageName" value={packageKey} />
      <input type="hidden" name="answers" value={JSON.stringify(answers)} />

      <div className="max-w-sm">
        <label htmlFor="brief-package" className="mb-1.5 block text-xs font-medium text-[var(--color-slate)]">
          Package
        </label>
        <select
          id="brief-package"
          value={packageKey}
          disabled={locked}
          onChange={(e) => selectPackage(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-brass)] disabled:cursor-not-allowed disabled:opacity-70"
        >
          <option value="" disabled>
            Select a package
          </option>
          {categories.map((cat) => (
            <optgroup key={cat} label={cat} className="bg-[var(--color-ink)]">
              {scopingBookPackages
                .filter((p) => p.category === cat)
                .map((p) => (
                  <option key={p.key} value={p.key} className="bg-[var(--color-ink)]">
                    {p.key}
                  </option>
                ))}
            </optgroup>
          ))}
        </select>
      </div>

      {pkg && (
        <>
          <div className="glass rounded-xl p-4 text-sm text-[var(--color-slate)]">
            <span className="text-[var(--color-brass)]">Included: </span>
            {pkg.recap}
          </div>

          <p className="text-xs text-[var(--color-slate)]">
            {answeredCount} of {answers.length} ticked
          </p>

          <div className="space-y-8">
            {grouped.map(([groupTitle, items]) => (
              <div key={groupTitle}>
                <h3 className="mb-3 font-[family-name:var(--font-mono)] text-xs font-medium uppercase tracking-wider text-[var(--color-brass)]">
                  {groupTitle}
                </h3>
                <div className="space-y-4">
                  {items.map(({ question, index }) => (
                    <div key={index} className="glass rounded-xl p-4">
                      <label className="flex items-start gap-2.5 text-sm">
                        <input
                          type="checkbox"
                          checked={answers[index].checked}
                          onChange={() => toggle(index)}
                          className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/20 bg-white/5 accent-[var(--color-brass)]"
                        />
                        <span className={answers[index].checked ? "text-[var(--color-slate)] line-through" : ""}>
                          {question}
                        </span>
                      </label>
                      <textarea
                        value={answers[index].comment}
                        onChange={(e) => {
                          setComment(index, e.target.value);
                          autoGrow(e);
                        }}
                        placeholder="Notes from the call (optional)..."
                        rows={1}
                        className="mt-2.5 w-full resize-none overflow-hidden rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none transition focus:border-[var(--color-brass)]"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button
            type="submit"
            className="rounded-full bg-[var(--color-brass)] px-6 py-3 text-sm font-medium text-[var(--color-ink)] transition hover:opacity-90"
          >
            Save brief
          </button>
        </>
      )}
    </form>
  );
}
