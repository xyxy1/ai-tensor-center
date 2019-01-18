import gestures from './lib/gestures'

export default {
  install(Vue) {
    Vue.directive('gestures', {
      bind: function (el, deliver) {
        var setings = deliver.value
        setings.el = el
        gestures(setings)
      },
      update: function (el, deliver) {
        var setings = deliver.value
        setings.el = el
        gestures(setings)
      }
    })
    Vue.prototype.$gestures = gestures;
  }
}