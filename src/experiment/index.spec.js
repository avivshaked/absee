import test from 'ava';
import sinon from 'sinon';
import Experiment from './';
import { Variant, Experiments } from '../';

let env;
test.beforeEach(() => {
    env = process.env.NODE_ENV;
    process.env.NODE_ENV = 'not-production';
});

test.afterEach(() => {
    process.env.NODE_ENV = env;
});

test('_throwError should do nothing when in production env', (t) => {
    process.env.NODE_ENV = 'production';
    Experiment._throwError();
    t.pass('No errors were thrown');
});

test('_throwError should throw when not in production', (t) => {
    t.throws(() => Experiment._throwError(), Error);
});

test('_throwError should throw Error Type of the received error type', (t) => {
    t.throws(() => Experiment._throwError(RangeError), RangeError);
});

test('_throwError should throw an error message based on the received error message', (t) => {
    t.throws(() => Experiment._throwError(RangeError, 'test error message'), 'test error message');
});

test('_validateName should call _throwError if name property is invalid', (t) => {
    sinon.stub(Experiment, '_throwError');
    Experiment._validateName({ not: 'a string' }, 'errMsg');
    t.is(Experiment._throwError.called, true, '_throwError was called');
    t.is(Experiment._throwError.args[0][0], TypeError, '_throwError was called with TypeError');
    t.regex(Experiment._throwError.args[0][1], /"name" must be a string/);
    Experiment._throwError.reset();
    Experiment._validateName('', 'errMsg');
    t.is(Experiment._throwError.called, true, '_throwError was called');
    t.is(Experiment._throwError.args[0][0], RangeError, '_throwError was called with RangeError');
    t.regex(Experiment._throwError.args[0][1], /"name" must not be an empty string/);
    Experiment._throwError.restore();
});

test('_validateVariant should call _throwError if variant is invalid', (t) => {
    sinon.stub(Experiment, '_throwError');
    const variant = 'not a variant';
    Experiment._validateVariant(variant);
    t.is(Experiment._throwError.called, true, '_throwError was called');
    t.is(Experiment._throwError.args[0][0], TypeError, '_throwError was called with TypeError');
    t.regex(Experiment._throwError.args[0][1], /"variant" must be an instance of Variant/);
    Experiment._throwError.restore();
});

test('_validateExperiments should call _throwError if experiments is invalid', (t) => {
    sinon.stub(Experiment, '_throwError');
    const experiments = 'not a experiments';
    Experiment._validateExperiments(experiments);
    t.is(Experiment._throwError.called, true, '_throwError was called');
    t.is(Experiment._throwError.args[0][0], TypeError, '_throwError was called with TypeError');
    t.regex(Experiment._throwError.args[0][1], /"experiments" must be an instance of Experiments/);
    Experiment._throwError.restore();
});

test('_validateCondition should call _throwError if condition property is invalid', (t) => {
    sinon.stub(Experiment, '_throwError');
    Experiment._validateCondition('not a function or boolean', 'errMsg');
    t.is(Experiment._throwError.called, true, '_throwError was called');
    t.is(Experiment._throwError.args[0][0], TypeError, '_throwError was called with TypeError');
    t.regex(Experiment._throwError.args[0][1],
        /"condition" property must be a function or a boolean/);
    Experiment._throwError.restore();
});

test('constructor: should validate "name" and return an instance', (t) => {
    sinon.stub(Experiment, '_validateName');
    const instance = Experiment.define('experiment');
    t.is(Experiment._validateName.called, true, '_validateName is called');
    t.is(instance instanceof Experiment, true, 'an instance is returned');
    t.is(instance instanceof Experiment, true, 'an instance is returned');
    // t.is(instance._name, 'experiment');
    t.is(instance.name, 'experiment');
    Experiment._validateName.restore();
});

test('addVariant: should add a new variant', (t) => {
    const experiment = Experiment.define('experiment');
    const variant = Variant.define('someVariant');
    sinon.stub(variant, 'registerExperiment');
    experiment.addVariant(variant);
    t.is(experiment._variants.someVariant, variant);
});

test('addVariant: should call registerExperiment with the experiment instance', (t) => {
    const experiment = Experiment.define('experiment');
    const variant = Variant.define('someVariant');
    sinon.stub(variant, 'registerExperiment');
    experiment.addVariant(variant);
    t.is(variant.registerExperiment.calledWith(experiment), true);
});

test('getVariant: should return the requested variant or null', (t) => {
    const experiment = Experiment.define('experiment');
    const variant = Variant.define('someVariant');
    sinon.stub(variant, 'registerExperiment');
    experiment.addVariant(variant);
    t.is(experiment.getVariant('someVariant'), variant);
    t.is(experiment.getVariant('someVariantThatDoesntExist'), null);
});

test('getFeaturesMap: should call variant\'s getFeaturesMap', (t) => {
    const variant = Variant.define('someVariant');
    sinon.stub(variant, 'registerExperiment');
    const experiment = Experiment.define('someExperiment').addVariant(variant);
    sinon.stub(variant, 'getFeaturesMap');
    experiment.getFeaturesMap('someVariant');
    t.is(variant.getFeaturesMap.called, true);
});

test('getFeaturesMap: should return variant\'s getFeaturesMap if variant is found', (t) => {
    const variant = Variant.define('someVariant');
    sinon.stub(variant, 'registerExperiment');
    const experiment = Experiment.define('someExperiment').addVariant(variant);
    const returnedObj = { showSomeFeature: true };
    sinon.stub(variant, 'getFeaturesMap', () => returnedObj);
    t.is(experiment.getFeaturesMap('someVariant'), returnedObj);
});

test('getFeaturesMap: should return an empty object if the variant is not found', (t) => {
    const variant = Variant.define('someVariant');
    sinon.stub(variant, 'registerExperiment');
    const experiment = Experiment.define('someExperiment').addVariant(variant);
    const returnedObj = { showSomeFeature: true };
    sinon.stub(variant, 'getFeaturesMap', () => returnedObj);
    t.deepEqual(experiment.getFeaturesMap('someNonExistingVariant'), {});
});

test('get config: should return a copy of the current config if no "experiments" is registered',
    (t) => {
        const experiment = Experiment.define('someExperiment', { prop: 'value' });
        t.deepEqual(experiment.config, { prop: 'value' },
            'returns a config that is equal to the given config');
        t.not(experiment._config, experiment.config,
            'returns a config that is not the original object');
    });

test(
    'get config: should return the current config merged with the "experiments" config if registered',
    (t) => {
        const defaultConfig = Experiments._defaultConfig;
        Experiments._defaultConfig = {};
        const experiment = Experiment.define('someExperiment', { propB: 'some other value' });
        sinon.stub(Experiments, '_validateExperiment');
        Experiments.define({ propA: 'some value', propB: 'some value' })
            .addExperiment(experiment);

        t.deepEqual(experiment.config, { propA: 'some value', propB: 'some other value' });
        Experiments._defaultConfig = defaultConfig;
        Experiments._validateExperiment.restore();
    });

test('setCondition: should call validateCondition with the set condition', (t) => {
    sinon.stub(Experiment, '_validateCondition');
    const experiment = Experiment.define('experiment');
    experiment.setCondition('someCondition');
    t.is(Experiment._validateCondition.calledWith('someCondition'), true);
    Experiment._validateCondition.restore();
});

test('setCondition: should add a condition to the experiment', (t) => {
    sinon.stub(Experiment, '_validateCondition');
    const experiment = Experiment.define('experiment');
    experiment.setCondition('someCondition');
    t.is(experiment._condition, 'someCondition');
    Experiment._validateCondition.restore();
});

test('setCondition: should return the instance', (t) => {
    sinon.stub(Experiment, '_validateCondition');
    const experiment = Experiment.define('experiment');
    t.is(experiment.setCondition('someCondition'), experiment);
    Experiment._validateCondition.restore();
});

test('setConditionContext: should store received argument in _conditionContext', (t) => {
    const experiment = Experiment.define('experiment');
    experiment.setConditionContext('some context');
    t.is(experiment._conditionContext, 'some context');
});

test('setConditionContext: should return the experiment instance', (t) => {
    const experiment = Experiment.define('experiment');
    t.is(experiment.setConditionContext('some context'), experiment);
});

test('setConditionContext: should not set condition if shouldOverride argument is set to false',
    (t) => {
        const experiment = Experiment.define('experiment');
        experiment._conditionContext = 'some old context';
        experiment.setConditionContext('some new context', false);
        t.is(experiment._conditionContext, 'some old context');
    });

test('get condition: should return true if no condition was set', (t) => {
    const experiment = Experiment.define('experiment');
    t.is(experiment.condition, true);
});

test('get condition: should call the condition with _conditionContext if one exists', (t) => {
    const experiment = Experiment.define('experiment');
    experiment._condition = sinon.stub();
    experiment._conditionContext = 'some context';
    (() => experiment.condition)();
    t.is(experiment._condition.calledWith('some context'), true);
});

test('get condition: should return a boolean cast of the invocation of the fn', (t) => {
    const experiment = Experiment.define('experiment');
    experiment._condition = () => 1;
    t.is(experiment.condition, true, 'when condition is evaluates to "truthy"');
    experiment._condition = () => 0;
    t.is(experiment.condition, false, 'when condition is evaluates to "falsy"');
});

test('get condition: should return _condition if set and boolean', (t) => {
    const experiment = Experiment.define('experiment');
    experiment._condition = true;
    t.is(experiment.condition, true, 'when condition is evaluates to true');
    experiment._condition = false;
    t.is(experiment.condition, false, 'when condition is evaluates to false');
});

test('setVariantProvider: should add function to _variantProvider', (t) => {
    const experiment = Experiment.define('experiment');
    experiment.setVariantProvider('someProviderFn');
    t.is(experiment._variantProvider, 'someProviderFn');
});

test('setVariantProvider: should return the instance', (t) => {
    const experiment = Experiment.define('experiment');
    t.is(experiment.setVariantProvider('someProviderFn'), experiment);
});

test('setVariantProviderContext: should set received argument to _variantProviderContext', (t) => {
    const experiment = Experiment.define('experiment');
    experiment.setVariantProviderContext('some context');
    t.is(experiment._variantProviderContext, 'some context');
});

test('setVariantProviderContext: should return the instance', (t) => {
    const experiment = Experiment.define('experiment');
    t.is(experiment.setVariantProviderContext('some context'), experiment);
});

test('setVariantProviderContext: should not set context if shouldOverride argument is set to false',
    (t) => {
        const experiment = Experiment.define('experiment');
        experiment._variantProviderContext = 'some old context';
        experiment.setVariantProviderContext('some new context', false);
        t.is(experiment._variantProviderContext, 'some old context');
    });

test('getLiveVariant: should return a promise that resolves to null if ' +
    'condition evaluates to false', async (t) => {
    const experiment = Experiment.define('experiment')
        .setCondition(false);
    const result = await experiment.getLiveVariant();
    t.is(result, null);
});

test('getLiveVariant: should return a promise that resolves to null if no _variantProvider',
    async (t) => {
        const experiment = Experiment.define('experiment');
        const result = await experiment.getLiveVariant();
        t.is(result, null);
    });

test('getLiveVariant: should call _variantProvider', async (t) => {
    const experiment = Experiment.define('experiment')
        .setVariantProvider(sinon.stub());
    await experiment.getLiveVariant();
    t.is(experiment._variantProvider.called, true);
});

test('getLiveVariant: should call _variantProvider with variantProviderContext if exists',
    async (t) => {
        const experiment = Experiment.define('experiment')
            .setVariantProvider(sinon.stub());
        experiment._variantProviderContext = 'some context';
        await experiment.getLiveVariant();
        t.is(experiment._variantProvider.calledWith('some context'), true);
    });

test('getLiveVariant: should return a promise that resolves to getVariantFn', async (t) => {
    const experiment = Experiment.define('experiment');
    experiment._variantProvider = () => 'returnFromVariantProvider';
    const result = await experiment.getLiveVariant();
    t.is(result, 'returnFromVariantProvider');
});

test('getLiveExperiment: should return null if there is an error in getVariantFn', async (t) => {
    const experiment = Experiment.define('experiment');
    experiment._variantProvider = () => {
        throw new Error();
    };
    const result = await experiment.getLiveVariant();
    t.is(result, null);
});

test('getLiveExperiment: should call getLiveVariant', (t) => {
    const experiment = Experiment.define('experiment');
    sinon.stub(experiment, 'getLiveVariant', () => Promise.resolve('good'));
    experiment.getLiveExperiment()
        .then(() => {
            t.is(experiment.getLiveVariant.called, true);
        });
});

test('getLiveExperiment: should resolve to null if there is an error', async (t) => {
    const experiment = Experiment.define('experiment');
    sinon.stub(experiment, 'getLiveVariant', () => {
        throw new Error();
    });
    const res = await experiment.getLiveExperiment();
    t.is(res, null);
});

test('getLiveExperiment: should resolve to null if getLiveVariant resolves to null', async (t) => {
    const experiment = Experiment.define('experiment');
    sinon.stub(experiment, 'getLiveVariant', () => null);
    const res = await experiment.getLiveExperiment();
    t.is(res, null);
});

test('getLiveExperiment: should return an object with the experiment name and requested fields',
    async (t) => {
        const experiment = Experiment.define('experiment');
        sinon.stub(experiment, 'getLiveVariant', () => {
            return { a: 'some value', b: 'some other value' };
        });
        const res = await experiment.getLiveExperiment(['a']);
        t.deepEqual(res, {
            experimentName: 'experiment',
            a: 'some value',
        });
    });
