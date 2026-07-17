import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  collectMetaTokenScopes,
  facebookPublishPermissionError,
  metaTokenHasPageScope,
  missingFacebookPublishScopes,
} from "../src/lib/social/facebook-permissions.ts";
import { publishErrorHint } from "../src/lib/integrations/publish-error-hints.ts";

describe("facebook permission helpers", () => {
  it("collects scopes from scopes and granular_scopes", () => {
    const scopes = collectMetaTokenScopes({
      scopes: ["pages_show_list"],
      granular_scopes: [{ scope: "pages_manage_posts", target_ids: ["111"] }],
    });
    assert.equal(scopes.has("pages_show_list"), true);
    assert.equal(scopes.has("pages_manage_posts"), true);
  });

  it("requires pages_manage_posts for the connected page", () => {
    const missing = missingFacebookPublishScopes(
      {
        is_valid: true,
        scopes: ["pages_show_list", "pages_read_engagement"],
      },
      "page-1",
    );
    assert.deepEqual(missing, ["pages_manage_posts"]);
  });

  it("fails when granular grant excludes the page", () => {
    assert.equal(
      metaTokenHasPageScope(
        {
          scopes: ["pages_manage_posts"],
          granular_scopes: [
            { scope: "pages_manage_posts", target_ids: ["other-page"] },
          ],
        },
        "pages_manage_posts",
        "page-1",
      ),
      false,
    );
  });

  it("passes when page is in granular target_ids", () => {
    const missing = missingFacebookPublishScopes(
      {
        is_valid: true,
        scopes: ["pages_manage_posts"],
        granular_scopes: [
          { scope: "pages_manage_posts", target_ids: ["page-1"] },
        ],
      },
      "page-1",
    );
    assert.deepEqual(missing, []);
  });

  it("builds a reconnect-oriented missing-permission message", () => {
    const message = facebookPublishPermissionError(["pages_manage_posts"]);
    assert.match(message, /pages_manage_posts/);
    assert.match(message, /Reconnect Facebook/i);
  });
});

describe("publishErrorHint", () => {
  it("adds actionable guidance for Facebook #200 without masking the raw error", () => {
    const raw = "Facebook photo publish failed: (#200) Permissions error";
    const hint = publishErrorHint("facebook", raw);
    assert.ok(hint);
    assert.match(hint!, /Reconnect Facebook/i);
    assert.match(hint!, /pages_manage_posts/);
    assert.match(hint!, /Advanced Access/i);
    assert.equal(hint!.includes(raw), false);
  });

  it("preserves existing Instagram Advanced Access hint path", () => {
    const hint = publishErrorHint(
      "instagram",
      "Instagram publish failed: pages_manage_posts is not available",
    );
    assert.ok(hint);
    assert.match(hint!, /App Review/i);
  });

  it("returns null for unrelated errors", () => {
    assert.equal(publishErrorHint("facebook", "rate limit exceeded"), null);
  });
});
