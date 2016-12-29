const ABSee = require('../../../dist/index');

const experimentsConfig = require('../config/experiments.config.json');

const getVariant = require('../mocks/variant-provider-service');

const Experiments = ABSee.Experiments;
const experiments = Experiments.defineByObject(experimentsConfig);

experiments
    .getExperiment('divColor')
    .setVariantProvider(context => getVariant(context.customerId))
    /*** This is where we set the condition function ***/
    .setCondition(context => !!context.customerId);

module.exports = experiments;
