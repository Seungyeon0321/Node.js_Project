const Tour = require('../models/tourModel');

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

class APIfeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }

  pagination() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 1;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
  }
}

exports.getAllTours = async (req, res) => {
  try {
    ////////////BUILD QUERY
    //queryObj 기존의 query를 복사한다고 생각하면 됨, 그 다음에 그 녀석에다가 해당 excludedfileds를 지우는 거임, 해당 작업을 왜 하게 되냐면 나중에 pagenation같은 page가 url에 붙어버리기 때문에 그럴 경우에는 해당 find기능에서 duration + difficulty + page가 다 갖춰진 data를 찾기 때문에 해당 data의 값과 관련없는 url은 지워줘야 함, 그래서 이렇게 4개의 항목을 지운 query를 allTours variables에 저장

    //1) filtering
    // const queryObj = { ...req.query };
    // const excludedFields = ['page', 'sort', 'limit', 'fields'];
    // excludedFields.forEach((el) => delete queryObj[el]);

    // //mongdb에서는 모든 파일을 원할때는 find method를 이용한다, 해당 query method를 이용하게 되면 query를 리턴하게 되고 그렇게 되면 query의 prototype과 관련한 모든 method를 사용할 수 있게 된다

    // //2) Advanced filtering
    // let queryStr = JSON.stringify(queryObj);
    // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    // duration이 5보다 큰 녀석을 찾는 manual 코드
    // { difficulty: 'easy', duration: { $gte: 5 }}
    // { difficulty: 'easy', duration: { gte: 5 }} 만약 url에 gte을 넣은 url으로 request를 하게 되면 아래의 코드가 반환됨 그렇기에 $를 추가하는 로직을 만들어야 함
    // let query = Tour.find(JSON.parse(queryStr));
    // const allTours = await Tour.find()
    //   .where('duration')
    //   .equals(5)
    //   .where('difficulty')
    //   .equals('easy');

    /// 3) Sorting
    // if (req.query.sort) {
    //   const sortBy = req.query.sort.split(',').join(' ');
    //   query = query.sort(sortBy);

    //   // sort('price ratingsAverage') 와 같이 두가지를 넣고 싶다면 url 중간 ','가 들어감
    // } else {
    //   query = query.sort('-createdAt');
    // }

    /// 4) field
    // if (req.query.fields) {
    //   const fields = req.query.fields.split(',').join(' ');
    //   query = query.select(fields);
    // } else {
    //   query = query.select('-__v');
    // }
    // 여기서 -(마이너스)는 이거 빼고 다 보여달라는 얘기임

    //// 5)Pagination

    //여기서 limit이 한 페이지당 보여주는 갯수인 거 같음
    // page=2&limit=10, 1-10, page 1, 11-20, page 2, 21-30 page 3 만약 페이지 3의 결과가 필요하다면 page 20을 skip해야 한다. 이부분을 참고하여 skip을 계산해야 함
    // const page = req.query.page * 1 || 1;
    // const limit = req.query.limit * 1 || 1;
    // const skip = (page - 1) * limit;
    // console.log(page, skip, limit);

    // query = query.skip(skip).limit(limit);

    // //만약 찾는 갯수가 더이상 없을때에 대비한 코드도 짜줘야 한다
    // if (req.query.page) {
    //   const numTours = await Tour.countDocuments();
    //   if (skip >= numTours) throw new Error('This page does not exist');
    // }

    /////////////EXECUTE QUERY;
    const features = new APIfeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .pagination();

    const allTours = await features.query;
    // query.sort().select().skip().limit();
    // 이 method를 사용하게 되면 우리는 query를 return 받게 되고 그 query의 prototype의 method를 사용할 수 있게 된다

    //뒤에 query내용을 즉 params가 있을 경우에만 query한 녀석을 object로 받을 수 있다. 예를 들어서 127.0.01.1:3000/api/v1/tours?duration=5&&difficulty=easy 라고 요청 했을 때 duration 그리고 difficulty를 담은 오브젝트를 받을 수 있다

    //////////SEND RESPONSE
    res.status(200).json({
      status: 'success',
      results: allTours.length,
      data: {
        allTours,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'error',
      message: 'fail!',
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    //여기 params.id는 route가 동작할 때 :id 이 부분을 가지고 오게 된다
    const tour = await Tour.findById(req.params.id);
    //Tour.findOne({ _id: req.params.id})

    res.status(200).json({
      status: 'success',
      results: tour.length,
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: 'Cannot find any data',
    });
  }
};

exports.createTours = async (req, res) => {
  // const newTour = new Tour({})
  // newTour.save() 이런 두줄의 코드 작업을 create() 메소드를 이용해서 한번에 끝낼 수 있다
  try {
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'Invalid data sent!', //실제 현업에서는 이렇게 메세지만 보내서는 안된다고 조언하고 있음
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    //First of all, we need to query the data that I want to update
    const updateTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      //if new is true, it will return the modified document rather than the original, defaults to false
      //mongoose의 queries doc에서 참조하여 필요한 것을 사용해볼 필요가 있음
      runValidators: true,
      //runValidation은 만약 update한 data가 schema에 적합하지 않은 타입이 들어왔는지 확인하여, 만약 적합하지 않다면 error을 return하는 역활을 한다
    });

    res.status(201).json({
      status: 'success',
      data: {
        tour: updateTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'Invalid data sent!',
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    //이렇게 query를 리턴하게 되면 어떻게 해당 데이터를 삭제하는 것인가? 아무것도 저장할 필요가 없다 그냥 삭제하면 되는 거니깐

    res.status(201).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'Invalid data sent!',
    });
  }
};
