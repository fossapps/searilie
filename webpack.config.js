module.exports = {
    /** Build from built js file */
    entry: {
      searialie_all: './lib/index.js',
      searialie: './lib/Searilie.js',
      tinyAdapter: './lib/adapters/TinyCompressor.js',
      CsvAdapter: './lib/adapters/CSVCompressor.js',
    },
    output: {
        filename: './umd/[name].js',
        libraryTarget: 'umd',
        library: 'searilie'
    }
};
