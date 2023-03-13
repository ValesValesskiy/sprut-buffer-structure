const {
    toBytes,
    toDec,
    factionToBytes,
    factionToDec,
    negativeToBytes,
    negativeToDec,
    toBytesBigInt,
    toBytesBigUint,
    toDecBigInt,
    toDecBigUint
} = require('./utils');
const { sizeOf } = require('./sizeof');
const { Types } = require('./typeList');

const MessageSymbols = {
    dataTypes: Symbol('types')
};

function MessageClass(config = {}) {
    if (!config.dataTypes) {
        // todo
        throw new Error();
    }

    const dataTypes = config.dataTypes;
    const dynamicLengthLabelBytes = config.dynamicLengthLabelBytes || 4;

    return class Message {
        constructor(...args) {
            this.data = args;
        }

        [MessageSymbols.dataTypes] = dataTypes;
        static [MessageSymbols.dataTypes] = dataTypes;

        get types() {
            return [...this[MessageSymbols.dataTypes]];
        }

        static addType(id, dataType) {
            Message[MessageSymbols.dataTypes][id] = dataType;
        }

        static get types() {
            return [...Message[MessageSymbols.dataTypes]];
        }

        toBuffer() {
            let bufferArray = [];

            this[MessageSymbols.dataTypes].map((dataType, i) => {
                const [ buffer ] = toBuffer(dataType, this.data[i], dynamicLengthLabelBytes);

                bufferArray.push(buffer);
            });

            return Buffer.concat(bufferArray);
        }

        static fromBuffer(messageData, byteOffset = 0) {
            const valueArr = [];

            this[MessageSymbols.dataTypes].forEach((dataType, i) => {
                const [ value, byteLength ] = fromBuffer(dataType, messageData, dynamicLengthLabelBytes, byteOffset);

                valueArr.push(value);
                byteOffset += byteLength;
            });

            return [ valueArr, byteOffset ];
        }
    }
}

function toBuffer(dataType, data, dynamicLengthLabelBytes) {
    switch(dataType.type) {
        case Types.unumber:
            return [ new Uint8Array(toBytes(data, 256, dataType.size)), dataType.size ];
            break;
        case Types.number:
            return [ new Uint8Array(negativeToBytes(data, 256, dataType.size)), dataType.size ];
            break;
        case Types.float:
            return [ Buffer.concat([ new Uint8Array(negativeToBytes(parseInt(data), 256, dataType.size)), new Uint8Array(factionToBytes(Math.abs(data), 256, dataType.factionSize)) ]), dataType.byteSize ];
            break;
        case Types.bigint:
            return [ toBytesBigInt(data, dataType.size), dataType.size ];
            break;
        case Types.biguint:
            return [ toBytesBigUint(data, dataType.size), dataType.size ];
            break;
        case Types.string:
            if (dataType.isDynamic) {
                return [ Buffer.concat([ new Uint8Array(toBytes(data.length, 256, dynamicLengthLabelBytes)), Buffer.from(data, dataType.charset) ]), data.length + dynamicLengthLabelBytes ];
            } else {
                const size = sizeOf(dataType);

                if (data.length > size) {
                    data = data.substr(0, size);
                } else {
                    data = data.padEnd(size, '\x00');
                }

                return [ Buffer.from(data), dataType.size ];
            }
            break;
        case Types.buffer:
            if (dataType.isDynamic) {
                return [ Buffer.concat([ new Uint8Array(toBytes(data.length, 256, dynamicLengthLabelBytes)), data ]), data.length + dynamicLengthLabelBytes ];
            } else {
                if (data.length !== dataType.size) {
                    // todo
                    throw new Error();
                }

                return [ data, dataType.size ];
            }
            break;
        case Types.structure:
            if (dataType.isDynamic) {
                const bufferArray = [];
                let currentByteCount = 0;

                for (let { field, type } of dataType.fields) {
                    const [ buffer, byteLength ] = toBuffer(type, data[field], dynamicLengthLabelBytes);
                    bufferArray.push(buffer);
                    currentByteCount += byteLength;
                }

                bufferArray.unshift(new Uint8Array(toBytes(currentByteCount, 256, dynamicLengthLabelBytes)));

                return [ Buffer.concat(bufferArray), currentByteCount + dynamicLengthLabelBytes ];
            } else {
                const bufferArray = [];
                let currentByteCount = 0;

                for (let {field, type} of dataType.fields) {
                    const [buffer, byteLength] = toBuffer(type, data[field], dynamicLengthLabelBytes);
                    bufferArray.push(buffer);
                    currentByteCount += byteLength;
                }

                return [ Buffer.concat(bufferArray), currentByteCount ];
            }
            break;
        case Types.array:
            if (dataType.isDynamic) {
                const bufferArray = [];
                let currentByteCount = 0;

                for (let item of data) {
                    const [ buffer, byteLength ] = toBuffer(data.dataType, item, dynamicLengthLabelBytes);
                    bufferArray.push(buffer);
                    currentByteCount += byteLength;
                }

                bufferArray.unshift(new Uint8Array(toBytes(currentByteCount, 256, dynamicLengthLabelBytes)));

                return [ Buffer.concat(bufferArray), currentByteCount + dynamicLengthLabelBytes ];
            } else {
                const bufferArray = [];
                let currentByteCount = 0;

                for (let item of data) {
                    const [ buffer, byteLength ] = toBuffer(data.dataType, item, dynamicLengthLabelBytes);
                    bufferArray.push(buffer);
                    currentByteCount += byteLength;
                }

                return [ Buffer.concat(bufferArray), currentByteCount ];
            }
            break;
        default:
            // todo
            throw new Error();
            break;
    }
}

function fromBuffer(dataType, buffer, dynamicLengthLabelBytes, bufferByteOffset = 0) {
    let value;
    let byteOffset = bufferByteOffset;

    switch(dataType.type) {
        case Types.unumber:
            const size = sizeOf(dataType);

            value = toDec(buffer.slice(byteOffset, byteOffset + size), 256);

            return [ value, size ];
            break;
        case Types.number: {
            const size = sizeOf(dataType);

            value = negativeToDec(buffer.slice(byteOffset, byteOffset + size), 256);

            return [ value, size ];
            break;
        }
        case Types.float:
            value = negativeToDec(buffer.slice(byteOffset, byteOffset + dataType.size), 256);
            byteOffset += dataType.size;
            value += (value < 0 ? -1 : 1) * factionToDec(buffer.slice(byteOffset, byteOffset + dataType.factionSize), 256);

            return [ value, sizeOf(dataType) ];
            break;
        case Types.bigint:
            return [ toDecBigInt(buffer.slice(byteOffset, byteOffset + dataType.size)), dataType.size ];
            break;
        case Types.biguint:
            return [ toDecBigUint(buffer.slice(byteOffset, byteOffset + dataType.size)), dataType.size ];
            break;
        case Types.string:
            if (dataType.isDynamic) {
                const size = toDec(buffer.slice(byteOffset, byteOffset + dynamicLengthLabelBytes), 256);

                value = buffer.slice(byteOffset + dynamicLengthLabelBytes, byteOffset + dynamicLengthLabelBytes + size).toString();
                byteOffset += size + dynamicLengthLabelBytes;

                return [ value, size ];
            } else {
                const size = sizeOf(dataType);

                value = buffer.slice(byteOffset, byteOffset + size).toString().replace(new RegExp('[\x00]+?$'), '');

                return [ value, size ];
            }
            break;
        case Types.buffer:
            if (dataType.isDynamic) {
                const size = toDec(buffer.slice(byteOffset, byteOffset + dynamicLengthLabelBytes), 256);

                value = buffer.slice(byteOffset + dynamicLengthLabelBytes, byteOffset + dynamicLengthLabelBytes + size);
                byteOffset += size + dynamicLengthLabelBytes;

                return [ value, size ];
            } else {
                const size = sizeOf(dataType);

                value = buffer.slice(byteOffset, byteOffset + dataType.size);

                return [ value, size ];
            }
            break;
        case Types.structure:
            if (dataType.isDynamic) {
                value = {};
                let currentByteOffset = byteOffset + dynamicLengthLabelBytes;

                for (let { field, type } of dataType.fields) {
                    const [ fieldValue, byteLength ] = fromBuffer(type, buffer, dynamicLengthLabelBytes, currentByteOffset);
                    value[field] = fieldValue;
                    currentByteOffset += byteLength;
                }

                byteOffset += currentByteOffset;

                return [ value, currentByteOffset ];
            } else {
                value = {};
                let currentByteOffset = byteOffset;

                for (let { field, type } of dataType.fields) {
                    const [ fieldValue, byteLength ] = fromBuffer(type, buffer, dynamicLengthLabelBytes, currentByteOffset);
                    value[field] = fieldValue;
                    currentByteOffset += byteLength;
                }

                return [ value, currentByteOffset ];
            }
            break;
        case Types.array:
            if (dataType.isDynamic) {
                value = [];
                const size = toDec(buffer.slice(byteOffset, byteOffset + dynamicLengthLabelBytes), 256);
                let currentByteOffset = byteOffset + dynamicLengthLabelBytes;
                let currentByteCount = 0;

                while(currentByteCount < size) {
                    const [ itemValue, byteLength ] = fromBuffer(dataType.dataType, buffer, dynamicLengthLabelBytes, currentByteOffset);

                    value.push(itemValue);
                    currentByteCount += byteLength;
                    currentByteOffset += byteLength;
                }

                return [ value, currentByteOffset ];
            } else {
                value = [];
                const size = sizeOf(dataType);
                let currentByteOffset = byteOffset;
                let currentByteCount = 0;

                while(currentByteCount < size) {
                    const [ itemValue, byteLength ] = fromBuffer(dataType.dataType, buffer, dynamicLengthLabelBytes, currentByteOffset);

                    value.push(itemValue);
                    currentByteCount += byteLength;
                    currentByteOffset += byteLength;
                }

                return [ value, currentByteOffset ];
            }
            break;
        default:
            // todo
            throw new Error();
            break;
    }
}

module.exports = {
    MessageClass,
    toBuffer,
};