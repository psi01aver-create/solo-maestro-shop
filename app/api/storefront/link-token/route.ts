import { NextResponse } from "next/server";
import { requirePartner } from "@/lib/api-auth";
import { signToken } from "@/lib/session";

/**
 * Storefront integration, Уровень 2, Вариант В — "deep link" convenience.
 *
 * Mints the same kind of bearer token POST /api/storefront/auth issues
 * for a fresh Telegram WebApp launch, but for a partner who is already
 * signed into THIS app (cookie session) and just wants to jump to the
 * storefront from inside it — see the "Открыть витрину" link on
 * app/orders/new/page.tsx. A Telegram Mini App can't hand its own session
 * to another Mini App through an ordinary <a href>, so without this, that
 * link always fell back to the storefront's guest/retail mode, even for an
 * already-logged-in partner (reported by Алексей: the bot's own "Открыть
 * витрину" button worked, but this in-app link didn't).
 *
 * Same-origin only — called from this app's own pages, so no CORS headers
 * — and no request body: the caller is identified purely by their existing
 * session cookie, exactly like any other authenticated route here.
 */
export async function GET() {
  const auth = await requirePartner();
  if (!auth.partner) return auth.response;

  const token = signToken("partner", auth.partner.id);
  return NextResponse.json({ token, partner: auth.partner });
}
