## ABSee

A small library for creating AB experiment constructs. 

With this library you set up your experiment configuration, set variant providers and conditions, set provider and condition contexts, and get back variants state.

Table of contents
-----------------
* [Installation](#installation)
* [Tests](#tests)
* [Getting started](#getting-started)
    * [Creating experiments construct with explicit chaining](#creating-experiments-construct-with-explicit-chaining)
    * [Creating experiments construct with config object](#creating-experiments-construct-with-config-object)
    * [Consuming variants state](#consming-variant-state)
    * [Variant Provider](#variant-provider)
    * [Setting variant provider](#setting-variant-provider)
    * [Getting live experiment and state](#getting-live-experiment-and-state)
    * [Setting variant provider context](#setting-variant-provider-context)
* [License](#License)


## Installation

To install run: 

`npm install absee`

## Tests

The tests cover most, if not all, of the methods in the classes.

To run the tests: 

`npm run test`

## Getting Started

The first step would be to create experiments construct. Experiments construct would be a list of experiments.
Each experiment should have a name, can have a configuration, and should have variants.
Each variant should have a name, unique in its experiment, can have a state, and can have a config.

### Creating experiments construct with Explicit chaining
There are two ways to create experiments construct. The first way is with explicit chaining.
Create an instance of Experiments, instances of Experiment, and instances of Variants.

```js
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
```

You can find an example in 'examples/creating-constructs-explicit-chaining/index.js'

### Creating experiments construct with config object
The second way to create an experiments construct is with a config object, or a config file.
The object can have a config property, and must have an experiments property.
Experiments property is an array of objects, where each object is an experiment definition object.
```js
const experimentsConfig = {
    "config": {
      "some": "config"
    },
    "experiments": [
      {
        "name": "First Experiment",
        "variants": [
          {
            "name": "control",
            "state": {
              "prop1": "show",
              "prop2": "hide"
            }
          },
          {
            "name": "variantA",
            "state": {
              "prop1": "hide",
              "prop2": "show"
            }
          },
          {
            "name": "variantB",
            "state": {
              "prop1": "show",
              "prop2": "show"
            }
          }
        ]
      }
    ]
  };

const experiments = Experiments.defineByObject(experimentsConfig);

```

You can find an example in 'examples/creating-constructs-config-object/index.js'

### Consuming variants state
Having experiments construct is the first phase. Once a construct is in place, in various times and
places in your app, you might want to get the specific state that is set for an experiment's 
specific variant.
To do this you need to call `getVariantState` on an experiments instance. This will return a clone
of the original variant state.

The function's signature: `getVariantState({string} experimentName, {string} variantName)`

You might have a need to get more than one experiment state. You might have more than one test
running. In that case you should call `getExperimentsState` method. This method will return a merge
state of all the experiments variants.

The function's signature: `getExperimentsState(Array<{experimentName: string, variantName: string}>)`

You can find an example in 'examples/consuming-variants-state/index.js'



### Variant Provider
A variant provider is a service or a method that should return a variant based on an assignment key 
mapping, and/or a condition or set of conditions. The service, should always return the same variant 
for a specific assignment key and condition outcome. It is not an imperative, but usually A/B test 
need a constant for the results of an experiment to mean anything. 
Here's an example; If the assignment key is a customer id then for a specific customer id, the same
variant name should always be returned by the variant provider service.

The assignment key can be anything, as can the conditions be. It is implementation based. In fact,
as far as ABSee is concerned, it doesn't care at all how a variant provider works, as long as it can
get an experiment name and a variant name to produce a state.


### Setting variant provider
As mentioned before, ABSee is agnostic to the variant provider, or to the variant provider 
implementation. It does however provide a way to integrate the variant provider service into the 
construct.

Once you define an Experiment, or Experiments construct, you can add a variant provider method or
service to each experiment.

To add a service provider you use an Experiment instance's `setVariantProvider` method.
```js

// Assuming an Experiment has been defined
function variantProviderFn () {/** some logic here that returns some object with variant name **/}
experiment.setVariantProvider(variantProviderFn);

```
You can find examples in 'examples/live-experiments'


### Getting live experiment and state
To get the 'live experiment', ie the object that describes what is the current variant, you can 
call `experiment.getLiveExperiment()` to get a specific experiment's 'live experiment', or you can use
`experiments.getLiveExperiments()` to get all current 'live experiments'. Both methods accept a list
of field names, and those properties will be mapped to the object (or list of objects)
that is produced in `getLiveExperiment` method. These methods return a promise, so from the point of
calling these methods, the code will become asynchronous in nature.

Here's an example. Lets say that variantProviderFn returns an object with the following schema:
```schema
{
    "variant": string,
    "metaDataA": any,
    "metaDataB": any
}
```
So you would definitely want to capture the variant and maybe one of the meta datas. In this case you
would call `getLiveExperiment` or `getLiveExperiments` with a list of mapped properties, like this:
```js
experiment.getLiveExperiment(['variant', 'metaDataB']);
```

The outcome will be an object that looks like this:
```json
{
  "experimentName": "the experiment name",
  "variant": "the variant name",
  "metaDataB": "some meta data"
}
```
"experimentName" is the only default property, and it is not taken from `variantProviderFn` returned 
object, but directly from the experiment construct. The other values in the object were mapped using
the fieldList provided in the call to `getLiveExperiment`.
So if you would like to get the state of a single experiment then once you have the 'liveExperiment'
you can call `experiment.getVariantState` like this:
```js
// Assuming an Experiment has been defined
function variantProviderFn () {/** some logic here that returns some object with variant name **/}
experiment
    .setVariantProvider(variantProviderFn)
    .getLiveExperiment(['variant', 'metaDataB'])
        .then((liveExperiment) => experiment.getVariantState(liveExperiment.variant));
    
// the 'setVariantProvider' method and 'getLiveExperiment' do not have to be chained.
```

However, you might want to call `experimets.getExperimentsState` to get all the running experiments
state. In this case you need to pass a list of objects with strict schema; 
Array<{experimentName: string, variantName: string}> .
In this case you need to either take the response from getLiveExperiments and do some additional 
processing to turn "variant" prop to "variantName", or use another feature of fieldsList argument.
Instead of passing a string, you pass an object with keys and values, where the keys are the fields
in the object that the variantProvider returns, and the values are the names of the properties of
the returned object from `getLiveExperiment`.
Here's and example:
```js
// Assuming an Experiment has been defined, and a variant provider has been set
experiments.getLiveExperiments(['metaDataB', {variant: 'variantName'}])
    .then((liveExperiments) => {
        /** This will return an array of objects that have this schema:
        {
              "experimentName": "the experiment name",
              "variantName": "the variant name",
              "metaDataB": "some meta data"
        }
        **/
        // So this can be passed directly as-is to experiments.getExperimentsState
        return experiments.getExperimentsState(liveExperiments);
    });
// So now this method will resolve on the combined state of all live experiments currently running

```
You can find examples in 'examples/live-experiments'

### Setting variant provider context
When providing argument to the variant provider service, some arguments might be constant. For 
example: an experiment name, or an experiment id. Some arguments might vary for each call to the
variant provider service. For example: Customer id, which changes for each request.
ABSee offers a way to add variant provider context. The variantProvider will then be called with the
provided context as its argument.

Here's an example:
```js
const experimentId = 'someId';
function variantProviderFn(context) {
    // Assuming there is a service to het variants the gets an experiments id and a customer id
    return getVariantService(experimentId, context.customerId);
}
// Assuming experiments instance has been defined, and experiment instance has been defined
experiment.setVariantProvider(variantProviderFn);

// now before making the call to get the live experiments we set context (probably in a different file)
// Assuming we have some request object with customerId on it
experiments
    .setVariantProviderContext({customerId: request.customerId})
    .getLiveExperiments(['someField', {variant: 'variantName'}])
    .then(experiments.getExperimentsState)
    .then((experimentsState) => {
        // Do something with the experiments state
    });
```
You can find examples in 'examples/variant-provider-context'

### Setting condition and condition context
In most cases you would want the test to run under a specific condition only. For example, if the
user is coming from a mobile device and not from desktop, or if the user has some cookie or header,
or even more complex conditions. ABSee allows setting a condition or a condition function for each
experiment. It also allows setting context for each experient, or globally. `getLiveVariant` method 
(on an experiment instance) will evaluate the condition against the context (if provided), and if 
it is evaluated to false, the method will return null. `getLiveExperiment` is using `getLiveVariant`
internally, so it is also affected by the condition.

if you are using `experiments.getLiveExperiments`, that method filters out all null liveExperiments,
so it would basically filter out all experients that have a condition that evaluates false.

Here's an example:
```js
// Assuming experiments instance has been defined, experiment instance has been defined, 
// and variantProviderFn has been defined
experiment.setVariantProvider(variantProviderFn);

// now we will set the condition function
experiment.setCondition((context) => {
    return context.device === 'mobile';
});
// now before making the call to get the live experiments we set context (probably in a different file)
// Assuming there is variant provider context object defined, and assuming there is a request object
// with device property
experiments
    .setVariantProviderContext(variantProviderContext)
    .setConditionContext({device: request.device })
    .getLiveExperiments(['someField', {variant: 'variantName'}])
    .then(experiments.getExperimentsState)
    .then((experimentsState) => {
        // Do something with the experiments state
    });
```
You can find examples in 'examples/setting-condition-and-context'


## License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions: