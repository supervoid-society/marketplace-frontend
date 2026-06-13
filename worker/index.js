export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/")) {
      return Response.json({
        name: "Cloudflare",
      });
    }

    // Serve static assets
    if (!env.ASSETS) {
      return new Response("Assets binding not found. If this is local dev, check your configuration.", { status: 500 });
    }

    const response = await env.ASSETS.fetch(request);

    // Get content type safely
    const contentType = (response.headers.get("content-type") || "").toLowerCase();
    const pathname = url.pathname;

    // Debugging: Log for Cloudflare dashboard
    console.log(`[Request] Path: ${pathname} | Status: ${response.status} | Type: ${contentType}`);
    console.log(`[Env Check] VITE_AUTH_SERVICE_URL: ${env.VITE_AUTH_SERVICE_URL ? "Exists" : "MISSING"}`);

    // Inject for HTML files, root path, or SPA routes (no dot in last segment)
    const isHtml = contentType.includes("text/html") || pathname === "/" || (!pathname.includes(".") && pathname !== "/api");

    if (isHtml) {
      const vars = {
        VITE_AUTH_SERVICE_URL: env.VITE_AUTH_SERVICE_URL || "URL_NOT_SET",
        VITE_CRUD_SERVICE_URL: env.VITE_CRUD_SERVICE_URL || "URL_NOT_SET",
      };

      return new HTMLRewriter()
        .on("head", {
          element(element) {
            element.prepend(`<script>window.ENV = ${JSON.stringify(vars)};</script>`, { html: true });
          },
        })
        // Fallback: if no head, try to prepend to body
        .on("body", {
          element(element) {
            // We only need to inject once, but HTMLRewriter handles multiple matches fine.
            // Prepending to body as a safety measure.
            element.prepend(`<script>if(!window.ENV) window.ENV = ${JSON.stringify(vars)};</script>`, { html: true });
          },
        })
        .transform(response);
    }

    return response;
  },
};
