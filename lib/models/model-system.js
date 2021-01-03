'use strict';

const { U } = require(`../@.js`);
const { COLLECTION_EVENT } = require(`../collections/@.js`);

const DATA_EVENT = require(`./core-data-event.js`);
const DataBlock = require(`./data-block.js`);
const Repertoire = require(`./repertoire.js`);
const Model = require(`./model.js`);

class SystemModel extends Model{
    constructor() {super();}

    _Init(){
        super._Init();
        this._editable = false;
    }

    _CleanUp()
    {
        super._CleanUp();
    }

    toString(){
        if(!this._id){ 
            return `[Model::?]`;
        }else{
            return `[Model::${this._id.name}]`;
        }
    }

}

module.exports = SystemModel;