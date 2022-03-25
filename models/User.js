const mongoose = require('mongoose');


const userSchema = mongoose.Schema({
  name:{
    type:String,
    maxlength: 50
  },
  email:{
    type:String,
    trim: true, //sun min@naver.com 에서 sun과 min의 space를 없애줌
    unique:1
  },
  password:{
    type: String,
    minlength: 5
  },
  lastname:{
    type : String,
    maxlength: 50
  },
  role:{
    type: Number,
    default:0
  },
  image: String,
  token:{
    type:String
  },
  tokenExp:{
    type : Number
  }
})

const User = mongoose.model('User', userSchema) // Model은 스키마를 감싸주는 역할을 한다

module.exports={User} //User를 다른데에서 사용할 수 있게 module.exports를 해준다