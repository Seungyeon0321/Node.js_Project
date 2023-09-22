const mongoose = require('mongoose');

////Mongoose이용해서 schema 만들기
const tourSchema = new mongoose.Schema({
  // 이런식으로 만들어도 되지만 우리는 더 많은 옵션을 넣을 수 있다.
  // name: String,
  // rating: Number,
  // price: Number,

  // 더 많은 옵션 version
  name: {
    type: String,
    required: [true, 'A tour must have a name'],
    unique: true,
    //unique가 있기 때문에 만약 unique하지 않으면 MongoError: E11000 duplicate key error collection라는 에러가 발생한다
    trim: true,
  },
  duration: {
    type: Number,
    required: [true, 'A tour must have a duration'],
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'A tour must have a group size'],
  },
  difficulty: {
    type: String,
    required: [true, 'A tour must have a difficulty'],
  },
  ratingsAverage: {
    type: Number,
    default: 4.5,
  },
  ratingsQuantity: {
    type: Number,
    default: 0,
  },
  price: {
    type: Number,
    required: [true, 'A tour must have a price'],
  },
  priceDiscount: Number,
  summary: {
    type: String,
    trim: true,
    required: [true, 'A tour must have a description'],
  },
  description: {
    type: String,
    trim: true,
  },
  imageCover: {
    type: String,
    required: [true, 'A tour must have a cover image'],
  },
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false,
    //이렇게 client한테 보여주고 싶지 않은 데이터는 select false로 설정하면 된다
  },
  startDates: [Date],
});
//model을 만들때는 무조건 앞자리는 대문자로!, 첫번째 arg는 schema의 이름, 두번째는 그 documents들
const Tour = mongoose.model('Tour', tourSchema);

////////////////아래 코드는 test였음/////////////
// Documnet 만들기 Tour의 instace가 되기 때문에 Tour안에 들어가 있는 method를 사용해서 database에 저장할 수 있다
// const testTour = new Tour({
//   name: 'the Forest Hiker',
//   rating: 4.7,
//   price: 497,
// });

// testTour
//   .save()
//   .then((doc) => {
//     console.log(doc);
//   })
//   .catch((err) => {
//     console.log(err);
//   });

//이 model 섹션에서는 이렇게 스키마만 제공하고 실제로 CRUD는 controller에서 진행하기 때문에 이렇게 export해준다
module.exports = Tour;
