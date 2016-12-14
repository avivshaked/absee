/* eslint-disable no-console */
import Experiment from '../experiment/index';

class Variant {

    /**
     * @type {string}
     */
    _errMsg = 'Variant:';

    /**
     *
     * @param {Object?} ErrorType
     * @param {string?} errMsg
     * @private
     */
    _throwError(ErrorType, errMsg) {
        if (process && process.env && process.env.NODE_ENV === 'production') {
            if (this._logger.error) {
                this._logger.error(errMsg);
            } else if (this._logger.log) {
                this._logger.log(errMsg);
            }
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
    _validateObject(config, errMsg) {
        if (typeof config !== 'object') {
            this._throwError(TypeError,
                `${errMsg} argument must be an object. it is: "${typeof config}`);
        }
    }

    /**
     *
     * @param {string} name
     * @param {string} errMsg
     * @private
     */
    _validateName(name, errMsg) {
        if (typeof name !== 'string') {
            this._throwError(TypeError,
                `${errMsg} "name" property must be a string. it is: "${typeof name}`);
            return;
        }
        if (name.trim() === '') {
            this._throwError(RangeError,
                `${errMsg} "name" property must not be an empty string.`);
        }
    }

    /**
     *
     * @param {Experiment} experiment
     * @param {string} errMsg
     * @private
     */
    _validateExperiment(experiment, errMsg) {
        if (!(experiment instanceof Experiment)) {
            this._throwError(TypeError,
                `${errMsg} "experiment" must be an instance of Experiment.`);
        }
    }

    /**
     *
     * @param {string} name
     * @param {{[key]: *}?} state
     * @param {{logger?: Object, [key]: *}?} config
     */
    constructor(name, state = {}, config = {}) {
        const errMsg = `${this._errMsg} constructor:`;
        this._validateName(name, errMsg);
        this._validateObject(config, `${errMsg} config`);
        this._name = name;
        this._config = config;
        this._state = state;
        this._logger = config.logger || console;
    }

    /**
     * @returns {string}
     */
    get name() {
        return this._name;
    }

    /**
     *
     * @returns {object}
     */
    get config() {
        return {
            ...this._config,
        };
    }

    /**
     *
     * @returns {object}
     */
    get state() {
        return {
            ...this._state,
        };
    }

    /**
     * Creates a new Variant
     * @param {string} name
     * @param {Object?} state
     * @param {Object?} config
     * @returns {Variant}
     */
    static define(name, state, config) {
        return new Variant(name, state, config);
    }


    /**
     * Registers an experiment. Should be automatically consumed when using experiment.addVariant
     * @param {Experiment} experiment
     */
    registerExperiment(experiment) {
        this._validateExperiment(experiment, `${this._errMsg} registerExperiment:`);
        this._experiment = experiment;
    }
}

export default Variant;
/* eslint-enable no-console */
