import test from 'ava';
import sinon from 'sinon';
import Experiments from './';
import { Experiment } from '../';

let env;
test.beforeEach(() => {
    if (!Experiments._throwError.restore) {
        sinon.stub(Experiments, '_throwError');
    }
    if (!Experiments._validateExperiment.restore) {
        sinon.stub(Experiments, '_validateExperiment');
    }
    env = process.env.NODE_ENV;
    process.env.NODE_ENV = 'not-production';
});

test.afterEach(() => {
    process.env.NODE_ENV = env;
    if (Experiments._throwError.restore) {
        Experiments._throwError.restore();
    }
    if (Experiments._validateExperiment.restore) {
        Experiments._validateExperiment.restore();
    }
});

test('_throwError should do nothing when in production env', (t) => {
    process.env.NODE_ENV = 'production';
    Experiments._throwError();
    t.pass('No errors were thrown');
});

test('_validateExperiment should call _throwError if experiment is invalid', (t) => {
    const experiment = 'not an experiment';
    Experiments._validateExperiment.restore();
    Experiments._validateExperiment(experiment);
    t.is(Experiments._throwError.called, true, '_throwError was called');
    t.is(Experiments._throwError.args[0][0], TypeError, '_throwError was called with TypeError');
    t.regex(Experiments._throwError.args[0][1], / "experiment" must be an instance of Experiment/);
    sinon.stub(Experiments, '_validateExperiment');
});

test('addExperiment: should call _validateExperiment.', (t) => {
    const experiments = new Experiments();
    const experiment = {};
    experiment.registerExperiments = sinon.stub();
    experiments.addExperiment(experiment);
    t.is(Experiments._validateExperiment.called, true);
});

test('addExperiment: should set an experiment in experiments list.', (t) => {
    const experiments = new Experiments();
    const experiment = Experiment.define('someExperiment');
    experiment.registerExperiments = sinon.stub();
    experiments.addExperiment(experiment);
    t.is(experiments._experiments.someExperiment, experiment);
});

test('addExperiment: should call registerExperiments on the experiment', (t) => {
    const experiments = new Experiments();
    const experiment = Experiment.define('someExperiment');
    experiment.registerExperiments = sinon.stub();
    experiments.addExperiment(experiment);
    t.is(experiment.registerExperiments.calledWith(experiments), true);
});

test('addExperiment: should call experiment setVariantProviderContext with the context if exists',
    (t) => {
        const experiments = new Experiments();
        experiments.setVariantProviderContext('some context');
        const experiment = Experiment.define('someExperiment');
        sinon.stub(experiment, 'setVariantProviderContext');
        experiments.addExperiment(experiment);
        t.is(experiment.setVariantProviderContext.calledWith('some context'), true);
    });

test('addExperiment: should call experiment setConditionProviderContext with the context if exists',
    (t) => {
        const experiments = new Experiments();
        experiments.setConditionContext('some context');
        const experiment = Experiment.define('someExperiment');
        sinon.stub(experiment, 'setConditionContext');
        experiments.addExperiment(experiment);
        t.is(experiment.setConditionContext.calledWith('some context'), true);
    });

test('should return an instance of Experiments', (t) => {
    const experiments = new Experiments();
    const experiment = {};
    experiment.registerExperiments = sinon.stub();
    t.is(experiments.addExperiment(experiment), experiments);
});

test('constructor: should return the correct instance with a duplicated config', (t) => {
    let experiments = new Experiments();
    t.deepEqual(experiments._config, {},
        'with no config argument objects should have the same values');

    experiments = new Experiments({ prop: 'value' });
    t.deepEqual(experiments._config, { prop: 'value' },
        'with no config argument objects should have the same values');
});

test('get config: should return a copy of the instance _config', (t) => {
    const originalDefaultPrefix = Experiments._defaultConfig;
    const config = { prop: 'value', prop2: 'value' };
    Experiments._defaultConfig = config;
    const experiments = new Experiments(config);
    t.deepEqual(experiments.config, experiments._config);
    t.not(experiments.config, experiments._config);

    Experiments._defaultConfig = originalDefaultPrefix;
});

test('getExperimentsState: should return an empty object if liveExperiments argument ' +
    'is not an array', (t) => {
    const experiments = Experiments.define();
    const featuresList = experiments.getExperimentsState('not an array');
    t.deepEqual(featuresList, {});
});

test('getExperimentsState: should return an empty object if all the experiments ' +
    'described have invalid properties', (t) => {
    const experiments = Experiments.define();
    let liveExperiments = [undefined, undefined];
    let featuresList = experiments.getExperimentsState(liveExperiments);
    t.deepEqual(featuresList, {}, 'undefined experiments');

    liveExperiments = [{ variantName: 'variant' }, { variantName: 'variant' }];
    featuresList = experiments.getExperimentsState(liveExperiments);
    t.deepEqual(featuresList, {}, 'undefined experiment name');
    liveExperiments = [{ experimentName: 10, variantName: 'variant' },
        { experimentName: 10, variantName: 'variant' }];
    featuresList = experiments.getExperimentsState(liveExperiments);
    t.deepEqual(featuresList, {}, 'experiment name is not a string');
    liveExperiments = [{ experimentName: '', variantName: 'variant' },
        { experimentName: '', variantName: 'variant' }];
    featuresList = experiments.getExperimentsState(liveExperiments);
    t.deepEqual(featuresList, {}, 'experiment name is an empty string');

    liveExperiments = [{ experimentName: 'experiment' }, { experimentName: 'experiment' }];
    featuresList = experiments.getExperimentsState(liveExperiments);
    t.deepEqual(featuresList, {}, 'undefined variant name');
    liveExperiments = [{ experimentName: 'experiment', variantName: 10 },
        { experimentName: 'experiment', variantName: 10 }];
    featuresList = experiments.getExperimentsState(liveExperiments);
    t.deepEqual(featuresList, {}, 'variant name is not a string');
    liveExperiments = [{ experimentName: 'experiment', variantName: '' },
        { experimentName: 'experiment', variantName: '' }];
    featuresList = experiments.getExperimentsState(liveExperiments);
    t.deepEqual(featuresList, {}, 'variant name is an empty string');
});

test('getExperimentsState: should call getVariantState for each valid experiment', (t) => {
    const experiments = Experiments.define();
    sinon.stub(experiments, 'getVariantState');
    const liveExperiments = [{ experimentName: 'exp1', variantName: 'var1' },
        { experimentName: 'exp2', variantName: 'var2' }];
    experiments.getExperimentsState(liveExperiments);
    t.is(experiments.getVariantState.callCount, 2);
});

test('getExperimentsState: should returned a merged features list for all experiments',
    (t) => {
        const experiments = Experiments.define();
        let index = 0;
        const mockFeatures = [{
            hideFeature1: true,
            hideFeature2: true,
        }, {
            hideFeature3: true,
            hideFeature4: true,
        }];
        sinon.stub(experiments, 'getVariantState', () => {
            index += 1;
            return mockFeatures[index - 1];
        });

        const liveExperiments = [{ experimentName: 'exp1', variantName: 'var1' },
            { experimentName: 'exp2', variantName: 'var2' }];

        t.deepEqual(experiments.getExperimentsState(liveExperiments), {
            hideFeature1: true,
            hideFeature2: true,
            hideFeature3: true,
            hideFeature4: true,
        });
    });

test('getLiveExperiments call getLiveExperiment for each of the registered experiments ' +
    'with fields list',
    async (t) => {
        const fieldsList = ['1', '2'];
        const experiment1 = Experiment.define('firstExperiment');
        const experiment2 = Experiment.define('secondExperiment');
        const experiment3 = Experiment.define('thirdExperiment');
        sinon.stub(experiment1, 'getLiveExperiment', () => Promise.resolve());
        sinon.stub(experiment2, 'getLiveExperiment', () => Promise.resolve());
        sinon.stub(experiment3, 'getLiveExperiment', () => Promise.resolve());
        const experiments = Experiments.define()
            .addExperiment(experiment1)
            .addExperiment(experiment2)
            .addExperiment(experiment3);

        await experiments.getLiveExperiments(fieldsList);
        t.is(experiment1.getLiveExperiment.calledWith(fieldsList), true);
        t.is(experiment2.getLiveExperiment.calledWith(fieldsList), true);
        t.is(experiment3.getLiveExperiment.calledWith(fieldsList), true);
    });

test('getLiveExperiments: should return an empty array if any of the registered ' +
    'experiments getLiveExperiment throws', async (t) => {
    const experiment1 = Experiment.define('firstExperiment');
    const experiment2 = Experiment.define('secondExperiment');
    const experiment3 = Experiment.define('thirdExperiment');
    sinon.stub(experiment1, 'getLiveExperiment', () => Promise.resolve('firstExperiment'));
    sinon.stub(experiment2._logger, 'error');
    sinon.stub(experiment2, 'getLiveExperiment', () => {
        throw new Error();
    });
    sinon.stub(experiment3, 'getLiveExperiment', () => Promise.resolve('thirdExperiment'));
    const experiments = Experiments.define()
        .addExperiment(experiment1)
        .addExperiment(experiment2)
        .addExperiment(experiment3);

    const liveExperiments = await experiments.getLiveExperiments();
    t.deepEqual(liveExperiments, []);
});

test('getLiveExperiments: should return an empty array if any of the registered ' +
    'experiments getLiveExperiment returns a promise that throws', async (t) => {
    const experiment1 = Experiment.define('firstExperiment');
    const experiment2 = Experiment.define('secondExperiment');
    const experiment3 = Experiment.define('thirdExperiment');
    sinon.stub(experiment1, 'getLiveExperiment', () => Promise.resolve('firstExperiment'));
    sinon.stub(experiment2, 'getLiveExperiment', () => new Promise(() => {
        throw new Error();
    }));
    sinon.stub(experiment3, 'getLiveExperiment', () => Promise.resolve('thirdExperiment'));
    const experiments = Experiments.define()
        .addExperiment(experiment1)
        .addExperiment(experiment2)
        .addExperiment(experiment3);

    const liveExperiments = await experiments.getLiveExperiments();
    t.deepEqual(liveExperiments, []);
});


test('getLiveExperiments: should resolve on a list of all non null values', async (t) => {
    const experiment1 = Experiment.define('firstExperiment');
    const experiment2 = Experiment.define('secondExperiment');
    const experiment3 = Experiment.define('thirdExperiment');
    sinon.stub(experiment1, 'getLiveExperiment', () => Promise.resolve('firstExperiment'));
    sinon.stub(experiment2, 'getLiveExperiment', () => Promise.resolve(null));
    sinon.stub(experiment3, 'getLiveExperiment', () => Promise.resolve('thirdExperiment'));
    const experiments = Experiments.define()
        .addExperiment(experiment1)
        .addExperiment(experiment2)
        .addExperiment(experiment3);

    const liveExperiments = await experiments.getLiveExperiments();
    t.deepEqual(liveExperiments, ['firstExperiment', 'thirdExperiment']);
});

test('getLiveExperiments: should resolve to an empty array if _config.isOff',
    async (t) => {
        const experiment1 = Experiment.define('firstExperiment');
        const experiment2 = Experiment.define('secondExperiment');
        const experiment3 = Experiment.define('thirdExperiment');
        sinon.stub(experiment1, 'getLiveExperiment', () => Promise.resolve('firstExperiment'));
        sinon.stub(experiment2, 'getLiveExperiment', () => Promise.resolve(null));
        sinon.stub(experiment3, 'getLiveExperiment', () => Promise.resolve('thirdExperiment'));
        const experiments = Experiments.define({ isOff: true })
            .addExperiment(experiment1)
            .addExperiment(experiment2)
            .addExperiment(experiment3);

        const liveExperiments = await experiments.getLiveExperiments();
        t.deepEqual(liveExperiments, []);
    });

test('setVariantProviderContest: Should call setVariantProvider for each registered experiment',
    (t) => {
        const experiment1 = Experiment.define('firstExperiment');
        const experiment2 = Experiment.define('secondExperiment');
        const experiment3 = Experiment.define('thirdExperiment');
        sinon.stub(experiment1, 'setVariantProviderContext');
        sinon.stub(experiment2, 'setVariantProviderContext');
        sinon.stub(experiment3, 'setVariantProviderContext');
        const experiments = Experiments.define()
            .addExperiment(experiment1)
            .addExperiment(experiment2)
            .addExperiment(experiment3);
        experiments.setVariantProviderContext('some context');
        t.is(experiment1.setVariantProviderContext.calledWith('some context'), true);
    });

test('setConditionContext: Should call setConditionContext for each registered experiment', (t) => {
    const experiment1 = Experiment.define('firstExperiment');
    const experiment2 = Experiment.define('secondExperiment');
    const experiment3 = Experiment.define('thirdExperiment');
    sinon.stub(experiment1, 'setConditionContext');
    sinon.stub(experiment2, 'setConditionContext');
    sinon.stub(experiment3, 'setConditionContext');
    const experiments = Experiments.define()
        .addExperiment(experiment1)
        .addExperiment(experiment2)
        .addExperiment(experiment3);
    experiments.setConditionContext('some context');
    t.is(experiment1.setConditionContext.calledWith('some context'), true);
});

test('getExperiment: should return the experiment if one exists by the requested name', (t) => {
    const experiment = Experiment.define('experiment');
    const experiments = Experiments.define()
        .addExperiment(experiment);
    t.is(experiments.getExperiment('experiment'), experiment);
});

test('getExperiment: should return null if there is no experiment by the requested name', (t) => {
    const experiment = Experiment.define('experiment');
    const experiments = Experiments.define()
        .addExperiment(experiment);
    t.is(experiments.getExperiment('otherexperiment'), null);
});
