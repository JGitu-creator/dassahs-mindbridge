import { redirect } from 'next/navigation';

export default async function ShareRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Next.js 15 exposes dynamic route params asynchronously.
  // The main page's useEffect will catch 'share_id' and fetch the data.
  const { id } = await params;
  redirect(`/?share_id=${id}`);
}
