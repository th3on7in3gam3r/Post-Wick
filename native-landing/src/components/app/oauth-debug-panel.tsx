import Link from "next/link";
import type { OAuthDebugInfo } from "@/lib/integrations/oauth-debug";

type OAuthDebugPanelProps = {
  errorCode?: string;
  detail?: string;
  debug?: OAuthDebugInfo | null;
  showAdminLinks?: boolean;
  redirectUri?: string;
};

export function OAuthDebugPanel({
  errorCode,
  detail,
  debug,
  showAdminLinks,
  redirectUri,
}: OAuthDebugPanelProps) {
  if (!errorCode && !detail && !debug) return null;

  const resolvedDetail = detail ?? debug?.message;
  const isPendingRedirect = debug?.step === "authorization_redirect";

  return (
    <div
      className={
        isPendingRedirect
          ? "rounded-xl border border-amber-200/80 bg-amber-50/90 px-4 py-4 text-sm text-amber-950"
          : "rounded-xl border border-red-200/80 bg-red-50/90 px-4 py-4 text-sm text-red-950"
      }
    >
      <p className="font-medium">
        {isPendingRedirect ? "OAuth in progress" : "Connection debug"}
      </p>
      {resolvedDetail ? (
        <p className="mt-2 leading-relaxed">{resolvedDetail}</p>
      ) : null}
      {debug?.hint ? (
        <p className={`mt-2 ${isPendingRedirect ? "text-amber-900/80" : "text-red-900/80"}`}>
          {debug.hint}
        </p>
      ) : null}

      <details className="mt-3">
        <summary
          className={`cursor-pointer text-xs font-medium uppercase tracking-wide ${
            isPendingRedirect ? "text-amber-900/70" : "text-red-900/70"
          }`}
        >
          Technical details
        </summary>
        <dl
          className={`mt-3 space-y-2 font-mono text-xs ${
            isPendingRedirect ? "text-amber-900/90" : "text-red-900/90"
          }`}
        >
          {errorCode ? (
            <div>
              <dt className={isPendingRedirect ? "text-amber-900/60" : "text-red-900/60"}>
                Error code
              </dt>
              <dd>{errorCode}</dd>
            </div>
          ) : null}
          {debug?.flow ? (
            <div>
              <dt className={isPendingRedirect ? "text-amber-900/60" : "text-red-900/60"}>
                OAuth flow
              </dt>
              <dd>{debug.flow}</dd>
            </div>
          ) : null}
          {debug?.step ? (
            <div>
              <dt className={isPendingRedirect ? "text-amber-900/60" : "text-red-900/60"}>
                {isPendingRedirect ? "Current step" : "Failed at step"}
              </dt>
              <dd>{debug.step}</dd>
            </div>
          ) : null}
          {debug?.platform ? (
            <div>
              <dt className={isPendingRedirect ? "text-amber-900/60" : "text-red-900/60"}>
                Platform
              </dt>
              <dd>{debug.platform}</dd>
            </div>
          ) : null}
          {debug?.hasCode !== undefined ? (
            <div>
              <dt className={isPendingRedirect ? "text-amber-900/60" : "text-red-900/60"}>
                Authorization code received
              </dt>
              <dd>{debug.hasCode ? "yes" : "no"}</dd>
            </div>
          ) : null}
          {debug?.hasState !== undefined ? (
            <div>
              <dt className={isPendingRedirect ? "text-amber-900/60" : "text-red-900/60"}>
                State parameter received
              </dt>
              <dd>{debug.hasState ? "yes" : "no"}</dd>
            </div>
          ) : null}
          {debug?.metaError ? (
            <div>
              <dt className={isPendingRedirect ? "text-amber-900/60" : "text-red-900/60"}>
                Provider error param
              </dt>
              <dd>{debug.metaError}</dd>
            </div>
          ) : null}
          {debug?.at ? (
            <div>
              <dt className={isPendingRedirect ? "text-amber-900/60" : "text-red-900/60"}>
                Timestamp (UTC)
              </dt>
              <dd>{debug.at}</dd>
            </div>
          ) : null}
          {detail ? (
            <div>
              <dt className={isPendingRedirect ? "text-amber-900/60" : "text-red-900/60"}>
                API message
              </dt>
              <dd className="break-words">{detail}</dd>
            </div>
          ) : null}
          {redirectUri ? (
            <div>
              <dt className={isPendingRedirect ? "text-amber-900/60" : "text-red-900/60"}>
                Expected redirect URI
              </dt>
              <dd className="break-all">{redirectUri}</dd>
            </div>
          ) : null}
        </dl>
      </details>

      {showAdminLinks ? (
        <p
          className={`mt-3 text-xs ${isPendingRedirect ? "text-amber-900/75" : "text-red-900/75"}`}
        >
          Config checks:{" "}
          {debug?.flow === "linkedin" ? (
            <>
              <Link
                href="/api/health/linkedin"
                className="underline underline-offset-2"
                target="_blank"
              >
                LinkedIn health
              </Link>
            </>
          ) : debug?.flow === "x" ? (
            <>
              <Link href="/api/health/x" className="underline underline-offset-2" target="_blank">
                X health
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/api/health/meta"
                className="underline underline-offset-2"
                target="_blank"
              >
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
            </>
          )}
        </p>
      ) : null}
    </div>
  );
}
