'use strict';

const { U, C, URI } = require(`../@.js`);
const { Dictionary } = require(`../collections/@.js`);
const DATA_EVENT = require(`./core-data-event.js`);
const DataBlock = require(`./data-block.js`);

class DataBlockEx extends DataBlock{
    constructor() {super();}

    _Init(){
        super._Init();
        this._ecosystem = null;    
    }

    
    get ecosystem(){return this._ecosystem;}
    set ecosystem(p_value){this._ecosystem = p_value;}
    
    _CleanUp()
    {
        this._ecosystem = null;
        super._CleanUp();
    }

}

module.exports = DataBlockEx;