const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1) Get tour data from collection
  const tours = await Tour.find();

  // 2) Build template

  // 3) Render that template using tour data from 1)

  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "default-src 'self' https://*.stripe.com https://*.mapbox.com; connect-src 'self' http://127.0.0.1:3000 https://api.stripe.com http://127.0.0.1:3000/api/v1/*; base-uri 'self'; block-all-mixed-content; font-src 'self' https: data:; frame-ancestors 'self'; img-src 'self' data:; object-src 'none'; script-src https://js.stripe.com/ https://cdnjs.cloudflare.com https://api.mapbox.com 'self' blob:; script-src-attr 'none'; style-src 'self' https: 'unsafe-inline''http://*.googleapis.com/css'; upgrade-insecure-requests;",
    )
    .render('overview', {
      title: 'All Tours',
      tours,
    });
});

exports.getTour = catchAsync(async (req, res, next) => {
  // 1) get the data, for the requested tour (including reviews and guides)

  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  if (!tour) {
    return next(new AppError('There is no tour with that name.', 404));
  }

  // 2) Build template

  // 3) Render template using data from 1)
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "default-src 'self' https://*.stripe.com https://*.mapbox.com; connect-src 'self' http://127.0.0.1:3000 https://api.stripe.com https://*.mapbox.com https://api.mapbox.com http://127.0.0.1:3000/api/v1/*; base-uri 'self'; block-all-mixed-content; font-src 'self' https: data:; frame-ancestors 'self'; img-src 'self' data:; object-src 'none'; script-src https://js.stripe.com/ https://cdnjs.cloudflare.com https://api.mapbox.com 'self' blob:; script-src-attr 'none'; style-src 'self' https: 'unsafe-inline'; upgrade-insecure-requests;",
    )
    .render('tour', {
      title: `${tour.name} Tour`,
      tour,
    });
});

exports.getLoginForm = catchAsync(async (req, res, next) => {
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "default-src 'self' https://*.stripe.com https://*.mapbox.com; connect-src 'self' http://127.0.0.1:3000 https://*.mapbox.com https://api.mapbox.com; base-uri 'self'; block-all-mixed-content; font-src 'self' https: data:; frame-ancestors 'self'; img-src 'self' data:; object-src 'none'; script-src https://js.stripe.com/ https://cdnjs.cloudflare.com https://api.mapbox.com 'self' blob:; script-src-attr 'none'; style-src 'self' https: 'unsafe-inline'; upgrade-insecure-requests;",
    )
    .render('login', {
      title: 'Log into your account',
    });
});

exports.getAccount = catchAsync(async (req, res, next) => {
  // 이미 protect 미들웨어에서 user에 대한 정보를 pug에 보냈기 때문에
  // 여기서는 그냥 렌더링만 하면 된다.
  res.status(200).render('account', {
    title: 'My account',
  });
});

exports.getMyTours = catchAsync(async (req, res, next) => {
  // 1) Find all bookings
  const bookings = await Booking.find({ user: req.user.id });
  // 2) Find tours with the returned IDs
  const tourIDs = bookings.map((el) => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIDs } });

  res.status(200).render('overview', {
    title: 'My Tours',
    tours,
  });
});

exports.updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  res.status(200).render('account', {
    title: 'Your account',
    user: updatedUser,
  });
});
