const { U } = require(`../../@`);
const DataBlockJSONSerializer = require(`./data-block-json-serializer`);
const { AssocManager } = require(`../../environment/@`);
const { SERIALIZER_JSON } = require(`./../keys`);

class DataEntryJSONSerializer extends DataBlockJSONSerializer{
    constructor(){super();}

    /**
     * Return the target as a JSON Object
     * @param {*} p_target 
     * @param {*} p_options 
     */
    static Serialize( p_target, p_options = null ){
        var serial = DataBlockJSONSerializer.Serialize(p_target, p_options);



        return serial;
    }

    /**
     * Return an entry object from the provided serial
     * Or override available info in provided target.
     * @param {*} p_serial 
     * @param {*} p_options 
     * @param {*} p_target 
     */
    static Deserialize( p_serial, p_options = null, p_target = null ){
        var p_target = DataBlockJSONSerializer.Deserialize(p_serial, p_options, p_target);

        return p_target;
    }

}

module.exports = DataEntryJSONSerializer;