/* eslint-disable no-useless-escape */
export const validateEmail = (value: string) => {
  return String(value)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

// match http or https
export const isValidPrefixURL = (url: string) => {
  const regexURL = new RegExp('^(http|https)://', 'i');
  return regexURL.test(url);
};

export const isValidDotComURL = (value: string) => {
  const expression =
    /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi;
  const regex = new RegExp(expression);
  return value.match(regex) != null;
};
