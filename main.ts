import { Application, Router, send } from "https://deno.land/x/oak/mod.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";
import { authenticate } from "npm:@commercelayer/js-auth";
import { CommerceLayer, LineItem } from "npm:@commercelayer/sdk";

const CL_INTEGRATION_ID = "Rr24pjI64RaolEe0MILytWPShsuznHBMRwcX1eGMzUM";
const CL_INTEGRATION_SECRET = "9ZQaa8sz0LnjUfDB6-HXBiB4-A61POvbd2KQC3wJlmA";
const CL_SLUG = "salomon-demo";

const token = await authenticate("client_credentials", {
  clientId: CL_INTEGRATION_ID,
  clientSecret: CL_INTEGRATION_SECRET,
});

const cl = CommerceLayer({
  organization: CL_SLUG,
  accessToken: token.accessToken,
});

const router = new Router();

router.options("/api/v1/orderPlacement", oakCors());
router.post("/api/v1/orderPlacement", oakCors(), async (ctx) => {
  const reqBody = await ctx.request.body().value;

  const sku_line_items = reqBody.data.relationships.line_items.data.filter(
    (line_item: LineItem) => line_item.item_type === "skus"
  );

  sku_line_items.array.forEach((line_item: LineItem) => {
    cl.orders.update({
      id: reqBody.data.id,
      metadata: line_item.metadata,
    });
  });

  ctx.response.body = {
    success: true,
    data: {},
  };
});

const server = new Application();

server.use(router.routes());
server.use(router.allowedMethods());

await server.listen({ port: 8000 });
