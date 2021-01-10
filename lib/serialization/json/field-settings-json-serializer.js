const { U } = require(`../../@`);
const { POOL } = require(`../../collections/@`);

const DataBlockJSONSerializer = require(`./data-block-json-serializer`);
const { AssocManager } = require(`../../environment/@`);
const { SERIALIZER_JSON } = require(`./../keys`);

class FieldSettingsJSONSerializer extends DataBlockJSONSerializer{
    constructor(){super();}

    /**
     * Return the target as a JSON Object
     * @param {*} p_target 
     * @param {*} p_options 
     */
    static Serialize( p_target, p_options = null ){
        var serial = DataBlockJSONSerializer.Serialize(p_target, p_options);
        serial.id = p_target.id.name;
        serial.instanceOf = p_target.fieldClass.name;

        //TODO : Make sure there is no reference that would be serialized as a whole
        serial.settings = U.Clone(p_target.settings);
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

        var fieldClass = POOL.GetClass(p_serial.instanceOf);
        p_target.fieldClass = fieldClass;
        p_target.instance = POOL.Rent(fieldClass);
        p_target.settings = p_serial.settings;

        // Nullify serial settings
        // in case the serial gets garbage collected
        p_serial.settings = null;
        
        return p_target;
    }

}

module.exports = FieldSettingsJSONSerializer;