import { NextRequest, NextResponse } from "next/server";

const INTERNAL_API_BASE_URL =
  process.env.DASHBOARD_API_INTERNAL_BASE_URL ?? "http://localhost:8000/api/v1";

const DEV_DEFAULT_BASIC_USER = "admin";
const DEV_DEFAULT_BASIC_PASS = "admin123";

function resolveBasicAuthHeader() {
  const username =
    process.env.DASHBOARD_API_BASIC_AUTH_USER ?? DEV_DEFAULT_BASIC_USER;
  const password =
    process.env.DASHBOARD_API_BASIC_AUTH_PASSWORD ?? DEV_DEFAULT_BASIC_PASS;

  if (!username || !password) return null;

  const token = Buffer.from(`${username}:${password}`).toString("base64");
  return `Basic ${token}`;
}

async function proxyRequest(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;

  if (!path?.length) {
    return NextResponse.json(
      {
        error: {
          code: "proxy_path_required",
          message: "A backend proxy path is required.",
        },
      },
      { status: 400 },
    );
  }

  const targetUrl = new URL(`${INTERNAL_API_BASE_URL}/${path.join("/")}/`);
  targetUrl.search = request.nextUrl.search;

  const authHeader = resolveBasicAuthHeader();
  const requestContentType = request.headers.get("content-type");

  const upstreamResponse = await fetch(targetUrl, {
    method: request.method,
    headers: {
      ...(requestContentType ? { "Content-Type": requestContentType } : {}),
      ...(authHeader ? { Authorization: authHeader } : {}),
    },
    body:
      request.method === "GET" || request.method === "HEAD"
        ? undefined
        : await request.text(),
    cache: "no-store",
  });

  const responseText = await upstreamResponse.text();

  return new NextResponse(responseText, {
    status: upstreamResponse.status,
    headers: {
      "Content-Type": upstreamResponse.headers.get("content-type") ?? "application/json",
    },
  });
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  return proxyRequest(request, context);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  return proxyRequest(request, context);
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  return proxyRequest(request, context);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  return proxyRequest(request, context);
}
