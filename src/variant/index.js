import { Experiment } from '../';

class Variant {

    /**
     * @type {string}
     */
    static DEFAULT_PREFIX = 'ab';

    _errMsg = 'Variant:';

    /**
     *
     * @param {Object?} ErrorType
     * @param {string?} errMsg
     * @private
     */
    static _throwError(ErrorType, errMsg) {
        if (process.env.NODE_ENV === 'production') {
            // TODO: log error
            return;
        }
        const Err = ErrorType || Error;
        throw new Err(errMsg || 'An unknown error has occurred');
    }

    /**
     *
     * @param {{}} config
     * @param {string} errMsg
     * @private
     */
    static _validateConfigObject(config, errMsg) {
        if (typeof config !== 'object') {
            Variant._throwError(TypeError,
                `${errMsg} "config" argument must be an object. it is: "${typeof config}`);
        }
    }

    /**
     *
     * @param {string} name
     * @param {string} errMsg
     * @private
     */
    static _validateName(name, errMsg) {
        if (typeof name !== 'string') {
            Variant._throwError(TypeError,
                `${errMsg} "name" property must be a string. it is: "${typeof name}`);
            return;
        }
        if (name.trim() === '') {
            Variant._throwError(RangeError,
                `${errMsg} "name" property must not be an empty string.`);
        }
    }

    /**
     *
     * @param {boolean|Function} condition
     * @param {string} errMsg
     * @private
     */
    static _validateCondition(condition, errMsg) {
        if (typeof condition !== 'function' && typeof condition !== 'boolean') {
            Variant._throwError(TypeError,
                `${errMsg} "condition" property must be a function or a boolean. it is: "${typeof condition}"`);
        }
    }

    /**
     *
     * @param {{[key]: boolean}} featureToggle
     * @param {string} errMsg
     * @private
     */
    static _validateFeaturesToggles(featureToggle, errMsg) {
        Object.keys(featureToggle).some((key) => {
            if (typeof featureToggle[key] !== 'boolean') {
                Variant._throwError(TypeError,
                    `${errMsg} All key value types on "featureToggle" property must be boolean. Key "${key}" value type is ${typeof featureToggle[key]}`);
                return true;
            }
            return false;
        });
    }

    /**
     *
     * @param {Experiment} experiment
     * @param {string} errMsg
     * @private
     */
    static _validateExperiment(experiment, errMsg) {
        if (!(experiment instanceof Experiment)) {
            Variant._throwError(TypeError,
                `${errMsg} "experiment" must be an instance of Experiment.`);
        }
    }

    /**
     * Duplication is done so the instance object can will not be affected by changes
     * @param {{[key]: boolean}} featuresToggle
     * @returns {{[key]: boolean}}
     * @private
     */
    static _duplicateFeatureToggles(featuresToggle) {
        /* eslint-disable no-param-reassign */
        return Object.keys(featuresToggle).reduce((obj, key) => {
            obj[key] = featuresToggle[key];
            return obj;
        }, {});
    }

    /**
     * Takes a featureToggle name and returns it in a 'showFeature' format
     * @param {string} featureName
     * @return {string}
     * @private
     */
    _getNormalizedFeatureName(featureName) {
        return `${this._prefix}${featureName.substring(0, 1).toUpperCase()}${featureName.substring(
            1)}`;
    }

    /**
     * @param {{name: string, featuresToggle?: {[key]: boolean}, condition?: boolean|Function }} config
     */
    constructor(config) {
        const errMsg = `${this._errMsg} constructor:`;
        Variant._validateConfigObject(config, errMsg);
        Variant._validateName(config.name, errMsg);
        this._name = config.name;
        if ('condition' in config) {
            Variant._validateCondition(config.condition, errMsg);
            this._condition = config.condition;
        }
        if ('featuresToggle' in config) {
            Variant._validateFeaturesToggles(config.featuresToggle, errMsg);
            this._featuresToggle = Variant._duplicateFeatureToggles(config.featuresToggle);
        }
    }

    /**
     * @returns {string}
     */
    get name() {
        return this._name;
    }

    /**
     * Returns the result of a condition function or the value of the condition.
     * @returns {boolean}
     */
    get condition() {
        if (!('_condition' in this)) {
            return true;
        }

        if (typeof this._condition === 'function') {
            return !!this._condition();
        }

        return this._condition;
    }

    /**
     * Returns a duplicate of featureToggles object
     * @returns {{[key]: boolean}}
     */
    get featuresToggle() {
        if (!('_featuresToggle' in this)) {
            return {};
        }

        return Variant._duplicateFeatureToggles(this._featuresToggle);
    }

    /**
     * Returns a prefix for features list. It tries to get the prefix from the registered
     * experiment config. If it fails it returns the default prefix.
     * @returns {string}
     * @private
     */
    get _prefix() {
        const configPrefix = this._experiment && this._experiment.config &&
            this._experiment.config.prefix;
        return configPrefix || Variant.DEFAULT_PREFIX;
    }

    /**
     * Creates a new Variant
     * @param {string} name
     * @param {{[key]: boolean}?} featuresToggle
     * @param {boolean|Function?} condition
     * @returns {Variant}
     */
    static define(name, featuresToggle, condition) {
        const config = {
            name,
        };

        if (typeof featuresToggle !== 'undefined') {
            config.featuresToggle = featuresToggle;
        }

        if (typeof condition !== 'undefined') {
            config.condition = condition;
        }

        return new Variant(config);
    }

    /**
     * Sets a condition to the Variant
     * @param {boolean|Function} condition
     * @returns {Variant}
     */
    setCondition(condition) {
        const errMsg = `${this._errMsg} setCondition:`;
        Variant._validateCondition(condition, errMsg);
        this._condition = condition;
        return this;
    }

    /**
     * Adds or sets a feature toggle
     * @param {string} name
     * @param {boolean} state
     * @returns {Variant}
     */
    addFeatureToggle(name, state) {
        const errMsg = `${this._errMsg} addFeatureToggle:`;
        Variant._validateName(name, errMsg);
        this._featuresToggle = this._featuresToggle || {};
        this._featuresToggle[name] = state;
        return this;
    }

    /**
     * returns an object with normalized feature names and states.
     * It should return an empty object if condition is false.
     * @returns {{[key]: boolean}}
     */
    getFeaturesMap() {
        if (this.condition) {
            return Object.keys(this.featuresToggle).reduce((obj, key) => {
                obj[this._getNormalizedFeatureName(key)] = this.featuresToggle[key];
                return obj;
            }, {});
        }
        return {};
    }

    /**
     * Registers an experiment. Should be automatically consumed when using experiment.addVariant
     * @param {Experiment} experiment
     */
    registerExperiment(experiment) {
        Variant._validateExperiment(experiment, `${this._errMsg} registerExperiment:`);
        this._experiment = experiment;
    }
}

export default Variant;
