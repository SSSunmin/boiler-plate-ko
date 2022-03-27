const express = require('express')
const app = express()
const port = 4000
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
//const cookieParser = require('cookie-parser');
const config =require('./config/key');
const {User} =require('./models/User');

//application/x-www-form-unlencoded ->이런 데이터를 가져와서 분석하기 위하여 추가
app.use(bodyParser.urlencoded({extended:true}));

//application/json -> json파일을 가져와서 분석하기 위하여 추가
app.use(bodyParser.json());
app.use(cookieParser());
const mongoose = require('mongoose');
mongoose.connect(config.mongoURI,
{
  // useNewUrlParser: true,
  // useFindAndModify: false,
  // useUnifiedTopology: true,
  // useCreateIndex: true 
  // 몽고DB 6.0이상은 자동으로 지원해줘서 작성하면 오히려 에러가 난다
}).then(()=>{console.log("MongoDB connected...")})
  .catch(err=>console.log(err))

app.get('/', (req, res) => {
  res.send('Hello World! ')
})

//회원가입 Route
app.post('/register',(req, res) => {
  //회원 가입 할때 필요한 정보들을 client에서 가져오면
  //그것들을 데이터 베이스에 넣어준다.

  const user = new User(req.body) //body-Parser를 이용해서 정보를 가져온다

  //몽고디비에서 제공하는 메소드 -> 가져온 정보를 User모델에 저장
  user.save((err,userinfo)=>{
    if(err) return res.json({success:false, err})
    return res.status(200).json({success : true}) //status(200)성공했다는 의미
  }) 
})

//로그인 Route
app.post('/login',(req, res)=>{
  // 1. 요청된 이메일을 데이터베이스에서 있는지 찾는다.
  //findOne -> 몽고디비에서 제공하는 함수
  //(err,userInfo) -> 콜백함수 에러가 발생하면 err에 에러내용이 성공하면 userInfo에 정보가 들어옴
  User.findOne({email: req.body.email },(err,userInfo)=>{
    if(!userInfo)//받아온 userInfo가 없다면 맞는 email정보와 맞는 유저가 없다는것
    {
      return res.json({
        loginSuccess : false,
        message :"제공된 이메일에 해당하는 유저가 없습니다."
      })
    }
     // 2. 요청된 이메일이 데이터베이스에 있다면 비밀번호가 맞는 비밀번호 인지 확인.
     userInfo.comparePassword(req.body.password, (err, isMatch)=>{
      if(!isMatch){
        return res.json({loginSuccess : false, message: "비밀번호가 틀렸습니다."})
      }
    })
      // 3. 비밀번호까지 맞다면 토큰을 생성하기
      userInfo.CreateToken((err,user)=>{
        //res.status(400) 에러가 있다는 의미이고, 에러가 발생했다고 클라이언트에 전달
        if(err) return res.status(400).send(err);

        //토큰을 저장한다. 어디에? ->쿠키, 로컬스토리지 => 여기서는 쿠키에 저장하는것을 할거임
        //-> 쿠키에 저장을 하려면 express에서 제공하는 cookieparser를 이용해야함
         res.cookie("x_auth", user.token)
         .status(200)
         .json({loginSuccess:true, userId:user._id})
      })
  })
})



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})