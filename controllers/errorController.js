/// develop 환경에 따른 에러의 handle의 차이를 둠/////////

const AppError = require('../utils/appError');

/// 만약 dev환경에서 에러가 발생한다면 에러가 어디에서 발생했는지에 대한 구체적인 정보를 제공하고, prod환경에서 에러가 발생하게 되면 간단한 generic 메세지만 보내게 됨, 그리고 그 안에서도 만약 operational error가 아닌 경우에는 (third-party library)에서 발생했다던지 하는 에러는 console.error을 통해서 그 내용을 받고 아닐 경우에는 그냥 generic error 메세지를 전송

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/);
  const message = `Duplicate field value: x. Please use another value!`;
  console.log(value);
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const erros = Object.values(err.errors).map((el) => e.message);

  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error : send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });

    //Programming or other unknown error: don't leak error details
  } else {
    // 1) Log error
    console.error('Error!!!!!!!!!!!', err);

    // 2) Send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
};

module.exports = (err, req, res, next) => {
  // console.log(err.stack); //이 err.stack은 어디서 에러가 발생했는지 알려준다

  //need to know status code
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'developmnet') {
    sendErrorDev(err, res);
    //code가 지저분할 때는 이런식으로 함수에 담아서 넣어서 사용할 수도 있다
  } else if (process.env.NODE_EVN === 'production') {
    // postMan에서 url을 잘못 입력하는 에러를 발생 시키면 해당 에러에 대한 이름을 얻을 수 있기 때문에 이를 이용해서 각 상황에 맞는 error handling을 할 수 있다.
    let error = { ...err };

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    //mongoose에서 제공되는 error에 관한 object에서 사용하고 싶을 녀석을 골라서 그게 맞는 에러 컨트롤을 함
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
  }
};
