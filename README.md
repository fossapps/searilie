# Searilie

[![Greenkeeper badge](https://badges.greenkeeper.io/fossapps/Searilie.svg)](https://greenkeeper.io/)
[![Build Status](https://travis-ci.com/fossapps/searilie.svg)](https://travis-ci.com/fossapps/searilie)
[![GitHub issues](https://img.shields.io/github/issues/fossapps/Searilie.svg)](https://github.com/fossapps/Searilie/issues)
[![codecov](https://codecov.io/gh/fossapps/Searilie/branch/master/graph/badge.svg)](https://codecov.io/gh/fossapps/Searilie)
[![devDependencies Status](https://david-dm.org/fossapps/Searilie/dev-status.svg)](https://david-dm.org/fossapps/Searilie?type=dev)
[![dependencies Status](https://david-dm.org/fossapps/Searilie/status.svg)](https://david-dm.org/fossapps/Searilie)

This library tries to encode data to a very small payload, useful when you want to add data to url query parameters

# Limitations
- It can only store array of objects
- each object on array must have same keys (name and number of keys)
- it can only serialize string and number values nothing else
- while decoding we need to pass a spec for our object

## Example:
```typescript
import {Searilie} from "./src/Searilie"
import {TinyCompressor} from "./src/adapters/TinyCompressor"
const serialization = new Searilie(new TinyCompressor()); // or use CSVCompressor
console.log(serialization.encode([{a: "k", b: 5}, {a: "c", b: 9}])); // Ak5c9
```

## Tiny compressor:
can only compress 1 character values, but produces tiny payloads,

## CSVCompressor
separates data using , and ; producing larger payloads, but it can support more than 1 character payloads:
```typescript
import {Searilie} from "./src/Searilie"
import {CSVCompressor} from "./src/adapters/CSVCompressor"; 
const serialization = new Searilie(new CSVCompressor());
console.log(serialization.encode([{a: "kick", b: 51}, {a: "cat", b: 92}])); // Bkick,51;cat,92
```

## deserialization
the first character on encoded payload denotes which compressor was used, we need to use the same compressor to ensure we don't load everything at once, we don't import everything and check it for you.
```typescript
import {Searilie, ValueType} from "./src/Searilie"
import {CSVCompressor} from "./src/adapters/CSVCompressor"; 
const serialization = new Searilie(new CSVCompressor());
console.log(serialization.decode("Bkick,51;cat,92", {a: ValueType.String, b: ValueType.Number})); // [{a: "kick", b: 51}, {a: "cat", b: 92}]
console.log(serialization.decode("Bkick,51;cat,92", {myKey: ValueType.String, newKey: ValueType.Number})); // [{myKey: "kick", newKey: 51}, {myKey: "cat", newKey: 92}]
```
