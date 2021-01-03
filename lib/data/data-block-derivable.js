'use strict';

const { EVENT, Observer } = require(`@nkm/common`);

const ECOSYSTEM_EVENT = require(`../ecosystem-event`);
const DataBlockEx = require("./data-block-ex");

class DerivableDataBlock extends DataBlockEx {
    constructor() { super(); }

    _Init() {
        super._Init();
        this._base = null;
        this._baseObserver = new Observer();
        this._baseObserver.Hook(EVENT.RELEASED, this._OnBaseReleased, this);
        this._baseObserver.Hook(EVENT.UPDATED, this._OnBaseUpdated, this);
    }

    get base() { return this._base; }
    set base(p_value) {
        if (this._base == p_value) { return; }

        var oldBase = this._base;

        //Stop catching events during derivation clean up
        if (oldBase) {
            this._baseObserver.observable = null;
            this._ClearDerivation(oldBase);
        }

        this._base = p_value;

        if (p_value) {
            this._baseObserver.observable = p_value;
            this._BuildDerivation(p_value);
        }

        this._OnBaseChanged(oldBase);
        this._Notify(ECOSYSTEM_EVENT.BASE_CHANGED, this, oldBase);
        if (p_value) { this._OnBaseUpdated(p_value); }
        this.dirty = true;
    }

    _ClearDerivation(p_oldBase) {

    }

    _BuildDerivation(p_base) {

    }

    _OnBaseChanged(p_oldValue) {

    }

    _OnBaseUpdated(p_base) {

    }

    _OnBaseReleased(p_base) {
        this.base = null;
    }

    _CleanUp() {
        this.base = null;
        super._CleanUp();
    }

}

module.exports = DerivableDataBlock;