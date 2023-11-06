// module.exports = (fn) => {
//   return (req, res, next) => {
//     fn(req, res, next).catch(next);
//   };
// };

module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((err) => {
      console.error(err); // 오류 로깅
      next(err); // 오류를 다음 미들웨어로 전달
    });
  };
};
