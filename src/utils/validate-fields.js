const validateFields = (fields, exclude = []) => {
    // clone or copy fields object
    const newFields = structuredClone(fields);

    // removed excluded field
    exclude.forEach((field) => {
        delete newFields[field];
    });

    const filled = Object.values(newFields).every(
        (item) => Boolean(item) && item !== ''
    );

    // returned if its true
    return filled;
};

const invalidFields = (fields, exclude = []) => {
    // clone or copy fields object
    const newFields = structuredClone(fields);

    // removed excluded field
    exclude.forEach((field) => {
        delete newFields[field];
    });

    // return the fields
    const unfilled = Object.keys(newFields).filter(
        (key) => !Boolean(newFields[key])
    );

    return unfilled;
};

module.exports = { validateFields, invalidFields };
