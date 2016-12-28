const ABSee = require('../../dist/index');
const experimentsConfig = require('./config.json');

const Experiments = ABSee.Experiments;

const experiments = Experiments.defineByObject(experimentsConfig);

// Getting a specific state by experiment name and variant name
const firstState = experiments.getVariantState('FeatureA', 'VariantB');
const secondState = experiments.getVariantState('FeatureB', 'VariantA');

// Getting a merged state for several live experiments
const mergedState = experiments.getExperimentsState([
    {
        experimentName: 'FeatureA',
        variantName: 'VariantB',
    },
    {
        experimentName: 'FeatureB',
        variantName: 'VariantA',
    },
]);

console.log(firstState); // { FeatureAProp1: 'show', FeatureAProp2: 'show' }

console.log(secondState); // { FeatureBProp1: 'hide', FeatureBProp2: 'show' }

console.log(mergedState); // { FeatureAProp1: 'show', FeatureAProp2: 'show', FeatureBProp1: 'hide', FeatureBProp2: 'show' }
