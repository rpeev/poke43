import {
  name as LIB_NAME,
  version as LIB_VERSION
} from '../package.json';

const poke43 = {
  get [Symbol.toStringTag]() {
    return LIB_NAME;
  },
  version: LIB_VERSION
};

export default poke43;
