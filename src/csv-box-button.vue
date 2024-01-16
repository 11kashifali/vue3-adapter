<script>
import { defineComponent } from 'vue';
import { isProxy, toRaw } from 'vue';
export default /*#__PURE__*/defineComponent({
  name: 'CSVBoxButton', // vue component name
  props: {
    licenseKey: {
        type: String,
        required: true
    },
    onImport: {
        type: Function,
        default: function() {}
    },
    onReady: {
        type: Function,
        default: function() {}
    },
    onSubmit: {
        type: Function,
        default: function() {}
    },
    onClose:{
        type: Function,
        default: function() {}
    },
    user: {
        type: Object,
        default: function () {
            return { user_id: 'default123' };
        }
    },
    dynamicColumns:{
        type: Array,
        default: function () {
            return null;
        }
    },
    options: {
        type: Object,
        default: function () {
            return { user_id: 'default123' };
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
        default: function() {}
    }
  },
  computed: {
        iframeSrc() {
            let domain = this.customDomain ? this.customDomain : "app.csvbox.io";
            if(this.dataLocation) { domain = `${this.dataLocation}-${domain}`; }
            let iframeUrl = `https://${domain}/embed/${this.licenseKey}`;
            iframeUrl += `?library-version=1.1.4`;
            iframeUrl += "&framework=vue3";
            if(this.dataLocation) {
                iframeUrl += "&preventRedirect";
            }
            if(this.language) {
                iframeUrl += "&language=" + this.language;
            }
            return iframeUrl;
        }
    },
    data(){
        return {
            isModalShown: false,
            disableImportButton: true,
            uuid: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
            iframe: null,
            isIframeLoaded: false,
            openModalOnIframeLoad: false,
        }
    },
  methods: {
        openModal() {
            if(this.lazy) {
                if(!this.iframe) {
                    this.openModalOnIframeLoad = true;
                    this.initImporter();
                    return;
                }
            }
            if(!this.isModalShown) {
                if(this.isIframeLoaded) {
                    this.isModalShown = true;
                    this.$refs.holder.style.display = 'block';
                    this.iframe.contentWindow.postMessage('openModal', '*');
                } else {
                    this.openModalOnIframeLoad = true;
                }                    
            }
        },
      onMessageEvent(event) {

        if(typeof event.data == "object") {
            if(event?.data?.data?.unique_token == this.uuid) {
                if(event.data.type && event.data.type == "data-on-submit") {
                    let metadata = event.data.data;
                    metadata["column_mappings"] = event.data.column_mapping;
                    delete metadata["unique_token"];
                    this.onSubmit?.(metadata);
                }
                else if(event.data.type && event.data.type == "data-push-status") {
                    if(event.data.data.import_status == "success") {
                        if(event && event.data && event.data.row_data) {
                            let primary_row_data = event.data.row_data;
                            let headers = event.data.headers;
                            let rows = [];
                            let dynamic_columns_indexes = event.data.dynamicColumnsIndexes;
                            let virtual_columns_indexes = event.data.virtualColumnsIndexes || [];
                            let dropdown_display_labels_mappings = event.data.dropdown_display_labels_mappings;
                            primary_row_data.forEach((row_data) => {
                                let x = {};
                                let dynamic_columns = {};
                                let virtual_data = {};
                                row_data.data.forEach((col, i)=>{
                                    if(col == undefined){ col = "" };
                                    if(!!dropdown_display_labels_mappings[i] && !!dropdown_display_labels_mappings[i][col]) {
                                        col = dropdown_display_labels_mappings[i][col];
                                    }
                                    if(dynamic_columns_indexes.includes(i)) {
                                        dynamic_columns[headers[i]] = col;
                                    }
                                    else if(virtual_columns_indexes.includes(i)) {
                                        virtual_data[headers[i]] = col;
                                    }
                                    else{
                                        x[headers[i]] = col;
                                    }
                                });
                                if(row_data?.unmapped_data) {
                                    x["_unmapped_data"] = row_data.unmapped_data;
                                }
                                if(dynamic_columns && Object.keys(dynamic_columns).length > 0) {
                                    x["_dynamic_data"] = dynamic_columns;
                                }
                                if(virtual_data && Object.keys(virtual_data).length > 0) {
                                    x["_virtual_data"] = virtual_data;
                                }
                                rows.push(x);
                            });
                            let metadata = event.data.data;
                            metadata["rows"] = rows;
                            metadata["column_mappings"] = event.data.column_mapping;
                            metadata["raw_columns"] = event.data.raw_columns;
                            metadata["ignored_columns"] = event.data.ignored_column_row;
                            delete metadata["unique_token"];
                            this.onImport(true, metadata);
                        }else{
                            let metadata = event.data.data;
                            delete metadata["unique_token"];
                            this.onImport(true, metadata);
                            }

                        } else {
                            console.log("onImport", false, event.data.data);
                            this.onImport(false, event.data.data);
                        }
                    } else if(event.data.type && event.data.type == "csvbox-modal-hidden") {
                        this.$refs.holder.style.display = 'none';
                        this.isModalShown = false;
                        this.onClose();
                    } else if(event.data.type && event.data.type == "csvbox-upload-successful") {
                        this.onImport(true);
                    } else if(event.data.type && event.data.type == "csvbox-upload-failed") {
                        this.onImport(false);
                    }
                }
            }
        },
        randomString() {
            let result = '';
            let characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
            let charactersLength = characters.length;
            for (let i = 0; i < 20; i++) {
                result += characters.charAt(Math.floor(Math.random() * charactersLength)); 
            }
            return result;
        },
        initImporter() {

            this.loadStarted();

            let iframe = document.createElement("iframe");
            this.iframe = iframe;
            iframe.setAttribute("src", this.iframeSrc);
            iframe.frameBorder = 0;
            iframe.classList.add('csvbox-iframe');

            window.addEventListener("message", this.onMessageEvent, false);

            let self = this;

            iframe.onload = function () {
                self.isIframeLoaded = true;
                iframe.contentWindow.postMessage({
                    "customer" : self.user ? (isProxy(self.user) ? toRaw(self.user) : self.user) : null,
                    "columns" : self.dynamicColumns ? (isProxy(self.dynamicColumns) ? toRaw(self.dynamicColumns) : self.dynamicColumns) : null,
                    "options" : self.options ? (isProxy(self.options) ? toRaw(self.options) : self.options) : null,
                    "unique_token": self.uuid
                }, "*");
                self.disableImportButton = false;
                self.onReady();
                if(self.openModalOnIframeLoad) {
                    self.openModal();
                }
            }

            this.$refs.holder.appendChild(iframe);

        }
  },
  mounted() {

        // window.addEventListener("message", this.onMessageEvent, false);
        // let iframe = this.$refs.iframe;
        // let self = this;
        // iframe.onload = function () {
        //     iframe.contentWindow.postMessage({
                
        //     }, "*");
        //     self.disableImportButton = false;
        //     self.onReady();
        // }

        if(this.lazy) {
            this.disableImportButton = false;
        } else {
            this.initImporter();
        }

    },
  beforeDestroy() {
      window.removeEventListener("message", this.onMessageEvent);
  }
});
</script>

<template>
    <div>
        <button :disabled="disableImportButton" @click="openModal">
            <slot></slot>
        </button>
        <div ref="holder" class="holder-style">
            <!-- <iframe ref="iframe" class="iframe" :src="iframeSrc" frameBorder="0"></iframe> -->
        </div>
    </div>
</template>

<style scoped>
    .holder-style {
        display: none;
        z-index: 2147483647;
        position: fixed;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
    }
</style>
<style>
.csvbox-iframe {
    height: 100%;
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
}
</style>
