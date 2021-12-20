import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";
import Poker from "../views/Poker.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/poker/:id",
    name: "Poker",
    component: Poker,
  },
  {
    path: "*",
    beforeEnter(to, from, next) {
      next("/");
    },
  },
];

const router = new VueRouter({
  mode: "history",
  routes,
});

export default router;
