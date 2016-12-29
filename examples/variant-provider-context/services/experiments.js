
const ABSee = require('../../../dist/index');

const experimentsConfig = require('../config/experiments.config.json');

const getVariant = require('../mocks/variant-provider-service');

const Experiments = ABSee.Experiments;
const experiments = Experiments.defineByObject(experimentsConfig);

experiments
    .getExperiment('ShoppingCartColor')
    .setVariantProvider((context) => {
        return getVariant(context.customerId);
    });

module.exports = experiments;
