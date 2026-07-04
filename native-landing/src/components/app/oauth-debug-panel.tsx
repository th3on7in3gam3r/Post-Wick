import Link from "next/link";
import type { OAuthDebugInfo } from "@/lib/integrations/oauth-debug";

type OAuthDebugPanelProps = {
  errorCode?: string;
  detail?: string;
  debug?: OAuthDebugInfo | null;
  showAdminLinks?: boolean;
};

export function OAuthDebugPanel({
  errorCode,
  detail,
  debug,
  showAdminLinks,
}: OAuthDebugPanelProps) {
  if (!errorCode && !detail && !debug) return null;

  const resolvedDetail = detail ?? debug?.message;

  return (
    <div className="rounded-xl border border-red-200/80 bg-red-50/90 px-4 py-4 text-sm text-red-950">
      <p className="font-medium">Connection debug</p>
      {resolvedDetail ? (
        <p className="mt-2 leading-relaxed">{resolvedDetail}</p>
      ) : null}
      {debug?.hint ? (
        <p className="mt-2 text-red-900/80">{debug.hint}</p>
      ) : null}

      <details className="mt-3">
        <summary className="cursor-pointer text-xs font-medium uppercase tracking-wide text-red-900/70">
          Technical details
        </summary>
        <dl className="mt-3 space-y-2 font-mono text-xs text-red-900/90">
          {errorCode ? (
            <div>
              <dt className="text-red-900/60">Error code</dt>
              <dd>{errorCode}</dd>
            </div>
          ) : null}
          {debug?.flow ? (
            <div>
              <dt className="text-red-900/60">OAuth flow</dt>
              <dd>{debug.flow}</dd>
            </div>
          ) : null}
          {debug?.step ? (
            <div>
              <dt className="text-red-900/60">Failed at step</dt>
              <dd>{debug.step}</dd>
            </div>
          ) : null}
          {debug?.platform ? (
            <div>
              <dt className="text-red-900/60">Platform</dt>
              <dd>{debug.platform}</dd>
            </div>
          ) : null}
          {debug?.hasCode !== undefined ? (
            <div>
              <dt className="text-red-900/60">Authorization code received</dt>
              <dd>{debug.hasCode ? "yes" : "no"}</dd>
            </div>
          ) : null}
          {debug?.hasState !== undefined ? (
            <div>
              <dt className="text-red-900/60">State parameter received</dt>
              <dd>{debug.hasState ? "yes" : "no"}</dd>
            </div>
          ) : null}
          {debug?.metaError ? (
            <div>
              <dt className="text-red-900/60">Meta error param</dt>
              <dd>{debug.metaError}</dd>
            </div>
          ) : null}
          {debug?.at ? (
            <div>
              <dt className="text-red-900/60">Timestamp (UTC)</dt>
              <dd>{debug.at}</dd>
            </div>
          ) : null}
        </dl>
      </details>

      {showAdminLinks ? (
        <p className="mt-3 text-xs text-red-900/75">
          Config checks:{" "}
          <Link href="/api/health/meta" className="underline underline-offset-2" target="_blank">
            Instagram health
          </Link>
          {" · "}
          <Link
            href="/api/health/facebook"
            className="underline underline-offset-2"
            target="_blank"
          >
            Facebook health
          </Link>
        </p>
      ) : null}
    </div>
  );
}
