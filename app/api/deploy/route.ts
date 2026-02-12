import { NextRequest, NextResponse } from "next/server";
import { exportPageToHtml } from "@/lib/exportHtml";
import type { PageDocument } from "@/lib/schema";

interface DeployRequest {
  page: PageDocument;
  netlifyToken: string;
  siteName?: string;
}

interface NetlifySite {
  id: string;
  name: string;
  url: string;
  ssl_url: string;
  admin_url: string;
}

interface NetlifyDeploy {
  id: string;
  state: string;
  url: string;
  ssl_url: string;
  deploy_url: string;
  admin_url: string;
}

const NETLIFY_API = "https://api.netlify.com/api/v1";

/** Site names: lowercase alphanumeric and hyphens only, 3-63 chars */
const SAFE_SITE_NAME = /^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/;

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as DeployRequest;
    const { page, netlifyToken, siteName } = body;

    if (!page || !netlifyToken) {
      return NextResponse.json(
        { error: "Missing required fields: page and Netlify token." },
        { status: 400 }
      );
    }

    if (!page.nodes || !Array.isArray(page.nodes)) {
      return NextResponse.json(
        { error: "Invalid page structure." },
        { status: 400 }
      );
    }

    // Validate and sanitize site name
    const cleanSiteName = siteName
      ? siteName.toLowerCase().replace(/[^a-z0-9-]/g, "-").slice(0, 63)
      : `ai-editor-${Date.now()}`;

    if (siteName && !SAFE_SITE_NAME.test(cleanSiteName)) {
      return NextResponse.json(
        { error: "Invalid site name. Use lowercase letters, numbers, and hyphens (3-63 chars)." },
        { status: 400 }
      );
    }

    // Step 1: Generate the HTML
    const html = exportPageToHtml(page);

    // Step 2: Create a Netlify site
    const siteResponse = await fetch(`${NETLIFY_API}/sites`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${netlifyToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: cleanSiteName }),
    });

    if (!siteResponse.ok) {
      console.error("Netlify site creation error:", siteResponse.status);
      return NextResponse.json(
        { error: "Failed to create Netlify site. Please check your token and try again." },
        { status: siteResponse.status }
      );
    }

    const site = (await siteResponse.json()) as NetlifySite;

    // Step 3: Deploy using the file digest method
    const encoder = new TextEncoder();
    const htmlBytes = encoder.encode(html);
    const hashBuffer = await crypto.subtle.digest("SHA-1", htmlBytes);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const sha1 = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    const deployResponse = await fetch(
      `${NETLIFY_API}/sites/${site.id}/deploys`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${netlifyToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          files: { "/index.html": sha1 },
        }),
      }
    );

    if (!deployResponse.ok) {
      console.error("Netlify deploy error:", deployResponse.status);
      return NextResponse.json(
        { error: "Netlify deploy failed. Please try again." },
        { status: deployResponse.status }
      );
    }

    const deploy = (await deployResponse.json()) as NetlifyDeploy;

    // Step 4: Upload the actual file content
    const uploadResponse = await fetch(
      `${NETLIFY_API}/deploys/${deploy.id}/files/index.html`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${netlifyToken}`,
          "Content-Type": "application/octet-stream",
        },
        body: htmlBytes,
      }
    );

    if (!uploadResponse.ok) {
      console.error("Netlify file upload error:", uploadResponse.status);
      return NextResponse.json(
        { error: "File upload to Netlify failed. Please try again." },
        { status: uploadResponse.status }
      );
    }

    return NextResponse.json({
      url: site.ssl_url || site.url,
      siteId: site.id,
      siteName: site.name,
      deployId: deploy.id,
      adminUrl: site.admin_url,
    });
  } catch (error) {
    console.error("Deploy error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during deployment." },
      { status: 500 }
    );
  }
}
