const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

//jwt.sing(payload, secret, option)
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  //the way to send cookie in express
  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

//jwt를 이용해서 sign up하기
exports.signup = catchAsync(async (req, res, next) => {
  // 이렇게 하면 모든 유저의 데이터를 받아오기 때문에 필요한 부분만 받아야 한다
  // const newUser = await User.create(req.body);

  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role,
  });
  createSendToken(newUser, 201, res);
  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) check if email and password exist in our db.
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }
  // 2) check if user exists && password is correct, data를 받을 때 password를 못 받게 modeling했기 때문에,
  //이렇게 select('+password')를 넣어준거다
  const user = await User.findOne({ email }).select('+password');

  // comes from userModel, we can use it like below
  // const correct = await user.correctPassword(password, user.password);

  //따로 if state를 만들게 되면 potential attack 가능성을 열어줄 수 도 있게 된다
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }
  // 3) If everything ok, send token to client
  createSendToken(user, 200, res);
});

////////////////IMPORTANT//////////////////////////
exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    //startsWith은 해당 데이터가 ()안에 들어있는 녀석인지 체크하는 method이다
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
    //bearer asjkfslfj 식으로 구성되어 있으니까 뒤에 녀석만
    //저장할 수 있도록 split(' ')[1]를 붙여준다
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401),
    );
  }
  // 2) Verification token - promisify에 대해서 좀 더 알아보기 - 토큰이 expired 됐는지 아니면 누가 modified 했는지 체크
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists - 만약 token이 issue되고 나서
  // 유저가 없는 경우, 계정 삭제라든지 등등
  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(
      new AppError('The user belong to this token does no longer exist', 401),
    );
  }
  // 4) Check if user changed password after the token was issued
  //괄호 안에 있는 녀석이 true이면 에러를 발생하도록 한다, 토큰이 issue되고
  //비번이 바꼇다는 의미이기 때문에
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! please log in again', 401),
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  next();
});

//Only certain user can access a certain resource such as delete tours
//미들 웨어는 보통 argument를 못 받는데 받게 할 수 있는 방법, 자세히 알아볼 필요가 있어보임
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin', 'lead-guide']. role = 'user'
    //여기서 req.user은 currentUser이다, 위의 middleware에서 pass된 녀석이 오게 되어있음
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403),
      );
    }

    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({
    email: req.body.email,
  });

  if (!user) {
    return next(new AppError('There is no user with email address.', 404));
  }

  // 2) Generate the radom reset token, 코드가 길어지기 때문에 이 역시도
  // mongoose의 instance method를 이용한다,
  const resetToken = user.createPasswordResetToken();

  //여기서 save를 하지 않으면 database에 들어가지 않는다
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    'host',
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to : ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10min)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error sending the email, try again later',
        500,
      ),
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  //we need to identify user and create the temporal token with the expires duration
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Update changedPasswordAt property for the user
  // 4) Log the user in, send JWT
  createSendToken(user, 200, res);
});

exports.updateUserPassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  const user = await User.findById(req.user.id).select('+password');

  // 2) check if POSTed current password is correct (compare the password with the one in database)
  if (
    !user ||
    !(await user.correctPassword(req.body.passwordCurrent, user.password))
  ) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // 3) if everything ok, then update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  // User.findByIdAndUpdate는 왜 이용을 안할까? 2 가지 이유 때문에
  // i) user schema에 있는 password confirm의 validation function이 작동을 안하게 됨
  // ii) 그리고 pre middleware이 작동 안하게 됨, meaning that encrypt하지 않게 됨

  // 4) log user in, send JWT
  createSendToken(user, 200, res);
});
