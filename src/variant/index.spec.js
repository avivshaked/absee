/* eslint-disable no-new */
import test from 'ava';
import sinon from 'sinon';
import Variant from './';
import { Experiment } from '../';

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
    Variant._throwError();
    t.pass('No errors were thrown');
});

test('_throwError should throw when not in production', (t) => {
    t.throws(() => Variant._throwError(), Error);
});

test('_throwError should throw Error Type of the received error type', (t) => {
    t.throws(() => Variant._throwError(RangeError), RangeError);
});

test('_throwError should throw an error message based on the received error message', (t) => {
    t.throws(() => Variant._throwError(RangeError, 'test error message'), 'test error message');
});

test('_validateConfigObject should call _throwError if config argument is invalid', (t) => {
    sinon.stub(Variant, '_throwError');
    Variant._validateConfigObject('not an object', 'errMsg');
    t.is(Variant._throwError.called, true, '_throwError was called');
    t.is(Variant._throwError.args[0][0], TypeError, '_throwError was called with TypeError');
    t.regex(Variant._throwError.args[0][1], /"config" argument must be an object/);
    Variant._throwError.restore();
});

test('_validateName should call _throwError if name property is invalid', (t) => {
    sinon.stub(Variant, '_throwError');
    Variant._validateName({ not: 'a string' }, 'errMsg');
    t.is(Variant._throwError.called, true, '_throwError was called');
    t.is(Variant._throwError.args[0][0], TypeError, '_throwError was called with TypeError');
    t.regex(Variant._throwError.args[0][1], /"name" property must be a string/);
    Variant._throwError.reset();
    Variant._validateName('', 'errMsg');
    t.is(Variant._throwError.called, true, '_throwError was called');
    t.is(Variant._throwError.args[0][0], RangeError, '_throwError was called with RangeError');
    t.regex(Variant._throwError.args[0][1], /"name" property must not be an empty string/);
    Variant._throwError.restore();
});

test('_validateCondition should call _throwError if condition property is invalid', (t) => {
    sinon.stub(Variant, '_throwError');
    Variant._validateCondition('not a function or boolean', 'errMsg');
    t.is(Variant._throwError.called, true, '_throwError was called');
    t.is(Variant._throwError.args[0][0], TypeError, '_throwError was called with TypeError');
    t.regex(Variant._throwError.args[0][1], /"condition" property must be a function or a boolean/);
    Variant._throwError.restore();
});

test('_validateFeaturesToggles should call _throwError if featureToggle property is invalid', (t) => {
    sinon.stub(Variant, '_throwError');
    Variant._validateFeaturesToggles({ key1: true, key2: 'not boolean' }, 'errMsg');
    t.is(Variant._throwError.called, true, '_throwError was called');
    t.is(Variant._throwError.args[0][0], TypeError, '_throwError was called with TypeError');
    t.regex(Variant._throwError.args[0][1],
        /All key value types on "featureToggle" property must be boolean/);
    Variant._throwError.restore();
});

test('_validateExperiment: should call _throwError if experiment is invalid', (t) => {
    sinon.stub(Variant, '_throwError');
    const experiment = 'not a experiment';
    Variant._validateExperiment(experiment);
    t.is(Variant._throwError.called, true, '_throwError was called');
    t.is(Variant._throwError.args[0][0], TypeError, '_throwError was called with TypeError');
    t.regex(Variant._throwError.args[0][1], /"experiment" must be an instance of Experiment/);
    Variant._throwError.restore();
});

test('_duplicateFeatureToggles should not return the same object', (t) => {
    const featuresToggle = {
        componentA: true,
        componentB: true,
    };
    t.not(Variant._duplicateFeatureToggles(featuresToggle), featuresToggle);
});

test('_duplicateFeatureToggles should return a duplicated object of own properties', (t) => {
    const featuresToggle = {
        componentA: true,
        componentB: true,
    };
    t.deepEqual(Variant._duplicateFeatureToggles(featuresToggle), featuresToggle);
});

const constructorTestsSetup = () => {
    sinon.stub(Variant, '_validateConfigObject');
    sinon.stub(Variant, '_validateName');
    sinon.stub(Variant, '_validateCondition');
    sinon.stub(Variant, '_validateFeaturesToggles');
    sinon.stub(Variant, '_duplicateFeatureToggles', (featuresToggle) => {
        return featuresToggle;
    });
};
const constructorTestTeardown = () => {
    Variant._validateConfigObject.restore();
    Variant._validateName.restore();
    Variant._validateCondition.restore();
    Variant._validateFeaturesToggles.restore();
    Variant._duplicateFeatureToggles.restore();
};

test('constructor: should call _validateConfigObject', (t) => {
    constructorTestsSetup();
    const config = {};
    const errMsg = 'Variant: constructor:';
    new Variant(config);
    t.is(Variant._validateConfigObject.calledWith(config, errMsg), true);
    constructorTestTeardown();
});

test('constructor: should call _validateName', (t) => {
    constructorTestsSetup();
    const config = { name: 'name' };
    const errMsg = 'Variant: constructor:';
    new Variant(config);
    t.is(Variant._validateName.calledWith('name', errMsg), true);
    constructorTestTeardown();
});

test('constructor: should call _validateCondition if there\'s a condition', (t) => {
    constructorTestsSetup();
    const config = { name: 'name', condition: 'condition' };
    const errMsg = 'Variant: constructor:';
    new Variant(config);
    t.is(Variant._validateCondition.calledWith('condition', errMsg), true);
    constructorTestTeardown();
});

test('constructor: should call _validateFeaturesToggles if there\'s a featuresToggle', (t) => {
    constructorTestsSetup();
    const config = { name: 'name', condition: 'condition', featuresToggle: 'featuresToggle' };
    const errMsg = 'Variant: constructor:';
    new Variant(config);
    t.is(Variant._validateFeaturesToggles.calledWith('featuresToggle', errMsg), true);
    constructorTestTeardown();
});

test('constructor: should call _duplicateFeatureToggles if there\'s a featuresToggle', (t) => {
    constructorTestsSetup();
    const config = { name: 'name', condition: 'condition', featuresToggle: 'featuresToggle' };
    new Variant(config);
    t.is(Variant._duplicateFeatureToggles.calledWith('featuresToggle'), true);
    constructorTestTeardown();
});

test('constructor: should create an instance based on provided config object', (t) => {
    constructorTestsSetup();
    const config = {
        name: 'name',
        condition: () => {
            return true;
        },
        featuresToggle: {
            componentA: true,
            componentB: true,
        },
    };
    const variant = new Variant(config);
    t.is(variant._name, config.name, true);
    t.is(variant._condition, config.condition, true);
    t.deepEqual(variant._featuresToggle, {
        componentA: true,
        componentB: true,
    }, true);
    constructorTestTeardown();
});

test('instance getters', (t) => {
    constructorTestsSetup();
    const config = {
        name: 'name',
        condition: true,
        featuresToggle: {
            componentA: true,
            componentB: true,
        },
    };
    const variant = new Variant(config);
    t.is(variant.name, config.name, 'name getter');
    t.is(variant.condition, config.condition, 'condition boolean getter');
    variant._condition = () => true;
    t.is(variant.condition, true, 'condition function getter');
    delete variant._condition;
    t.is(variant.condition, true, 'condition getter returns true when no _condition');
    t.deepEqual(variant.featuresToggle, {
        componentA: true,
        componentB: true,
    }, true);
    delete variant._featuresToggle;
    t.deepEqual(variant.featuresToggle, {},
        'featuresToggle returns an empty object when no _featuresToggle');
    constructorTestTeardown();
});

test('define: should return an instance', (t) => {
    let variant;
    variant = Variant.define('name');
    t.is(variant._name, 'name', 'Instance has a "_name" property');
    t.is('_featuresToggle' in variant, false, 'Instance has a no "_featuresToggle"');
    t.is('_condition' in variant, false, 'Instance has a no "_condition"');

    variant = Variant.define('name', { component: true });
    t.deepEqual(variant._featuresToggle, { component: true },
        'Instance has a "_featuresToggle" property');
    t.is('_condition' in variant, false, 'Instance has a no "_condition"');

    variant = Variant.define('name', {}, true);
    t.is(variant._condition, true, 'Instance has a "_condition" property');
});

test('setCondition: should validate, set a condition, and return an instance', (t) => {
    sinon.stub(Variant, '_validateCondition');
    const variant = Variant.define('name');
    const setConditionReturn = variant.setCondition(false);
    t.is(Variant._validateCondition.called, true, '_validateCondition is called');
    t.is(variant._condition, false, 'a condition is set');
    t.is(setConditionReturn, variant, 'returns the instance');
    Variant._validateCondition.restore();
});

test('addFeatureToggle: should validate, set a key, and return an instance', (t) => {
    sinon.stub(Variant, '_validateName');
    const variant = Variant.define('name');
    const setFeatureReturn = variant.addFeatureToggle('component', true);
    t.is(Variant._validateName.called, true, '_validateName is called');
    t.is(variant._featuresToggle.component, true, 'a toggle is set');
    t.is(setFeatureReturn, variant, 'returns the instance');
    Variant._validateName.restore();
});

test('_getNormalizedFeatureName: should return any feature name in a "showFeature" format', (t) => {
    const variant = Variant.define('variant');
    t.is(variant._getNormalizedFeatureName('someFeature'), 'abSomeFeature');
});

test('getFeaturesMap: returns an object with normalized feature names and states', (t) => {
    let variant = Variant.define('someVariant')
        .addFeatureToggle('header', true)
        .addFeatureToggle('content', false)
        .addFeatureToggle('footer', true);
    t.deepEqual(variant.getFeaturesMap(), {
        abHeader: true,
        abContent: false,
        abFooter: true,
    }, 'without condition set');

    variant = Variant.define('someVariant')
        .setCondition(true)
        .addFeatureToggle('header', true)
        .addFeatureToggle('content', false)
        .addFeatureToggle('footer', true);
    t.deepEqual(variant.getFeaturesMap(), {
        abHeader: true,
        abContent: false,
        abFooter: true,
    }, 'with condition set to true');

    variant = Variant.define('someVariant')
        .setCondition(() => true)
        .addFeatureToggle('header', true)
        .addFeatureToggle('content', false)
        .addFeatureToggle('footer', true);
    t.deepEqual(variant.getFeaturesMap(), {
        abHeader: true,
        abContent: false,
        abFooter: true,
    }, 'with condition as function that evaluates to true');
});

test('getFeaturesMap: returns an empty object when condition is false', (t) => {
    let variant = Variant.define('someVariant')
        .setCondition(false)
        .addFeatureToggle('header', true)
        .addFeatureToggle('content', false)
        .addFeatureToggle('footer', true);
    t.deepEqual(variant.getFeaturesMap(), {}, 'with condition set to false');

    variant = Variant.define('someVariant')
        .setCondition(() => false)
        .addFeatureToggle('header', true)
        .addFeatureToggle('content', false)
        .addFeatureToggle('footer', true);
    t.deepEqual(variant.getFeaturesMap(), {},
        'with condition as function that evaluates to false');
});

test('get _prefix: should return the default prefix if no experiment is registered', (t) => {
    const variant = Variant.define('variant');
    t.is(variant._prefix, Variant.DEFAULT_PREFIX);
});

test('get _prefix: should return the _experiment config if an experiment is registered', (t) => {
    const config = {
        prefix: 'somePrefix',
    };
    const experiment = Experiment.define('experiment', config);
    const variant = Variant.define('variant');
    variant._experiment = experiment;
    t.is(variant._prefix, 'somePrefix');
});

test('get _prefix: should return the default prefix if an experiment is registered but has ' +
    'no config or no config.prefix', (t) => {
    const config = {};
    const experiment = Experiment.define('experiment', config);
    const variant = Variant.define('variant');
    variant._experiment = experiment;
    t.is(variant._prefix, Variant.DEFAULT_PREFIX);
});

test('registerExperiment: should register a given experiment', (t) => {
    const experiment = Experiment.define('experiment');
    const variant = Variant.define('variant');
    sinon.stub(Variant, '_validateExperiment');
    variant.registerExperiment(experiment);
    t.is(variant._experiment, experiment);
    Variant._validateExperiment.restore();
});

test('registerExperiment: should call _validateExperiment provided experiment', (t) => {
    const experiment = Experiment.define('experiment');
    const variant = Variant.define('variant');
    sinon.stub(Variant, '_validateExperiment');
    variant.registerExperiment(experiment);
    t.is(Variant._validateExperiment.calledWith(experiment), true);
    Variant._validateExperiment.restore();
});
/* eslint-enable no-new */
