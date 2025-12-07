import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sub = searchParams.get('sub') || 'news';
  const limit = searchParams.get('limit') || '20';

  // The user-provided Cloudflare worker acts as a direct proxy.
  // We pass the subreddit and limit as query parameters to it.
  const proxyUrl = `https://snowy-wave-66ee.abdallahalshibami.workers.dev/?sub=${sub}&limit=${limit}`;

  try {
    const response = await fetch(proxyUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)",
      },
      cache: "no-store",
    });

    // Check if the response is successful
    if (!response.ok) {
        const errorText = await response.text();
        return NextResponse.json(
            { error: `Proxy request failed with status: ${response.status}`, details: errorText.slice(0, 200) },
            { status: response.status, headers: { "Access-Control-Allow-Origin": "*" } }
        );
    }

    const text = await response.text();

    let json;
    try {
      json = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { error: "Proxy returned invalid JSON", raw: text.slice(0, 200) },
        { status: 500, headers: { "Access-Control-Allow-Origin": "*" } }
      );
    }

    // The proxy already returns the `children` array directly.
    return NextResponse.json(json || [], {
      headers: { "Access-Control-Allow-Origin": "*" },
    });

  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500, headers: { "Access-Control-Allow-Origin": "*" } }
    );
  }
}
