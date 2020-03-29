export const catchDBError = () => (err: Error) => {
  console.log(err);
  throw new Error('데이터베이스 에러');
};

export const throwError = (msg: string) => {
  throw new Error(msg);
};
