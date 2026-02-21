"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { LANDING_CAPABILITIES } from "@/config/constants";

const CODE_EXAMPLES: Record<string, string> = {
  "/api/scrape/profiles": `curl http://localhost:3000/api/scrape/profiles \\
  --request POST \\
  --header 'Content-Type: application/json' \\
  --data '{
  "platform": "INSTAGRAM",
  "usernames": ["nike", "adidas"],
  "maxItems": 2
}'`,
  "/api/scrape/posts": `curl http://localhost:3000/api/scrape/posts \\
  --request POST \\
  --header 'Content-Type: application/json' \\
  --data '{
  "platform": "X",
  "usernames": ["elonmusk"],
  "daysBack": 3,
  "maxItems": 50
}'`,
  "/api/scrape/comments": `curl http://localhost:3000/api/scrape/comments \\
  --request POST \\
  --header 'Content-Type: application/json' \\
  --data '{
  "platform": "TIKTOK",
  "postUrls": ["https://tiktok.com/@user/video/123"],
  "daysBack": 7,
  "maxItems": 100
}'`,
};

export function ApiShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = LANDING_CAPABILITIES[activeIndex];
  const code = CODE_EXAMPLES[active.endpoint] ?? "";

  return (
    <section id="api" className="relative px-6 py-24">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-16 flex flex-col items-center gap-4 text-center">
          <span className="text-sm font-medium text-primary">API</span>
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Endpoints simples y potentes
          </h2>
          <p className="max-w-xl text-pretty text-muted-foreground">
            Tres endpoints cubren todos los casos de scraping. Todos siguen el
            mismo patrón de solicitud.
          </p>
        </div>

        {/* Tabs + code block */}
        <div className="overflow-hidden rounded-xl border border-border/50 bg-card">
          {/* Tab bar */}
          <div className="flex border-b border-border/50">
            {LANDING_CAPABILITIES.map((cap, i) => (
              <button
                key={cap.endpoint}
                onClick={() => setActiveIndex(i)}
                className={cn(
                  "flex-1 px-6 py-4 text-sm font-medium transition-colors",
                  i === activeIndex
                    ? "border-b-2 border-primary bg-primary/5 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {cap.title}
              </button>
            ))}
          </div>

          {/* Description */}
          <div className="border-b border-border/50 px-6 py-4">
            <p className="text-sm text-muted-foreground">{active.description}</p>
            <code className="mt-2 inline-block rounded-md bg-secondary px-2 py-1 font-mono text-xs text-secondary-foreground">
              POST {active.endpoint}
            </code>
          </div>

          {/* Code */}
          <div className="relative overflow-x-auto bg-[#0a0a0b] p-6">
            <pre className="font-mono text-sm leading-relaxed text-[#a8b4c0]">
              {code}
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
