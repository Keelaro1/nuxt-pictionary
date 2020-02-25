import Vue from 'Vue'
import Vuex from 'vuex'

Vue.use(Vuex);

export const state = () => ({
  users: [],
  generalChatMessages: {}
});

export const getters = {
  getUsers: state => state.users,
};

export const mutations = {
  addUser(state, user) {
    state.users.push(user);
  },
  removeUser(state, user) {
    for(let i = 0; i < state.users.length;i++) {
      if(user.id === state.users[i].id) {
        state.users.slice(i, 1);
      }
    }
  },
  addHaveTimer(state, user) {
    for(let i = 0; i < state.users.length;i++) {
      if(user.id === state.users[i].id) {
        state.users[i].haveTimer = true;
      }
    }
  }
};

export const actions = {
};
