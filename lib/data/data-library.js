/**
 * A DataLibrary manages a single data-model and all corresponding entries.
 * In order to use a factory, it must be provided with a valid data-model
 * as well as a valid DataEntry constructor that will be used to store data.
 * 
 * The workflow is as follow :
 * Request a new, empty entry through CreateTemp()
 * then register it using Register( p_entry, p_id ).
 * If the id is already in use, the registration will fail. Make sure
 * the id is not already in use through 
 * 
 */
'use strict';

const { Observer } = require(`@nkm/common`);
const { DATA_EVENT, DataFactory } = require(`@nkm/data-core`);

const ECOSYSTEM_CONSTANTS = require(`../ecosystem-constants`);
const DataEntry = require(`./data-entry`);
const FIELD_EVENT = require(`./fields/field-event`);

class DataLibrary extends DataFactory {
    constructor() { super(); }

    _Init() {
        super._Init();
        this._model = null;
        this._itemClass = DataEntry;

        this._modelObserver = new Observer();
        this._modelObserver.Hook(FIELD_EVENT.FIELD_ADDED, this._OnModelFieldAdded, this);
        this._modelObserver.Hook(FIELD_EVENT.FIELD_REMOVED, this._OnModelFieldRemoved, this);
        this._modelObserver.Hook(FIELD_EVENT.FIELD_UPDATED, this._OnModelFieldUpdated, this);
        this._modelObserver.Hook(FIELD_EVENT.FIELD_RENAMED, this._OnModelFieldRenamed, this);

        this._modelObserver.Hook(DATA_EVENT.DIRTY, this._OnModelDirty, this);

    }

    get model() {
        return this._model;
    }

    set model(p_value) {

        if (this._model == p_value) { return; }

        var oldValue = this._model;
        this._model = p_value;

        if (oldValue) {

        }
        if (p_value) {

        }

        this._modelObserver.observable = p_value;
        this._OnModelChanged(oldValue);

    }

    _OnModelChanged(p_oldModel) {

    }

    _OnModelFieldAdded(p_model, p_fieldSettings) {
        var list = this.itemList._array;
        var n = list.length;
        if (p_fieldSettings.model == p_model) {
            // Model emitter is field owner
            for (var i = 0; i < n; i++) {
                list[i]._FieldAdded(p_fieldSettings.id, ECOSYSTEM_CONSTANTS.DEFAULT);
            }
        } else {
            // Model emitter is not the field owner
            // This is an inherited field
            for (var i = 0; i < n; i++) {
                list[i]._FieldAdded(p_fieldSettings.id, ECOSYSTEM_CONSTANTS.INHERIT);
            }
        }
    }

    _OnModelFieldRemoved(p_model, p_fieldSettings) {
        var list = this.itemList._array;
        for (var i = 0, n = list.length; i < n; i++) {
            list[i]._FieldRemoved(p_fieldSettings.id);
        }
    }

    _OnModelFieldUpdated(p_model, p_fieldSettings) {
        //Update all entries, if needed
    }

    _OnModelFieldRenamed(p_model, p_id, p_oldName) {
        var list = this.itemList._array;
        var id = p_model.id;
        for (var i = 0, n = list.length; i < n; i++) {
            list[i]._FieldRenamed(id, p_oldName);
        }
    }

    _OnModelDirty(p_model) {
        var list = this.itemList._array;
        for (var i = 0, n = list.length; i < n; i++) {
            list[i].dirty = true;
        }
    }

    /**
     * Create a temp data entry to be registered afterward.
     */
    CreateTemp(p_from = null, p_class = null) {

        //!!!! Watch out for potential issues with CreateTemp having a different signature from extended DataFactory. 

        if (!this._model) {
            throw new Error("Attempting to create an entry using a factory with no model set.");
        }

        var m = this._model;
        var newEntry = super.CreateTemp(p_class);
        newEntry.model = m;

        //Fill temp model with fields
        var f = null;
        var totalCount = m.FieldCount(false);

        if (!p_from) {
            for (var i = 0; i < totalCount; i++) {
                f = m.GetFieldAt(i, false);
                newEntry._FieldAdded(f.id, ECOSYSTEM_CONSTANTS.DEFAULT);
            }
        } else {
            newEntry.base = p_from;
            for (var i = 0; i < totalCount; i++) {
                f = m.GetFieldAt(i, false);
                // newEntry._FieldAdded(f.id, ECOSYSTEM_CONSTANTS.INHERIT);
            }
        }

        return newEntry;

    }

    _CleanUp() {
        super._CleanUp();
    }

}

module.exports = DataLibrary;