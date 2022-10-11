import { makeAutoObservable } from "mobx";
import { http, getToken, setToken, removeToken } from "@/utils";
class LoginStore {
  token = getToken() || "";
  constructor() {
    makeAutoObservable(this);
  }

  getToken = async ({ mobile, code }) => {
    // 调用登录接口
    const res = await http.post("/authorizations", {
      mobile,
      code,
    });
    // 存入token
    this.token = res.data.token;
    // 存入ls
    setToken(this.token);
  };
  loginOut = () => {
    this.token = "";
    removeToken();
  };
}

export default LoginStore;
