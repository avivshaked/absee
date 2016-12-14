/* eslint-disable no-new */
import test from 'ava';
import sinon from 'sinon';
import Variant from './';

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
    const variant = Variant.define('someVariant');
    variant._logger = { error };
    variant._throwError(Error, 'some message');
    t.is(variant._logger.error.calledWith('some message'), true);
});

test('_throwError should throw when not in production', (t) => {
    const variant = Variant.define('someVariant');
    t.throws(() => variant._throwError(), Error);
});

test('_throwError should throw Error Type of the received error type', (t) => {
    const variant = Variant.define('someVariant');
    t.throws(() => variant._throwError(RangeError), RangeError);
});

test('_throwError should throw an error message based on the received error message', (t) => {
    const variant = Variant.define('someVariant');
    t.throws(() => variant._throwError(RangeError, 'test error message'), 'test error message');
});

test('_validateConfigObject should call _throwError if config argument is invalid', (t) => {
    const variant = Variant.define('someVariant');
    sinon.stub(variant, '_throwError');
    variant._validateObject('not an object', 'errMsg');
    t.is(variant._throwError.called, true, '_throwError was called');
    t.is(variant._throwError.args[0][0], TypeError, '_throwError was called with TypeError');
    t.regex(variant._throwError.args[0][1], /argument must be an object/);
});

test('_validateName should call _throwError if name property is invalid', (t) => {
    const variant = Variant.define('someVariant');
    sinon.stub(variant, '_throwError');
    variant._validateName({ not: 'a string' }, 'errMsg');
    t.is(variant._throwError.called, true, '_throwError was called');
    t.is(variant._throwError.args[0][0], TypeError, '_throwError was called with TypeError');
    t.regex(variant._throwError.args[0][1], /"name" property must be a string/);
    variant._throwError.reset();
    variant._validateName('', 'errMsg');
    t.is(variant._throwError.called, true, '_throwError was called');
    t.is(variant._throwError.args[0][0], RangeError, '_throwError was called with RangeError');
    t.regex(variant._throwError.args[0][1], /"name" property must not be an empty string/);
});

test('_validateExperiment: should call _throwError if experiment is invalid', (t) => {
    const variant = Variant.define('someVariant');
    sinon.stub(variant, '_throwError');
    const experiment = 'not a experiment';
    variant._validateExperiment(experiment);
    t.is(variant._throwError.called, true, '_throwError was called');
    t.is(variant._throwError.args[0][0], TypeError, '_throwError was called with TypeError');
    t.regex(variant._throwError.args[0][1], /"experiment" must be an instance of Experiment/);
});

const constructorTestsSetup = () => {
    sinon.stub(Variant.prototype, '_validateObject');
    sinon.stub(Variant.prototype, '_validateName');
};
const constructorTestTeardown = () => {
    Variant.prototype._validateName.restore();
    Variant.prototype._validateObject.restore();
};

test('constructor: should call _validateName', (t) => {
    constructorTestsSetup();
    const variant = new Variant('some variant');
    t.is(variant._validateName.calledWith('some variant'), true);
    constructorTestTeardown();
});

test('constructor: should call _validateObject', (t) => {
    constructorTestsSetup();
    const state = {};
    const variant = new Variant('some variant', state);
    t.is(variant._validateObject.calledWith(state), true);
    constructorTestTeardown();
});

test('constructor: should create an instance based on provided arguments', (t) => {
    constructorTestsSetup();
    const logger = () => {};
    const setup = {
        name: 'name',
        config: {
            'some': 'config',
            'logger': logger,
        },
        state: {
            'some': 'state',
        },
    };
    const { name, config, state } = setup;
    const variant = new Variant(name, state, config);
    t.is(variant._name, name);
    t.is(variant._state, state);
    t.is(variant._config, config);
    t.is(variant._logger, logger);
    constructorTestTeardown();
});

test('instance getters', (t) => {
    constructorTestsSetup();
    const setup = {
        name: 'name',
        config: {
            'some': 'config',
        },
        state: {
            'some': 'state',
        },
    };
    const { name, config, state } = setup;
    const variant = new Variant(name, state, config);

    t.is(variant.name, variant._name);
    t.not(variant.config, variant._config);
    t.not(variant.state, variant._state);
    t.deepEqual(variant.config, variant._config);
    t.deepEqual(variant.state, variant._state);
    constructorTestTeardown();
});

test('define: should return an instance', (t) => {
    const setup = {
        name: 'name',
        config: {
            'some': 'config',
        },
        state: {
            'some': 'state',
        },
    };
    const { name, config, state } = setup;
    const variant = new Variant(name, state, config);
    const compareVariant = Variant.define(name, state, config);
    t.is(JSON.stringify(variant), JSON.stringify(compareVariant));
});

test('registerExperiment: should call _validateExperiment', (t) => {
    const variant = Variant.define('someVariant');
    sinon.stub(variant, '_validateExperiment');
    variant.registerExperiment('not an experiment');
    t.is(variant._validateExperiment.calledWith('not an experiment'), true);
});

test('registerExperiment: should place the experiment on this._experiment', (t) => {
    const variant = Variant.define('someVariant');
    sinon.stub(variant, '_validateExperiment');
    variant.registerExperiment('some experiment');
    t.is(variant._experiment, 'some experiment');
});

/* eslint-enable no-new */
