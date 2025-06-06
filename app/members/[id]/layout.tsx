// Server component that can export generateStaticParams
export async function generateStaticParams() {
  // Return empty array for now - routes will be handled dynamically at runtime
  // This is required for static export with dynamic routes
  return [];
}

export const dynamicParams = true; // Allow dynamic parameters not returned by generateStaticParams

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
