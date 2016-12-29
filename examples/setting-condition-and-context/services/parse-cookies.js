const parseCookies = (request) => {
    const cookiesList = new Map();
    const cookieString = request.headers.cookie;

    if (cookieString) {
        cookieString.split(';').forEach((cookie) => {
            const cookieParts = cookie.split('=');
            cookiesList.set(cookieParts.shift().trim(), decodeURI(cookieParts.join('=')));
        });
    }

    return cookiesList;
};

module.exports = parseCookies;
