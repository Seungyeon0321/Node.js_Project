const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError('No Document found with that Id', 404));
    }

    res.status(201).json({
      status: 'success',
      data: null,
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    //First of all, we need to query the data that I want to update
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      //if new is true, it will return the modified document rather than the original, defaults to false
      //mongoose의 queries doc에서 참조하여 필요한 것을 사용해볼 필요가 있음
      runValidators: true,
      //runValidation은 만약 update한 data가 schema에 적합하지 않은 타입이 들어왔는지 확인하여, 만약 적합하지 않다면 error을 return하는 역활을 한다
    });

    if (!doc) {
      return next(new AppError('No documents found with that Id', 404));
    }

    res.status(201).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.createOne = (Model) =>
  // const newTour = new Tour({})
  // newTour.save() 이런 두줄의 코드 작업을 create() 메소드를 이용해서 한번에 끝낼 수 있다

  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);

    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    if (!doc) {
      return next(new AppError('No document found with that Id', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    //To allow for nested GET reviews on tour
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .pagination();

    // const doc = await features.query.explain();
    const doc = await features.query;

    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: {
        data: doc,
      },
    });
  });
