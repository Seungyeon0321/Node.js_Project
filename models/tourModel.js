const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
const User = require('./userModel');
const { pipeline } = require('nodemailer/lib/xoauth2');

////Mongoose이용해서 schema 만들기
const tourSchema = new mongoose.Schema(
  {
    // 이런식으로 만들어도 되지만 우리는 더 많은 옵션을 넣을 수 있다.
    // name: String,
    // rating: Number,
    // price: Number,

    // 더 많은 옵션 version
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      //unique가 있기 때문에 만약 unique하지 않으면
      //MongoError: E11000 duplicate key error collection라는 에러가 발생한다, unique는 technical하게 validation은 아니라고 본다, required은 validation임
      trim: true,
      //maxlength/minlength도 validater이다, 해당

      //validation을 적용하려면 각 runValidators: true로 설정해야 한다
      maxlength: [40, 'A tour name must have less or equal than 40 characters'],
      minlength: [10, 'A tour name must have more or equal than 10 characters'],
      //validator의 library 사용, 해당 method를 call을 하지 않고 그냥 참조만 하게 해둬야함
      // validate: [validator.isAlpha, 'tour name must only contain characters'],
    },
    slug: String,
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
      //enum은 string하고만 동작한다, no number!
      enum: {
        values: ['easy', 'medium', 'hard'],
        message: 'Difficulty must be easy, medium or hard',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      //min max 역시 validator
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: (val) => Math.round(val * 10) / 10, /// 4.66666 46.666666 4.7
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      //validate를 이용해서 이렇게 custom validator을 만들 수 있다, 해당 기능은 validator라는 library을 이용해서 쉽게 사용할 수 있다

      //validator github에서 자세한 정보를 얻을 수 있다
      validate: {
        validator: function (val) {
          // this only points to current doc on NEW document creation
          return val < this.price; //100 < 200;
        },
        //여기서 VALUE은 몽구스의 하나의 특징으로 function의 매개변수 val의 값이 들어오게 된다
        message: 'Discount price ({VALUE}) must be below regular price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary'],
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
      //이렇게 client한테 보여주고 싶지 않은 데이터는 select false로 설정하면 client에게 해당 data를 보내지지 않게 된다, default로
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    //mongoDB에서 geographical data를 정의하기 위해서는 아래와 같이
    startLocation: {
      // GeoJSON is to specify geography data, and this is not schema type object like ones above
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number, //date will be the day of the tour in which people will go to this location
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);
//model을 만들때는 무조건 앞자리는 대문자로!, 첫번째 arg는 schema의 이름, 두번째는 그 documents들

////////////////아래 코드는 test였음/////////////
// Document 만들기 Tour의 instance가 되기 때문에 Tour안에 들어가 있는 method를 사용해서 database에 저장할 수 있다
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

//compound index
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

//해당 virtual을 이용하면 시간같은 경우는 day에서 week로 convert해주고 거리같은 경우는 km를 mile로 바꿔주는 기능이 있다

//주의 사항으로는 여기서 arrow function을 쓰게 되면 아래 들어갈 this가 작동을 안하게 됨으로 일반 함수가 들어가야한다

tourSchema.virtual('durationWeeks').get(function () {
  //여기 callback function에 how to calculate의 로직이 들어가야한다
  return this.duration / 7;
});

// This is a virtual populate, 즉 가상의 populate이다, 실상의 populate가 아니라는 뜻이다,
// 이렇게 함으로써 child document를 참조할 수 있게 된다
tourSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'tour',
});

///////DOCUMENT MIDDLEWARE: run before .save() and .create() 'save'는 오직 이 두개의 method와 동작한다, 기억해라!

//pre는 is gonna run before an actual event. 아래의 로직을 설명하자면 뒤에 callback function을 해당 save action이 실행하기 전에 동작한다고 생각하면 된다
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});
//위에 middleware는 해당 데이터가 저장되기 전에 slug를 생성 그 다음에 slug를 저장하게 된다

//embedding tour guides
// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

// tourSchema.pre('save', function (next) {
//   console.log('Will save document...');
//   next();
// });

// tourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });

////////////////QUERY MIDDLEWARE/////////////////
// this will point the query, not the document
tourSchema.pre('find', function (next) {
  this.find({ secretTour: { $ne: true } });
  next();
});
//어떻게 동작하냐면 getAlltour을 하게 되면 find() 메서드가 동작하는데 그 때 이 find middleware도 동작하게 됨, 그다음에 이 this가 해당 query를 가르키게 되고 그 query 중에서 secretTour가 not equal, 즉 false인 녀석들을 불러오게 됨, 하지만 이렇게 find를 하게 되면 findOne()에 대한 동작은 안하게 된다. 이를 해결하기 위해서는 regular expression을 사용하게 된다,
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});
// /^find/는 find로 시작하는 모든 녀석을 칭함

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });

  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start}`);

  next();
});

// If there is a duplication code, I can use this middleware to avoid it.

/////////////aggregation middleware///////////////
// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });

//   console.log(pipeline());
//   //여기서 this는 current aggregation object를 가르키게 된다//
//   next();
// });

const Tour = mongoose.model('Tour', tourSchema, 'tours');

module.exports = Tour;
