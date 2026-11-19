export const dynamic = "force-dynamic";

/** Debug endpoint: shows what is actually deployed. Safe to delete once uploads work. */
export function GET() {
  return Response.json({
    codeVersion: "blob-private-v3",
    onVercel: Boolean(process.env.VERCEL),
    hasBlobToken: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
    blobAccess: process.env.BLOB_ACCESS ?? "(default: private)",
    gitRepo: process.env.VERCEL_GIT_REPO_SLUG ?? null,
    gitBranch: process.env.VERCEL_GIT_COMMIT_REF ?? null,
    gitCommit: (process.env.VERCEL_GIT_COMMIT_SHA ?? "").slice(0, 7) || null,
  });
}
