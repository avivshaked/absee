const ABSee = require('../../dist/index');
const experimentsConfig = require('./config.json');
const variantProviderMock = require('./services/variant-provider-mock-service');

const Experiments = ABSee.Experiments;

const experiments = Experiments.defineByObject(experimentsConfig);

const experimentA = experiments.getExperiment('FeatureA');
const experimentB = experiments.getExperiment('FeatureB');


// Settings provider for the first experiment
experimentA.setVariantProvider(() => {
    // providing mock service with experiment name and customer id
    return variantProviderMock('FeatureA', '1111');
});

// Settings provider for the second experiment
experimentB.setVariantProvider(() => {
    // providing mock service with experiment name and customer id
    return variantProviderMock('FeatureB', '2222');
});

// getting live experiment for the first experiment
experimentA.getLiveExperiment([{ variant: 'variantName' }])
    .then((liveExperiment) => {
        // Do something with live experiment
        console.log(liveExperiment);
        // Get experiment state
        console.log(experimentA.getVariantState(liveExperiment.variantName));
    });

// getting live experiment for the second experiment
experimentB.getLiveExperiment([{ variant: 'variantName' }])
    .then((liveExperiment) => {
        // Do something with live experiment
        console.log(liveExperiment);
        // Get experiment state
        console.log(experimentB.getVariantState(liveExperiment.variantName));
    });

// Get all the live experiments
experiments.getLiveExperiments([{ variant: 'variantName' }])
    .then((liveExperiments) => {
        // Do something with live experiments
        console.log(liveExperiments);
        // Get all experiments state
        console.log(experiments.getExperimentsState(liveExperiments));
    });
