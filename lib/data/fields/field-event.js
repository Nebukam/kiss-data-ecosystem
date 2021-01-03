'use strict';

const _evt_fieldAdded           = Symbol(`fieldAdded`);
const _evt_fieldRemoved         = Symbol(`fieldRemoved`);
const _evt_fieldRenamed         = Symbol(`fieldRenamed`);
const _evt_fieldUpdated         = Symbol(`fieldUpdated`);
const _evt_fieldClassChanged         = Symbol(`fieldClassChanged`);

class FIELD_EVENT{
    constructor() {}

    static get FIELD_ADDED(){ return _evt_fieldAdded; }
    static get FIELD_REMOVED(){ return _evt_fieldRemoved; }
    static get FIELD_RENAMED(){ return _evt_fieldRenamed; }
    static get FIELD_UPDATED(){ return _evt_fieldUpdated; }
    static get FIELD_CLASS_CHANGED(){ return _evt_fieldClassChanged; }

}

module.exports = FIELD_EVENT;