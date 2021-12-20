<template>
  <div class="home">
    <br />
    <v-container>
      <v-row>
        <v-col>
          <v-text-field
            label="Room Name"
            :rules="rules"
            hide-details="auto"
            v-model="createRoomName"
          />
        </v-col>
        <v-col>
          <v-btn elevation="10" x-large @click="createRoom">
            {{ "Create Room" }}
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
    <br />
    <v-container>
      <v-row>
        <v-col>
          <v-text-field
            label="Room ID"
            :rules="rules"
            hide-details="auto"
            v-model="joinRoomId"
          />
        </v-col>
        <v-col>
          <v-btn elevation="10" x-large @click="joinRoom">
            {{ "Join Room" }}
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
    <br />
    <v-divider></v-divider>
  </div>
</template>

<script>
import { getDatabase, ref, set, onValue } from "firebase/database";

export default {
  name: "Home",

  data: () => {
    return {
      createRoomName: "",
      joinRoomId: "",
      rules: [
        (value) => !!value || "Required.",
        (value) => (value && value.length >= 3) || "type 3 characters",
      ],
      db: null,
      rooms: null,
      buttunEnable: true,
    };
  },

  created() {
    this.db = getDatabase();
    this.rooms = [];
    onValue(ref(this.db, "rooms"), (result) => {
      if (result.val()) {
        let val = result.val();
        if (val.length) {
          this.rooms = val;
        }
      }
    });
  },

  methods: {
    createRoom() {
      if (!this.buttunEnable) {
        return false;
      }
      if (!this.createRoomName) {
        window.alert("Please input Room Name.");
        return false;
      }

      // Room ID発行
      let roomId = "";
      // Room IDの検証
      do {
        roomId = this.createRoomId();
      } while (this.rooms.includes(roomId));
      // Room ID登録
      this.rooms.push(roomId);
      set(ref(this.db, "/rooms"), this.rooms);
      // Roomの基本データ作成
      let pokerRoom = {
        name: this.createRoomName,
        selectedPoints: [],
        host: this.$store.getters.uniqKey,
        opened: false,
      };
      set(ref(this.db, `pokers/${roomId}`), pokerRoom);

      // Room 画面へ遷移
      this.buttunEnable = false;
      this.$router.push("/poker/" + roomId);
    },

    createRoomId() {
      let S = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let N = 8;
      return Array.from(crypto.getRandomValues(new Uint8Array(N)))
        .map((n) => S[n % S.length])
        .join("");
    },

    joinRoom() {
      if (!this.buttunEnable) {
        return false;
      }
      if (!this.joinRoomId) {
        window.alert("Please input room id.");
        return false;
      }
      if (!this.rooms.includes(this.joinRoomId)) {
        window.alert("Not Found.");
        return false;
      }

      this.buttunEnable = false;
      this.$router.push("/poker/" + this.joinRoomId);
    },
  },
};
</script>
