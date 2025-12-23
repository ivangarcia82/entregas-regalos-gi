export { default } from "next-auth/middleware";

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - login (login page)
         * - api (API routes, needed for auth and uploads)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder content (if referenced directly like /logo.png, though usually best to exclude specifics)
         */
        "/((?!login|api|_next/static|_next/image|favicon.ico).*)",
    ],
};
