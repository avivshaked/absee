const ABSee = require('../../dist/index');
const experimentsConfig = require('./config.json');
const variantProviderMock = require('./services/variant-provider-mock-service');

const Experiments = ABSee.Experiments;

const experiments = Experiments.defineByObject(experimentsConfig);

experiments.getExperiment('FeatureA')
    .setVariantProvider(() => {
        // providing mock service with experiment name and customer id
        return variantProviderMock('FeatureA', '1111');
    });


module.exports = experiments;
