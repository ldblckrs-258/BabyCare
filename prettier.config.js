module.exports = {
  printWidth: 100,
  tabWidth: 2,
  singleQuote: true,
  bracketSameLine: true,
  trailingComma: 'es5',
  endOfLine: 'auto',
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  plugins: [
    require.resolve('prettier-plugin-tailwindcss'),
    '@trivago/prettier-plugin-sort-imports',
  ],
  tailwindAttributes: ['className'],
};
