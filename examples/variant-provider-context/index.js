const http = require('http');

const url = require('url');

const PORT = process.argv[2] || 8080;

// Create the experiments construct
const experiments = require('./services/experiments');

const requestHandler = (request, response) => {
    const urlObj = url.parse(request.url);

    // Route specific logic
    if (/\/customer-id\//.test(urlObj.href)) {
        // extract costumer id
        const customerId = urlObj.href.match(/(.*\/)([0-9]*)/)[2];

        /*** Here is where we set the context for the variant provider. it changes on each request ***/
        experiments.setVariantProviderContext({
            customerId,
        });

        /*** Now we get the liveExperiments and the experiments state ***/
        experiments.getLiveExperiments(['variantName', 'customerId'])
            .then((liveExperiments) => {
                // Send back a response
                response.write('The live experiments:\r\n');
                response.write(JSON.stringify(liveExperiments));
                response.write('\r\n');

                // Get the state that is set for the variant (for each experiment. in this case
                // there is only one test)
                const state = experiments.getExperimentsState(liveExperiments);

                // Finalize the response
                response.write('The experiment state:\r\n');
                response.end(JSON.stringify(state));
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
