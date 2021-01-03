const { U } = require(`@nkm/utils`);
const { Dictionary } = require(`@nkm/collections`);
const { Observer } = require(`@nkm/common`);
const { ID } = require(`@nkm/core-data`);

const Model = require(`./model`);
const FieldSettingsProxy = require(`../fields/field-settings-proxy`);

const _evt_proxyFieldRegistered = Symbol(`proxyFieldRegistered`);
const _evt_proxyFieldUnregistered = Symbol(`proxyFieldUnregistered`);

const FIELD_EVENT = require(`../fields/field-event`);

class ModelProxy extends Model {
    constructor() { super(); }

    static get PROXY_FIELD_REGISTERED() { return _evt_proxyFieldRegistered; }
    static get PROXY_FIELD_UNREGISTERED() { return _evt_proxyFieldUnregistered; }

    _Init() {
        super._Init();
        this._referenceModel = null;
        this._id = new ID();
        this._proxyMap = new Dictionary();

        this._refObserver = new Observer();
        this._refObserver.Hook(FIELD_EVENT.FIELD_ADDED, this._OnRefModelFieldAdded, this);
        this._refObserver.Hook(FIELD_EVENT.FIELD_REMOVED, this._OnRefModelFieldRemoved, this);

    }

    get referenceModel() { return this._referenceModel; }
    set referenceModel(p_value) {
        if (this._referenceModel == p_value) { return; }
        var oldRef = this._referenceModel;
        this._referenceModel = p_value;

        this._refObserver.observable = p_value;

        if (oldRef) {
            this._ClearProxy();
        }

        if (p_value) {
            this._BuildProxy();
        }
    }

    _ClearProxy() {

        this._id.name = `(no_ref)`;
        this.ecosystem = null;
        this.base = null;

        var fieldList = this._fieldRep.itemList;
        var proxyFieldSettings = null;
        var fieldSettings = null;

        while (fieldList.length != 0) {
            proxyFieldSettings = fieldList[fieldList.length - 1];
            this.Unregister(proxyFieldSettings);
            this._Notify(ModelProxy.PROXY_FIELD_UNREGISTERED, this, proxyFieldSettings);
            proxyFieldSettings.Release();
        }

        this._proxyMap.Clear();

    }

    _BuildProxy() {

        var ref = this._referenceModel;

        this._id.name = ref.id.name;
        this.ecosystem = ref.ecosystem;

        this._metadata.Clone(ref.metadata);
        this.base = ref.base;

        var fieldList = ref.localFieldList;
        var proxyFieldSettings = null;

        for (var i = 0, n = fieldList.length; i < n; i++) {
            proxyFieldSettings = this._RegisterProxyField(fieldList[i]);
            proxyFieldSettings.metadata.dirty = false;
            proxyFieldSettings.dirty = false;
        }

    }

    _RegisterProxyField(p_fieldSettings) {

        var proxyFieldSettings = Model.CreateField(
            this,
            p_fieldSettings.fieldClass,
            p_fieldSettings.id.name,
            {
                cl: FieldSettingsProxy,
                settings: U.Clone(p_fieldSettings.settings),
                metadata: p_fieldSettings.metadata
            });

        proxyFieldSettings.referenceField = p_fieldSettings;
        this._proxyMap.Set(p_fieldSettings, proxyFieldSettings);

        this._Notify(ModelProxy.PROXY_FIELD_REGISTERED, this, proxyFieldSettings);
        return proxyFieldSettings;

    }

    _OnRefModelFieldAdded() {

    }

    _OnRefModelFieldRemoved() {

    }

    _CleanUp() {
        this.referenceModel = null;
        super._CleanUp();
    }

}

module.exports = ModelProxy;