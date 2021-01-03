'use strict';

const { U, EVENT } = require(`../@.js`);
const DATA_EVENT = require(`./core-data-event.js`);
const DataBlock = require(`./data-block.js`);
const METADATA = require(`./metadata.js`);
const Observer = require(`../signals/observer.js`);

class DerivableDataBlock extends DataBlock{
    constructor() {super();}

    _Init(){
        super._Init();
        this._base = null;
        this._baseObserver = new Observer();
        this._baseObserver.Hook(EVENT.RELEASED, this, this._OnBaseReleased);
        this._baseObserver.Hook(EVENT.UPDATED, this, this._OnBaseUpdated);
    } 

    get base(){return this._base;}
    set base(p_value){
        if(this._base == p_value){return;}

        var oldBase = this._base;

        //Stop catching events during derivation clean up
        if(oldBase){
            this._baseObserver.observable = null;
            this._ClearDerivation(oldBase);
        }

        this._base = p_value;

        if(p_value){
            this._baseObserver.observable = p_value;
            this._BuildDerivation(p_value);
        }

        this._OnBaseChanged(oldBase);
        this._Notify(DATA_EVENT.BASE_CHANGED, this, oldBase);
        if(p_value){this._OnBaseUpdated(p_value);}
        this.dirty = true;
    }

    _ClearDerivation(p_oldBase){
        
    }

    _BuildDerivation(p_base){

    }

    _OnBaseChanged(p_oldValue){

    }

    _OnBaseUpdated(p_base){
        
    }

    _OnBaseReleased(p_base){
        this.base = null;
    }

    _CleanUp(){
        this.base = null;
        super._CleanUp();
    }

}

module.exports = DerivableDataBlock;