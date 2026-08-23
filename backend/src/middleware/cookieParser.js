// Manual cookie parser (no external package needed).
// Same technique taught in the SSR/Cookies lecture: split the raw
// "Cookie" header on ';', then each pair on '=' to build req.cookies.
const parseCookies = (req, res, next) => {
    req.cookies = {};
    const cookieHeader = req.headers.cookie;

    if (cookieHeader) {
        cookieHeader.split(';').forEach((pair) => {
            const separatorIndex = pair.indexOf('=');
            if (separatorIndex === -1) return;
            const name = pair.slice(0, separatorIndex).trim();
            const value = pair.slice(separatorIndex + 1).trim();
            if (name) {
                req.cookies[name] = decodeURIComponent(value);
            }
        });
    }

    next();
};

module.exports = parseCookies;
