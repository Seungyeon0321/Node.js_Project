const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

//mergeParams을 true 바꾼다
const router = express.Router({ mergeParams: true });

//왜 merge냐면
// POST /tour/234fad4/reviews
// POST /reviews 둘다 동일하기 때문이다

router.use(authController.protect);

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.createReview,
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.restrictTo('user', 'admin'),
    reviewController.updateReview,
  )
  .delete(
    authController.restrictTo('user', 'admin'),
    reviewController.deleteReview,
  );

module.exports = router;

// POST /tour/234fad4/reviews
// GET /tour/234fad4/reviews
