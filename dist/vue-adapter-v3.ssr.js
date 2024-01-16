'use strict';var vue=require('vue');function _typeof(obj) {
  "@babel/helpers - typeof";

  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  }, _typeof(obj);
}

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArrayLimit(arr, i) {
  var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];

  if (_i == null) return;
  var _arr = [];
  var _n = true;
  var _d = false;

  var _s, _e;

  try {
    for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

  return arr2;
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}var script = /*#__PURE__*/vue.defineComponent({
  name: 'CSVBoxButton',
  // vue component name
  props: {
    licenseKey: {
      type: String,
      required: true
    },
    onImport: {
      type: Function,
      default: function _default() {}
    },
    onReady: {
      type: Function,
      default: function _default() {}
    },
    onSubmit: {
      type: Function,
      default: function _default() {}
    },
    onClose: {
      type: Function,
      default: function _default() {}
    },
    user: {
      type: Object,
      default: function _default() {
        return {
          user_id: 'default123'
        };
      }
    },
    dynamicColumns: {
      type: Array,
      default: function _default() {
        return null;
      }
    },
    options: {
      type: Object,
      default: function _default() {
        return {
          user_id: 'default123'
        };
      }
    },
    dataLocation: {
      type: String,
      required: false
    },
    customDomain: {
      type: String,
      required: false
    },
    language: {
      type: String,
      required: false
    },
    lazy: {
      type: Boolean,
      required: false,
      default: false
    },
    loadStarted: {
      type: Function,
      default: function _default() {}
    }
  },
  computed: {
    iframeSrc: function iframeSrc() {
      var domain = this.customDomain ? this.customDomain : "app.csvbox.io";

      if (this.dataLocation) {
        domain = "".concat(this.dataLocation, "-").concat(domain);
      }

      var iframeUrl = "https://".concat(domain, "/embed/").concat(this.licenseKey);
      iframeUrl += "?library-version=1.1.4";
      iframeUrl += "&framework=vue3";

      if (this.dataLocation) {
        iframeUrl += "&preventRedirect";
      }

      if (this.language) {
        iframeUrl += "&language=" + this.language;
      }

      return iframeUrl;
    }
  },
  data: function data() {
    return {
      isModalShown: false,
      disableImportButton: true,
      uuid: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
      iframe: null,
      isIframeLoaded: false,
      openModalOnIframeLoad: false
    };
  },
  methods: {
    openModal: function openModal() {
      if (this.lazy) {
        if (!this.iframe) {
          this.openModalOnIframeLoad = true;
          this.initImporter();
          return;
        }
      }

      if (!this.isModalShown) {
        if (this.isIframeLoaded) {
          this.isModalShown = true;
          this.$refs.holder.style.display = 'block';
          this.iframe.contentWindow.postMessage('openModal', '*');
        } else {
          this.openModalOnIframeLoad = true;
        }
      }
    },
    onMessageEvent: function onMessageEvent(event) {
      if (_typeof(event.data) == "object") {
        var _event$data, _event$data$data;

        if ((event === null || event === void 0 ? void 0 : (_event$data = event.data) === null || _event$data === void 0 ? void 0 : (_event$data$data = _event$data.data) === null || _event$data$data === void 0 ? void 0 : _event$data$data.unique_token) == this.uuid) {
          if (event.data.type && event.data.type == "data-on-submit") {
            var _this$onSubmit;

            var metadata = event.data.data;
            metadata["column_mappings"] = event.data.column_mapping;
            delete metadata["unique_token"];
            (_this$onSubmit = this.onSubmit) === null || _this$onSubmit === void 0 ? void 0 : _this$onSubmit.call(this, metadata);
          } else if (event.data.type && event.data.type == "data-push-status") {
            if (event.data.data.import_status == "success") {
              if (event && event.data && event.data.row_data) {
                var primary_row_data = event.data.row_data;
                var headers = event.data.headers;
                var rows = [];
                var dynamic_columns_indexes = event.data.dynamicColumnsIndexes;
                var virtual_columns_indexes = event.data.virtualColumnsIndexes || [];
                var dropdown_display_labels_mappings = event.data.dropdown_display_labels_mappings;
                primary_row_data.forEach(function (row_data) {
                  var x = {};
                  var dynamic_columns = {};
                  var virtual_data = {};
                  row_data.data.forEach(function (col, i) {
                    if (col == undefined) {
                      col = "";
                    }

                    if (!!dropdown_display_labels_mappings[i] && !!dropdown_display_labels_mappings[i][col]) {
                      col = dropdown_display_labels_mappings[i][col];
                    }

                    if (dynamic_columns_indexes.includes(i)) {
                      dynamic_columns[headers[i]] = col;
                    } else if (virtual_columns_indexes.includes(i)) {
                      virtual_data[headers[i]] = col;
                    } else {
                      x[headers[i]] = col;
                    }
                  });

                  if (row_data !== null && row_data !== void 0 && row_data.unmapped_data) {
                    x["_unmapped_data"] = row_data.unmapped_data;
                  }

                  if (dynamic_columns && Object.keys(dynamic_columns).length > 0) {
                    x["_dynamic_data"] = dynamic_columns;
                  }

                  if (virtual_data && Object.keys(virtual_data).length > 0) {
                    x["_virtual_data"] = virtual_data;
                  }

                  rows.push(x);
                });
                var _metadata = event.data.data;
                _metadata["rows"] = rows;
                _metadata["column_mappings"] = event.data.column_mapping;
                _metadata["raw_columns"] = event.data.raw_columns;
                _metadata["ignored_columns"] = event.data.ignored_column_row;
                delete _metadata["unique_token"];
                this.onImport(true, _metadata);
              } else {
                var _metadata2 = event.data.data;
                delete _metadata2["unique_token"];
                this.onImport(true, _metadata2);
              }
            } else {
              console.log("onImport", false, event.data.data);
              this.onImport(false, event.data.data);
            }
          } else if (event.data.type && event.data.type == "csvbox-modal-hidden") {
            this.$refs.holder.style.display = 'none';
            this.isModalShown = false;
            this.onClose();
          } else if (event.data.type && event.data.type == "csvbox-upload-successful") {
            this.onImport(true);
          } else if (event.data.type && event.data.type == "csvbox-upload-failed") {
            this.onImport(false);
          }
        }
      }
    },
    randomString: function randomString() {
      var result = '';
      var characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
      var charactersLength = characters.length;

      for (var i = 0; i < 20; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
      }

      return result;
    },
    initImporter: function initImporter() {
      this.loadStarted();
      var iframe = document.createElement("iframe");
      this.iframe = iframe;
      iframe.setAttribute("src", this.iframeSrc);
      iframe.frameBorder = 0;
      iframe.classList.add('csvbox-iframe');
      window.addEventListener("message", this.onMessageEvent, false);
      var self = this;

      iframe.onload = function () {
        self.isIframeLoaded = true;
        iframe.contentWindow.postMessage({
          "customer": self.user ? vue.isProxy(self.user) ? vue.toRaw(self.user) : self.user : null,
          "columns": self.dynamicColumns ? vue.isProxy(self.dynamicColumns) ? vue.toRaw(self.dynamicColumns) : self.dynamicColumns : null,
          "options": self.options ? vue.isProxy(self.options) ? vue.toRaw(self.options) : self.options : null,
          "unique_token": self.uuid
        }, "*");
        self.disableImportButton = false;
        self.onReady();

        if (self.openModalOnIframeLoad) {
          self.openModal();
        }
      };

      this.$refs.holder.appendChild(iframe);
    }
  },
  mounted: function mounted() {
    // window.addEventListener("message", this.onMessageEvent, false);
    // let iframe = this.$refs.iframe;
    // let self = this;
    // iframe.onload = function () {
    //     iframe.contentWindow.postMessage({
    //     }, "*");
    //     self.disableImportButton = false;
    //     self.onReady();
    // }
    if (this.lazy) {
      this.disableImportButton = false;
    } else {
      this.initImporter();
    }
  },
  beforeDestroy: function beforeDestroy() {
    window.removeEventListener("message", this.onMessageEvent);
  }
});var _hoisted_1 = ["disabled"];
var _hoisted_2 = {
  ref: "holder",
  class: "holder-style"
};
function render(_ctx, _cache, $props, $setup, $data, $options) {
  return vue.openBlock(), vue.createElementBlock("div", null, [vue.createElementVNode("button", {
    disabled: _ctx.disableImportButton,
    onClick: _cache[0] || (_cache[0] = function () {
      return _ctx.openModal && _ctx.openModal.apply(_ctx, arguments);
    })
  }, [vue.renderSlot(_ctx.$slots, "default")], 8, _hoisted_1), vue.createElementVNode("div", _hoisted_2, null, 512)]);
}function styleInject(css, ref) {
  if ( ref === void 0 ) ref = {};
  var insertAt = ref.insertAt;

  if (!css || typeof document === 'undefined') { return; }

  var head = document.head || document.getElementsByTagName('head')[0];
  var style = document.createElement('style');
  style.type = 'text/css';

  if (insertAt === 'top') {
    if (head.firstChild) {
      head.insertBefore(style, head.firstChild);
    } else {
      head.appendChild(style);
    }
  } else {
    head.appendChild(style);
  }

  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
}var css_248z$1 = "\n.holder-style[data-v-6715f94f] {\n        display: none;\n        z-index: 2147483647;\n        position: fixed;\n        top: 0;\n        bottom: 0;\n        left: 0;\n        right: 0;\n}\n";
styleInject(css_248z$1);var css_248z = "\n.csvbox-iframe {\n    height: 100%;\n    width: 100%;\n    position: absolute;\n    top: 0;\n    left: 0;\n}\n";
styleInject(css_248z);script.render = render;
script.__scopeId = "data-v-6715f94f";// Import vue component
// IIFE injects install function into component, allowing component
// to be registered via Vue.use() as well as Vue.component(),

var component = /*#__PURE__*/(function () {
  // Get component instance
  var installable = script; // Attach install function executed by Vue.use()

  installable.install = function (app) {
    app.component('CSVBoxButton', installable);
  };

  return installable;
})(); // It's possible to expose named exports when writing components that can
// also be used as directives, etc. - eg. import { RollupDemoDirective } from 'rollup-demo';
// export const RollupDemoDirective = directive;
var namedExports=/*#__PURE__*/Object.freeze({__proto__:null,'default':component});// only expose one global var, with named exports exposed as properties of
// that global var (eg. plugin.namedExport)

Object.entries(namedExports).forEach(function (_ref) {
  var _ref2 = _slicedToArray(_ref, 2),
      exportName = _ref2[0],
      exported = _ref2[1];

  if (exportName !== 'default') component[exportName] = exported;
});module.exports=component;