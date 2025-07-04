const capitalize = (value) => {
    const parsedValue = value.trim();
    // international locale
    const firstCharacter = parsedValue[0].toLocaleUpperCase();
    const otherCharacters = parsedValue.slice(1).toLocaleLowerCase();
    const newValue = `${firstCharacter}${otherCharacters}`;
    return newValue;
};

module.exports = capitalize;
