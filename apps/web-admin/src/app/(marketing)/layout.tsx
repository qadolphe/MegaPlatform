import { DarkThemeWrapper } from "@/components/dark-theme-wrapper";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DarkThemeWrapper>
      {children}
    </DarkThemeWrapper>
  );
}
