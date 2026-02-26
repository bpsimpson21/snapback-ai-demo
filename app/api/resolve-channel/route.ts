import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "YOUTUBE_API_KEY is not set" }, { status: 500 });
  }

  const { searchParams } = new URL(req.url);
  const handle = searchParams.get("handle") ?? "@SnapbackSports1";

  const url = new URL("https://www.googleapis.com/youtube/v3/channels");
  url.searchParams.set("part", "snippet,statistics");
  url.searchParams.set("forHandle", handle.replace(/^@/, ""));
  url.searchParams.set("key", apiKey);

  const res = await fetch(url.toString());
  if (!res.ok) {
    const body = await res.text();
    return NextResponse.json({ error: `YouTube API error: ${res.status}`, detail: body }, { status: res.status });
  }

  const data = await res.json();
  const channel = data.items?.[0];

  if (!channel) {
    return NextResponse.json({ error: `No channel found for handle: ${handle}` }, { status: 404 });
  }

  return NextResponse.json({
    channelId: channel.id,
    title: channel.snippet.title,
    subscriberCount: channel.statistics.subscriberCount,
  });
}
