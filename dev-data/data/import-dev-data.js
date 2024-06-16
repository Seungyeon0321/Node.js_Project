///////////////Command로 import랑 delete하기

const fs = require('fs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Tour = require('../../models/tourModel');

dotenv.config({ path: './config.env' });

//this is way to read the variables from our env file and save them

//Mongodb랑 접속하는 방법, mongoose를 이용
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

// .connect(process.env.DATABASE_LOCAL) //이렇게 local로도 접속가능
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log('DB connection successfull');
  });

// READ JSON FILE
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'),
);

//만약 여기서 ./으로 상위 폴더로 가게 되면 해당 파일의 상위 폴더가 아니라 이 노드가 실행되는 녀석의 상위 폴더가 되기 때문에 해당 파일을 찾지 못하게 된다.

// IMPORT DATA INTO DB
const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('DATA Loaded!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// DELETE ALL DATA FROM COLLECTION
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('DATA Delete!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}

console.log(process.argv);
//이렇게 하면 node process를 알게 된다
