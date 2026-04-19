import { NextRequest, NextResponse } from "next/server";

const ROBLOX_API_KEY  = process.env.ROBLOX_API_KEY;
const UNIVERSE_ID     = "9841882273";
const TOPIC           = "SaweriaDonation";
const SAWERIA_TOKEN   = process.env.SAWERIA_TOKEN;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (SAWERIA_TOKEN) {
      const token = req.headers.get("x-saweria-token");
      if (token !== SAWERIA_TOKEN) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const donorName  = body.donator_name  || body.name       || "Anonymous";
    const amount     = body.amount        || body.nominal     || 0;
    const message    = body.message       || body.pesan       || "";
    const currency   = body.currency      || "IDR";

    const payload = {
      donorName,
      amount,
      message,
      currency,
    };

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

    if (!robloxRes.ok) {
      const err = await robloxRes.text();
      return NextResponse.json({ error: "Roblox API failed", detail: err }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Internal error", detail: String(e) }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: "ok" });
}