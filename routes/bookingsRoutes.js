const express = require('express');
const bookingsController = require('../controllers/bookingsController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router.use(authController.protect);

// Client need to send the tour being booked
router.get('/checkout-session/:tourId', bookingsController.getCheckoutSession);

router.use(authController.restrictTo('admin', 'lead-guide'));

router
  .route('/')
  .get(bookingsController.getAllBookings)
  .post(bookingsController.createBooking);

router
  .route('/:id')
  .get(bookingsController.getBooking)
  .patch(bookingsController.updateBooking)
  .delete(bookingsController.deleteBooking);

module.exports = router;
