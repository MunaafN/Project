import { NextRequest, NextResponse } from "next/server";

const GITHUB_API = "https://api.github.com";
const PER_PAGE = 100;
const MAX_PAGES = 10; // Safety cap: 100 * 10 = 1000 repos max

interface GitHubRepo {
  name: string;
  full_name: string;
  description: string | null;
  private: boolean;
  updated_at: string;
  default_branch: string;
  language: string | null;
  html_url: string;
}

interface RepoItem {
  name: string;
  fullName: string;
  description: string | null;
  isPrivate: boolean;
  updatedAt: string;
  defaultBranch: string;
  language: string | null;
  htmlUrl: string;
}

/** Parse GitHub's Link header to find the "next" page URL */
function getNextPageUrl(linkHeader: string | null): string | null {
  if (!linkHeader) return null;
  const match = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
  return match ? match[1] : null;
}

export async function POST(request: NextRequest) {
  try {
    const { token } = (await request.json()) as { token: string };

    if (!token || !token.trim()) {
      return NextResponse.json(
        { error: "GitHub token is required" },
        { status: 400 }
      );
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    };

    const allRepos: GitHubRepo[] = [];
    let url: string | null =
      `${GITHUB_API}/user/repos?sort=updated&per_page=${PER_PAGE}&affiliation=owner,collaborator,organization_member`;
    let page = 0;

    while (url && page < MAX_PAGES) {
      const response = await fetch(url, { headers });

      if (!response.ok) {
        if (response.status === 401) {
          return NextResponse.json(
            { error: "Invalid GitHub token. Please check your Personal Access Token and ensure it has the 'repo' scope." },
            { status: 401 }
          );
        }
        console.error("GitHub API error:", response.status);
        return NextResponse.json(
          { error: "Failed to fetch repositories from GitHub. Please try again." },
          { status: response.status }
        );
      }

      const repos = (await response.json()) as GitHubRepo[];
      allRepos.push(...repos);

      // Follow pagination via Link header
      url = getNextPageUrl(response.headers.get("link"));
      page++;
    }

    const mapped: RepoItem[] = allRepos.map((r) => ({
      name: r.name,
      fullName: r.full_name,
      description: r.description,
      isPrivate: r.private,
      updatedAt: r.updated_at,
      defaultBranch: r.default_branch,
      language: r.language,
      htmlUrl: r.html_url,
    }));

    return NextResponse.json({ repos: mapped });
  } catch (error) {
    console.error("GitHub repos error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while fetching repositories." },
      { status: 500 }
    );
  }
}
