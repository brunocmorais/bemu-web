export const allKeys = {
    0x1: '1', 0x2: '2', 0x3: '3', 0xC: '4',
    0x4: 'q', 0x5: 'w', 0x6: 'e', 0xD: 'r',
    0x7: 'a', 0x8: 's', 0x9: 'd', 0xE: 'f',
    0xA: 'z', 0x0: 'x', 0xB: 'c', 0xF: 'v'
};
export const startAddress = 0x200;
export const cycleNumber = 10;
export const width = 128;
export const height = 64;
export const keysInOrder = Object.entries(allKeys).map(x => x[1]);