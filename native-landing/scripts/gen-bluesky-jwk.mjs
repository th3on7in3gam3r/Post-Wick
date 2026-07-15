import { JoseKey } from "@atproto/oauth-client-node";

async function main() {
  const kid = `kerygma-${Date.now()}`;
  const key = await JoseKey.generate(["ES256"], kid);
  process.stdout.write(`${JSON.stringify(key.privateJwk)}\n`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
