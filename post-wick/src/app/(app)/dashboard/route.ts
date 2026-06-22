import { auth } from "@clerk/nextjs/server";
import { readFileSync } from "fs";
import { join } from "path";
import { NextResponse } from "next/server";

const logoutScript = `
<script>
  document.querySelector(".nav-logout")?.addEventListener("click", function () {
    fetch("/api/auth/sign-out", { method: "POST" })
      .then(function () { window.location.href = "/sign-in"; })
      .catch(function () { window.location.href = "/sign-in"; });
  });
</script>`;

export async function GET(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  const html = readFileSync(
    join(process.cwd(), "public/content-plan.html"),
    "utf-8",
  ).replace("</body>", `${logoutScript}</body>`);

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
