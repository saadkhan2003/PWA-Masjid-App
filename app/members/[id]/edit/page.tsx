import dynamic from 'next/dynamic';

// Server component that exports generateStaticParams
export async function generateStaticParams() {
  // Return empty array for dynamic generation at runtime
  return [];
}

export const dynamicParams = true;

// Dynamically import the client component
const ClientEditMemberPage = dynamic(() => import('./client-page'), {
  ssr: false, // Disable server-side rendering for this component
});

// Server component wrapper
export default function EditMemberPage({ params }: { params: { id: string } }) {
  return <ClientEditMemberPage />;
}