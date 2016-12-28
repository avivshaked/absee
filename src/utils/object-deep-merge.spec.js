import test from 'ava';
import objectDeepMerge from './object-deep-merge';

test('it should return an empty object if no args are provided', (t) => {
    t.deepEqual(objectDeepMerge(), {});
});

test('it should merge two plain objects', (t) => {
    const objA = {
        propA: 'some value',
        propB: 'some value',
    };
    const objB = {
        propB: 'some other value',
        propC: 'some value',
    };
    const expectedObj = {
        propA: 'some value',
        propB: 'some other value',
        propC: 'some value',
    };
    t.deepEqual(objectDeepMerge(objA, objB), expectedObj);
});

test('it should merge more then two objects based on priority', (t) => {
    const objA = {
        propA: 'some value',
        propB: 'some value',
    };
    const objB = {
        propB: 'some other value',
        propC: 'some value',
    };
    const objC = {
        propB: 'some other other value',
        propC: 10,
        propD: false,
    };
    const expectedObj = {
        propA: 'some value',
        propB: 'some other other value',
        propC: 10,
        propD: false,
    };
    t.deepEqual(objectDeepMerge(objA, objB, objC), expectedObj);
});

test('it should return a copy of the first object if the second argument is not an object', (t) => {
    const obj = { some: 'obj' };
    t.deepEqual(objectDeepMerge(obj, null), obj);
    t.not(objectDeepMerge(obj, null), obj);
    t.deepEqual(objectDeepMerge(obj, undefined), obj);
    t.not(objectDeepMerge(obj, undefined), obj);
    t.deepEqual(objectDeepMerge(obj, 'string'), obj);
    t.not(objectDeepMerge(obj, 'string'), obj);
    t.deepEqual(objectDeepMerge(obj, 10), obj);
    t.not(objectDeepMerge(obj, 10), obj);
});

test('it should merge nested objects', (t) => {
    const objA = {
        propA: {
            nestedPropA: 'some Value',
            nestedPropB: 'some value',
        },
        propB: {
            nestedPropC: 'some Value',
            nestedPropD: {
                doubleNestedPropA: 'some value',
                doubleNestedPropB: 'some value',
            },
        },
    };
    const objB = {
        propA: {},
        propB: {
            nestedPropC: 'some other Value',
            nestedPropD: {
                doubleNestedPropA: 'some other value',
                newDoubleNestedProp: 'some new value',
            },
            newNestedProp: 'some new value',
        },
        newProp: {
            someNew: 'object',
        },
    };

    const expectedObj = {
        propA: {
            nestedPropA: 'some Value',
            nestedPropB: 'some value',
        },
        propB: {
            nestedPropC: 'some other Value',
            nestedPropD: {
                doubleNestedPropA: 'some other value',
                doubleNestedPropB: 'some value',
                newDoubleNestedProp: 'some new value',
            },
            newNestedProp: 'some new value',
        },
        newProp: {
            someNew: 'object',
        },
    };

    t.deepEqual(objectDeepMerge(objA, objB), expectedObj);
});

test('it should merge primitives in arrays based on index', (t) => {
    const arrA = [1, 2, 3];
    const arrB = [4, 5];
    const expectedArr = [4, 5, 3];
    t.deepEqual(objectDeepMerge(arrA, arrB), expectedArr);
});

test('it should merge objects in an array', (t) => {
    const arrA = [
        {
            name: 'objA',
            value: 'some Value',
        },
        {
            name: 'objB',
            value: 'some Value',
        },
    ];
    const arrB = [
        {
            name: 'objA',
            newProp: 'some new value',
        },
        {
            value: 'some other Value',
        },
    ];
    const expectedArr = [
        {
            name: 'objA',
            value: 'some Value',
            newProp: 'some new value',
        },
        {
            name: 'objB',
            value: 'some other Value',
        },
    ];
    t.deepEqual(objectDeepMerge(arrA, arrB), expectedArr);
});

test('it should merge complex nested constructs', (t) => {
    const arrA = [
        {
            name: 'objA',
            value: 'some Value',
        },
        [
            1,
            2,
            {
                name: 'nested array object',
                propA: 'some value',
            },
        ],
    ];
    const arrB = [
        {
            name: 'objA',
            newProp: 'some new value',
        },
        [
            2,
            2,
            {
                propA: 'some other value',
                newProp: 'some value',
            },
        ],
    ];
    const expectedArr = [
        {
            name: 'objA',
            value: 'some Value',
            newProp: 'some new value',
        },
        [
            2,
            2,
            {
                name: 'nested array object',
                propA: 'some other value',
                newProp: 'some value',
            },
        ],
    ];
    t.deepEqual(objectDeepMerge(arrA, arrB), expectedArr);
});
