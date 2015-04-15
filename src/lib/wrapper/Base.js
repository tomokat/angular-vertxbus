class BaseWrapper {

  constructor() {}

  connect() {}

  reconnect() {}

  close() {}

  login(username, password, replyHandler) {}

  send(address, message, replyHandler) {}

  publish(address, message) {  }

  registerHandler(address, handler) {  }

  unregisterHandler(address, handler) {}

  readyState() {}

  getOptions() {
    return {};
  }

  // empty: can be overriden by externals
  onopen() {}

  // empty: can be overriden by externals
  onclose() {}

}

export default BaseWrapper;
