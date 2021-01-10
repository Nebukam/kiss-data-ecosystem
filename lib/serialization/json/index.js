'use strict';

function RegisterBindings(){
    /*
    var { BINDINGS } = require("@nkm/common");
    var { DataEntry, FieldSettings, Model } = require("../../data");
    var SKEYS = require(`../serializer-keys`);
    
    BINDINGS.Set( Metadata, require("./metadata-json-serializer"), SKEYS.JSON );
    BINDINGS.Set( DataBlock, require("./data-block-json-serializer"), SKEYS.JSON );
    */
}

module.exports = {
    MetadataJSONSerializer: require(`./metadata-json-serializer`),
    DataBlockJSONSerializer: require(`./data-block-json-serializer`),
    RegisterBindings: RegisterBindings
}