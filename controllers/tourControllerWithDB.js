const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

//만약 이 aliasTopTours가 없다면 url은 tours?limit=5&sort=-ratingsAverage.price

// exports.getAllTours = catchAsync(async (req, res, next) => {
//   ////////////BUILD QUERY
//   //queryObj 기존의 query를 복사한다고 생각하면 됨, 그 다음에 그 녀석에다가 해당 excludedfileds를 지우는 거임, 해당 작업을 왜 하게 되냐면 나중에 pagenation같은 page가 url에 붙어버리기 때문에 그럴 경우에는 해당 find기능에서 duration + difficulty + page가 다 갖춰진 data를 찾기 때문에 해당 data의 값과 관련없는 url은 지워줘야 함, 그래서 이렇게 4개의 항목을 지운 query를 allTours variables에 저장

//   //1) filtering
//   // const queryObj = { ...req.query };
//   // const excludedFields = ['page', 'sort', 'limit', 'fields'];
//   // excludedFields.forEach((el) => delete queryObj[el]);

//   // //mongdb에서는 모든 파일을 원할때는 find method를 이용한다, 해당 query method를 이용하게 되면 query를 리턴하게 되고 그렇게 되면 query의 prototype과 관련한 모든 method를 사용할 수 있게 된다

//   // //2) Advanced filtering
//   // let queryStr = JSON.stringify(queryObj);
//   // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

//   // duration이 5보다 큰 녀석을 찾는 manual 코드
//   // { difficulty: 'easy', duration: { $gte: 5 }}
//   // { difficulty: 'easy', duration: { gte: 5 }} 만약 url에 gte을 넣은 url으로 request를 하게 되면 아래의 코드가 반환됨 그렇기에 $를 추가하는 로직을 만들어야 함
//   // let query = Tour.find(JSON.parse(queryStr));
//   // const allTours = await Tour.find()
//   //   .where('duration')
//   //   .equals(5)
//   //   .where('difficulty')
//   //   .equals('easy');

//   /// 3) Sorting
//   // if (req.query.sort) {
//   //   const sortBy = req.query.sort.split(',').join(' ');
//   //   query = query.sort(sortBy);

//   //   // sort('price ratingsAverage') 와 같이 두가지를 넣고 싶다면 url 중간 ','가 들어감
//   // } else {
//   //   query = query.sort('-createdAt');
//   // }

//   //URL =? tours?fields=name.duration.difficulty.price
//   /// 4) field
//   // if (req.query.fields) {
//   //   const fields = req.query.fields.split(',').join(' ');
//   //   select는 해당 fileds name의 String을 가지고 있는 녀석에 접근할 수 있다
//   //   query = query.select(fields);
//   // } else {
//   //   query = query.select('-__v');
//   // }
//   // 여기서 -(마이너스)는 이거 빼고 다 보여달라는 얘기임

//   //// 5)Pagination

//   //여기서 limit이 한 페이지당 보여주는 갯수인 거 같음
//   // page=2&limit=10, 1-10, page 1, 11-20, page 2, 21-30 page 3 만약 페이지 3의 결과가 필요하다면 page 20을 skip해야 한다. 이부분을 참고하여 skip을 계산해야 함
//   // const page = req.query.page * 1 || 1; // *1를 해주는 것은 string을 number바꿔주기 위함임
//   // const limit = req.query.limit * 1 || 100;
//   // const skip = (page - 1) * limit;
//   // console.log(page, skip, limit);

//   // query = query.skip(skip).limit(limit);

//   // //만약 찾는 갯수가 더이상 없을때에 대비한 코드도 짜줘야 한다
//   // if (req.query.page) {
//   //   const numTours = await Tour.countDocuments();
//   //   if (skip >= numTours) throw new Error('This page does not exist');
//   // }

//   /////////////EXECUTE QUERY;
//   // const queryResult = await Tour.find();

//   const features = new APIfeatures(Tour.find(), req.query)
//     .filter()
//     .sort()
//     .limitFields()
//     .pagination();

//   const allTours = await features.query;
//   // const allTours = await Tour.find();

//   // query.sort().select().skip().limit();
//   // 이 method를 사용하게 되면 우리는 query를 return 받게 되고 그 query의 prototype의 method를 사용할 수 있게 된다

//   //뒤에 query내용을 즉 params가 있을 경우에만 query한 녀석을 object로 받을 수 있다. 예를 들어서 127.0.01.1:3000/api/v1/tours?duration=5&&difficulty=easy 라고 요청 했을 때 duration 그리고 difficulty를 담은 오브젝트를 받을 수 있다

//   //all tour에 404 error을 추가하지 않는 이유는 아무리 제로 데이터의 결과를 반환하더라도 성공적으로 search를 했고 그 결과가 없으니 0를 리턴했기 때문에 정확히 보자면 200에 가깝기 때문에

//   //////////SEND RESPONSE
//   res.status(200).json({
//     status: 'success',
//     results: allTours.length,
//     data: {
//       allTours,
//     },
//   });
// });

// If I want to have reference model, this populate method is fundamental,
// remember, population will create the new queue, so if I have a huge application,
// I need to think about using this populate method.
// exports.getTour = catchAsync(async (req, res, next) => {
//   //여기 params.id는 route가 동작할 때 :id 이 부분을 가지고 오게 된다
//   const tour = await Tour.findById(req.params.id).populate('reviews');
//   //Tour.findOne({ _id: req.params.id})

//   if (!tour) {
//     return next(new AppError('error', 404));
//   }

//   //여기서 return을 안하면 아래의 코드로 move on 해버리기 때문에 에러가 발생하면 바로 next을 이용해서 해당 middleware로 처리를 옮겨야 한다
//   res.status(200).json({
//     status: 'success',

//     data: {
//       tour,
//     },
//   });
// });

//이 코드로 try, catch문을 안 만들고 그대로 res만 받는 로직만 쓸 수 있게 해준다 catchAsync.js로 이사
// const catchAsync = (fn) => {
//   return (req, res, next) => {
//     fn(req, res, next).catch(next);
//   };
// };

exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, {
  path: 'reviews',
});
exports.createTours = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);
// exports.deleteTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndDelete(req.params.id);
//   //이렇게 query를 리턴하게 되면 어떻게 해당 데이터를 삭제하는 것인가?
//   //아무것도 저장할 필요가 없다 그냥 삭제하면 되는 거니깐

//   if (!tour) {
//     return next(new AppError('No tour found with that Id', 404));
//   }

//   res.status(201).json({
//     status: 'success',
//     data: null,
//   });
// });

///////////////////////Data aggregation/////////////////
//해당 aggregation을 쓰게 되면 내가 가지고 있는 모든 데이터의 평균을 구할 수 있다//

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      //만약 5개의 averatings이 있다면 해당 ratings을 group화해서 평균을 내어줌
      $group: {
        // _id: '$ratingsAverage',
        //여기 id에 만약 투어의 difficulty에 따른 평균이 구하고 싶을때 이렇게 넣어주면 됨, easy의 투어에는 몇개의 투어가 있고 가장 비싼 가격은 얼마이며 등등
        _id: '$difficulty',
        //해당 pipeline을 모두 지나가니까 지나갈때마다 1이 증가되는 느낌이라고 생각하면 될듯
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
    {
      //이렇게 함으로써 easy의 난이도를 가지고 있는 difficulty의 data는 안보게 된다, 이렇게 위에서 한번 match를 하고 아래에서 또 한번 그 작업을 수행할 수 있다, 좀 더 범위를 좁힐 수 있다
      $match: { _id: { $ne: 'easy' } },
    },
  ]);

  res.status(201).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      //startingDates가 여러개 있다면 그 순서대로 나열해서 1데이터 안에서도 여러개로 나눠준다,
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStates: { $sum: 1 },
        //결과는 id는 해당 달이 되고 numTour은
        //몇개의 투어가 있는지 알려준다
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        //project을 이용해서 해당 필드의 값을 0으로 하면 나타나지 않고 1로 하면 나타나게 된다
        _id: 0,
      },
    },
    {
      //pipe라인으로 정해준 객체를 키로 지정후,
      // 1 혹은 -1로 어떻게 정렬할건지를 정한다
      $sort: { numTourStates: 1 },
    },
    {
      //6개만 보여줌
      $limit: 6,
    },
  ]);

  res.status(201).json({
    status: 'success',
    data: {
      plan,
    },
  });
});

//GeoSpatial queries

// format
// /tours-distance/233/center/-40,45/unit/mi
exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    next(new AppError('Please provide latitude and longitude', 400));
  }

  console.log(distance, latlng, unit);

  const tours = await Tour.find({
    startLocation: {
      $geoWithin: { $centerSphere: [[lng, lat], radius] },
    },
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours,
    },
  });
});

//Get how far the tour is from the written location through URL
exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    next(new AppError('Please provide latitude and longitude', 400));
  }

  //geoNear is the only aggregation pipeline that can be used with the find method, needs to be the first one ine the pipeline
  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: { type: 'Point', coordinates: [lng * 1, lat * 1] },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      data: distances,
    },
  });
});
