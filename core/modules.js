let modules = {}

exports.extend = function (name, value) {
  modules[name] = value
}

exports.collect = modules
