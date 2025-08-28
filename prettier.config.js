// We try to use as much defaults as possible.
// For defaults see: https://prettier.io/docs/options

const prettierConfiguration = {
  // There is a general oculus rule to use 120 characters per line
  printWidth: 120,
  // There is a general oculus rule to use 4 spaces for indentation
  tabWidth: 4,
  // We decided to use the shorter syntax for arrow functions as it is already used in our projects
  arrowParens: "avoid",
};

export default prettierConfiguration;
