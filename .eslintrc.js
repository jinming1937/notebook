module.exports = {
  /* 当前为根目录，不在向上查找.eslintrc 文件 */
  root: true,
  /* 默认espima, babel-eslint, @typescript-eslint/parser etc. */
  parser: '@typescript-eslint/parser',
  /* 解析器配置参数 */
  parserOptions: {
    // ecmaFeatures: {},
    // project: 'tsconfig.json',
    // tsconfigRootDir: './'
    // include: [
    //   "src/**/*.ts",
    //   // if you have a mixed JS/TS codebase, don't forget to include your JS files
    //   "src/**/*.js"
    // ]
  },
  plugins: ['prettier'],
  // extends: ['prettier'],
  env: {
    // 对一个环境定义的一组全局变量的预设（类似于 babel 的 presets）
    amd: true,
    commonjs: true
  },
  extends: ['plugin:@typescript-eslint/eslint-plugin'],
  globals: {
    // 这里填入你的项目需要的全局变量
    // 这里值为 false 表示这个全局变量不允许被重新赋值，比如：
    // 用于 jest-puppeteer
    page: true,
    browser: true,
    context: true,
    jestPuppeteer: true
  },
  rules: {
    'prettier/prettier': 'error',
    // allow async-await
    'generator-star-spacing': 'off',
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    camelcase: ['error', {properties: 'never'}]
  }
}
