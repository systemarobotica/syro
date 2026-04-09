"use client";

import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";

function getGreeting() {
  const hour = new Date().getHours();
  const timeStr = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  let period = "Good evening";
  if (hour >= 5 && hour < 12) period = "Good morning";
  else if (hour >= 12 && hour < 17) period = "Good afternoon";

  return `It's ${timeStr}. ${period}.`;
}

export function Footer() {
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    setGreeting(getGreeting());
    const interval = setInterval(() => setGreeting(getGreeting()), 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="border-t border-border mt-20">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted mb-4" style={{ fontFamily: "var(--font-heading)" }}>
          <a
            href="https://www.amazon.com/dp/B0DDFQF7WV"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors inline-flex items-center gap-1"
          >
            Amazon <ExternalLink size={10} />
          </a>
          <a
            href="https://www.researchgate.net/publication/383159462_On_the_Order_and_Evolution_of_Robotkind"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors inline-flex items-center gap-1"
          >
            ResearchGate <ExternalLink size={10} />
          </a>
          <a
            href="https://github.com/buxor"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors inline-flex items-center gap-1"
          >
            GitHub <ExternalLink size={10} />
          </a>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted mb-4" style={{ fontFamily: "var(--font-heading)" }}>
          <span>ISBN 979-8-89460-024-3</span>
          <span>&middot;</span>
          <span>Staten House</span>
          <span>&middot;</span>
          <a
            href="https://creativecommons.org/licenses/by/4.0/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            CC BY 4.0
          </a>
        </div>

        <div className="border-t border-border pt-4 mt-4">
          <p className="text-xs text-muted" style={{ fontFamily: "var(--font-heading)" }}>
            {greeting}
          </p>
        </div>
      </div>
    </footer>
  );
}
