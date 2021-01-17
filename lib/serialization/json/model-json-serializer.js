const { U } = require(`../../@`);
const { POOL } = require(`../../collections/@`);
const { FieldSettings } = require(`../../data-core/@`);

const DataBlockJSONSerializer = require(`./data-block-json-serializer`);
const { AssocManager } = require(`../../environment/@`);
const { SERIALIZER_JSON } = require(`./../keys`);

class ModelJSONSerializer extends DataBlockJSONSerializer{
    constructor(){super();}

    /**
     * Return the target as a JSON Object
     * @param {*} p_target 
     * @param {*} p_options 
     */
    static Serialize( p_target, p_options = null ){
        
        var serial = DataBlockJSONSerializer.Serialize(p_target, p_options);
        
        var definition = serial.definition;
        if(!definition){definition = {}; serial.definition = definition;}

        //Base Model ID
        if(p_target._base){ 
            definition.base = p_target._base.uri; 
        }

        //Fields
        var fields = {}; definition.fields = fields;

        var f = null;
        var fList = p_target._fieldRep.itemList;
        var serializer = null;
        for(var i = 0, n = fList.length; i < n; i++){
            f = fList[i];
            serializer = AssocManager.Get(f.constructor, SERIALIZER_JSON);
            fields[f.id.name] = serializer.Serialize(f, p_options);
        }

        return serial;
    }

    /**
     * Return an entry object from the provided serial
     * Or override available info in provided target.
     * @param {*} p_serial  
     * @param {*} p_data 
     * @param {*} p_options
     */
    static Deserialize( p_serial, p_data = null, p_options = null ){
        
        var p_data = DataBlockJSONSerializer.Deserialize(p_serial, p_data, p_options);

        var definition = p_serial.definition;
        if(!definition){ return p_data; }

        var base = definition.base;
        if(base){ 
            var baseModel = p_data.ecosystem.Resolve(base);
            if(!baseModel){
                // Create a watch token in the ecosystem so the base reference
                // will be resolved as soon as it is registered
            }else{
                p_data.base = baseModel;
            }
        }

        var fields = definition.fields;
        if(fields){ 
            var fieldSerial = null;
            var fieldData = null;
            var serializer = null;
            for(var member in fields){
                fieldSerial = fields[member];
                
                fieldData = p_data.Get(member);
                
                if(!fieldData){
                    fieldData = POOL.Rent(FieldSettings);
                    p_data.Register(fieldData, member);
                }

                serializer = AssocManager.Get(FieldSettings, SERIALIZER_JSON);
                serializer.Deserialize(fieldSerial, fieldData, p_options);
            }
        }

        return p_data;

    }

}

module.exports = ModelJSONSerializer;