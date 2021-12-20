<template>
  <v-app id="inspire">
    <v-app-bar app>
      <v-toolbar-title>Planning Poker</v-toolbar-title>
    </v-app-bar>
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script>
import { getDatabase, ref, push, set, onValue } from "firebase/database";

export default {
  name: "App",
  data: () => {
    return {
      db: null,
    };
  },
  created() {
    this.db = getDatabase();
    if (!this.hasUserHash()) {
      this.createUserHash();
    }
    onValue(
      ref(this.db, "users"),
      (result) => {
        if (result.val()) {
          let users = result.val();
          let flag = false;
          Object.keys(users)
            .reverse()
            .forEach((key) => {
              if (flag) {
                return false;
              }
              if (this.$store.getters.userHash === users[key]) {
                this.$store.dispatch("setUniqKey", key);
                flag = true;
              }
            });
        }
      },
      {
        onlyOnce: true,
      }
    );
  },
  methods: {
    hasUserHash() {
      return (this.$store.getters.userHash || "").length > 0;
    },
    createUserHash() {
      console.log("create hash");
      this.$store.dispatch("createUserHash");
      const hash = this.$store.getters.userHash;
      console.log("send hash: %s", hash);
      set(push(ref(this.db, "/users")), hash);
    },
  },
};
</script>
