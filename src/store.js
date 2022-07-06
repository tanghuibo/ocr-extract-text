const store = {}
module.exports = {
    get(key) {
        return store[key];
    },
    set(key, value) {
        store[key] = value;
    }
}