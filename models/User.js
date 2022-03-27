const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); 
const saltRounds = 10;//saltRounds == 몇글자짜리인지-> slat를 먼저 생성 -> Salt를 이용해서 비밀번호를 암호화해야함
const jwt = require('jsonwebtoken');

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

//index.js에 save(유저 정보를 저장하는 함수)가 실행되기 전에 실행됨 
//-> 이 함수 또한 몽고디비에서 지원하는 함수
userSchema.pre('save',function(next){
  var user = this;

  // 패스워드가 변경될때만 비밀번호를 암호화 한다.
  if(user.isModified('password')){
      //비밀번호를 암호화 시킨다. -> bcrypt 사이트에 공개되어있는 코드
     bcrypt.genSalt(saltRounds,function(err,salt){
      if(err) return next(err);

      bcrypt.hash(user.password,salt,function(err,hash){
        if(err) return next(err);
        user.password = hash; // hash된 비밀번호로 비밀번호 교체 
        next();
     })
    })
  }else{
    next();
  }
})

userSchema.methods.comparePassword = function(plainpassword, callback){

  //plainpassword 1234567 암호화된 비밀번호 $2b$10$WZYd.ZW9W1w1hiAVtmqNsOHFInCWddIWMzWpssWdLulv5TXGhzR6.가 같은지 체크
  bcrypt.compare(plainpassword,this.password, function(err,isMatch){
    if(err) return callback(err),
    callback(null,isMatch)
  })
}

userSchema.methods.CreateToken = function(callback){
  let user = this;
  //jsonwebtoken을 이용해서 token을 생성
  let token = jwt.sign(user._id.toHexString(),'secretToken');
  //user._id+'secretToken' = token 
  //=> 유저 id와 시크릿토큰을 합쳐서 토큰을 생성 -> 이후에 토큰을 이용하여 유저id를 가져올 수 있다.
  user.token = token;
  user.save(function(err,user){
    if(err) return callback(err);
    callback(null, user);
  })
}

const User = mongoose.model('User', userSchema) // Model은 스키마를 감싸주는 역할을 한다

module.exports={User} //User를 다른데에서 사용할 수 있게 module.exports를 해준다