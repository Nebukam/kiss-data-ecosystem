'use strict';

const { U, PATH } = require(`@nkm/utils`);

const { JSONResource } = require(`@nkm/data-core`);
const { Document } = require(`@nkm/documents`);

const { SERIALIZATION } = require(`../serialization/@.js`);
const { SERIALIZER_JSON } = require(`../serialization/keys.js`);

class DataBlockDocument extends Document{

    
    static get _NFO_(){ return U.CopyMissing({
        resourceType:JSONResource,
        serializer:SERIALIZER_JSON
    }, Document.__NFO__);}

    constructor() { super(); }

    _Init(){
        super._Init();
        this._data = null;
        this._ecosystem = null;
    }

    get data(){ return this._data; }
    set data(p_value){ 
        if(this._data == p_value){ return; }
        this._data = p_value;
        if(this._data){
            this._ecosystem = U.Default(this._data._ecosystem, this._ecosystem);
        }else{
            this._ecosystem = null;
        }
    }

    //Packs the data into a format the ressource can write down.
    //JSONResource expect the data to be packed as stringifyable json object.
    _Pack(){
        var serializer = SERIALIZATION.GetSerializer(this._serializationType);
        if(!serializer){ throw new Error(`Could not find main serializer for ${this._serializationType.name}`); }
        return serializer.Serialize(this._data);
    }

    //Unpack the data from the resource content.
    //JSONResource unpack to a javascript object.
    _Unpack(p_pack){
        var serializer = SERIALIZATION.GetSerializer(this._serializationType);
        if(!serializer){ throw new Error(`Could not find main de-serializer for ${this._serializationType.name}`); }
        var id = this._data ? this._data.id ? this._data.id.name : null : null;
        this._data = serializer.Deserialize(p_pack, {
            ecosystem : this._ecosystem,
            id : id ? id : PATH.name(this._path)
          }, this._data);

        this._data.dirty = false;
    }

    _CleanUp(){
        this._data = null;
        super._CleanUp();
    }

}

module.exports = DataBlockDocument;