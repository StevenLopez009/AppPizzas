import UserLayout from "@/src/features/layout/components/UserLayout";

export default function MyOrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <UserLayout>{children}</UserLayout>;
}
