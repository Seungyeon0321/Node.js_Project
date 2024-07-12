const Review = require('../models/reviewModel');
const factory = require('./handlerFactory');

//해당 middleware는 원래 createReview안에 있었지만 이렇게 미들웨어로 따로 빼서
//사용하게 되면 factory function에 사용할 수 있게 된다
exports.setTourUserIds = (req, res, next) => {
  // Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
