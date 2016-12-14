/* eslint-disable no-console */

import Variant from '../variant';
import Experiments from '../experiments';

class Experiment {

    _errMsg = 'Experiment:';

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
     * @param {string} name
     * @param {string} errMsg
     * @private
     */
    static _validateName(name, errMsg) {
        if (typeof name !== 'string') {
            Experiment._throwError(TypeError,
                `${errMsg} "name" must be a string. it is: "${typeof name}`);
            return;
        }
        if (name.trim() === '') {
            Experiment._throwError(RangeError,
                `${errMsg} "name" must not be an empty string.`);
        }
    }

    /**
     *
     * @param {Variant} variant
     * @param {string} errMsg
     * @private
     */
    static _validateVariant(variant, errMsg) {
        if (!(variant instanceof Variant)) {
            Experiment._throwError(TypeError,
                `${errMsg} "variant" must be an instance of Variant.`);
        }
    }

    /**
     *
     * @param {Experiments} experiments
     * @param {string} errMsg
     * @private
     */
    static _validateExperiments(experiments, errMsg) {
        if (!(experiments instanceof Experiments)) {
            Experiment._throwError(TypeError,
                `${errMsg} "experiments" must be an instance of Experiments.`);
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
            Experiment._throwError(TypeError,
                `${errMsg} "condition" property must be a function or a boolean. it is: "${typeof condition}"`);
        }
    }

    /**
     *
     * @param {string} name
     * @param {{[key]: *}?} config
     */
    constructor(name, config = {}) {
        const errMsg = `${this._errMsg} constructor:`;
        Experiment._validateName(name, errMsg);
        this._name = name;
        this._variants = {};
        this._config = config;
        this._condition = null;
        this._variantProvider = null;
        this._conditionContext = null;
        this._variantProviderContext = null;
        this._logger = config.logger || console;
    }

    /**
     *
     * @returns {string}
     */
    get name() {
        return this._name;
    }

    /**
     *
     * @returns {{[key]: *}}
     */
    get config() {
        if (this._experiments) {
            return {
                ...this._experiments.config,
                ...this._config,
            };
        }
        return {
            ...this._config,
        };
    }

    /**
     * @returns {boolean}
     */
    get condition() {
        if (typeof this._condition === 'function') {
            if (this._conditionContext) {
                return !!this._condition(this._conditionContext);
            }
            return !!this._condition();
        }
        if (this._condition === null) {
            return true;
        }
        return this._condition;
    }

    /**
     * Defines a new Experiment
     * @param {string} name
     * @param {{[key]: *}?} config
     * @returns {Experiment}
     */
    static define(name, config) {
        return new Experiment(name, config);
    }

    /**
     * Adds or sets a variant to the experiment
     * @param {Variant} variant
     * @returns {Experiment}
     */
    addVariant(variant) {
        Experiment._validateVariant(variant, `${this._errMsg} addVariant:`);
        variant.registerExperiment(this);
        this._variants[variant.name] = variant;
        return this;
    }

    /**
     * Gets a variant from the Experiment by the name of the variant
     * @param {string} name
     * @returns {Variant|null}
     */
    getVariant(name) {
        return this._variants[name] || null;
    }

    /**
     * @param {string} variantName
     * @returns {{[key]: boolean}}
     */
    getFeaturesMap(variantName) {
        const variant = this.getVariant(variantName);
        if (variant) {
            return variant.getFeaturesMap();
        }
        return {};
    }

    /**
     * @param {Experiments} experiments
     */
    registerExperiments(experiments) {
        if (experiments) {
            this._experiments = experiments;
        }
    }

    /**
     * This condition will be used to find if this experiment should be used
     * @param {boolean|Function} condition
     * @returns {Experiment}
     */
    setCondition(condition) {
        Experiment._validateCondition(condition, `${this._errMsg} setCondition:`);
        this._condition = condition;
        return this;
    }

    /**
     * The condition context, if present, will be used when evaluating the condition.
     * A condition function will be called with the context.
     * @param {*} conditionContext
     * @param {boolean?} shouldOverride
     * @returns {Experiment}
     */
    setConditionContext(conditionContext, shouldOverride = true) {
        if (!shouldOverride && this._conditionContext) {
            return this;
        }
        this._conditionContext = conditionContext;
        return this;
    }

    /**
     * @param {Function} getVariantFn
     * @returns {Experiment}
     */
    setVariantProvider(getVariantFn) {
        this._variantProvider = getVariantFn;
        return this;
    }

    /**
     * Sets a context to be used when getting the variant with variantProvider.
     * @param {*} variantProviderContext
     * @param {boolean?} shouldOverride
     * @returns {Experiment}
     */
    setVariantProviderContext(variantProviderContext, shouldOverride = true) {
        if (!shouldOverride && this._variantProviderContext) {
            return this;
        }
        this._variantProviderContext = variantProviderContext;
        return this;
    }

    /**
     * Returns the current "live" variant. It calls variantProvider to get the variant name.
     * The variantProvider should either returns a string or return a promise that resolves to
     * a string.
     * @returns {Promise<string>|null}
     */
    getLiveVariant() {
        // If the condition evaluates to false or there is no variant provider, then resolve null
        if (!this.condition || !this._variantProvider) {
            return Promise.resolve(null);
        }

        return Promise.resolve()
            .then(() => {
                if (this._variantProviderContext) {
                    return this._variantProvider(this._variantProviderContext);
                }
                return this._variantProvider();
            })
            .catch((err) => {
                this._logger.error(
                    'Experiment: getLiveVariant: an error occurred when calling _variantProvider',
                    err);
                return null;
            });
    }

    /**
     * Returns an object that describes the current "live" experiment.
     * @param {Array<string>} fieldsList
     * @returns {Promise.<{experimentName: string, variantName: string}>|null}
     */
    getLiveExperiment(fieldsList) {
        return Promise.resolve()
            .then(() => {
                return this.getLiveVariant();
            })
            .then((variant) => {
                if (!variant) {
                    return null;
                }
                const additionalFields = fieldsList.reduce((obj, fieldName) => {
                    /* eslint-disable no-param-reassign */
                    obj[fieldName] = variant[fieldName];
                    /* eslint-enable no-param-reassign */
                    return obj;
                }, {});
                return {
                    experimentName: this.name,
                    ...additionalFields,
                };
            })
            .catch((err) => {
                this._logger.error(
                    'Experiment: getLiveExperiment: an error occurred. Resolving null',
                    err);
                return null;
            });
    }
}

export default Experiment;
/* eslint-enable no-console */
