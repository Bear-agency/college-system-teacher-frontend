import { loadEnvConfig } from "@next/env";
import { type NextRequest, NextResponse } from "next/server";

loadEnvConfig(process.cwd());

const HOP_BY_HOP = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade",
]);

function backendOrigin(): string {
  return (process.env.API_URL ?? "http://127.0.0.1:3000").trim().replace(/\/+$/, "");
}

function buildTargetUrl(req: NextRequest, pathSegments: string[]): string {
  const path = pathSegments.length ? `/${pathSegments.join("/")}` : "";
  return `${backendOrigin()}${path}${req.nextUrl.search}`;
}

function forwardRequestHeaders(req: NextRequest): Headers {
  const out = new Headers();
  req.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (HOP_BY_HOP.has(lower) || lower === "host") return;
    out.set(key, value);
  });
  return out;
}

function forwardResponseHeaders(res: Response): Headers {
  const out = new Headers();
  res.headers.forEach((value, key) => {
    if (HOP_BY_HOP.has(key.toLowerCase())) return;
    out.set(key, value);
  });
  return out;
}

async function proxy(req: NextRequest, pathSegments: string[]): Promise<NextResponse> {
  const url = buildTargetUrl(req, pathSegments);
  const method = req.method;
  let body: ArrayBuffer | undefined;
  if (method !== "GET" && method !== "HEAD") {
    body = await req.arrayBuffer();
  }

  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers: forwardRequestHeaders(req),
      body: body && body.byteLength > 0 ? body : undefined,
      redirect: "manual",
    });
  } catch (err) {
    console.error("[api/backend] upstream fetch failed:", url, err);
    return NextResponse.json(
      {
        message:
          "Unable to reach the API server. Set API_URL in .env to your Nest origin and ensure the backend is running.",
      },
      { status: 502 },
    );
  }

  return new NextResponse(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers: forwardResponseHeaders(res),
  });
}

type Ctx = { params: Promise<{ path?: string[] }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  const { path = [] } = await ctx.params;
  return proxy(req, path);
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const { path = [] } = await ctx.params;
  return proxy(req, path);
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  const { path = [] } = await ctx.params;
  return proxy(req, path);
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const { path = [] } = await ctx.params;
  return proxy(req, path);
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const { path = [] } = await ctx.params;
  return proxy(req, path);
}

export async function HEAD(req: NextRequest, ctx: Ctx) {
  const { path = [] } = await ctx.params;
  return proxy(req, path);
}

export async function OPTIONS(req: NextRequest, ctx: Ctx) {
  const { path = [] } = await ctx.params;
  return proxy(req, path);
}
