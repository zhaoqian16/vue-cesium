<template>
  <div class="login">
    <div class="login-wrap">
      <div class="login-left">
        <img src="../../../static/images/login/text.png"
             alt="">
      </div>
      <div class="login-right">
        <div class="login-header">
          <img src="../../../static/images/login/logo.png"
               alt="">
          <img class="city"
               src="../../../static/images/login/city.png"
               alt="">
        </div>
        <div class="login-content">
          <div class="username">
            <img src="../../../static/images/login/username.png"
                 alt="">
            <input type="text"
                   placeholder="账号"
                   ref="loginName"
                   v-model="loginName"
                   @input="loginNameChange"
                   @keyup.enter="focusPassword" />
          </div>
          <div class="password">
            <img src="../../../static/images/login/password.png"
                 alt="">
            <input type="password"
                   placeholder="密码"
                   ref="password"
                   v-model="password"
                   @keyup.enter="loginBtn" />
          </div>
          <div class="remember-password">
            <span>
              <el-checkbox v-model="remeberPassword"
                           @change="remeberPasswordChange">记住密码</el-checkbox>
            </span>
            <span style="float: right;">
              <span id="forget_password"
                    @click="forgetPassWord">忘记密码？</span> | <span id="downloadApp"
                    @click="downloadApp">下载app</span>
            </span>
          </div>
        </div>
        <div class="login-footer">
          <input id="doLoginBtn"
                 type="button"
                 value="立即登录"
                 @click="loginBtn"
                 class="submit_btn login-button" />
        </div>
      </div>
    </div>
    <el-dialog title="忘记密码"
               class="forgetDialog"
               :visible.sync="forgetVisible"
               top="15%"
               width="300px">
      <div>
        <div>请联系后台管理员！</div>
        <p>
          <span>联系人：</span>
          <span class="name">张梦豪</span>
        </p>
        <p>
          <span>联系方式：</span>
          <span class="tel">188 3818 9862</span>
        </p>
      </div>
      <span slot="footer"
            class="dialog-footer">
        <el-button type="primary"
                   @click="forgetVisible = false">知道了</el-button>
      </span>
    </el-dialog>
    <el-dialog title="下载最新版智城app"
               class="downloadDialog"
               :visible.sync="downloadVisible"
               top="10%"
               width="400px">
      <div id="downloadQrcode"
           ref="downloadQrcode">
      </div>
      <span slot="footer"
            class="dialog-footer">
        <el-button type="primary"
                   @click="downloadVisible = false">知道了</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import QRCode from "qrcodejs2"
import DES from '../..//uitl/des'
export default {
  data () {
    return {
      loginName: '',
      password: '',
      remeberPassword: false,
      forgetVisible: false,
      downloadVisible: false,
      downloadLink: this.GLOBAL.fileURL + '/sys/appApi/downLastestApp'
    };
  },
  components: {
    QRCode
  },
  created () {
    //关于龙子湖相关跳转
    var hostname = window.location.hostname.split(":")[0];
    var willReplace = false;
    for (var i in this.GLOBAL.ipHost) {
      for (var j in this.GLOBAL.ipHost[i]) {
        for (var n = 0; n < this.GLOBAL.ipHost[i]['ips'].length; n++) {
          if (hostname == this.GLOBAL.ipHost[i]['ips'][n]) {
            willReplace = true
            hostname = this.GLOBAL.ipHost[i]['pageUrl'];
            break;
          }
        }
      }
    }
    if (willReplace) {
      this.$router.push({ path: hostname })
      return;
    }

    var user = this.COMMON.getStorage('user');
    var __ridParm = this.COMMON.getUrlParam('__sid');
    var thirdFlag = this.COMMON.getUrlParam('thirdFlag');
    if (thirdFlag && (thirdFlag == 1 || thirdFlag == '1' || thirdFlag == 2 || thirdFlag == '2' || thirdFlag == 3 || thirdFlag == '3')) {
      var has_user = true;
    } else {
      var has_user = false;
    }
    if (has_user) {//自动登录修改
      this.loginName = '赛维接口'
      this.password = '12345678'
      this.COMMON.setStorage('has_user', thirdFlag);
      this.doLogin();
    } else {
      this.COMMON.setStorage('has_user', null);
    }

    if (user && user != null || __ridParm && __ridParm != null && __ridParm != "null") {
      if (!__ridParm || __ridParm == null || __ridParm == "null") {
        __ridParm = user.__rid;
      }
      this.$get('sysUser/sysUserInfo', { __sid: __ridParm }).then(d => {
        var _data = d.data;
        if (!_data) {
          this.$notify({
            title: '警告',
            message: '<span>您登录的' + _data.userName + '用户缺少基础信息，请联系管理员！</span>',
            type: 'warning'
          });
        } else if (_data && _data.isAdmin) {
          if (_data.isAdmin) {
            this.$notify({
              title: '警告',
              message: '<span>您已经以' + _data.userName + '的身份登录系统，此用户为后台管理员，操作权限不足，无法访问平台！</span>',
              type: 'warning'
            });
            return;
          }
        } else {
          if (!user || user == null) {
            user = {};
          }
          _data.map((item, i) => {
            user[i] = item;
          })
          this.COMMON.setStorage("user", user);
          this.$router.push({ path: '/dongqu' })
          return;
        }
      })
    } else {// 如点击记住密码则填充密码
      var isRememberUserPassword = this.COMMON.getStorage("isRememberUserPassword");
      if (isRememberUserPassword == "true") {
        this.remeberPassword = true;
        var rememberCurrUser = this.COMMON.getStorage("rememberCurrUser");
        var rememberCurrPassword = this.COMMON.getStorage("rememberCurrPassword");
        this.loginName = DES.DesUtils.decode(rememberCurrUser, this.GLOBAL.secretKey)
        this.password = DES.DesUtils.decode(rememberCurrPassword, this.GLOBAL.secretKey)
      } else {
        if (!has_user) {//自动登录修改
          this.remeberPassword = false;
          var rememberCurrUser = this.COMMON.getStorage("rememberCurrUser");
          if (rememberCurrUser && rememberCurrUser != "") {
            this.loginName = DES.DesUtils.decode(rememberCurrUser, this.GLOBAL.secretKey)
          }
        }
      }
    }
  },
  computed: {
  },
  methods: {
    loginBtn () {
      if (this.doLogin()) {
        this.$router.push({ path: '/' })
      }
    },
    doLogin () {
      this.$get('/logout', null).then(result => {
        this.COMMON.setStorage("user", null);
        this.COMMON.setStorage("thirdUrls", null);
        this.COMMON.setStorage('remarksList', null)
        this.$get('/login', {
          __login: true,
          __ajax: 'json',
          username: DES.DesUtils.encode(this.loginName, this.GLOBAL.secretKey),
          password: DES.DesUtils.encode(this.password, this.GLOBAL.secretKey)
        }).then(res => {
          this.COMMON.setStorage("rememberCurrUser", DES.DesUtils.encode(this.loginName, this.GLOBAL.secretKey));
          if (res.result == 'true') {
            // 记住密码
            if (this.remeberPassword) {
              var rememberUserPassword = this.COMMON.getStorage("rememberUserPassword");
              if (!rememberUserPassword) {
                rememberUserPassword = [];
              }
              var _flag = false;
              rememberUserPassword.map(item => {
                if (item.loginName == DES.DesUtils.encode(this.loginName, this.GLOBAL.secretKey)) {// 如存在则修改密码
                  _flag = true;
                  if (item.password != DES.DesUtils.encode(this.password, this.GLOBAL.secretKey)) {
                    item.password = DES.DesUtils.encode(this.password, this.GLOBAL.secretKey);
                  }
                }
              })
              if (!_flag) {// 不存在则新增
                var _rememberUserPassword = {};
                _rememberUserPassword.loginName = DES.DesUtils.encode(this.loginName, this.GLOBAL.secretKey);
                _rememberUserPassword.password = DES.DesUtils.encode(this.password, this.GLOBAL.secretKey);
                rememberUserPassword.push(_rememberUserPassword);
              }
              // 将记住密码的用户信息记录到cookie
              this.COMMON.setStorage("rememberCurrUser", DES.DesUtils.encode(this.loginName, this.GLOBAL.secretKey));
              this.COMMON.setStorage("rememberCurrPassword", DES.DesUtils.encode(this.password, this.GLOBAL.secretKey));
              this.COMMON.setStorage("rememberUserPassword", rememberUserPassword);
              this.COMMON.setStorage("isRememberUserPassword", true);
            } else {// 不记住密码从列表中删除
              var rememberUserPassword = this.COMMON.getStorage("rememberUserPassword");
              if (rememberUserPassword) {
                for (var i = 0; i < rememberUserPassword.length; i++) {
                  if (rememberUserPassword[i].loginName == DES.DesUtils.encode(this.loginName, this.GLOBAL.secretKey)) {
                    rememberUserPassword.splice(i, 1);
                    break;
                  }
                }
                this.COMMON.setStorage("rememberCurrUser", DES.DesUtils.encode(this.loginName, this.GLOBAL.secretKey));
                this.COMMON.setStorage("rememberUserPassword", rememberUserPassword);
                this.COMMON.setStorage("isRememberUserPassword", false);
                this.COMMON.rmStorage("rememberCurrPassword");
              }
            }

            res.user['__sid'] = res.sessionid;
            this.$get('sysUser/sysUserInfo', { __sid: res.sessionid }).then(d => {
              if (d.data) {
                if (d.data.isAdmin) {
                  this.$notify({
                    title: '警告',
                    message: '<span>您以' + d.data.userName + '的身份登录系统，此用户为后台管理员，操作权限不足，无法访问平台！</span>',
                    type: 'warning'
                  });
                  return;
                }
                d.user = res.user?res.user:{};
                for (const key in d.data) {
                  d.user[key] = d.data[key]
                }
                this.COMMON.setStorage("user", d.user);
                if (d.user) {
                  let remarksList = [];
                  d.user.menuList.map(item => {
                    if (item.remarks && item.remarks.trim() != '') {
                      remarksList.push(item.remarks);
                    }
                  })
                  
                  this.COMMON.setStorage("remarksList", remarksList)
                  
                }
                this.$message({
                  message: '欢迎您，' + d.user.userName,
                  type: 'success'
                });
                this.$router.push({ path: '/dongqu' })
                return true;
              } else {
                this.$notify({
                  title: '警告',
                  message: '<span">您登录的用户缺少用户基本信息，请联系管理员！</span>',
                  type: 'warning'
                });
                return;
              }
            })
          } else {
            // 取消记住密码
            this.remeberPassword = false;
            var rememberUserPassword = this.COMMON.getStorage("rememberUserPassword");
            if (rememberUserPassword) {
              for (var i = 0; i < rememberUserPassword.length; i++) {
                if (rememberUserPassword[i].loginName == DES.DesUtils.encode(this.loginName, this.GLOBAL.secretKey)) {
                  rememberUserPassword.splice(i, 1);
                  break;
                }
              }
              this.COMMON.setStorage("rememberUserPassword", rememberUserPassword);
            }
            this.COMMON.rmStorage("rememberCurrPassword");
            this.password = '';
            this.COMMON.setStorage("isRememberUserPassword", false);
          }
          return res.result;
        })
      })
      return false;
    },
    //用户名回车事件
    focusPassword () {
      this.$nextTick(() => {
        this.$refs.password.focus()
      })
    },
    //记住密码变化
    remeberPasswordChange () {
      if (!this.remeberPassword) {
        this.COMMON.setStorage("isRememberUserPassword", false);
        // 删除当前用户的密码
        var rememberCurrUser = this.COMMON.getStorage("rememberCurrUser");
        if (this.loginName != "" && rememberCurrUser == DES.DesUtils.encode(this.loginName, this.GLOBAL.secretKey)) {
          this.COMMON.rmStorage("rememberCurrPassword");
        }
        // 把用户从记住密码用户列表中删除
        var rememberUserPassword = this.COMMON.getStorage("rememberUserPassword");
        if (rememberUserPassword) {
          for (var i = 0; i < rememberUserPassword.length; i++) {
            // 记住密码时填充密码
            if (rememberUserPassword[i].loginName == DES.DesUtils.encode(this.loginName, this.GLOBAL.secretKey)) {
              rememberUserPassword.splice(i, 1);
              break;
            }
          }
        }
      }
    },
    //用户名变化
    loginNameChange () {
      // 判断用户是否记住密码
      var rememberUserPassword = this.COMMON.getStorage("rememberUserPassword");
      var flag = false;
      if (rememberUserPassword) {
        for (var i = 0; i < rememberUserPassword.length; i++) {
          // 记住密码时填充密码
          if (rememberUserPassword[i].loginName == DES.DesUtils.encode(this.loginName, this.GLOBAL.secretKey) && rememberUserPassword[i].password && rememberUserPassword[i].password != "") {
            this.remeberPassword = true;
            this.password = DES.DesUtils.decode(this.password, this.GLOBAL.secretKey)
            flag = true;
            break;
          }
        }
      }
      // 没有记住密码
      if (!flag) {
        this.remeberPassword = false;
        this.password = '';
      }
    },
    forgetPassWord () {
      this.forgetVisible = true;
    },
    downloadApp () {
      this.downloadVisible = true;
      this.$nextTick(() => {
        document.getElementById("downloadQrcode").innerHTML = '';
        this.initQrcode()
      })
    },
    //  生成二维码
    initQrcode () {
      let that = this;
      let qrcode = new QRCode('downloadQrcode', {
        width: 300,
        height: 300,        // 高度
        text: this.downloadLink,   // 二维码内容
        // render: 'canvas' ,   // 设置渲染方式（有两种方式 table和canvas，默认是canvas）
        // background: '#f0f',   // 背景色
        // foreground: '#ff0'    // 前景色
      })
    }
  }
}
</script>

<style>
.login {
  height: 100%;
  width: 100%;
  overflow: hidden;
  background: url("../../../static/images/login/bg.jpg");
  background-size: 100% 100%;
}
.login-wrap {
  display: inline-flex;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.login-footer .phone {
  width: 20px;
}
.login-footer span {
  display: inline-block;
  border-bottom: 2px solid #17bbff;
  color: #17bbff;
}
.login-footer p {
  margin: 0 auto;
  height: 14px;
  text-align: center;
  margin-top: 32px;
  font-size: 14px;
  font-family: MicrosoftYaHei;
  font-weight: 400;
  color: rgba(85, 85, 85, 1);
  display: flex;
  align-items: center;
  justify-content: center;
}
.login-left {
  width: 480px;
  height: 680px;
  background: linear-gradient(
    0deg,
    rgba(31, 189, 255, 0.4) 0%,
    rgba(17, 117, 206, 0.8) 100%
  );
  display: flex;
  justify-content: center;
  align-items: center;
}
.login-left img {
  width: 278px;
}
.login-right {
  background: #fff;
  padding: 112px 240px 150px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
}
.login-header {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.login-header .city {
  width: 300px;
}
.login-header .city {
  margin: 30px 0 50px;
}
.login-header img {
  width: 68px;
}
.login-content {
  width: 320px;
  display: flex;
  flex-direction: column;
  margin-top: -40px;
}
.login-content > .username,
.login-content > .password {
  width: 290px;
  height: 47px;
  border: 1px solid rgba(5, 135, 208, 1);
  border-radius: 23px;
  margin-bottom: 14px;
  font-size: 14px;
  height: 26px;
  line-height: 26px;
  padding: 8px 5%;
  /* text-indent: 2em; */
}
.password input,
.username input {
  border: none;
  outline: none;
  background: #fff !important;
  background-color: #fff !important;
  flex: 1;
}
input:-webkit-autofill {
  -webkit-box-shadow: 0 0 0px 1000px white inset !important;
}
.password,
.username {
  display: flex;
}
.password img,
.username img {
  width: 26px;
}
.login-footer .login-button {
  width: 320px;
  height: 44px;
  border: 1px solid;
  text-align: center;
  /* border-images:linear-gradient(0deg, rgba(10,101,184,1), rgba(17,176,243,1)) 10 10; */
  background: linear-gradient(
    90deg,
    rgba(17, 117, 206, 1) 0%,
    rgba(31, 189, 255, 1) 100%
  );
  border-radius: 22px;
  font-size: 16px;
  font-family: MicrosoftYaHei;
  font-weight: 400;
  color: rgba(255, 255, 255, 1);
  line-height: 40px;
  cursor: pointer;
}
.remember-password {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  padding: 0 10px;
}
#forget_password,
#downloadApp {
  cursor: pointer;
  font-size: 14px;
}
.forgetDialog .el-dialog__body {
  min-height: 100px;
  margin: 0;
}
.forgetDialog div > div {
  margin: 0 0 20px 0;
}
#downloadQrcode img {
  margin: 20px auto;
}
</style>
