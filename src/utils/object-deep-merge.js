const recursiveDeepMerge = (holderObj = {}, mergingObject) => {
    // Merge only objects otherwise return the first object
    if (typeof mergingObject !== 'object' || mergingObject === null) {
        return holderObj;
    }

    // Iterate through second object keys and assign values to the first object
    Object.keys(mergingObject).forEach((mergingObjectKey) => {
        /* eslint-disable no-param-reassign */

        // If the type of the property is not an object then assign it to the first object
        if (typeof mergingObject[mergingObjectKey] !== 'object') {
            holderObj[mergingObjectKey] = mergingObject[mergingObjectKey];
            return;
        }

        // If the type of property is array then prepare array to merge otherwise prepare object
        if (Array.isArray(mergingObject[mergingObjectKey])) {
            holderObj[mergingObjectKey] = holderObj[mergingObjectKey] || [];
        } else {
            holderObj[mergingObjectKey] = holderObj[mergingObjectKey] || {};
        }

        // Recursive merge the props
        recursiveDeepMerge(holderObj[mergingObjectKey], mergingObject[mergingObjectKey]);

        /* eslint-enable no-param-reassign */
    });

    return holderObj;
};

const objectDeepMerge = (...objectsToMerge) => {
    if (!Array.isArray(objectsToMerge)) {
        return {};
    }

    let startObject;
    if (Array.isArray(objectsToMerge[0])) {
        startObject = [];
    } else {
        startObject = {};
    }

    return objectsToMerge.reduce((prev, obj) => {
        return recursiveDeepMerge(prev, obj);
    }, startObject);
};

export default objectDeepMerge;
