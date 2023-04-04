import { d as defineStore, u as useRouter } from "../server.mjs";
import "vue";
import "destr";
const useUser = defineStore("user", {
  state: () => {
    return {
      isLoggedIn: false
    };
  },
  getters: {},
  actions: {
    login() {
      this.isLoggedIn = true;
      useRouter().push("/");
    }
  }
});
export {
  useUser as u
};
//# sourceMappingURL=User.3fec5034.js.map
