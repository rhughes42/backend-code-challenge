// Constructs a dictionary (index) by iterating over the items
// and extracting the value of the sub - property of interest.
const dictionaryPass = (data, propertyPath) => {
    return data.reduce((acc, item) => {
        const keys = propertyPath.split('.')
        let value = item

        for (let key of keys) {
            value = value[key]
            if (value === undefined) {
                break
            }
        }

        if (value !== undefined) {
            acc[value] = acc[value] || []
            acc[value].push(item)
        }
        return acc
    }, {})
}

// Retrive items by their sub-property value using the index.
const findItemsBySubProperty = (dataIndex, value) => {
    return dataIndex[value] || []
}

module.exports = { dictionaryPass, findItemsBySubProperty }
