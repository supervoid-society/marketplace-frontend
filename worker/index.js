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

    // If the request is for index.html (or a SPA route that serves index.html),
    // inject the environment variables.
    const contentType = response.headers.get("content-type");
    if (response.ok && contentType && contentType.includes("text/html")) {
      return new HTMLRewriter()
        .on("head", {
          element(element) {
            const vars = {
              VITE_AUTH_SERVICE_URL: env.VITE_AUTH_SERVICE_URL,
              VITE_CRUD_SERVICE_URL: env.VITE_CRUD_SERVICE_URL,
            };

            element.prepend(`<script>window.ENV = ${JSON.stringify(vars)};</script>`, { html: true });
          },
        })
        .transform(response);
    }

    return response;
  },
};
