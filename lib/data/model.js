'use strict';

const { U } = require(`@nkm/utils`);
const { EVENT, POOL } = require(`@nkm/common`);
const { DATA_EVENT, Metadata, Repertoire } = require(`@nkm/data-core`);

const DerivableDataBlock = require(`./data-block-derivable`);

const FIELD_EVENT = require(`./fields/field-event`);
const FieldSettings = require(`./fields/field-settings`);

let uinc = 0;

class Model extends DerivableDataBlock {
    constructor() { super(); }

    static CreateField(p_model, p_fieldClass, p_id, p_options = null) {

        var fieldSettings = POOL.Rent(U.Get(p_options, `cl`, FieldSettings));
        fieldSettings.fieldClass = p_fieldClass;
        fieldSettings.instance = POOL.Rent(p_fieldClass);

        var settings = U.Get(p_options, `settings`, null);
        if (settings) { fieldSettings.settings = settings; }
        var metadata = U.Get(p_options, `metadata`, null);
        if (metadata) {
            if (U.isInstanceOf(metadata, Metadata)) {
                fieldSettings.metadata.Clone(metadata);
            } else {
                fieldSettings.metadata._data = metadata;
            }
        }

        p_model.Register(fieldSettings, p_id);
        return fieldSettings;

    }

    static get _NFO_() {
        return {
            icon: `%ICON%/icon_model.svg`
        };
    }

    _NFO_() {
        return this._NFO;
    }

    _Init() {
        super._Init();

        this._uinc = uinc++;

        this._NFO = null;
        this._base = null;

        this._editable = true;
        this._entryCreationAllowed = true;

        this._fieldRep = new Repertoire();
        this._fieldRep.Subscribe(DATA_EVENT.ITEM_REGISTERED, this._OnFieldRegistered, this);
        this._fieldRep.Subscribe(DATA_EVENT.ITEM_UNREGISTERED, this._OnFieldUnregistered, this);
        this._fieldRep.Subscribe(EVENT.RENAMED, this._OnFieldRenamed, this);

        this._baseObserver.Hook(FIELD_EVENT.FIELD_ADDED, this._OnBaseFieldAdded, this);
        this._baseObserver.Hook(FIELD_EVENT.FIELD_REMOVED, this._OnBaseFieldRemoved, this);
        this._baseObserver.Hook(FIELD_EVENT.FIELD_RENAMED, this._OnBaseFieldRenamed, this);

    }

    // modelID.fieldID
    get uri() { return `${this._id ? this._id.name : '?'}`; }

    get NFO() { return this._NFO; }
    set NFO(p_value) {
        if (this._NFO) { throw new Error(`Cannot update existing model's META infos.`); }
        this._NFO = p_value;
    }

    get editable() { return this._editable; }
    get entryCreationAllowed() { return this._entryCreationAllowed; }

    get localFieldList() { return this._fieldRep.itemList; }

    FieldCount(p_localOnly = true) {
        return p_localOnly ? this._fieldRep.count : this._fieldRep.count + this._InheritedFieldCount();
    }

    GetFieldAt(p_index, p_localOnly = true) {
        return p_localOnly ? this._fieldRep.At(p_index) : this._InheritedFieldAt(p_index);
    }

    _InheritedFieldAt(p_index) {
        var sum = this.FieldCount(false);
        var sumin = sum - this._fieldRep.count;
        var index = p_index - sumin;
        if (p_index >= sumin) {
            return this._fieldRep.At(index);
        } else {
            return this._base._InheritedFieldAt(p_index);
        }
    }

    _InheritedFieldCount() {
        if (!this._base) { return 0; }
        return this._base.FieldCount(false);
    }

    _ClearDerivation(p_oldBase) {
        var fieldSettings = null;
        var fieldCount = p_oldBase.FieldCount(false);
        for (var i = 0; i < fieldCount; i++) {
            fieldSettings = p_oldBase.GetFieldAt(i, false);
            this._OnBaseFieldRemoved(p_oldBase, fieldSettings);
        }
    }

    _BuildDerivation(p_base) {
        var fieldSettings = null;
        var fieldCount = p_base.FieldCount(false);
        for (var i = 0; i < fieldCount; i++) {
            fieldSettings = p_base.GetFieldAt(i, false);
            this._OnBaseFieldAdded(p_base, fieldSettings);
        }
    }

    get root() {
        if (!this._base) {
            return this;
        } else {
            return this._base.root;
        }
    }

    _OnBaseFieldAdded(p_base, p_fieldSettings) {

        var existingField = this._fieldRep.Get(p_fieldSettings.id.name);
        if (existingField) {
            //A field with the same name already exists.
            //Override inherited member.
            existingField.base = p_fieldSettings;
        } else {
            this._Notify(FIELD_EVENT.FIELD_ADDED, this, p_fieldSettings);
        }

    }

    _OnBaseFieldRemoved(p_base, p_fieldSettings) {

        var existingField = this._fieldRep.Get(p_fieldSettings.id.name);
        if (existingField) {
            //A field with the same name already exists.
            existingField.base = null;
        } else {
            this._Notify(FIELD_EVENT.FIELD_REMOVED, this, p_fieldSettings);
        }

    }

    _OnBaseFieldRenamed(p_base, p_id, p_oldName) {

        var existingFieldOld = this._fieldRep.Get(p_oldName);
        var existingFieldNew = this._fieldRep.Get(p_id.name);
        if (existingFieldOld) {
            //A field here was using the same name.
            if (!existingFieldNew) {
                //Rename existing field to keep override valid & active
                existingFieldOld.id.name = p_id.name;
            } else {
                //Unlink old and rename new
                existingFieldOld.base = null;
                existingFieldNew.base = p_base.Get(p_id);
            }
        } else if (existingFieldNew) {
            //No link to old name, but link to the new one
            existingFieldNew.base = p_base.Get(p_id);
        } else {
            this._Notify(FIELD_EVENT.FIELD_RENAMED, this, p_id, p_oldName);
        }

    }

    Inherits(p_model) {

        if (this._base == p_model) { return true; }
        if (!p_model) { return false; }
        if (this == p_model) { return true; }

        if (!this._base) {
            return false;
        } else {
            return this._base.Inherits(p_model);
        }
    }

    GetInheritanceChain(p_includeSelf = false) {

        var path = new Array(0);
        if (p_includeSelf) { path.push(this); }

        var b = this._base;
        while (b) {
            path.push(b);
            b = b.base;
        }
        return path;

    }

    /**
     * Return whether an string ID is available to be used as a field ID
     * @param {string} p_id 
     */
    IsIDAvailable(p_id) {
        return this._fieldRep.IsIDAvailable(p_id);
    }

    Register(p_fieldSettings, p_id) {
        this._fieldRep.Register(p_fieldSettings, p_id);
    }

    _OnFieldRegistered(p_repertoire, p_fieldSettings) {

        p_fieldSettings.Subscribe(DATA_EVENT.DIRTY, this._OnFieldDirty, this);
        p_fieldSettings.model = this;
        p_fieldSettings.fieldIndex = this._fieldRep.IndexOf(p_fieldSettings);
        p_fieldSettings.metadata.Clone(this._ecosystem.fields.metaTemplate);

        if (this._base) {
            var existingField = this._base.Get(p_fieldSettings.id.name);
            if (existingField) {
                p_fieldSettings.base = existingField;
            }
        }

        this._Notify(FIELD_EVENT.FIELD_ADDED, this, p_fieldSettings);
        this.dirty = true;

    }

    Unregister(p_fieldSettings) {
        this._fieldRep.Unregister(p_fieldSettings);
    }

    _OnFieldUnregistered(p_repertoire, p_fieldSettings) {
        p_fieldSettings.Unsubscribe(DATA_EVENT.DIRTY, this._OnFieldDirty, this);
        this._Notify(FIELD_EVENT.FIELD_REMOVED, this, p_fieldSettings);
        if (p_fieldSettings.model == this) {
            p_fieldSettings.model = null;
        }
        this.dirty = true;
    }

    _OnFieldRenamed(p_id, p_oldName) {

        if (this._base) {
            var existingField = this._base.Get(p_id.name);
            if (existingField) {
                this.Get(p_id, true).base = existingField;
            }
        }

        this._Notify(FIELD_EVENT.FIELD_RENAMED, this, p_id, p_oldName);
    }

    _OnFieldDirty(p_fieldSettings) {
        this.dirty = true;
    }

    /**
     * Get this model`s field associated with the given ID.
     * If the field cannot be found, will look in model base, if any, unless
     * p_localOnly is set to true.
     * @param {ID} p_field_id 
     * @param {boolean} p_localOnly 
     */
    Get(p_field_id, p_localOnly = false) {

        var field = this._fieldRep.Get(p_field_id);

        if (!field) {
            if (!this._base || p_localOnly) { return null; }
            return this._base.Get(p_field_id, false);
        } else {
            return field;
        }

    }

    _UpdateLocalFieldIndexes(p_commitUpdate = false) {
        var list = this.localFieldList.internalArray;
        if (p_commitUpdate) {
            var field = null;
            var updated = false;
            for (var i = 0, n = list.length; i < n; i++) {
                field = list[i];

                if (field.fieldIndex == i) { continue; }

                updated = true;
                field.fieldIndex = i;
                field.CommitUpdate();
            }
            if (updated) { this.CommitUpdate(); }
        } else {
            for (var i = 0, n = list.length; i < n; i++) {
                list[i].fieldIndex = i;
            }
        }

    }

    Clear() {
        //TODO : Release all local field settings.
    }

    _CleanUp() {
        this._NFO = null;
        this._fieldRep.Clear();
        this._editable = true;
        this._entryCreationAllowed = true;
        this._isTemp = false;
        super._CleanUp();
    }

    toString() {
        if (!this._id) { return `[(${this._uinc})Model::?]`; }
        return this.uri;
    }

}

module.exports = Model;