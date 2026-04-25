import { NextRequest, NextResponse } from "next/server";

const INTERNAL_API_BASE_URL =
  process.env.DASHBOARD_API_INTERNAL_BASE_URL ?? "https://sohe-nation-api.onrender.com/api/v1";

function extractReadableErrorMessage(body: string): string {
  const titleMatch = body.match(/<title>(.*?)<\/title>/i);
  if (titleMatch?.[1]) {
    return titleMatch[1].trim();
  }

  const headingMatch = body.match(/<h1[^>]*>(.*?)<\/h1>/i);
  if (headingMatch?.[1]) {
    return headingMatch[1].replace(/<[^>]+>/g, "").trim();
  }

  return body.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 240);
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

  const requestAuthorization = request.headers.get("authorization");
  const requestContentType = request.headers.get("content-type");
  const requestAccept = request.headers.get("accept");
  const requestBody =
    request.method === "GET" || request.method === "HEAD"
      ? undefined
      : Buffer.from(await request.arrayBuffer());

  let upstreamResponse: Response;
  try {
    upstreamResponse = await fetch(targetUrl, {
      method: request.method,
      headers: {
        ...(requestContentType ? { "Content-Type": requestContentType } : {}),
        ...(requestAccept ? { Accept: requestAccept } : {}),
        ...(requestAuthorization ? { Authorization: requestAuthorization } : {}),
      },
      body: requestBody,
      cache: "no-store",
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "The dashboard could not reach the API service.";

    return NextResponse.json(
      {
        error: {
          code: "backend_unreachable",
          message,
          target: targetUrl.toString(),
        },
      },
      { status: 502 },
    );
  }

  if ([204, 205, 304].includes(upstreamResponse.status)) {
    return new NextResponse(null, {
      status: upstreamResponse.status,
    });
  }

  const responseText = await upstreamResponse.text();
  const upstreamContentType = upstreamResponse.headers.get("content-type") ?? "application/json";

  if (!upstreamResponse.ok && !upstreamContentType.includes("application/json")) {
    return NextResponse.json(
      {
        error: {
          code: "backend_error",
          message: extractReadableErrorMessage(responseText) || "The API returned an unexpected error.",
          target: targetUrl.toString(),
          status: upstreamResponse.status,
        },
      },
      { status: upstreamResponse.status },
    );
  }

  return new NextResponse(responseText, {
    status: upstreamResponse.status,
    headers: {
      "Content-Type": upstreamContentType,
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
