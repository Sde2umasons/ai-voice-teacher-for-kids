import { LearningProvider } from "@/components/common/LearningProvider";
import { AppShell } from "@/components/common/AppShell";
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <LearningProvider>
      <AppShell>{children}</AppShell>
    </LearningProvider>
  );
}
