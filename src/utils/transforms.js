const { mod } = require('./mod');

function toBytes(num, system, byteLength, aliases = Aliases[system]?.toBytes || {}) {
    if(num === 0) return [0];

    let a = [];
    let now = num;

    while(now != 0) {
        const n2 = now % system;

        now = (now - n2) / system;
        a.unshift(aliases[n2] || n2);
    }

    const numCount = Math.ceil(a.length / byteLength);

    byteLength = numCount * byteLength;

    if(byteLength > a.length) {
        for(let i = a.length; i < byteLength; i++) {
            a.unshift(0);
        }
    }

    return a;
}

function negativeToBytes(num, system, byteLength, aliases) {
    let res = toBytes(Math.abs(num), system, byteLength, aliases);

    if (num < 0) {
        res[0] = system / 2 + res[0];
    }

    return res;
}

function toBytesBigInt(num) {
    const res = new ArrayBuffer(8);

    new DataView(res).setBigInt64(0, num);

    return Buffer.from(res);
}

function toBytesBigUint(num) {
    const res = new ArrayBuffer(8);

    new DataView(res).setBigUint64(0, num);

    return Buffer.from(res);
}

function factionToBytes(num, system, byteLength, aliases = Aliases[system]?.toBytes || {}) {
    let currentSeparator = 1 / system;
    let a = [];

    num = num - parseInt(num);

    while(num != 0 && a.length < byteLength) {
        const n3 = parseInt(num / currentSeparator);

        num = num - n3 * currentSeparator;
        currentSeparator = currentSeparator / system;
        a.push(aliases[n3] || n3);
    }

    if(byteLength > a.length) {
        for(let i = a.length; i < byteLength; i++) {
            a.push(0);
        }
    }

    return a;
}

function factionToDec(arr, system, aliases = Aliases[system]?.toDec || {}) {
    let now = 0;
    let i = 0;
    let factor = 1 / system;

    while(i < arr.length) {
        now += (aliases[arr[i]] || arr[i]) * factor;
        factor = factor / system;
        i++;
    }

    return now;
}

function toDec(arr, system, aliases = Aliases[system]?.toDec || {}) {
    let now = 0;
    let i = arr.length - 1;
    let factor = 1;

    while(i > -1) {
        now += (aliases[arr[i]] || arr[i]) * factor;
        factor = factor * system;
        i--;
    }

    return now;
}

function toDecBigInt(buffer) {
    const arrayBuffer = new ArrayBuffer(buffer.length);
    const view = new Uint8Array(arrayBuffer);

    for(let b = 0; b < buffer.length; b++) {
        view[b] = buffer[b];
    }

    return new DataView(arrayBuffer).getBigInt64(0);
}

function toDecBigUint(buffer) {
    const arrayBuffer = new ArrayBuffer(buffer.length);
    const view = new Uint8Array(arrayBuffer);

    for(let b = 0; b < buffer.length; b++) {
        view[b] = buffer[b];
    }

    return new DataView(arrayBuffer).getBigUint64(0);
}

function negativeToDec(arr, system, aliases) {
    const negativeLabel = arr[0] >= system / 2;
    const newArr = [...arr];

    if (negativeLabel) {
        newArr[0] = newArr[0] - system / 2;
    }

    let res = toDec(newArr, system, aliases);

    return negativeLabel ? -res : res;
}

const Aliases = {
    hex: {
        toBytes: {10: "A", 11: "B", 12: "C", 13: "D", 14: "E", 15: "F"},
        toDec: {"A": 10, "B": 11, "C": 12, "D": 13, "E": 14, "F": 15}
    }
}

module.exports = {
    toBytes,
    toDec,
    negativeToBytes,
    negativeToDec,
    factionToBytes,
    factionToDec,
    toBytesBigInt,
    toBytesBigUint,
    toDecBigInt,
    toDecBigUint
}