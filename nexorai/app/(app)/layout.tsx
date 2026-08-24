import { Sidebar } from '@/components/dashboard/sidebar';
import { Topbar } from '@/components/dashboard/topbar';
import { requireOrgContext } from '@/lib/server/org-context';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { organization, business, businesses, businessLimit } = await requireOrgContext();

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          organizationName={organization.name}
          plan={organization.plan}
          businesses={businesses}
          activeBusinessId={business?.id ?? null}
          canAddBusiness={businesses.length < businessLimit}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
