const fs = require('fs');
const Tour = require('../models/tourModel');

// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`),
// );

//이렇게 ID가 valid한지를 서버에서 안하고 미들웨어에서 해줌으로써 여기 리퀘스트 받았을 때 handler은 오직 자기 목적에만 집중할 수 있다, Get, Post, Update 등등
exports.checkID = (req, res, next, val) => {
  // if (req.params.id * 1 > tours.length) {
  //   return res.status(404).json({
  //     stats: 'fail',
  //     message: 'Invalid ID',
  //   });
  // }
  next();
};

//왜 tours-simple.json에서 데이터를 참조하는지 모르겠음
// exports.checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(400).json({
//       stats: 'fail',
//       message: 'There is no Name or Price!',
//     });
//   }
//   next();
// };

exports.getAllTours = (req, res) => {
  console.log(req.requestTime);
  res.status(200).json({
    status: 'success',
    requestAt: req.requestTime,
    // results: tours.length, //얼마만큼의 object를 보내는지에 따라 이렇게 보낸다
    // data: {
    //   tours,
    // },
  });
};

exports.getTour = (req, res) => {
  console.log(req.params);
  // const id = req.params.id * 1;
  // const tour = tours.find((el) => el.id === id);

  // //오류 확인
  // // if (id > tours.length) {
  // // if (!tour) {
  // //   return res.status(404).json({
  // //     stats: 'fail',
  // //     message: 'Invalid ID',
  // //   });
  // // }

  // res.status(200).json({
  //   status: 'success',
  //   // results: tours.length, //얼마만큼의 object를 보내는지에 따라 이렇게 보낸다
  //   data: {
  //     tour,
  //   },
  // });
};

exports.postTours = (req, res) => {
  res.status(201).json({
    status: 'success',
    data: {},
  });
  // const newId = tours[tours.length - 1].id + 1;
  // const newTour = Object.assign({ id: newId }, req.body);

  // //실제로는 이렇게 바로 push를 하지 않고 유저가 보낸 post valid하는지를 체크한다
  // tours.push(newTour);

  //fs.writeFile()함수의 두번째 인자는 파일을 쓰고자 하는 데이터가 들어가야 한다. 데이터는 문자열로 표현되어야 하며, 일반적으로 js 객체나 배열을 JSON 문자열로 변환하여 파일에 쓰는데 사용합니다
  // fs.writeFile(
  //   `${__dirname}/dev-data/data/tours-simple.json`,
  //   JSON.stringify(tours),
  //   (err) => {
  //     //201은 create했다는 의미임
  //     res.status(201).json({
  //       status: 'success',
  //       data: {
  //         tours: newTour,
  //       },
  //     });
  //   },
  // );
};

exports.patchTour = (req, res) => {
  //client가 보내는 id가 해당 데이터보다 크다면 (없다는 뜻임), 이렇게 에러를 보내게 된다

  res.status(200).json({
    status: 'success',
    data: {
      tour: '<Updated tour here...>',
    },
  });
};

exports.deleteTour = (req, res) => {
  //client가 보내는 id가 해당 데이터보다 크다면 (없다는 뜻임), 이렇게 에러를 보내게 된다
  res.stats(204).json({
    status: 'success',
    data: null,
  });
};
