/* eslint-disable promise/param-names */
// export const AbortWrapper = async (
//   request: () => any,
//   signal: AbortController
// ) => {
//   signal.signal.addEventListener('abort', () => {
//     throw new DOMException('request aborted', 'Abort Error');
//   });
//   console.log('asdasd');
//   return await request();
// };

export const AbortWrapper = <T = any>(
  request: () => Promise<T>,
  signal: AbortSignal
) => {
  return new Promise<T>((res, rej) => {
    const error = new DOMException('aborted!', 'AbortError'); // [3]
    if (signal.aborted) {
      return rej(error); // [2]
    }
    const execute = async () => res(await request());
    const timeout = setTimeout(execute, 0);
    signal.addEventListener('abort', () => {
      clearTimeout(timeout);
      rej(error);
    });
  });
};
