const { Types } = require('./typeList');

function sizeOf(dataType) {
    if (dataType.isDynamic) {
        return MessageTypesAlias.dynamic;
    } else {
        switch (dataType.type) {
            case Types.unumber:
            case Types.number:
            case Types.bigint:
            case Types.biguint:
            case Types.string:
            case Types.buffer:
                return dataType.size;
                break;
            case Types.float:
                if (dataType.byteSize) {
                    return dataType.byteSize;
                }

                return dataType.size + dataType.factionSize;
                break;
            case Types.structure:
                if (dataType.size) {
                    return dataType.size;
                }

                let size = 0;

                for (let field of dataType.fields) {
                    size += sizeOf(field.type);
                }

                return size;
                break;
            case Types.array:
                if (dataType.byteSize) {
                    return dataType.byteSize;
                }

                return dataType.size * sizeOf(dataType.dataType);
            default:
                // todo
                throw new Error();
                break;
        }
    }
}

module.exports = {
    sizeOf
};