/**
 * @author：huangyanfeng137@163.com
 * @description：个人网站服务器
 * @data: 2016/6/27
 */

/**
 * 加载依赖模块
 */
var http = require('http'),
    net = require('net'),
    express = require('express'),
    mysql = require('mysql'),
    fs = require('fs'),
    path = require('path'),
    bodyParser = require('body-parser');

/**
 *创建并实例化express模块与connection对象
 */
var app = express(),
    connection = mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"123456",
    port:"3306",
    database:'personal websites'
});

var sql_query = 'select   *  from  t_user where id =',
    resDate = {
        "flag":"1",
        "data":{
            "hasLogin":"",
            "baseInfo":{
                "userName":"",
                "gender":"",
                "birthday":"",
                "tel":"",
                "qq":"",
                "email":"",
                "portrait":""
            }
        },
        "msg":""
    };

/***
 * 注册模块
 */

app.use(bodyParser.urlencoded({
    extended: true
}));
app.post('/eHome/user/register.do',function(req,res,next){
    if(!req.body.userName || !req.body.password){
        //校验前端账号密码不能为空
        return;
    }
    var id = Math.random()*100000+1000;
    var insert_info = 'INSERT INTO t_user (name,password,id) VALUES ("'+ req.body.userName +'","'+ req.body.password +'","'+ id +'")';
    connection.query(insert_info,function(error,result){
        if(error){
            console.log(error);
            return;
        }
        res.writeHead(200,{"Content-Type":"application/json","Access-Control-Allow-Origin":"http://localhost:8089"});
        res.write(JSON.stringify(resDate));
        res.end();
    })
});

/***
 * 登录模块
 */
app.route('/eHome/user/login.do').get(function(req,res,next){
    if(req.query.accound && req.query.usePassword){
        sql_query = sql_query + req.query.accound;
        console.log('has connected!');
        //建立数据库链接
        connection.connect();
        connection.query(sql_query,function(err,result){
            if(err){
                console.log(err);
                return;
            }
            if(result !== []){
                //用户存在
                if(req.query.usePassword == result[0].password){
                    //校验用户密码是否通过
                    res.writeHead(200,{"Content-Type":"application/json","Access-Control-Allow-Origin":"http://localhost:8089"});
                    resDate.data.hasLogin = "01";
                    resDate.data.baseInfo.userName = result[0].name;
                    resDate.data.baseInfo.gender = result[0].gender;
                    resDate.data.baseInfo.birthday = result[0].birthday;
                    resDate.data.baseInfo.tel = result[0].tel;
                    resDate.data.baseInfo.qq = result[0].qq;
                    resDate.data.baseInfo.email = result[0].email;
                    resDate.data.baseInfo.portrait = result[0].portrait;
                    resDate.data.baseInfo.id = result[0].id;
                    resDate.msg = "已注册！";
                    res.write(JSON.stringify(resDate));
                    res.end();
                }else{
                    //密码验证不通过
                    res.writeHead(200,{"Content-Type":"application/json","Access-Control-Allow-Origin":"http://localhost:8089"});
                    resDate.data.hasLogin = "03";
                    resDate.msg = "密码输入不正确！";
                    res.write(JSON.stringify(resDate));
                    res.end();
                }
            }else{
                //用户不存在（未注册）
                res.writeHead(200,{"Content-Type":"application/json","Access-Control-Allow-Origin":"http://localhost:8089"});
                resDate.data.hasLogin = "00";
                resDate.msg = "该用户不存在（未注册）！";
                res.write(JSON.stringify(resDate));
                res.end();
            }
        });
        //断开数据库链接
        //connection.end();
    }else{
        //前端未输入账号或密码
        res.writeHead(200,{"Content-Type":"application/json","Access-Control-Allow-Origin":"http://localhost:8089"});
        resDate.data.hasLogin = "02";
        resDate.msg = "必填信息不能为空！";
        res.write(JSON.stringify(resDate));
        res.end();
    }
});


/***
 * 修改用户密码模块
 */
var  updateDate = {
    "flag":"1",
    "data":{
        "hasUpdate":""
    },
    "msg":""
};
app.route('/eHome/userInfo/updatePassword.do').get(function(req,res,next){
    if(req.query.accound && req.query.oldPassword && req.query.newPassword && req.query.newPassword2){
        sql_query = sql_query + req.query.accound;
        //建立数据库链接
        connection.connect();
        connection.query(sql_query,function(err,result){
            if(err){
                console.log(err);
                return;
            }
            if(result !== []){
                //用户输入的账号正确
                if(req.query.oldPassword == result[0].password){
                    //校验用户密码是否通过
                    var updateP='UPDATE t_user SET password = ? WHERE id = ?',
                        upArr = [req.query.newPassword,result[0].id];
                    connection.query(updateP,upArr,function(err,result){
                        if(err){
                            console.log('[UPDATE ERROR] - ',err.message);
                            return;
                        }
                        console.log('----------UPDATE-------------');
                        console.log('UPDATE affectedRows',result.affectedRows);
                        console.log('******************************');
                    });
                    res.writeHead(200,{"Content-Type":"application/json","Access-Control-Allow-Origin":"http://localhost:8089"});
                    updateDate.data.hasUpdate = 'Y';
                    updateDate.msg = '密码更改成功!';
                    res.write(JSON.stringify(updateDate));
                    res.end();
                }else{
                    //密码验证不通过
                    res.writeHead(200,{"Content-Type":"application/json","Access-Control-Allow-Origin":"http://localhost:8089"});
                    updateDate.data.hasUpdate = 'N';
                    updateDate.msg = "旧密码输入不正确！";
                    res.write(JSON.stringify(updateDate));
                    res.end();
                }
            }else{
                //账号输入不正确
                res.writeHead(200,{"Content-Type":"application/json","Access-Control-Allow-Origin":"http://localhost:8089"});
                updateDate.data.hasUpdate = 'N';
                updateDate.msg = "输入的账号不正确";
                res.write(JSON.stringify(updateDate));
                res.end();
            }
        });
        //断开数据库链接
        //connection.end();
    }else{
        //前端信息输入不完善
        res.writeHead(200,{"Content-Type":"application/json","Access-Control-Allow-Origin":"http://localhost:8089"});
        updateDate.data.hasUpdate = 'N';
        updateDate.msg = "必填信息不能为空！";
        res.write(JSON.stringify(updateDate));
        res.end();
    }
});

/***
 * 修改用户个人信息模块
 */

app.route('/eHome/userInfo/updateUserInfo.do').get(function(req,res){
    if(req.query.id && req.query.userName && req.query.gender && req.query.birthday && req.query.tel &&req.query.qq && req.query.email){
        sql_query = sql_query + req.query.id;
        connection.connect();
        connection.query(sql_query,function(err,result){
            if(err){
                console.log(err);
            }
            if(result !== []){
                //修改用户名称
                if(result[0].name !== req.query.userName){
                    var updataName = 'UPDATE t_user SET name =? WHERE id=?',
                        upArr = [req.query.userName,result[0].id];
                    connection.query(updataName,upArr,function(err,result){
                        if(err){
                            console.log('[UPDATE ERROR] - ',err.message);
                        }
                    });
                }
                //修改用户性别
                if(result[0].gender !== req.query.gender){
                    var updataGender = 'UPDATE t_user SET gender =? WHERE id =?',
                        genderArr = [req.query.gender,result[0].id];
                    connection.query(updataGender,genderArr,function(err,result){
                        if(err){
                            console.log('[UPDATE ERROR] - ',err.message);
                        }
                    });
                }
                //修改用户生日
                if(result[0].birthday !== req.query.birthday){
                    var updataBir = 'UPDATE t_user SET birthday =? WHERE id =?',
                        birArr = [req.query.birthday,result[0].id];
                    connection.query(updataBir,birArr,function(err,result){
                        if(err){
                            console.log('[UPDATE ERROR] - ',err.message);
                        }
                    });
                }
                //修改用户手机号码
                if(result[0].tel !== req.query.tel){
                    var updataTel = 'UPDATE t_user SET tel =? WHERE id =?',
                        telArr = [req.query.tel,result[0].id];
                    connection.query(updataTel,telArr,function(err,result){
                        if(err){
                            console.log('[UPDATE ERROR] - ',err.message);
                        }
                    });
                }
                //修改用户QQ号码
                if(result[0].qq !== req.query.qq){
                    var updataqq = 'UPDATE t_user SET qq =? WHERE id =?',
                        qqArr = [req.query.qq,result[0].id];
                    connection.query(updataqq,qqArr,function(err,result){
                        if(err){
                            console.log('[UPDATE ERROR] - ',err.message);
                        }
                    });
                }
                //修改用户邮箱
                if(result[0].email !== req.query.email){
                    var updataEmail = 'UPDATE t_user SET email =? WHERE id =?',
                        emailArr = [req.query.email,result[0].id];
                    connection.query(updataEmail,emailArr,function(err,result){
                        if(err){
                            console.log('[UPDATE ERROR] - ',err.message);
                        }
                    });
                }
                res.writeHead(200,{"Content-Type":"application/json","Access-Control-Allow-Origin":"http://localhost:8089"});
                updateDate.flag = "1";
                updateDate.msg = "信息修改成功！";
                res.write(JSON.stringify(updateDate));
                res.end();
            }
        });
    }else{
        res.writeHead(200,{"Content-Type":"application/json","Access-Control-Allow-Origin":"http://localhost:8089"});
        updateDate.flag = "2";
        updateDate.msg = "必传参数不全！";
        res.write(JSON.stringify(updateDate));
        res.end();
    }
});

/**
 * 更换用户头像
 * @path：/eHome/userInfo/updateUserImage.do
 * @id：用户id
 * @portrait：base64位编码格式的头像图片信息
 */
var data = {
    flag:'1',
    isUpdate:'Y',
    msg:'头像更换成功！'
};
app.use(bodyParser.urlencoded({
    extended: true
}));
app.post('/eHome/userInfo/updateUserImage.do',function(req,res){
    if(req.body.id && req.body.portrait){
        sql_query = sql_query + req.body.id;
        console.log('has connected!');
        connection.query(sql_query,function(err,result){
            if(err){
                console.log(err);
            }
            if(result !== []){
                var updataImg = 'UPDATE t_user SET portrait =? WHERE id =?',
                    imgArr = [req.body.portrait,result[0].id];
                connection.query(updataImg,imgArr,function(err,result){
                    if(err){
                        console.log('[UPDATE ERROR] - ',err.message);
                    }
                    res.writeHead(200,{"Access-Control-Allow-Origin":"http://localhost:8089","Content-Type":"application/x-www-form-urlencoded"});
                    res.write(JSON.stringify(data));
                    res.end();
                });
            }else{
                data.flag = '2';
                data.isUpdate = 'N';
                data.msg = '无此用户信息！';
                res.writeHead(200,{"Access-Control-Allow-Origin":"http://localhost:8089","Content-Type":"application/x-www-form-urlencoded"});
                res.write(JSON.stringify(data));
                res.end();
            }
        });
    }else{
        data.flag = '2';
        data.isUpdate = 'N';
        data.msg = '必传参数不能为空！';
        console.log(req.body.id);
        res.writeHead(200,{"Access-Control-Allow-Origin":"http://localhost:8089","Content-Type":"application/x-www-form-urlencoded"});
        res.write(JSON.stringify(data));
        res.end();
    }
});

/***
 * 监听指定端口
 * @port：8099
 */
app.listen('8099',function(){
    console.log('personal server has running at 8099 port!');
});