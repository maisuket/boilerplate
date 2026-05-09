import createMiddleware from "next-intl/middleware";
import { routing } from "./components/layout/routing";

export default createMiddleware(routing);

export const config = {
  // Define em quais rotas o middleware de idioma deve atuar.
  matcher: ["/", "/(pt|en)/:path*", "/((?!api|_next|_vercel|.*\\..*).*)"],
};
