import type { ReactNode } from "react";
import { ShotsTheme } from "@/components/shots/shots-theme";

export default function ShotsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="dark flex flex-1 flex-col bg-background text-foreground" style={{ colorScheme: "dark" }}>
      <script
        dangerouslySetInnerHTML={{
          __html: "document.documentElement.classList.add('dark')",
        }}
      />
      <ShotsTheme />
      {children}
    </div>
  );
}
