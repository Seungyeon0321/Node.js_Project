module.exports = (err, req, res, next) => {
  // console.log(err.stack); //이 err.stack은 어디서 에러가 발생했는지 알려준다

  //need to know status code
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};
