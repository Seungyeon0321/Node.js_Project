const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

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

exports.updateTour = (Model) =>
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
