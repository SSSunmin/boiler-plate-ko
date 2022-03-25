const express = require('express')
const app = express()
const port = 4000
const bodyParser = require('body-parser');
const config =require('./config/key');
const {User} =require('./models/User');

//application/x-www-form-unlencoded ->이런 데이터를 가져와서 분석하기 위하여 추가
app.use(bodyParser.urlencoded({extended:true}));

//application/json -> json파일을 가져와서 분석하기 위하여 추가
app.use(bodyParser.json());


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




app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})