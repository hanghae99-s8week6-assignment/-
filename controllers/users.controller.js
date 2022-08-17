const UserService = require("../services/users.service");
const jwt = require("jsonwebtoken");
class UserController {
  check = false;
  userService = new UserService();
  emailcheck = async (req, res, next) => {
    const { email } = req.params;
    const emailcheck = await this.userService.findOneUser(email);

    if (emailcheck) {
      this.check = true;
      return res.status(400).json({
        result: false,
        error: "중복된 이메일입니다. 다른 이메일을 입력해주세요",
      });
    } else {
      this.check = true;
      return res.status(200).json({
        result: true,
        message: "사용가능한 이메일입니다.",
      });
    }
  };
  usercheck = async (req, res, next) => {
    const token = req.headers.authorization;

    const tokenValue = token;
    const { email, userName } = jwt.verify(tokenValue, "my-secret-key");
    return res.status(200).json({ email: email, userName: userName });
  };
  createUser = async (req, res, next) => {
    if (this.check === false) {
      return res.status(400).json({
        result: false,
        error: "이메일 중복 체크를 해주세요.",
      });
    }

    const { email, userName, password, passwordCheck } = req.body;
    const tokenValue = req.cookies.token;

    const existUser = await this.userService.findOneUser(email);

    let emailtest = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,4})+$/;
    let passwordtest = /^[A-Za-z0-9]{8,20}$/;
    let userNametest = /^[가-힣]{2,6}$/;
    if (!emailtest.test(email)) {
      return res.status(400).json({
        result: false,
        error: "이메일 양식이 올바르지 않습니다.",
      });
    }
    if (existUser) {
      return res.status(400).json({
        result: false,
        error: "중복된 이메일입니다. 다른 이메일을 입력해주세요!",
      });
    }

    //유효성 검사
    if (!userNametest.test(userName)) {
      return res.status(400).json({
        result: false,
        error: "닉네임을 양식에 맞춰 다시 입력해주세요.",
      });
    }

    if (!passwordtest.test(password)) {
      return res.status(400).json({
        result: false,
        error: "비밀번호를 양식을 맞춰 다시 입력해주세요.",
      });
    }

    if (password !== passwordCheck) {
      return res.status(400).json({
        result: false,
        error: "비밀번호와 확인 비밀번호가 일치하지 않습니다.",
      });
    }

    if (tokenValue) {
      return res.status(400).json({
        result: false,
        error: "로그인된 상태에서는 회원가입을 할 수 없습니다",
      });
    }

    //유효성 검사를 통과
    await this.userService.createUser(email, userName, password, passwordCheck);
    this.check = false;
    return res.status(200).json({
      result: true,
    });
  };
}

module.exports = UserController;
