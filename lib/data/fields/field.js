'use strict';

//A field descriptor is used for
// - declaring a value slot in a data entry
// - data validation when attempting to change that entry field`s value
// - a field type may be :
//      - a native value
//      - a data-model entry : either a reference to an existing one, or an "embedded" one.
//          - embedded data-model entries are in fact created and "hidden" elsewhere, so they are never really embedded.

const { DisposableObjectEx } = require(`@nkm/common`);

const _val_default = Symbol(`default`);
const _val_inherit = Symbol(`inherit`);

class Field extends DisposableObjectEx {
    constructor() { super(); }

    static get DEFAULT() { return _val_default; }
    static get INHERIT() { return _val_inherit; }

    static get _NFO_() {
        return {
            icon: `%ICON%/KitCore/icon_field.svg`
        };
    }

    // A field setting definition is stored
    // inside the FieldSetting object, instead of inside the field instance
    // The instance is only used for control & data validation purposes.

    _Init() {
        super._Init();
        this._settings = null;
    }

    get settings() { return this._settings; }
    set settings(p_value) {
        if (this._settings == p_value) { return; }
        var oldSettings = this._settings;
        this._settings = p_value;
        this._OnSettingsChanged(oldSettings);
    }

    _OnSettingsChanged(p_oldSettings) {

    }

    _CleanUp() {
        this._settings = null;
        super._CleanUp();
    }

    toString() {
        if (!this._id) {
            return `[Field::?]`;
        } else {
            return `[Field::${this.constructor.name}]`;
        }
    }

}

module.exports = Field;