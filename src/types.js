const { sizeOf } = require('./sizeof');
const { Types } = require('./typeList');

const MessageTypesAlias = {
    dynamic: 0
}

const VarTypes = {
    Number(size = 1) {
        const typeDescriptor = {
            type: Types.number,
            size
        };

        typeDescriptor.isDynamic = isDynamicType(typeDescriptor);

        return typeDescriptor;
    },
    UNumber(size = 1) {
        const typeDescriptor = {
            type: Types.unumber,
            size
        };

        typeDescriptor.isDynamic = isDynamicType(typeDescriptor);

        return typeDescriptor;
    },
    Float(size = 1, factionSize = 1) {
        const typeDescriptor = {
            type: Types.float,
            size,
            factionSize
        };

        typeDescriptor.isDynamic = isDynamicType(typeDescriptor);
        typeDescriptor.byteSize = sizeOf(typeDescriptor);

        return typeDescriptor;
    },
    BigInt() {
        return {
            type: Types.bigint,
            size: 8
        };
    },
    BigUint() {
        return {
            type: Types.biguint,
            size: 8
        };
    },
    String(size = 1, charset = 'utf8') {
        const typeDescriptor = {
            type: Types.string,
            size,
            charset
        }

        typeDescriptor.isDynamic = isDynamicType(typeDescriptor);

        return typeDescriptor;
    },
    Buffer(size = MessageTypesAlias.dynamic) {
        const typeDescriptor = {
            type: Types.buffer,
            size
        };

        typeDescriptor.isDynamic = isDynamicType(typeDescriptor);

        return typeDescriptor;
    },
    Structure(...args) {
        const fields = [];

        for(let f = 0; f < args.length; f += 2) {
            fields.push({
                field: args[f],
                type: args[f + 1]
            });
        }

        const typeDescriptor = {
            type: Types.structure,
            fields
        }

        typeDescriptor.isDynamic = isDynamicType(typeDescriptor);
        typeDescriptor.size = sizeOf(typeDescriptor);

        return typeDescriptor;
    },
    Array(dataType, size = MessageTypesAlias.dynamic) {
        const typeDescriptor = {
            type: Types.array,
            dataType,
            size
        }

        typeDescriptor.isDynamic = isDynamicType(typeDescriptor);
        typeDescriptor.byteSize = sizeOf(typeDescriptor);

        return typeDescriptor;
    },
    Multiplex(...n) {
        // todo Тип в 1 байт, который делят несколько значений, указываются размеры в битах
    }
}

function isDynamicType(dataType) {
    switch(dataType.type) {
        case Types.unumber:
        case Types.number:
        case Types.float:
        case Types.bigint:
        case Types.biguint:
            return false;
            break;
        case Types.string:
        case Types.buffer:
            if (dataType.size === MessageTypesAlias.dynamic) {
                return true;
            }
            break;
        case Types.structure:
            for(let field of dataType.fields) {
                if(isDynamicType(field.type)) {
                    return true;
                }
            }
            break;
        case Types.array:
            if (dataType.size === MessageTypesAlias.dynamic || isDynamicType(dataType.dataType)) {
                return true;
            }
            break;
    }

    return false;
}

module.exports = {
    VarTypes,
    MessageTypesAlias,
};