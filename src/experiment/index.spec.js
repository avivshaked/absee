import test from 'ava';
import sinon from 'sinon';
import Experiment from './';
import { Variant } from '../';

let env;
test.beforeEach(() => {
    env = process.env.NODE_ENV;
    process.env.NODE_ENV = 'not-production';
});

test.afterEach(() => {
    process.env.NODE_ENV = env;
});

test('_throwError should call logger when in production', (t) => {
    process.env.NODE_ENV = 'production';
    const error = sinon.stub();
    const experiment = Experiment.define('someExperiment');
    experiment._logger = { error };
    experiment._throwError(Error, 'some message');
    t.is(experiment._logger.error.calledWith('some message'), true);
});

test('_throwError should throw when not in production', (t) => {
    const experiment = Experiment.define('someExperiment');
    t.throws(() => experiment._throwError(), Error);
});

test('_throwError should throw Error Type of the received error type', (t) => {
    const experiment = Experiment.define('someExperiment');
    t.throws(() => experiment._throwError(RangeError), RangeError);
});

test('_throwError should throw an error message based on the received error message', (t) => {
    const experiment = Experiment.define('someExperiment');
    t.throws(() => experiment._throwError(RangeError, 'test error message'), 'test error message');
});

test('_validateName should call _throwError if name property is invalid', (t) => {
    const experiment = Experiment.define('someExperiment');
    sinon.stub(experiment, '_throwError');
    experiment._validateName({ not: 'a string' }, 'errMsg');
    t.is(experiment._throwError.called, true, '_throwError was called');
    t.is(experiment._throwError.args[0][0], TypeError, '_throwError was called with TypeError');
    t.regex(experiment._throwError.args[0][1], /"name" must be a string/);
    experiment._throwError.reset();
    experiment._validateName('', 'errMsg');
    t.is(experiment._throwError.called, true, '_throwError was called');
    t.is(experiment._throwError.args[0][0], RangeError, '_throwError was called with RangeError');
    t.regex(experiment._throwError.args[0][1], /"name" must not be an empty string/);
});


test('_validateVariant should call _throwError if variant is invalid', (t) => {
    const experiment = Experiment.define('someExperiment');
    sinon.stub(experiment, '_throwError');
    const variant = 'not a variant';
    experiment._validateVariant(variant);
    t.is(experiment._throwError.called, true, '_throwError was called');
    t.is(experiment._throwError.args[0][0], TypeError, '_throwError was called with TypeError');
    t.regex(experiment._throwError.args[0][1], /"variant" must be an instance of Variant/);
    experiment._throwError.restore();
});

test('_validateExperiments should call _throwError if experiments is invalid', (t) => {
    const experiment = Experiment.define('someExperiment');
    sinon.stub(experiment, '_throwError');
    const experiments = 'not a experiments';
    experiment._validateExperiments(experiments);
    t.is(experiment._throwError.called, true, '_throwError was called');
    t.is(experiment._throwError.args[0][0], TypeError, '_throwError was called with TypeError');
    t.regex(experiment._throwError.args[0][1], /"experiments" must be an instance of Experiments/);
    experiment._throwError.restore();
});

test('_validateCondition should call _throwError if condition property is invalid', (t) => {
    const experiment = Experiment.define('someExperiment');
    sinon.stub(experiment, '_throwError');
    experiment._validateCondition('not a function or boolean', 'errMsg');
    t.is(experiment._throwError.called, true, '_throwError was called');
    t.is(experiment._throwError.args[0][0], TypeError, '_throwError was called with TypeError');
    t.regex(experiment._throwError.args[0][1],
        /"condition" property must be a function or a boolean/);
    experiment._throwError.restore();
});

test('constructor: should validate "name" and return an instance', (t) => {
    sinon.stub(Experiment.prototype, '_validateName');
    const instance = Experiment.define('experiment');
    t.is(instance._validateName.called, true, '_validateName is called');
    t.is(instance instanceof Experiment, true, 'an instance is returned');
    t.is(instance.name, 'experiment');
    Experiment.prototype._validateName.restore();
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

test('get config: should return a copy of the current config if no "experiments" is registered',
    (t) => {
        const experiment = Experiment.define('someExperiment', { prop: 'value' });
        t.deepEqual(experiment.config, { prop: 'value' },
            'returns a config that is equal to the given config');
        t.not(experiment._config, experiment.config,
            'returns a config that is not the original object');
    });

test('setCondition: should call validateCondition with the set condition', (t) => {
    const experiment = Experiment.define('experiment');
    sinon.stub(experiment, '_validateCondition');
    experiment.setCondition('someCondition');
    t.is(experiment._validateCondition.calledWith('someCondition'), true);
});

test('setCondition: should add a condition to the experiment', (t) => {
    const experiment = Experiment.define('experiment');
    sinon.stub(experiment, '_validateCondition');
    experiment.setCondition('someCondition');
    t.is(experiment._condition, 'someCondition');
});

test('setCondition: should return the instance', (t) => {
    const experiment = Experiment.define('experiment');
    sinon.stub(experiment, '_validateCondition');
    t.is(experiment.setCondition('someCondition'), experiment);
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

test('get condition: should return false if config has isOff set to true', (t) => {
    const experiment = Experiment.define('experiment', { isOff: true });
    t.is(experiment.condition, false);
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
    sinon.stub(experiment._logger, 'error');
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

test('getVariantState: should return variant.state', (t) => {
    const experiment = Experiment.define('experiment');
    const state1 = { state: 1 };
    const state2 = { state: 2 };
    const variant1 = Variant.define('variant1', state1);
    const variant2 = Variant.define('variant2', state2);
    experiment
        .addVariant(variant1)
        .addVariant(variant2);

    t.deepEqual(experiment.getVariantState('variant1'), state1);
});
