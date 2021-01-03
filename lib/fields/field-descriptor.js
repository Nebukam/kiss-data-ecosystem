'use strict';

const { U, M } = require(`../@.js`);
const { COLLECTION_EVENT } = require(`../collections/@.js`);

const DATA_EVENT = require(`./core-data-event.js`);
const DataBlock = require(`./data-block.js`);
const Repertoire = require(`./repertoire.js`);

class FieldDescriptor extends DataBlock{
    constructor() {super();}

    _Init(){
        super._Init();
        this._fieldClass = null;
        this._fieldMeta = null;
    }

    get fieldClass(){
        return this._fieldClass;
    }

    set fieldClass(p_value){
        this._fieldClass = p_value;
        if(p_value){
            var meta = M.ETA(p_value);
            if(meta){
                this.fieldMeta = meta;
            }
        }
    }

    get fieldMeta(){
        return this._fieldMeta;
    }

    set fieldMeta(p_value){
        this._fieldMeta = p_value;
    }    

    _CleanUp()
    {
        this._fieldClass = null;
        this._fieldMeta = null;
        super._CleanUp();
    }

}

module.exports = FieldDescriptor;