import { Header } from "@/components/app/header";
import { ConnectButton } from "@/components/social/connect-button";

export default function ConnectionsPage() {
  const brandId = "placeholder";

  return (
    <>
      <Header title="Social connections" />
      <div className="mx-auto max-w-lg flex-1 space-y-4 p-6">
        <p className="text-sm text-brand-muted">
          Connect social accounts to publish approved posts.
        </p>
        <ConnectButton platform="linkedin" brandId={brandId} />
        <ConnectButton platform="twitter" brandId={brandId} />
        <ConnectButton platform="instagram" brandId={brandId} />
      </div>
    </>
  );
}
