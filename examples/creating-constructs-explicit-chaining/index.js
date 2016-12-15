const ABSee = require('../../dist/index');

const Experiments = ABSee.Experiments;
const Experiment = ABSee.Experiment;
const Variant = ABSee.Variant;

const experiments = Experiments.define()
    .addExperiment(
        Experiment.define('First experiment')
            .addVariant(
                Variant.define('control', {
                    prop1: true,
                    prop2: true,
                })
            )
            .addVariant(
                Variant.define('variantA', {
                    prop1: false,
                    prop2: true,
                })
            )
            .addVariant(
                Variant.define('variantB', {
                    prop1: true,
                    prop2: false,
                })
            )
    )
    .addExperiment(
        Experiment.define('Second Experiment')
            .addVariant(
                Variant.define('control', {
                    prop1: true,
                    prop2: true,
                })
            )
            .addVariant(
                Variant.define('variantA', {
                    prop1: false,
                    prop2: true,
                })
            )
    )
    .addExperiment(
        Experiment.define('Third Experiment')
            .addVariant(
                Variant.define('control', {
                    prop1: true,
                    prop2: true,
                })
            )
            .addVariant(
                Variant.define('variantA', {
                    prop1: true,
                    prop2: false,
                })
            )
    );

module.exports = experiments;
