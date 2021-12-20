<template>
  <div id="Poker">
    <v-container>
      <v-row>
        <v-col class="text-h4">{{ roomName }}</v-col>
      </v-row>
      <br /><br />
      <v-row>
        <v-col>{{ "Story Point." }}</v-col>
      </v-row>
      <v-row>
        <v-col v-for="(n, idx) in cards" :key="'card' + idx" cols="12" md="1">
          <v-item-group>
            <v-item>
              <v-card
                :color="selectedValue === n ? 'primary' : 'orange lighten-5'"
                class="d-flex align-center"
                :outlined="true"
                :hover="true"
                :disabled="opened"
                @click="cardSelect(n)"
                :style="{
                  color: selectedValue === n ? 'white' : '',
                  justifyContent: 'center',
                }"
              >
                {{ n }}
              </v-card>
            </v-item>
          </v-item-group>
        </v-col>
      </v-row>
      <v-row>
        <v-divider></v-divider>
      </v-row>
      <br /><br /><br />
      <v-row>
        <v-col>
          <v-btn elevation="10" x-large @click="openCard">
            {{ "Open" }}
          </v-btn>
        </v-col>
        <v-col>
          <v-btn elevation="10" x-large @click="resetCards">
            {{ "Reset" }}
          </v-btn>
        </v-col>
        <v-col></v-col>
        <v-col>
          <v-btn elevation="10" x-large @click="clipUrl">
            {{ "clip URL" }}
          </v-btn>
        </v-col>
        <v-col></v-col>
        <v-col></v-col>
        <v-col></v-col>
        <v-col></v-col>
      </v-row>
      <v-row>
        <v-divider></v-divider>
      </v-row>
      <br /><br /><br />
      <v-row>
        <v-col>{{ "Result." }}</v-col>
      </v-row>
      <v-row>
        <v-col
          v-for="(n, idx) in selectedPoints"
          :key="'selected' + idx"
          cols="12"
          md="1"
        >
          <v-item-group>
            <v-item>
              <v-card
                :color="opened ? 'orange lighten-5' : 'blue-grey lighten-3'"
                class="d-flex align-center"
                :outlined="true"
                :hover="true"
                min-height="24"
                :style="{
                  justifyContent: 'center',
                }"
              >
                {{ opened ? n : " " }}
              </v-card>
            </v-item>
          </v-item-group>
        </v-col>
      </v-row>
      <v-row v-show="opened">
        <v-col>
          {{ `avg:  ${avg}` }}
        </v-col>
      </v-row>
      <v-row>
        <v-divider></v-divider>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import { getDatabase, ref, set, onValue } from "firebase/database";

export default {
  name: "Poker",
  data() {
    return {
      roomName: "",
      selectedValue: null,
      selectedPoints: {},
      members: [],
      db: null,
      cards: [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89],
      dbKey: "",
      myPointKey: "",
      host: "",
      opened: false,
    };
  },
  beforeRouteEnter(to, from, next) {
    if (!to.params.id) {
      next("/");
      return;
    }
    next();
  },
  watch: {
    opened(n) {
      if (!n) {
        this.selectedValue = null;
      }
    },
  },
  computed: {
    memberCount() {
      return this.members.length;
    },
    isHost() {
      return this.host === this.$store.getters.uniqKey;
    },

    avg() {
      const cnt = Object.keys(this.selectedPoints).length;
      if (cnt <= 0) {
        return 0;
      }
      let sum = 0;
      Object.keys(this.selectedPoints).forEach((key) => {
        sum += this.selectedPoints[key];
      });
      let ret = Number(sum / cnt).toFixed(6);
      return ret;
    },
  },
  mounted() {
    this.db = getDatabase();
    this.dbKey = `pokers/${this.$route.params.id}`;
    this.myPointKey = `${this.dbKey}/selectedPoints/${this.$store.getters.uniqKey}`;
    const refDb = ref(this.db, this.dbKey);
    onValue(
      refDb,
      (result) => {
        if (result.val()) {
          let val = result.val();
          this.members = Object.assign({}, val.members);
          this.selectedPoints = Object.assign({}, val.selectedPoints);
          this.host = val.host;
          this.opened = val.opened;
          this.roomName = val.name;
        } else {
          this.$router.push("/");
        }
      },
      {
        onlyOnce: false,
      }
    );
  },
  methods: {
    addMemberHash() {
      // member情報の存在チェック
      if (
        this.members.some((item) => item.id === this.$store.getters.uniqKey)
      ) {
        return false;
      }
      // member情報がないので、追加
      this.members.push(this.$store.getters.uniqKey);

      set(ref(this.db, this.dbKey + "/member"), this.members);
    },

    cardSelect(val) {
      if (this.opened || this.selectedValue === val) {
        return false;
      }
      this.selectedValue = val;
      this.selectedPoints = Object.assign({}, this.selectedPoints, {
        [this.$store.getters.uniqKey]: val,
      });
      set(ref(this.db, this.myPointKey), val);
    },

    openCard() {
      if (this.opened) {
        return false;
      }
      this.opened = true;
      set(ref(this.db, this.dbKey + "/opened"), true);
    },

    resetCards() {
      if (!this.opened) {
        return false;
      }
      this.opened = false;
      this.selectedPoints = {};
      set(ref(this.db, this.dbKey + "/selectedPoints"), this.selectedPoints);
      set(ref(this.db, this.dbKey + "/opened"), false);
    },

    clipUrl() {
      navigator.clipboard
        .writeText(window.location.href)
        .then(() => {
          window.alert("URL copied!\n\nPlease share URL.");
        })
        .catch((e) => {
          window.alert(e);
        });
    },

    testLink() {
      this.$router.push({ name: "Home" });
    },
  },
};
</script>
