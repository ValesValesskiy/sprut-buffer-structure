import { Types } from './typeList';
import { MessageTypesAlias } from './types';

export const VarTypes: {
    Number(size: number = 1): {
        type: T;
        size: number;
        isDynamic: boolean;
    };
    UNumber(size: number = 1): {
        type: T;
        size: number;
        isDynamic: boolean;
    };
    Float(size: number = 1, factionSize: number = 1): {
        type: typeof Types.float;
        size: number;
        factionSize: number;
        byteSize: number;
        isDynamic: boolean;
    };
    BigInt(): {
        type: typeof Types.bigint;
        size: 8;
    };
    BigUint(): {
        type: typeof Types.biguint;
        size: 8;
    };
    String(size: number = 1, charset: string = 'utf8'): {
        type: typeof Types.string;
        size: number;
        charset: string;
    };
    Buffer(size = MessageTypesAlias.dynamic): {
        type: typeof Types.buffer;
        size: number | typeof MessageTypesAlias.dynamic;
    };
    Structure(...args): {
        type: typeof Types.structure;
        fields: {
            field: string | number | symbol;
            type: ReturnType<typeof VarTypes[keyof typeof VarTypes]>;
        }[];
        isDynamic: boolean;
        size: number | typeof MessageTypesAlias.dynamic;

    };
    Array(dataType, size = MessageTypesAlias.dynamic): {
        type: typeof Types.array,
        dataType: ReturnType<typeof VarTypes[keyof typeof VarTypes]>,
        size: number | typeof MessageTypesAlias.dynamic;
        byteSize: number;
        isDynamic: boolean;
    };
}

class Message<T> {
    constructor(...data: T);

    toBuffer(): Buffer;

    static fromBuffer(buffer: Buffer): T;

    get types(): ReturnType<typeof VarTypes[keyof typeof VarTypes]>[];

    static get types(): ReturnType<typeof VarTypes[keyof typeof VarTypes]>[];

    static addType(id, dataType: ReturnType<typeof VarTypes[keyof typeof VarTypes]>): void;
}

export function MessageClass<T extends any[]> (config: {
    dataTypes: ReturnType<typeof VarTypes[keyof typeof VarTypes]>[];
    dynamicLengthLabelBytes: number;
}): Message<T>;

export function sizeof(dataType: ReturnType<typeof VarTypes[keyof typeof VarTypes]>): number;