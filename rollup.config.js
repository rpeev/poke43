import copy from 'rollup-plugin-copy';
import html from 'rollup-plugin-html';
import sass from 'rollup-plugin-sass';
import json from 'rollup-plugin-json';
import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

import pkg from './package.json';

const pluginCopy = copy({
  'src/styles/poke43-dark.css': 'dist/poke43-dark.css'
});
const pluginHtml = html({
  
});
const pluginSass = sass({
  output: `dist/${pkg.name}.css`
});
const pluginJson = json({
  preferConst: true
});
const pluginBabel = babel({
  exclude: 'node_modules/**',
  plugins: [
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-proposal-object-rest-spread'
  ]
});
const pluginResolve = resolve({

});
const pluginCommonJS = commonjs({

});

const config = [{
  external: [
    'hammerjs',
    '@emmetio/expand-abbreviation'
  ],
  input: './src/index.js',
  output: {
    globals: {
      'hammerjs': 'Hammer',
      '@emmetio/expand-abbreviation': 'emmet'
    },
    format: 'umd',
    file: pkg.browser,
    name: pkg.name,
    sourcemap: true
  },
  plugins: [
    pluginCopy,
    pluginHtml,
    pluginSass,
    pluginJson,
    pluginBabel,
    pluginResolve,
    pluginCommonJS
  ],
  watch: {
    include: 'src/**'
  }
}, {
  external: [
    'hammerjs',
    '@emmetio/expand-abbreviation'
  ],
  input: './src/index.mjs',
  output: {
    format: 'es',
    file: pkg.module,
    sourcemap: true
  },
  plugins: [
    pluginCopy,
    pluginHtml,
    pluginSass,
    pluginJson,
    pluginBabel,
    pluginResolve,
    pluginCommonJS
  ],
  watch: {
    include: 'src/**'
  }
}];

export default config;
