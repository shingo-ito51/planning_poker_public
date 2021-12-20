import Vue from "vue";
import Vuex, { Store } from "vuex";
import createPersistedState from "vuex-persistedstate";

Vue.use(Vuex);

const store = new Store({
  state: {
    userHash: null,
    uniqKey: null,
  },
  getters: {
    userHash(state) {
      return state.userHash;
    },
    uniqKey(state) {
      return state.uniqKey;
    },
  },
  mutations: {
    init(state, userHash) {
      state.userHash = userHash;
    },
    setUniqKey(state, key) {
      state.uniqKey = key;
    },
  },
  actions: {
    createUserHash({ commit }) {
      const S =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      const N = 8;
      const userHash = Array.from(crypto.getRandomValues(new Uint8Array(N)))
        .map((n) => S[n % S.length])
        .join("");
      commit("init", userHash);
    },
    setUniqKey({ commit }, key) {
      commit("setUniqKey", key);
    },
  },
  plugins: [createPersistedState({ storage: window.sessionStorage })],
});

window.$store = store;

export default store;
