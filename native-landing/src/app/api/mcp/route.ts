import type { AuthInfo } from "@modelcontextprotocol/server";
import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import {
  extractApiKeyFromRequest,
  isKerygmaApiKeyFormat,
} from "@/lib/api-keys";
import { authenticateWithApiKey } from "@/lib/db";
import { GENERATE_PLATFORMS } from "@/lib/platforms";
import {
  AssistantApiError,
  approveOrSkipPostForUser,
  generatePostsForUser,
  getBrandForUser,
  getCalendarForUser,
  listBrandsForUser,
  listPendingPostsForUser,
  reschedulePostForUser,
} from "@/lib/server/assistant-api";

type AuthedRequest = Request & { auth?: AuthInfo };

function jsonError(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: {
      "Content-Type": "application/json",
      "WWW-Authenticate":
        'Bearer realm="Kerygma Social MCP", error="invalid_token"',
    },
  });
}

function userIdFromCtx(ctx: {
  http?: { authInfo?: AuthInfo; req?: AuthedRequest };
}): string {
  const extraUserId = ctx.http?.authInfo?.extra?.userId;
  if (typeof extraUserId === "string" && extraUserId) return extraUserId;

  const clientId = ctx.http?.authInfo?.clientId;
  if (typeof clientId === "string" && clientId) return clientId;

  const reqExtra = ctx.http?.req?.auth?.extra?.userId;
  if (typeof reqExtra === "string" && reqExtra) return reqExtra;

  const reqClient = ctx.http?.req?.auth?.clientId;
  if (typeof reqClient === "string" && reqClient) return reqClient;

  throw new AssistantApiError("Unauthorized", 401);
}

function toolText(payload: unknown, isError = false) {
  return {
    content: [
      {
        type: "text" as const,
        text:
          typeof payload === "string"
            ? payload
            : JSON.stringify(payload, null, 2),
      },
    ],
    isError,
  };
}

function toolError(error: unknown) {
  if (error instanceof AssistantApiError) {
    return toolText({ error: error.message, status: error.status }, true);
  }
  if (error instanceof z.ZodError) {
    return toolText({ error: error.issues }, true);
  }
  return toolText(
    {
      error: error instanceof Error ? error.message : "Tool failed",
    },
    true,
  );
}

const mcpHandler = createMcpHandler(
  (server) => {
    server.registerTool(
      "list_brands",
      {
        title: "List brands",
        description:
          "List Kerygma Social brands for the authenticated account.",
        inputSchema: z.object({}),
      },
      async (_args, ctx) => {
        try {
          const brands = await listBrandsForUser(userIdFromCtx(ctx));
          return toolText({ brands });
        } catch (error) {
          return toolError(error);
        }
      },
    );

    server.registerTool(
      "get_brand",
      {
        title: "Get brand",
        description:
          "Read brand voice and research summary used for post generation.",
        inputSchema: z.object({
          brandId: z.string().min(1).describe("Brand ID from list_brands"),
        }),
      },
      async ({ brandId }, ctx) => {
        try {
          const brand = await getBrandForUser(userIdFromCtx(ctx), brandId);
          return toolText({ brand });
        } catch (error) {
          return toolError(error);
        }
      },
    );

    server.registerTool(
      "generate_posts",
      {
        title: "Generate posts",
        description:
          "Generate pending draft posts for a brand. Posts start as pending and must be approved to schedule.",
        inputSchema: z.object({
          brandId: z.string().min(1),
          platform: z.enum(GENERATE_PLATFORMS).optional().default("linkedin"),
          count: z
            .number()
            .int()
            .min(1)
            .max(50)
            .optional()
            .describe("How many posts to generate (capped by plan)"),
        }),
      },
      async ({ brandId, platform, count }, ctx) => {
        try {
          const result = await generatePostsForUser(userIdFromCtx(ctx), brandId, {
            platform,
            count,
          });
          return toolText(result);
        } catch (error) {
          return toolError(error);
        }
      },
    );

    server.registerTool(
      "list_pending_posts",
      {
        title: "List pending posts",
        description: "List draft posts waiting for approval.",
        inputSchema: z.object({}),
      },
      async (_args, ctx) => {
        try {
          const result = await listPendingPostsForUser(userIdFromCtx(ctx));
          return toolText(result);
        } catch (error) {
          return toolError(error);
        }
      },
    );

    server.registerTool(
      "approve_post",
      {
        title: "Approve or skip post",
        description:
          "Approve a pending post (auto-schedules the next available slot) or skip it. Scheduled means status approved with scheduledAt set.",
        inputSchema: z.object({
          postId: z.string().min(1),
          action: z
            .enum(["approve", "skip"])
            .default("approve")
            .describe("approve schedules; skip discards"),
        }),
      },
      async ({ postId, action }, ctx) => {
        try {
          const result = await approveOrSkipPostForUser(
            userIdFromCtx(ctx),
            postId,
            action,
          );
          return toolText(result);
        } catch (error) {
          return toolError(error);
        }
      },
    );

    server.registerTool(
      "reschedule_post",
      {
        title: "Reschedule post",
        description:
          "Change scheduledAt on an approved post waiting to publish.",
        inputSchema: z.object({
          postId: z.string().min(1),
          scheduledAt: z
            .string()
            .describe("ISO-8601 datetime for when the post should publish"),
        }),
      },
      async ({ postId, scheduledAt }, ctx) => {
        try {
          const result = await reschedulePostForUser(
            userIdFromCtx(ctx),
            postId,
            scheduledAt,
          );
          return toolText(result);
        } catch (error) {
          return toolError(error);
        }
      },
    );

    server.registerTool(
      "get_calendar",
      {
        title: "Get calendar",
        description:
          "List posts with scheduledAt in a date range (defaults to the next two weeks).",
        inputSchema: z.object({
          from: z
            .string()
            .optional()
            .describe("ISO-8601 start (defaults to now)"),
          to: z
            .string()
            .optional()
            .describe("ISO-8601 end (defaults to from + 13 days)"),
        }),
      },
      async ({ from, to }, ctx) => {
        try {
          const result = await getCalendarForUser(
            userIdFromCtx(ctx),
            from,
            to,
          );
          return toolText(result);
        } catch (error) {
          return toolError(error);
        }
      },
    );
  },
  {
    serverInfo: {
      name: "kerygma-social",
      version: "1.0.0",
    },
    instructions:
      "You are connected to Kerygma Social. Use list_brands and get_brand to learn the voice, generate_posts to draft content, list_pending_posts + approve_post to schedule, and get_calendar to review the schedule. Publishing still requires social accounts connected in the Kerygma app.",
  },
);

async function withApiKeyAuth(req: Request): Promise<Response> {
  const rawKey = extractApiKeyFromRequest(req);
  if (!rawKey || !isKerygmaApiKeyFormat(rawKey)) {
    return jsonError(
      "Missing or invalid API key. Use Authorization: Bearer ks_live_…",
      401,
    );
  }

  const auth = await authenticateWithApiKey(rawKey);
  if (!auth) {
    return jsonError("Invalid or revoked API key", 401);
  }

  const authed = req as AuthedRequest;
  authed.auth = {
    token: rawKey,
    clientId: auth.userId,
    scopes: ["kerygma"],
    extra: { userId: auth.userId, keyId: auth.keyId },
  };

  return mcpHandler(authed);
}

export const maxDuration = 300;

export async function GET(req: Request) {
  return withApiKeyAuth(req);
}

export async function POST(req: Request) {
  return withApiKeyAuth(req);
}

export async function DELETE(req: Request) {
  return withApiKeyAuth(req);
}
