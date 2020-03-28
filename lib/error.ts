export const catchDBError = () => (err: Error) => {
  console.log(err);
  throw new Error('Database Error');
};

export const throwError = (msg: string) => {
  throw new Error(msg);
};
