import { redirect } from 'next/navigation';

export default function ShareRedirect({ params }: { params: { id: string } }) {
  // We use a simple redirect with a query param. 
  // The main page's useEffect will catch 'share_id' and fetch the data.
  redirect(`/?share_id=${params.id}`);
}
