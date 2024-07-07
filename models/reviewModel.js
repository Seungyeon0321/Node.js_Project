const mongoose = require('mongoose');
// review / rating / createdAt / ref to tour / ref to user

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review cannot be empty'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour.'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user.'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// 2개의 정보가 있다면 이렇게 두번의 populate를 사용한다
reviewSchema.pre(/^find/, function (next) {
  // 여기서 tour을 populate하게 되면, tour에서 virtual populate를 할 시에,
  // chain이 일어나게 된다,

  // this.populate({
  //   path: 'tour',
  //   select: 'name',
  // }).populate({
  //   path: 'user',
  //   select: 'name photo',
  // });

  this.populate({ path: 'user', select: 'name photo' });

  next();
});

const Review = mongoose.model('Review', reviewSchema, 'reviews');

module.exports = Review;

// review 남길때 현재 접속해 있는 url의 투어와 그리고 login되어 있는 녀석으로 되어야 하기
// 때문에, 이러한 기능을 하는 것이 nested route이다. 보게 되면 tour 라우트에
// review가 있기 때문에
