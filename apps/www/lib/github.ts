/**
 * GitHub API helpers-fetch repo metadata and file tree for public repos.
 * Uses the GitHub REST API (no auth required for public repos, but a token
 * raises rate limits from 60 → 5 000 req/h).
 */

const GITHUB_API = "https://api.github.com"

function headers(): HeadersInit {
  const h: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
  }
  if (process.env.GITHUB_TOKEN) {
    h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
  }
  return h
}

/** Parse "owner/repo" or a full GitHub URL into { owner, repo, branch? } */
export function parseRepoUrl(input: string): {
  owner: string
  repo: string
  branch?: string
} {
  const trimmed = input.trim().replace(/\/+$/, "")

  // Full URL: https://github.com/owner/repo(/tree/branch)
  const urlMatch = trimmed.match(
    /github\.com\/([^/]+)\/([^/]+?)(?:\.git)?(?:\/tree\/([^/]+))?$/
  )
  if (urlMatch) {
    return {
      owner: urlMatch[1]!,
      repo: urlMatch[2]!,
      branch: urlMatch[3] || undefined,
    }
  }

  // Short form: owner/repo
  const shortMatch = trimmed.match(/^([^/]+)\/([^/]+)$/)
  if (shortMatch) {
    return { owner: shortMatch[1]!, repo: shortMatch[2]! }
  }

  throw new Error(
    "Invalid repo URL. Expected https://github.com/owner/repo or owner/repo"
  )
}

/** Repo metadata from the GitHub API */
export interface RepoInfo {
  owner: string
  repo: string
  defaultBranch: string
  description: string | null
  stars: number
}

/** Fetch basic repo info (validates the repo exists + gets default branch) */
export async function getRepoInfo(
  owner: string,
  repo: string
): Promise<RepoInfo> {
  const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}`, {
    headers: headers(),
  })
  if (!res.ok) {
    if (res.status === 404) throw new Error("Repository not found-check the URL and make sure it's a public repo")
    if (res.status === 403) {
      const resetHeader = res.headers.get("x-ratelimit-reset")
      const resetIn = resetHeader ? Math.max(0, Math.ceil((Number(resetHeader) * 1000 - Date.now()) / 60000)) : null
      throw new Error(
        `GitHub API rate limit exceeded${resetIn ? `-resets in ~${resetIn} min` : ""}. Try again later.`
      )
    }
    throw new Error(`GitHub API error: ${res.status}`)
  }
  const data = await res.json()
  return {
    owner,
    repo,
    defaultBranch: data.default_branch,
    description: data.description,
    stars: data.stargazers_count,
  }
}

/** A single node in the repo file tree */
export interface TreeNode {
  path: string
  type: "blob" | "tree"
  size?: number
}

/**
 * Fetch the full file tree of a repo using the Git Trees API (recursive).
 * Returns only blobs (files), not directories.
 */
export async function getRepoTree(
  owner: string,
  repo: string,
  branch: string
): Promise<TreeNode[]> {
  const res = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
    { headers: headers() }
  )
  if (!res.ok) {
    throw new Error(`Failed to fetch repo tree: ${res.status}`)
  }
  const data = await res.json()

  if (data.truncated) {
    // Tree has > 100k entries; still usable but may be incomplete
    console.warn("Repository tree was truncated by GitHub API")
  }

  return (data.tree as TreeNode[]).filter((n) => n.type === "blob")
}

/** Fetch the raw text content of a single file */
export async function getFileContent(
  owner: string,
  repo: string,
  branch: string,
  path: string
): Promise<string> {
  const res = await fetch(
    `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`,
    { headers: headers() }
  )
  if (!res.ok) {
    throw new Error(`Failed to fetch file ${path}: ${res.status}`)
  }
  return res.text()
}
