const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

// name, email, photo, password, passwordConfirm
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A name must be filled'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  //photo is optional, just the path where the image is stored
  photo: String,
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    //password를 client에 보여주기 않기 위해서 select를 이 schema에 넣으면 됨
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      //This only works on CREATE and SAVE!!
      validator: function (el) {
        return el === this.password; // abc === abc
      },
      message: 'Passwords are not the same',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
});

//pre는 data를 받고 db에 저장하기 전에 동작하게 되는 미들웨어다
userSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  //위에서 validation만 성공을 한다면 굳이 해당 confirm을 저장할 필요는 없기 때문에 undefined으로 설정
  // Delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
  //We cannot compare these two passwords without this compare method
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );

    // console.log(changedTimestamp, JWTTimestamp);
    return JWTTimestamp < changedTimestamp; //100 < 200;
  }

  //default로 유저가 만약 password를 변경 안 했을 경우에는 그냥
  //false를 리턴해서 동작 안하게 만듬, False means Not changed
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  //새로운 토큰 생성, crypto는 built-in node.js 모듈이다
  //해당 토큰도 password랑 똑같은 기능을 하기 때문에 단순히 db에 저장하면 안된다
  const resetToken = crypto.randomBytes(32).toString('hex');

  //sha256는 알고리즘이다
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

//create a model from that schema
const User = mongoose.model('User', userSchema);

module.exports = User;
