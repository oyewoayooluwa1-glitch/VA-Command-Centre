import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Touching getUser() refreshes the session cookie if it's close to
  // expiring — without this, users get silently logged out.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && request.nextUrl.pathname.startsWith("/dashboard")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Gate the app behind an active subscription — but never gate the
  // billing page itself, or a blocked user could never reach it to pay.
  const path = request.nextUrl.pathname;
  if (user && path.startsWith("/dashboard") && path !== "/dashboard/billing") {
    const { data: workspace } = await supabase
      .from("workspaces")
      .select("subscription_status, trial_ends_at")
      .single();

    const trialExpired =
      workspace?.subscription_status === "trialing" &&
      workspace.trial_ends_at &&
      new Date(workspace.trial_ends_at) < new Date();
    const blocked =
      trialExpired ||
      workspace?.subscription_status === "past_due" ||
      workspace?.subscription_status === "canceled";

    if (blocked) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard/billing";
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.svg$).*)"],
};
