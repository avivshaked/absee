/* eslint-disable no-console */
import { Experiment, Variant } from '../';

const DEFAULT_PREFIX = 'ab';
const DO_NOT_OVERRIDE = false;

class Experiments {

    _errMsg = 'Experiments:';

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
     * @param {Experiment} experiment
     * @param {string} errMsg
     * @private
     */
    static _validateExperiment(experiment, errMsg) {
        if (!(experiment instanceof Experiment)) {
            Experiments._throwError(TypeError,
                `${errMsg} "experiment" must be an instance of Experiment.`);
        }
    }

    static _defaultConfig = {
        prefix: DEFAULT_PREFIX,
    };

    /**
     *
     * @param {{[key]: *}?} config
     */
    constructor(config) {
        this._experiments = {};
        this._config = {
            ...Experiments._defaultConfig,
            ...(config || {}),
        };
        this._variantProviderContext = null;
        this._conditionContext = null;
    }

    get config() {
        return {
            ...this._config,
        };
    }

    /**
     * @param {Experiment} experiment
     * @return {Experiments}
     */
    addExperiment(experiment) {
        Experiments._validateExperiment(experiment, `${this._errMsg} addExperiment:`);
        experiment.registerExperiments(this);
        this._experiments[experiment.name] = experiment;
        // If experiments are added after the context has been set, it will be added to them
        if (this._variantProviderContext) {
            experiment.setVariantProviderContext(this._variantProviderContext, DO_NOT_OVERRIDE);
        }
        if (this._conditionContext) {
            experiment.setConditionContext(this._conditionContext, DO_NOT_OVERRIDE);
        }
        return this;
    }

    /**
     * Returns a features list for the requested experiment and variant.
     * Will return an empty object if the experiment is not defined.
     * @param {string} experimentName
     * @param {string} variantName
     */
    getFeaturesMap(experimentName, variantName) {
        const experiment = this._experiments[experimentName];
        if (experiment) {
            return experiment.getFeaturesMap(variantName);
        }
        return {};
    }

    /**
     * Gets a list of "live" experiments, and returns an object with toggled features.
     * If liveExperiments does not comply with the schema, an empty object is returned.
     * If an experiment in liveExperiments doesn't comply with the schema, it will be disregarded.
     * @param {Array<{experimentName: string, variantName: string}>} liveExperiments
     * @returns {{[key]: boolean}}
     */
    getExperimentsFeaturesMap(liveExperiments) {
        if (Array.isArray(liveExperiments)) {
            return liveExperiments.reduce((oldFeaturesList, experiment) => {
                // Validate 'experiment' argument. Make sure it has the proper properties.
                // If it doesn't, the old object is returned
                const validExperiment = typeof experiment !== 'undefined' &&
                    'experimentName' in experiment &&
                    typeof experiment.experimentName === 'string' &&
                    experiment.name !== '' &&
                    'variantName' in experiment &&
                    typeof experiment.variantName === 'string' &&
                    experiment.variantName !== '';

                if (validExperiment) {
                    const featuresList = this.getFeaturesMap(experiment.experimentName,
                        experiment.variantName);
                    return {
                        ...oldFeaturesList,
                        ...featuresList,
                    };
                }
                return oldFeaturesList;
            }, {});
        }

        return {};
    }

    /**
     * @param {Array<string>} fieldsList
     * @returns {Promise<Array<{[key]: string}>>}
     */
    getLiveExperiments(fieldsList) {
        // Return a list of promises that is derived from a list of returned getLiveExperiment of
        // each of the registered experiments.
        return Promise.all(Object.keys(this._experiments).map((experimentName) => {
            // Wrapping in a promise so that any uncaught errors will be passed to this catch
            return Promise.resolve().then(() => {
                return this._experiments[experimentName].getLiveExperiment(fieldsList);
            });
        }))
        // Create a new list of non null liveExperiments and return it
            .then(liveExperimentsResolves => liveExperimentsResolves.filter(
                liveExperiment => liveExperiment !== null))
            // On error return an empty array
            .catch((err) => {
                console.log(
                    'Experiments: getLiveExperiments: An error has occurred. ' +
                    'Returning an empty array',
                    err);
                return [];
            });
    }

    /**
     * Returns an experiment
     * @param {string} experimentName
     * @returns {Experiment|null}
     */
    getExperiment(experimentName) {
        return this._experiments[experimentName] || null;
    }

    /**
     * Sets the same context for all the running experiments` variant providers
     * @param {{[key]: *}} context
     */
    setVariantProviderContext(context) {
        this._variantProviderContext = context;
        Object.keys(this._experiments)
            .forEach(
                (experimentName) => {
                    this._experiments[experimentName].setVariantProviderContext(context,
                        DO_NOT_OVERRIDE);
                }
            );
    }

    /**
     * Sets the same context for all the running experiments` condition
     * @param {{[key]: *}} context
     */
    setConditionContext(context) {
        this._conditionContext = context;
        Object.keys(this._experiments)
            .forEach(
                (experimentName) => {
                    this._experiments[experimentName].setConditionContext(context, DO_NOT_OVERRIDE);
                }
            );
    }

    /**
     * @param {{[key]: *}?} config
     * @returns {Experiments}
     */
    static define(config) {
        return new Experiments(config);
    }


    /**
     *
     * @param {{ prefix?: string, [key]: value}?} config
     * @param {Array<{name: string, variants?: Array<{name: string, featureToggles?: {[key]: boolean}}>}>} experiments
     * @return {Experiments}
     */
    static defineByObject({ config = {}, experiments = [] }) {
        try {
            const experimentsDef = Experiments.define(config);
            for (const experimentObj of experiments) {
                const experiment = Experiment.define(experimentObj.name);
                // If experiment object has variants defined, create them
                if (Array.isArray(experimentObj.variants)) {
                    for (const variantObj of experimentObj.variants) {
                        const variant = Variant.define(variantObj.name,
                            variantObj.featureToggles || {});
                        experiment.addVariant(variant);
                    }
                }
                experimentsDef.addExperiment(experiment);
            }
            return experimentsDef;
        } catch (err) {
            console.error('There was an error trying to create Experiments\r\nReturning empty experiments object.', err);
            return Experiments.define();
        }
    }

}

export default Experiments;
/* eslint-enable no-console */