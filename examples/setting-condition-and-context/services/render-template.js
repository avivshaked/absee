const renderTemplate = (costumerId, liveExperiments, state) => {
    const liveExperimentsJson = JSON.stringify(liveExperiments);
    const stateJson = JSON.stringify(state);
    const bgc = state.bgc || 'rgb(255,255,200)';
    return `
    <html>
    <head></head>
    <body>
        <div style="background-color: ${bgc};">
            <p>
                Costumer Id: ${costumerId}
            </p>
            <p>
                Live experiments: 
                <pre>${liveExperimentsJson}</pre>
            </p>
            <p>
                Experiment state: 
                <pre>${stateJson}</pre>
            </p>
        </div>
    </body>
    </html>
`;
};

module.exports = renderTemplate;
