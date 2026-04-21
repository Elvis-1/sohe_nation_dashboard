import { NextRequest, NextResponse } from "next/server";

const INTERNAL_API_BASE_URL =
  process.env.DASHBOARD_API_INTERNAL_BASE_URL ?? "http://localhost:8000/api/v1";

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

  const requestAuthorization = request.headers.get("authorization");
  const requestContentType = request.headers.get("content-type");

  const upstreamResponse = await fetch(targetUrl, {
    method: request.method,
    headers: {
      ...(requestContentType ? { "Content-Type": requestContentType } : {}),
      ...(requestAuthorization ? { Authorization: requestAuthorization } : {}),
    },
    body:
      request.method === "GET" || request.method === "HEAD"
        ? undefined
        : await request.text(),
    cache: "no-store",
  });

  if ([204, 205, 304].includes(upstreamResponse.status)) {
    return new NextResponse(null, {
      status: upstreamResponse.status,
    });
  }

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
