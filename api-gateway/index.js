import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import dotenv from "dotenv";
import cors from "cors";
const app = express();

dotenv.config();
const routes = {
  "/api/auth*": `http://${process.env.AUTH_BE}`,
  "/api/users*": `http://${process.env.AUTH_BE}`,
  "/api/chat": `http://${process.env.CHAT_BE}`,
  "/api/conversationRequest": `http://${process.env.RELATION_BE}`,
  "/api/conversations*": `http://${process.env.CHAT_BE}`,
  "/api/groupConversations*": `http://${process.env.GROUP_CHAT_BE}`,
  "/api/health*": `http://${process.env.CHAT_BE}`,
  "/api/invitation*": `http://${process.env.RELATION_BE}`,
  "/api/status*": `http://${process.env.STATUS_BE}`
};

const pathRewrite = async (path, req) => {
  const targetUrl = req?.originalUrl?.replace("/api", "");
  console.log(`redirecting to ${targetUrl}`);
  return targetUrl;
};
app.use(
  cors({
    origin: [`http://${process.env.CLIENT_1}`, `http://${process.env.CLIENT_2}`],
    credentials: true,
  })
);

for (const route in routes) {
  const target = routes[route];
  app.use(
    route,
    createProxyMiddleware({
      target: target,
      changeOrigin: true,
      pathRewrite: pathRewrite,
    })
  );
}
const PORT = process.env.PORT || 9001;

app.listen(PORT, () => {
  console.log(`api gateway started listening on port : ${PORT}`);
});
