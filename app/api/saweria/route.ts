import { NextRequest, NextResponse } from "next/server";

const ROBLOX_API_KEY  = process.env.ROBLOX_API_KEY;
const UNIVERSE_ID     = "9841882273";
const TOPIC           = "SaweriaDonation";
const SAWERIA_TOKEN   = process.env.SAWERIA_TOKEN;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("Saweria body:", JSON.stringify(body));

    // if (SAWERIA_TOKEN) {
    //   const token = req.headers.get("x-saweria-token");
    //   if (token !== SAWERIA_TOKEN) {
    //     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    //   }
    // }

    const donorName  = body.donator_name  || "Anonymous";
    const amount     = body.amount_raw    || body.etc?.amount_to_display || 0;
    const message    = body.message       || "";
    const currency   = "IDR";

    const payload = {
      donorName,
      amount,
      message,
      currency,
    };

    console.log("API Key prefix:", ROBLOX_API_KEY?.substring(0, 8));
    console.log("Universe ID:", UNIVERSE_ID);

    const robloxRes = await fetch(
      `https://apis.roblox.com/messaging-service/v1/universes/${UNIVERSE_ID}/topics/${TOPIC}`,
      {
        method: "POST",
        headers: {
          "x-api-key":    ROBLOX_API_KEY!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: JSON.stringify(payload),
        }),
      }
    );

    const robloxBody = await robloxRes.text();
    console.log("Roblox status:", robloxRes.status);
    console.log("Roblox body:", robloxBody);

    if (!robloxRes.ok) {
      return NextResponse.json({ error: "Roblox API failed", status: robloxRes.status, detail: robloxBody }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Internal error", detail: String(e) }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: "ok" });
}
