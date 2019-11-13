# Searilie

[![Greenkeeper badge](https://badges.greenkeeper.io/fossapps/searilie.svg)](https://greenkeeper.io/)
[![Build Status](https://travis-ci.com/fossapps/searilie.svg)](https://travis-ci.com/fossapps/searilie)
[![GitHub issues](https://img.shields.io/github/issues/fossapps/searilie.svg)](https://github.com/fossapps/searilie/issues)
[![codecov](https://codecov.io/gh/fossapps/searilie/branch/master/graph/badge.svg)](https://codecov.io/gh/fossapps/searilie)
[![devDependencies Status](https://david-dm.org/fossapps/searilie/dev-status.svg)](https://david-dm.org/fossapps/searilie?type=dev)
[![dependencies Status](https://david-dm.org/fossapps/searilie/status.svg)](https://david-dm.org/fossapps/searilie)
[![bundle size](https://img.shields.io/bundlephobia/minzip/searilie)](https://bundlephobia.com/result?p=searilie)

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

## Tiny Number Compressor
This compressor only numbers by serializing into base 36 values saving some space,
But in order to serialize and deserialize, it requires to know the number of spaces to allocate in advance.

Tiny number compressor accepts a key to char length factory, which is to provide number of spaces to allocate for a given key,

For our example, let's say our object looks like this:
`{a: 100, b: 1, c: 2}` and we know for a fact that b and c won't go above the value 35, then we can use the following

```typescript
import {Searilie, ValueType} from "./src/Searilie"; 
import {TinyNumberCompressor} from "./src/adapters/TinyNumberCompressor"
const tinyNumberCompressor = new TinyNumberCompressor((key) => key === "a" ? 2 : 1);
const searlie = new Searilie(tinyNumberCompressor);
searlie.encode([{a: 100, b: 25, c: 9}]); // C2sp9
searlie.decode("C2sp9", {a: ValueType.Number, b: ValueType.Number, c: ValueType.Number}); // [{a: 100, b: 25, c: 9}]
```

#### Choosing correct space values:
Number of spaces are determined by ((36 ^ N) - 1) `(36 ** n) - 1` where N is number of spaces, for a quick references here are first 5 values:

- n = 1 gets you from 0 - 35
- n = 2 gets you from 0 - 1295
- n = 3 gets you from 0 - 46655
- n = 4 gets you from 0 - 1679615
- n = 5 gets you from 0 - 60466175

## CSVCompressor
separates data using , and ; producing larger payloads, but it can support more than 1 character payloads:
```typescript
import {Searilie} from "./src/Searilie"
import {CSVCompressor} from "./src/adapters/CSVCompressor"; 
const serialization = new Searilie(new CSVCompressor());
console.log(serialization.encode([{a: "kick", b: 51}, {a: "cat", b: 92}])); // Bkick,51;cat,92
```

## Deserialization
the first character on encoded payload denotes which compressor was used, we need to use the same compressor to ensure we don't load everything at once, we don't import everything and check it for you.
```typescript
import {Searilie, ValueType} from "./src/Searilie"
import {CSVCompressor} from "./src/adapters/CSVCompressor"; 
const serialization = new Searilie(new CSVCompressor());
console.log(serialization.decode("Bkick,51;cat,92", {a: ValueType.String, b: ValueType.Number})); // [{a: "kick", b: 51}, {a: "cat", b: 92}]
console.log(serialization.decode("Bkick,51;cat,92", {myKey: ValueType.String, newKey: ValueType.Number})); // [{myKey: "kick", newKey: 51}, {myKey: "cat", newKey: 92}]
```

## With headers
by trading off some character spaces, we can also encode data with keys so we don't need to provide schema while decoding

```typescript
import {Searilie} from "./src/Searilie"
import {CSVCompressor} from "./src/adapters/CSVCompressor"; 
const serialization = new Searilie(new CSVCompressor());
console.log(serialization.encodeWithHeaders([{a: "kick", b: 51}, {a: "cat", b: 92}])); // Ba,|b:kick,51;cat,92
console.log(serialization.decodeUsingHeaders("Ba,|b:kick,51;cat,92")); // [{a: "kick", b: 51}, {a: "cat", b: 92}]
```
