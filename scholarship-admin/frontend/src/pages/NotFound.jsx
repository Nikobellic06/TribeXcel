import AdminLayout from '../components/layout/AdminLayout';
import Button from '../components/ui/Button';
import { Empty } from '../components/ui/States';

export default function NotFound() {
  return (
    <AdminLayout title="Page not found" breadcrumb={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Not found' }]}>
      <div className="rounded border border-line bg-white">
        <Empty title="This page does not exist" message="The address may be mistyped, or the page may have moved." action={<Button to="/dashboard">Go to dashboard</Button>} />
      </div>
    </AdminLayout>
  );
}
