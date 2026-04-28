import UserLayout from "@/src/features/layout/components/UserLayout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <UserLayout>{children}</UserLayout>;
}
