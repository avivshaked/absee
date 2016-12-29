const http = require('http');

const url = require('url');

const parseCookies = require('./services/parse-cookies');

const PORT = process.argv[2] || 8080;

const renderTemplate = require('./services/render-template');

// Create the experiments construct
const experiments = require('./services/experiments');

const requestHandler = (request, response) => {
    const urlObj = url.parse(request.url);
    // Route specific logic

    // Route login; sets a client id cookie
    if (/\/login$/.test(urlObj.href)) {
        response.writeHead(302, {
            'Set-Cookie': `customer_id=${Math.floor(Math.random() * 100000000000000)}`,
            'Content-Type': 'text/plain',
            'Location': '/',
        });
        response.end();
        // Route logout; sets a client id cookie to empty string
    } else if (/\/logout$/.test(urlObj.href)) {
        response.writeHead(302, {
            'Set-Cookie': 'customer_id=',
            'Content-Type': 'text/plain',
            'Location': '/',
        });
        response.end('Logged Out\r\n');

        // Route "/" creates an html
    } else if (/\/$/.test(urlObj.href)) {
        // Create the cookis map
        const cookiesMap = parseCookies(request);
        // Get costumer id from cookis map
        const customerId = cookiesMap.get('customer_id');
        experiments
            .setVariantProviderContext({ customerId })
            /*** This is where we define the condition context. It changes for each request ***/
            .setConditionContext({ customerId })
            .getLiveExperiments(['variantName', 'customerId'])
            .then((liveExperiments) => {
                // Get the state of the live experiment
                const state = experiments.getExperimentsState(liveExperiments);

                // Write the html
                response.writeHeader(200, { 'Content-Type': 'text/html' });
                response.end(renderTemplate(customerId, liveExperiments, state));
            });
    } else {
        /* eslint-disable no-param-reassign */
        response.statusCode = 404;
        response.end('This route is not recognized');
    }
};

// Create the server
const server = http.createServer(requestHandler);
server.listen(PORT, () => {
    /* eslint-disable no-console */
    console.log('Server listening on: http://localhost:%s', PORT);
});
